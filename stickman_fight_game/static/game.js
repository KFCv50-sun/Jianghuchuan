const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 玩家火柴人
const player = {
    x: 100,
    y: 300,
    width: 50,
    height: 100,
    speed: 5,
    health: 100,
    attacking: false,
    hasWeapon: false
};

// 电脑火柴人
const computer = {
    x: 650,
    y: 300,
    width: 50,
    height: 100,
    speed: 3,
    health: 100,
    attacking: false,
    hasWeapon: false
};

// 武器
const weapons = [
    {
        x: canvas.width / 2 - 15,
        y: 320,
        width: 30,
        height: 60,
        active: true
    },
    {
        x: 50,
        y: 320,
        width: 30,
        height: 60,
        active: true
    },
    {
        x: canvas.width - 80,
        y: 320,
        width: 30,
        height: 60,
        active: true
    }
];

// 添加游戏状态变量
let gameOver = false;

// 绘制火柴人
function drawStickman(x, y, color, hasWeapon) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // 身体
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 50);
    ctx.stroke();
    
    // 头
    ctx.beginPath();
    ctx.arc(x, y - 60, 10, 0, Math.PI * 2);
    ctx.stroke();
    
    // 手臂
    ctx.beginPath();
    ctx.moveTo(x, y - 40);
    ctx.lineTo(x - 20, y - 20);
    ctx.moveTo(x, y - 40);
    ctx.lineTo(x + 20, y - 20);
    ctx.stroke();
    
    // 腿
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 20, y + 30);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 20, y + 30);
    ctx.stroke();

    // 如果有武器，画一个剑
    if (hasWeapon) {
        ctx.beginPath();
        ctx.moveTo(x + 20, y - 20);
        ctx.lineTo(x + 40, y - 40);
        ctx.stroke();
    }
}

// 绘制武器
function drawWeapon(weapon) {
    if (weapon.active) {
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 3;
        
        // 剑柄
        ctx.beginPath();
        ctx.moveTo(weapon.x + weapon.width / 2, weapon.y + weapon.height);
        ctx.lineTo(weapon.x + weapon.width / 2, weapon.y + weapon.height * 0.7);
        ctx.stroke();
        
        // 剑格
        ctx.beginPath();
        ctx.moveTo(weapon.x, weapon.y + weapon.height * 0.7);
        ctx.lineTo(weapon.x + weapon.width, weapon.y + weapon.height * 0.7);
        ctx.stroke();
        
        // 剑身
        ctx.beginPath();
        ctx.moveTo(weapon.x + weapon.width / 2, weapon.y);
        ctx.lineTo(weapon.x + weapon.width / 2, weapon.y + weapon.height * 0.7);
        ctx.stroke();
    }
}

// 更新游戏状态
function update() {
    if (gameOver) return;

    // 玩家移动
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;
    
    // 电脑AI
    if (computer.x > player.x) computer.x -= computer.speed;
    else if (computer.x < player.x) computer.x += computer.speed;
    
    // 武器拾取检测
    weapons.forEach(weapon => {
        if (weapon.active) {
            if (Math.abs(player.x + player.width / 2 - (weapon.x + weapon.width / 2)) < 30 && 
                Math.abs(player.y - weapon.y) < 60) {
                player.hasWeapon = true;
                weapon.active = false;
            } else if (Math.abs(computer.x + computer.width / 2 - (weapon.x + weapon.width / 2)) < 30 && 
                       Math.abs(computer.y - weapon.y) < 60) {
                computer.hasWeapon = true;
                weapon.active = false;
            }
        }
    });
    
    // 攻击检测
    if (player.attacking && Math.abs(player.x - computer.x) < 60) {
        computer.health -= player.hasWeapon ? 30 : 10;
        player.attacking = false;
    }
    
    if (computer.attacking && Math.abs(player.x - computer.x) < 60) {
        player.health -= computer.hasWeapon ? 20 : 5;
        computer.attacking = false;
    }
    
    // 电脑随机攻击
    if (Math.random() < 0.02) computer.attacking = true;
    
    // 检查死亡条件
    if (player.health <= 0 || computer.health <= 0) {
        gameOver = true;
    }
}

// 绘制游戏
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawStickman(player.x, player.y, 'blue', player.hasWeapon);
    drawStickman(computer.x, computer.y, 'red', computer.hasWeapon);
    weapons.forEach(drawWeapon);
    
    // 绘制血条
    ctx.fillStyle = 'green';
    ctx.fillRect(10, 10, player.health * 2, 20);
    ctx.fillRect(canvas.width - 210, 10, computer.health * 2, 20);

    // 显示游戏结束信息
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        if (player.health <= 0) {
            ctx.fillText('游戏结束 - 电脑获胜!', canvas.width / 2, canvas.height / 2);
        } else {
            ctx.fillText('游戏结束 - 玩家获胜!', canvas.width / 2, canvas.height / 2);
        }
        ctx.font = '20px Arial';
        ctx.fillText('按空格键重新开始', canvas.width / 2, canvas.height / 2 + 40);
    }
}

// 游戏循环
function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// 键盘控制
const keys = {};

// 修改键盘事件监听器
document.addEventListener('keydown', (e) => {
    if (gameOver && e.code === 'Space') {
        resetGame();
    } else {
        keys[e.code] = true;
        if (e.code === 'Space') player.attacking = true;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 添加重置游戏函数
function resetGame() {
    player.health = 100;
    computer.health = 100;
    player.x = 100;
    computer.x = 650;
    player.hasWeapon = false;
    computer.hasWeapon = false;
    weapons.forEach(weapon => weapon.active = true);
    gameOver = false;
    gameLoop();  // 重新开始游戏循环
}

// 开始游戏
gameLoop();
