var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var gameMode = ""; // Variabel global untuk menyimpan mode permainan
var playerScore = 0;
var player1Score = 0;
var player2Score = 0;
var aiScore = 0;
var aiSpeed = 2; // Kecepatan AI
var ballSpeed = 2; // Kecepatan Bola
var maxScore = 5; // Skor maksimum untuk menang
var gameOver = false; // Status permainan
let soundtrackAudio; // Variabel global untuk audio soundtrack
let gameOverAudio = new Audio('assets/sound/game-over.mp3'); // Audio game over
let victoryAudio = new Audio('assets/sound/victory.mp3'); // Audio victory
let isMobile = false;
// Dekstop controls
let keyConfig = {
    player1Up: "Q",    // Tombol default untuk Player 1
    player1Down: "A", 
    player2Up: "O",      
    player2Down: "L"
};


let waitingForKey = null;

var difficultySettings = {
    easy: { ballSpeed: 2, aiSpeed: 2, maxScore: 5 },
    medium: { ballSpeed: 6, aiSpeed: 6, maxScore: 10 },
    hard: { ballSpeed: 10, aiSpeed: 10 , maxScore: 20 },
};

function showSetting(){
    document.getElementById("setting-menu").style.display = "block";
    document.getElementById("mode-options").style.display = "none";
}

function menu(){
    document.getElementById("setting-menu").style.display = "none";
    document.getElementById("mode-options").style.display = "block";
}

// Checking Devices
if (window.innerWidth <= 768 && window.matchMedia("(orientation: landscape)") || 'ontouchstart' in window){
    isMobile = true;
    keyConfig = {
        player1UpButton: 'move-up',
        player1DownButton: 'move-down',
        player2UpButton: 'move-up2',  
        player2DownButton: 'move-down2'
    }
}

function changeKey(key) {
    waitingForKey = key;
    alert("Press the new key for " + key);
}

// For Touch Events (Mobile)
// These are your virtual buttons for mobile controls.
document.getElementById("move-up").addEventListener("touchstart", function() {
    heldDown["move-up"] = true;
}, { passive: true });

document.getElementById("move-up").addEventListener("touchend", function() {
    heldDown["move-up"] = false;
}, { passive: true });

document.getElementById("move-down").addEventListener("touchstart", function() {
    heldDown["move-down"] = true;
}, { passive: true });

document.getElementById("move-down").addEventListener("touchend", function() {
    heldDown["move-down"] = false;
}, { passive: true });

// Optional: Using touchmove to allow smoother input
document.getElementById("move-up").addEventListener("touchmove", function(event) {
    // Make sure the touch is inside the button's region
    heldDown["move-up"] = true;
}, { passive: true });

document.getElementById("move-down").addEventListener("touchmove", function(event) {
    // Make sure the touch is inside the button's region
    heldDown["move-down"] = true;
}, { passive: true });

document.getElementById("move-up2").addEventListener("touchstart", function() {
    heldDown["move-up2"] = true;
}, { passive: true });

document.getElementById("move-up2").addEventListener("touchend", function() {
    heldDown["move-up2"] = false;
}, { passive: true });

document.getElementById("move-down2").addEventListener("touchstart", function() {
    heldDown["move-down2"] = true;
}, { passive: true });

document.getElementById("move-down2").addEventListener("touchend", function() {
    heldDown["move-down2"] = false;
}, { passive: true });

// Optional: Using touchmove to allow smoother input
document.getElementById("move-up2").addEventListener("touchmove", function(event) {
    // Make sure the touch is inside the button's region
    heldDown["move-up2"] = true;
}, { passive: true });

document.getElementById("move-down2").addEventListener("touchmove", function(event) {
    // Make sure the touch is inside the button's region
    heldDown["move-down2"] = true;
}, { passive: true });

window.addEventListener("keydown", function(event) {
    if (isMobile) return;
    if (waitingForKey) {
        // Update keyConfig sesuai dengan tombol yang dipilih
        if (waitingForKey === 'up') {
            keyConfig.player1Up = event.key;
            document.getElementById('up-key').textContent = event.key;
        } else if (waitingForKey === 'down') {
            keyConfig.player1Down = event.key;
            document.getElementById('down-key').textContent = event.key;
        } else if (waitingForKey === 'up2') {
            keyConfig.player2Up = event.key;
            document.getElementById('up-key2').textContent = event.key;
        } else if (waitingForKey === 'down2') {
            keyConfig.player2Down = event.key;
            document.getElementById('down-key2').textContent = event.key;
        }

        waitingForKey = null;
    }
});

function saveSettings() {
    alert("Settings saved!");
    // Misalnya, Anda bisa menyimpan pengaturan ke localStorage atau server
    localStorage.setItem("keyConfig", JSON.stringify(keyConfig));
    // Atau lakukan sesuatu setelah pengaturan disimpan
}

// Cek pengaturan yang sudah disimpan
window.onload = function() {
    let savedConfig = localStorage.getItem("keyConfig");
    if (savedConfig) {
        keyConfig = JSON.parse(savedConfig);
        document.getElementById('up-key').textContent = keyConfig.player1Up;
        document.getElementById('down-key').textContent = keyConfig.player1Down;
        document.getElementById('up-key2').textContent = keyConfig.player2Up;
        document.getElementById('down-key2').textContent = keyConfig.player2Down;
    }
};

function chooseMode(mode) {
    gameMode = mode;

    // Sembunyikan tombol pilihan mode
    document.querySelector("#mode-options").style.display = "none";
    document.getElementById("setting-menu").style.display = "none";


    if (mode === "ai") {
        // Tampilkan pilihan kesulitan
        document.getElementById("difficulty-options").style.display = "block";
        if (isMobile){
            document.getElementById('mobile-controls').style.display = 'block';  // Show mobile controls for single-player
        }
    } else if (mode === "multiplayer") {
        // Langsung mulai game dengan pilihan kesulitan untuk ballSpeed saja
        document.getElementById("difficulty-options").style.display = "block";
        if (isMobile){
            document.getElementById('mobile-controls').style.display = 'block';  // Show mobile controls for two-player
            document.getElementById('mobile-controls-player2').style.display = 'block'; // Show mobile controls for two-player
        }
    }
}

function startGame(difficulty) {
    var settings = difficultySettings[difficulty];
    
    if (gameMode === "ai") {
        // Atur kecepatan bola dan AI berdasarkan kesulitan
        ball.xSpeed = settings.ballSpeed;
        ball.ySpeed = Math.random() < 0.5 ? -settings.ballSpeed : settings.ballSpeed; // Arah acak untuk ySpeed
        // Atur kecepatan AI
        aiSpeed = settings.aiSpeed;
        // Atur Skor Maks
        maxScore = settings.maxScore;
    } else if (gameMode === "multiplayer") {
        // Atur kecepatan bola berdasarkan kesulitan
        ball.xSpeed = settings.ballSpeed;
        ball.ySpeed = Math.random() < 0.5 ? -settings.ballSpeed : settings.ballSpeed; // Arah acak untuk ySpeed
    
        // Multiplayer tidak memerlukan AI
        aiSpeed = 0;
        ballSpeed = settings.ballSpeed;
        // Atur Skor Maks
        maxScore = settings.maxScore;
    }

    // Sembunyikan layar selamat datang
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("winner-message").style.display = "none";

    playerScore = 0;
    player1Score = 0;
    player2Score = 0;
    aiScore = 0;
    gameOver = false;
    ball.reset(ballSpeed);
    tick();

    // Memutar soundtrack
    soundtrackAudio = new Audio('assets/sound/soundtrack.mp3');
    soundtrackAudio.loop = true; // Jika kamu ingin musik terus berputar
    soundtrackAudio.volume = 1.0;
    soundtrackAudio.play();
}

function drawNet() {
    ctx.setLineDash([10, 15]); // Garis putus-putus
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]); // Reset kembali
}

// Paddle VS AI
var player = new paddle(20, canvas.height / 2 - 50, 25, 100, true);
var ai = new paddle(canvas.width - 45, canvas.height / 2 - 50, 25, 100, false);
// Paddle Multiplayer
var player1 = new paddle(20, canvas.height / 2 - 50, 25, 100, true); // Q dan A
var player2 = new paddle(canvas.width - 45, canvas.height / 2 - 50, 25, 100, false); // ArrowUp dan ArrowDown

function paddle(x, y, width, height, isPlayer) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedModifier = 0;
    this.isPlayer = isPlayer;

    this.hasCollidedWith = function(ball) {
        var paddleLeftWall = this.x;
        var paddleRightWall = this.x + this.width;
        var paddleTopWall = this.y;
        var paddleBottomWall = this.y + this.height;
        if (ball.x > paddleLeftWall
            && ball.x < paddleRightWall
            && ball.y > paddleTopWall
            && ball.y < paddleBottomWall) {
            return true;
        }
        return false;
    };

    paddle.prototype.move = function(dy) {
        var nextY = this.y;
        
        if (gameMode === "ai") {
            // Mode AI: Pemain bergerak dengan tombol ArrowUp dan ArrowDown
            if (dy < 0) { // Tombol "ArrowUp"
                nextY += -5;
                this.speedModifier = 1.5;
            } else if (dy > 0) { // Tombol "ArrowDown"
                nextY += 5;
                this.speedModifier = 1.5;
            } else {
                this.speedModifier = 0; // Reset kecepatan jika tidak ada tombol yang ditekan
            }
        } else if (gameMode === "multiplayer") {
            // Mode Multiplayer: Kontrol untuk Player 1 (Q, A) dan Player 2 (ArrowUp, ArrowDown)
            
            // Player 2: ArrowUp dan ArrowDown
            if (heldDown[keyConfig.player2Down] || isMobile && heldDown[keyConfig.player2DownButton]) { // ArrowDown (Player 2)
                nextY += 5;
                this.speedModifier = 1.5;
            } else if (heldDown[keyConfig.player2Up] || isMobile && heldDown[keyConfig.player2UpButton]) { // ArrowUp (Player 2)
                nextY += -5;
                this.speedModifier = 1.5;
            }
    
            // Player 1: Q dan A
            if (heldDown[keyConfig.player1Up] || isMobile && heldDown[keyConfig.player1UpButton]) { // Q (Player 1)
                nextY += -5;
                this.speedModifier = 1.5;
            } else if (heldDown[keyConfig.player1Down] || isMobile && heldDown[keyConfig.player1DownButton]) { // A (Player 1)
                nextY += 5;
                this.speedModifier = 1.5;
            } else {
                this.speedModifier = 0; // Reset kecepatan jika tidak ada tombol yang ditekan
            }
        }
    
        // Pastikan paddle tidak keluar dari canvas
        nextY = Math.max(0, Math.min(nextY, canvas.height - this.height)); // Batas atas dan bawah
        this.y = nextY;
    };
        
}

var ball = { x: canvas.width, y: canvas.height, radius: 7, xSpeed: 2, ySpeed: 0,
    reverseX: function() {
        this.xSpeed *= -1;
    },
    reverseY: function() {
        this.ySpeed *= -1;
    },
    reset: function (initialSpeed) {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;

        // Kecepatan awal
        var baseSpeed = initialSpeed || 2; // Gunakan kecepatan default 2 jika tidak ada parameter

        // Tentukan arah bola secara acak
        this.xSpeed = Math.random() < 0.5 ? baseSpeed : -baseSpeed;
        this.ySpeed = Math.random() < 0.5 ? baseSpeed : -baseSpeed;
    },
    isBouncing: function() {
        return ball.ySpeed != 0;
    },
    modifyXSpeedBy: function(modification) {
        modification = this.xSpeed < 0 ? modification * -1 : modification;
        var nextValue = this.xSpeed + modification;
        nextValue = Math.abs(nextValue) > 9 ? 9 : nextValue;
        this.xSpeed = nextValue;
    },
    modifyYSpeedBy: function(modification) {
        modification = this.ySpeed < 0 ? modification * -1 : modification;
        this.ySpeed += modification;
    }
};

function tick() {
    if (!gameOver) {
        updateGame();
        draw();
        window.setTimeout("tick()", 1000 / 60);
    }
}

function updateGame() {
    ball.x += ball.xSpeed;
    ball.y += ball.ySpeed;

    // VS AI
    if(gameMode === "ai"){
        if (ball.x < 0) {
            aiScore++;
            checkWinner(); // Periksa jika ada pemenang
            ball.reset(aiSpeed);
            return;
        }
        if (ball.x > canvas.width) {
            playerScore++;
            checkWinner(); // Periksa jika ada pemenang
            ball.reset(aiSpeed);
            return;
        }
        if (ball.y <= 0 || ball.y >= 480) {
            ball.reverseY();
        }
    }
    // Multiplayer
    else if(gameMode === "multiplayer"){
         // Gerakkan paddle Player 1 dan Player 2 sesuai tombol yang ditekan
        if (heldDown[keyConfig.player1Up] || isMobile && heldDown[keyConfig.player1UpButton]) {
            player1.move(-5);
        }
        if (heldDown[keyConfig.player1Down] || isMobile && heldDown[keyConfig.player1DownButton]) {
            player1.move(5);
        }
        if (heldDown[keyConfig.player2Up] || isMobile && heldDown[keyConfig.player2UpButton]) {
            player2.move(-5);
        }
        if (heldDown[keyConfig.player2Down] || isMobile && heldDown[keyConfig.player2DownButton]) {
            player2.move(5);
        }

        if (ball.x < 0) {
            player2Score++;
            checkWinner(); // Periksa jika ada pemenang
            ball.reset(ballSpeed - 4);
            return;
        }
        if (ball.x > canvas.width) {
            player1Score++;
            checkWinner(); // Periksa jika ada pemenang
            ball.reset(ballSpeed - 4);
            return;
        }
        if (ball.y <= 0 || ball.y >= 480) {
            ball.reverseY();
        }
    }

    // VS AI
    var collidedWithPlayer = player.hasCollidedWith(ball);
    var collidedWithAi = ai.hasCollidedWith(ball);
    // Multiplayer
    var collidedWithPlayer1 = player1.hasCollidedWith(ball);
    var collidedWithPlayer2 = player2.hasCollidedWith(ball);
    
    if(gameMode === "ai"){   
        if (collidedWithPlayer || collidedWithAi) {
            ball.reverseX();
            ball.modifyXSpeedBy(0.25);
            var speedUpValue = collidedWithPlayer ? player.speedModifier : ai.speedModifier;
            ball.modifyYSpeedBy(speedUpValue);
        }
        // Jika bola melewati paddle AI tanpa memantul
        if (ball.x > ai.x && ball.xSpeed > 0 && collidedWithAi) {
            ball.x = ai.x - ball.radius; // Reset posisi bola ke depan paddle
            ball.reverseX();
        }
        // Deteksi Tabrakan dengan Paddle Player
        if (ball.x + ball.radius > player.x && ball.x - ball.radius < player.x + player.width) {
            if (ball.y + ball.radius > player.y && ball.y - ball.radius < player.y + player.height) {
                // Pastikan bola berada sedikit di luar paddle setelah tabrakan
                if (ball.xSpeed > 0) { // Bola bergerak ke kanan
                    ball.x = player.x - ball.radius;  // Posisi bola di depan paddle player
                } else if (ball.xSpeed < 0) { // Bola bergerak ke kiri
                    ball.x = player.x + player.width + ball.radius; // Posisi bola di depan paddle player
                }

                // Balikkan arah kecepatan bola secara horizontal
                ball.reverseX();

                // Mencegah bola tidak melayang atau terhisap ke dalam paddle
                if (ball.y + ball.radius > player.y + player.height) {
                    ball.y = player.y + player.height + ball.radius;
                } else if (ball.y - ball.radius < player.y) {
                    ball.y = player.y - ball.radius;
                }
            }
        }
    }else if(gameMode === "multiplayer"){
        if (collidedWithPlayer1 || collidedWithPlayer2) {
            ball.reverseX();
            ball.modifyXSpeedBy(0.25);
            var speedUpValue = collidedWithPlayer1 ? player1.speedModifier : player2.speedModifier;
            ball.modifyYSpeedBy(speedUpValue);
        }
        // Jika bola melewati player 1 tanpa memantul
        else if (ball.x > player1.x && ball.xSpeed > 0 && collidedWithPlayer1) {
            ball.x = player1.x - ball.radius; // Reset posisi bola ke depan paddle
            ball.reverseX();
        }
        // Jika bola melewati player 2 tanpa memantul
        else if (ball.x > player2.x && ball.xSpeed > 0 && collidedWithPlayer) {
            ball.x = player2.x - ball.radius; // Reset posisi bola ke depan paddle
            ball.reverseX();
        }
    }


   // Gerakkan paddle pemain sesuai input
    if (gameMode === "multiplayer") {
        if (heldDown[keyConfig.player1Up] || isMobile && heldDown[keyConfig.player1UpButton]) { // Tombol untuk Player 1 (ke atas)
            player1.move(-5);
        }
        if (heldDown[keyConfig.player1Down] || isMobile && heldDown[keyConfig.player1DownButton]) { // Tombol untuk Player 1 (ke bawah)
            player1.move(5);
        }
        if (heldDown[keyConfig.player2Up] || isMobile && heldDown[keyConfig.player2UpButton]) { // Tombol untuk Player 2 (ke atas)
            player2.move(-5);
        }
        if (heldDown[keyConfig.player2Down] || isMobile && heldDown[keyConfig.player2DownButton]) { // Tombol untuk Player 2 (ke bawah)
            player2.move(5);
        }
    } else if (gameMode === "ai") {
        if (heldDown[keyConfig.player1Up] || isMobile && heldDown[keyConfig.player1UpButton]) { // Tombol untuk pemain melawan AI (ke atas)
            player.move(-5);
        }
        if (heldDown[keyConfig.player1Down] || isMobile && heldDown[keyConfig.player1DownButton]) { // Tombol untuk pemain melawan AI (ke bawah)
            player.move(5);
        }

        // AI hanya bergerak di mode VS AI
        var aiMiddle = ai.y + ai.height / 2;
        if (aiMiddle < ball.y) {
            ai.y += aiSpeed;
        }
        if (aiMiddle > ball.y) {
            ai.y -= aiSpeed;
        }
    }
}

this.hasCollidedWith = function(ball) {
    const paddleLeftWall = this.x;
    const paddleRightWall = this.x + this.width;
    const paddleTopWall = this.y;
    const paddleBottomWall = this.y + this.height;

    // Deteksi lintasan bola (untuk menghindari bola melompati paddle)
    const ballNextX = ball.x + ball.xSpeed;
    const ballNextY = ball.y + ball.ySpeed;

    const isWithinXRange = ballNextX > paddleLeftWall && ballNextX < paddleRightWall;
    const isWithinYRange = ballNextY > paddleTopWall && ballNextY < paddleBottomWall;

    return isWithinXRange && isWithinYRange;
};

function checkWinner() {
    if(gameMode === "ai"){
        if (playerScore >= maxScore) {
            showWinner("Kamu");
        } else if (aiScore >= maxScore) {
            showWinner("AI");
        }
    }else if(gameMode === "multiplayer"){
        if (player1Score >= maxScore) {
            showWinner("Player 1");
        } else if (player2Score >= maxScore) {
            showWinner("Player 2");
        }
    }
}

function showWinner(winner) {
    gameOver = true;
    var winnerText = document.getElementById("winner-text");
    var winnerMessage = document.getElementById("winner-message");

    // Hentikan audio soundtrack
    if (soundtrackAudio) {
            soundtrackAudio.pause(); // Stop audio soundtrack
            soundtrackAudio.currentTime = 0; // Setel kembali ke awal audio
    }
    
    if(gameMode === "ai"){
        if (winner === "AI") {
            winnerText.innerHTML = "Opss, DEFEAT!";
            winnerText.style.color = 'red';
            
            // Memutar efek suara game over
            gameOverAudio.play();
        } else {
            winnerText.innerHTML = "Yeah, VICTORY!";
            winnerText.style.color = 'white';
            
            // Memutar efek suara victory
            victoryAudio.play();
        }
    }else if(gameMode === "multiplayer"){
        if (winner === "Player 1") {
            winnerText.innerHTML = "Player 1 WON!";
            winnerText.style.color = 'white';
            
            // Memutar efek suara victory
            victoryAudio.play();
        } else {
            winnerText.innerHTML = "Player 2 WON!";
            winnerText.style.color = 'white';
            
            // Memutar efek suara victory
            victoryAudio.play();
        }
    }
    
    winnerMessage.style.display = "flex";
}

function showWelcomeScreen() {
    // Sembunyikan pesan pemenang
    document.getElementById("winner-message").style.display = "none";

    // Tampilkan menu selamat datang
    document.getElementById("welcome-screen").style.display = "flex";
    document.getElementById("mode-options").style.display = "block";
    document.getElementById("difficulty-options").style.display = "none";

    // // Reset elemen canvas
    // canvas.style.display = "none";

    // Reset skor
    player.score = 0;
    player1.score = 0;
    player2.score = 0;
    ai.score = 0;
}

function showWinnerMessage(winner) {
    // Tampilkan pesan pemenang
    if(gameMode === "ai"){
        var winnerText = winner === 'player' ? "YOU WON!" : "YOU DEFEAT!";
    }else if(gameMode === "multiplayer"){
        var winnerText = winner === 'player1' ? "PLAYER 1 WON!" : "PLAYER 2 WON!";
    }
    document.getElementById("winner-text").textContent = winnerText;

    // Tampilkan elemen pesan pemenang
    document.getElementById("winner-message").style.display = "flex";

    // Sembunyikan canvas
    canvas.style.display = "none";
}


function draw() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tambahkan judul permainan di canvas dengan efek ukiran
    ctx.font = "bold 3em Trade Winds";
    ctx.textAlign = "center";

     // Gradient untuk teks
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#FFFFFF"); // Putih
    gradient.addColorStop(1, "#FFFF66"); // Kuning terang

    // Efek transparansi
    ctx.globalAlpha = 0.8;

    // Efek bayangan
    ctx.shadowColor = "#005500";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    // Teks judul
    ctx.fillStyle = gradient;
    ctx.fillText("Tennis Legends :", canvas.width / 2, canvas.height / 2 - 30);

    // Efek outline di teks
    ctx.strokeStyle = "#212121"; // Hijau neon
    ctx.lineWidth = 2; // Ketebalan outline
    ctx.strokeText("Tennis Legends :", canvas.width / 2, canvas.height / 2 - 30);

    // Teks subjudul
    ctx.font = "italic 1.5em Trade Winds";
    ctx.fillStyle = "#FFFF66";
    ctx.fillText("Smash, Spin, Dominate!", canvas.width / 2, canvas.height / 2);

    // Reset efek shadow dan transparansi
    ctx.globalAlpha = 1.0;
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    drawNet();
    if(gameMode === "ai"){
        renderPaddle(player);
        renderPaddle(ai);
    }else{
        renderPaddle(player1);
        renderPaddle(player2);
    }
    renderBall(ball);
    renderScore();
}

// Membuat objek gambar untuk paddle
let paddleImageMerah = new Image();
paddleImageMerah.src = 'assets/img/merah.png';  // Gambar paddle merah

let paddleImageBiru = new Image();
paddleImageBiru.src = 'assets/img/biru.png';  // Gambar paddle biru

let ballImage = new Image();
ballImage.src = 'assets/img/pingpong.png';  // Gambar bola

// Fungsi untuk menggambar paddle menggunakan gambar
function renderPaddle(paddle) {
    // Pilih gambar berdasarkan kondisi paddle (misalnya, paddle pemain atau AI)
    let imageToDraw;
    
    // Misalnya, gunakan gambar merah untuk pemain, dan biru untuk AI
    if (paddle.isPlayer) {
        imageToDraw = paddleImageMerah;  // Gunakan gambar merah untuk paddle pemain
    } else {
        imageToDraw = paddleImageBiru;  // Gunakan gambar biru untuk paddle AI
    }

    // Gambar paddle menggunakan gambar yang sudah dipilih
    ctx.drawImage(imageToDraw, paddle.x, paddle.y, paddle.width, paddle.height);
}


function renderBall(ball) {
    if (ballImage.complete) {
        // Gambar bola menggunakan drawImage
        ctx.drawImage(ballImage, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
    } else {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#FF5c00";
        ctx.fill();
    }
}

function renderScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    if(gameMode === "ai"){
        ctx.fillText("Player: " + playerScore, 50, 30);
        ctx.fillText("AI: " + aiScore, 520, 30);
    }else{
        ctx.fillText("Player 1: " + player1Score, 50, 30);
        ctx.fillText("Player 2: " + player2Score, 520, 30);
    }
}

var heldDown = {};

window.addEventListener("keydown", function(event) {
    heldDown[event.key] = true;
});

window.addEventListener("keyup", function(event) {
    heldDown[event.key] = false;
});
