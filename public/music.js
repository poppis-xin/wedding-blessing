(function () {
  const audio = document.getElementById('bgMusic');
  const isEmbeddedPage = window.self !== window.top;

  const KEYS = {
    started: 'bgMusicStarted',
    playing: 'bgMusicPlaying',
    time: 'bgMusicTime'
  };

  if (!audio) return;

  audio.preload = 'auto';

  // welcome 会作为持久音频外壳；iframe 内页面保留 audio 标签但不主动播放，避免双声道叠加。
  if (isEmbeddedPage) {
    audio.pause();
    let notified = false;

    function notifyParent() {
      if (notified) return;
      notified = true;
      try {
        window.parent.postMessage({ type: 'music-gesture' }, '*');
      } catch (err) {}
    }

    document.addEventListener('pointerdown', notifyParent, { once: true, capture: true, passive: true });
    document.addEventListener('touchstart', notifyParent, { once: true, capture: true, passive: true });
    document.addEventListener('click', notifyParent, { once: true, capture: true });
    document.addEventListener('keydown', notifyParent, { once: true, capture: true });

    window.WeddingMusic = {
      start: () => Promise.resolve(),
      save: () => {},
      isPlaying: () => false
    };

    document.addEventListener('click', (event) => {
      const link = event.target.closest && event.target.closest('a[href]');
      if (!link) return;
      const target = link.getAttribute('href');
      if (!target) return;
      const normalized = target === '/write.html' ? '/write' : target === '/all-blessings.html' ? '/all-blessings' : target;
      if (normalized === '#' || normalized.startsWith('javascript:')) return;
      if (normalized === '/write' || normalized === '/all-blessings' || normalized === '/' || normalized === '/welcome') {
        event.preventDefault();
        notifyParent();
        try {
          window.parent.postMessage({ type: 'navigate-shell', href: normalized }, '*');
        } catch (err) {}
      }
    }, true);

    return;
  }

  let unlockBound = false;

  function getSavedTime() {
    const value = parseFloat(localStorage.getItem(KEYS.time) || '0');
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function markMusicIntent() {
    localStorage.setItem(KEYS.started, 'true');
    localStorage.setItem(KEYS.playing, 'true');
  }

  function restoreTime() {
    const savedTime = getSavedTime();
    if (!savedTime) return;

    const apply = () => {
      try {
        if (Math.abs(audio.currentTime - savedTime) > 0.6) {
          audio.currentTime = savedTime;
        }
      } catch (err) {
        // iOS Safari 偶尔会在 metadata 未就绪时拒绝设置 currentTime，下一次播放会继续重试。
      }
    };

    if (audio.readyState >= 1) {
      apply();
    } else {
      audio.addEventListener('loadedmetadata', apply, { once: true });
    }
  }

  function saveMusicState(forcePlaying) {
    try {
      if (Number.isFinite(audio.currentTime)) {
        localStorage.setItem(KEYS.time, audio.currentTime.toString());
      }
      if (forcePlaying || !audio.paused) {
        markMusicIntent();
      }
    } catch (err) {}
  }

  function removeUnlockListeners() {
    if (!unlockBound) return;
    unlockBound = false;
    document.removeEventListener('pointerdown', handleUnlockGesture, true);
    document.removeEventListener('touchstart', handleUnlockGesture, true);
    document.removeEventListener('click', handleUnlockGesture, true);
    document.removeEventListener('keydown', handleUnlockGesture, true);
  }

  function bindUnlockListeners() {
    if (unlockBound) return;
    unlockBound = true;
    document.addEventListener('pointerdown', handleUnlockGesture, { capture: true, passive: true });
    document.addEventListener('touchstart', handleUnlockGesture, { capture: true, passive: true });
    document.addEventListener('click', handleUnlockGesture, true);
    document.addEventListener('keydown', handleUnlockGesture, true);
  }

  function playMusic(markIntent) {
    if (markIntent) markMusicIntent();
    restoreTime();

    const playPromise = audio.play();
    if (!playPromise || typeof playPromise.then !== 'function') {
      saveMusicState(true);
      removeUnlockListeners();
      return Promise.resolve();
    }

    return playPromise
      .then(() => {
        saveMusicState(true);
        removeUnlockListeners();
      })
      .catch(() => {
        bindUnlockListeners();
      });
  }

  function handleUnlockGesture() {
    playMusic(true);
  }

  audio.addEventListener('play', () => saveMusicState(true));
  audio.addEventListener('timeupdate', () => saveMusicState(false));

  document.addEventListener('click', (event) => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    const target = link.getAttribute('target');
    if (target && target !== '_self') return;
    saveMusicState(true);
  }, true);

  window.addEventListener('pagehide', () => saveMusicState(true));
  window.addEventListener('beforeunload', () => saveMusicState(true));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveMusicState(true);
  });

  window.WeddingMusic = {
    start: () => playMusic(true),
    save: () => saveMusicState(true),
    isPlaying: () => !audio.paused
  };

  window.addEventListener('message', (event) => {
    if (!event.data || event.data.type !== 'music-gesture') return;
    playMusic(true);
  });

  if (
    localStorage.getItem(KEYS.started) === 'true' ||
    localStorage.getItem(KEYS.playing) === 'true'
  ) {
    playMusic(false);
  }

  bindUnlockListeners();
})();
