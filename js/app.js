const
  numRows = 6,
  numCols = 5,
  sectionY = 83,
  sectionX = 101,
  playerInitPos = [2, 5];

// All objects in game is a game element. All common properties and
// functions are here
var GameElement = function(sprite) {
  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.sprite = sprite;
}

// Draw the element on the screen, required method for game
GameElement.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// All elements in game are row based,
// what means that they are located on a spesific row, and have a row property
// Based on row number Y coordinate can be calculated
Object.defineProperty(GameElement.prototype, 'y', {
  get: function() {
    return (this.row - 0.5) * sectionY;
  }
});

// Class for elements that are "block based", such as rock, player.
// Position of these elements based on row and column.
// GameElementBlockType inherties from GameElementBlockType
var GameElementBlockType = function(sprite, col, row) {
  GameElement.call(this, sprite);
  this.col = col;
  this.row = row;
}

GameElementBlockType.prototype = Object.create(GameElement.prototype);
GameElementBlockType.prototype.constructor = GameElementBlockType;

// X coordinate calculated based on column number
Object.defineProperty(GameElementBlockType.prototype, 'x', {
  get: function() {
    return this.col * sectionX;
  }
});

// Enemies our player must avoid
var Enemy = function() {
  GameElement.call(this, 'images/enemy-bug.png');
  this.startPosX = sectionY * -1;
  this.x = this.startPosX;
  this.randomizePosition();
  this.randomizeSpeed();
};

// Enemy.prototype = GameElement;
Enemy.prototype = Object.create(GameElement.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.
  this.x += this.speed * dt;
  this.checkCollision();
  if (this.isEndOfField()) {
    this.moveToStart();
  }
};

Enemy.prototype.randomizeSpeed = function() {
  // Enemy speed is a random number from 100 to 450
  this.speed = Math.floor(Math.random() * 450) + 100;
};

Enemy.prototype.randomizePosition = function() {
  // Enemy position (row they appear on) is a random number
  this.row = Math.floor(Math.random() * 3) + 1;
};

// Checks collition with player
Enemy.prototype.isCollided = function() {
  return (this.row === player.row) && (player.x - 25 < this.x + sectionX / 2) &&
    (player.x + 5 > this.x - sectionX / 2);
};

Enemy.prototype.checkCollision = function() {
  if (this.isCollided()) {
    player.lifeLoss();
  }
};

Enemy.prototype.isEndOfField = function() {
  return this.x > sectionY * (numCols + 1);
};

Enemy.prototype.moveToStart = function() {
  this.randomizeSpeed();
  this.randomizePosition();
  this.x = this.startPosX;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
  // Player is a block type game element
  GameElementBlockType.call(this, 'images/char-boy.png');
  // Player has a life property
  this.lifesMax = 6;
  this.lifeSprite = 'images/Life.png';
  this.lifeLostSprite = 'images/LifeLost.png';
  this.reset();
};

Player.prototype = Object.create(GameElementBlockType.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {

};

Player.prototype.render = function() {
  GameElementBlockType.prototype.render.call(this);
  this.renderLife();
};

// Displays player life of a convas
Player.prototype.renderLife = function() {
  GameElementBlockType.prototype.render.call(this);
  ctx.font = "25px Alien Encounters";
  ctx.fillText("Life: ", 5, 30);
  for (var heart = 0; heart < this.lifesMax; heart++) {
    if (this.lifesMax - this.lifes > heart) {
      ctx.drawImage(Resources.get(this.lifeLostSprite), heart * 30 + 70, 5);
    } else {
      ctx.drawImage(Resources.get(this.lifeSprite), heart * 30 + 70, 5);
    }
  }
};

Player.prototype.handleInput = function(direction) {
  this.movePlayer(direction);
  // If player came to water game continues with new "level"
  if (this.row === 0) {
    this.resetPlayerPosition();
    game.addPoints(100);
    rock.generate();
  }
};

Player.prototype.reset = function() {
  this.lifes = this.lifesMax;
  this.resetPlayerPosition();
}

Player.prototype.resetPlayerPosition = function() {
  this.col = playerInitPos[0];
  this.row = playerInitPos[1];
}

// Player can't go place where rock is located
Player.prototype.rockCollision = function(col, row) {
  return (rock.visible) && (rock.row === row) && (rock.col === col);
}

Player.prototype.movePlayer = function(direction) {
  switch (direction) {
    case 'left':
      if (this.col > 0 && !(this.rockCollision(this.col - 1, this.row))) {
        this.col -= 1;
      }
      break;
    case 'right':
      if (this.col < numCols - 1 && !(this.rockCollision(this.col + 1, this.row))) {
        this.col += 1;
      }
      break;
    case 'up':
      if (this.row > 0 && !(this.rockCollision(this.col, this.row - 1))) {
        this.row -= 1;
      }
      break;
    case 'down':
      if (this.row < numCols && !(this.rockCollision(this.col, this.row + 1))) {
        this.row += 1;
      }
      break;
  }
}

Player.prototype.lifeLoss = function() {
  if (this.lifes > 0) {
    this.lifes--;
  }
  this.resetPlayerPosition();
  if (this.lifes === 0) {
    game.gameOver();
  }
};


var Rock = function() {
  GameElementBlockType.call(this, 'images/Rock.png');
  this.generate();
};

Rock.prototype = Object.create(GameElementBlockType.prototype);
Rock.prototype.constructor = Rock;

// Rock generates randomly on 1st row sometimes
Rock.prototype.generate = function() {
  this.visible = Math.random() >= 0.5;
  this.col = Math.floor(Math.random() * 4) + 0;
  this.row = 0;
};

Rock.prototype.render = function() {
  if (this.visible) {
    GameElementBlockType.prototype.render.call(this);
  }
};

var Game = function() {
  this.resetGame();
};

Game.prototype.resetGame = function() {
  this.status = 'start';
  this.points = 0;
  rock.generate();
  player.reset();
  allEnemies.forEach(function(enemy) {
    enemy.moveToStart();
  });
};

Game.prototype.addPoints = function(pointValue) {
  this.points += pointValue;
  if (this.points > 9999999) {
    this.points = 9999999;
  }
};

Game.prototype.gameOver = function() {
  this.status = 'stop';
  $('#gameOverModal').modal('show');
};

Game.prototype.render = function() {
  ctx.font = "25px Alien Encounters";
  ctx.fillText("Points: " + String(this.points).padStart(7, "0"), 300, 30);
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var enemyBob = new Enemy();
var enemyMatilda = new Enemy();
var enemyFrank = new Enemy();
var allEnemies = [enemyBob, enemyMatilda, enemyFrank];
var player = new Player();
var rock = new Rock();
var game = new Game();

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

// Fills modal form with points
$('#gameOverModal').on('show.bs.modal', function(event) {
  const modal = $(this);
  modal.find('#game-points').text('Your score: ' + game.points);
})

// Restarts the game
$('.restart').on('click', function() {
  game.resetGame();
});