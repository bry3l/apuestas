// Blackjack game component

import { state } from '../state.js';
import { formatCurrency } from '../utils.js';

// Card deck constants
const SUITS = ['♥', '♦', '♣', '♠'];
const VALUES = [
    { value: 'A', points: [1, 11] }, // Ace can be 1 or 11
    { value: '2', points: 2 },
    { value: '3', points: 3 },
    { value: '4', points: 4 },
    { value: '5', points: 5 },
    { value: '6', points: 6 },
    { value: '7', points: 7 },
    { value: '8', points: 8 },
    { value: '9', points: 9 },
    { value: '10', points: 10 },
    { value: 'J', points: 10 },
    { value: 'Q', points: 10 },
    { value: 'K', points: 10 }
];

// Create a deck of cards
function createDeck() {
    const deck = [];
    SUITS.forEach(suit => {
        VALUES.forEach(card => {
            deck.push({
                ...card,
                suit,
                // For display, we'll show the value and suit
                display: card.value + suit
            });
        });
    });
    return deck;
}

// Shuffle deck using Fisher-Yates algorithm
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Calculate hand value (handles aces properly)
function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    hand.forEach(card => {
        if (card.value === 'A') {
            aces++;
            value += 11; // Initially count ace as 11
        } else {
            value += card.points;
        }
    });

    // Adjust for aces if value exceeds 21
    while (value > 21 && aces > 0) {
        value -= 10; // Change ace from 11 to 1
        aces--;
    }

    return value;
}

// Check if hand is blackjack (exactly 21 with 2 cards)
function isBlackjack(hand) {
    return hand.length === 2 && calculateHandValue(hand) === 21;
}

// Render the blackjack game
export function renderBlackjack() {
    const container = document.getElementById('blackjack-game');
    if (!container) return;

    // Create the blackjack HTML if it doesn't exist
    if (!container.querySelector('.blackjack-table')) {
        container.innerHTML = `
            <div class="blackjack-table">
                <div class="blackjack-dealer">
                    <div class="blackjack-dealer-label">Crupier</div>
                    <div class="blackjack-cards" id="dealer-cards"></div>
                </div>
                <div class="blackjack-player">
                    <div class="blackjack-player-label">Jugador</div>
                    <div class="blackjack-cards" id="player-cards"></div>
                </div>
            </div>
            <div class="blackjack-stats">
                <div>Valor de la mano: <span id="player-value">0</span></div>
                <div>Valor del crupier: <span id="dealer-value">?</span></div>
            </div>
            <div class="game-controls">
                <button id="deal-button" class="btn btn-success btn-lg">Nueva Mano</button>
                <button id="hit-button" class="btn btn-primary">Pedir</button>
                <button id="stand-button" class="btn btn-danger">Plantarse</button>
                <button id="double-button" class="btn btn-warning">Doblar</button>
            </div>
            <div class="bet-controls">
                <label>Apuesta: </label>
                <input type="number" id="blackjack-bet-amount" value="10" min="1" step="1">
                <span id="blackjack-bet-display">$10.00</span>
            </div>
            <div id="blackjack-result" class="blackjack-result"></div>
        `;
    }

    // Set up event listeners
    setupBlackjackEvents();
}

// Set up event listeners for blackjack
function setupBlackjackEvents() {
    const dealButton = document.getElementById('deal-button');
    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const doubleButton = document.getElementById('double-button');
    const betInput = document.getElementById('blackjack-bet-amount');
    const betDisplay = document.getElementById('blackjack-bet-display');
    const resultElement = document.getElementById('blackjack-result');

    if (dealButton) {
        dealButton.addEventListener('click', () => {
            const betAmount = parseInt(betInput.value) || 10;

            // Check if player has enough balance
            if (state.user.balance < betAmount) {
                showToast('Fondos insuficientes', 'error');
                return;
            }

            // Start new game
            startBlackjackGame(betAmount);
        });
    }

    if (hitButton) {
        hitButton.addEventListener('click', () => {
            hitPlayer();
        });
    }

    if (standButton) {
        standButton.addEventListener('click', () => {
            standPlayer();
        });
    }

    if (doubleButton) {
        doubleButton.addEventListener('click', () => {
            doubleDown();
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
}

// Start a new blackjack game
function startBlackjackGame(betAmount) {
    // Deduct bet amount
    state.updateBalance(-betAmount);

    // Initialize or reset game state
    state.casino.gameStates.blackjack = {
        deck: shuffleDeck(createDeck()),
        playerHand: [],
        dealerHand: [],
        gameActive: true,
        gameOver: false,
        betAmount: betAmount,
        doubled: false,
        playerStand: false
    };

    // Deal initial cards
    dealInitialCards();

    // Update UI
    updateBlackjackUI();

    // Disable deal button during game
    document.getElementById('deal-button').disabled = true;
    document.getElementById('hit-button').disabled = false;
    document.getElementById('stand-button').disabled = false;
    document.getElementById('double-button').disabled = false;
}

// Deal initial two cards to player and dealer
function dealInitialCards() {
    const game = state.casino.gameStates.blackjack;

    // Player gets two cards
    game.playerHand.push(game.deck.pop());
    game.playerHand.push(game.deck.pop());

    // Dealer gets two cards
    game.dealerHand.push(game.deck.pop());
    game.dealerHand.push(game.deck.pop());
}

// Hit player - deal another card
function hitPlayer() {
    const game = state.casino.gameStates.blackjack;
    if (!game.gameActive) return;

    game.playerHand.push(game.deck.pop());
    updateBlackjackUI();

    // Check for bust
    if (calculateHandValue(game.playerHand) > 21) {
        endGame('bust');
    }
}

// Stand player - end player's turn, dealer plays
function standPlayer() {
    const game = state.casino.gameStates.blackjack;
    if (!game.gameActive) return;

    game.playerStand = true;
    dealerPlay();
}

// Double down - double bet, take one more card, then stand
function doubleDown() {
    const game = state.casino.gameStates.blackjack;
    if (!game.gameActive || game.doubled) return;

    // Check if player can afford to double
    if (state.user.balance < game.betAmount) {
        showToast('Fondos insuficientes para doblar', 'error');
        return;
    }

    // Deduct additional bet
    state.updateBalance(-game.betAmount);
    game.betAmount *= 2;
    game.doubled = true;

    // Deal one more card
    game.playerHand.push(game.deck.pop());
    updateBlackjackUI();

    // Automatically stand after doubling
    if (calculateHandValue(game.playerHand) <= 21) {
        standPlayer();
    } else {
        endGame('bust');
    }
}

// Dealer's turn - hit until 17 or higher
function dealerPlay() {
    const game = state.casino.gameStates.blackjack;
    if (!game.gameActive) return;

    // Dealer hits on soft 17 (hand value < 17 or soft 17)
    function shouldDealerHit() {
        const value = calculateHandValue(game.dealerHand);
        // Check for soft 17 (ace counted as 11)
        const hasAce = game.dealerHand.some(card => card.value === 'A');
        const nonAceValue = game.dealerHand.reduce((sum, card) => {
            return sum + (card.value === 'A' ? 1 : card.points);
        }, 0);

        // Soft 17: ace + 6 points
        return value < 17 || (hasAce && nonAceValue === 6);
    }

    function dealerHit() {
        if (shouldDealerHit()) {
            game.dealerHand.push(game.deck.pop());
            updateBlackjackUI();
            setTimeout(dealerHit, 500); // Delay for visual effect
        } else {
            // Dealer stands, determine winner
            setTimeout(() => {
                determineWinner();
            }, 500);
        }
    }

    dealerHit();
}

// Determine the winner and end the game
function determineWinner() {
    const game = state.casino.gameStates.blackjack;
    if (!game.gameActive) return;

    const playerValue = calculateHandValue(game.playerHand);
    const dealerValue = calculateHandValue(game.dealerHand);

    let result = '';
    let payoutMultiplier = 0;

    // Check for blackjacks
    const playerBlackjack = isBlackjack(game.playerHand);
    const dealerBlackjack = isBlackjack(game.dealerHand);

    if (playerBlackjack && dealerBlackjack) {
        result = 'push'; // Both have blackjack
        payoutMultiplier = 1; // Return bet
    } else if (playerBlackjack) {
        result = 'blackjack'; // Player blackjack
        payoutMultiplier = 2.5; // 3:2 payout
    } else if (dealerBlackjack) {
        result = 'dealer_blackjack'; // Dealer blackjack
        payoutMultiplier = 0; // Lose bet
    }
    // Check for busts
    else if (playerValue > 21) {
        result = 'player_bust'; // Player bust
        payoutMultiplier = 0;
    } else if (dealerValue > 21) {
        result = 'dealer_bust'; // Dealer bust
        payoutMultiplier = 2; // Win 2x bet
    }
    // Compare values
    else if (playerValue > dealerValue) {
        result = 'player_win'; // Player wins
        payoutMultiplier = 2; // Win 2x bet
    } else if (dealerValue > playerValue) {
        result = 'dealer_win'; // Dealer wins
        payoutMultiplier = 0; // Lose bet
    } else {
        result = 'push'; // Tie
        payoutMultiplier = 1; // Return bet
    }

    endGame(result, payoutMultiplier);
}

// End the game and show results
function endGame(result, payoutMultiplier = 0) {
    const game = state.casino.gameStates.blackjack;
    if (!game.gameActive) return;

    game.gameActive = false;
    game.gameOver = true;

    // Calculate payout
    const payout = game.betAmount * payoutMultiplier;
    const netResult = payout - game.betAmount; // Net win/loss

    // Update balance if player won
    if (payout > 0) {
        state.updateBalance(payout);
        if (netResult > 0) {
            state.addTransaction('win', netResult, `Gana en blackjack: ${result}`);
            showToast(`¡Ganaste ${formatCurrency(netResult)}!`, 'success');
        } else if (netResult < 0) {
            state.addTransaction('loss', Math.abs(netResult), `Pierde en blackjack: ${result}`);
            showToast(`Perdiste ${formatCurrency(Math.abs(netResult))}`, 'error');
        } else {
            state.addTransaction('push', 0, `Empate en blackjack: ${result}`);
            showToast('Empate - recuperas tu apuesta', 'info');
        }
    } else {
        // Lost the bet (already deducted)
        state.addTransaction('loss', game.betAmount, `Pierde en blackjack: ${result}`);
        showToast(`Perdiste ${formatCurrency(game.betAmount)}`, 'error');
    }

    // Update UI
    updateBlackjackUI(true); // Show dealer's hole card
    showBlackjackResult(result);

    // Reset buttons
    document.getElementById('deal-button').disabled = false;
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
    document.getElementById('double-button').disabled = true;
}

// Update the blackjack UI
function updateBlackjackUI(showDealerHoleCard = false) {
    const game = state.casino.gameStates.blackjack;
    if (!game) return;

    // Update player cards
    const playerCardsEl = document.getElementById('player-cards');
    if (playerCardsEl) {
        playerCardsEl.innerHTML = game.playerHand.map(card =>
            `<div class="blackjack-card">${card.display}</div>`
        ).join('');
    }

    // Update dealer cards
    const dealerCardsEl = document.getElementById('dealer-cards');
    if (dealerCardsEl) {
        if (showDealerHoleCard || !game.gameActive) {
            // Show both dealer cards
            dealerCardsEl.innerHTML = game.dealerHand.map(card =>
                `<div class="blackjack-card">${card.display}</div>`
            ).join('');
        } else {
            // Show first card, hide second card
            dealerCardsEl.innerHTML = `
                <div class="blackjack-card">${game.dealerHand[0]?.display ?? ''}</div>
                <div class="blackjack-card face-down"></div>
            `;
        }
    }

    // Update hand values
    const playerValueEl = document.getElementById('player-value');
    if (playerValueEl) {
        playerValueEl.textContent = calculateHandValue(game.playerHand);
    }

    const dealerValueEl = document.getElementById('dealer-value');
    if (dealerValueEl) {
        if (showDealerHoleCard || !game.gameActive) {
            dealerValueEl.textContent = calculateHandValue(game.dealerHand);
        } else {
            dealerValueEl.textContent = '?';
        }
    }
}

// Show game result message
function showBlackjackResult(result) {
    const resultElement = document.getElementById('blackjack-result');
    if (!resultElement) return;

    let message = '';
    let type = '';

    switch (result) {
        case 'blackjack':
            message = '¡Blackjack! Ganaste 3:2';
            type = 'success';
            break;
        case 'player_win':
            message = '¡Ganaste la mano!';
            type = 'success';
            break;
        case 'dealer_bust':
            message = '¡El crupier se pasó! Ganaste';
            type = 'success';
            break;
        case 'dealer_blackjack':
            message = 'El crupier tiene blackjack. Pierdes';
            type = 'error';
            break;
        case 'dealer_win':
            message = 'El crupier gana. Pierdes';
            type = 'error';
            break;
        case 'player_bust':
            message = 'Te pasaste de 21. Pierdes';
            type = 'error';
            break;
        case 'push':
            message = 'Empate. Recuperas tu apuesta';
            type = 'info';
            break;
        default:
            message = 'Juego terminado';
            type = 'info';
    }

    resultElement.innerHTML = `<div class="game-result-${type}">${message}</div>`;
    resultElement.classList.add(`game-result-${type}`);
}

// Initialize blackjack game
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBlackjack);
} else {
    renderBlackjack();
}