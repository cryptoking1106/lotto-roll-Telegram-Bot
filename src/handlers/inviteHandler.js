const User = require('../models/User');
const { deleteAndSend } = require('../utils/messageUtils');
const logger = require('../utils/logger');

const handleInvite = async (bot, msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username;

        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            logger.info('Invite Attempt - User Not Found', { userId, username });
            return await deleteAndSend(bot, chatId, '❌ You haven\'t started playing yet! Use /start to begin.');
        }

        // Get referral stats
        const referralCount = await User.countDocuments({ referredBy: userId });
        const activeReferrals = await User.countDocuments({
            referredBy: userId,
            lastRollDate: { $exists: true, $ne: null }
        });

        logger.info('Referral Link Generated', {
            userId,
            username,
            referralCode: user.referralCode,
            totalReferrals: referralCount,
            activeReferrals
        });
        const botUsername = (await bot.getMe()).username;
        const inviteLink = `https://t.me/${botUsername}?start=${user.referralCode}`;

        const message = 
            '👥 Invite Friends to Vio Lotto!\n\n' +
            '🎁 Rewards for you:\n' +
            '• +1 bonus roll per friend who joins\n' +
            '• +10 points per friend\'s roll\n\n' +
            '📊 Your Referral Stats:\n' +
            `• Total Referrals: ${referralCount}\n` +
            `• Active Players: ${activeReferrals}\n\n` +
            '🔗 Your Referral Link:\n' +
            `\`${inviteLink}\`\n\n` +
            '💡 Share this link with your friends!';

        await deleteAndSend(bot, chatId, message);
    } catch (error) {
        logger.error('Error in handleInvite:', {
            error: error.message,
            stack: error.stack,
            userId: msg.from.id,
            username: msg.from.username
        });
        throw error;
    }
};

module.exports = { handleInvite }; 