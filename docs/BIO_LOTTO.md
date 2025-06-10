# Vio Lotto Bot Documentation

## 1. Bot Messages & Dialogue

### Welcome Messages
#### New User (/start)
```
🎉 Welcome to Vio Lotto!

🎮 How to Play:
• Type /roll to spin the slot machine
• Match emojis to win Vio Points
• Get 3 free rolls daily

💡 Quick Commands:
• /roll - Spin the slot machine
• /points - Check your balance
• /buyrolls - Get more rolls
• /invite - Get your referral link

Ready to play? Type /roll to start!
```

#### Returning User (/start)
```
👋 Welcome back to Vio Lotto!

🎟️ You have {dailyRolls} daily rolls and {bonusRolls} bonus rolls left.
💎 Your Vio Points: {vioPoints}

Type /roll to play or /help to see all commands!
```

### Game Commands

#### /vioplay (Works in Groups & Private)
```
🎮 Vio Games

Choose your game:

🎰  Vio Lotto - Spin the slot machine and win Vio Points
🚀 Voyager - Trade and earn with Vio Voyager
```

Note: All commands below only work in private chat with the bot.

#### /roll
```
🎰 You rolled: {emoji1} {emoji2} {emoji3}
{result_message}

🧾 Rolls Left: {dailyRolls} daily + {bonusRolls} bonus

🔥 Streak: {streakCount} days
💫 One more day for bonus rolls! (if streak = 4)

💡 Use /buyrolls to get more rolls! (if low on rolls)
```

#### /points
```
💎 Your Vio Points Balance

Current Balance: {vioPoints} points

💡 Ways to earn points:
• Match 3 emojis: +1000 points
• Match 2 emojis: +50 points
• Get ⚡ emoji: +100 points
• Refer friends: +25 points
• Daily streak: +50 points

Use /buyrolls to spend your points!
```

#### /streak
```
🔥 Your Daily Streak

Current Streak: {streakCount} days

{streak_message}
⏰ Next roll available in: {hours}h {minutes}m

💡 Tip: Roll every day to maintain your streak and earn bonus rolls!
```

#### /invite
```
🧑🤝🧑 Invite friends. Win rolls.
Every friend who joins = +1 bonus roll
Every roll they make = +10 points for you

🔗 Your referral link:
{referral_link}

💡 Share this link with your friends to start earning rewards!
```

#### /buyrolls
```
🛍️ Buy More Rolls

Points Shop:
• 1 Roll = 100 points
• 3 Rolls = 250 points
• 5 Rolls = 400 points

ZVIO Shop (Coming Soon):
• 1 Roll = 1 ZVIO
• 5 Rolls = 4 ZVIO
• Unlimited Rolls = 10 ZVIO

💡 To purchase, use:
/buyrolls points 1 (or 3, 5)
/buyrolls zvio 1 (or 5, unlimited)
```

#### /help
```
🎮 Vio Lotto Help Center

📱 Basic Commands:
• /start - Start the bot and get welcome message
• /help - Show this help message
• /roll - Spin the slot machine
• /points - Check your Vio Points balance
• /streak - View your daily streak

🎰 Game Commands:
• /buyrolls - Purchase more rolls with points
• /invite - Get your referral link
• /leaderboard - View top players

🎲 How to Play:
1. Use /roll to spin the slot machine
2. Match emojis to win Vio Points:
   • 3 Match = +1000 points
   • 2 Match = +50 points
   • ⚡ Emoji = +100 points

🎁 Daily Rewards:
• 3 free rolls every day
• Daily streak bonus
• 5-day streak = +2 bonus rolls

👥 Referral System:
• Get +1 bonus roll when friends join
• Earn +10 points per friend's roll

💎 Points Shop:
• 1 Roll = 100 points
• 3 Rolls = 250 points
• 5 Rolls = 400 points

💡 Tips:
• Roll daily to maintain your streak
• Invite friends to earn more points
• Use /buyrolls to get more chances
• Check /leaderboard to see top players

📢 Note: All commands except /vioplay only work in private chat with the bot.
Use /vioplay in groups to access Vio games!
```

## 2. Game Logic & Flow

### Slot Machine Mechanics
- 3 emoji slots
- Emoji pool: 🎰 🎲 🎮 🎯 🎨 🎭 🎪 🎡 🎢 🎠 ⚡
- Special emoji: ⚡ (wild card)

### Win Conditions & Points
| Combination | Points | Description |
|------------|---------|-------------|
| 3 Same | 1000 | Three identical emojis |
| 2 Same | 50 | Two identical emojis |
| ⚡ Any | 100 | Any roll with ⚡ emoji |

### Daily System
- 3 free rolls per day
- Resets at midnight UTC
- Streak system:
  - 5-day streak = +2 bonus rolls
  - Streak resets if missed a day

### Referral System
- Referrer gets +1 bonus roll per friend
- Referrer gets +10 points per friend's roll
- No limit on referrals

### Points Shop
| Package | Cost | Value |
|---------|------|--------|
| 1 Roll | 100 points | 1x |
| 3 Rolls | 250 points | 1.2x |
| 5 Rolls | 400 points | 1.33x |

### Admin Commands
- `/adjustpoints <username> <points>` - Adjust user points
- `/giverolls <username> <amount>` - Give bonus rolls

### Cooldowns
- Roll cooldown: 5 seconds
- Purchase cooldown: 60 seconds
- Max daily purchases: 10

### Error Messages
- "❌ You haven't started playing yet!"
- "⏳ Please wait {time} seconds before rolling again"
- "🎟️ You've used all your rolls for today!"
- "❌ Not enough Vio Points!"
- "❌ Invalid command format!"
- "❌ Unauthorized access."

### Command Usage
- `/vioplay` - Works in both groups and private chats
- All other commands - Only work in private chat with the bot
- Group Usage:
  - Use `/vioplay` to access game selection menu
  - Click buttons to open respective bots
- Private Chat Usage:
  - All commands available
  - Direct game interaction
  - Full bot functionality 