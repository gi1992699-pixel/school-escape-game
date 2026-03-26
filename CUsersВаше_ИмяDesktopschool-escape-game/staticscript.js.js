let player = { x: 280, y: 180 };
let enemy = { x: 50, y: 50 };
let item = { x: 400, y: 150 };
let exit = { x: 600, y: 350 };

let hp = 100;
let stamina = 100;
let itemsCollected = 0;
let gameActive = true;
let gameWin = false;
let startTime = Date.now();
let timerInterval;

const playerEl = document.getElementById('player');
const enemyEl = document.getElementById('enemy');
const itemEl = document.getElementById('item');
const healthFill = document.getElementById('healthFill');
const staminaFill = document.getElementById('staminaFill');
const healthText = document.getElementById('healthText');
const staminaText = document.getElementById('staminaText');
const messageEl = document.getElementById('message');
const itemCount = document.getElementById('itemCount');

function getBounds() {
    const container = document.querySelector('.game-container');
    return {
        minX: 10,
        maxX: container.clientWidth - 50,
        minY: 10,
        maxY: container.clientHeight - 50
    };
}

function updateTimer() {
    if (!gameActive) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer').textContent = `⏱️ Время: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}
timerInterval = setInterval(updateTimer, 1000);

function updatePositions() {
    playerEl.style.top = player.y + 'px';
    playerEl.style.left = player.x + 'px';
    enemyEl.style.top = enemy.y + 'px';
    enemyEl.style.left = enemy.x + 'px';
    itemEl.style.top = item.y + 'px';
    itemEl.style.left = item.x + 'px';
    healthFill.style.width = Math.max(0, hp) + '%';
    staminaFill.style.width = stamina + '%';
    healthText.textContent = Math.floor(Math.max(0, hp));
    staminaText.textContent = Math.floor(stamina);
    itemCount.textContent = itemsCollected;
}

function checkCollisions() {
    if (!gameActive) return;
    let dx = player.x - enemy.x, dy = player.y - enemy.y;
    if (Math.hypot(dx, dy) < 40) {
        hp -= 2;
        messageEl.textContent = "😱 УЧИТЕЛЬ РЯДОМ! -2 здоровья!";
        if (hp <= 0) {
            hp = 0;
            gameActive = false;
            messageEl.textContent = "💀 Тебя поймали... Двойка в дневнике!";
            clearInterval(timerInterval);
        }
    }
    if (Math.hypot(player.x - item.x, player.y - item.y) < 30 && itemsCollected < 3 && gameActive) {
        itemsCollected++;
        stamina = Math.min(100, stamina + 30);
        messageEl.textContent = `📝 Нашел шпаргалку! (${itemsCollected}/3) +30 выносливости!`;
        if (itemsCollected < 3) {
            const b = getBounds();
            item.x = 30 + Math.random() * (b.maxX - 60);
            item.y = 30 + Math.random() * (b.maxY - 60);
        } else {
            itemEl.style.display = 'none';
            messageEl.textContent = "🎯 Все шпаргалки собраны! Беги к выходу!";
        }
    }
    if (Math.hypot(player.x - exit.x, player.y - exit.y) < 40 && gameActive) {
        if (itemsCollected >= 3) {
            gameActive = false;
            gameWin = true;
            messageEl.textContent = "🎉 ПОБЕДА! Ты выбрался из школы! 🎉";
            clearInterval(timerInterval);
        } else {
            messageEl.textContent = `🚫 Нужно собрать все шпаргалки! (${itemsCollected}/3)`;
        }
    }
    updatePositions();
}

function moveEnemy() {
    if (!gameActive || gameWin) return;
    let dx = player.x - enemy.x, dy = player.y - enemy.y;
    let dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < 300) {
        enemy.x += (dx / dist) * 1.8;
        enemy.y += (dy / dist) * 1.8;
    }
    const b = getBounds();
    enemy.x = Math.max(20, Math.min(b.maxX - 20, enemy.x));
    enemy.y = Math.max(20, Math.min(b.maxY - 20, enemy.y));
    checkCollisions();
}

function movePlayer(dx, dy) {
    if (!gameActive || gameWin) return;
    if (stamina <= 0) {
        messageEl.textContent = "💤 Нет выносливости! Подожди...";
        return;
    }
    let newX = player.x + dx, newY = player.y + dy;
    const b = getBounds();
    if (newX >= b.minX && newX <= b.maxX - 30 && newY >= b.minY && newY <= b.maxY - 30) {
        player.x = newX;
        player.y = newY;
        stamina = Math.max(0, stamina - 1.5);
        updatePositions();
        moveEnemy();
    }
}

setInterval(() => {
    if (gameActive && stamina < 100 && !gameWin) {
        stamina = Math.min(100, stamina + 0.8);
        staminaFill.style.width = stamina + '%';
        staminaText.textContent = Math.floor(stamina);
    }
}, 100);

function resetGame() {
    const b = getBounds();
    player = { x: b.minX + 50, y: b.minY + 50 };
    enemy = { x: b.minX + 20, y: b.minY + 20 };
    item = { x: b.maxX - 100, y: b.minY + 80 };
    exit = { x: b.maxX - 70, y: b.maxY - 70 };
    hp = 100;
    stamina = 100;
    itemsCollected = 0;
    gameActive = true;
    gameWin = false;
    itemEl.style.display = 'block';
    messageEl.textContent = "🔦 Найди 3 шпаргалки и сбеги к выходу!";
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    updatePositions();
}

document.getElementById('btnUp').onclick = () => movePlayer(0, -20);
document.getElementById('btnDown').onclick = () => movePlayer(0, 20);
document.getElementById('btnLeft').onclick = () => movePlayer(-20, 0);
document.getElementById('btnRight').onclick = () => movePlayer(20, 0);
document.getElementById('resetBtn').onclick = resetGame;

window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'ArrowUp') movePlayer(0, -20);
    if (e.key === 's' || e.key === 'ArrowDown') movePlayer(0, 20);
    if (e.key === 'a' || e.key === 'ArrowLeft') movePlayer(-20, 0);
    if (e.key === 'd' || e.key === 'ArrowRight') movePlayer(20, 0);
    e.preventDefault();
});

window.addEventListener('resize', () => updatePositions());
setTimeout(() => resetGame(), 100);