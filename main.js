// Main application entry point and router

import { state } from './state.js';
import { openModal, closeModal, toggleSidebar, toggleBetSlip } from './utils.js';
import { renderSports } from './components/sportsbetting.js';
import { renderCasino } from './components/casino.js';
import { renderBetSlip } from './components/betslip.js';
import { renderWallet } from './components/wallet.js';

// Initialize the application
async function initApp() {
    // Initialize state from localStorage
    state.initializeState();

    // Set up event listeners
    setupEventListeners();

    // Initial render
    renderAll();

    // Start simulated live odds updates
    startLiveOddsSimulation();

    // Start jackpot counter animation
    startJackpotAnimation();
}

function startJackpotAnimation() {
    let currentJackpot = 4852940.21;
    const counterEl = document.getElementById('jackpot-counter');
    if (!counterEl) return;

    setInterval(() => {
        currentJackpot += (Math.random() * 5 + 1);
        counterEl.textContent = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(currentJackpot);
    }, 2000);
}

// Set up all event listeners
function setupEventListeners() {
    // Sidebar toggle (mobile)
    document.addEventListener('click', (e) => {
        if (e.target.closest('#sidebar-toggle')) {
            toggleSidebar();
        }
    });

    // Navigation tabs (Sports/Casino/Live/Promos)
    document.addEventListener('click', (e) => {
        const sidebarItem = e.target.closest('.sidebar-item[data-section]');
        if (sidebarItem) {
            const sectionId = sidebarItem.dataset.section;
            
            // Update active sidebar item
            document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
            sidebarItem.classList.add('active');

            // Show selected section, hide others
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}-section`) {
                    section.classList.add('active');
                }
            });

            // Special handling for sections
            if (sectionId === 'sports') renderSports('upcoming');
            if (sectionId === 'casino') renderCasino(state.casino.activeGame || 'slots');
            if (sectionId === 'live') renderSports('live');
        }
    });

    // Sidebar subitem (leagues)
    document.addEventListener('click', (e) => {
        const subItem = e.target.closest('.sidebar-subitem[data-league]');
        if (subItem) {
            const league = subItem.dataset.league;
            // Update active state
            document.querySelectorAll('.sidebar-subitem').forEach(item => item.classList.remove('active'));
            subItem.classList.add('active');
            
            // Logic to handle league selection
            console.log('League selected:', league);
            // Example: trigger search or filter
        }
    });

    // Navigation tabs inside sections (Upcoming/Live sports)
    document.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab[data-sport]');
        if (tab) {
            document.querySelectorAll('.tab[data-sport]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const sportSection = tab.dataset.sport;
            renderSports(sportSection);
        }
    });

    // Casino game tabs
    document.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab[data-game]');
        if (tab) {
            document.querySelectorAll('.tab[data-game]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const game = tab.dataset.game;
            // Switch casino game
            switchCasinoGame(game);
        }
    });

    // Bet slip toggle
    document.addEventListener('click', (e) => {
        if (e.target.closest('#bet-slip-toggle') || e.target.closest('#close-bet-slip')) {
            toggleBetSlip();
        }
    });

    // Place bet button
    document.addEventListener('click', (e) => {
        if (e.target.closest('#place-bet-btn')) {
            const result = state.placeBet();
            if (result.success) {
                showToast('Apuesta colocada con éxito', 'success');
            } else {
                showToast(result.message, 'error');
            }
            renderBetSlip(); // Update bet slip display
            renderWallet(); // Update balance display
        }
    });

    // Deposit button
    document.addEventListener('click', (e) => {
        if (e.target.closest('#deposit-btn')) {
            openModal('modal-deposit');
        }
    });

    // Profile button
    document.addEventListener('click', (e) => {
        if (e.target.closest('#profile-btn')) {
            openModal('modal-profile');
            renderWallet(); // Update profile info
        }
    });

    // Modal close buttons
    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('.modal-close');
        if (closeBtn) {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        }
    });

    // Confirm deposit
    document.addEventListener('click', (e) => {
        if (e.target.closest('#confirm-deposit')) {
            const depositInput = document.getElementById('deposit-amount');
            const amount = parseFloat(depositInput.value);
            if (!isNaN(amount) && amount > 0) {
                state.addTransaction('deposit', amount, 'Depósito manual');
                showToast(`Depósito de ${formatCurrency(amount)} exitoso`, 'success');
                depositInput.value = '';
                closeModal('modal-deposit');
                renderWallet();
            } else {
                showToast('Por favor ingrese un monto válido', 'error');
            }
        }
    });

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('open')) {
            closeModal(e.target.id);
        }
    });

    // Prevent modal close when clicking inside content
    document.addEventListener('click', (e) => {
        if (e.target.closest('.modal-content')) {
            e.stopPropagation();
        }
    });

    // Game controls will be handled by individual game modules
}

// Render all components
function renderAll() {
    renderSports('upcoming'); // Default to upcoming matches
    renderCasino('slots'); // Default to slots game
    renderBetSlip();
    renderWallet();
}

// Switch casino game
function switchCasinoGame(game) {
    state.casino.activeGame = game;
    renderCasino(game);
}

// Start simulated live odds updates
function startLiveOddsSimulation() {
    // Simulate odds changing every few seconds
    setInterval(() => {
        // In a real app, this would fetch from an API
        // For now, we'll just trigger a re-render which will update simulated odds
        renderSports(document.querySelector('.tab[data-sport].active')?.dataset.sport || 'upcoming');
    }, 5000);
}

// Helper function to show toast
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-progress"><div></div></div>
    `;

    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);

        // Remove after animation
        setTimeout(() => {
            toast.remove();
        }, 3300); // Match CSS animation duration
    }
}

// Export for use in other modules if needed
export { renderAll };

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
