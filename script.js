const shareBtn = document.getElementById('shareBtn');
const toast = document.getElementById('toastNotification');
const card = document.getElementById('card');
const avatar = document.getElementById('avatar');

const mainContent = document.getElementById('mainContent');
const gameZone = document.getElementById('gameZone');
const gameTitle = document.getElementById('gameTitle');
const gameInfo = document.getElementById('gameInfo');
const gameContent = document.getElementById('gameContent');
const exitGameBtn = document.getElementById('exitGameBtn');


shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 2500);
    });
});


let clickCount = 0;
let clickTimeout;
avatar.addEventListener('click', () => {
    if (isGameActive) return;
    clickCount++;
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => { clickCount = 0; }, 1500);

    if (clickCount === 5) {
        clickCount = 0;
        selectRandomGame();
    }
});


const gamesList = [
    { name: "Орел или Решка", launch: playCoinFlip },
    { name: "Змейка", launch: playSnake },
    { name: "Разрежь Фрукты", launch: playFruitNinja }
];

let isGameActive = false;
function selectRandomGame() {
    isGameActive = true;
    mainContent.style.display = 'none';
    gameZone.style.display = 'block';
    
    const randomIndex = Math.floor(Math.random() * gamesList.length);
    const chosenGame = gamesList[randomIndex];
    
    gameTitle.textContent = chosenGame.name;
    gameContent.innerHTML = ""; 
    chosenGame.launch();
}

// ----------------------------------------------------
// ИГРА 1: ОРЕЛ ИЛИ РЕШКА
// ----------------------------------------------------
function playCoinFlip() {
    gameInfo.textContent = "Нажми на монету, чтобы подбросить!";
    
    const coinCont = document.createElement('div'); coinCont.className = 'coin-container';
    const coin = document.createElement('div'); coin.className = 'coin';
    coin.innerHTML = `
        <div class="coin-side coin-heads">🦅</div>
        <div class="coin-side coin-tails">🪙</div>
    `;
    coinCont.appendChild(coin); gameContent.appendChild(coinCont);

    let isFlapping = false;
    coinCont.addEventListener('click', () => {
        if (isFlapping) return;
        isFlapping = true;
        gameInfo.textContent = "Монетка летит...";
        
       
        coin.style.transition = "none";
        coin.style.transform = "rotateY(0deg)";
        
        setTimeout(() => {
            coin.style.transition = "transform 2s cubic-bezier(0.1, 1, 0.1, 1)";
            const isHeads = Math.random() > 0.5;
            const rotation = 1800 + (isHeads ? 0 : 180);
            
            coin.style.transform = `rotateY(${rotation}deg)`;
            
            setTimeout(() => {
                gameInfo.textContent = isHeads ? "Выпал Орел! 🦅" : "Выпала Решка! 🪙";
                isFlapping = false;
            }, 2000);
        }, 50);
    });
}

// ----------------------------------------------------
// ИГРА 2: ЗМЕЙКА
// ----------------------------------------------------
let snakeInterval;
function playSnake() {
    gameInfo.textContent = "Счет: 0";
    
    const canv = document.createElement('canvas');
    canv.id = "snakeCanvas"; canv.width = 220; canv.height = 140;
    
    const joy = document.createElement('div'); joy.className = 'joystick';
    joy.innerHTML = `
        <button class="joy-btn" id="jUp">▲</button>
        <div class="joy-row">
            <button class="joy-btn" id="jLeft">◀</button>
            <button class="joy-btn" id="jRight">▶</button>
        </div>
        <button class="joy-btn" id="jDown">▼</button>
    `;
    gameContent.appendChild(canv); gameContent.appendChild(joy);
    
    const sCtx = canv.getContext('2d');
    let sn = [{x: 100, y: 70}, {x: 90, y: 70}];
    let sScore = 0; let sdx = 10, sdy = 0;
    let fd = {x: 30, y: 30};
    
    function loop() {
        const head = {x: sn.x + sdx, y: sn.y + sdy};
        if (head.x < 0 || head.x >= canv.width || head.y < 0 || head.y >= canv.height) {
            clearInterval(snakeInterval); gameInfo.textContent = `Конец! Твой счет: ${sScore}`; return;
        }
        for(let i=1; i<sn.length; i++) {
            if(sn[i].x === head.x && sn[i].y === head.y) { clearInterval(snakeInterval); gameInfo.textContent = `Конец! Твой счет: ${sScore}`; return; }
        }
        
        sn.unshift(head);
        if (head.x === fd.x && head.y === fd.y) {
            sScore++; gameInfo.textContent = `Счет: ${sScore}`;
            fd = { x: Math.floor(Math.random()*22)*10, y: Math.floor(Math.random()*14)*10 };
        } else { sn.pop(); }
        
        sCtx.clearRect(0,0,canv.width,canv.height);
        sCtx.fillStyle = '#ef4444'; sCtx.fillRect(fd.x, fd.y, 10, 10);
        sCtx.fillStyle = '#10b981'; sn.forEach(p => sCtx.fillRect(p.x, p.y, 10, 10));
    }

    document.getElementById('jUp').addEventListener('click', () => { if(sdy===0) { sdx=0; sdy=-10; } });
    document.getElementById('jDown').addEventListener('click', () => { if(sdy===0) { sdx=0; sdy=10; } });
    document.getElementById('jLeft').addEventListener('click', () => { if(sdx===0) { sdx=-10; sdy=0; } });
    document.getElementById('jRight').addEventListener('click', () => { if(sdx===0) { sdx=10; sdy=0; } });

    clearInterval(snakeInterval);
    snakeInterval = setInterval(loop, 140);
}

// ----------------------------------------------------
// ИГРА 3: РАЗРЕЖЬ ФРУКТЫ
// ----------------------------------------------------
let fruitTimer, fruitGravityInterval;
function playFruitNinja() {
    let fnScore = 0; let missedFruits = 0;
    gameInfo.textContent = "Жизни: ❤️❤️❤️ | Очки: 0";
    
    const itemsArr = ["🍎", "🍉", "🍊", "🍌", "💣"]; 
    let activeItems = [];

    function spawnItem() {
        if (!isGameActive) return;
        const itemEl = document.createElement('div');
        itemEl.className = 'falling-fruit';
        
        const randomItem = itemsArr[Math.floor(Math.random() * itemsArr.length)];
        itemEl.textContent = randomItem;
        itemEl.style.left = Math.floor(Math.random() * (gameContent.clientWidth - 40)) + "px";
        itemEl.style.top = "-50px";
        
        let posY = -50;
        let speedY = Math.random() * 2 + 1.5;
        
        const sliceAction = () => {
            if (itemEl.style.opacity === "0") return;
            
            if (randomItem === "💣") {
                missedFruits++;
                itemEl.textContent = "💥"; itemEl.style.opacity = "0";
                
                if (missedFruits >= 3) {
                    gameOver();
                } else {
                    gameInfo.textContent = `Жизни: ${"❤️".repeat(3 - missedFruits)} | Очки: ${fnScore}`;
                }
            } else {
                fnScore++;
                gameInfo.textContent = `Жизни: ${"❤️".repeat(3 - missedFruits)} | Очки: ${fnScore}`;
                itemEl.textContent = "✨"; itemEl.style.opacity = "0";
            }
            
            setTimeout(() => itemEl.remove(), 200);
            activeItems = activeItems.filter(f => f.el !== itemEl);
        };

        itemEl.addEventListener('touchstart', (e) => { e.preventDefault(); sliceAction(); });
        itemEl.addEventListener('mousedown', sliceAction);

        gameContent.appendChild(itemEl);
        activeItems.push({ el: itemEl, y: posY, speed: speedY, isBomb: (randomItem === "💣") });
        fruitTimer = setTimeout(spawnItem, Math.random() * 1000 + 700);
    }

    function updatePositions() {
        activeItems.forEach(item => {
            item.y += item.speed;
            item.el.style.top = item.y + "px";
            
            if (item.y > gameContent.clientHeight && item.el.style.opacity !== "0") {
                item.el.remove();
                activeItems = activeItems.filter(f => f.el !== item.el);
                
                if (!item.isBomb) {
                    missedFruits++;
                    if (missedFruits >= 3) {
                        gameOver();
                    } else {
                        gameInfo.textContent = `Жизни: ${"❤️".repeat(3 - missedFruits)} | Очки: ${fnScore}`;
                    }
                }
            }
        });
    }

    function gameOver() {
        clearInterval(fruitGravityInterval); clearTimeout(fruitTimer);
        gameInfo.textContent = `Игра окончена! Очки: ${fnScore}`;
        gameContent.innerHTML = "";
    }

    spawnItem();
    fruitGravityInterval = setInterval(updatePositions, 20);
}


function closeGameMode() {
    clearInterval(snakeInterval);
    clearTimeout(fruitTimer);
    clearInterval(fruitGravityInterval);
    isGameActive = false;
    gameZone.style.display = 'none';
    mainContent.style.display = 'block';
    gameContent.innerHTML = "";
}
exitGameBtn.addEventListener('click', closeGameMode);
    