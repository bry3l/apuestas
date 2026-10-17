// Header component - handles user profile, balance, and navigation

import { state } from '../state.js';
import { openModal, closeModal } from '../utils.js';
import { renderWallet } from './wallet.js';

export function renderHeader() {
    const header = document.querySelector('.app-header');
    if (!header) return;

    // Header is already in HTML, we just need to update dynamic content
    updateBalanceDisplay();
    setupHeaderEvents();
}

export function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance-amount');
    if (balanceElement) {
        balanceElement.textContent = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(state.user.balance);
    }
}

export function setupHeaderEvents() {
    // Deposit button
    const depositBtn = document.getElementById('deposit-btn');
    if (depositBtn) {
        depositBtn.addEventListener('click', () => {
            openModal('modal-deposit');
        });
    }

    // Profile button
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            openModal('modal-profile');
            renderWallet(); // Update profile info
        });
    }
}

// Initialize header on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHeader);
} else {
    renderHeader();
}