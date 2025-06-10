const User = require('../models/User');
const { deleteAndSend } = require('../utils/messageUtils');

const handlePoints = async (bot, msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            return await deleteAndSend(bot, chatId, '❌ You haven\'t started playing yet! Use /start to begin.');
        }

        const message = `💎 Your Vio Points Balance\n\nCurrent Balance: ${user.vioPoints} points\n\n💡 Ways to earn points:\n• Match 3 emojis: +1000 points\n• Match 2 emojis: +50 points\n• Get ⚡ emoji: +100 points\n• Refer friends: +25 points\n• Daily streak: +50 points\n\nUse /buyrolls to spend your points!`;

        await deleteAndSend(bot, chatId, message);
    } catch (error) {
        console.error('Error in handlePoints:', error);
        await deleteAndSend(bot, msg.chat.id, '❌ An error occurred while checking your points. Please try again.');
    }
};

module.exports = { handlePoints }; 