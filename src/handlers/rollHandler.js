const User = require('../models/User');
const { rollSlot, calculatePoints } = require('../utils/gameLogic');
const moment = require('moment');
const { deleteAndSend } = require('../utils/messageUtils');
const logger = require('../utils/logger');

// Cooldown tracking
const cooldowns = new Map();
const COOLDOWN_TIME = 5000; // 5 seconds in milliseconds

// Group chat ID for public announcements
const PUBLIC_GROUP_ID = process.env.PUBLIC_GROUP_ID;

const handleRoll = async (bot, msg) => {
    try {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const userId = msg.from.id;
        const username = msg.from.username;
        const firstName = msg.from.first_name;

        // Check cooldown
        const lastRoll = cooldowns.get(userId);
        const now = Date.now();
        if (lastRoll && now - lastRoll < COOLDOWN_TIME) {
            const timeLeft = Math.ceil((COOLDOWN_TIME - (now - lastRoll)) / 1000);
            logger.info('Roll Cooldown', {
                userId,
                username,
                timeLeft,
                lastRoll: new Date(lastRoll).toISOString()
            });
            return await deleteAndSend(bot, chatId, `⏳ Please wait ${timeLeft} seconds before rolling again.`);
        }

        // Get or create user
        let user = await User.findOne({ telegramId: userId });
        if (!user) {
            logger.info('New User Created', { userId, username });
            user = new User({
                telegramId: userId,
                username: username
            });
            await user.generateReferralCode();
            await user.save();
        }

        // Check if user has any rolls left
        if (user.dailyRolls <= 0 && user.bonusRolls <= 0) {
            logger.info('No Rolls Left', {
                userId,
                username,
                dailyRolls: user.dailyRolls,
                bonusRolls: user.bonusRolls
            });
            return await deleteAndSend(bot, chatId, 
                '🎟️ You\'ve used all your rolls for today!\n' +
                'Use /buyrolls to get more rolls or wait until tomorrow for your free rolls.\n' +
                '💡 Tip: Invite friends with /invite to earn bonus rolls!'
            );
        }

        // Update cooldown
        cooldowns.set(userId, now);

        // Roll the slot machine
        const roll = rollSlot();
        const result = calculatePoints(roll);
        
        logger.info('Roll Result', {
            userId,
            username,
            roll,
            points: result.points,
            combination: result.combination,
            dailyRollsLeft: user.dailyRolls,
            bonusRollsLeft: user.bonusRolls
        });

        // Update user's rolls and points
        if (user.bonusRolls > 0) {
            user.bonusRolls -= 1;
            logger.info('Used Bonus Roll', {
                userId,
                username,
                remainingBonusRolls: user.bonusRolls
            });
        } else {
            user.dailyRolls -= 1;
            logger.info('Used Daily Roll', {
                userId,
                username,
                remainingDailyRolls: user.dailyRolls
            });
        }

        // Update points and streak
        const oldPoints = user.vioPoints;
        user.vioPoints += result.points;
        
        // Update streak
        const lastRollDate = user.lastRollDate ? moment(user.lastRollDate) : null;
        const today = moment().startOf('day');
        
        if (!lastRollDate || lastRollDate.isBefore(today, 'day')) {
            if (lastRollDate && lastRollDate.isSame(today.clone().subtract(1, 'day'), 'day')) {
                user.streak += 1;
                logger.info('Streak Updated', {
                    userId,
                    username,
                    newStreak: user.streak,
                    oldStreak: user.streak - 1
                });
                
                // Give bonus rolls at 5-day streak
                if (user.streak % 5 === 0) {
                    user.bonusRolls += 2;
                    logger.info('Streak Bonus Rolls Awarded', {
                        userId,
                        username,
                        streak: user.streak,
                        bonusRollsAdded: 2,
                        totalBonusRolls: user.bonusRolls
                    });
                }
            } else {
                user.streak = 1;
                logger.info('Streak Reset', {
                    userId,
                    username,
                    reason: !lastRollDate ? 'First Roll' : 'Missed Day'
                });
            }
        }
        
        user.lastRollDate = new Date();
        await user.save();

        logger.info('Points Updated', {
            userId,
            username,
            oldPoints,
            newPoints: user.vioPoints,
            pointsEarned: result.points
        });

        // Give +10 points to referrer if user was referred
        if (user.referredBy) {
            const referrer = await User.findOne({ telegramId: user.referredBy });
            if (referrer) {
                referrer.vioPoints += 10;
                await referrer.save();
            }
        }

        // Prepare private response message
        let privateResponse = `🎰 You rolled: ${roll.join(' ')}\n`;
        privateResponse += `${result.message}\n`;
        privateResponse += `\n🧾 Rolls Left: ${user.dailyRolls} daily + ${user.bonusRolls} bonus`;

        // Add streak info if applicable
        if (user.streakCount > 0) {
            privateResponse += `\n🔥 Streak: ${user.streakCount} days`;
            if (user.streakCount === 4) {
                privateResponse += '\n💫 One more day for bonus rolls!';
            }
        }

        // Add purchase suggestion if low on rolls
        if (user.dailyRolls + user.bonusRolls <= 1) {
            privateResponse += '\n\n💡 Use /buyrolls to get more rolls!';
        }

        // Send private response
        await deleteAndSend(bot, chatId, privateResponse);

        // Send public announcement to group only for winning rolls
        if (result.points > 0) {
            try {
                const publicMessage = `*${firstName}* rolled: ${roll.join(' ')} and earned *+${result.points} points*\n\n🎰 Play Vio Lotto yourself, click /vioplay`;
                const sentMessage = await bot.sendMessage(PUBLIC_GROUP_ID, publicMessage, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
                
                logger.info('Public Roll Announcement Sent (Win)', {
                    userId,
                    username,
                    groupId: PUBLIC_GROUP_ID,
                    points: result.points,
                    roll,
                    messageId: sentMessage.message_id,
                    combination: result.combination
                });

                // Delete the message after 1 minute
                setTimeout(async () => {
                    try {
                        await bot.deleteMessage(PUBLIC_GROUP_ID, sentMessage.message_id);
                        logger.info('Public Roll Announcement Deleted', {
                            userId,
                            username,
                            groupId: PUBLIC_GROUP_ID,
                            messageId: sentMessage.message_id,
                            deletionTime: new Date().toISOString()
                        });
                    } catch (deleteError) {
                        logger.error('Failed to Delete Public Announcement', {
                            error: deleteError.message,
                            userId,
                            username,
                            groupId: PUBLIC_GROUP_ID,
                            messageId: sentMessage.message_id
                        });
                    }
                }, 60000); // 1 minute in milliseconds

            } catch (error) {
                logger.error('Failed to Send Public Announcement', {
                    error: error.message,
                    userId,
                    username,
                    groupId: PUBLIC_GROUP_ID
                });
                // Don't throw error here to avoid affecting the user's roll
            }
        } else {
            logger.info('Skipping Public Announcement (No Win)', {
                userId,
                username,
                points: result.points,
                roll,
                combination: result.combination
            });
        }

    } catch (error) {
        logger.error('Error in handleRoll:', {
            error: error.message,
            stack: error.stack,
            userId: msg.from.id,
            username: msg.from.username
        });
        throw error;
    }
};

module.exports = { handleRoll }; 