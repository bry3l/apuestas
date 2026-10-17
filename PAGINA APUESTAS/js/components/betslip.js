// Bet slip component - handles the betting slip UI and logic

import { state } from '../state.js';
import { formatCurrency, calculatePotentialPayout } from '../utils.js';
import { placeBet } from '../state.js';

// Render the bet slip
export function renderBetSlip() {
    const content = document.getElementById('bet-slip-content');
    const payoutElement = document.getElementById('payout-amount');
    const placeBetBtn = document.getElementById('place-bet-btn');

    if (!content || !payoutElement || !placeBetBtn) return;

    // Update potential payout display
    if (state.betSlip.items.length > 0) {
        const totalOdds = state.betSlip.items.reduce((total, item) => total * item.odd, 1);
        const potentialPayout = calculatePotentialPayout([totalOdds], state.betSlip.stake);
        payoutElement.textContent = formatCurrency(potentialPayout);
    } else {
        payoutElement.textContent = formatCurrency(0);
    }
    // Update bet count badge
    const badge = document.getElementById('bet-count-badge');
    if (badge) {
        badge.textContent = state.betSlip.items.length;
        if (state.betSlip.items.length > 0) {
            badge.classList.add('has-bets');
        } else {
            badge.classList.remove('has-bets');
        }
    }

    // Render bet slip items
    if (state.betSlip.items.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>Cupón vacío</h3>
                <p>Selecciona cuotas para agregar apuestas a tu cupón</p>
            </div>
        `;
    } else {
        content.innerHTML = state.betSlip.items.map((item, index) => createBetSlipItem(item, index)).join('');

        // Add event listeners to stake inputs and remove buttons
        setBetSlipEvents();
    }
}

// Create a bet slip item element
function createBetSlipItem(item, index) {
    return `
        <div class="bet-slip-item" data-index="${index}">
            <div class="bet-slip-selection">
                <div class="bet-slip-event">${item.event}</div>
                <div class="bet-slip-odd">${item.selection} <span>${item.odd.toFixed(2)}</span></div>
            </div>
            <div class="bet-slip-stake">
                <label>Apuesta:</label>
                <input type="number" value="${item.stake || state.betSlip.stake}" min="0.01" step="0.01">
            </div>
            <button class="bet-slip-remove" data-index="${index}">&times;</button>
        </div>
    `;
}

// Set up event listeners for bet slip interactions
function setBetSlipEvents() {
    // Stake input changes
    document.querySelectorAll('.bet-slip-stake input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.closest('.bet-slip-item').dataset.index);
            const newStake = parseFloat(e.target.value);

            if (!isNaN(newStake) && newStake >= 0.01) {
                // Update stake for this specific item
                if (state.betSlip.items[index]) {
                    state.betSlip.items[index].stake = newStake;
                }
                // Also update general stake if it's the first item or we want to track it separately
                state.updateStake(newStake);

                // Update potential payout display
                renderBetSlip(); // Re-render to update payout
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
            }
        });
    });

    // Remove buttons
    document.querySelectorAll('.bet-slip-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            // Remove from bet slip
            const updatedItems = [...state.betSlip.items];
            updatedItems.splice(index, 1);

            // Update state
            state.betSlip.items = updatedItems;
            state.notify();

            // Re-render
            renderBetSlip();
        });
    });
}

// Initialize bet slip component
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBetSlip);
} else {
    renderBetSlip();
}

// Listen for bet slip updates from other components
document.addEventListener('betSlipUpdated', renderBetSlip);