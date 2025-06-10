const User = require('../models/User');
const { deleteAndSend } = require('../utils/messageUtils');
const logger = require('../utils/logger');

// Get admin IDs from environment variable
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',').map(id => id.trim()) : [];

const notifyAdmins = async (bot, user, isNewUser) => {
    try {
        const referredByUsername = user.referredBy ? await User.findOne({ telegramId: user.referredBy }).then(u => u?.username) : null;
        const userInfo = `👤 User Info:\n` +
            `ID: ${user.telegramId}\n` +
            `Username: @${user.username || 'none'}\n` +
            `Status: ${isNewUser ? '🆕 New User' : '↩️ Returning User'}\n` +
            `Points: ${user.vioPoints}\n` +
            `Rolls: ${user.dailyRolls} daily + ${user.bonusRolls} bonus\n` +
            `Streak: ${user.streakCount} days\n` +
            `Total Wins: ${user.totalWins}\n` +
            `Referred By: ${user.referredBy ? `@${referredByUsername}` : 'none'}\n` +
            `Referral Code: ${user.referralCode}`;

        // Notify each admin
        for (const adminId of ADMIN_IDS) {
            await bot.sendMessage(adminId, userInfo);
        }
    } catch (error) {
        console.error('Error notifying admins:', error);
    }
};

const notifyReferrer = async (bot, referrer, newUser) => {
    try {
        const message = 
            '🎉 New Referral Joined!\n\n' +
            `@${newUser.username || 'Anonymous'} has joined using your referral link!\n\n` +
            '🎁 Rewards:\n' +
            '• +1 bonus roll added to your account\n' +
            '• +10 points for each roll they make\n\n' +
            '💡 Keep inviting friends to earn more rewards!';

        await bot.sendMessage(referrer.telegramId, message);
        logger.info('Referrer Notified', {
            referrerId: referrer.telegramId,
            referrerUsername: referrer.username,
            newUserId: newUser.telegramId,
            newUserUsername: newUser.username
        });
    } catch (error) {
        logger.error('Failed to Notify Referrer', {
            error: error.message,
            referrerId: referrer.telegramId,
            referrerUsername: referrer.username,
            newUserId: newUser.telegramId,
            newUserUsername: newUser.username
        });
    }
};

const handleStart = async (bot, msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username;
        const args = msg.text.split(' ').slice(1); // Get referral code if any

        // Check if user exists
        let user = await User.findOne({ telegramId: userId });
        const isNewUser = !user;

        if (isNewUser) {
            // Create new user
            user = new User({
                telegramId: userId,
                username: username
            });

            // Handle referral if provided
            if (args.length > 0) {
                const referrerCode = args[0];
                const referrer = await User.findOne({ referralCode: referrerCode });
                if (referrer && referrer.telegramId !== userId) {
                    user.referredBy = referrer.telegramId;
                    // Give bonus roll to referrer
                    referrer.bonusRolls += 1;
                    await referrer.save();
                    
                    // Notify referrer about new user
                    await notifyReferrer(bot, referrer, user);
                }
            }

            await user.generateReferralCode();
            await user.save();

            // Create custom keyboard for new users
            const keyboard = {
                keyboard: [
                    ['🎰 Roll', '💎 Points'],
                    ['🎟️ Rolls Left', '🔥 Streak'],
                    ['🎁 Buy Rolls', '👥 Invite'],
                    ['🏆 Leaderboard', '❓ Help']
                ],
                resize_keyboard: true,
                one_time_keyboard: false
            };

            // Send welcome message for new users
            const welcomeMessage = 
                '🎉 *Welcome to Vio Lotto!*\n\n' +
                '🎮 *How to Play:*\n' +
                '• Click 🎰 Roll to spin the slot machine\n' +
                '• Match emojis to win Vio Points\n' +
                '• Get 3 free rolls daily\n\n' +
                '💡 *Quick Guide:*\n' +
                '• 🎰 Roll - Spin the slot machine\n' +
                '• 💎 Points - Check your balance\n' +
                '• 🎁 Buy Rolls - Get more rolls\n' +
                '• 👥 Invite - Get your referral link\n\n' +
                'Ready to play? Click 🎰 Roll to start!';

            await deleteAndSend(bot, chatId, welcomeMessage, { reply_markup: keyboard });
        } else {
            // Update username if changed
            if (user.username !== username) {
                user.username = username;
                await user.save();
            }

            // Create custom keyboard for returning users
            const keyboard = {
                keyboard: [
                    ['🎰 Roll', '💎 Points'],
                    ['🎟️ Rolls Left', '🔥 Streak'],
                    ['🎁 Buy Rolls', '👥 Invite'],
                    ['🏆 Leaderboard', '❓ Help']
                ],
                resize_keyboard: true,
                one_time_keyboard: false
            };

            // Send welcome back message
            const welcomeBackMessage = 
                `👋 *Welcome back to Vio Lotto!*\n\n` +
                `🎟️ *Your Rolls:*\n` +
                `• Daily Rolls: ${user.dailyRolls}\n` +
                `• Bonus Rolls: ${user.bonusRolls}\n\n` +
                `💎 *Vio Points:* ${user.vioPoints}\n\n` +
                `Click 🎰 Roll to play or ❓ Help to see all commands!`;

            await deleteAndSend(bot, chatId, welcomeBackMessage, { reply_markup: keyboard });
        }

        // Notify admins about the user
        await notifyAdmins(bot, user, isNewUser);

    } catch (error) {
        console.error('Error in start handler:', error);
        await deleteAndSend(bot, msg.chat.id, '❌ An error occurred while starting the bot. Please try again.');
    }
};

module.exports = { handleStart }; 