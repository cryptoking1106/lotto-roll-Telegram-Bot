# 🎰 Vio Lotto Telegram Bot

A Telegram slot machine game bot that rewards users with Vio Points and integrates with ZVIO tokens.

## 🌟 Features

- Daily slot machine game with emoji combinations
- Vio Points reward system
- Daily free rolls and bonus rolls
- Referral system
- Daily streaks with rewards
- ZVIO token integration (optional)
- Leaderboard system
- Anti-spam protection
- Group integration with game selection menu

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- (Optional) ZVIO Token Contract Address

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vio-lotto-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
BOT_TOKEN=your_telegram_bot_token_here
MONGODB_URI=mongodb://localhost:27017/vio_lotto
ZVIO_TOKEN_CONTRACT=your_zvio_contract_address
NODE_ENV=development
WEB3_PROVIDER_URL=your_web3_provider_url
ADMIN_IDS=comma,separated,admin,ids
```

4. Start the bot:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🎮 Game Commands

### Group Commands
- `/vioplay` - Access Vio games menu (works in groups and private chats)

### Private Chat Commands
- `/start` - Start the bot and get welcome message
- `/roll` - Spin the slot machine
- `/rollsleft` - Check remaining rolls
- `/buyrolls` - Purchase more rolls with points or ZVIO
- `/points` - Check your Vio Points balance
- `/streak` - View your daily streak
- `/invite` - Get your referral link
- `/leaderboard` - View top players

Note: All commands except `/vioplay` only work in private chat with the bot.

## 🎰 Game Rules

### Emoji Set
[🤖 ⚙️ 🧠 🔋 💡 💾 🚀 ⚡]

### Rewards
- 3 Match: +1000 Vio Points
- 2 Match: +50 Vio Points
- ⚡ Anywhere: +100 Vio Points
- No Match: +0 Points (with funny message)

### Daily Rolls
- 3 free rolls per day
- Bonus rolls from referrals and streaks
- Purchasable rolls with points or ZVIO

### Streak System
- Track daily rolls
- 5-day streak = +2 bonus rolls
- Streak resets if a day is missed

## 💰 Purchase Options

### Vio Points
- 1 Roll = 100 Points
- 3 Rolls = 250 Points
- 5 Rolls = 400 Points

### ZVIO Tokens
- 1 Roll = 50 ZVIO
- 5 Rolls = 200 ZVIO
- Unlimited for 24h = 500 ZVIO

## 🔒 Security Features

- 5-second cooldown between rolls
- Rate limiting on purchases
- Anti-spam protection
- Secure wallet integration
- Command restrictions (private chat only)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please contact [@YourSupportHandle](https://t.me/YourSupportHandle) on Telegram.

## 📢 Usage Notes

- Use `/vioplay` in groups to access the game selection menu
- All other commands require private chat with the bot
- Click buttons in the game menu to open respective bots
- Full game functionality available in private chat 