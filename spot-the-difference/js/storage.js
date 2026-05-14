window.GameStorage = (function () {
  var KEYS = {
    PLAYER: 'std_player',
    ADVENTURE: 'std_adventure',
    LEADERBOARD: 'std_leaderboard',
    SETTINGS: 'std_settings',
    DAILY: 'std_daily'
  };

  var DEFAULT_PLAYER = {
    nickname: '玩家',
    avatar: 0,
    level: 1,
    exp: 0,
    gold: 100,
    diamond: 10,
    hintCount: 3,
    eloRating: 1000,
    totalGames: 0,
    winCount: 0,
    createdAt: Date.now()
  };

  function _get(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { }
  }

  function initPlayer() {
    var player = _get(KEYS.PLAYER);
    if (!player) {
      _set(KEYS.PLAYER, Object.assign({}, DEFAULT_PLAYER));
    }
    var adventure = _get(KEYS.ADVENTURE);
    if (!adventure) {
      adventure = { levels: {} };
      for (var i = 1; i <= 10; i++) {
        adventure.levels[i] = {
          bestScore: 0,
          stars: 0,
          completed: false,
          playCount: 0,
          unlocked: i === 1
        };
      }
      _set(KEYS.ADVENTURE, adventure);
    }
    var settings = _get(KEYS.SETTINGS);
    if (!settings) {
      _set(KEYS.SETTINGS, { soundEnabled: true, musicEnabled: true });
    }
    var leaderboard = _get(KEYS.LEADERBOARD);
    if (!leaderboard) {
      _set(KEYS.LEADERBOARD, { levelRankings: {}, eloRankings: [] });
    }
  }

  function getPlayer() {
    return _get(KEYS.PLAYER) || Object.assign({}, DEFAULT_PLAYER);
  }

  function savePlayer(player) {
    _set(KEYS.PLAYER, player);
  }

  function updatePlayer(updates) {
    var player = getPlayer();
    for (var k in updates) {
      if (updates.hasOwnProperty(k)) player[k] = updates[k];
    }
    savePlayer(player);
    return player;
  }

  function getAdventure() {
    return _get(KEYS.ADVENTURE) || { levels: {} };
  }

  function saveAdventure(adventure) {
    _set(KEYS.ADVENTURE, adventure);
  }

  function getLevelProgress(levelId) {
    var adventure = getAdventure();
    return adventure.levels[levelId] || {
      bestScore: 0, stars: 0, completed: false, playCount: 0, unlocked: false
    };
  }

  function saveLevelResult(levelId, score, stars, completed) {
    var adventure = getAdventure();
    var lp = adventure.levels[levelId] || {
      bestScore: 0, stars: 0, completed: false, playCount: 0, unlocked: false
    };
    lp.playCount = (lp.playCount || 0) + 1;
    if (score > lp.bestScore) lp.bestScore = score;
    if (stars > lp.stars) lp.stars = stars;
    if (completed) lp.completed = true;
    adventure.levels[levelId] = lp;
    if (completed && stars >= 2 && adventure.levels[levelId + 1]) {
      adventure.levels[levelId + 1].unlocked = true;
    }
    saveAdventure(adventure);
    return adventure;
  }

  function getTotalStars() {
    var adventure = getAdventure();
    var total = 0;
    for (var k in adventure.levels) {
      if (adventure.levels.hasOwnProperty(k)) {
        total += (adventure.levels[k].stars || 0);
      }
    }
    return total;
  }

  function getLeaderboard() {
    return _get(KEYS.LEADERBOARD) || { levelRankings: {}, eloRankings: [] };
  }

  function saveLeaderboard(lb) {
    _set(KEYS.LEADERBOARD, lb);
  }

  function addLevelScore(levelId, nickname, score) {
    var lb = getLeaderboard();
    if (!lb.levelRankings[levelId]) lb.levelRankings[levelId] = [];
    lb.levelRankings[levelId].push({ nickname: nickname, score: score, time: Date.now() });
    lb.levelRankings[levelId].sort(function (a, b) { return b.score - a.score; });
    lb.levelRankings[levelId] = lb.levelRankings[levelId].slice(0, 20);
    saveLeaderboard(lb);
  }

  function getSettings() {
    return _get(KEYS.SETTINGS) || { soundEnabled: true, musicEnabled: true };
  }

  function saveSettings(settings) {
    _set(KEYS.SETTINGS, settings);
  }

  function getDailyCheckin() {
    return _get(KEYS.DAILY) || { lastDate: null, streak: 0 };
  }

  function checkDaily() {
    var daily = getDailyCheckin();
    var today = new Date().toDateString();
    if (daily.lastDate === today) return { alreadyChecked: true, streak: daily.streak };
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    var streak = daily.lastDate === yesterday ? daily.streak + 1 : 1;
    daily.lastDate = today;
    daily.streak = streak;
    _set(KEYS.DAILY, daily);
    var player = getPlayer();
    player.hintCount = (player.hintCount || 0) + 1;
    player.gold = (player.gold || 0) + 50;
    savePlayer(player);
    return { alreadyChecked: false, streak: streak, hintsAdded: 1, goldAdded: 50 };
  }

  function resetAll() {
    localStorage.removeItem(KEYS.PLAYER);
    localStorage.removeItem(KEYS.ADVENTURE);
    localStorage.removeItem(KEYS.LEADERBOARD);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.DAILY);
    initPlayer();
  }

  return {
    initPlayer: initPlayer,
    getPlayer: getPlayer,
    savePlayer: savePlayer,
    updatePlayer: updatePlayer,
    getAdventure: getAdventure,
    saveAdventure: saveAdventure,
    getLevelProgress: getLevelProgress,
    saveLevelResult: saveLevelResult,
    getTotalStars: getTotalStars,
    getLeaderboard: getLeaderboard,
    saveLeaderboard: saveLeaderboard,
    addLevelScore: addLevelScore,
    getSettings: getSettings,
    saveSettings: saveSettings,
    getDailyCheckin: getDailyCheckin,
    checkDaily: checkDaily,
    resetAll: resetAll
  };
})();
