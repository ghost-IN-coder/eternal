// Shared sounds and storage helpers for games
(function(){
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  function tone(freq, dur=0.12, type='sine', gain=0.06){
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    setTimeout(()=>{ o.stop(); }, dur*1000);
  }

  // mute state persisted in localStorage under 'games_muted'
  function isMuted(){ return hget('games_muted', false); }
  function setMuted(v){ hset('games_muted', !!v); }

  window.playSound = function(name){
    if(isMuted()) return;
    try{ if(ctx.state === 'suspended') ctx.resume(); }catch(e){}
    switch(name){
      case 'click': tone(1200,0.06,'square',0.04); break;
      case 'place': tone(900,0.08,'sine',0.06); break;
      case 'win': tone(1400,0.14,'sawtooth',0.08); tone(1000,0.12,'sine',0.05); break;
      case 'eat': tone(700,0.06,'triangle',0.06); break;
      case 'fail': tone(180,0.18,'sawtooth',0.08); break;
      case 'combo': tone(1600,0.08,'square',0.08); tone(1400,0.07,'square',0.07); break;
      default: tone(800,0.05); break;
    }
  };

  window.toggleMute = function(){ const v = !isMuted(); setMuted(v); return v; };
  window.isMuted = isMuted;

  window.hget = function(k, d){ try{ const v = localStorage.getItem(k); return v===null?d:JSON.parse(v);}catch(e){return d} }
  window.hset = function(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }

  // THEME SYSTEM
  const themes = {
    'cyan': { neon1: '#0f0', neon2: '#00ffea' },
    'purple': { neon1: '#ff00ff', neon2: '#00ffff' },
    'sunset': { neon1: '#ff6b35', neon2: '#f7931e' },
    'matrix': { neon1: '#0f0', neon2: '#088' },
  };

  window.setTheme = function(themeName){
    const theme = themes[themeName] || themes['cyan'];
    document.documentElement.style.setProperty('--neon-1', theme.neon1);
    document.documentElement.style.setProperty('--neon-2', theme.neon2);
    hset('current_theme', themeName);
  };

  window.getTheme = function(){ return hget('current_theme', 'cyan'); };
  window.getAvailableThemes = function(){ return Object.keys(themes); };

  // Apply saved theme on load
  setTimeout(()=>{ window.setTheme(window.getTheme()); }, 100);

  // COMBO & STREAK SYSTEM
  let comboCount = 0;
  let maxCombo = 0;

  window.addCombo = function(amount=1){
    comboCount += amount;
    if(comboCount > maxCombo) maxCombo = comboCount;
    if(comboCount % 5 === 0) playSound('combo');
    return comboCount;
  };

  window.getCombo = function(){ return comboCount; };
  window.getMaxCombo = function(){ return maxCombo; };
  window.resetCombo = function(){ comboCount = 0; };
  window.saveMaxCombo = function(gameName){
    const key = 'max_combo_' + gameName;
    const current = hget(key, 0);
    if(maxCombo > current) hset(key, maxCombo);
    maxCombo = 0;
  };

  // XP and Progression System
  window.addXP = function(amount, game){
    const xpKey = 'player_xp', sessKey = 'session_history';
    let xp = hget(xpKey, 0);
    let oldLevel = Math.floor(xp / 1000);
    xp += amount;
    let newLevel = Math.floor(xp / 1000);
    hset(xpKey, xp);
    
    // Add to session history
    let sess = hget(sessKey, []);
    let combo = window.getCombo ? window.getCombo() : 0;
    sess.push({
      game: game, 
      xp: amount, 
      combo: combo,
      timestamp: new Date().toISOString(),
      win: true,
      score: 0,
      duration: 0
    });
    hset(sessKey, sess);

    if(newLevel > oldLevel){ playSound('win'); }
    return {xp, level: newLevel, leveledUp: newLevel > oldLevel};
  };

  window.getXP = function(){ return hget('player_xp', 0); };
  window.getLevel = function(){ return Math.floor(hget('player_xp', 0) / 1000); };
  window.getSessionHistory = function(){ return hget('session_history', []); };

  // Achievement System
  const achievements = {
    'first_game': {name: 'First Steps', desc: 'Play your first game', icon: '🎮'},
    'ten_wins': {name: 'Rising Star', desc: 'Win 10 games', icon: '⭐'},
    'perfect_memory': {name: 'Mind Palace', desc: 'Complete Memory with perfect time', icon: '🧠'},
    'unbeaten': {name: 'Invincible', desc: 'Win 50 consecutive rounds', icon: '👑'},
    'speedrunner': {name: 'Speedrunner', desc: 'Win a game in under 30 seconds', icon: '⚡'},
    'sound_master': {name: 'Sound Master', desc: 'Play 100 games', icon: '🔊'},
    'collector': {name: 'Collector', desc: 'Unlock 10 achievements', icon: '🏆'},
  };

  window.unlockAchievement = function(achID){
    let achs = hget('achievements', []);
    if(!achs.includes(achID)){
      achs.push(achID);
      hset('achievements', achs);
      playSound('win');
      return true;
    }
    return false;
  };

  window.hasAchievement = function(achID){ return hget('achievements', []).includes(achID); };
  window.getAchievements = function(){ return achievements; };
  window.getUnlockedCount = function(){ return hget('achievements', []).length; };

  // Daily Challenge
  window.getDailyChallenge = function(){
    const today = new Date().toDateString();
    let dc = hget('daily_challenge', {});
    if(dc.date !== today){
      const games = ['tictactoe', 'memory', 'snake'];
      dc = {date: today, game: games[Math.floor(Math.random()*games.length)], bonus: 250, completed: false};
      hset('daily_challenge', dc);
    }
    return dc;
  };

  window.completeDailyChallenge = function(){
    let dc = hget('daily_challenge', {});
    if(!dc.completed){
      dc.completed = true;
      hset('daily_challenge', dc);
      addXP(dc.bonus, 'daily_bonus');
      return true;
    }
    return false;
  };

  // Keyboard shortcuts registry
  window.registerKeyboardShortcuts = function(shortcuts){
    document.addEventListener('keydown', (e)=>{
      if(shortcuts[e.key]) shortcuts[e.key]();
    });
  };
})();
