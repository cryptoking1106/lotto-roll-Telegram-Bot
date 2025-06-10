const User = require('../models/User');
const { deleteAndSend } = require('../utils/messageUtils');

const handleRollsLeft = async (bot, msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            return await deleteAndSend(bot, chatId, '❌ You haven\'t started playing yet! Use /start to begin.');
        }

        const totalRolls = user.dailyRolls + user.bonusRolls;
        let message = `🎟️ Your Rolls Status\n\n`;
        message += `Daily Rolls: ${user.dailyRolls}\n`;
        message += `Bonus Rolls: ${user.bonusRolls}\n`;
        message += `Total Rolls: ${totalRolls}\n\n`;

        if (totalRolls === 0) {
            message += '💡 Use /buyrolls to get more rolls or wait until tomorrow for your free rolls!';
        } else {
            message += '💡 Use /roll to start playing!';
        }

        await deleteAndSend(bot, chatId, message);
    } catch (error) {
        console.error('Error in handleRollsLeft:', error);
        await deleteAndSend(bot, msg.chat.id, '❌ An error occurred while checking your rolls. Please try again.');
    }
};

module.exports = { handleRollsLeft }; 