const
  numRows = 6,
  numCols = 5,
  sectionY = 83,
  sectionX = 101,
  playerInitPos = [2, 5];

// Enemies our player must avoid
var Enemy = function() {
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started

  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/enemy-bug.png';
  this.x = 0;
  this.y = 100;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  this.x += 5 * dt;
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
  this.sprite = 'images/char-boy.png';
  this.resetPlayer();
};

Object.defineProperty(Player.prototype, "x", {
  get: function() {
    return this.col * sectionX;
  }
});

Object.defineProperty(Player.prototype, "y", {
  get: function() {
    return (this.row - 0.5) * sectionY;
  }
});


Player.prototype.update = function(dt) {

};

Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.resetPlayer = function() {
  this.col = playerInitPos[0];
  this.row = playerInitPos[1];
}

Player.prototype.movePlayer = function(direction) {
  switch (direction) {
    case 'left':
      if (this.col > 0) {
        this.col -= 1;
      }
      break;
    case 'right':
      if (this.col < numCols - 1) {
        this.col += 1;
      }
      break;
    case 'up':
      if (this.row > 0) {
        this.row -= 1;
      }
      break;
    case 'down':
      if (this.row < numCols) {
        this.row += 1;
      }
      break;
  }
}

Player.prototype.handleInput = function(direction) {
  this.movePlayer(direction);
  if (this.row === 0) {
    this.resetPlayer();
  }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var enemyBob = new Enemy();
var enemyMatilda = new Enemy();
var enemyFrank = new Enemy();
var allEnemies = [enemyBob, enemyMatilda, enemyFrank];
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});