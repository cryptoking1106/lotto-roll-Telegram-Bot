const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        sparse: true
    },
    vioPoints: {
        type: Number,
        default: 0
    },
    dailyRolls: {
        type: Number,
        default: 3
    },
    bonusRolls: {
        type: Number,
        default: 0
    },
    streakCount: {
        type: Number,
        default: 0
    },
    lastRollDate: {
        type: Date
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: String,
        sparse: true
    },
    referrals: [{
        type: String
    }],
    totalWins: {
        type: Number,
        default: 0
    },
    walletAddress: {
        type: String,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Generate a unique referral code
userSchema.methods.generateReferralCode = async function() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existingUser = await this.constructor.findOne({ referralCode: code });
    
    if (existingUser) {
        return this.generateReferralCode();
    }
    
    this.referralCode = code;
    return code;
};

// Reset daily rolls at midnight UTC
userSchema.methods.resetDailyRolls = function() {
    this.dailyRolls = 3;
    return this.save();
};

// Add bonus rolls
userSchema.methods.addBonusRolls = async function(amount) {
    this.bonusRolls += amount;
    return this.save();
};

// Update streak
userSchema.methods.updateStreak = async function() {
    const now = new Date();
    const lastRoll = this.lastRollDate ? new Date(this.lastRollDate) : null;
    
    if (!lastRoll) {
        this.streakCount = 1;
    } else {
        const diffDays = Math.floor((now - lastRoll) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            this.streakCount += 1;
        } else if (diffDays > 1) {
            this.streakCount = 1;
        }
    }
    
    this.lastRollDate = now;
    
    // Add bonus rolls for 5-day streak
    if (this.streakCount === 5) {
        await this.addBonusRolls(2);
    }
    
    return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 