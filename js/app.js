var numRows = 6,
  numCols = 5,
  sectionY = 83,
  sectionX = 101,
  playerInitPos = [2, 5],
  gemColors = ['Blue', 'Green', 'Orange'];

/**
 * @description Represents a game element (game object)
 * @constructor
 * @param {string} sprite - The image/sprite of element.
 */
function GameElement(sprite) {
  this.sprite = sprite;
}

/**
 * @description Draws the element on the screen, required method for game.
 */
GameElement.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * All elements in game are row based,
 * what means that they are located on a spesific row, and have a row property
 * Based on row number Y coordinate can be calculated
 */
Object.defineProperty(GameElement.prototype, 'y', {
  get: function() {
    return (this.row - 0.5) * sectionY;
  }
});

/**
 * @description Represents a game elements, position of those bases on row and column
 * @constructor
 * @param {string} sprite - The image/sprite of element.
 */
function GameElementBlockType(sprite) {
  GameElement.call(this, sprite);
}

GameElementBlockType.prototype = Object.create(GameElement.prototype);
GameElementBlockType.prototype.constructor = GameElementBlockType;

/**
 * @description X coordinate calculates based on column number
 * @returns {number} Multiplication of column number and section width
 */
Object.defineProperty(GameElementBlockType.prototype, 'x', {
  get: function() {
    return this.col * sectionX;
  }
});

/**
 * @description Enemies our player must avoid
 * @constructor
 */
function Enemy() {
  GameElement.call(this, 'images/enemy-bug.png');
  this.startPosX = sectionY * -1;
  this.x = this.startPosX;
  this.randomizePosition();
  this.randomizeSpeed();
}

Enemy.prototype = Object.create(GameElement.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * @description Update the enemy's position, required method for game
 * @param {number} dt - time delta between ticks
 */
Enemy.prototype.update = function(dt) {
  this.x += this.speed * dt;
  if (this.isEndOfField()) {
    this.moveToStart();
  }
};

/**
 * @description Sets speed of enemy object to a random number from 100 to 450
 */
Enemy.prototype.randomizeSpeed = function() {
  this.speed = Math.floor(Math.random() * 450) + 100;
};

/**
 * @description Sets row position of enemy object to a random number from 1 to 3
 */
Enemy.prototype.randomizePosition = function() {
  // Enemy position (row they appear on) is a random number
  this.row = Math.floor(Math.random() * 3) + 1;
};

/**
 * @description Checks if enemy object is located outside the last section
 * @returns {bool} True if x coordinate is outside last section
 */
Enemy.prototype.isEndOfField = function() {
  return this.x > sectionY * (numCols + 1);
};

/**
 * @description Returns enemy object to start with a new speed and row position
 */
Enemy.prototype.moveToStart = function() {
  this.randomizeSpeed();
  this.randomizePosition();
  this.x = this.startPosX;
};

/**
 * @description Represents a player
 * @constructor
 */
function Player() {
  // Player is a block type game element
  GameElementBlockType.call(this, 'images/char-boy.png');
  // Player has a life property
  this.lifesMax = 6;
  this.lifeSprite = 'images/Life.png';
  this.lifeLostSprite = 'images/LifeLost.png';
  this.reset();
}

Player.prototype = Object.create(GameElementBlockType.prototype);
Player.prototype.constructor = Player;

/**
 * @description Draws the element on the screen, required method for game.
 */
Player.prototype.render = function() {
  GameElementBlockType.prototype.render.call(this);
  this.renderLife();
};

/**
 * @description Displays player life of a convas
 */
Player.prototype.renderLife = function() {
  GameElementBlockType.prototype.render.call(this);
  ctx.font = "25px AlienEncounters";
  ctx.fillText("Life: ", 5, 30);
  for (var heart = 0; heart < this.lifesMax; heart++) {
    if (this.lifesMax - this.lifes > heart) {
      ctx.drawImage(Resources.get(this.lifeLostSprite), heart * 30 + 70, 5);
    } else {
      ctx.drawImage(Resources.get(this.lifeSprite), heart * 30 + 70, 5);
    }
  }
};

/**
 * @description Resets player for a new game
 */
Player.prototype.reset = function() {
  this.lifes = this.lifesMax;
  this.resetPlayerPosition();
};

/**
 * @description Sets player position to a default
 */
Player.prototype.resetPlayerPosition = function() {
  this.col = playerInitPos[0];
  this.row = playerInitPos[1];
};

/**
 * @description Calculates a new postion of a player object
 * @param {string} direction - Direction of player move
 * @returns {array} New poistion of player(row and column)
 */
Player.prototype.nextPosition = function(direction) {
  if (direction === 'left' && this.col > 0) {
    return [this.row, this.col - 1];
  } else if (direction === 'right' && this.col < numCols - 1) {
    return [this.row, this.col + 1];
  } else if (direction === 'up' && this.row > 0) {
    return [this.row - 1, this.col];
  } else if (direction === 'down' && this.row < numRows - 1) {
    return [this.row + 1, this.col];
  } else {
    return [this.row, this.col];
  }
};

/**
 * @description Player object moves to default place when life loses
 */
Player.prototype.lifeLoss = function() {
  if (this.lifes > 0) {
    this.lifes--;
  }
  this.resetPlayerPosition();
};

/**
 * @description Represents a rock
 * @constructor
 */
function Rock() {
  GameElementBlockType.call(this, 'images/Rock.png');
  this.generate();
}

Rock.prototype = Object.create(GameElementBlockType.prototype);
Rock.prototype.constructor = Rock;

/**
 * @description Rock generates randomly on 1st row
 */
Rock.prototype.generate = function() {
  this.visible = Math.random() >= 0.5;
  this.col = Math.floor(Math.random() * 4) + 0;
  this.row = 0;
};

/**
 * @description Draws the element on the screen, required method for game
 */
Rock.prototype.render = function() {
  if (this.visible) {
    GameElementBlockType.prototype.render.call(this);
  }
};

/**
 * @description Represents a Gem
 * @constructor
 */
function Gem(color) {
  GameElementBlockType.call(this, 'images/Gem ' + color + '.png');
  switch (color) {
    case 'Blue':
      this.points = 350;
      break;
    case 'Green':
      this.points = 200;
      break;
    case 'Orange':
      this.points = 150;
      break;
    default:
      this.points = 0;
  }
  this.generate();
}

Gem.prototype = Object.create(GameElementBlockType.prototype);
Gem.prototype.constructor = Gem;

/**
 * @description Gem generates randomly on a whole field
 */
Gem.prototype.generate = function() {
  this.col = Math.floor(Math.random() * (numCols - 1)) + 0;
  this.row = Math.floor(Math.random() * (numRows - 1)) + 0;
};

/**
 * @description Represents a points label which apeears when player collects a gem
 * @constructor
 */
function GemPointLabel(points, x, y) {
  this.x = x;
  this.y = y;
  this.points = points;
  this.origY = this.y;
}

/**
 * @description Animates gem point label
 */
GemPointLabel.prototype.render = function() {
  if (this.y !== 0) {
    ctx.fillText(String(this.points), this.x + 25, this.y + 90);
  }
};

/**
 * @description Updating the label position to create a short animation
 * @param {number} dt - time delta between ticks
 */
GemPointLabel.prototype.update = function(dt) {
  if (this.y !== 0) {
    this.y -= 65 * dt;
    if (this.origY - this.y > 60) {
      this.y = 0;
    }
  }
};

/**
 * @description Represents a game
 * @constructor
 */
function Game() {
  // Game elements are wrapped in Game class
  // Though is that game consists of game elements (game objects), such as
  // player, enemies, rocks. Also a game has a property like points and status
  this.enemyBob = new Enemy();
  this.enemyMatilda = new Enemy();
  this.enemyFrank = new Enemy();
  this.allEnemies = [this.enemyBob, this.enemyMatilda, this.enemyFrank];
  this.player = new Player();
  this.rock = new Rock();
  this.gemPointLabel = new GemPointLabel(0, 0, 0);
  this.resetGame();
}

/**
 * @description Sets a game to a start condition
 */
Game.prototype.resetGame = function() {
  this.status = 'start';
  this.points = 0;
  this.rock.generate();
  this.generateGems();
  this.player.reset();
  this.allEnemies.forEach(function(enemy) {
    enemy.moveToStart();
  });
};

/**
 * @description Creates up to 3 gems per "level" of a random (Blue, Green or Orange) color
 */
Game.prototype.generateGems = function() {
  this.allGems = [];
  var rockObj = this.rock;
  var playerObj = this.player;
  var gemCount = Math.floor(Math.random() * 3) + 0;
  for (var i = 0; i < gemCount; i++) {
    var gemColor = gemColors[Math.floor(Math.random() * gemColors.length)];
    var newGem = new Gem(gemColor);
    // If position of a gem are the same as position of a player or a rock,
    // position must be recalculated
    if ((rockObj.visible && newGem.col === rockObj.col && newGem.row ===
        rockObj.row) || (newGem.col === playerObj.col && newGem.row ===
        playerObj.row)) {
      newGem.generate();
    }
    this.allGems.push(newGem);
  }
};

/**
 * @description Add points to a game. 9999999 is a maximum
 */
Game.prototype.addPoints = function(pointValue) {
  this.points += pointValue;
  if (this.points > 9999999) {
    this.points = 9999999;
  }
};

/**
 * @description Pause animation and shows modal form
 */
Game.prototype.gameOver = function() {
  this.status = 'stop';
  $('#gameOverModal').modal('show');
};

/**
 * @description Draws all elements on the screen
 */
Game.prototype.render = function() {
  this.rock.render();
  this.allGems.forEach(function(gem) {
    gem.render();
  });
  this.allEnemies.forEach(function(enemy) {
    enemy.render();
  });
  this.player.render();
  this.renderPoints();
  this.gemPointLabel.render();
};

/**
 * @description Displays point number on a canvas
 */
Game.prototype.renderPoints = function() {
  ctx.font = "25px AlienEncounters";
  ctx.fillText("Points: " + String(this.points).padStart(7, "0"), 300, 30);
};

/**
 * @description Updating the data/properties related to the object
 * @param {number} dt - time delta between ticks
 */
Game.prototype.update = function(dt) {
  this.allEnemies.forEach(function(enemy) {
    enemy.update(dt);
    this.enemyPlayerCollision(enemy);
  }.bind(this));
  this.checkPlayerMeetsGem();
  // If player came to water game continues with new "level"
  if (this.player.row === 0) {
    this.newLevel();
  }
  this.gemPointLabel.update(dt);
};

/**
 * @description Moves a player according to direction
 * @param {string} direction - direction of the movement
 */
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
  }
};

/**
 * @description Prepares game for a new "level"
 */
Game.prototype.newLevel = function() {
  this.player.resetPlayerPosition();
  this.addPoints(100);
  // Place rock on a new random place
  this.rock.generate();
  this.generateGems();
};

/**
 * @description Checks if next player postiion is a rock position
 * @param {number} playerNewRow - Next row position of a player
 * @param {number} playerNewCol - Next column position of a player
 * @returns {bool} True if next player postiion is a rock position
 */
Game.prototype.rockPlayerCollision = function(playerNewRow, playerNewCol) {
  // Player can't go place where rock is located
  var rockObj = this.rock;
  return (rockObj.visible) && (rockObj.row === playerNewRow) && (rockObj.col ===
    playerNewCol);
};

/**
 * @description Checks collision with player
 * @param {number} enemyObj - Enemy object
 * @returns {bool} True if player collide with enemy witin the interval
 */
Game.prototype.isCollided = function(enemyObj) {
  var playerObj = this.player;
  return (enemyObj.row === playerObj.row) && (playerObj.x - 25 < enemyObj.x +
    sectionX / 2) && (playerObj.x + 5 > enemyObj.x - sectionX / 2);
};

/**
 * @description Handles collision of player and enemy
 * @param {number} enemyObj - Enemy object
 */
Game.prototype.enemyPlayerCollision = function(enemyObj) {
  var playerObj = this.player;
  if (this.isCollided(enemyObj)) {
    playerObj.lifeLoss();
    if (playerObj.lifes === 0) {
      this.gameOver();
    }
  }
};

/**
 * @description Check if player meet gem
 */
Game.prototype.checkPlayerMeetsGem = function() {
  var playerObj = this.player;
  for (var i = 0; i < this.allGems.length; i++) {
    var gem = this.allGems[i];
    if (gem.col === playerObj.col && gem.row === playerObj.row) {
      this.addPoints(gem.points);
      this.gemPointLabel = new GemPointLabel(gem.points, gem.x, gem.y);
      this.allGems.splice(i, 1);
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
  var modal = $(this);
  modal.find('#game-points').text('Your score: ' + game.points);
});

// Restarts the game
$('.restart').on('click', function() {
  game.resetGame();
});