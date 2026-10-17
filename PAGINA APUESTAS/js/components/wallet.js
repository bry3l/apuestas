// Wallet component - handles user profile, balance, and transaction history

import { state } from '../state.js';
import { formatCurrency, formatDate, formatNumber } from '../utils.js';

// Render wallet info in header and modals
export function renderWallet() {
    updateBalanceDisplay();
    renderProfileModal();
    renderTransactionHistory();
}

// Update balance display in header
export function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance-amount');
    if (balanceElement) {
        balanceElement.textContent = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(state.user.balance);
    }
}

// Render profile modal content
export function renderProfileModal() {
    const modalBody = document.querySelector('#modal-profile .modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div class="profile-info">
            <p><strong>Usuario:</strong> ${state.user.username}</p>
            <p><strong>Nivel:</strong> ${state.user.level}</p>
            <p><strong>Experiencia:</strong> ${formatNumber(state.user.xp)} XP</p>
            <p><strong>Balance:</strong> ${formatCurrency(state.user.balance)}</p>
        </div>

        <div class="transaction-history">
            <h4>Historial de Transacciones</h4>
            <div id="transaction-list" class="transaction-list">
                <!-- Transactions will be injected here -->
            </div>
        </div>
    `;

    renderTransactionHistory();
}

// Render transaction history
export function renderTransactionHistory() {
    const transactionList = document.getElementById('transaction-list');
    if (!transactionList) return;

    if (state.transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="empty-state" style="padding: 1.5rem; text-align: center;">
                <div class="empty-state-icon">📊</div>
                <p>No hay transacciones aún</p>
            </div>
        `;
        return;
    }

    // Show last 10 transactions
    const recentTransactions = state.transactions.slice(0, 10);

    transactionList.innerHTML = recentTransactions.map(tx => createTransactionItem(tx)).join('');
}

// Create a transaction history item
function createTransactionItem(tx) {
    const dateStr = formatDate(tx.date);
    const amountStr = formatCurrency(Math.abs(tx.amount));
    const typeClass = tx.type;
    const isPositive = tx.amount > 0 || tx.type === 'deposit' || tx.type === 'win';
    const amountClass = isPositive ? 'positive' : 'negative';
    const amountPrefix = isPositive && tx.type !== 'bet' && tx.type !== 'withdrawal' ? '+' : '';

    let description = tx.description;
    switch (tx.type) {
        case 'deposit':
            description = 'Depósito de fondos';
            break;
        case 'withdrawal':
            description = 'Retiro de fondos';
            break;
        case 'bet':
            description = 'Apuesta realizada';
            break;
        case 'win':
            description = 'Gana de apuesta';
            break;
        case 'loss':
            description = 'Pierde de apuesta';
            break;
    }

    return `
        <div class="transaction-item ${typeClass}">
            <span class="transaction-description">${description}</span>
            <span class="transaction-amount ${amountClass}">
                ${amountPrefix}${amountStr}
            </span>
            <span class="transaction-date">${dateStr}</span>
        </div>
    `;
}

// Initialize wallet component
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderWallet);
} else {
    renderWallet();
}

// Listen for state changes to update wallet
const unsubscribe = state.subscribe(() => {
    // Only update if balance or transactions changed
    renderWallet();
});

// Cleanup on unmount (though we won't unmount in this SPA)
// return unsubscribe;