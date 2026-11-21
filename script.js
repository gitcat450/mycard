const shareBtn = document.getElementById('shareBtn');
const toast = document.getElementById('toastNotification');
const card = document.getElementById('card');
const avatar = document.getElementById('avatar');


shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 2500);
    });
});


let clickCount = 0;
let clickTimeout;
avatar.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => { clickCount = 0; }, 1500);

    if (clickCount === 5) {
        clickCount = 0;
        showSwitch();
    }
});


const typewriterElement = document.getElementById('typewriter');
const textsArray = [
    "↓↓↓",
    "пишу на языках html, css, java и Lua.",
    "↓↓↓",
  "mankind is dead",
  "blood is fuel",
  "hell is full",
    "↓↓↓",
    "and thy punishment is death",
];

let arrayIndex = 0; 
let charIndex = 0; 
let isDeleting = false; 
let typingSpeed = 100;

function typeWriterEffect() {
    const currentText = textsArray[arrayIndex];
    if (isDeleting) {
        typewriterElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--; 
        typingSpeed = 40;
    } else {
        typewriterElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++; 
        typingSpeed = 90;
    }

    if (!isDeleting && charIndex === currentText.length) {
        typingSpeed = currentText === "↓↓↓" ? 5000 : 2500; 
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        arrayIndex = (arrayIndex + 1) % textsArray.length;
        typingSpeed = 400;
    }
    setTimeout(typeWriterEffect, typingSpeed);
}
document.addEventListener("DOMContentLoaded", () => { typeWriterEffect(); });


function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}
function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { }
}

const fxSwitch = document.createElement('button');
fxSwitch.className = 'fx-switch';
fxSwitch.innerHTML = '<span>FX</span><i></i>';
fxSwitch.setAttribute('role', 'switch');
fxSwitch.setAttribute('aria-checked', 'false');
document.body.appendChild(fxSwitch);

let fxOn = false;
let offTimer;

function showSwitch() {
    fxSwitch.classList.add('visible');
}

fxSwitch.addEventListener('click', () => {
    if (fxOn) turnOff();
    else turnOn(true);
});


const corner = document.createElement('div');
corner.className = 'fx-corner';
corner.innerHTML = `
    <div class="counter">
        <div class="digits"></div>
        <div class="counter-info"><span class="mine-text"></span></div>
    </div>
    <div class="fx-row">
        <button class="hit-btn" aria-label="Нажать"><span></span></button>
        <div class="slime-spot"></div>
    </div>`;
document.body.appendChild(corner);

const side = document.createElement('div');
side.className = 'fx-side';
side.innerHTML = `
    <button class="fx-pill xray-btn">&lt;/&gt; X-ray</button>
    <button class="fx-pill fall-btn">⬇️ <span>Уронить</span></button>`;
document.body.appendChild(side);

const counterBox = corner.querySelector('.counter');
const digitsBox = corner.querySelector('.digits');
const mineText = corner.querySelector('.mine-text');
const hitBtn = corner.querySelector('.hit-btn');
const slimeSpot = corner.querySelector('.slime-spot');
const xrayBtn = side.querySelector('.xray-btn');
const fallBtn = side.querySelector('.fall-btn');



const COUNTER_URL = 'https://abacus.jasoncameron.dev';
const COUNTER_NS = 'reg77-card-site';
const COUNTER_KEY = 'fx-main-button';

let total = 0;
let mine = parseInt(load('fx-mine')) || 0;
let serverOk = true;
let hitsInFlight = 0;
let pollTimer;

async function askServer(action) {
    const r = await fetch(`${COUNTER_URL}/${action}/${COUNTER_NS}/${COUNTER_KEY}`, { cache: 'no-store' });
    if (r.status === 404 && action === 'get') return { value: 0 }; // счётчик ещё не создан
    if (!r.ok) throw new Error('server ' + r.status);
    return r.json();
}

async function refreshTotal() {
    if (document.hidden || hitsInFlight) return;
    try {
        const data = await askServer('get');
        if (!hitsInFlight) total = Number(data.value) || 0;
        serverOk = true;
    } catch (e) {
        serverOk = false;
    }
    drawCounter();
}

async function sendHit() {
    total++;
    mine++;
    save('fx-mine', mine);
    hitsInFlight++;
    drawCounter();
    try {
        const data = await askServer('hit');
        const v = Number(data.value);
        if (v) total = hitsInFlight > 1 ? Math.max(total, v) : v;
        serverOk = true;
    } catch (e) {
        serverOk = false;
    }
    hitsInFlight--;
    drawCounter();
}

function drawCounter() {
    setNumber(total);
    mineText.textContent = 'ты нажал: ' + mine;
}

hitBtn.addEventListener('click', () => {
    const plus = document.createElement('span');
    plus.className = 'plus-one';
    plus.textContent = '+1';
    counterBox.appendChild(plus);
    setTimeout(() => plus.remove(), 850);
    sendHit();
});


let digits = [];

function half(cls) {
    return `<div class="half ${cls}"><span>0</span></div>`;
}

function makeDigits(n) {
    digitsBox.innerHTML = '';
    digits = [];
    for (let i = 0; i < n; i++) {
        const el = document.createElement('div');
        el.className = 'digit';
        el.innerHTML = half('flap-top') + half('flap-bottom') + half('top') + half('bottom');
        digitsBox.appendChild(el);
        digits.push({
            el, value: 0, timer: 0,
            top: el.querySelector('.top'),
            bottom: el.querySelector('.bottom'),
            flapTop: el.querySelector('.flap-top'),
            flapBottom: el.querySelector('.flap-bottom')
        });
    }
}

function setText(half, v) {
    half.firstChild.textContent = v;
}

function finishFlip(d) {
    clearTimeout(d.timer);
    d.el.classList.remove('flipping');
    [d.top, d.bottom, d.flapTop, d.flapBottom].forEach(h => setText(h, d.value));
}

function setNumber(num) {
    const s = String(Math.max(0, Math.floor(num)));
    const n = Math.max(4, s.length);
    if (digits.length !== n) makeDigits(n);
    const padded = s.padStart(n, '0');

    digits.forEach((d, i) => {
        const v = Number(padded[i]);
        if (v === d.value) return;
        finishFlip(d);
        const old = d.value;
        d.value = v;
        setText(d.top, v);
        setText(d.flapBottom, v);
        setText(d.flapTop, old);
        setText(d.bottom, old);
        void d.el.offsetWidth;
        d.el.classList.add('flipping');
        d.timer = setTimeout(() => finishFlip(d), 560);
    });
}

makeDigits(4);


const SLIME_R = 25;       
const SLIME_MAX = 340;    
let slimeCanvas = document.createElement('canvas');
slimeCanvas.className = 'slime-canvas';
document.body.appendChild(slimeCanvas);
const sctx = slimeCanvas.getContext('2d');

let slimeRaf = 0;
let slimeLast = 0;
let slimeTime = 0;
let slimeReady = false;
let dragging = false;
let tipX = 0, tipY = 0, tipVx = 0, tipVy = 0;
let pointerX = 0, pointerY = 0;


function pickSlimeColor() {
    const prev = parseFloat(load('fx-hue'));
    let hue;
    do {
        hue = Math.random() * 360;
    } while (!isNaN(prev) && Math.min(Math.abs(hue - prev), 360 - Math.abs(hue - prev)) < 40);
    save('fx-hue', Math.round(hue));
    return { h: hue, s: 85 + Math.random() * 15, l: 74 + Math.random() * 8 };
}
const slimeColor = pickSlimeColor();

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    slimeCanvas.width = Math.round(window.innerWidth * dpr);
    slimeCanvas.height = Math.round(window.innerHeight * dpr);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


function drawNeck(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1, dy = y2 - y1;
    const d = Math.hypot(dx, dy);
    if (d <= Math.abs(r1 - r2) + 0.5 || d < 1) return;

    let u1 = 0, u2 = 0;
    if (d < r1 + r2) {
        u1 = Math.acos(Math.max(-1, Math.min(1, (r1 * r1 + d * d - r2 * r2) / (2 * r1 * d))));
        u2 = Math.acos(Math.max(-1, Math.min(1, (r2 * r2 + d * d - r1 * r1) / (2 * r2 * d))));
    }
    const v = 0.5;
    const base = Math.atan2(dy, dx);
    const spread = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / d)));
    const a1 = base + u1 + (spread - u1) * v;
    const a2 = base - u1 - (spread - u1) * v;
    const a3 = base + Math.PI - u2 - (Math.PI - u2 - spread) * v;
    const a4 = base - Math.PI + u2 + (Math.PI - u2 - spread) * v;

    const pt = (x, y, a, r) => [x + Math.cos(a) * r, y + Math.sin(a) * r];
    const p1a = pt(x1, y1, a1, r1), p1b = pt(x1, y1, a2, r1);
    const p2a = pt(x2, y2, a3, r2), p2b = pt(x2, y2, a4, r2);

    let k = Math.min(v * 2.4, Math.hypot(p1a[0] - p2a[0], p1a[1] - p2a[1]) / (r1 + r2));
    k *= Math.min(1, d * 2 / (r1 + r2));
    const h1 = r1 * k, h2 = r2 * k;
    const q = Math.PI / 2;
    const hd = (p, a, len) => [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len];

    sctx.beginPath();
    sctx.moveTo(p1a[0], p1a[1]);
    let c1 = hd(p1a, a1 - q, h1), c2 = hd(p2a, a3 + q, h2);
    sctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p2a[0], p2a[1]);
    sctx.lineTo(p2b[0], p2b[1]);
    c1 = hd(p2b, a4 - q, h2); c2 = hd(p1b, a2 + q, h1);
    sctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p1b[0], p1b[1]);
    sctx.closePath();
    sctx.fill();
}

function shadeBlob(x, y, r) {
    const g = sctx.createRadialGradient(x - r * 0.3, y - r * 0.42, r * 0.05, x, y, r * 1.35);
    g.addColorStop(0, 'rgba(255,255,255,0.6)');
    g.addColorStop(0.4, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(70,40,110,0.22)');
    sctx.fillStyle = g;
    sctx.fillRect(x - r * 1.6, y - r * 1.6, r * 3.2, r * 3.2);
}
function shineBlob(x, y, r) {
    sctx.fillStyle = 'rgba(255,255,255,0.8)';
    sctx.beginPath();
    sctx.ellipse(x - r * 0.38, y - r * 0.48, r * 0.24, r * 0.13, -0.6, 0, Math.PI * 2);
    sctx.fill();
    sctx.fillStyle = 'rgba(255,255,255,0.55)';
    sctx.beginPath();
    sctx.arc(x + r * 0.1, y - r * 0.64, r * 0.07, 0, Math.PI * 2);
    sctx.fill();
}

function slimeFrame(now) {
    slimeRaf = requestAnimationFrame(slimeFrame);
    const dt = Math.min(0.033, (now - slimeLast) / 1000 || 0.016);
    slimeLast = now;
    slimeTime += dt;

   
    const rect = slimeSpot.getBoundingClientRect();
    const ax = rect.left + rect.width / 2;
    const ay = rect.top + rect.height / 2;
    if (!slimeReady) { tipX = ax; tipY = ay; tipVx = 0; tipVy = 0; slimeReady = true; }

   
    let goalX = ax, goalY = ay;
    if (dragging) {
        const dx = pointerX - ax, dy = pointerY - ay;
        const len = Math.hypot(dx, dy);
        if (len > 0.1) {
            const eff = SLIME_MAX * Math.tanh(len / SLIME_MAX); 
            goalX = ax + dx / len * eff;
            goalY = ay + dy / len * eff;
        }
    }
    const spring = dragging ? 240 : 170;
    const damping = dragging ? 15 : 6.5;
    tipVx += (spring * (goalX - tipX) - damping * tipVx) * dt;
    tipVy += (spring * (goalY - tipY) - damping * tipVy) * dt;
    tipX += tipVx * dt;
    tipY += tipVy * dt;

    const dist = Math.hypot(tipX - ax, tipY - ay);
    const stretch = 1 - Math.exp(-dist / (SLIME_R * 4));
    const breathe = 1 + 0.035 * Math.sin(slimeTime * 2.6);
    const r1 = SLIME_R * (1 - 0.28 * stretch) * breathe;
    const r2 = Math.max(SLIME_R * 0.3, SLIME_R * (0.92 - 0.5 * stretch)) * breathe;

    sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    sctx.globalCompositeOperation = 'source-over';
    sctx.fillStyle = `hsl(${slimeColor.h} ${slimeColor.s}% ${slimeColor.l}%)`;
    sctx.beginPath(); sctx.arc(ax, ay, r1, 0, Math.PI * 2); sctx.fill();
    sctx.beginPath(); sctx.arc(tipX, tipY, r2, 0, Math.PI * 2); sctx.fill();
    drawNeck(ax, ay, r1, tipX, tipY, r2);

    sctx.globalCompositeOperation = 'source-atop';
    shadeBlob(ax, ay, r1);
    if (dist > 3) shadeBlob(tipX, tipY, r2);
    sctx.globalCompositeOperation = 'source-over';
    shineBlob(ax, ay, r1);
    if (dist > 8 && r2 > 7) shineBlob(tipX, tipY, r2);
}

function slimeLetGo() {
    dragging = false;
    slimeSpot.classList.remove('grab');
}

slimeSpot.addEventListener('pointerdown', e => {
    e.preventDefault();
    dragging = true;
    pointerX = e.clientX;
    pointerY = e.clientY;
    slimeSpot.setPointerCapture(e.pointerId);
    slimeSpot.classList.add('grab');
});
slimeSpot.addEventListener('pointermove', e => {
    if (dragging) { pointerX = e.clientX; pointerY = e.clientY; }
});
slimeSpot.addEventListener('pointerup', slimeLetGo);
slimeSpot.addEventListener('pointercancel', slimeLetGo);


let xray = false;
let xrayItems = [];
let xrayTimer;
let avatarTimer;
const avatarSrc = avatar.getAttribute('src');

function isVisible(el) {
    return el.offsetWidth > 0 && el.offsetHeight > 0;
}

function shortCode(el) {
    let code = el.outerHTML
        .replace(/\s+/g, ' ')
        .replace(/ style="[^"]*"/g, '')
        .replace(/="([^"]{22})[^"]*"/g, '="$1…"');
    const fits = Math.floor((el.offsetWidth - 16) / 5.3) * Math.max(1, Math.floor((el.offsetHeight - 8) / 11));
    if (code.length > fits) code = code.slice(0, Math.max(10, fits - 1)) + '…';
    return code;
}

function avatarAsCode() {
    const src = (avatarSrc || '').slice(0, 11) + '…';
    const lines = ['<img', `  src="${src}"`, '  class="avatar"', '  id="avatar"', '  alt="Avatar">'];
    const text = lines.map((l, i) =>
        `<text x="14" y="${27 + i * 9.5}" xml:space="preserve">${l.replace(/</g, '&lt;')}</text>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90"><rect width="90" height="90" fill="#020617"/>` +
        `<g font-family="monospace" font-size="6.8" fill="#7cfc9a">${text}</g></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function swapAvatar(src) {
    clearTimeout(avatarTimer);
    avatar.style.transition = 'opacity 0.22s';
    avatar.style.opacity = 0;
    avatarTimer = setTimeout(() => {
        avatar.src = src;
        avatar.style.opacity = 1;
    }, 230);
}

function setXray(on) {
    if (xray === on) return;
    xray = on;
    clearTimeout(xrayTimer);
    xrayBtn.classList.toggle('active', on);

    if (on) {
        xrayItems = [...card.querySelectorAll('h1, .subtitle, .btn')].filter(isVisible);
        xrayItems.forEach(el => {
            el.setAttribute('data-xr', shortCode(el));
            el.classList.add('xr-t');
        });
        requestAnimationFrame(() => requestAnimationFrame(() => {
            xrayItems.forEach(el => el.classList.add('xr-on'));
        }));
        swapAvatar(avatarAsCode());
    } else {
        const list = xrayItems;
        list.forEach(el => el.classList.remove('xr-on'));
        xrayTimer = setTimeout(() => {
            list.forEach(el => { el.classList.remove('xr-t'); el.removeAttribute('data-xr'); });
        }, 600);
        swapAvatar(avatarSrc);
    }
}

xrayBtn.addEventListener('click', () => setXray(!xray));



let fallen = false;
let busy = false;      
let things = [];
let fallRaf = 0;
let fallLast = 0;
let grav = { x: 0, y: 1 };        
let gravGoal = { x: 0, y: 1 };    
const GRAVITY = 1800;

function fallTargets() {
    const list = [...card.querySelectorAll('#avatar, h1, .subtitle, .btn')].filter(isVisible);
    list.push(counterBox, hitBtn, slimeSpot);
    return list;
}

function startFall() {
    if (fallen || busy || !fxOn) return;
    fallen = true;
    fallBtn.classList.add('active');
    fallBtn.querySelector('span').textContent = 'Собрать';

    const els = fallTargets();
    els.forEach(el => { el.style.transition = 'none'; });

    const bases = els.map(el => {
        const t = getComputedStyle(el).transform;
        return t === 'none' ? '' : t;
    });
    const before = els.map(el => el.getBoundingClientRect());
    
    els.forEach((el, i) => { el.style.transform = `translate(100px,0px) ${bases[i]}`; });
    const after = els.map(el => el.getBoundingClientRect());
    els.forEach(el => { el.style.transform = ''; });

    things = els.map((el, i) => {
        let k = (after[i].left - before[i].left) / 100;
        if (!isFinite(k) || k < 0.5 || k > 2) k = 1;
        return {
            el, base: bases[i], k,
            x0: before[i].left, y0: before[i].top,
            x: before[i].left, y: before[i].top,
            w: before[i].width, h: before[i].height,
            vx: (Math.random() - 0.5) * 320, vy: Math.random() * 120,
            angle: 0, spin: (Math.random() - 0.5) * 120
        };
    });

    fallLast = performance.now();
    cancelAnimationFrame(fallRaf);
    fallRaf = requestAnimationFrame(fallStep);
}

function fallStep(now) {
    if (!fallen) return;
    fallRaf = requestAnimationFrame(fallStep);
    const dt = Math.min(0.032, (now - fallLast) / 1000);
    fallLast = now;
    if (dt <= 0) return;

   
    const smooth = Math.min(1, dt * 6);
    grav.x += (gravGoal.x - grav.x) * smooth;
    grav.y += (gravGoal.y - grav.y) * smooth;

    const W = window.innerWidth, H = window.innerHeight;
    const gMag = Math.hypot(grav.x, grav.y);

    things.forEach(t => {
        t.vx += grav.x * GRAVITY * dt;
        t.vy += grav.y * GRAVITY * dt;
        t.x += t.vx * dt;
        t.y += t.vy * dt;
        t.angle += t.spin * dt;
        t.touch = false;

      
        if (t.x < 0) { t.x = 0; t.vx = t.vx < -90 ? -t.vx * 0.38 : 0; t.touch = true; }
        else if (t.x + t.w > W) { t.x = W - t.w; t.vx = t.vx > 90 ? -t.vx * 0.38 : 0; t.touch = true; }
        if (t.y < 0) { t.y = 0; t.vy = t.vy < -90 ? -t.vy * 0.38 : 0; t.touch = true; }
        else if (t.y + t.h > H) { t.y = H - t.h; t.vy = t.vy > 90 ? -t.vy * 0.38 : 0; t.touch = true; }
    });

    
    for (let pass = 0; pass < 4; pass++) {
        for (let i = 0; i < things.length; i++) {
            for (let j = i + 1; j < things.length; j++) {
                const a = things[i], b = things[j];
                const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
                const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
                if (ox <= 0 || oy <= 0) continue;
                a.touch = b.touch = true;
            
                const axis = ox < oy ? 'x' : 'y';
                const size = axis === 'x' ? ox : oy;
                const v = axis === 'x' ? 'vx' : 'vy';
                const dir = a[axis] + (axis === 'x' ? a.w : a.h) / 2 < b[axis] + (axis === 'x' ? b.w : b.h) / 2 ? -1 : 1;
                a[axis] += dir * size / 2;
                b[axis] -= dir * size / 2;
                const rel = (a[v] - b[v]) * dir;
                if (rel < 0) {
                    const bounce = -rel > 90 ? 0.3 : 0;
                    const push = -(1 + bounce) * rel / 2;
                    a[v] += push * dir;
                    b[v] -= push * dir;
                    if (-rel > 220) { a.spin += (Math.random() - 0.5) * 180; b.spin += (Math.random() - 0.5) * 180; }
                }
            }
        }
    }

    things.forEach(t => {
        t.vx *= Math.exp(-0.25 * dt);
        t.vy *= Math.exp(-0.25 * dt);
        if (t.touch) {
            t.vx *= Math.exp(-4 * dt);
            t.vy *= Math.exp(-4 * dt);
            if (Math.hypot(t.vx, t.vy) < 20 && gMag < 0.3) { t.vx = 0; t.vy = 0; }
        }
        
        let a = ((t.angle + 180) % 360 + 360) % 360 - 180;
        if (t.touch) {
            a *= 1 - Math.min(1, 9 * dt);
            t.spin *= Math.exp(-9 * dt);
        } else {
            t.spin *= Math.exp(-0.5 * dt);
        }
        t.angle = a;

        t.x = Math.max(0, Math.min(t.x, W - t.w));
        t.y = Math.max(0, Math.min(t.y, H - t.h));
        const tx = (t.x - t.x0) / t.k;
        const ty = (t.y - t.y0) / t.k;
        t.el.style.transform = `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) rotate(${t.angle.toFixed(2)}deg) ${t.base}`;
    });
}

function endFall() {
    if (!fallen) return;
    fallen = false;
    busy = true;
    cancelAnimationFrame(fallRaf);
    fallBtn.classList.remove('active');
    fallBtn.querySelector('span').textContent = 'Уронить';

    const list = things;
    things = [];
    list.forEach(t => {
        t.el.style.transition = 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
        t.el.style.transform = t.base || 'none';
    });
    setTimeout(() => {
        list.forEach(t => {
            t.el.style.transition = '';
            t.el.style.transform = '';
        });
        busy = false;
    }, 980);
}


function kickThings() {
    const mag = Math.hypot(grav.x, grav.y) || 1;
    things.forEach(t => {
        const power = 500 + Math.random() * 600;
        t.vx += -grav.x / mag * power + (Math.random() - 0.5) * 1000;
        t.vy += -grav.y / mag * power + (Math.random() - 0.5) * 1000;
        t.spin += (Math.random() - 0.5) * 480;
    });
}

function onShake() {
    if (!fxOn || busy) return;
    if (fallen) kickThings();
    else startFall();
}

fallBtn.addEventListener('click', () => {
    if (fallen) endFall();
    else startFall();
});


document.addEventListener('keydown', e => {
    if (!fxOn || !fallen) return;
    const dirs = { ArrowDown: [0, 1], ArrowUp: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    const d = dirs[e.key];
    if (!d) return;
    e.preventDefault();
    gravGoal.x = d[0];
    gravGoal.y = d[1];
});


const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const axisSign = isIOS ? -1 : 1; 

let sensorsOn = false;
let waitingForTap = false;
let lastSample = null;
let shakes = [];
let lastShake = 0;

function screenAngle() {
    if (screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle;
    return typeof window.orientation === 'number' ? window.orientation : 0;
}

function onMotion(e) {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x == null || a.y == null) return;
    const now = performance.now();

    
    const gx = -a.x * axisSign, gy = a.y * axisSign;
    let sx = gx, sy = gy;
    const angle = ((screenAngle() % 360) + 360) % 360;
    if (angle === 90) { sx = gy; sy = -gx; }
    else if (angle === 180) { sx = -gx; sy = -gy; }
    else if (angle === 270) { sx = -gy; sy = gx; }
    gravGoal.x = Math.max(-1, Math.min(1, sx / 9.81));
    gravGoal.y = Math.max(-1, Math.min(1, sy / 9.81));

    
    const z = a.z || 0;
    if (!lastSample) { lastSample = { x: a.x, y: a.y, z, t: now }; return; }
    if (now - lastSample.t < 100) return;
    const diff = Math.abs(a.x - lastSample.x) + Math.abs(a.y - lastSample.y) + Math.abs(z - lastSample.z);
    lastSample = { x: a.x, y: a.y, z, t: now };

    if (diff > 30) shakes.push(now);
    shakes = shakes.filter(t => now - t < 900);
    if (shakes.length >= 2 && now - lastShake > 1000) {
        lastShake = now;
        shakes = [];
        onShake();
    }
}

async function startSensors(fromClick) {
    if (sensorsOn || !window.DeviceMotionEvent) return;
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        if (!fromClick) {
            if (!waitingForTap) {
                waitingForTap = true;
                document.addEventListener('click', () => {
                    waitingForTap = false;
                    if (fxOn) startSensors(true);
                }, { once: true, capture: true });
            }
            return;
        }
        try {
            const answer = await DeviceMotionEvent.requestPermission();
            if (answer !== 'granted') return;
        } catch (e) {
            return;
        }
    }
    if (!fxOn) return;
    window.addEventListener('devicemotion', onMotion);
    sensorsOn = true;
}

function stopSensors() {
    window.removeEventListener('devicemotion', onMotion);
    sensorsOn = false;
    lastSample = null;
    shakes = [];
    gravGoal = { x: 0, y: 1 };
}


function turnOn(fromClick) {
    if (fxOn) return;
    clearTimeout(offTimer);
    fxOn = true;
    fxSwitch.setAttribute('aria-checked', 'true');
    document.body.classList.add('fx-on');

    drawCounter();
    refreshTotal();
    pollTimer = setInterval(refreshTotal, 20000);

    slimeReady = false;
    slimeLast = performance.now();
    cancelAnimationFrame(slimeRaf);
    slimeRaf = requestAnimationFrame(slimeFrame);

    startSensors(fromClick);
}

function turnOff() {
    if (!fxOn) return;
    fxOn = false;
    fxSwitch.setAttribute('aria-checked', 'false');
    stopSensors();
    clearInterval(pollTimer);
    if (xray) setXray(false);

    const wait = (fallen || busy) ? 1000 : 0;
    if (fallen) endFall();
    offTimer = setTimeout(() => {
        document.body.classList.remove('fx-on');
        cancelAnimationFrame(slimeRaf);
        slimeLetGo();
    }, wait);
}