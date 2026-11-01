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

let audioContext, soundOn = false;
const soundButton = document.querySelector('.sound'), soundLabel = soundButton.querySelector('span');
soundButton.addEventListener('click', () => { soundOn = !soundOn; soundButton.setAttribute('aria-pressed', String(soundOn)); soundLabel.textContent = soundOn ? 'SOUND_1' : 'SOUND_0'; if (soundOn) tone(110, .09, 'sawtooth'); });
function tone(frequency = 80, duration = .035, type = 'sine') { if (!soundOn && duration < .09) return; audioContext ||= new AudioContext(); const oscillator = audioContext.createOscillator(), gain = audioContext.createGain(); oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); gain.gain.setValueAtTime(.025, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration); oscillator.connect(gain).connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + duration); }
document.querySelectorAll('a,button').forEach((item) => item.addEventListener('pointerenter', () => tone(72, .03)));

const eventFlash = document.querySelector('.event-flash');
const eventName = eventFlash.querySelector('span');
const eventCode = eventFlash.querySelector('b');
let eventTimer;
function fireEvent(name, source) {
  clearTimeout(eventTimer);
  burstEnergy = 2.2;
  const mode = source?.dataset.mode || 'impact';
  signalMode = mode;
  modeHue = ({ scale: 0, shift: 55, voice: -24, breathe: 105, impact: 0 })[mode] || 0;
  eventName.textContent = mode === 'impact' ? 'AURA ENGINE // COLLAPSE' : `NOW TRANSMITTING // ${mode.toUpperCase()}`;
  eventCode.textContent = name.replaceAll('_', ' ');
  eventFlash.classList.remove('fire');
  void eventFlash.offsetWidth;
  eventFlash.classList.add('fire');
  document.body.classList.add('eventing');
  if (source?.classList?.contains('lex-card')) {
    document.querySelectorAll('.lex-card').forEach((card) => card.classList.remove('is-active'));
    source.classList.add('is-active');
  }
  if (soundOn) tone(({ scale: 62, shift: 84, voice: 108, breathe: 48 })[mode] || 55, .12, 'sawtooth');
  eventTimer = setTimeout(() => { document.body.classList.remove('eventing'); eventFlash.classList.remove('fire'); }, 680);
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
deckToggle.addEventListener('click', () => {
  const open = audioDeck.classList.toggle('open');
  deckToggle.setAttribute('aria-expanded', String(open));
  if (open) fireEvent('AUDIO SLOT ARMED', { dataset: { mode: 'voice' } });
});

document.querySelectorAll('.lex-card').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--beam-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--beam-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
});
