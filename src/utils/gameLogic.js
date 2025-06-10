const EMOJIS = ['🤖', '⚙️', '🧠', '🔋', '💡', '💾', '🚀', '⚡'];

// Roll the slot machine and return the result
function rollSlot() {
    const result = [];
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * EMOJIS.length);
        result.push(EMOJIS[randomIndex]);
    }
    return result;
}

// Calculate points based on the roll result
function calculatePoints(roll) {
    // Count occurrences of each emoji
    const counts = {};
    roll.forEach(emoji => {
        counts[emoji] = (counts[emoji] || 0) + 1;
    });

    // Check for matches
    const hasLightning = roll.includes('⚡');
    const matchCounts = Object.values(counts);
    const maxMatches = Math.max(...matchCounts);

    let points = 0;
    let message = '';

    if (maxMatches === 3) {
        points = 1000;
        message = '🎉 JACKPOT! You matched 3 and earned +1000 Vio Points!';
    } else if (maxMatches === 2) {
        points = 50;
        message = '🎉 Match 2! You earned +50 Vio Points!';
    } else if (hasLightning) {
        points = 100;
        message = '⚡ Surprise win! That ⚡ emoji gives you +100 Vio Points!';
    } else {
        // No match - generate a random funny message
        const noMatchMessages = [
            '🤖 Your bot short-circuited. No win this time.',
            '💾 Memory overflow! Try again tomorrow!',
            '⚙️ Gears got jammed. Better luck next time!',
            '🔋 Low battery! No power for a win.',
            '🧠 AI needs a reboot. Try again later!',
            '🚀 Mission failed! Try another launch.',
            '💡 Light bulb moment... but no win.',
        ];
        message = noMatchMessages[Math.floor(Math.random() * noMatchMessages.length)];
    }

    return {
        points,
        message,
        roll
    };
}

// Calculate roll purchase costs
const ROLL_COSTS = {
    points: {
        1: 100,
        3: 250,
        5: 400
    },
    zvio: {
        1: 50,
        5: 200,
        unlimited: 500
    }
};

// Get roll purchase options
function getRollPurchaseOptions() {
    return {
        points: {
            message: '💰 With Points:\n' +
                    '• 1 Roll = 100 Vio Points\n' +
                    '• 3 Rolls = 250 Vio Points\n' +
                    '• 5 Rolls = 400 Vio Points',
            costs: ROLL_COSTS.points
        },
        zvio: {
            message: '🪙 With ZVIO Tokens:\n' +
                    '• 1 Roll = 50 ZVIO\n' +
                    '• 5 Rolls = 200 ZVIO\n' +
                    '• Unlimited Today = 500 ZVIO',
            costs: ROLL_COSTS.zvio
        }
    };
}

// Check if user has enough points/tokens for purchase
function canAffordPurchase(user, amount, currency) {
    if (currency === 'points') {
        return user.vioPoints >= ROLL_COSTS.points[amount];
    } else if (currency === 'zvio') {
        // This would need to be implemented with actual token balance check
        return false; // Placeholder
    }
    return false;
}

// Calculate referral rewards
function calculateReferralRewards() {
    return {
        join: 25, // Points for referring a new user
        roll: 10  // Points for each roll made by referred user
    };
}

module.exports = {
    rollSlot,
    calculatePoints,
    getRollPurchaseOptions,
    canAffordPurchase,
    calculateReferralRewards,
    EMOJIS
}; 