require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const { handleStart } = require('./handlers/startHandler');
const { handleRoll } = require('./handlers/rollHandler');
const { handleBuyRolls } = require('./handlers/buyRollsHandler');
const { handlePoints } = require('./handlers/pointsHandler');
const { handleStreak } = require('./handlers/streakHandler');
const { handleInvite } = require('./handlers/inviteHandler');
const { handleLeaderboard } = require('./handlers/leaderboardHandler');
const { handleHelp } = require('./handlers/helpHandler');
const { handleRollsLeft } = require('./handlers/rollsLeftHandler');
const { handleAdjustPoints, handleGiveRolls } = require('./handlers/adminHandler');
const { handleVioPlay } = require('./handlers/vioPlayHandler');

// Initialize bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Set bot commands
const commands = [
    { command: 'start', description: 'Start the bot and get welcome message' },
    { command: 'help', description: 'Show help and game instructions' },
    { command: 'roll', description: 'Spin the slot machine' },
    { command: 'rollsleft', description: 'Show your remaining rolls' },
    { command: 'points', description: 'Check your Vio Points balance' },
    { command: 'streak', description: 'View your daily streak' },
    { command: 'buyrolls', description: 'Purchase more rolls with points' },
    { command: 'invite', description: 'Get your referral link' },
    { command: 'leaderboard', description: 'View top players' },
    { command: 'vioplay', description: 'Choose a Vio game to play' }
];

// Set commands for the bot
bot.setMyCommands(commands)
    .then(() => logger.info('Bot commands set successfully'))
    .catch(err => logger.error('Error setting bot commands:', { error: err.message, stack: err.stack }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('MongoDB connection error:', err));

// Helper function to check if command should be processed
const shouldProcessCommand = (msg, command) => {
    // /vioplay works in both groups and private chats
    if (command === 'vioplay') return true;
    // All other commands only work in private chats
    return msg.chat.type === 'private';
};

// Helper function to log user activity
const logUserActivity = (action, msg, additionalInfo = {}) => {
    const userInfo = {
        userId: msg.from.id,
        username: msg.from.username || 'Anonymous',
        chatId: msg.chat.id,
        chatType: msg.chat.type,
        ...additionalInfo
    };
    logger.info(`User Activity: ${action}`, userInfo);
};

// Command handlers
bot.onText(/\/start/, async (msg) => {
    if (!shouldProcessCommand(msg, 'start')) return;
    try {
        logUserActivity('Start Command', msg);
        await handleStart(bot, msg);
    } catch (error) {
        logger.error('Error in /start command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

bot.onText(/^\/roll$/, async (msg) => {
    if (!shouldProcessCommand(msg, 'roll')) return;
    try {
        logUserActivity('Roll Command', msg);
        await handleRoll(bot, msg);
    } catch (error) {
        logger.error('Error in /roll command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

bot.onText(/^\/buyrolls/, async (msg) => {
    if (!shouldProcessCommand(msg, 'buyrolls')) return;
    try {
        const args = msg.text.split(' ').slice(1);
        logUserActivity('Buy Rolls Command', msg, { purchaseDetails: args });
        await handleBuyRolls(bot, msg);
    } catch (error) {
        logger.error('Error in /buyrolls command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

bot.onText(/^\/points$/, async (msg) => {
    if (!shouldProcessCommand(msg, 'points')) return;
    try {
        logUserActivity('Points Command', msg);
        await handlePoints(bot, msg);
    } catch (error) {
        logger.error('Error in /points command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

bot.onText(/^\/streak$/, async (msg) => {
    if (!shouldProcessCommand(msg, 'streak')) return;
    try {
        logUserActivity('Streak Command', msg);
        await handleStreak(bot, msg);
    } catch (error) {
        logger.error('Error in /streak command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

bot.onText(/^\/invite$/, async (msg) => {
    if (!shouldProcessCommand(msg, 'invite')) return;
    try {
        logUserActivity('Invite Command', msg);
        await handleInvite(bot, msg);
    } catch (error) {
        logger.error('Error in /invite command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

bot.onText(/^\/leaderboard$/, async (msg) => {
    if (!shouldProcessCommand(msg, 'leaderboard')) return;
    try {
        logUserActivity('Leaderboard Command', msg);
        await handleLeaderboard(bot, msg);
    } catch (error) {
        logger.error('Error in /leaderboard command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

bot.onText(/^\/help$/, async (msg) => {
    if (!shouldProcessCommand(msg, 'help')) return;
    try {
        logUserActivity('Help Command', msg);
        await handleHelp(bot, msg);
    } catch (error) {
        logger.error('Error in /help command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

bot.onText(/^\/rollsleft$/, async (msg) => {
    if (!shouldProcessCommand(msg, 'rollsleft')) return;
    try {
        logUserActivity('Rolls Left Command', msg);
        await handleRollsLeft(bot, msg);
    } catch (error) {
        logger.error('Error in /rollsleft command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

// Custom keyboard button handlers
bot.on('message', async (msg) => {
    if (!msg.text || msg.chat.type !== 'private') return;

    try {
        switch (msg.text) {
            case '🎰 Roll':
                if (!shouldProcessCommand(msg, 'roll')) return;
                logUserActivity('Roll Button', msg);
                await handleRoll(bot, msg);
                break;

            case '💎 Points':
                if (!shouldProcessCommand(msg, 'points')) return;
                logUserActivity('Points Button', msg);
                await handlePoints(bot, msg);
                break;

            case '🎟️ Rolls Left':
                if (!shouldProcessCommand(msg, 'rollsleft')) return;
                logUserActivity('Rolls Left Button', msg);
                await handleRollsLeft(bot, msg);
                break;

            case '🔥 Streak':
                if (!shouldProcessCommand(msg, 'streak')) return;
                logUserActivity('Streak Button', msg);
                await handleStreak(bot, msg);
                break;

            case '🎁 Buy Rolls':
                if (!shouldProcessCommand(msg, 'buyrolls')) return;
                logUserActivity('Buy Rolls Button', msg);
                await handleBuyRolls(bot, msg);
                break;

            case '👥 Invite':
                if (!shouldProcessCommand(msg, 'invite')) return;
                logUserActivity('Invite Button', msg);
                await handleInvite(bot, msg);
                break;

            case '🏆 Leaderboard':
                if (!shouldProcessCommand(msg, 'leaderboard')) return;
                logUserActivity('Leaderboard Button', msg);
                await handleLeaderboard(bot, msg);
                break;

            case '❓ Help':
                if (!shouldProcessCommand(msg, 'help')) return;
                logUserActivity('Help Button', msg);
                await handleHelp(bot, msg);
                break;
        }
    } catch (error) {
        logger.error('Error in button handler:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

// Add admin command handlers with logging
bot.onText(/^\/adjustpoints/, async (msg) => {
    if (!shouldProcessCommand(msg, 'adjustpoints')) return;
    try {
        const args = msg.text.split(' ').slice(1);
        logUserActivity('Admin Adjust Points Command', msg, { adminAction: args });
        await handleAdjustPoints(bot, msg);
    } catch (error) {
        logger.error('Error in /adjustpoints command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

bot.onText(/^\/giverolls/, async (msg) => {
    if (!shouldProcessCommand(msg, 'giverolls')) return;
    try {
        const args = msg.text.split(' ').slice(1);
        logUserActivity('Admin Give Rolls Command', msg, { adminAction: args });
        await handleGiveRolls(bot, msg);
    } catch (error) {
        logger.error('Error in /giverolls command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

// vioPlay command handler with logging
bot.onText(/^\/vioplay$/, async (msg) => {
    try {
        logUserActivity('VioPlay Command', msg);
        await handleVioPlay(bot, msg);
    } catch (error) {
        logger.error('Error in /vioplay command:', { error: error.message, stack: error.stack });
        bot.sendMessage(msg.chat.id, 'Sorry, something went wrong. Please try again later.');
    }
});

// Error handling
bot.on('polling_error', (error) => {
    logger.error('Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down bot...');
    await mongoose.connection.close();
    process.exit(0);
});

logger.info('Vio Lotto bot is running...'); 