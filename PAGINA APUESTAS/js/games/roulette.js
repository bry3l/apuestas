// Roulette game component

import { state } from '../state.js';
import { formatCurrency } from '../utils.js';

// Roulette numbers and their properties
const ROULETTE_NUMBERS = [
    { number: 0, color: 'green' },
    { number: 1, color: 'red' },
    { number: 2, color: 'black' },
    { number: 3, color: 'red' },
    { number: 4, color: 'black' },
    { number: 5, color: 'red' },
    { number: 6, color: 'black' },
    { number: 7, color: 'red' },
    { number: 8, color: 'black' },
    { number: 9, color: 'red' },
    { number: 10, color: 'black' },
    { number: 11, color: 'black' },
    { number: 12, color: 'red' },
    { number: 13, color: 'black' },
    { number: 14, color: 'red' },
    { number: 15, color: 'black' },
    { number: 16, color: 'red' },
    { number: 17, color: 'black' },
    { number: 18, color: 'red' },
    { number: 19, color: 'red' },
    { number: 20, color: 'black' },
    { number: 21, color: 'red' },
    { number: 22, color: 'black' },
    { number: 23, color: 'red' },
    { number: 24, color: 'black' },
    { number: 25, color: 'red' },
    { number: 26, color: 'black' },
    { number: 27, color: 'red' },
    { number: 28, color: 'black' },
    { number: 29, color: 'black' },
    { number: 30, color: 'red' },
    { number: 31, color: 'black' },
    { number: 32, color: 'red' },
    { number: 33, color: 'black' },
    { number: 34, color: 'red' },
    { number: 35, color: 'black' },
    { number: 36, color: 'red' }
];

// Betting options with their payouts
const BET_TYPES = {
    'straight': { name: 'Número directo', payout: 35, numbers: [] }, // Will be filled per number
    'split': { name: 'Apuesta a dividida', payout: 17, numbers: [] }, // Adjacent numbers
    'street': { name: 'Apuesta a trio', payout: 11, numbers: [] }, // 3 numbers in a row
    'corner': { name: 'Apuesta a esquina', payout: 8, numbers: [] }, // 4 numbers
    'line': { name: 'Apuesta a seisena', payout: 5, numbers: [] }, // 6 numbers
    'column': { name: 'Apuesta a columna', payout: 2, numbers: [] }, // 12 numbers
    'dozen': { name: 'Apuesta a docena', payout: 2, numbers: [] }, // 1-12, 13-24, 25-36
    'red': { name: 'Rojo', payout: 1, numbers: [] }, // All red numbers
    'black': { name: 'Negro', payout: 1, numbers: [] }, // All black numbers
    'even': { name: 'Par', payout: 1, numbers: [] }, // Even numbers
    'odd': { name: 'Impar', payout: 1, numbers: [] }, // Odd numbers
    'low': { name: 'Bajo (1-18)', payout: 1, numbers: [] }, // 1-18
    'high': { name: 'Alto (19-36)', payout: 1, numbers: [] } // 19-36
};

// Initialize bet types with their respective numbers
function initializeBetTypes() {
    // Straight bets (each number)
    ROULETTE_NUMBERS.forEach(num => {
        if (!BET_TYPES['straight'].numbers[num.number]) {
            BET_TYPES['straight'].numbers[num.number] = [];
        }
        BET_TYPES['straight'].numbers[num.number].push(num.number);
    });

    // Red/black numbers
    BET_TYPES['red'].numbers = ROULETTE_NUMBERS.filter(n => n.color === 'red').map(n => n.number);
    BET_TYPES['black'].numbers = ROULETTE_NUMBERS.filter(n => n.color === 'black').map(n => n.number);

    // Even/Odd numbers
    BET_TYPES['even'].numbers = ROULETTE_NUMBERS.filter(n => n.number % 2 === 0 && n.number !== 0).map(n => n.number);
    BET_TYPES['odd'].numbers = ROULETTE_NUMBERS.filter(n => n.number % 2 === 1).map(n => n.number);

    // Low/High numbers
    BET_TYPES['low'].numbers = ROULETTE_NUMBERS.filter(n => n.number >= 1 && n.number <= 18).map(n => n.number);
    BET_TYPES['high'].numbers = ROULETTE_NUMBERS.filter(n => n.number >= 19 && n.number <= 36).map(n => n.number);

    // Dozens
    BET_TYPES['dozen'].numbers = [
        ROULETTE_NUMBERS.filter(n => n.number >= 1 && n.number <= 12).map(n => n.number), // 1st dozen
        ROULETTE_NUMBERS.filter(n => n.number >= 13 && n.number <= 24).map(n => n.number), // 2nd dozen
        ROULETTE_NUMBERS.filter(n => n.number >= 25 && n.number <= 36).map(n => n.number)  // 3rd dozen
    ];

    // Columns
    BET_TYPES['column'].numbers = [
        ROULETTE_NUMBERS.filter((n, i) => i % 3 === 0).map(n => n.number), // 1st column
        ROULETTE_NUMBERS.filter((n, i) => i % 3 === 1).map(n => n.number), // 2nd column
        ROULETTE_NUMBERS.filter((n, i) => i % 3 === 2).map(n => n.number)  // 3rd column
    ];
}

// Initialize bet types on load
initializeBetTypes();

// Render the roulette game
export function renderRoulette() {
    const container = document.getElementById('roulette-game');
    if (!container) return;

    // Create the roulette HTML if it doesn't exist
    if (!container.querySelector('.roulette-table')) {
        container.innerHTML = `
            <div class="roulette-wheel">
                <div class="roulette-ball"></div>
            </div>
            <div class="roulette-table">
                <!-- Betting board will be generated here -->
            </div>
            <div class="game-controls">
                <button id="spin-button" class="btn btn-primary btn-lg">Girar Rueda</button>
                <div class="bet-controls">
                    <label>Apuesta: </label>
                    <input type="number" id="roulette-bet-amount" value="10" min="1" step="1">
                    <span id="roulette-bet-display">$10.00</span>
                </div>
            </div>
            <div id="roulette-result" class="roulette-result"></div>
        `;
    }

    // Generate betting board
    generateBettingBoard(container);

    // Set up event listeners
    setupRouletteEvents();
}

// Generate the betting board HTML
function generateBettingBoard(container) {
    const table = container.querySelector('.roulette-table');
    if (!table) return;

    // Create the numbered grid (0-36)
    let numbersHtml = '<div class="roulette-number-zero">';
    numbersHtml += '<div class="roulette-number-label">0</div>';
    numbersHtml += '</div>';

    // Create rows for 1-36
    for (let row = 0; row < 12; row++) {
        numbersHtml += '<div class="roulette-number-row">';
        for (let col = 0; col < 3; col++) {
            const num = row * 3 + col + 1;
            const numberData = ROULETTE_NUMBERS.find(n => n.number === num);
            numbersHtml += `
                <div class="roulette-number ${numberData.color}" data-number="${num}">
                    <div class="roulette-number-label">${num}</div>
                </div>
            `;
        }
        numbersHtml += '</div>';
    }

    table.innerHTML = `
        <div class="roulette-board-section">
            <div class="roulette-board-label"> primera columna </div>
            <div class="roulette-board-grid" data-column="0"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> segunda columna </div>
            <div class="roulette-board-grid" data-column="1"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> tercera columna </div>
            <div class="roulette-board-grid" data-column="2"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> 1ª docena </div>
            <div class="roulette-board-grid" data-dozen="0"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> 2ª docena </div>
            <div class="roulette-board-grid" data-dozen="1"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> 3ª docena </div>
            <div class="roulette-board-grid" data-dozen="2"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> 1-18 </div>
            <div class="roulette-board-grid" data-range="low"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> PAR </div>
            <div class="roulette-board-grid" data-type="even"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> NEGRO </div>
            <div class="roulette-board-grid" data-color="black"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> ROJO </div>
            <div class="roulette-board-grid" data-color="red"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> IMPAR </div>
            <div class="roulette-board-grid" data-type="odd"></div>
        </div>
        <div class="roulette-board-section">
            <div class="roulette-board-label"> 19-36 </div>
            <div class="roulette-board-grid" data-range="high"></div>
        </div>
    ` + numbersHtml;

    // Add special betting areas (we'll simplify for now)
    // In a full implementation, we'd add split, street, corner, line bets
}

// Set up event listeners for roulette
function setupRouletteEvents() {
    const spinButton = document.getElementById('spin-button');
    const betInput = document.getElementById('roulette-bet-amount');
    const betDisplay = document.getElementById('roulette-bet-display');
    const resultElement = document.getElementById('roulette-result');

    if (spinButton) {
        spinButton.addEventListener('click', () => {
            const betAmount = parseInt(betInput.value) || 10;

            // Check if player has enough balance
            if (state.user.balance < betAmount) {
                showToast('Fondos insuficientes', 'error');
                return;
            }

            // Get selected bets (simplified - in reality we'd track selected chips)
            const selectedBets = getSelectedBets();
            if (selectedBets.length === 0) {
                showToast('Selecciona al menos una apuesta', 'error');
                return;
            }

            // Deduct bet amount
            state.updateBalance(-betAmount);

            // Spin the wheel
            spinWheel(betAmount, selectedBets);

            // Update displays
            betDisplay.textContent = formatCurrency(betAmount);
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

    // Add click listeners to betting board
    const table = document.querySelector('.roulette-table');
    if (table) {
        table.addEventListener('click', (e) => {
            const cell = e.target.closest('[data-number], [data-column], [data-dozen], [data-range], [data-type], [data-color]');
            if (!cell) return;

            // Toggle bet selection
            cell.classList.toggle('active');

            // Update selected bets display (optional)
            updateSelectedBetsDisplay();
        });
    }
}

// Get currently selected bets (simplified)
function getSelectedBets() {
    const selectedElements = document.querySelectorAll('.roulette-table .active');
    const bets = [];

    selectedElements.forEach(el => {
        if (el.dataset.number) {
            bets.push({ type: 'straight', number: parseInt(el.dataset.number) });
        } else if (el.dataset.column !== undefined) {
            bets.push({ type: 'column', column: parseInt(el.dataset.column) });
        } else if (el.dataset.dozen !== undefined) {
            bets.push({ type: 'dozen', dozen: parseInt(el.dataset.dozen) });
        } else if (el.dataset.range) {
            bets.push({ type: el.dataset.range });
        } else if (el.dataset.type) {
            bets.push({ type: el.dataset.type });
        } else if (el.dataset.color) {
            bets.push({ type: el.dataset.color });
        }
    });

    return bets;
}

// Update selected bets display (optional)
function updateSelectedBetsDisplay() {
    // This could show a summary of selected bets
    // For now, we'll leave it as a visual indicator only
}

// Spin the roulette wheel
function spinWheel(betAmount, selectedBets) {
    const wheel = document.querySelector('.roulette-wheel');
    const ball = document.querySelector('.roulette-ball');
    const resultElement = document.getElementById('roulette-result');

    if (!wheel || !ball) return;

    // Mark wheel as spinning
    wheel.classList.add('spinning');

    // Generate random winning number
    const winningNumber = Math.floor(Math.random() * 37); // 0-36
    const winningData = ROULETTE_NUMBERS.find(n => n.number === winningNumber);

    // Calculate spin duration and final rotation
    const spins = 5 + Math.floor(Math.random() * 3); // 5-8 full spins
    const extraSpin = (winningNumber * (360 / 37)); // Position the winning number at top
    const totalRotation = spins * 360 + extraSpin;

    // Set up the spin animation
    wheel.style.transition = 'transform 5s ease-out';
    wheel.style.transform = `rotate(${totalRotation}deg)`;

    // Animate the ball (simplified - in reality this would be more complex)
    setTimeout(() => {
        // Stop spinning
        wheel.classList.remove('spinning');
        wheel.style.transition = 'transform 0.5s ease-out';

        // Calculate winnings
        let totalWinnings = 0;
        const winningDetails = [];

        selectedBets.forEach(bet => {
            const winInfo = checkBetWin(bet, winningNumber);
            if (winInfo.win) {
                totalWinnings += bet.amount * winInfo.payout;
                winningDetails.push(winInfo.description);
            }
        });

        // Update balance and show result
        if (totalWinnings > 0) {
            state.updateBalance(totalWinnings);
            state.addTransaction('win', totalWinnings, `Gana en ruleta: ${winningDetails.join(', ')}`);
            showToast(`¡Ganaste ${formatCurrency(totalWinnings)}! El número fue ${winningNumber} ${getColorName(winningData.color)}`, 'success');
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="win-message">
                        <div>¡Ganaste ${formatCurrency(totalWinnings)}!</div>
                        <div>El número ganador es: <span class="number-${winningData.color}">${winningNumber}</span></div>
                        <div>Apuestas ganadoras: ${winningDetails.join(', ')}</div>
                    </div>
                `;
                resultElement.classList.add('game-result-win');
            }
        } else {
            state.addTransaction('loss', 0, `Pierde en ruleta: el número fue ${winningNumber} ${getColorName(winningData.color)}`);
            showToast(`Mejor suerte la próxima vez. El número fue ${winningNumber} ${getColorName(winningData.color)}`, 'error');
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="loss-message">
                        <div>No ganaste esta vez</div>
                        <div>El número ganador es: <span class="number-${winningData.color}">${winningNumber}</span></div>
                    </div>
                `;
                resultElement.classList.add('game-result-loss');
            }
        }

        // Clear betting selections (optional)
        // document.querySelectorAll('.roulette-table .active').forEach(el => el.classList.remove('active'));

        // Reset wheel transition for next spin
        setTimeout(() => {
            wheel.style.transition = 'transform 0s ease-out';
            // Reset to position 0 for next spin (though we keep the visual spin)
        }, 100);
    }, 5000); // Match the spin duration
}

// Check if a bet wins
function checkBetWin(bet, winningNumber) {
    switch (bet.type) {
        case 'straight':
            return {
                win: bet.number === winningNumber,
                payout: BET_TYPES.straight.payout,
                description: `Straight ${winningNumber}`
            };
        case 'red':
            return {
                win: ROULETTE_NUMBERS.find(n => n.number === winningNumber)?.color === 'red',
                payout: BET_TYPES.red.payout,
                description: 'Red'
            };
        case 'black':
            return {
                win: ROULETTE_NUMBERS.find(n => n.number === winningNumber)?.color === 'black',
                payout: BET_TYPES.black.payout,
                description: 'Black'
            };
        case 'even':
            return {
                win: winningNumber !== 0 && winningNumber % 2 === 0,
                payout: BET_TYPES.even.payout,
                description: 'Even'
            };
        case 'odd':
            return {
                win: winningNumber % 2 === 1,
                payout: BET_TYPES.odd.payout,
                description: 'Odd'
            };
        case 'low':
            return {
                win: winningNumber >= 1 && winningNumber <= 18,
                payout: BET_TYPES.low.payout,
                description: 'Low (1-18)'
            };
        case 'high':
            return {
                win: winningNumber >= 19 && winningNumber <= 36,
                payout: BET_TYPES.high.payout,
                description: 'High (19-36)'
            };
        case 'dozen':
            const dozenMin = bet.dozen * 12 + 1;
            const dozenMax = (bet.dozen + 1) * 12;
            return {
                win: winningNumber >= dozenMin && winningNumber <= dozenMax,
                payout: BET_TYPES.dozen.payout,
                description: `Dozen ${bet.dozen + 1}`
            };
        case 'column':
            // Column 0: numbers 1,4,7,...,34
            // Column 1: numbers 2,5,8,...,35
            // Column 2: numbers 3,6,9,...,36
            const columnNumbers = [];
            for (let i = bet.column; i <= 33; i += 3) {
                columnNumbers.push(i + 1);
            }
            return {
                win: columnNumbers.includes(winningNumber),
                payout: BET_TYPES.column.payout,
                description: `Column ${bet.column + 1}`
            };
        default:
            return { win: false, payout: 0, description: 'Unknown' };
    }
}

// Get color name for display
function getColorName(color) {
    switch (color) {
        case 'red': return 'rojo';
        case 'black': return 'negro';
        case 'green': return 'verde';
        default: return color;
    }
}

// Initialize roulette game
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderRoulette);
} else {
    renderRoulette();
}