const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer:fine)').matches;
const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add('in'); revealObserver.unobserve(entry.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

const sceneObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) document.body.dataset.scene = entry.target.dataset.scene;
}), { threshold: 0.45 });
document.querySelectorAll('.scene').forEach((scene) => sceneObserver.observe(scene));

const meter = document.querySelector('.scroll-meter span');
const depthItems = document.querySelectorAll('[data-depth]');
let scrollRatio = 0;
function updateScroll() {
  const available = document.documentElement.scrollHeight - innerHeight;
  scrollRatio = available ? scrollY / available : 0;
  meter.style.height = `${scrollRatio * 100}%`;
  if (!reduceMotion) depthItems.forEach((item) => { item.style.transform = `translate3d(0,${scrollY * Number(item.dataset.depth)}px,0)`; });
}
addEventListener('scroll', updateScroll, { passive: true }); updateScroll();

const cursor = document.querySelector('.cursor');
let mouseX = innerWidth * .5, mouseY = innerHeight * .5, cursorX = mouseX, cursorY = mouseY;
if (finePointer && !reduceMotion) {
  addEventListener('pointermove', (event) => { mouseX = event.clientX; mouseY = event.clientY; }, { passive: true });
  const moveCursor = () => { cursorX += (mouseX - cursorX) * .16; cursorY += (mouseY - cursorY) * .16; cursor.style.transform = `translate3d(${cursorX - 21}px,${cursorY - 21}px,0)`; requestAnimationFrame(moveCursor); }; moveCursor();
  document.querySelectorAll('.tilt').forEach((item) => {
    const base = getComputedStyle(item).transform === 'none' ? '' : getComputedStyle(item).transform;
    item.addEventListener('pointermove', (event) => { const rect = item.getBoundingClientRect(); const rx = ((event.clientY - rect.top) / rect.height - .5) * -7; const ry = ((event.clientX - rect.left) / rect.width - .5) * 8; item.style.transform = `${base} perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`; });
    item.addEventListener('pointerleave', () => { item.style.transform = base; });
  });
  document.querySelectorAll('.magnetic').forEach((item) => {
    item.addEventListener('pointermove', (event) => { const rect = item.getBoundingClientRect(); item.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px,${(event.clientY - rect.top - rect.height / 2) * .12}px)`; });
    item.addEventListener('pointerleave', () => { item.style.transform = ''; });
  });
}

const canvas = document.querySelector('#void-canvas');
const ctx = canvas.getContext('2d');
let dpr = 1, points = [], burstEnergy = 0, signalMode = 'idle', modeHue = 0;
function resizeCanvas() {
  dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  points = Array.from({ length: Math.min(90, Math.floor(innerWidth / 14)) }, () => ({ x: (Math.random() - .5) * 680, y: (Math.random() - .5) * 680, z: Math.random() * 900 + 80 }));
}
addEventListener('resize', resizeCanvas); resizeCanvas();
function rotate3D(point, ax, ay) { const cosX = Math.cos(ax), sinX = Math.sin(ax), cosY = Math.cos(ay), sinY = Math.sin(ay); const y = point.y * cosX - point.z * sinX; const z1 = point.y * sinX + point.z * cosX; return { x: point.x * cosY + z1 * sinY, y, z: -point.x * sinY + z1 * cosY }; }
function drawVoid(time = 0) {
  ctx.clearRect(0, 0, innerWidth, innerHeight); const centerX = innerWidth * .5, centerY = innerHeight * .5, t = time * .00018; const mx = (mouseX / innerWidth - .5) * .45, my = (mouseY / innerHeight - .5) * .3; ctx.lineWidth = 1;
  for (let ring = 0; ring < 5; ring++) { ctx.beginPath(); for (let i = 0; i <= 130; i++) { const angle = i / 130 * Math.PI * 2, pulse = signalMode === 'breathe' ? Math.sin(t * 18) * 12 : 0, radius = 125 + ring * 27 + pulse + Math.sin(angle * (3 + ring % 2) + t * 4 + burstEnergy) * (7 + burstEnergy * 11); const point = rotate3D({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: Math.sin(angle * 2 + ring) * (38 + ring * 5) }, my + t + burstEnergy * .2, mx + t * .7 + scrollRatio * 5 + burstEnergy); const scale = 520 / (520 + point.z), x = centerX + point.x * scale, y = centerY + point.y * scale; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = ring % 2 ? `hsla(${84 + modeHue},100%,57%,${.10 + ring * .025})` : `hsla(${262 + modeHue},100%,61%,${.13 + ring * .018})`; ctx.stroke(); }
  ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(t * .6 + scrollRatio * Math.PI); ctx.strokeStyle = 'rgba(184,255,33,.12)'; for (let s = 0; s < 8; s++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(210, 0); ctx.lineTo(260 + burstEnergy * 25, 0); ctx.stroke(); } ctx.restore();
  points.forEach((point) => { point.z -= .7 + scrollRatio * 2 + burstEnergy * 7; if (point.z < 10) point.z = 980; const scale = 460 / point.z, x = centerX + point.x * scale, y = centerY + point.y * scale, alpha = Math.min(.34, (1 - point.z / 1000) * .4); ctx.fillStyle = `rgba(101,245,255,${alpha})`; ctx.fillRect(x, y, Math.max(.6, scale * 1.4), Math.max(.6, scale * 1.4)); });
  burstEnergy *= .965;
  if (!reduceMotion) requestAnimationFrame(drawVoid);
}
if (!reduceMotion) requestAnimationFrame(drawVoid);

const burst = document.querySelector('.burst');
const burstMode = burst.querySelector('.burst-mode');
const burstWord = burst.querySelector('.burst-word');
const burstShards = burst.querySelector('.burst-shards');
let eventTimer, lastPointer = null;
addEventListener('pointerdown', (event) => { lastPointer = { x: event.clientX, y: event.clientY }; }, { capture: true, passive: true });
function fireEvent(name, source) {
  clearTimeout(eventTimer);
  burstEnergy = 2.2;
  const mode = source?.dataset.mode || 'impact';
  signalMode = mode;
  modeHue = ({ scale: 0, shift: 55, voice: -24, breathe: 105, impact: 0 })[mode] || 0;
  const rect = source?.getBoundingClientRect();
  const origin = lastPointer || (rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 });
  lastPointer = null;
  burst.style.setProperty('--x', `${origin.x}px`);
  burst.style.setProperty('--y', `${origin.y}px`);
  burst.dataset.mode = mode;
  burstMode.textContent = mode === 'impact' ? 'AURA ENGINE // COLLAPSE' : `NOW TRANSMITTING // ${mode.toUpperCase()}`;
  const text = name.replaceAll('_', ' ');
  burstWord.dataset.text = text;
  let letterIndex = 0;
  burstWord.replaceChildren(...text.split(' ').flatMap((word, w) => {
    const group = document.createElement('span');
    group.className = 'burst-group';
    group.append(...[...word].map((char) => {
      const letter = document.createElement('span');
      letter.textContent = char;
      letter.style.cssText = `--i:${letterIndex++};--lx:${(Math.random() - .5) * 240}px;--ly:${(Math.random() - .5) * 200}px;--lr:${(Math.random() - .5) * 70}deg`;
      return letter;
    }));
    return w ? [' ', group] : [group];
  }));
  burstShards.replaceChildren(...Array.from({ length: innerWidth < 640 ? 14 : 24 }, (_, i) => {
    const shard = document.createElement('i'), angle = Math.random() * Math.PI * 2, distance = 160 + Math.random() * Math.max(innerWidth, innerHeight) * .45;
    shard.style.cssText = `--dx:${Math.cos(angle) * distance}px;--dy:${Math.sin(angle) * distance}px;--r:${Math.random() * 720 - 360}deg;--s:${.5 + Math.random()};--d:${Math.random() * 90}ms;--c:${['var(--lime)', 'var(--violet)', 'var(--cyan)', 'var(--white)'][i % 4]}`;
    return shard;
  }));
  burst.classList.remove('fire');
  void burst.offsetWidth;
  burst.classList.add('fire');
  document.body.classList.add('eventing');
  if (source?.classList?.contains('lex-card')) {
    document.querySelectorAll('.lex-card').forEach((card) => card.classList.remove('is-active'));
    source.classList.add('is-active');
  }
  eventTimer = setTimeout(() => { document.body.classList.remove('eventing'); burst.classList.remove('fire'); }, reduceMotion ? 500 : 1250);
}
document.querySelectorAll('[data-event]').forEach((item) => {
  item.addEventListener('click', () => fireEvent(item.dataset.event, item));
  if (item.getAttribute('role') === 'button') item.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); item.click(); } });
});

const portal = document.querySelector('.portal');
const portalImage = portal.querySelector('img');
const portalCaption = portal.querySelector('.portal-frame span');
const portalClose = portal.querySelector('button');
function openPortal(trigger) {
  const image = trigger.querySelector('img');
  portalImage.src = image.currentSrc || image.src;
  portalImage.alt = image.alt;
  portalCaption.textContent = trigger.dataset.caption || 'VISUAL FEED';
  portal.showModal();
  fireEvent('VISUAL_PORTAL', trigger);
}
document.querySelectorAll('.portal-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => openPortal(trigger));
  trigger.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPortal(trigger); } });
});
portalClose.addEventListener('click', () => portal.close());
portal.addEventListener('click', (event) => { if (event.target === portal) portal.close(); });

const audioDeck = document.querySelector('.audio-deck');
const deckToggle = document.querySelector('.deck-toggle');
const deckPlay = document.querySelector('.deck-play');
const deckPrev = document.querySelector('.deck-prev');
const deckNext = document.querySelector('.deck-next');
const deckVideo = document.querySelector('.deck-video');
const deckSeek = document.querySelector('.deck-seek');
const deckCurrent = document.querySelector('.deck-current');
const deckDuration = document.querySelector('.deck-duration');
const deckTitle = document.querySelector('.deck-copy strong');
const deckMeta = document.querySelector('.deck-copy small');
const deckStatus = document.querySelector('.deck-copy > span');
const deckSource = document.querySelector('.deck-source');
const deckMini = document.querySelector('.deck-mini');
const miniState = deckMini.querySelector('small');
const miniTitle = deckMini.querySelector('b');
const tracks = [
  { id: 'money', title: 'MONËY SO BIG', youtubeId: 'w1GBTgxIvcY', label: 'YEAT - TOPIC // FULL TRACK' },
  { id: 'come', title: 'COMË N GO', youtubeId: 'QqzXvvdk3bQ', label: 'OFFICIAL VIDEO // YEAT' },
  { id: 'die', title: 'D.I.E.', youtubeId: 'XcYlBQMYYkc', label: 'ARCHIVE UPLOAD // UNRELEASED' },
  { id: 'countup', title: 'COUNTUP', youtubeId: '6bkRnqMvRnw', label: 'OFFICIAL AUDIO // YEAT' }
];
let activeTrack = 1;
let ytPlayer = null;
let ytReady = false;
let pendingAutoplay = false;
let progressTimer;
let userActivated = false;
let unlockedAt = 0;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function updateTrackUI() {
  const track = tracks[activeTrack];
  deckTitle.textContent = track.title;
  miniTitle.textContent = track.title;
  deckMeta.textContent = `NOW SELECTED / ${String(activeTrack + 1).padStart(2, '0')}`;
  document.querySelectorAll('.lex-card[data-track]').forEach((card) => card.classList.toggle('is-active', card.dataset.track === track.id));
  deckSource.href = `https://www.youtube.com/watch?v=${track.youtubeId}`;
  const stage = document.querySelector('.lexicon-stage'), card = stage.querySelector(`[data-track="${track.id}"]`);
  if (card && stage.scrollWidth > stage.clientWidth) stage.scrollTo({ left: stage.scrollLeft + card.getBoundingClientRect().left - stage.getBoundingClientRect().left - (stage.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
}

function updateProgress() {
  if (!ytReady) return;
  const current = ytPlayer.getCurrentTime() || 0, duration = ytPlayer.getDuration() || 0;
  deckCurrent.textContent = formatTime(current);
  deckDuration.textContent = formatTime(duration);
  deckSeek.value = duration ? Math.round(current / duration * 1000) : 0;
}

function loadTrack(index, autoplay = false) {
  activeTrack = (index + tracks.length) % tracks.length;
  const track = tracks[activeTrack];
  updateTrackUI();
  deckSeek.value = 0;
  deckCurrent.textContent = '0:00';
  deckDuration.textContent = '0:00';
  audioDeck.classList.remove('unavailable', 'playing');
  deckPlay.textContent = '▶';
  deckStatus.textContent = track.label;
  miniState.textContent = autoplay ? 'TUNING IN' : 'STANDBY';
  deckMini.classList.remove('bump');
  void deckMini.offsetWidth;
  deckMini.classList.add('bump');
  if (!ytReady) { pendingAutoplay = autoplay; return; }
  autoplay ? ytPlayer.loadVideoById(track.youtubeId) : ytPlayer.cueVideoById(track.youtubeId);
}

window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player('yt-player', {
    videoId: tracks[activeTrack].youtubeId,
    playerVars: { playsinline: 1, rel: 0, controls: 0, disablekb: 1, iv_load_policy: 3, modestbranding: 1 },
    events: {
      onReady: () => {
        ytReady = true;
        if (!userActivated) { ytPlayer.mute(); audioDeck.classList.add('muted'); }
        loadTrack(activeTrack, pendingAutoplay);
      },
      onStateChange: ({ data }) => {
        const playing = data === YT.PlayerState.PLAYING;
        audioDeck.classList.toggle('playing', playing);
        document.body.classList.toggle('music-on', playing);
        document.querySelectorAll('.lex-card[data-track]').forEach((card) => card.classList.toggle('is-playing', playing && card.dataset.track === tracks[activeTrack].id));
        if (!audioDeck.classList.contains('unavailable')) miniState.textContent = playing ? (audioDeck.classList.contains('muted') ? 'PLAYING // MUTED' : 'NOW PLAYING') : data === YT.PlayerState.BUFFERING ? 'TUNING IN' : 'PAUSED';
        audioDeck.classList.toggle('loading', data === YT.PlayerState.BUFFERING);
        deckPlay.textContent = playing ? 'Ⅱ' : '▶';
        clearInterval(progressTimer);
        if (playing) progressTimer = setInterval(updateProgress, 250);
        updateProgress();
        if (data === YT.PlayerState.ENDED) loadTrack(activeTrack + 1, true);
      },
      onError: () => {
        audioDeck.classList.remove('playing', 'loading');
        audioDeck.classList.add('unavailable');
        document.body.classList.remove('music-on');
        miniState.textContent = 'OPEN ON YOUTUBE';
        deckStatus.textContent = 'EMBED BLOCKED // OPEN ON YOUTUBE';
      }
    }
  });
};
setTimeout(() => { if (!ytReady) deckStatus.textContent = 'YOUTUBE OFFLINE // USE SOURCE LINK'; }, 9000);

deckToggle.addEventListener('click', () => {
  const open = audioDeck.classList.toggle('open');
  deckToggle.setAttribute('aria-expanded', String(open));
});

function unlockSound() {
  userActivated = true;
  unlockedAt = performance.now();
  ['pointerdown', 'keydown', 'touchstart'].forEach((type) => removeEventListener(type, unlockSound, true));
  if (!audioDeck.classList.contains('muted')) return;
  audioDeck.classList.remove('muted');
  if (!ytReady) return;
  ytPlayer.unMute();
  ytPlayer.setVolume(100);
  if (ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING && !audioDeck.classList.contains('unavailable')) ytPlayer.playVideo();
  if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) miniState.textContent = 'NOW PLAYING';
}
['pointerdown', 'keydown', 'touchstart'].forEach((type) => addEventListener(type, unlockSound, { capture: true, passive: true }));

function togglePlayback() {
  if (audioDeck.classList.contains('unavailable')) { open(deckSource.href, '_blank', 'noopener'); return; }
  if (performance.now() - unlockedAt < 700) return;
  if (!ytReady) { pendingAutoplay = true; return; }
  ytPlayer.getPlayerState() === YT.PlayerState.PLAYING ? ytPlayer.pauseVideo() : ytPlayer.playVideo();
}
deckPlay.addEventListener('click', togglePlayback);
deckMini.addEventListener('click', togglePlayback);
deckPrev.addEventListener('click', () => loadTrack(activeTrack - 1, true));
deckNext.addEventListener('click', () => loadTrack(activeTrack + 1, true));
deckVideo.addEventListener('click', () => {
  const hidden = audioDeck.classList.toggle('video-off');
  deckVideo.setAttribute('aria-pressed', String(!hidden));
});
deckSeek.addEventListener('input', () => {
  if (!ytReady) return;
  const duration = ytPlayer.getDuration();
  if (duration) { ytPlayer.seekTo(deckSeek.value / 1000 * duration, true); updateProgress(); }
});

document.querySelectorAll('.lex-card[data-track]').forEach((card) => card.addEventListener('click', () => {
  const index = tracks.findIndex((track) => track.id === card.dataset.track);
  if (index === activeTrack && audioDeck.classList.contains('playing')) return;
  loadTrack(index, true);
}));

loadTrack(1, true);

const countObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (!entry.isIntersecting) return;
  countObserver.unobserve(entry.target);
  const target = Number(entry.target.dataset.count), start = performance.now();
  const step = (now) => { const p = Math.min(1, (now - start) / 1400); entry.target.textContent = (target * (1 - (1 - p) ** 3)).toFixed(1); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}), { threshold: .6 });
document.querySelectorAll('[data-count]').forEach((item) => countObserver.observe(item));

const heroArtifact = document.querySelector('.hero-artifact');
const heroScene = heroArtifact.querySelector('.artifact-scene');
const heroRot = heroArtifact.querySelector('.hud-rot');
let tiltX = -8, tiltY = 0, targetTiltX = -8, targetTiltY = 0, hudFrame = 0;
if (!reduceMotion) {
  const hero = document.querySelector('.hero');
  hero.addEventListener('pointermove', (event) => { targetTiltY = (event.clientX / innerWidth - .5) * 56; targetTiltX = -8 - (event.clientY / innerHeight - .5) * 38; });
  hero.addEventListener('pointerleave', () => { targetTiltX = -8; targetTiltY = 0; });
  const tiltHero = () => {
    tiltX += (targetTiltX - tiltX) * .07; tiltY += (targetTiltY - tiltY) * .07;
    heroScene.style.setProperty('--rx', `${tiltX.toFixed(2)}deg`);
    heroScene.style.setProperty('--ry', `${(tiltY + scrollRatio * 140).toFixed(2)}deg`);
    if (++hudFrame % 6 === 0) heroRot.textContent = `ROT ${String(Math.round(Math.abs(tiltX))).padStart(3, '0')}° / ${String(Math.round(Math.abs(tiltY + scrollRatio * 140)) % 360).padStart(3, '0')}°`;
    requestAnimationFrame(tiltHero);
  };
  tiltHero();
}
heroArtifact.addEventListener('click', () => {
  heroArtifact.classList.remove('collapse');
  void heroArtifact.offsetWidth;
  heroArtifact.classList.add('collapse');
});
heroArtifact.addEventListener('animationend', (event) => { if (event.animationName === 'gemBurst') heroArtifact.classList.remove('collapse'); });

document.querySelectorAll('.lex-card').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--beam-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--beam-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
});
