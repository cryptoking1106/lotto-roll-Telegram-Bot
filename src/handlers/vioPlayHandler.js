const handleVioPlay = async (bot, msg) => {
    try {
        const chatId = msg.chat.id;

        // Create Vio Lotto box with icon and text
        const message = `🎰 *Vio Lotto*\n\n` +
            `Spin to Win, play Vio Lotto and get Vio Points`;

        // Create inline keyboard with Play Vio Lotto button
        const keyboard = {
            inline_keyboard: [
                [{ text: '🎮 Play Vio Lotto', url: 'https://t.me/VioLottoBot' }]
            ]
        };

        // Send message with Vio Lotto box and button
        const sentMessage = await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });

        // Delete the message after 1 minute if it's in a group chat
        if (msg.chat.type !== 'private') {
            setTimeout(async () => {
                try {
                    await bot.deleteMessage(chatId, sentMessage.message_id);
                } catch (error) {
                    console.error('Error deleting message:', error);
                }
            }, 60000); // 1 minute
        }

    } catch (error) {
        console.error('Error in vioPlay handler:', error);
        await bot.sendMessage(chatId, '❌ An error occurred while showing Vio Lotto. Please try again.');
    }
};

module.exports = { handleVioPlay }; 