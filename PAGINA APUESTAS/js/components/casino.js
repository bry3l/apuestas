// Casino component - handles switching between casino games

import { renderSlots } from '../games/slots.js';
import { renderRoulette } from '../games/roulette.js';
import { renderBlackjack } from '../games/blackjack.js';
import { renderCrash } from '../games/crash.js';
import { state } from '../state.js';

// Render the active casino game
export function renderCasino(game = 'slots') {
    const container = document.getElementById('casino-container');
    if (!container) return;

    // Hide all game containers first
    document.getElementById('slots-game')?.classList.remove('active');
    document.getElementById('roulette-game')?.classList.remove('active');
    document.getElementById('blackjack-game')?.classList.remove('active');
    document.getElementById('crash-game')?.classList.remove('active');

    // Show the selected game
    const gameElement = document.getElementById(`${game}-game`);
    if (gameElement) {
        gameElement.classList.add('active');
    }

    // Render the specific game
    switch (game) {
        case 'slots':
            renderSlots();
            break;
        case 'roulette':
            renderRoulette();
            break;
        case 'blackjack':
            renderBlackjack();
            break;
        case 'crash':
            renderCrash();
            break;
        default:
            renderSlots();
    }
}

// Initialize casino component
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderCasino('slots');
    });
} else {
    renderCasino('slots');
}