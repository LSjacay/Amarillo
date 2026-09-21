let count = 0;
const MAX = 150;
const canopy = document.getElementById('canopy');
const counter = document.getElementById('counter');
const starsContainer = document.getElementById('stars-container');

const petalColors = ['#ffd23f', '#ffb800', '#ffdd55', '#ff9900'];

// 1. Generar Estrellas
function createStars() {
  starsContainer.innerHTML = '';
  for (let i = 0; i < 140; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.width = star.style.height = (Math.random() * 2.5 + 1) + 'px';
    star.style.top = (Math.random() * 90) + '%';
    star.style.left = (Math.random() * 100) + '%';
    star.style.animationDelay = (Math.random() * 5) + 's';
    star.style.animationDuration = (Math.random() * 3 + 2) + 's';
    starsContainer.appendChild(star);
  }
}
createStars();

// 2. Flores SVG
function flowerSVG(color) {
  const angles = [0, 72, 144, 216, 288];
  const petals = angles.map(a =>
    `<ellipse cx="0" cy="-9" rx="5.5" ry="9.5" fill="${color}" transform="rotate(${a})"/>`
  ).join('');
  return `<svg viewBox="-14 -14 28 28"><g>${petals}<circle r="4.5" fill="#8a4f00"/></g></svg>`;
}

// 3. Agregar Flores/Luces
function addBlossom() {
  if (count >= MAX) return;

  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random());
  
  const cx = 50 + r * 40 * Math.cos(angle);
  const cy = 45 + r * 35 * Math.sin(angle);

  const size = 18 + Math.random() * 16;
  const color = petalColors[Math.floor(Math.random() * petalColors.length)];
  const b = document.createElement('div');
  b.className = 'blossom';
  b.style.left = cx + '%';
  b.style.top = cy + '%';
  b.style.width = size + 'px';
  b.style.height = size + 'px';
  b.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
  b.style.animationDelay = (Math.random() * 2) + 's';
  b.innerHTML = flowerSVG(color);
  canopy.appendChild(b);
  
  count++;
  counter.textContent = 'LUCES: ' + count;
}
for (let i = 0; i < 70; i++) addBlossom();

// 4. Luciérnagas
function spawnFirefly(xPercent, yPercent = null) {
  const firefly = document.createElement('div');
  firefly.className = 'firefly';

  firefly.style.left = xPercent + '%';
  firefly.style.top = (yPercent !== null ? yPercent : (25 + Math.random() * 55)) + '%';

  firefly.style.setProperty('--drift-x', (Math.random() * 180 - 90) + 'px');
  firefly.style.setProperty('--drift-y', (Math.random() * 140 - 70) + 'px');

  firefly.style.animationDuration = (4 + Math.random() * 4) + 's';
  firefly.style.animationDelay = (Math.random() * 1.5) + 's';

  document.body.appendChild(firefly);

  setTimeout(() => firefly.remove(), 8000);
}

setInterval(() => {
  spawnFirefly(40 + Math.random() * 20, 30 + Math.random() * 35);
  spawnFirefly(10 + Math.random() * 80, 75 + Math.random() * 15);
}, 500);

// 5. Clicks/Taps
document.body.addEventListener('click', (e) => {
  if (e.target.closest('.btn')) return;

  addBlossom(); addBlossom(); addBlossom();

  const xPercent = (e.clientX / window.innerWidth) * 100;
  const yPercent = (e.clientY / window.innerHeight) * 100;

  for (let i = 0; i < 7; i++) {
    setTimeout(() => spawnFirefly(xPercent, yPercent), i * 80);
  }
});

// 6. Audio
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
  gain.gain.linearRampToValueAtTime(0.04, time + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + dur);
}

function scheduleLoop() {
  if (!playing) return;
  const now = audioCtx.currentTime;
  playNote(notes[noteIndex % notes.length], now, 1.2);
  noteIndex++;
  loopTimer = setTimeout(scheduleLoop, 950);
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
  if (playing) {
    btn.textContent = '🔊';
    scheduleLoop();
    startPad();
  } else {
    btn.textContent = '🔇';
    clearTimeout(loopTimer);
    stopPad();
  }
});