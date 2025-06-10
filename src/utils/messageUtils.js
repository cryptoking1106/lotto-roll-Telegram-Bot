// Store the last bot message ID for each chat
const lastBotMessages = new Map();

const deleteAndSend = async (bot, chatId, newMessage, options = {}) => {
    try {
        // Delete the previous bot message if it exists
        const lastMessageId = lastBotMessages.get(chatId);
        if (lastMessageId) {
            try {
                await bot.deleteMessage(chatId, lastMessageId);
            } catch (deleteError) {
                // Ignore errors if message is already deleted or too old
                console.log('Could not delete previous message:', deleteError.message);
            }
        }
        
        // Send the new message
        const sentMessage = await bot.sendMessage(chatId, newMessage, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            ...options
        });
        
        // Store the new message ID
        lastBotMessages.set(chatId, sentMessage.message_id);
        
        return sentMessage;
    } catch (error) {
        console.error('Error in deleteAndSend:', error);
        // If sending fails, clear the stored message ID
        lastBotMessages.delete(chatId);
        throw error;
    }
};

// Function to clear stored message ID for a chat
const clearLastMessage = (chatId) => {
    lastBotMessages.delete(chatId);
};

module.exports = {
    deleteAndSend,
    clearLastMessage
}; 