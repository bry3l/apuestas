// Crash game component (similar to Aviator/JetX)

import { state } from '../state.js';
import { formatCurrency } from '../utils.js';

// Render the crash game
export function renderCrash() {
    const container = document.getElementById('crash-game');
    if (!container) return;

    // Create the crash HTML if it doesn't exist
    if (!container.querySelector('.crash-container')) {
        container.innerHTML = `
            <div class="crash-container">
                <div class="crash-graph">
                    <div class="crash-line"></div>
                    <div class="crash-point"></div>
                </div>
                <div class="crash-multiplier">1.00x</div>
                <div class="crash-history" id="crash-history"></div>
            </div>
            <div class="game-controls">
                <button id="cashout-button" class="btn btn-success btn-lg">Cobrar</button>
                <button id="newbet-button" class="btn btn-primary">Nueva Apuesta</button>
            </div>
            <div class="bet-controls">
                <label>Apuesta: </label>
                <input type="number" id="crash-bet-amount" value="10" min="1" step="1">
                <span id="crash-bet-display">$10.00</span>
            </div>
            <div class="crash-auto">
                <label>
                    <input type="checkbox" id="auto-cashout"> Auto cobrar en
                    <input type="number" id="auto-cashout-value" value="2.00" min="1.01" step="0.01">
                    x
                </label>
            </div>
            <div id="crash-result" class="crash-result"></div>
        `;
    }

    // Set up event listeners
    setupCrashEvents();
}

// Set up event listeners for crash game
function setupCrashEvents() {
    const cashoutButton = document.getElementById('cashout-button');
    const newbetButton = document.getElementById('newbet-button');
    const betInput = document.getElementById('crash-bet-amount');
    const betDisplay = document.getElementById('crash-bet-display');
    const autoCashoutCheckbox = document.getElementById('auto-cashout');
    const autoCashoutValue = document.getElementById('auto-cashout-value');
    const resultElement = document.getElementById('crash-result');

    if (cashoutButton) {
        cashoutButton.addEventListener('click', () => {
            cashout();
        });
    }

    if (newbetButton) {
        newbetButton.addEventListener('click', () => {
            startNewCrashGame();
        });
    }

    // Update bet display when input changes
    if (betInput) {
        betInput.addEventListener('input', () => {
            const betAmount = parseInt(betInput.value) || 10;
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

    // Auto cashout functionality
    if (autoCashoutCheckbox && autoCashoutValue) {
        autoCashoutCheckbox.addEventListener('change', () => {
            // Enable/disable the value input
            autoCashoutValue.disabled = !autoCashoutCheckbox.checked;
        });
    }
}

// Start a new crash game
function startNewCrashGame() {
    const betAmount = parseInt(document.getElementById('crash-bet-amount').value) || 10;
    const autoCashoutEnabled = document.getElementById('auto-cashout')?.checked || false;
    const autoCashoutValue = parseFloat(document.getElementById('auto-cashout-value')?.value || 2.00);

    // Check if player has enough balance
    if (state.user.balance < betAmount) {
        showToast('Fondos insuficientes', 'error');
        return;
    }

    // Deduct bet amount
    state.updateBalance(-betAmount);

    // Initialize or reset game state
    state.casino.gameStates.crash = {
        gameActive: true,
        multiplier: 1.00,
        crashingAt: generateCrashPoint(),
        history: state.casino.gameStates.crash?.history || [],
        betAmount: betAmount,
        autoCashoutEnabled: autoCashoutEnabled,
        autoCashoutValue: autoCashoutValue,
        cashedOut: false,
        startTime: Date.now()
    };

    // Reset UI
    resetCrashUI();
    updateCrashMultiplier(1.00);

    // Start the game loop
    runCrashGame();

    // Update button states
    document.getElementById('cashout-button').disabled = false;
    document.getElementById('newbet-button').disabled = true;
}

// Generate random crash point (between 1.01 and 100.00, but weighted toward lower values)
function generateCrashPoint() {
    // Weighted random - more likely to crash early
    const r = Math.random();
    let crashPoint;

    if (r < 0.5) {
        // 50% chance to crash between 1.01x and 2.00x
        crashPoint = 1.01 + (r * 0.99 * 2); // 1.01 to 2.00
    } else if (r < 0.8) {
        // 30% chance to crash between 2.01x and 5.00x
        crashPoint = 2.01 + ((r - 0.5) * 0.3 * (5.00 - 2.01) / 0.3); // 2.01 to 5.00
    } else if (r < 0.95) {
        // 15% chance to crash between 5.01x and 20.00x
        crashPoint = 5.01 + ((r - 0.8) * 0.15 * (20.00 - 5.01) / 0.15); // 5.01 to 20.00
    } else {
        // 5% chance to crash between 20.01x and 100.00x
        crashPoint = 20.01 + ((r - 0.95) * 0.05 * (100.00 - 20.01) / 0.05); // 20.01 to 100.00
    }

    return parseFloat(crashPoint.toFixed(2));
}

// Run the crash game simulation
function runCrashGame() {
    const game = state.casino.gameStates.crash;
    if (!game || !game.gameActive) return;

    const startTime = game.startTime || Date.now();
    const elapsed = (Date.now() - startTime) / 1000; // seconds elapsed
    const baseSpeed = 0.1; // Base multiplier increase per second
    const speed = baseSpeed * (1 + elapsed * 0.1); // Speed increases over time

    // Calculate current multiplier based on elapsed time and random curve
    // Using an exponential-like curve that increases faster over time
    const progress = Math.min(elapsed / 30, 0.95); // Normalize to 0-0.95 over 30 seconds
    const curve = progress * progress * 2; // Quadratic curve for acceleration
    const currentMultiplier = 1.00 + (game.crashingAt - 1.00) * curve;

    // Check if we've reached or passed the crash point
    if (currentMultiplier >= game.crashingAt) {
        crashGame(game.crashingAt);
        return;
    }

    // Check for auto cashout
    if (game.autoCashoutEnabled && !game.cashedOut && currentMultiplier >= game.autoCashoutValue) {
        cashout(game.autoCashoutValue);
        return;
    }

    // Update UI
    updateCrashMultiplier(currentMultiplier);
    updateCrashLine(currentMultiplier);

    // Continue game loop
    requestAnimationFrame(() => runCrashGame());
}

// Update the multiplier display
function updateCrashMultiplier(multiplier) {
    const multiplierElement = document.querySelector('.crash-multiplier');
    if (multiplierElement) {
        multiplierElement.textContent = `${multiplier.toFixed(2)}x`;

        // Add pulsing effect when multiplier is high
        if (multiplier > 5.00) {
            multiplierElement.style.animation = 'pulse 1s infinite';
        } else {
            multiplierElement.style.animation = '';
        }
    }
}

// Update the crash line height based on multiplier
function updateCrashLine(multiplier) {
    const crashLine = document.querySelector('.crash-line');
    const crashPoint = document.querySelector('.crash-point');
    const crashGraph = document.querySelector('.crash-graph');

    if (!crashLine || !crashPoint || !crashGraph) return;

    // Calculate height percentage (capped at 95% for visibility)
    const heightPercent = Math.min((multiplier - 1) * 20, 95); // Each x = 20% height, max 95%
    crashLine.style.height = `${heightPercent}%`;

    // Position the point at the end of the line
    crashPoint.style.bottom = `${heightPercent}%`;
}

// Crash the game
function crashGame(actualCrashPoint) {
    const game = state.casino.gameStates.crash;
    if (!game || !game.gameActive) return;

    game.gameActive = false;

    // Update UI to show crash
    updateCrashMultiplier(actualCrashPoint);
    updateCrashLine(actualCrashPoint);

    // Add crash effect
    const crashGraph = document.querySelector('.crash-graph');
    if (crashGraph) {
        crashGraph.classList.add('crashing');
    }

    // Determine result
    let winnings = 0;
    let resultType = 'loss';
    let message = '';

    if (!game.cashedOut) {
        // Player didn't cash out - loses bet
        winnings = 0;
        resultType = 'loss';
        message = `¡Crashed en ${actualCrashPoint.toFixed(2)}x! Pierdes tu apuesta.`;
        state.addTransaction('loss', game.betAmount, `Pierde en crash: crashed en ${actualCrashPoint.toFixed(2)}x`);
    } else {
        // Player cashed out - wins based on cashout multiplier
        winnings = game.betAmount * game.cashedOutMultiplier;
        resultType = 'win';
        message = `¡Ganaste ${formatCurrency(winnings - game.betAmount)}! Cobraste en ${game.cashedOutMultiplier.toFixed(2)}x.`;
        state.updateBalance(winnings); // Add winnings (original bet was already deducted)
        state.addTransaction('win', winnings - game.betAmount, `Gana en crash: cobró en ${game.cashedOutMultiplier.toFixed(2)}x`);
    }

    // Add to history
    const historyItem = {
        multiplier: actualCrashPoint,
        result: resultType,
        timestamp: Date.now()
    };
    game.history.unshift(historyItem);
    // Keep only last 10 history items
    if (game.history.length > 10) {
        game.history.pop();
    }

    updateCrashHistory();

    // Show result
    showCrashResult(message, resultType === 'win' ? 'success' : 'error');

    // Update button states
    document.getElementById('cashout-button').disabled = true;
    document.getElementById('newbet-button').disabled = false;
}

// Cash out the current bet
function cashout(multiplier = null) {
    const game = state.casino.gameStates.crash;
    if (!game || !game.gameActive || game.cashedOut) return;

    game.gameActive = false;
    game.cashedOut = true;
    game.cashedOutMultiplier = multiplier !== null ? multiplier : game.multiplier;

    // Update UI
    updateCrashMultiplier(game.cashedOutMultiplier);
    updateCrashLine(game.cashedOutMultiplier);

    // Add cashout effect
    const crashPoint = document.querySelector('.crash-point');
    if (crashPoint) {
        crashPoint.style.backgroundColor = 'var(--neon-green)';
        crashPoint.style.boxShadow = '0 0 15px rgba(0,255,136,0.7)';
    }

    // Calculate winnings
    const winnings = game.betAmount * game.cashedOutMultiplier;
    const profit = winnings - game.betAmount;

    // Update balance
    state.updateBalance(winnings); // Add back the winnings (bet was already deducted)
    state.addTransaction('win', profit, `Gana en crash: cobró en ${game.cashedOutMultiplier.toFixed(2)}x`);

    // Add to history
    const historyItem = {
        multiplier: game.cashedOutMultiplier,
        result: 'win',
        timestamp: Date.now()
    };
    game.history.unshift(historyItem);
    // Keep only last 10 history items
    if (game.history.length > 10) {
        game.history.pop();
    }

    updateCrashHistory();

    // Show result
    showCrashResult(`¡Ganaste ${formatCurrency(profit)}! Cobraste en ${game.cashedOutMultiplier.toFixed(2)}x.`, 'success');

    // Update button states
    document.getElementById('cashout-button').disabled = true;
    document.getElementById('newbet-button').disabled = false;
}

// Reset crash game UI
function resetCrashUI() {
    const crashLine = document.querySelector('.crash-line');
    const crashPoint = document.querySelector('.crash-point');
    const crashGraph = document.querySelector('.crash-graph');
    const multiplierElement = document.querySelector('.crash-multiplier');
    const resultElement = document.getElementById('crash-result');

    if (crashLine) crashLine.style.height = '0%';
    if (crashPoint) {
        crashPoint.style.bottom = '0%';
        crashPoint.style.backgroundColor = 'var(--neon-green)';
        crashPoint.style.boxShadow = '0 0 10px rgba(0,255,136,0.5)';
    }
    if (crashGraph) crashGraph.classList.remove('crashing');
    if (multiplierElement) {
        multiplierElement.textContent = '1.00x';
        multiplierElement.style.animation = '';
    }
    if (resultElement) resultElement.innerHTML = '';
}

// Update crash history display
function updateCrashHistory() {
    const historyElement = document.getElementById('crash-history');
    if (!historyElement) return;

    const game = state.casino.gameStates.crash;
    if (!game || !game.history) {
        historyElement.innerHTML = '';
        return;
    }

    // Show last 5 history items
    const recentHistory = game.history.slice(0, 5);

    historyElement.innerHTML = recentHistory.map(item => {
        const colorClass = item.result === 'win' ? 'win' : 'loss';
        const symbol = item.result === 'win' ? '↑' : '↓';
        return `<span class="crash-history-item ${colorClass}">${symbol}${item.multiplier.toFixed(2)}x</span>`;
    }).join('');
}

// Show crash game result
function showCrashResult(message, type) {
    const resultElement = document.getElementById('crash-result');
    if (!resultElement) return;

    resultElement.innerHTML = `<div class="game-result-${type}">${message}</div>`;
    resultElement.classList.add(`game-result-${type}`);
}

// Initialize crash game
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCrash);
} else {
    renderCrash();
}