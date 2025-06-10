const User = require('../models/User');
const moment = require('moment');
const { deleteAndSend } = require('../utils/messageUtils');

const handleStreak = async (bot, msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            return await deleteAndSend(bot, chatId, '❌ You haven\'t started playing yet! Use /start to begin.');
        }

        let streakMessage = '';
        if (user.streakCount === 0) {
            streakMessage = 'Start your streak today! Roll once every day to maintain it.';
        } else if (user.streakCount === 4) {
            streakMessage = '🔥 One more day until you get bonus rolls!';
        } else {
            streakMessage = `Keep it up! Roll again tomorrow to maintain your streak.`;
        }

        const nextRollTime = moment(user.lastRollTime).add(24, 'hours');
        const timeUntilNextRoll = moment.duration(nextRollTime.diff(moment()));
        const hours = Math.floor(timeUntilNextRoll.asHours());
        const minutes = Math.floor(timeUntilNextRoll.minutes());

        const message = `🔥 Your Daily Streak\n\nCurrent Streak: ${user.streakCount} days\n\n${streakMessage}\n⏰ Next roll available in: ${hours}h ${minutes}m\n\n💡 Tip: Roll every day to maintain your streak and earn bonus rolls!`;

        await deleteAndSend(bot, chatId, message);
    } catch (error) {
        console.error('Error in handleStreak:', error);
        await deleteAndSend(bot, msg.chat.id, '❌ An error occurred while checking your streak. Please try again.');
    }
};

module.exports = { handleStreak }; 