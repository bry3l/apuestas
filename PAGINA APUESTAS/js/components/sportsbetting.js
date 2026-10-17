// Sports betting component - handles live/upcoming matches and odds

import { state } from '../state.js';
import { formatCurrency } from '../utils.js';
import { addToBetSlip } from '../state.js';

// Mock data generator for sports matches
function generateMockSportsData() {
    const sports = [
        { name: 'Fútbol', icon: '⚽', leagues: ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League'] },
        { name: 'Baloncesto', icon: '🏀', leagues: ['NBA', 'Euroliga', 'ACB'] },
        { name: 'Tenis', icon: '🎾', leagues: ['ATP', 'WTA', 'Grand Slam'] },
        { name: 'Esports', icon: '🎮', leagues: ['LOL', 'CS:GO', 'Dota 2'] },
        { name: 'MMA/UFC', icon: '🥊', leagues: ['UFC', 'Bellator'] }
    ];

    const teams = [
        'Real Madrid', 'Barcelona', 'Atlético Madrid', 'Sevilla', 'Valencia',
        'Manchester United', 'Liverpool', 'Chelsea', 'Arsenal', 'Manchester City',
        'Bayern Munich', 'Borussia Dortmund', 'PSG', 'Juventus', 'AC Milan',
        'Lakers', 'Warriors', 'Celtics', 'Heat', 'Bucks',
        'Novak Djokovic', 'Rafael Nadal', 'Carlos Alcaraz', 'Stefanos Tsitsipas',
        'Team Liquid', 'Fnatic', 'G2 Esports', 'TSM',
        'Conor McGregor', 'Khabib Nurmagomedov', 'Israel Adesanya', 'Jon Jones'
    ];

    function getRandomTeam() {
        return teams[Math.floor(Math.random() * teams.length)];
    }

    function getRandomOdd() {
        return parseFloat((1.5 + Math.random() * 3).toFixed(2)); // Between 1.5 and 4.5
    }

    function generateMatch(isLive = false) {
        const homeTeam = getRandomTeam();
        let awayTeam;
        do {
            awayTeam = getRandomTeam();
        } while (awayTeam === homeTeam);

        const sport = sports[Math.floor(Math.random() * sports.length)];
        const league = sport.leagues[Math.floor(Math.random() * sport.leagues.length)];

        const matchTime = isLive
            ? `${Math.floor(Math.random() * 90)}'${Math.floor(Math.random() * 60)}"`
            : new Date(Date.now() + Math.random() * 86400000 * 3).toLocaleString('es-ES', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

        return {
            id: Math.random().toString(36).substr(2, 9),
            homeTeam,
            awayTeam,
            sport: sport.name,
            sportIcon: sport.icon,
            league,
            isLive,
            score: isLive ? `${Math.floor(Math.random() * 5)} - ${Math.floor(Math.random() * 5)}` : '',
            time: matchTime,
            odds: {
                homeWin: getRandomOdd(),
                draw: getRandomOdd(),
                awayWin: getRandomOdd()
            }
        };
    }

    // Generate live matches (2-5)
    const liveMatches = Array.from({ length: Math.floor(Math.random() * 4) + 2 }, () => generateMatch(true));

    // Generate upcoming matches (6-12)
    const upcomingMatches = Array.from({ length: Math.floor(Math.random() * 7) + 6 }, () => generateMatch(false));

    return { liveMatches, upcomingMatches };
}

// Initialize mock data in state if not present
if (!state.sportsData.liveMatches.length) {
    const initialData = generateMockSportsData();
    state.sportsData.liveMatches = initialData.liveMatches;
    state.sportsData.upcomingMatches = initialData.upcomingMatches;
}

// Function to update match odds randomly (simulate live odds changes)
function updateMatchOdds(matches) {
    return matches.map(match => {
        // 30% chance to update each odd
        if (Math.random() < 0.3) {
            match.odds.homeWin = parseFloat((match.odds.homeWin + (Math.random() - 0.5) * 0.3).toFixed(2));
            match.odds.draw = parseFloat((match.odds.draw + (Math.random() - 0.5) * 0.3).toFixed(2));
            match.odds.awayWin = parseFloat((match.odds.awayWin + (Math.random() - 0.5) * 0.3).toFixed(2));

            // Ensure odds stay reasonable
            match.odds.homeWin = Math.max(1.01, match.odds.homeWin);
            match.odds.draw = Math.max(1.01, match.odds.draw);
            match.odds.awayWin = Math.max(1.01, match.odds.awayWin);
        }
        return match;
    });
}

// Render sports matches based on tab
export function renderSports(tab = 'upcoming', targetContainerId = null) {
    const containerId = targetContainerId || (tab === 'live' && document.getElementById('live-section')?.classList.contains('active') ? 'live-container' : 'sports-container');
    const container = document.getElementById(containerId) || document.getElementById('sports-container');
    if (!container) return;

    // Update state with new mock data if needed (simulate live data fetch)
    // In a real app, this would be an API call
    if (tab === 'live') {
        state.sportsData.liveMatches = updateMatchOdds(state.sportsData.liveMatches);
    } else {
        // For upcoming, we might just refresh occasionally
        if (Math.random() < 0.2) { // 20% chance to refresh upcoming matches
            const newUpcoming = Array.from({ length: state.sportsData.upcomingMatches.length }, () =>
                generateMockSportsData().upcomingMatches[0] // Simplified
            );
            state.sportsData.upcomingMatches = newUpcoming;
        }
    }

    const matches = tab === 'live' ? state.sportsData.liveMatches : state.sportsData.upcomingMatches;

    if (matches.length === 0) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando eventos...</p>
            </div>
        `;
        return;
    }

    container.innerHTML = matches.map(match => createMatchCard(match, tab)).join('');
}

// Create a match card element
function createMatchCard(match, tab) {
    const { homeTeam, awayTeam, sportIcon, sport, league, isLive, score, time, odds } = match;

    return `
        <div class="card match-card" data-match-id="${match.id}">
            <div class="match-info">
                <div class="team-home">
                    <div class="team-logo">${sportIcon}</div>
                    <div class="team-name">${homeTeam}</div>
                </div>
                <div class="match-score">
                    ${isLive ? `<div>${score}</div><div>${time}</div>` : `<div>${time}</div>`}
                </div>
                <div>
                    <div class="team-away">
                        <div class="team-logo">${sportIcon}</div>
                        <div class="team-name">${awayTeam}</div>
                    </div>
                </div>
            </div>
            <div class="match-odds">
                <button class="odd-btn" data-event="${homeTeam} vs ${awayTeam}" data-selection="${homeTeam} Ganar" data-odd="${odds.homeWin}">
                    <span class="odd-label">1</span>
                    <span class="odd-value">${odds.homeWin}</span>
                    <span class="odd-change ${getOddChangeClass(odds.homeWin, match.id + 'home')}"></span>
                </button>
                <button class="odd-btn" data-event="${homeTeam} vs ${awayTeam}" data-selection="Empate" data-odd="${odds.draw}">
                    <span class="odd-label">X</span>
                    <span class="odd-value">${odds.draw}</span>
                    <span class="odd-change ${getOddChangeClass(odds.draw, match.id + 'draw')}"></span>
                </button>
                <button class="odd-btn" data-event="${homeTeam} vs ${awayTeam}" data-selection="${awayTeam} Ganar" data-odd="${odds.awayWin}">
                    <span class="odd-label">2</span>
                    <span class="odd-value">${odds.awayWin}</span>
                    <span class="odd-change ${getOddChangeClass(odds.awayWin, match.id + 'away')}"></span>
                </button>
            </div>
            <div class="card-header">
                <span>${league}</span>
                <span class="badge">${isLive ? 'EN VIVO' : 'PRÓXIMO'}</span>
            </div>
        </div>
    `;
}

// Helper to determine if odds changed (for visual indicator)
// In a real app, we'd compare with previous value
function getOddChangeClass(currentOdd, matchOddKey) {
    // Simulate random changes for demo
    const random = Math.random();
    if (random < 0.15) return 'odd-change up';
    if (random < 0.3) return 'odd-change down';
    return '';
}

// Set up event listeners for match odds clicks
export function setupSportsEvents() {
    // Remove any existing listener by scoping or ensuring single attachment via flag
    if (window._sportsEventsInitialized) return;
    window._sportsEventsInitialized = true;

    document.addEventListener('click', (e) => {
        const oddBtn = e.target.closest('.odd-btn');
        if (!oddBtn) return;

        const event = oddBtn.dataset.event;
        const selection = oddBtn.dataset.selection;
        const odd = parseFloat(oddBtn.dataset.odd);

        // Add to bet slip
        addToBetSlip({
            id: Math.random().toString(36).substr(2, 9),
            event,
            selection,
            odd
        });

        // Visual feedback
        oddBtn.classList.add('active');
        setTimeout(() => oddBtn.classList.remove('active'), 300);

        // Update bet slip UI
        const betSlipEvent = new CustomEvent('betSlipUpdated');
        document.dispatchEvent(betSlipEvent);
    });
}

// Initialize component
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderSports('upcoming');
        setupSportsEvents();
    });
} else {
    renderSports('upcoming');
    setupSportsEvents();
}