// Centralized state management for the betting platform

export const state = {
    user: {
        id: 'user_123',
        username: 'Jugador123',
        balance: 1000.00,
        currency: 'EUR',
        avatar: 'https://i.pravatar.cc/40?img=3',
        level: 5,
        xp: 2450
    },
    betSlip: {
        items: [], // Array of selected bets
        stake: 10.00,
        type: 'single' // 'single' or 'combo'
    },
    sportsData: {
        liveMatches: [],
        upcomingMatches: [],
        loading: false
    },
    casino: {
        activeGame: 'slots',
        gameStates: {
            slots: { spinning: false, lastResult: null },
            roulette: { spinning: false, lastResult: null },
            blackjack: { gameActive: false, playerHand: [], dealerHand: [], gameOver: false },
            crash: { gameActive: false, multiplier: 1.00, crashingAt: null, history: [] }
        }
    },
    transactions: [
        { id: 'txn_001', type: 'deposit', amount: 500.00, date: Date.now() - 86400000 * 2, description: 'Depósito inicial' },
        { id: 'txn_002', type: 'bet', amount: -25.00, date: Date.now() - 86400000 * 1, description: 'Apuesta en Real Madrid - Barcelona' },
        { id: 'txn_003', type: 'win', amount: 75.00, date: Date.now() - 86400000 * 1 + 3600000, description: 'Gana: Real Madrid - Barcelona' },
        { id: 'txn_004', type: 'deposit', amount: 200.00, date: Date.now() - 86400000 * 0.5, description: 'Recarga de saldo' }
    ],
    activeBets: [
        { id: 'bet_001', event: 'Real Madrid vs Barcelona', selection: 'Real Madrid Ganar', odd: 2.10, stake: 25.00, potentialPayout: 52.50, timestamp: Date.now() - 3600000 }
    ],
    betHistory: [
        { id: 'hist_001', event: 'Liverpool vs Manchester United', selection: 'Empate', odd: 3.40, stake: 50.00, result: 'win', payout: 170.00, timestamp: Date.now() - 86400000 * 3 },
        { id: 'hist_002', event: 'Lakers vs Warriors', selection: 'Lakers Ganar', odd: 1.80, stake: 30.00, result: 'loss', payout: 0, timestamp: Date.now() - 86400000 * 2 },
        { id: 'hist_003', event: 'Slot Machine Neon Vegas', selection: 'Giro 25', stake: 10.00, result: 'win', payout: 150.00, timestamp: Date.now() - 86400000 * 1 }
    ]
};

// Event emitter for state changes
const listeners = [];

export function subscribe(listener) {
    listeners.push(listener);
    // Return unsubscribe function
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
}

export function notify() {
    listeners.forEach(listener => listener(state));
    // Persist to localStorage
    try {
        localStorage.setItem('betting_platform_state', JSON.stringify(state));
    } catch (e) {
        console.warn('Could not save state to localStorage:', e);
    }
}

// State mutation functions
export function updateBalance(amount) {
    state.user.balance += amount;
    // Ensure balance doesn't go below 0
    if (state.user.balance < 0) {
        state.user.balance = 0;
    }
    notify();
}

export function addToBetSlip(betItem) {
    // Check if item already exists (by event and selection)
    const existingIndex = state.betSlip.items.findIndex(item =>
        item.event === betItem.event && item.selection === betItem.selection
    );

    if (existingIndex > -1) {
        // Replace existing item
        state.betSlip.items[existingIndex] = betItem;
    } else {
        // Add new item
        state.betSlip.items.push(betItem);
    }
    notify();
}

export function removeFromBetSlip(index) {
    state.betSlip.items.splice(index, 1);
    notify();
}

export function clearBetSlip() {
    state.betSlip.items = [];
    state.betSlip.stake = 10.00;
    notify();
}

export function updateStake(amount) {
    state.betSlip.stake = Math.max(0.10, amount); // Minimum stake of 0.10
    notify();
}

export function setBetType(type) {
    if (type === 'single' || type === 'combo') {
        state.betSlip.type = type;
        notify();
    }
}

export function placeBet() {
    if (state.betSlip.items.length === 0) {
        return { success: false, message: 'No hay selecciones en el cupón' };
    }

    if (state.betSlip.stake <= 0) {
        return { success: false, message: 'La apuesta debe ser mayor a 0' };
    }

    if (state.user.balance < state.betSlip.stake) {
        return { success: false, message: 'Fondos insuficientes' };
    }

    // Calculate total odds and potential payout
    const totalOdds = state.betSlip.items.reduce((total, item) => total * item.odd, 1);
    const potentialPayout = totalOdds * state.betSlip.stake;

    // Create bet record
    const betId = `bet_${Date.now()}`;
    const newBet = {
        id: betId,
        event: state.betSlip.items.map(item => item.event).join(' vs '),
        selection: state.betSlip.items.map(item => item.selection).join(' + '),
        odd: totalOdds,
        stake: state.betSlip.stake,
        potentialPayout: potentialPayout,
        timestamp: Date.now()
    };

    // Deduct from balance
    updateBalance(-state.betSlip.stake);

    // Add to active bets
    state.activeBets.unshift(newBet);

    // Add transaction
    const transaction = {
        id: `txn_${Date.now()}`,
        type: 'bet',
        amount: -state.betSlip.stake,
        date: Date.now(),
        description: `Apuesta en ${newBet.event}`
    };
    state.transactions.unshift(transaction);

    // Clear bet slip
    clearBetSlip();

    notify();

    return { success: true, bet: newBet };
}

export function addTransaction(type, amount, description) {
    const transaction = {
        id: `txn_${Date.now()}`,
        type: type,
        amount: amount,
        date: Date.now(),
        description: description
    };
    state.transactions.unshift(transaction);

    // Update balance for deposits/withdrawals
    if (type === 'deposit') {
        updateBalance(amount);
    } else if (type === 'withdrawal') {
        updateBalance(-amount);
    }

    notify();
    return transaction;
}

export function resolveBet(betId, result) {
    const betIndex = state.activeBets.findIndex(bet => bet.id === betId);
    if (betIndex === -1) return false;

    const bet = state.activeBets[betIndex];
    const payout = result === 'win' ? bet.potentialPayout : 0;

    if (payout > 0) {
        updateBalance(payout);
        addTransaction('win', payout, `Gana: ${bet.event}`);
    } else {
        addTransaction('loss', 0, `Pierde: ${bet.event}`);
    }

    // Move to history
    const historyItem = {
        ...bet,
        result: result,
        payout: payout,
        timestamp: Date.now()
    };
    state.betHistory.unshift(historyItem);

    // Remove from active bets
    state.activeBets.splice(betIndex, 1);

    notify();
    return true;
}

// Initialize state from localStorage if available
export function initializeState() {
    try {
        const savedState = localStorage.getItem('betting_platform_state');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            // Merge saved state with defaults (keeping defaults for missing properties)
            Object.assign(state, parsed);
        }
    } catch (e) {
        console.warn('Could not load state from localStorage:', e);
    }

    // Notify initial state
    notify();
}