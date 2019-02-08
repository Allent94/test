function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

/******************************************************************************************/
/******************************************************************************************/
/******************************************************************************************/

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

/******************************************************************************************/
/******************************************************************************************/
/******************************************************************************************/

// no inheritance
function Background(game, spritesheet) {
    this.x = -800;
    this.y = 1;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    // Entity.call(this, game, 0, 400);
    this.radius = 200;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
    this.x, this.y);
};

Background.prototype.update = function () {
    this.x += 1;
    if(this.x > 0) this.x = -800;
}

Background.prototype.reset = function () {

}

/******************************************************************************************/
/******************************************************************************************/
/******************************************************************************************/

function Foreground(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    // Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Foreground.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
    this.x, this.y);
};

Foreground.prototype.update = function () {
    this.x -= 1;
    if(this.x < -800) this.x = 0;
}

Foreground.prototype.reset = function() {

}

/******************************************************************************************/
/******************************************************************************************/
/******************************************************************************************/

function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.collide = function (oth) {

    if (this.right > oth.left) return true;

    return false;
}

/******************************************************************************************/
/******************************************************************************************/
/******************************************************************************************/

function PlayGame(game, x, y) {
    Entity.call(this, game, x, y);
}

PlayGame.prototype = new Entity();
PlayGame.prototype.constructor = PlayGame;

PlayGame.prototype.reset = function () {
    this.game.running = false;
}
PlayGame.prototype.update = function () {
    if (this.game.click && this.game.alive) {
        this.game.running = true;
    }
}

PlayGame.prototype.draw = function (ctx) {
    if (!this.game.running) {
        ctx.font = "30pt Impact";
        ctx.fillStyle = "red";
        
        if(!this.game.alive) {
            ctx.fillText("Game Over", 325, 250);
            ctx.fillText("Replay?", 346, 300);
            if (this.game.click != null && this.game.click.x >= 346 &&
                this.game.click.x <= 480 && this.game.click.y >= 265 &&
                this.game.click.y <= 300) {
                    this.game.running = true;
                    this.game.actualTime.gameTime = 0;
            }
            if (this.game.mouse != null && this.game.mouse.x >= 346 && this.game.mouse.x <= 480 && 
                this.game.mouse.y >= 265 && this.game.mouse.y <= 300) {
                ctx.fillStyle = "white";
                ctx.fillText("Replay?", 346, 300);
                
            }
            
        } else {
            ctx.fillText("Enter the adeventure through space...", 100, 250);

        }
    }
}

/******************************************************************************************/
/******************************************************************************************/
/******************************************************************************************/

function Character(game) {

    cubeSlideBeginning = new Animation(ASSET_MANAGER.getAsset("./img/cube_slide.png"), 0, 0, 64, 64, 0.10, 15, true, false);
    this.animation = cubeSlideBeginning;
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/cube_jump.png"), 0, 0, 64, 64, 0.08, 8, false, false);
    this.jumping = false;
    this.dead = false;
    this.block = game.block;
    game.alive = !this.dead;
    // this.radius = 100;
    this.ground = 350;
    this.boundingbox = new BoundingBox(this.x + 65, this.y, this.animation.frameWidth - 0.10, this.animation.frameHeight - 15);
    Entity.call(this, game, -64, 350);
}

Character.prototype = new Entity();
Character.prototype.constructor = Character;

Character.prototype.update = function () {
    if (this.game.running) {
        if (this.dead) {
            this.game.alive = false;
            this.game.reset();
            return;
        }
        if (this.game.space) this.jumping = true;
        if (this.jumping) {
            if (this.jumpAnimation.isDone()) {
                this.jumpAnimation.elapsedTime = 0;
                this.jumping = false;
                Character.animation = cubeSlideBeginning;
            }
            var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
            var totalHeight = 200;

            if (jumpDistance > 0.5)
                jumpDistance = 1 - jumpDistance;

                //var height = jumpDistance * 2 * totalHeight;
                var height = totalHeight*(-10 * (jumpDistance * jumpDistance - jumpDistance));
                this.y = this.ground - height;
                //console.log("j");
        } else {
            // console.log("nj");
            // console.log(this.block.boundingbox.x);
            // console.log("Cube" + this.boundingbox.x);
            // console.log("Block" + this.block.boundingbox);
            // console.log("");
            this.boundingbox = new BoundingBox(this.x + 65, this.y + 10, this.animation.frameWidth -40, this.animation.frameHeight - 20);
            //if(this.boundingbox.collide(this.game.block.boundingbox)) this.dead = true;
        
        }
    }
    Entity.prototype.update.call(this);
}

Character.prototype.draw = function (ctx) {
    if (this.game.running) {
        if(this.dead){
            return;
        }
        if (this.jumping) {
           // this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
        }
        else {
            ctx.lineWidth = 10;
            ctx.strokeStyle = "blue";
            //ctx.strokeRect(this.x + 64, this.y + 64, this.animation.frameWidth , this.animation.frameHeight);
            if (this.x < 0) {
                this.x += 1;
            }
           // this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
        }
    }

    Entity.prototype.draw.call(this);
}
Character.prototype.reset = function() {
    this.dead = false;
    this.x = -64;
}

/******************************************************************************************/
/******************************************************************************************/
/******************************************************************************************/

function Block(game, x, y) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/spike.png"), 0, 0, 64, 64, 0.20, 2, true, false);
    // this.boundingbox = new BoundingBox(this.x + 64, this.y + 64, this.animation.frameWidth - 40, this.animation.frameHeight - 20);
    // this.radius = 100;
    this.ground = 350;
    this.boundingbox = new BoundingBox(this.x + 64, this.y + 64, this.animation.frameWidth - 40, this.animation.frameHeight - 20);
    Entity.call(this, game, x, y);
}

Block.prototype = new Entity();
Block.prototype.constructor = Block;

Block.prototype.reset = function() {
    this.x = 800;
    this.boundingbox = new BoundingBox(this.x + 64, this.y + 64, this.animation.frameWidth - 40, this.animation.frameHeight - 20);
}
Block.prototype.update = function () {
    if (this.game.running) {
        this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
    }
    
    Entity.prototype.update.call(this);
}

Block.prototype.draw = function (ctx) {
    if (this.game.running) {
        if(this.x < -64) {
            this.x = 800; 
        }
    
        ctx.lineWidth = 10;
        ctx.strokeStyle = "blue";
        //ctx.strokeRect(this.x + 60, this.y + 64, this.animation.frameWidth , this.animation.frameHeight);
        this.animation.drawFrame(this.game.clockTick, ctx, this.x -= 5, this.y, 3);
    }
   
    Entity.prototype.draw.call(this);
}

/******************************************************************************************/
/******************************************************************************************/
/******************************************************************************************/

function Spike(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/spike.png"), 0, 0, 64, 64, 0.5, 2, true, false);
    // this.boundingbox = new BoundingBox(this.x + 64, this.y + 64, this.animation.frameWidth - 40, this.animation.frameHeight - 20);
    // this.radius = 100;
    this.ground = 350;
    Entity.call(this, game, 500, 350);
}

Spike.prototype = new Entity();
Spike.prototype.constructor = Spike;

Spike.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Spike.prototype.draw = function (ctx) {
    if(this.x < -64) {
        this.x = 800;
    }
    this.animation.drawFrame(this.game.clockTick, ctx, this.x -= 3, this.y, 3);
    Entity.prototype.draw.call(this);
}


/******************************************************************************************/
/******************************************************************************************/
/******************************************************************************************/

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/cube_slide.png");
ASSET_MANAGER.queueDownload("./img/cube_jump.png");
ASSET_MANAGER.queueDownload("./img/block.png");
ASSET_MANAGER.queueDownload("./img/spike.png");
ASSET_MANAGER.queueDownload("./img/bg.png");
ASSET_MANAGER.queueDownload("./img/transparent_bg.png");


ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    document.getElementById('gameWorld').focus();
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
 
    gameEngine.init(ctx);
    gameEngine.start();
    let timer = new VisibleTimer(gameEngine);
    let pg = new PlayGame(gameEngine, 320, 350);
    gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/bg.png")));
    gameEngine.addEntity(new Foreground(gameEngine, ASSET_MANAGER.getAsset("./img/transparent_bg.png")));
    var character = new Character(gameEngine);
    gameEngine.addEntity(character);
    gameEngine.character = character;

    var platforms = [];

    var b1 = new Block(gameEngine, 800, 350);
    var b2 = new Block(gameEngine, 1600, 350);
    var b3 = new Block(gameEngine, 2400, 300);
    var b4 = new Block(gameEngine, 2400, 250);
    var b5 = new Block(gameEngine, 2400, 200);
    var b6 = new Block(gameEngine, 2400, 150);
    var b7 = new Block(gameEngine, 2400, 100);
    var b8 = new Block(gameEngine, 2400, 50);
    var b9 = new Block(gameEngine, 2400, 0);
    var b10 = new Block(gameEngine, 2400, -50);

    var loop = true;
    
if(loop){


    for(var i = 0; i <= 0; i++){

       // gameEngine.addEntity("b" + i);

       gameEngine.addEntity(b1);
       gameEngine.addEntity(b2);
       gameEngine.addEntity(b3);
       gameEngine.addEntity(b4);
       gameEngine.addEntity(b5);
       gameEngine.addEntity(b6);
       gameEngine.addEntity(b7);
       gameEngine.addEntity(b8);
       gameEngine.addEntity(b9);
       gameEngine.addEntity(b10);

    }

    loop = false;

}

    // gameEngine.addEntity(b1);
    // gameEngine.addEntity(b2);
    // gameEngine.addEntity(b3);
    // gameEngine.addEntity(b4);
    // gameEngine.addEntity(b5);
    // gameEngine.addEntity(b6);
    // gameEngine.addEntity(b7);
    // gameEngine.addEntity(b8);
    // gameEngine.addEntity(b9);
    // gameEngine.addEntity(b10);


    // let block = new Block(gameEngine);
    // gameEngine.addEntity(block);
    // gameEngine.block = block;
    // gameEngine.running = false;

    //gameEngine.addEntity(new Block(gameEngine));
    //gameEngine.addEntity(new Spike(gameEngine));
    gameEngine.addEntity(timer);
    gameEngine.addEntity(pg);
});

