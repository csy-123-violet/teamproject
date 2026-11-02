/* ============================================================
   01 专注番茄钟  ·  负责人：cmsq
   ------------------------------------------------------------
   三个模式：专注 25 分钟 / 短休 5 分钟 / 长休 15 分钟。
   做法说明（展示时可以直接讲）：
     · 不用 setInterval 递减秒数（会越走越不准），而是记下"结束时刻 endAt"，
       每次刷新都用 Date.now() 倒算剩余时间，所以浏览器卡顿也不会走偏。
     · 圆环进度用 SVG 的 stroke-dashoffset 控制：周长固定，
       剩下多少比例就把虚线的偏移量调多少。
     · 完成的番茄数存在 localStorage 里，刷新页面不会清零。
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'campus-kit:pomodoro-done';
  var CIRC = 2 * Math.PI * 88;            // 圆环周长（半径 88，见 index.html 的 svg）
  var TICK_MS = 200;                      // 每 200ms 刷新一次显示

  var $ = function (id) { return document.getElementById(id); };

  var ringBox = document.querySelector('.timer-ring');
  var ringFg = document.querySelector('.ring-fg');
  var timeEl = $('timer-time');
  var stateEl = $('timer-state');
  var startBtn = $('btn-timer-start');
  var resetBtn = $('btn-timer-reset');
  var doneEl = $('timer-done');

  var MODE_COLOR = {
    focus: 'var(--accent)',
    short: 'var(--ok)',
    long: 'var(--warn)'
  };

  var mode = 'focus';        // focus | short | long
  var totalSec = 25 * 60;    // 当前模式总时长
  var remainSec = totalSec;  // 剩余秒数
  var endAt = 0;             // 结束时刻（毫秒时间戳）
  var timerId = null;
  var running = false;
  var doneCount = loadDone();
  var audioCtx = null;

  /* ---------------- 初始化 ---------------- */

  ringFg.style.strokeDasharray = CIRC.toFixed(2);
  ringFg.style.stroke = MODE_COLOR[mode];
  doneEl.textContent = doneCount;
  render();

  /* ---------------- 事件 ---------------- */

  var tabs = document.querySelectorAll('.mode-tab');
  Array.prototype.forEach.call(tabs, function (tab) {
    tab.addEventListener('click', function () {
      setMode(tab.dataset.mode, parseInt(tab.dataset.min, 10), tab);
    });
  });

  startBtn.addEventListener('click', function () {
    if (running) {
      pause();
    } else {
      start();
    }
  });

  resetBtn.addEventListener('click', reset);

  // 键盘快捷键：空格 = 开始/暂停，R = 重置。
  // 焦点在输入框或按钮上时不拦截，否则会抢掉别人正常打字/按按钮的操作。
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' ||
              t.tagName === 'BUTTON' || t.isContentEditable)) {
      return;
    }
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (running) { pause(); } else { start(); }
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      reset();
    }
  });

  /* ---------------- 核心逻辑 ---------------- */

  function setMode(nextMode, minutes, tabEl) {
    stopTimer();
    mode = nextMode;
    totalSec = minutes * 60;
    remainSec = totalSec;
    running = false;
    ringBox.classList.remove('is-done', 'is-running');
    ringFg.style.stroke = MODE_COLOR[mode];
    startBtn.textContent = '开始';
    setState(mode === 'focus' ? '准备专注' : '准备休息');
    Array.prototype.forEach.call(tabs, function (t) { t.classList.remove('is-active'); });
    if (tabEl) { tabEl.classList.add('is-active'); }
    updateTitle();
    render();
  }

  function start() {
    if (remainSec <= 0) { remainSec = totalSec; }   // 上一轮已走完，重新来一轮
    endAt = Date.now() + remainSec * 1000;
    running = true;
    ringBox.classList.remove('is-done');
    ringBox.classList.add('is-running');
    startBtn.textContent = '暂停';
    setState(mode === 'focus' ? '专注中…' : '休息中…');
    ensureAudio();                                   // 首次点击时解锁音频
    clearInterval(timerId);
    timerId = setInterval(tick, TICK_MS);
    tick();
  }

  function pause() {
    if (!running) { return; }
    // 暂停前先把真实剩余时间结算进 remainSec，否则会丢掉这不到 1 秒的零头
    remainSec = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    stopTimer();
    running = false;
    ringBox.classList.remove('is-running');
    startBtn.textContent = '继续';
    setState('已暂停');
    updateTitle();
    render();
  }

  function reset() {
    stopTimer();
    running = false;
    remainSec = totalSec;
    ringBox.classList.remove('is-running', 'is-done');
    startBtn.textContent = '开始';
    setState(mode === 'focus' ? '准备专注' : '准备休息');
    updateTitle();
    render();
  }

  function stopTimer() {
    clearInterval(timerId);
    timerId = null;
  }

  function tick() {
    remainSec = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    render();
    updateTitle();
    if (remainSec <= 0) { finish(); }
  }

  function finish() {
    stopTimer();
    running = false;
    remainSec = 0;
    ringBox.classList.remove('is-running');
    ringBox.classList.add('is-done');
    startBtn.textContent = '开始';
    render();

    if (mode === 'focus') {
      doneCount += 1;
      saveDone(doneCount);
      doneEl.textContent = doneCount;
      setState('时间到！去休息一下');
    } else {
      setState('休息结束，继续加油');
    }

    flashScreen();
    beep();
    updateTitle(true);
  }

  /* ---------------- 显示 ---------------- */

  function render() {
    timeEl.textContent = format(remainSec);
    var ratio = totalSec > 0 ? remainSec / totalSec : 0;
    ringFg.style.strokeDashoffset = (CIRC * (1 - ratio)).toFixed(2);
  }

  function setState(text) { stateEl.textContent = text; }

  function format(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function updateTitle(justDone) {
    var base = '校园工具箱 · Campus Kit';
    if (running) {
      document.title = format(remainSec) + ' · 专注中';
    } else if (justDone) {
      document.title = '⏰ 时间到！';
      setTimeout(function () { document.title = base; }, 4000);
    } else {
      document.title = base;
    }
  }

  function flashScreen() {
    var card = document.getElementById('card-timer');
    if (!card) { return; }
    card.animate(
      [
        { boxShadow: '0 0 0 0 rgba(79,70,229,.55)' },
        { boxShadow: '0 0 0 14px rgba(79,70,229,0)' }
      ],
      { duration: 900, iterations: 3, easing: 'ease-out' }
    );
  }

  /* ---------------- 提示音 ---------------- */

  function ensureAudio() {
    if (audioCtx) { return; }
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) { return; }
    try { audioCtx = new Ctor(); } catch (e) { audioCtx = null; }
  }

  function beep() {
    if (!audioCtx) { return; }
    var now = audioCtx.currentTime;
    for (var i = 0; i < 3; i++) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      var t = now + i * 0.45;
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    }
  }

  /* ---------------- 本地存储 ---------------- */

  function loadDone() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var n = parseInt(raw, 10);
      return isNaN(n) || n < 0 ? 0 : n;
    } catch (e) {
      return 0;
    }
  }

  function saveDone(n) {
    try { localStorage.setItem(STORAGE_KEY, String(n)); } catch (e) { /* 隐私模式忽略 */ }
  }
})();
