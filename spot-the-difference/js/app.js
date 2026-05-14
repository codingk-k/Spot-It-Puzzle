window.GameApp = (function () {
  var currentPage = 'home';
  var gameState = null;
  var versusState = null;
  var particleAnimId = null;
  var particles = [];

  function init() {
    GameStorage.initPlayer();
    GameAudio.init();

    var settings = GameStorage.getSettings();
    GameAudio.setSfxEnabled(settings.soundEnabled);
    GameAudio.setMusicEnabled(settings.musicEnabled);
    updateToggles();

    initParticles();
    bindEvents();
    updateHome();
    navigateTo('home');

    window.addEventListener('hashchange', function () {
      var hash = location.hash.replace('#', '') || 'home';
      if (hash !== currentPage) showPage(hash);
    });
  }

  function navigateTo(page) {
    location.hash = page;
    showPage(page);
  }

  function showPage(page) {
    currentPage = page;
    var pages = document.querySelectorAll('.page');
    pages.forEach(function (p) { p.classList.remove('active'); });
    var el = document.getElementById('page-' + page);
    if (el) {
      el.classList.add('active');
    }
    if (page === 'home') updateHome();
    if (page === 'level-select') renderLevelSelect();
    if (page === 'leaderboard') renderLeaderboard();
    if (page === 'profile') renderProfile();
    if (page === 'settings') updateToggles();
  }

  function bindEvents() {
    var $ = function (id) { return document.getElementById(id); };

    $('btn-start-game').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('level-select');
    });
    $('btn-adventure').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('level-select');
    });
    $('btn-versus').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('versus-select');
    });
    $('btn-daily').addEventListener('click', function () {
      GameAudio.playClick();
      doDailyCheckin();
    });
    $('btn-leaderboard').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('leaderboard');
    });
    $('btn-settings').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('settings');
    });
    $('btn-back-home').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('home');
    });
    $('btn-back-home2').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('home');
    });
    $('btn-back-home3').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('home');
    });
    $('btn-back-home4').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('home');
    });
    $('btn-back-home5').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('home');
    });
    $('btn-realtime').addEventListener('click', function () {
      GameAudio.playClick();
      startVersusMatchmaking('realtime');
    });
    $('btn-async').addEventListener('click', function () {
      GameAudio.playClick();
      startVersusMatchmaking('async');
    });
    $('btn-hint').addEventListener('click', function () {
      useHint();
    });
    $('btn-versus-hint').addEventListener('click', function () {
      useVersusHint();
    });
    $('btn-pause').addEventListener('click', function () {
      togglePause();
    });
    $('btn-resume').addEventListener('click', function () {
      togglePause();
    });
    $('btn-quit').addEventListener('click', function () {
      endGame();
      navigateTo('level-select');
    });
    $('btn-next-level').addEventListener('click', function () {
      GameAudio.playClick();
      var nextId = gameState ? gameState.levelId + 1 : 1;
      if (nextId > 10) nextId = 10;
      navigateTo('level-select');
    });
    $('btn-replay').addEventListener('click', function () {
      GameAudio.playClick();
      if (gameState) startGame(gameState.levelId);
    });
    $('btn-return').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('level-select');
    });
    $('btn-profile').addEventListener('click', function () {
      GameAudio.playClick();
      navigateTo('profile');
    });
    $('btn-reset').addEventListener('click', function () {
      if (confirm('确定要重置所有进度吗？此操作不可撤销！')) {
        GameStorage.resetAll();
        updateHome();
        showToast('进度已重置', 'info');
      }
    });

    $('toggle-sfx').addEventListener('click', function () {
      var settings = GameStorage.getSettings();
      settings.soundEnabled = !settings.soundEnabled;
      GameStorage.saveSettings(settings);
      GameAudio.setSfxEnabled(settings.soundEnabled);
      updateToggles();
    });
    $('toggle-music').addEventListener('click', function () {
      var settings = GameStorage.getSettings();
      settings.musicEnabled = !settings.musicEnabled;
      GameStorage.saveSettings(settings);
      GameAudio.setMusicEnabled(settings.musicEnabled);
      if (settings.musicEnabled) GameAudio.startMusic();
      updateToggles();
    });

    $('game-image-a').addEventListener('click', function (e) { handleGameClick(e, 'a'); });
    $('game-image-b').addEventListener('click', function (e) { handleGameClick(e, 'b'); });
    $('versus-image-a').addEventListener('click', function (e) { handleVersusClick(e, 'a'); });
    $('versus-image-b').addEventListener('click', function (e) { handleVersusClick(e, 'b'); });

    document.querySelectorAll('.leaderboard-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.leaderboard-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        renderLeaderboard(tab.dataset.tab);
      });
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('.btn') || e.target.closest('.mode-card') || e.target.closest('.versus-mode-card') || e.target.closest('.home-bottom-btn') || e.target.closest('.hint-btn')) {
        createRipple(e);
      }
    });

    document.addEventListener('click', function () {
      GameAudio.resume();
    }, { once: true });
  }

  function createRipple(e) {
    var btn = e.target.closest('.btn, .mode-card, .versus-mode-card, .home-bottom-btn, .hint-btn');
    if (!btn) return;
    var rect = btn.getBoundingClientRect();
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    var size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 600);
  }

  function updateHome() {
    var player = GameStorage.getPlayer();
    var $ = function (id) { return document.getElementById(id); };
    $('home-name').textContent = player.nickname;
    $('home-level').textContent = 'Lv.' + player.level;
    $('home-gold').textContent = player.gold;
    $('home-diamond').textContent = player.diamond;
    $('home-avatar').textContent = ['🎮', '🦊', '🐱', '🦁', '🐼', '🦄', '🐲', '🤖'][player.avatar || 0];
  }

  function updateToggles() {
    var settings = GameStorage.getSettings();
    var sfxToggle = document.getElementById('toggle-sfx');
    var musicToggle = document.getElementById('toggle-music');
    if (sfxToggle) {
      sfxToggle.classList.toggle('on', settings.soundEnabled);
    }
    if (musicToggle) {
      musicToggle.classList.toggle('on', settings.musicEnabled);
    }
  }

  function doDailyCheckin() {
    var result = GameStorage.checkDaily();
    if (result.alreadyChecked) {
      showToast('今日已签到', 'info');
      return;
    }
    GameAudio.playDailyCheckin();
    showModal('📅', '签到成功!', '连续签到 ' + result.streak + ' 天', [
      { icon: '💡', label: '提示 x' + result.hintsAdded },
      { icon: '🪙', label: '金币 +' + result.goldAdded }
    ]);
    updateHome();
  }

  function showToast(msg, type) {
    var toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast ' + (type || 'info');
    setTimeout(function () { toast.classList.add('show'); }, 10);
    setTimeout(function () { toast.classList.remove('show'); }, 2500);
  }

  function showModal(icon, title, desc, rewards) {
    var overlay = document.getElementById('modal-overlay');
    var content = document.getElementById('modal-content');
    var html = '<div class="modal-icon">' + icon + '</div>';
    html += '<div class="modal-title">' + title + '</div>';
    html += '<div class="modal-desc">' + desc + '</div>';
    if (rewards && rewards.length) {
      html += '<div class="modal-rewards">';
      rewards.forEach(function (r) {
        html += '<div class="modal-reward"><span class="modal-reward-icon">' + r.icon + '</span><span class="modal-reward-value">' + r.label + '</span></div>';
      });
      html += '</div>';
    }
    html += '<button class="btn btn-primary" onclick="document.getElementById(\'modal-overlay\').style.display=\'none\'">确定</button>';
    content.innerHTML = html;
    overlay.style.display = 'flex';
  }

  // ===== LEVEL SELECT =====
  function renderLevelSelect() {
    var adventure = GameStorage.getAdventure();
    var totalStars = GameStorage.getTotalStars();
    document.getElementById('total-stars').textContent = totalStars;

    var container = document.getElementById('level-path');
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.height = '900px';

    var levels = GameLevels.getAllLevels();
    var svgNS = 'http://www.w3.org/2000/svg';

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'level-path-svg');
    svg.setAttribute('viewBox', '0 0 500 900');
    svg.style.width = '100%';
    svg.style.height = '100%';

    var path = document.createElementNS(svgNS, 'path');
    var pathData = '';
    var positions = [];

    levels.forEach(function (level, i) {
      var row = Math.floor(i / 2);
      var col = i % 2 === 0 ? (row % 2 === 0 ? 100 : 400) : (row % 2 === 0 ? 400 : 100);
      var y = 80 + i * 80;
      positions.push({ x: col, y: y });
      if (i === 0) {
        pathData += 'M ' + col + ' ' + y;
      } else {
        var prev = positions[i - 1];
        var midY = (prev.y + y) / 2;
        pathData += ' C ' + prev.x + ' ' + midY + ', ' + col + ' ' + midY + ', ' + col + ' ' + y;
      }
    });

    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(0, 245, 255, 0.2)');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-dasharray', '8,8');
    svg.appendChild(path);
    container.appendChild(svg);

    levels.forEach(function (level, i) {
      var pos = positions[i];
      var lp = adventure.levels[level.id] || { stars: 0, completed: false, unlocked: false };
      var isCurrent = lp.unlocked && !lp.completed;

      var node = document.createElement('div');
      node.className = 'level-node';
      if (lp.completed) node.classList.add('completed');
      else if (isCurrent) node.classList.add('current', 'unlocked');
      else if (lp.unlocked) node.classList.add('unlocked');
      else node.classList.add('locked');

      node.style.left = pos.x + 'px';
      node.style.top = pos.y + 'px';

      if (lp.completed || lp.unlocked) {
        var starsStr = '';
        for (var s = 0; s < 3; s++) {
          starsStr += s < lp.stars ? '★' : '☆';
        }
        node.innerHTML = '<div class="level-node-inner"><span class="level-node-number">' + level.id + '</span><span class="level-node-stars">' + starsStr + '</span></div>';
        node.addEventListener('click', (function (lid) {
          return function () {
            GameAudio.playClick();
            startGame(lid);
          };
        })(level.id));
      } else {
        node.innerHTML = '<div class="level-node-inner"><span class="level-node-lock">🔒</span></div>';
      }

      container.appendChild(node);
    });
  }

  // ===== GAME LOGIC =====
  function startGame(levelId) {
    var levelData = GameLevels.generateLevel(levelId);
    if (!levelData) return;

    var player = GameStorage.getPlayer();
    gameState = {
      levelId: levelId,
      levelData: levelData,
      timeLeft: levelData.timeLimit,
      score: 0,
      combo: 0,
      maxCombo: 0,
      baseScore: 0,
      comboScore: 0,
      penaltyScore: 0,
      hintDeduct: 0,
      foundCount: 0,
      wrongCount: 0,
      paused: false,
      finished: false,
      hintCount: player.hintCount || 3,
      lastClickTime: Date.now(),
      autoHintShown: false,
      timer: null,
      hintTimer: null
    };

    document.getElementById('img-a').src = levelData.imageA;
    document.getElementById('img-b').src = levelData.imageB;
    document.getElementById('game-timer').textContent = levelData.timeLimit;
    document.getElementById('game-timer').classList.remove('warning');
    document.getElementById('game-level-info').textContent = '第 ' + levelId + ' 关 · ' + levelData.name;
    document.getElementById('game-score').textContent = '0';
    document.getElementById('game-combo').classList.remove('active');
    document.getElementById('hint-count').textContent = gameState.hintCount;
    document.getElementById('pause-overlay').style.display = 'none';

    clearMarkers('game-image-a');
    clearMarkers('game-image-b');

    navigateTo('game');
    startGameTimer();

    GameAudio.startMusic();
  }

  function startGameTimer() {
    if (gameState.timer) clearInterval(gameState.timer);
    gameState.timer = setInterval(function () {
      if (gameState.paused || gameState.finished) return;
      gameState.timeLeft--;
      var timerEl = document.getElementById('game-timer');
      timerEl.textContent = gameState.timeLeft;

      if (gameState.timeLeft <= 10) {
        timerEl.classList.add('warning');
        if (gameState.timeLeft > 0) GameAudio.playCountdown();
      }

      if (gameState.timeLeft <= 0) {
        finishGame();
      }

      var elapsed = (Date.now() - gameState.lastClickTime) / 1000;
      if (elapsed > 30 && !gameState.autoHintShown) {
        showAutoHint();
        gameState.autoHintShown = true;
      }
    }, 1000);
  }

  function handleGameClick(e, side) {
    if (!gameState || gameState.paused || gameState.finished) return;
    GameAudio.resume();

    var wrapper = document.getElementById('game-image-' + side);
    var img = wrapper.querySelector('img');
    var rect = img.getBoundingClientRect();

    var clickX = (e.clientX - rect.left) / rect.width * GameLevels.WIDTH;
    var clickY = (e.clientY - rect.top) / rect.height * GameLevels.HEIGHT;

    gameState.lastClickTime = Date.now();
    gameState.autoHintShown = false;

    var found = false;
    var diffs = gameState.levelData.differences;

    for (var i = 0; i < diffs.length; i++) {
      var d = diffs[i];
      if (d.found) continue;
      var dist = Math.sqrt(Math.pow(clickX - d.x, 2) + Math.pow(clickY - d.y, 2));
      if (dist <= d.radius * 1.2) {
        foundDiff(d, side, wrapper);
        found = true;
        break;
      }
    }

    if (!found) {
      wrongClick(side, wrapper, e.clientX - rect.left, e.clientY - rect.top);
    }
  }

  function foundDiff(diff, side, wrapper) {
    diff.found = true;
    gameState.combo++;
    if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo;
    gameState.foundCount++;

    var multiplier = diff.hinted ? 0 : (1 + gameState.combo * 0.1);
    var points = Math.round(100 * multiplier);
    if (diff.hinted) {
      gameState.hintDeduct += 100;
      points = 0;
    }
    gameState.score += points;
    gameState.baseScore += diff.hinted ? 0 : 100;
    gameState.comboScore += points - (diff.hinted ? 0 : 100);

    document.getElementById('game-score').textContent = gameState.score;

    var comboEl = document.getElementById('game-combo');
    if (gameState.combo >= 2) {
      comboEl.textContent = 'x' + gameState.combo + ' 连击';
      comboEl.classList.add('active');
      GameAudio.playCombo();
    }

    GameAudio.playFindDiff();

    var otherSide = side === 'a' ? 'b' : 'a';
    var otherWrapper = document.getElementById('game-image-' + otherSide);
    addDiffMarker(wrapper, diff);
    addDiffMarker(otherWrapper, diff);

    var img = wrapper.querySelector('img');
    var rect = img.getBoundingClientRect();
    var markerX = diff.x / GameLevels.WIDTH * rect.width;
    var markerY = diff.y / GameLevels.HEIGHT * rect.height;
    createParticleBurst(wrapper.querySelector('.particle-container'), markerX, markerY);

    if (points > 0) {
      showScoreFly(wrapper, markerX, markerY, '+' + points);
    }

    if (gameState.foundCount >= gameState.levelData.differences.length) {
      setTimeout(function () { finishGame(); }, 500);
    }
  }

  function addDiffMarker(wrapper, diff) {
    var img = wrapper.querySelector('img');
    var marker = document.createElement('div');
    marker.className = 'diff-marker';
    var size = diff.radius * 2;
    marker.style.width = size + 'px';
    marker.style.height = size + 'px';
    marker.style.left = 'calc(' + (diff.x / GameLevels.WIDTH * 100) + '% - ' + (size / 2) + 'px)';
    marker.style.top = 'calc(' + (diff.y / GameLevels.HEIGHT * 100) + '% - ' + (size / 2) + 'px)';
    wrapper.appendChild(marker);
  }

  function wrongClick(side, wrapper, px, py) {
    gameState.combo = 0;
    gameState.score = Math.max(0, gameState.score - 20);
    gameState.penaltyScore += 20;
    gameState.wrongCount++;
    gameState.timeLeft = Math.max(0, gameState.timeLeft - 3);

    document.getElementById('game-score').textContent = gameState.score;
    document.getElementById('game-combo').classList.remove('active');

    GameAudio.playWrongClick();

    var marker = document.createElement('div');
    marker.className = 'wrong-marker';
    marker.textContent = '✕';
    marker.style.left = (px - 14) + 'px';
    marker.style.top = (py - 14) + 'px';
    wrapper.appendChild(marker);
    setTimeout(function () { marker.remove(); }, 800);

    wrapper.classList.add('screen-shake');
    setTimeout(function () { wrapper.classList.remove('screen-shake'); }, 300);
  }

  function showScoreFly(wrapper, x, y, text) {
    var fly = document.createElement('div');
    fly.className = 'score-fly';
    fly.textContent = text;
    fly.style.left = x + 'px';
    fly.style.top = y + 'px';
    wrapper.appendChild(fly);
    setTimeout(function () { fly.remove(); }, 1000);
  }

  function createParticleBurst(container, x, y) {
    var colors = ['#00F5FF', '#A855F7', '#F472B6', '#39FF14', '#FFD700'];
    for (var i = 0; i < 20; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      var angle = (Math.PI * 2 * i) / 20;
      var dist = 30 + Math.random() * 50;
      var px = Math.cos(angle) * dist;
      var py = Math.sin(angle) * dist;
      p.style.setProperty('--px', px + 'px');
      p.style.setProperty('--py', py + 'px');
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.width = (3 + Math.random() * 4) + 'px';
      p.style.height = p.style.width;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(p);
      (function (el) {
        setTimeout(function () { el.remove(); }, 800);
      })(p);
    }
  }

  function clearMarkers(wrapperId) {
    var wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    var markers = wrapper.querySelectorAll('.diff-marker, .wrong-marker, .score-fly, .hint-arrow, .hint-highlight');
    markers.forEach(function (m) { m.remove(); });
    var containers = wrapper.querySelectorAll('.particle-container');
    containers.forEach(function (c) { c.innerHTML = ''; });
  }

  function useHint() {
    if (!gameState || gameState.finished || gameState.paused) return;
    if (gameState.hintCount <= 0) {
      showToast('提示次数不足', 'error');
      return;
    }

    var unfound = gameState.levelData.differences.filter(function (d) { return !d.found; });
    if (unfound.length === 0) return;

    gameState.hintCount--;
    document.getElementById('hint-count').textContent = gameState.hintCount;
    GameAudio.playHint();

    var diff = unfound[0];

    var wrapperA = document.getElementById('game-image-a');
    var wrapperB = document.getElementById('game-image-b');

    [wrapperA, wrapperB].forEach(function (wrapper) {
      var highlight = document.createElement('div');
      highlight.className = 'hint-highlight';
      var size = diff.radius * 3;
      highlight.style.width = size + 'px';
      highlight.style.height = size + 'px';
      highlight.style.left = 'calc(' + (diff.x / GameLevels.WIDTH * 100) + '% - ' + (size / 2) + 'px)';
      highlight.style.top = 'calc(' + (diff.y / GameLevels.HEIGHT * 100) + '% - ' + (size / 2) + 'px)';
      wrapper.appendChild(highlight);
      setTimeout(function () { highlight.remove(); }, 5000);
    });

    diff.hinted = true;

    var player = GameStorage.getPlayer();
    player.hintCount = gameState.hintCount;
    GameStorage.savePlayer(player);
  }

  function showAutoHint() {
    if (!gameState || gameState.finished) return;
    var unfound = gameState.levelData.differences.filter(function (d) { return !d.found; });
    if (unfound.length === 0) return;

    var diff = unfound[0];
    var wrapper = document.getElementById('game-image-b');
    var img = wrapper.querySelector('img');
    var rect = img.getBoundingClientRect();

    var arrow = document.createElement('div');
    arrow.className = 'hint-arrow';
    arrow.textContent = '👉';

    var dx = diff.x - GameLevels.WIDTH / 2;
    var dy = diff.y - GameLevels.HEIGHT / 2;

    if (Math.abs(dx) > Math.abs(dy)) {
      arrow.style.top = '50%';
      arrow.style.setProperty('--dx', dx > 0 ? '15px' : '-15px');
      arrow.style.setProperty('--dy', '0px');
      if (dx > 0) {
        arrow.style.right = '10px';
      } else {
        arrow.style.left = '10px';
      }
    } else {
      arrow.style.left = '50%';
      arrow.style.setProperty('--dx', '0px');
      arrow.style.setProperty('--dy', dy > 0 ? '15px' : '-15px');
      if (dy > 0) {
        arrow.style.bottom = '10px';
      } else {
        arrow.style.top = '10px';
      }
    }

    wrapper.appendChild(arrow);
    setTimeout(function () { arrow.remove(); }, 5000);
  }

  function togglePause() {
    if (!gameState || gameState.finished) return;
    gameState.paused = !gameState.paused;
    document.getElementById('pause-overlay').style.display = gameState.paused ? 'flex' : 'none';
  }

  function finishGame() {
    if (!gameState || gameState.finished) return;
    gameState.finished = true;
    if (gameState.timer) clearInterval(gameState.timer);

    GameAudio.stopMusic();

    var timeBonus = gameState.timeLeft * 5;
    var totalScore = gameState.score + timeBonus;
    var maxPossible = gameState.levelData.differences.length * 100 + gameState.levelData.timeLimit * 5;
    var percentage = maxPossible > 0 ? totalScore / maxPossible : 0;

    var stars = 0;
    if (percentage >= 0.8) stars = 3;
    else if (percentage >= 0.5) stars = 2;
    else if (percentage > 0) stars = 1;

    var completed = gameState.foundCount >= gameState.levelData.differences.length;

    GameStorage.saveLevelResult(gameState.levelId, totalScore, stars, completed);
    GameStorage.addLevelScore(gameState.levelId, GameStorage.getPlayer().nickname, totalScore);

    var player = GameStorage.getPlayer();
    player.totalGames = (player.totalGames || 0) + 1;
    player.gold = (player.gold || 0) + stars * 20;
    player.exp = (player.exp || 0) + totalScore;
    var newLevel = Math.floor(player.exp / 500) + 1;
    if (newLevel > player.level) player.level = newLevel;
    GameStorage.savePlayer(player);

    showResult(totalScore, stars, timeBonus, completed);
  }

  function endGame() {
    if (gameState) {
      gameState.finished = true;
      if (gameState.timer) clearInterval(gameState.timer);
    }
    GameAudio.stopMusic();
  }

  function showResult(totalScore, stars, timeBonus, completed) {
    navigateTo('result');

    var titleEl = document.getElementById('result-title');
    titleEl.textContent = completed ? '关卡完成!' : '时间耗尽!';

    document.getElementById('result-score').textContent = totalScore;
    document.getElementById('result-base').textContent = '+' + gameState.baseScore;
    document.getElementById('result-time').textContent = '+' + timeBonus;
    document.getElementById('result-combo').textContent = '+' + gameState.comboScore;
    document.getElementById('result-penalty').textContent = '-' + gameState.penaltyScore;
    document.getElementById('result-hint-deduct').textContent = '-' + gameState.hintDeduct;

    var starEls = document.querySelectorAll('.result-star');
    starEls.forEach(function (el, i) {
      el.classList.remove('earned', 'empty');
      if (i < stars) {
        setTimeout(function () {
          el.classList.add('earned');
          GameAudio.playStarAppear();
        }, 500 + i * 400);
      } else {
        setTimeout(function () {
          el.classList.add('empty');
        }, 500 + i * 400);
      }
    });

    if (completed) {
      GameAudio.playLevelComplete();
      createConfetti();
    }

    var nextBtn = document.getElementById('btn-next-level');
    if (gameState.levelId >= 10 || !completed) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = '';
    }
  }

  function createConfetti() {
    var container = document.getElementById('confetti-container');
    container.innerHTML = '';
    var colors = ['#00F5FF', '#A855F7', '#F472B6', '#39FF14', '#FFD700', '#FF5722', '#2196F3'];
    for (var i = 0; i < 50; i++) {
      var piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--duration', (2 + Math.random() * 3) + 's');
      piece.style.setProperty('--delay', (Math.random() * 2) + 's');
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);
    }
    setTimeout(function () { container.innerHTML = ''; }, 6000);
  }

  // ===== VERSUS MODE =====
  var AI_OPPONENTS = [
    { name: '小明', avatar: '🦊', elo: 1100, speed: 0.7, accuracy: 0.8 },
    { name: '小红', avatar: '🐱', elo: 1250, speed: 0.5, accuracy: 0.9 },
    { name: '小刚', avatar: '🦁', elo: 950, speed: 0.9, accuracy: 0.6 }
  ];

  function startVersusMatchmaking(mode) {
    navigateTo('versus-match');
    document.getElementById('matchmaking-view').style.display = '';
    document.getElementById('match-found-view').style.display = 'none';

    var matchTime = 3000 + Math.random() * 2000;
    setTimeout(function () {
      GameAudio.playMatchFound();
      document.getElementById('matchmaking-view').style.display = 'none';
      document.getElementById('match-found-view').style.display = '';

      var opponentsList = document.getElementById('opponents-list');
      opponentsList.innerHTML = '';

      var selectedOpponents = [];
      var shuffled = AI_OPPONENTS.slice().sort(function () { return Math.random() - 0.5; });
      var count = 2 + Math.floor(Math.random() * 2);
      for (var i = 0; i < Math.min(count, shuffled.length); i++) {
        selectedOpponents.push(Object.assign({}, shuffled[i]));
      }

      selectedOpponents.forEach(function (opp) {
        var card = document.createElement('div');
        card.className = 'opponent-card';
        card.innerHTML = '<div class="opponent-avatar">' + opp.avatar + '</div><div class="opponent-name">' + opp.name + '</div><div class="opponent-elo">ELO ' + opp.elo + '</div>';
        opponentsList.appendChild(card);
      });

      var countdown = 3;
      var countdownEl = document.getElementById('match-countdown');
      countdownEl.textContent = countdown;
      var cdTimer = setInterval(function () {
        countdown--;
        countdownEl.textContent = countdown;
        if (countdown <= 0) {
          clearInterval(cdTimer);
          startVersusGame(selectedOpponents);
        }
      }, 1000);
    }, matchTime);
  }

  function startVersusGame(opponents) {
    var levelId = Math.floor(Math.random() * 5) + 1;
    var levelData = GameLevels.generateLevel(levelId);
    if (!levelData) return;

    var player = GameStorage.getPlayer();

    versusState = {
      levelId: levelId,
      levelData: levelData,
      timeLeft: 90,
      score: 0,
      combo: 0,
      foundCount: 0,
      baseScore: 0,
      comboScore: 0,
      penaltyScore: 0,
      hintDeduct: 0,
      wrongCount: 0,
      finished: false,
      hintCount: player.hintCount || 3,
      opponents: opponents.map(function (opp) {
        return Object.assign({}, opp, {
          foundCount: 0,
          foundDiffs: [],
          finished: false
        });
      }),
      timer: null,
      aiTimers: []
    };

    document.getElementById('versus-img-a').src = levelData.imageA;
    document.getElementById('versus-img-b').src = levelData.imageB;
    document.getElementById('versus-timer').textContent = '90';
    document.getElementById('versus-timer').classList.remove('warning');
    document.getElementById('versus-level-info').textContent = '竞速对战 · ' + levelData.name;
    document.getElementById('versus-score').textContent = '0';
    document.getElementById('versus-combo').classList.remove('active');
    document.getElementById('versus-hint-count').textContent = versusState.hintCount;

    clearMarkers('versus-image-a');
    clearMarkers('versus-image-b');

    renderVersusSidebar();

    navigateTo('versus-game');

    versusState.timer = setInterval(function () {
      if (versusState.finished) return;
      versusState.timeLeft--;
      var timerEl = document.getElementById('versus-timer');
      timerEl.textContent = versusState.timeLeft;
      if (versusState.timeLeft <= 10) {
        timerEl.classList.add('warning');
        if (versusState.timeLeft > 0) GameAudio.playCountdown();
      }
      if (versusState.timeLeft <= 0) {
        finishVersusGame();
      }
    }, 1000);

    versusState.opponents.forEach(function (opp, idx) {
      var aiInterval = setInterval(function () {
        if (versusState.finished || opp.finished) return;
        var unfound = versusState.levelData.differences.filter(function (d) {
          return opp.foundDiffs.indexOf(d.id) === -1;
        });
        if (unfound.length === 0) {
          opp.finished = true;
          return;
        }
        var chance = opp.accuracy * (0.5 + Math.random() * 0.5);
        if (Math.random() < chance * opp.speed * 0.15) {
          var diff = unfound[Math.floor(Math.random() * unfound.length)];
          opp.foundCount++;
          opp.foundDiffs.push(diff.id);
          GameAudio.playVersusOpponent();
          renderVersusSidebar();
          flashOpponent(idx);
        }
      }, 1000);
      versusState.aiTimers.push(aiInterval);
    });
  }

  function renderVersusSidebar() {
    if (!versusState) return;
    var sidebar = document.getElementById('versus-sidebar');
    sidebar.innerHTML = '';
    versusState.opponents.forEach(function (opp) {
      var total = versusState.levelData.differences.length;
      var pct = total > 0 ? Math.round(opp.foundCount / total * 100) : 0;
      var item = document.createElement('div');
      item.className = 'versus-opponent-item';
      item.innerHTML = '<div class="versus-opp-header"><div class="versus-opp-avatar">' + opp.avatar + '</div><div class="versus-opp-name">' + opp.name + '</div><div class="versus-opp-found">' + opp.foundCount + '/' + total + '</div></div><div class="versus-opp-progress"><div class="versus-opp-progress-bar" style="width:' + pct + '%"></div></div>';
      sidebar.appendChild(item);
    });
  }

  function flashOpponent(idx) {
    var items = document.querySelectorAll('.versus-opponent-item');
    if (items[idx]) {
      items[idx].classList.add('flash');
      setTimeout(function () { items[idx].classList.remove('flash'); }, 500);
    }
  }

  function handleVersusClick(e, side) {
    if (!versusState || versusState.finished) return;
    GameAudio.resume();

    var wrapper = document.getElementById('versus-image-' + side);
    var img = wrapper.querySelector('img');
    var rect = img.getBoundingClientRect();

    var clickX = (e.clientX - rect.left) / rect.width * GameLevels.WIDTH;
    var clickY = (e.clientY - rect.top) / rect.height * GameLevels.HEIGHT;

    var found = false;
    var diffs = versusState.levelData.differences;

    for (var i = 0; i < diffs.length; i++) {
      var d = diffs[i];
      if (d.found) continue;
      var dist = Math.sqrt(Math.pow(clickX - d.x, 2) + Math.pow(clickY - d.y, 2));
      if (dist <= d.radius * 1.2) {
        d.found = true;
        versusState.combo++;
        versusState.foundCount++;
        var multiplier = d.hinted ? 0 : (1 + versusState.combo * 0.1);
        var points = Math.round(100 * multiplier);
        versusState.score += points;
        versusState.baseScore += d.hinted ? 0 : 100;
        versusState.comboScore += points - (d.hinted ? 0 : 100);

        document.getElementById('versus-score').textContent = versusState.score;

        var comboEl = document.getElementById('versus-combo');
        if (versusState.combo >= 2) {
          comboEl.textContent = 'x' + versusState.combo + ' 连击';
          comboEl.classList.add('active');
        }

        GameAudio.playFindDiff();

        var otherSide = side === 'a' ? 'b' : 'a';
        addDiffMarker(wrapper, d);
        addDiffMarker(document.getElementById('versus-image-' + otherSide), d);

        var imgRect = img.getBoundingClientRect();
        var markerX = d.x / GameLevels.WIDTH * imgRect.width;
        var markerY = d.y / GameLevels.HEIGHT * imgRect.height;
        createParticleBurst(wrapper.querySelector('.particle-container'), markerX, markerY);
        if (points > 0) showScoreFly(wrapper, markerX, markerY, '+' + points);

        found = true;
        break;
      }
    }

    if (!found) {
      versusState.combo = 0;
      versusState.score = Math.max(0, versusState.score - 20);
      versusState.penaltyScore += 20;
      versusState.wrongCount++;
      versusState.timeLeft = Math.max(0, versusState.timeLeft - 3);
      document.getElementById('versus-score').textContent = versusState.score;
      document.getElementById('versus-combo').classList.remove('active');
      GameAudio.playWrongClick();

      var px = e.clientX - rect.left;
      var py = e.clientY - rect.top;
      var marker = document.createElement('div');
      marker.className = 'wrong-marker';
      marker.textContent = '✕';
      marker.style.left = (px - 14) + 'px';
      marker.style.top = (py - 14) + 'px';
      wrapper.appendChild(marker);
      setTimeout(function () { marker.remove(); }, 800);
      wrapper.classList.add('screen-shake');
      setTimeout(function () { wrapper.classList.remove('screen-shake'); }, 300);
    }

    if (versusState.foundCount >= versusState.levelData.differences.length) {
      setTimeout(function () { finishVersusGame(); }, 500);
    }
  }

  function useVersusHint() {
    if (!versusState || versusState.finished) return;
    if (versusState.hintCount <= 0) {
      showToast('提示次数不足', 'error');
      return;
    }
    var unfound = versusState.levelData.differences.filter(function (d) { return !d.found; });
    if (unfound.length === 0) return;

    versusState.hintCount--;
    document.getElementById('versus-hint-count').textContent = versusState.hintCount;
    GameAudio.playHint();

    var diff = unfound[0];
    diff.hinted = true;

    ['versus-image-a', 'versus-image-b'].forEach(function (wid) {
      var wrapper = document.getElementById(wid);
      var highlight = document.createElement('div');
      highlight.className = 'hint-highlight';
      var size = diff.radius * 3;
      highlight.style.width = size + 'px';
      highlight.style.height = size + 'px';
      highlight.style.left = 'calc(' + (diff.x / GameLevels.WIDTH * 100) + '% - ' + (size / 2) + 'px)';
      highlight.style.top = 'calc(' + (diff.y / GameLevels.HEIGHT * 100) + '% - ' + (size / 2) + 'px)';
      wrapper.appendChild(highlight);
      setTimeout(function () { highlight.remove(); }, 5000);
    });

    var player = GameStorage.getPlayer();
    player.hintCount = versusState.hintCount;
    GameStorage.savePlayer(player);
  }

  function finishVersusGame() {
    if (!versusState || versusState.finished) return;
    versusState.finished = true;
    if (versusState.timer) clearInterval(versusState.timer);
    versusState.aiTimers.forEach(function (t) { clearInterval(t); });
    GameAudio.stopMusic();

    var timeBonus = versusState.timeLeft * 5;
    var totalScore = versusState.score + timeBonus;

    var rankings = versusState.opponents.map(function (opp) {
      return { name: opp.name, avatar: opp.avatar, score: opp.foundCount * 100, isPlayer: false };
    });
    rankings.push({ name: GameStorage.getPlayer().nickname, avatar: '🎮', score: totalScore, isPlayer: true });
    rankings.sort(function (a, b) { return b.score - a.score; });

    var playerRank = rankings.findIndex(function (r) { return r.isPlayer; }) + 1;
    var player = GameStorage.getPlayer();
    player.totalGames = (player.totalGames || 0) + 1;

    var eloChange = 0;
    if (playerRank === 1) {
      eloChange = 25;
      player.winCount = (player.winCount || 0) + 1;
    } else if (playerRank === 2) {
      eloChange = 0;
    } else {
      eloChange = -15;
    }
    player.eloRating = Math.max(0, (player.eloRating || 1000) + eloChange);
    player.gold = (player.gold || 0) + Math.max(0, 30 - (playerRank - 1) * 10);
    GameStorage.savePlayer(player);

    var maxPossible = versusState.levelData.differences.length * 100 + 90 * 5;
    var percentage = maxPossible > 0 ? totalScore / maxPossible : 0;
    var stars = 0;
    if (percentage >= 0.8) stars = 3;
    else if (percentage >= 0.5) stars = 2;
    else if (percentage > 0) stars = 1;

    GameStorage.saveLevelResult(versusState.levelId, totalScore, stars, versusState.foundCount >= versusState.levelData.differences.length);

    gameState = versusState;
    gameState.baseScore = versusState.baseScore;
    gameState.comboScore = versusState.comboScore;
    gameState.penaltyScore = versusState.penaltyScore;
    gameState.hintDeduct = versusState.hintDeduct;

    navigateTo('result');

    var titleEl = document.getElementById('result-title');
    titleEl.textContent = playerRank === 1 ? '🏆 对战胜利!' : '对战结束 · 第' + playerRank + '名';

    document.getElementById('result-score').textContent = totalScore;
    document.getElementById('result-base').textContent = '+' + versusState.baseScore;
    document.getElementById('result-time').textContent = '+' + timeBonus;
    document.getElementById('result-combo').textContent = '+' + versusState.comboScore;
    document.getElementById('result-penalty').textContent = '-' + versusState.penaltyScore;
    document.getElementById('result-hint-deduct').textContent = '-' + versusState.hintDeduct;

    var starEls = document.querySelectorAll('.result-star');
    starEls.forEach(function (el, i) {
      el.classList.remove('earned', 'empty');
      if (i < stars) {
        setTimeout(function () { el.classList.add('earned'); GameAudio.playStarAppear(); }, 500 + i * 400);
      } else {
        setTimeout(function () { el.classList.add('empty'); }, 500 + i * 400);
      }
    });

    if (playerRank === 1) {
      GameAudio.playLevelComplete();
      createConfetti();
    }

    document.getElementById('btn-next-level').style.display = 'none';

    var eloText = eloChange >= 0 ? '+' + eloChange : eloChange;
    showToast('ELO ' + eloText, eloChange >= 0 ? 'success' : 'error');
  }

  // ===== LEADERBOARD =====
  function renderLeaderboard(tab) {
    tab = tab || 'level';
    var list = document.getElementById('leaderboard-list');
    list.innerHTML = '';

    if (tab === 'level') {
      var lb = GameStorage.getLeaderboard();
      var allScores = [];
      for (var lid in lb.levelRankings) {
        if (lb.levelRankings.hasOwnProperty(lid)) {
          lb.levelRankings[lid].forEach(function (entry) {
            allScores.push({ name: entry.nickname, score: entry.score, level: lid });
          });
        }
      }
      allScores.sort(function (a, b) { return b.score - a.score; });
      allScores = allScores.slice(0, 20);

      if (allScores.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px;">暂无数据，完成关卡后显示</div>';
        return;
      }

      allScores.forEach(function (entry, i) {
        var rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        var item = document.createElement('div');
        item.className = 'leaderboard-item' + (i < 3 ? ' top' + (i + 1) : '');
        item.innerHTML = '<div class="leaderboard-rank ' + rankClass + '">' + (i + 1) + '</div><div class="leaderboard-avatar">🎮</div><div class="leaderboard-name">' + entry.name + ' <span style="font-size:11px;color:var(--text-muted)">第' + entry.level + '关</span></div><div class="leaderboard-score">' + entry.score + '</div>';
        list.appendChild(item);
      });
    } else {
      var player = GameStorage.getPlayer();
      var fakePlayers = [
        { name: '高手玩家', elo: 2800 },
        { name: '找不同大师', elo: 2400 },
        { name: '眼力王者', elo: 2100 },
        { name: '极速猎人', elo: 1800 },
        { name: '细心观察', elo: 1500 }
      ];
      fakePlayers.push({ name: player.nickname, elo: player.eloRating || 1000 });
      fakePlayers.sort(function (a, b) { return b.elo - a.elo; });

      fakePlayers.forEach(function (entry, i) {
        var rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        var isMe = entry.name === player.nickname;
        var item = document.createElement('div');
        item.className = 'leaderboard-item' + (i < 3 ? ' top' + (i + 1) : '');
        if (isMe) item.style.borderColor = 'rgba(0, 245, 255, 0.4)';
        item.innerHTML = '<div class="leaderboard-rank ' + rankClass + '">' + (i + 1) + '</div><div class="leaderboard-avatar">' + (isMe ? '🎮' : '🦊') + '</div><div class="leaderboard-name">' + entry.name + (isMe ? ' (我)' : '') + '</div><div class="leaderboard-score">' + entry.elo + '</div>';
        list.appendChild(item);
      });
    }
  }

  // ===== PROFILE =====
  function renderProfile() {
    var player = GameStorage.getPlayer();
    var adventure = GameStorage.getAdventure();
    document.getElementById('profile-avatar').textContent = ['🎮', '🦊', '🐱', '🦁', '🐼', '🦄', '🐲', '🤖'][player.avatar || 0];
    document.getElementById('profile-name').textContent = player.nickname;
    document.getElementById('profile-elo').textContent = 'ELO: ' + (player.eloRating || 1000) + ' ' + getEloTier(player.eloRating || 1000).emoji;

    var totalStars = GameStorage.getTotalStars();
    var completedLevels = 0;
    for (var k in adventure.levels) {
      if (adventure.levels.hasOwnProperty(k) && adventure.levels[k].completed) completedLevels++;
    }

    var stats = document.getElementById('profile-stats');
    stats.innerHTML = '';
    var statItems = [
      { value: player.level || 1, label: '等级' },
      { value: totalStars, label: '总星数' },
      { value: completedLevels, label: '通关数' },
      { value: player.totalGames || 0, label: '总对局' },
      { value: player.winCount || 0, label: '胜利数' },
      { value: player.gold || 0, label: '金币' }
    ];

    statItems.forEach(function (s) {
      var card = document.createElement('div');
      card.className = 'profile-stat-card';
      card.innerHTML = '<div class="profile-stat-value">' + s.value + '</div><div class="profile-stat-label">' + s.label + '</div>';
      stats.appendChild(card);
    });
  }

  function getEloTier(elo) {
    if (elo >= 5000) return { name: '大师', emoji: '🏆', class: 'master' };
    if (elo >= 4000) return { name: '钻石', emoji: '👑', class: 'diamond' };
    if (elo >= 3000) return { name: '铂金', emoji: '💎', class: 'platinum' };
    if (elo >= 2000) return { name: '黄金', emoji: '🥇', class: 'gold' };
    if (elo >= 1000) return { name: '白银', emoji: '🥈', class: 'silver' };
    return { name: '青铜', emoji: '🥉', class: 'bronze' };
  }

  // ===== PARTICLE BACKGROUND =====
  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    var ctx = canvas.getContext('2d');
    var maxParticles = 40;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.3,
        color: ['rgba(0,245,255,', 'rgba(168,85,247,', 'rgba(244,114,182,'][Math.floor(Math.random() * 3)]
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var grad = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.3, 0,
        canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.6
      );
      grad.addColorStop(0, 'rgba(0, 245, 255, 0.03)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.02)');
      grad.addColorStop(1, 'rgba(244, 114, 182, 0.01)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.strokeStyle = 'rgba(0, 245, 255, ' + (0.05 * (1 - dist / 150)) + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particleAnimId = requestAnimationFrame(animate);
    }

    animate();
  }

  return {
    init: init,
    navigateTo: navigateTo
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  GameApp.init();
});
