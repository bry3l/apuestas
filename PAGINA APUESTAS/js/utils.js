// Utility functions for formatting and helpers

export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

export function formatNumber(number) {
    return new Intl.NumberFormat('es-ES').format(number);
}

export function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

export function calculatePotentialPayout(oddsArray, stake) {
    const totalOdds = oddsArray.reduce((total, odd) => total * odd, 1);
    return totalOdds * stake;
}

export function generateRandomId() {
    return Math.random().toString(36).substr(2, 9);
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function createToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-progress"><div></div></div>
    `;

    toastContainer.appendChild(toast);

    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
    }, duration + 300); // Account for CSS animation time
}

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('open');
    }
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
    }
}

export function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

export function toggleBetSlip() {
    const betSlip = document.getElementById('bet-slip');
    betSlip.classList.toggle('open');
}