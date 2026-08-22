// Arcade Hub: Progression, Recommendations, Categories, Virtual D-Pad, Particles & Audio UI

class ArcadeHub {
  constructor() {
    this.xp = parseInt(localStorage.getItem('neon_xp') || '0', 10);
    this.coins = parseInt(localStorage.getItem('neon_coins') || '50', 10);
    this.favorites = JSON.parse(localStorage.getItem('neon_favorites') || '[]');
    this.playHistory = JSON.parse(localStorage.getItem('neon_history') || '{}');
    this.activeCategory = 'all';
    this.streak = parseInt(localStorage.getItem('neon_streak') || '1', 10);
    this.lastDailyDate = localStorage.getItem('neon_last_daily') || '';
    this.dailyGameId = this.getDailyGame();
    this.particles = [];
  }

  getDailyGame() {
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    const available = window.ALL_GAMES || [];
    if (available.length === 0) return 'spaceshooter';
    return available[seed % available.length].id;
  }

  getLevel() {
    const levels = [
      { lvl: 1, name: 'Neon Rookie', minXP: 0, badge: '🌱' },
      { lvl: 2, name: 'Cyber Cadet', minXP: 150, badge: '⚡' },
      { lvl: 3, name: 'Grid Runner', minXP: 400, badge: '🚀' },
      { lvl: 4, name: 'Retro Champion', minXP: 900, badge: '👑' },
      { lvl: 5, name: 'Neon Legend', minXP: 1800, badge: '🔥' }
    ];
    let cur = levels[0];
    for (const l of levels) {
      if (this.xp >= l.minXP) cur = l;
    }
    const next = levels.find(l => l.lvl === cur.lvl + 1) || { minXP: cur.minXP + 1000 };
    const progress = Math.min(100, Math.round(((this.xp - cur.minXP) / (next.minXP - cur.minXP)) * 100));
    return { ...cur, nextXP: next.minXP, progress };
  }

  addXP(amount) {
    this.xp += amount;
    this.coins += Math.floor(amount / 5);
    localStorage.setItem('neon_xp', this.xp);
    localStorage.setItem('neon_coins', this.coins);
    this.updateStatsUI();
  }

  toggleFavorite(gameId, e) {
    if (e) e.stopPropagation();
    if (this.favorites.includes(gameId)) {
      this.favorites = this.favorites.filter(id => id !== gameId);
    } else {
      this.favorites.push(gameId);
      if (window.retroAudio) window.retroAudio.score();
    }
    localStorage.setItem('neon_favorites', JSON.stringify(this.favorites));
    if (window.renderHome) window.renderHome();
  }

  recordPlay(gameId) {
    this.playHistory[gameId] = (this.playHistory[gameId] || 0) + 1;
    localStorage.setItem('neon_history', JSON.stringify(this.playHistory));
    this.addXP(10);

    // Daily challenge check
    const today = new Date().toDateString();
    if (gameId === this.dailyGameId && this.lastDailyDate !== today) {
      this.lastDailyDate = today;
      localStorage.setItem('neon_last_daily', today);
      this.addXP(50);
      this.coins += 25;
      localStorage.setItem('neon_coins', this.coins);
      this.triggerConfetti();
      if (window.retroAudio) window.retroAudio.victory();
      alert('🌟 Daily Challenge Complete! +50 XP & +25 Coins bonus mile!');
    }
  }

  getRecommendations() {
    const all = window.ALL_GAMES || [];
    // Sort by play count affinity & highlight trending/new games
    return all.slice().sort((a, b) => {
      const playsA = this.playHistory[a.id] || 0;
      const playsB = this.playHistory[b.id] || 0;
      return (playsB + (b.isNew ? 3 : 0)) - (playsA + (a.isNew ? 3 : 0));
    }).slice(0, 4);
  }

  triggerConfetti() {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    const colors = ['#00e5ff', '#ff2e9a', '#ffd23f', '#7b5cff', '#00ff88'];
    for (let i = 0; i < 45; i++) {
      const bit = document.createElement('div');
      const x = Math.random() * window.innerWidth;
      const c = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 6;
      bit.style.cssText = `position:absolute;left:${x}px;top:-20px;width:${size}px;height:${size}px;background:${c};border-radius:2px;box-shadow:0 0 8px ${c};transition:transform 1.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.8s ease;`;
      container.appendChild(bit);

      setTimeout(() => {
        const destY = window.innerHeight * (0.6 + Math.random() * 0.4);
        const destX = x + (Math.random() - 0.5) * 200;
        const rot = Math.random() * 720;
        bit.style.transform = `translate3d(${destX - x}px, ${destY}px, 0) rotate(${rot}deg)`;
        bit.style.opacity = '0';
      }, 30);
    }

    setTimeout(() => container.remove(), 2200);
  }

  updateStatsUI() {
    const lvl = this.getLevel();
    const el = document.getElementById('hubLevelBadge');
    if (el) el.innerHTML = `${lvl.badge} <b>${lvl.name} (Lvl ${lvl.lvl})</b>`;
    const xpEl = document.getElementById('hubXP');
    if (xpEl) xpEl.textContent = `${this.xp} XP`;
    const coinsEl = document.getElementById('hubCoins');
    if (coinsEl) coinsEl.textContent = `🪙 ${this.coins}`;
    const bar = document.getElementById('hubProgressBar');
    if (bar) bar.style.width = `${lvl.progress}%`;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  randomPick() {
    const games = window.ALL_GAMES || [];
    if (games.length === 0) return;
    if (window.retroAudio) window.retroAudio.jump();
    const btn = document.getElementById('randomBtn');
    if (btn) btn.classList.add('spinning');
    setTimeout(() => {
      if (btn) btn.classList.remove('spinning');
      const pick = games[Math.floor(Math.random() * games.length)];
      if (window.openGame) window.openGame(pick.id, pick.name);
    }, 450);
  }
}

window.arcadeHub = new ArcadeHub();
