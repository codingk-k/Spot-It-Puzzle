window.GameAudio = (function () {
  var ctx = null;
  var masterGain = null;
  var musicGain = null;
  var sfxGain = null;
  var musicEnabled = true;
  var sfxEnabled = true;
  var currentMusic = null;

  function init() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = 0.5;

      musicGain = ctx.createGain();
      musicGain.connect(masterGain);
      musicGain.gain.value = 0.3;

      sfxGain = ctx.createGain();
      sfxGain.connect(masterGain);
      sfxGain.gain.value = 0.7;
    } catch (e) { }
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function _playTone(freq, duration, type, gainNode, volume, detune) {
    if (!ctx || !sfxEnabled) return;
    resume();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    gain.gain.value = volume || 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(gainNode || sfxGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  function _playNoise(duration, gainNode, volume) {
    if (!ctx || !sfxEnabled) return;
    resume();
    var bufferSize = ctx.sampleRate * duration;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    var gain = ctx.createGain();
    gain.gain.value = volume || 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    var filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(gainNode || sfxGain);
    source.start(ctx.currentTime);
  }

  function playClick() {
    _playTone(800, 0.08, 'sine', sfxGain, 0.15);
    _playTone(1200, 0.05, 'sine', sfxGain, 0.1);
  }

  function playFindDiff() {
    _playTone(523, 0.1, 'sine', sfxGain, 0.3);
    setTimeout(function () { _playTone(659, 0.1, 'sine', sfxGain, 0.3); }, 80);
    setTimeout(function () { _playTone(784, 0.15, 'sine', sfxGain, 0.35); }, 160);
    setTimeout(function () { _playTone(1047, 0.2, 'sine', sfxGain, 0.25); }, 240);
  }

  function playWrongClick() {
    _playTone(200, 0.15, 'sawtooth', sfxGain, 0.15);
    _playTone(150, 0.2, 'sawtooth', sfxGain, 0.1);
  }

  function playCountdown() {
    _playTone(880, 0.1, 'square', sfxGain, 0.15);
  }

  function playLevelComplete() {
    var notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach(function (n, i) {
      setTimeout(function () {
        _playTone(n, 0.2, 'sine', sfxGain, 0.3);
      }, i * 120);
    });
  }

  function playStarAppear() {
    _playTone(1047, 0.15, 'sine', sfxGain, 0.25);
    _playTone(1319, 0.2, 'sine', sfxGain, 0.2);
  }

  function playHint() {
    _playTone(440, 0.1, 'triangle', sfxGain, 0.2);
    setTimeout(function () { _playTone(660, 0.15, 'triangle', sfxGain, 0.2); }, 100);
  }

  function playMatchFound() {
    _playTone(440, 0.1, 'sine', sfxGain, 0.2);
    setTimeout(function () { _playTone(554, 0.1, 'sine', sfxGain, 0.2); }, 100);
    setTimeout(function () { _playTone(659, 0.1, 'sine', sfxGain, 0.2); }, 200);
    setTimeout(function () { _playTone(880, 0.2, 'sine', sfxGain, 0.3); }, 300);
  }

  function playCombo() {
    _playTone(784, 0.08, 'sine', sfxGain, 0.2);
    _playTone(988, 0.08, 'sine', sfxGain, 0.2);
    _playTone(1175, 0.12, 'sine', sfxGain, 0.25);
  }

  function playVersusOpponent() {
    _playTone(330, 0.1, 'triangle', sfxGain, 0.15);
    _playTone(440, 0.15, 'triangle', sfxGain, 0.15);
  }

  function playDailyCheckin() {
    var notes = [523, 659, 784, 1047];
    notes.forEach(function (n, i) {
      setTimeout(function () {
        _playTone(n, 0.15, 'sine', sfxGain, 0.25);
      }, i * 100);
    });
  }

  function startMusic() {
    if (!ctx || !musicEnabled || currentMusic) return;
    resume();
    var playLoop = function () {
      if (!musicEnabled) { currentMusic = null; return; }
      var baseNote = 220;
      var scale = [0, 3, 5, 7, 10, 12, 15, 17];
      var step = 0;
      var interval = setInterval(function () {
        if (!musicEnabled) {
          clearInterval(interval);
          currentMusic = null;
          return;
        }
        var noteIdx = scale[step % scale.length];
        var freq = baseNote * Math.pow(2, noteIdx / 12);
        _playTone(freq, 0.4, 'sine', musicGain, 0.08);
        if (step % 4 === 0) {
          _playTone(freq / 2, 0.6, 'triangle', musicGain, 0.04);
        }
        step++;
      }, 500);
      currentMusic = interval;
    };
    playLoop();
  }

  function stopMusic() {
    if (currentMusic) {
      clearInterval(currentMusic);
      currentMusic = null;
    }
  }

  function setMusicEnabled(enabled) {
    musicEnabled = enabled;
    if (!enabled) stopMusic();
  }

  function setSfxEnabled(enabled) {
    sfxEnabled = enabled;
  }

  function isMusicEnabled() { return musicEnabled; }
  function isSfxEnabled() { return sfxEnabled; }

  return {
    init: init,
    resume: resume,
    playClick: playClick,
    playFindDiff: playFindDiff,
    playWrongClick: playWrongClick,
    playCountdown: playCountdown,
    playLevelComplete: playLevelComplete,
    playStarAppear: playStarAppear,
    playHint: playHint,
    playMatchFound: playMatchFound,
    playCombo: playCombo,
    playVersusOpponent: playVersusOpponent,
    playDailyCheckin: playDailyCheckin,
    startMusic: startMusic,
    stopMusic: stopMusic,
    setMusicEnabled: setMusicEnabled,
    setSfxEnabled: setSfxEnabled,
    isMusicEnabled: isMusicEnabled,
    isSfxEnabled: isSfxEnabled
  };
})();
