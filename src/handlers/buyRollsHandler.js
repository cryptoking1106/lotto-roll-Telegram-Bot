const User = require('../models/User');
const { getRollPurchaseOptions, canAffordPurchase } = require('../utils/gameLogic');
const { deleteAndSend } = require('../utils/messageUtils');
const logger = require('../utils/logger');

// Track purchase cooldowns
const purchaseCooldowns = new Map();
const PURCHASE_COOLDOWN = 60000; // 1 minute
const MAX_DAILY_PURCHASES = 10;

async function handleBuyRolls(bot, msg) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username;
        const args = msg.text.split(' ').slice(1);

        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            logger.info('Buy Rolls Attempt - User Not Found', { userId, username });
            return await deleteAndSend(bot, chatId, '❌ You haven\'t started playing yet! Use /start to begin.');
        }

        // Check purchase cooldown
        const lastPurchase = purchaseCooldowns.get(userId);
        const now = Date.now();
        if (lastPurchase && now - lastPurchase < PURCHASE_COOLDOWN) {
            const timeLeft = Math.ceil((PURCHASE_COOLDOWN - (now - lastPurchase)) / 1000);
            logger.info('Buy Rolls Cooldown', {
                userId,
                username,
                timeLeft,
                lastPurchase: new Date(lastPurchase).toISOString()
            });
            return await deleteAndSend(bot, chatId, `⏳ Please wait ${timeLeft} seconds before making another purchase.`);
        }

        // If no arguments provided, show available options
        if (args.length === 0) {
            logger.info('Buy Rolls Menu Viewed', { userId, username });
            const message = `🛍️ Buy More Rolls\n\nPoints Shop:\n• 1 Roll = 100 points\n• 3 Rolls = 250 points\n• 5 Rolls = 400 points\n\nZVIO Shop (Coming Soon):\n• 1 Roll = 1 ZVIO\n• 5 Rolls = 4 ZVIO\n• Unlimited Rolls = 10 ZVIO\n\n💡 To purchase, use:\n\`/buyrolls points 1\` (or 3, 5)\n\`/buyrolls zvio 1\` (or 5, unlimited)`;
            return await deleteAndSend(bot, chatId, message);
        }

        const [currency, amount] = args;
        const rollsToBuy = parseInt(amount);

        if (!['points', 'zvio'].includes(currency) || isNaN(rollsToBuy) || rollsToBuy <= 0) {
            logger.info('Invalid Buy Rolls Format', {
                userId,
                username,
                currency,
                amount: rollsToBuy
            });
            return await deleteAndSend(bot, chatId, '❌ Invalid command format! Use /buyrolls points 1 (or 3, 5)');
        }

        if (currency === 'zvio') {
            logger.info('ZVIO Shop Access Attempt', { userId, username });
            return await deleteAndSend(bot, chatId, '🎉 ZVIO shop coming soon! Stay tuned for updates.');
        }

        // Calculate cost based on amount
        let cost;
        switch (rollsToBuy) {
            case 1: cost = 100; break;
            case 3: cost = 250; break;
            case 5: cost = 400; break;
            default:
                logger.info('Invalid Roll Amount Requested', {
                    userId,
                    username,
                    requestedAmount: rollsToBuy
                });
                return await deleteAndSend(bot, chatId, '❌ Invalid amount! Choose 1, 3, or 5 rolls.');
        }

        if (user.vioPoints < cost) {
            logger.info('Insufficient Points for Purchase', {
                userId,
                username,
                requiredPoints: cost,
                availablePoints: user.vioPoints,
                requestedRolls: rollsToBuy
            });
            return await deleteAndSend(bot, chatId, `❌ Not enough Vio Points! You need ${cost} points for ${rollsToBuy} rolls.`);
        }

        // Process purchase
        const oldPoints = user.vioPoints;
        const oldBonusRolls = user.bonusRolls;
        
        user.vioPoints -= cost;
        user.bonusRolls += rollsToBuy;
        await user.save();

        // Update cooldown
        purchaseCooldowns.set(userId, now);

        logger.info('Rolls Purchase Successful', {
            userId,
            username,
            rollsPurchased: rollsToBuy,
            cost,
            oldPoints,
            newPoints: user.vioPoints,
            oldBonusRolls,
            newBonusRolls: user.bonusRolls
        });

        const message = `✅ Purchase Successful!\n\n🎟️ Added ${rollsToBuy} bonus rolls\n💎 Remaining balance: ${user.vioPoints} points\n\nUse /roll to start playing!`;

        await deleteAndSend(bot, chatId, message);
    } catch (error) {
        logger.error('Error in handleBuyRolls:', {
            error: error.message,
            stack: error.stack,
            userId: msg.from.id,
            username: msg.from.username
        });
        throw error;
    }
}

module.exports = { handleBuyRolls }; 