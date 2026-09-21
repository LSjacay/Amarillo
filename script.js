let count = 0;
const MAX = 150;
const canopy = document.getElementById('canopy');
const counter = document.getElementById('counter');
const treeEl = document.getElementById('tree');
const starsContainer = document.getElementById('stars-container');

const petalColors = ['#ffd23f', '#ffb800', '#ffdd55', '#ff9900'];

// Generar Estrellas
function createStars() {
  for (let i = 0; i < 150; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.width = star.style.height = (Math.random() * 3 + 1) + 'px';
    star.style.top = (Math.random() * 100) + '%';
    star.style.left = (Math.random() * 100) + '%';
    star.style.animationDelay = (Math.random() * 5) + 's';
    star.style.animationDuration = (Math.random() * 4 + 2) + 's';
    starsContainer.appendChild(star);
  }
}
createStars();

// Flores SVG
function flowerSVG(color) {
  const angles = [0, 72, 144, 216, 288];
  const petals = angles.map(a =>
    `<ellipse cx="0" cy="-9" rx="5" ry="9" fill="${color}" transform="rotate(${a})"/>`
  ).join('');
  return `<svg viewBox="-14 -14 28 28"><g>${petals}<circle r="4.5" fill="#a06000"/></g></svg>`;
}

// Agregar Flores/Luces
function addBlossom() {
  if (count >= MAX) return;
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random());
  const cx = 50 + r * 46 * Math.cos(angle);
  const cy = 52 + r * 44 * Math.sin(angle) * 0.9;

  const size = 18 + Math.random() * 15;
  const color = petalColors[Math.floor(Math.random() * petalColors.length)];
  const b = document.createElement('div');
  b.className = 'blossom';
  b.style.left = cx + '%';
  b.style.top = cy + '%';
  b.style.width = size + 'px';
  b.style.height = size + 'px';
  b.style.animationDuration = (3 + Math.random() * 3) + 's';
  b.style.animationDelay = (Math.random() * 2) + 's';
  b.innerHTML = flowerSVG(color);
  canopy.appendChild(b);
  count++;
  counter.textContent = 'LUCES: ' + count;
}
for (let i = 0; i < 65; i++) addBlossom();

// Luciérnagas
function spawnFirefly(xPercent, yPercent = null) {
  const firefly = document.createElement('div');
  firefly.className = 'firefly';

  firefly.style.left = xPercent + '%';
  firefly.style.top = (yPercent || (20 + Math.random() * 60)) + '%';

  firefly.style.setProperty('--drift-x', (Math.random() * 200 - 100) + 'px');
  firefly.style.setProperty('--drift-y', (Math.random() * 150 - 75) + 'px');

  firefly.style.animationDuration = (5 + Math.random() * 5) + 's';
  firefly.style.animationDelay = (Math.random() * 2) + 's';

  document.body.appendChild(firefly);

  setTimeout(() => firefly.remove(), 10000);
}

setInterval(() => {
  spawnFirefly(40 + Math.random() * 20, 30 + Math.random() * 40);
  spawnFirefly(10 + Math.random() * 80, 70 + Math.random() * 20);
}, 600);

document.body.addEventListener('click', (e) => {
  if (e.target.closest('.btn')) return;

  addBlossom(); addBlossom(); addBlossom();

  const xPercent = (e.clientX / window.innerWidth) * 100;
  const yPercent = (e.clientY / window.innerHeight) * 100;

  for (let i = 0; i < 8; i++) {
    setTimeout(() => spawnFirefly(xPercent, yPercent), i * 100);
  }
});

// Audio Web Audio API
let audioCtx, playing = false, loopTimer;
let padA, padB, padGain;
const notes = [261.63, 329.63, 392.00, 440.00, 329.63, 392.00, 523.25, 392.00];
let noteIndex = 0;

function playNote(freq, time, dur) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.05, time + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time); osc.stop(time + dur);
}

function scheduleLoop() {
  if (!playing) return;
  const now = audioCtx.currentTime;
  playNote(notes[noteIndex % notes.length], now, 1.2);
  noteIndex++;
  loopTimer = setTimeout(scheduleLoop, 1000);
}

function startPad() {
  padGain = audioCtx.createGain();
  padGain.gain.setValueAtTime(0, audioCtx.currentTime);
  padGain.gain.linearRampToValueAtTime(0.02, audioCtx.currentTime + 3);
  padA = audioCtx.createOscillator(); padA.type = 'sine'; padA.frequency.value = 130.81;
  padB = audioCtx.createOscillator(); padB.type = 'sine'; padB.frequency.value = 164.81;
  padA.connect(padGain); padB.connect(padGain); padGain.connect(audioCtx.destination);
  padA.start(); padB.start();
}

function stopPad() {
  if (!padGain) return;
  padGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
  padA.stop(audioCtx.currentTime + 1.2);
  padB.stop(audioCtx.currentTime + 1.2);
}

document.getElementById('musicBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  playing = !playing;
  const btn = document.getElementById('musicBtn');
  if (playing) { btn.textContent = '🔊'; scheduleLoop(); startPad(); }
  else { btn.textContent = '🔇'; clearTimeout(loopTimer); stopPad(); }
});