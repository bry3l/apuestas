// Slot machine game component

import { state } from '../state.js';
import { formatCurrency } from '../utils.js';

// Slot machine symbols and their payout multipliers
const SLOT_SYMBOLS = [
    { symbol: '🍒', name: 'Cereza', multiplier: 2 },
    { symbol: '🍋', name: 'Limón', multiplier: 3 },
    { symbol: '🍊', name: 'Naranja', multiplier: 4 },
    { symbol: '🍇', name: 'Uva', multiplier: 5 },
    { symbol: '🔔', name: 'Campana', multiplier: 8 },
    { symbol: '⭐', name: 'Estrella', multiplier: 10 },
    { symbol: '💎', name: 'Diamante', multiplier: 15 },
    { symbol: '7️⃣', name: 'Siete de la suerte', multiplier: 20 }
];

// Paylines (for a 3x3 grid - positions are [reel, row])
const PAYLINES = [
    // Horizontal lines
    [[0, 1], [1, 1], [2, 1]], // Middle row
    [[0, 0], [1, 0], [2, 0]], // Top row
    [[0, 2], [1, 2], [2, 2]], // Bottom row
    // Diagonal lines
    [[0, 0], [1, 1], [2, 2]], // Diagonal \
    [[0, 2], [1, 1], [2, 0]]  // Diagonal /
];

// Render the slot machine game
export function renderSlots() {
    const container = document.getElementById('slots-game');
    if (!container) return;

    // Create the slot machine HTML if it doesn't exist
    if (!container.querySelector('.slot-machine')) {
        container.innerHTML = `
            <div class="slot-machine">
                <div class="slot-reel" data-reel="0"></div>
                <div class="slot-reel" data-reel="1"></div>
                <div class="slot-reel" data-reel="2"></div>
            </div>
            <div class="game-controls">
                <button id="spin-button" class="btn btn-primary btn-lg">Girar</button>
                <div class="bet-controls">
                    <label>Apuesta: </label>
                    <input type="number" id="slot-bet-amount" value="10" min="1" step="1">
                    <span id="slot-bet-display">$10.00</span>
                </div>
            </div>
            <div id="slot-result" class="slot-result"></div>
        `;
    }

    // Set up event listeners
    setupSlotEvents();
}

// Set up event listeners for slot machine
function setupSlotEvents() {
    const spinButton = document.getElementById('spin-button');
    const betInput = document.getElementById('slot-bet-amount');
    const betDisplay = document.getElementById('slot-bet-display');

    if (spinButton) {
        spinButton.addEventListener('click', () => {
            const betAmount = parseInt(betInput.value) || 10;

            // Check if player has enough balance
            if (state.user.balance < betAmount) {
                showToast('Fondos insuficientes', 'error');
                return;
            }

            // Deduct bet amount
            state.updateBalance(-betAmount);

            // Spin the reels
            spinReels(betAmount);

            // Update displays
            betDisplay.textContent = formatCurrency(betAmount);
        });
    }

    // Update bet display when input changes
    if (betInput) {
        betInput.addEventListener('input', () => {
            const betAmount = parseInt(betInput.value) || 10;
            const betDisplay = document.getElementById('slot-bet-display');
            if (betDisplay) {
                betDisplay.textContent = formatCurrency(betAmount);
            }
        });

        betInput.addEventListener('change', () => {
            // Ensure minimum bet
            if (parseInt(betInput.value) < 1) {
                betInput.value = 1;
            }
        });
    }
}

// Spin the slot reels
function spinReels(betAmount) {
    const reels = document.querySelectorAll('.slot-reel');
    const resultElement = document.getElementById('slot-result');

    // Mark reels as spinning
    reels.forEach(reel => reel.classList.add('spinning'));

    // Clear previous result
    if (resultElement) {
        resultElement.innerHTML = '';
        resultElement.classList.remove('game-result-win', 'game-result-loss');
    }

    // Generate random results for each reel (with delay for visual effect)
    const results = [];
    const spinDuration = 3000; // 3 seconds

    reels.forEach((reel, index) => {
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * SLOT_SYMBOLS.length);
            results[index] = SLOT_SYMBOLS[randomIndex];

            // Update reel display
            reel.innerHTML = `<div class="slot-symbol">${results[index].symbol}</div>`;

            // Remove spinning class after delay
            if (index === reels.length - 1) {
                setTimeout(() => {
                    reels.forEach(r => r.classList.remove('spinning'));

                    // Calculate winnings
                    const winnings = calculateWinnings(results, betAmount);

                    // Show result
                    if (winnings > 0) {
                        state.updateBalance(winnings);
                        state.addTransaction('win', winnings, `Gana en tragamonedas: ${results.map(r => r.symbol).join(' ')}`);
                        showToast(`¡Ganaste ${formatCurrency(winnings)}!`, 'success');
                        if (resultElement) {
                            resultElement.innerHTML = `<div class="win-message">¡Ganaste ${formatCurrency(winnings)}!</div>`;
                            resultElement.classList.add('game-result-win');
                        }
                    } else {
                        state.addTransaction('loss', 0, `Pierde en tragamonedas: ${results.map(r => r.symbol).join(' ')}`);
                        showToast('Mejor suerte la próxima vez', 'error');
                        if (resultElement) {
                            resultElement.innerHTML = `<div class="loss-message">No ganaste esta vez</div>`;
                            resultElement.classList.add('game-result-loss');
                        }
                    }
                }, 500);
            }
        }, index * 500); // Stagger the reel stops
    });
}

// Calculate winnings based on results and bet amount
function calculateWinnings(results, betAmount) {
    // Check each payline for a win
    let maxMultiplier = 0;

    for (const payline of PAYLINES) {
        const [pos1, pos2, pos3] = payline;
        const symbol1 = results[pos1[0]];
        const symbol2 = results[pos2[0]];
        const symbol3 = results[pos3[0]];

        // Check if all three symbols match
        if (symbol1.symbol === symbol2.symbol && symbol2.symbol === symbol3.symbol) {
            maxMultiplier = Math.max(maxMultiplier, symbol1.multiplier);
        }
        // Check for two matching symbols (some slots pay for 2)
        else if (symbol1.symbol === symbol2.symbol || symbol2.symbol === symbol3.symbol || symbol1.symbol === symbol3.symbol) {
            maxMultiplier = Math.max(maxMultiplier, Math.min(symbol1.multiplier, symbol2.multiplier, symbol3.multiplier) * 0.5);
        }
    }

    return betAmount * maxMultiplier;
}

// Initialize slots game
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderSlots);
} else {
    renderSlots();
}