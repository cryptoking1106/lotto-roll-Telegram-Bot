const User = require('../models/User');
const { deleteAndSend } = require('../utils/messageUtils');
const logger = require('../utils/logger');

// Admin list - store in environment variables in production
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];

function isAdmin(userId) {
    return ADMIN_IDS.includes(userId.toString());
}

async function handleAdjustPoints(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;

    // Check if user is admin
    if (!isAdmin(userId)) {
        logger.warn('Unauthorized Admin Access Attempt', {
            userId,
            username,
            action: 'adjustpoints'
        });
        return bot.sendMessage(chatId, '❌ Unauthorized access.');
    }

    const args = msg.text.split(' ').slice(1);
    if (args.length !== 2) {
        logger.info('Invalid Admin Command Format', {
            userId,
            username,
            action: 'adjustpoints',
            args
        });
        return bot.sendMessage(chatId, 
            '❌ Invalid command format!\n\n' +
            'Usage: /adjustpoints <username> <points>\n' +
            'Example: /adjustpoints @user 1000\n' +
            'Use negative numbers to subtract points.'
        );
    }

    const [targetUsername, points] = args;
    const pointsToAdd = parseInt(points);

    if (isNaN(pointsToAdd)) {
        logger.info('Invalid Points Amount', {
            userId,
            username,
            action: 'adjustpoints',
            targetUsername,
            points
        });
        return bot.sendMessage(chatId, '❌ Invalid points amount!');
    }

    try {
        // Remove @ if present
        const cleanUsername = targetUsername.replace('@', '');
        const user = await User.findOne({ username: cleanUsername });

        if (!user) {
            logger.info('Target User Not Found', {
                adminId: userId,
                adminUsername: username,
                action: 'adjustpoints',
                targetUsername: cleanUsername
            });
            return bot.sendMessage(chatId, '❌ User not found!');
        }

        // Log before update
        logger.info('Points Adjustment Started', {
            adminId: userId,
            adminUsername: username,
            targetUserId: user.telegramId,
            targetUsername: user.username,
            pointsToAdd,
            oldPoints: user.vioPoints
        });

        // Update points
        user.vioPoints += pointsToAdd;
        await user.save();

        // Log after update
        logger.info('Points Adjustment Completed', {
            adminId: userId,
            adminUsername: username,
            targetUserId: user.telegramId,
            targetUsername: user.username,
            pointsAdded: pointsToAdd,
            newPoints: user.vioPoints
        });

        // Send confirmation
        const message = 
            '✅ Points adjusted successfully!\n\n' +
            `User: @${user.username}\n` +
            `Points ${pointsToAdd >= 0 ? 'added' : 'subtracted'}: ${Math.abs(pointsToAdd)}\n` +
            `New balance: ${user.vioPoints} points`;

        await bot.sendMessage(chatId, message);

        // Notify the user
        try {
            await bot.sendMessage(user.telegramId,
                `💎 Your points have been adjusted by an admin.\n` +
                `New balance: ${user.vioPoints} points`
            );
            logger.info('User Notified of Points Adjustment', {
                targetUserId: user.telegramId,
                targetUsername: user.username
            });
        } catch (error) {
            logger.error('Failed to Notify User', {
                error: error.message,
                targetUserId: user.telegramId,
                targetUsername: user.username
            });
        }

    } catch (error) {
        logger.error('Error in adjust points handler:', {
            error: error.message,
            stack: error.stack,
            adminId: userId,
            adminUsername: username,
            targetUsername
        });
        throw error;
    }
}

async function handleGiveRolls(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;

    // Check if user is admin
    if (!isAdmin(userId)) {
        logger.warn('Unauthorized Admin Access Attempt', {
            userId,
            username,
            action: 'giverolls'
        });
        return bot.sendMessage(chatId, '❌ Unauthorized access.');
    }

    const args = msg.text.split(' ').slice(1);
    if (args.length !== 2) {
        logger.info('Invalid Admin Command Format', {
            userId,
            username,
            action: 'giverolls',
            args
        });
        return bot.sendMessage(chatId, 
            '❌ Invalid command format!\n\n' +
            'Usage: /giverolls <username> <amount>\n' +
            'Example: /giverolls @user 5'
        );
    }

    const [targetUsername, amount] = args;
    const rollsToAdd = parseInt(amount);

    if (isNaN(rollsToAdd) || rollsToAdd <= 0) {
        logger.info('Invalid Rolls Amount', {
            userId,
            username,
            action: 'giverolls',
            targetUsername,
            amount
        });
        return bot.sendMessage(chatId, '❌ Invalid rolls amount! Must be a positive number.');
    }

    try {
        // Remove @ if present
        const cleanUsername = targetUsername.replace('@', '');
        const user = await User.findOne({ username: cleanUsername });

        if (!user) {
            logger.info('Target User Not Found', {
                adminId: userId,
                adminUsername: username,
                action: 'giverolls',
                targetUsername: cleanUsername
            });
            return bot.sendMessage(chatId, '❌ User not found!');
        }

        // Log before update
        logger.info('Rolls Addition Started', {
            adminId: userId,
            adminUsername: username,
            targetUserId: user.telegramId,
            targetUsername: user.username,
            rollsToAdd,
            oldBonusRolls: user.bonusRolls
        });

        // Add bonus rolls
        user.bonusRolls += rollsToAdd;
        await user.save();

        // Log after update
        logger.info('Rolls Addition Completed', {
            adminId: userId,
            adminUsername: username,
            targetUserId: user.telegramId,
            targetUsername: user.username,
            rollsAdded: rollsToAdd,
            newBonusRolls: user.bonusRolls
        });

        // Send confirmation
        const message = 
            '✅ Rolls added successfully!\n\n' +
            `User: @${user.username}\n` +
            `Bonus rolls added: ${rollsToAdd}\n` +
            `Total bonus rolls: ${user.bonusRolls}`;

        await bot.sendMessage(chatId, message);

        // Notify the user
        try {
            await bot.sendMessage(user.telegramId,
                `🎟️ You received ${rollsToAdd} bonus rolls from an admin!\n` +
                `Total bonus rolls: ${user.bonusRolls}`
            );
            logger.info('User Notified of Rolls Addition', {
                targetUserId: user.telegramId,
                targetUsername: user.username
            });
        } catch (error) {
            logger.error('Failed to Notify User', {
                error: error.message,
                targetUserId: user.telegramId,
                targetUsername: user.username
            });
        }

    } catch (error) {
        logger.error('Error in give rolls handler:', {
            error: error.message,
            stack: error.stack,
            adminId: userId,
            adminUsername: username,
            targetUsername
        });
        throw error;
    }
}

module.exports = { handleAdjustPoints, handleGiveRolls }; 