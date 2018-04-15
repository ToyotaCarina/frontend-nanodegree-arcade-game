const
  numRows = 6,
  numCols = 5,
  sectionY = 83,
  sectionX = 101,
  playerInitPos = [2, 5];

// All objects in game is a game element. All common properties and
// functions for objects are here
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

// X coordinate calculates based on column number
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

Enemy.prototype.isEndOfField = function() {
  return this.x > sectionY * (numCols + 1);
};

Enemy.prototype.moveToStart = function() {
  this.randomizeSpeed();
  this.randomizePosition();
  this.x = this.startPosX;
};

// Now write your own player class
// This class requires an update(), render() method.
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
  // noop
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

Player.prototype.reset = function() {
  this.lifes = this.lifesMax;
  this.resetPlayerPosition();
}

Player.prototype.resetPlayerPosition = function() {
  this.col = playerInitPos[0];
  this.row = playerInitPos[1];
}

Player.prototype.nextPosition = function(direction) {
  if (direction === 'left' && this.col > 0) {
    return [this.row, this.col - 1];
  } else if (direction === 'right' && this.col < numCols - 1) {
    return [this.row, this.col + 1];
  } else if (direction === 'up' && this.row > 0) {
    return [this.row - 1, this.col];
  } else if (direction === 'down' && this.row < numCols) {
    return [this.row + 1, this.col];
  } else {
    return [this.row, this.col];
  }
}

Player.prototype.lifeLoss = function() {
  if (this.lifes > 0) {
    this.lifes--;
  }
  this.resetPlayerPosition();
};


var Rock = function() {
  GameElementBlockType.call(this, 'images/Rock.png');
  this.generate();
};

Rock.prototype = Object.create(GameElementBlockType.prototype);
Rock.prototype.constructor = Rock;

// Rock generates randomly on 1st row, sometimes
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

// Game elements are wrapped in Game class
// Though is that game consists of game elements (game objects), such as
// player, enemies, rocks. Also a game has a property like points and status
var Game = function() {
  // Place all enemy objects in an array called allEnemies
  // Place the player object in a variable called player
  this.enemyBob = new Enemy();
  this.enemyMatilda = new Enemy();
  this.enemyFrank = new Enemy();
  this.allEnemies = [this.enemyBob, this.enemyMatilda, this.enemyFrank];
  this.player = new Player();
  this.rock = new Rock();
  this.resetGame();
};

Game.prototype.resetGame = function() {
  this.status = 'start';
  this.points = 0;
  this.rock.generate();
  this.player.reset();
  this.allEnemies.forEach(function(enemy) {
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
  /* Loop through all of the objects within the allEnemies array and call
   * the render function you have defined.
   */
  this.allEnemies.forEach(function(enemy) {
    enemy.render();
  });
  this.player.render();
  this.rock.render();
  this.renderPoints();
}

Game.prototype.renderPoints = function() {
  ctx.font = "25px Alien Encounters";
  ctx.fillText("Points: " + String(this.points).padStart(7, "0"), 300, 30);
}

/* This is called by the update function and loops through all of the
 * objects within your allEnemies array as defined in app.js and calls
 * their update() methods. It will then call the update function for your
 * player object. These update methods should focus purely on updating
 * the data/properties related to the object. Do your drawing in your
 * render methods.
 */
Game.prototype.update = function(dt) {
  var self = this;
  this.allEnemies.forEach(function(enemy) {
    enemy.update(dt);
    this.enemyPlayerCollision(enemy);
  }.bind(this));
  this.player.update();
}

Game.prototype.handleInput = function(direction) {
  if (direction && this.status === 'start') {
    var playerObj = this.player;
    var playerNewPos = playerObj.nextPosition(direction);
    var playerNewRow = playerNewPos[0];
    var playerNewCol = playerNewPos[1];
    if (!this.rockPlayerCollision(playerNewRow, playerNewCol)) {
      playerObj.row = playerNewRow;
      playerObj.col = playerNewCol;
    }
    // If player came to water game continues with new "level"
    if (playerObj.row === 0) {
      this.newLevel();
    }
  }
};

Game.prototype.newLevel = function() {
  this.player.resetPlayerPosition();
  this.addPoints(100);
  // Place rock on a new random place
  this.rock.generate();
}


// Player can't go place where rock is located
Game.prototype.rockPlayerCollision = function(playerNewRow, playerNewCol) {
  var rockObj = this.rock;
  return (rockObj.visible) && (rockObj.row === playerNewRow) && (rockObj.col ===
    playerNewCol);
}

// Checks collition with player
Game.prototype.isCollided = function(enemyObj) {
  var playerObj = this.player;
  return (enemyObj.row === playerObj.row) && (playerObj.x - 25 < enemyObj.x +
    sectionX / 2) && (playerObj.x + 5 > enemyObj.x - sectionX / 2);
};

Game.prototype.enemyPlayerCollision = function(enemyObj) {
  var playeObj = this.player;
  if (this.isCollided(enemyObj)) {
    playeObj.lifeLoss();
    if (playeObj.lifes === 0) {
      this.gameOver();
    }
  }
};


// Now instantiate your objects.
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

  // Hanlde input goes to game object, not player,
  // to make possible to compare rock and player coordinated
  game.handleInput(allowedKeys[e.keyCode]);
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