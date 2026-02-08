const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  parent: 'game',
  backgroundColor: '#ffffff',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
      debug: false // mets true si tu veux voir les hitbox
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

let player;
let obstacles;
let ground;
let score = 0;
let scoreText;
let gameOver = false;
let spawnTimer;

new Phaser.Game(config);

function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('obstacle', 'assets/obstacle.png');
}

function create() {
  const w = this.scale.width;
  const h = this.scale.height;

  // ================= SOL =================
  const solY = h * 0.75; // 1/4 depuis le bas
  ground = this.physics.add.staticGroup();
  ground
    .create(w / 2, solY)
    .setDisplaySize(w, 20)
    .refreshBody();

  // ================= JOUEUR =================
  player = this.physics.add.sprite(80, solY, 'player');

  // 🔥 CLÉ DU PROBLÈME
  player.setOrigin(0.5, 1); // origin en bas de l’image

  // taille visuelle
  player.displayWidth = 80;
  player.displayHeight = 140;

  // hitbox = taille du sprite
  player.body.setSize(player.displayWidth, player.displayHeight);
  player.body.setOffset(0, 0);

  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, ground);

  // ================= OBSTACLES =================
  obstacles = this.physics.add.group();
  this.physics.add.collider(obstacles, ground);
  this.physics.add.overlap(player, obstacles, hit, null, this);

  // ================= SCORE =================
  scoreText = this.add.text(10, 10, 'Score: 0', {
    font: '22px Arial',
    fill: '#000'
  });

  // ================= SPAWN =================
  spawnTimer = this.time.addEvent({
    delay: 1500,
    loop: true,
    callback: spawnObstacle,
    callbackScope: this
  });

  // ================= CONTROLES =================
  this.input.on('pointerdown', jump);
  this.input.keyboard.on('keydown-SPACE', jump);
}

function jump() {
  if (gameOver) return;

  if (player.body.blocked.down) {
    player.setVelocityY(-550);
  }
}

function spawnObstacle() {
  if (gameOver) return;

  const h = this.scale.height;
  const solY = h * 0.75;

  const obs = obstacles.create(400, solY, 'obstacle');

  obs.setOrigin(0.5, 1);

  obs.displayWidth = 50;
  obs.displayHeight = 100;

  obs.body.setSize(obs.displayWidth, obs.displayHeight);
  obs.body.setOffset(0, 0);

  obs.body.allowGravity = false;
  obs.setImmovable(true);
  obs.setVelocityX(-250);
}

function hit() {
  gameOver = true;
  player.setTint(0xff0000);
  spawnTimer.remove();

  this.add.text(180, 320, 'GAME OVER\nClique pour rejouer', {
    font: '26px Arial',
    fill: '#000',
    align: 'center'
  }).setOrigin(0.5);

  this.input.once('pointerdown', () => {
    this.scene.restart();
    score = 0;
    gameOver = false;
  });
}

function update() {
  if (gameOver) return;

  score++;
  scoreText.setText('Score: ' + Math.floor(score / 10));

  obstacles.getChildren().forEach(obs => {
    if (obs.x < -100) obs.destroy();
  });
}
