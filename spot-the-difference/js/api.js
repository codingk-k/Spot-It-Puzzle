window.GameAPI = (function() {
  var BASE_URL = 'http://localhost:8080/api';
  var token = null;

  function setToken(t) { token = t; localStorage.setItem('jwt_token', t); }
  function getToken() { return token || localStorage.getItem('jwt_token'); }
  function clearToken() { token = null; localStorage.removeItem('jwt_token'); }

  function request(method, path, data) {
    var headers = { 'Content-Type': 'application/json' };
    var t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, BASE_URL + path, true);
      xhr.timeout = 5000;
      Object.keys(headers).forEach(function(k) { xhr.setRequestHeader(k, headers[k]); });
      xhr.onload = function() {
        if (xhr.status === 401) { clearToken(); reject({code:401,message:'未授权'}); return; }
        try {
          var resp = JSON.parse(xhr.responseText);
          if (resp.code === 200 || resp.code === 0) resolve(resp.data);
          else reject(resp);
        } catch(e) { reject({code:xhr.status,message:xhr.statusText}); }
      };
      xhr.onerror = function() { reject({code:0,message:'无法连接服务器'}); };
      xhr.ontimeout = function() { reject({code:0,message:'连接超时'}); };
      xhr.send(data ? JSON.stringify(data) : null);
    });
  }

  function register(username, password, nickname) { return request('POST', '/auth/register', {username:username,password:password,nickname:nickname||username}); }
  function login(username, password) { return request('POST', '/auth/login', {username:username,password:password}); }
  function refreshToken() { return request('POST', '/auth/refresh'); }

  function getChapters() { return request('GET', '/adventure/chapters'); }
  function getChapterLevels(chapterId) { return request('GET', '/adventure/chapters/' + chapterId + '/levels'); }
  function getLevelDetail(levelId) { return request('GET', '/adventure/levels/' + levelId); }

  function startLevel(levelId) { return request('POST', '/adventure/levels/' + levelId + '/start'); }
  function checkClick(levelId, clickX, clickY) { return request('POST', '/adventure/levels/' + levelId + '/check', {clickX:clickX, clickY:clickY}); }
  function completeLevel(levelId, timeUsed, hintsUsed) { return request('POST', '/adventure/levels/' + levelId + '/complete', {timeUsed:timeUsed, hintsUsed:hintsUsed}); }
  function getProgress() { return request('GET', '/adventure/progress'); }

  function getProfile() { return request('GET', '/player/profile'); }
  function updateProfile(data) { return request('PUT', '/player/profile', data); }
  function getPlayerStats() { return request('GET', '/player/stats'); }

  function getLeaderboard(levelId) { return request('GET', '/versus/leaderboard/' + (levelId||'')); }
  function getRankInfo() { return request('GET', '/versus/rank'); }
  function startAsyncChallenge(difficulty) { return request('POST', '/versus/async/start', {difficulty:difficulty}); }
  function submitAsyncChallenge(data) { return request('POST', '/versus/async/submit', data); }

  function trackEvent(eventType, eventData) { return request('POST', '/events', {eventType:eventType, eventData:JSON.stringify(eventData)}); }

  function isLoggedIn() { return !!getToken(); }

  return {
    setToken: setToken, getToken: getToken, clearToken: clearToken,
    register: register, login: login, refreshToken: refreshToken,
    getChapters: getChapters, getChapterLevels: getChapterLevels, getLevelDetail: getLevelDetail,
    startLevel: startLevel, checkClick: checkClick, completeLevel: completeLevel, getProgress: getProgress,
    getProfile: getProfile, updateProfile: updateProfile, getPlayerStats: getPlayerStats,
    getLeaderboard: getLeaderboard, getRankInfo: getRankInfo,
    startAsyncChallenge: startAsyncChallenge, submitAsyncChallenge: submitAsyncChallenge,
    trackEvent: trackEvent, isLoggedIn: isLoggedIn,
    BASE_URL: BASE_URL
  };
})();
