const User = require('../models/User');
const { deleteAndSend } = require('../utils/messageUtils');

const handleHelp = async (bot, msg) => {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            return await deleteAndSend(bot, chatId, '❌ You haven\'t started playing yet! Use /start to begin.');
        }

        const message = `🎮 Vio Lotto Help Center\n\n📱 Basic Commands:\n• /start - Start the bot and get welcome message\n• /help - Show this help message\n• /roll - Spin the slot machine\n• /points - Check your Vio Points balance\n• /streak - View your daily streak\n\n🎰 Game Commands:\n• /buyrolls - Purchase more rolls with points\n• /invite - Get your referral link\n• /leaderboard - View top players\n\n🎲 How to Play:\n1. Use /roll to spin the slot machine\n2. Match emojis to win Vio Points:\n   • 3 Match = +1000 points\n   • 2 Match = +50 points\n   • ⚡ Emoji = +100 points\n\n🎁 Daily Rewards:\n• 3 free rolls every day\n• Daily streak bonus\n• 5-day streak = +2 bonus rolls\n\n👥 Referral System:\n• Get +1 bonus roll when friends join\n• Earn +10 points per friend's roll\n\n💎 Points Shop:\n• 1 Roll = 100 points\n• 3 Rolls = 250 points\n• 5 Rolls = 400 points\n\n💡 Tips:\n• Roll daily to maintain your streak\n• Invite friends to earn more points\n• Use /buyrolls to get more chances\n• Check /leaderboard to see top players`;

        await deleteAndSend(bot, chatId, message);
    } catch (error) {
        console.error('Error in handleHelp:', error);
        await deleteAndSend(bot, msg.chat.id, '❌ An error occurred while fetching help information. Please try again.');
    }
};

module.exports = { handleHelp }; 