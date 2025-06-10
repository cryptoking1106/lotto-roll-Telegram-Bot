const User = require('../models/User');
const { deleteAndSend } = require('../utils/messageUtils');
const logger = require('../utils/logger');

const handleLeaderboard = async (bot, msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username;

        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            logger.info('Leaderboard View - User Not Found', { userId, username });
            return await deleteAndSend(bot, chatId, '❌ You haven\'t started playing yet! Use /start to begin.');
        }

        // Get top 10 users by points
        const topUsers = await User.find()
            .sort({ vioPoints: -1 })
            .limit(10);

        // Get user's rank
        const userRank = await User.countDocuments({ vioPoints: { $gt: user.vioPoints } }) + 1;

        logger.info('Leaderboard Viewed', {
            userId,
            username,
            userRank,
            userPoints: user.vioPoints,
            topPlayerPoints: topUsers[0]?.vioPoints || 0,
            totalPlayers: await User.countDocuments()
        });

        let message = '🏆 Top Players\n\n';
        
        // Add each user to the leaderboard
        for (let i = 0; i < topUsers.length; i++) {
            const player = topUsers[i];
            const rank = i + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            const username = player.username ? `@${player.username}` : 'Anonymous';
            message += `${medal} ${username}: ${player.vioPoints} points\n`;
        }

        // Add user's rank if not in top 10
        if (userRank > 10) {
            message += `\n...\n\nYour Rank: #${userRank} (${user.vioPoints} points)`;
        }

        message += '\n\n💡 Keep playing to climb the ranks!';

        await deleteAndSend(bot, chatId, message);
    } catch (error) {
        logger.error('Error in handleLeaderboard:', {
            error: error.message,
            stack: error.stack,
            userId: msg.from.id,
            username: msg.from.username
        });
        throw error;
    }
};

module.exports = { handleLeaderboard }; 