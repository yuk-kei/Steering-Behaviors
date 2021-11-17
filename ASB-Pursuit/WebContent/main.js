var WIDTH = 1000;
var HEIGHT = 600;
var LOGIC_FRAME = 30;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var boidsAmount = 2;
var boids = [];
var target;
var frameCounter = 0;
var seekCounter = 0;

function preload() {

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.load.image("boid", "assets/sprites/ship.png");
    game.load.image("target", "assets/sprites/circle.png");  

}

function iniTarget() {
    target = game.add.sprite(game.rnd.between(0, game.width - 1), game.rnd.between(0, game.width - 1), "target");
    //The anchor sets the origin point of the texture.
    // Setting than anchor to 0.5 means the textures origin is centered
    target.anchor.set(0.5);
    target.speed = game.rnd.between(100,300);
    target.force = game.rnd.between(10, 30);
    game.physics.enable(target, Phaser.Physics.ARCADE);
    target.body.allowRotation = false;
}

function create() {
    game.stage.backgroundColor = '#000000';


    iniTarget();
    initBoids();
}

function update() {

    for (var i = 0; i < boidsAmount; i++) {
        seek(boids[i],target);
        resetTarget();
    }

}

function initBoids() {
    for (var i = 0; i < boidsAmount; i++) {
        var randomPoint = new Phaser.Point(game.rnd.between(0, game.width - 1), game.rnd.between(0, game.height - 1));
        boids[i] = game.add.sprite(randomPoint.x, randomPoint.y, "boid")
        boids[i].anchor.set(0.5);
        boids[i].speed = game.rnd.between(20,500);
        boids[i].force = game.rnd.between(5, 50);
        game.physics.enable(boids[i], Phaser.Physics.ARCADE);
        boids[i].body.allowRotation = false;
    }
}

function seek(boid,target) {
    var direction = new Phaser.Point(target.x, target.y);
    boid.speed = game.rnd.between(20,500);
    boid.force = game.rnd.between(5, 50);
    direction.subtract(boid.x, boid.y);
    direction.normalize();
    direction.setMagnitude(boid.speed);
    direction.subtract(boid.body.velocity.x, boid.body.velocity.y);
    direction.normalize();
    direction.setMagnitude(boid.force);
    boid.body.velocity.add(direction.x, direction.y);

    boid.body.velocity.normalize();
    boid.body.velocity.setMagnitude(boid.speed);

    boid.angle = 180 + Phaser.Math.radToDeg(Phaser.Point.angle(boid.position, new Phaser.Point(boid.x + boid.body.velocity.x, boid.y + boid.body.velocity.y)));

}

function resetTarget() {
    var randomPoint = new Phaser.Point(game.rnd.between(0, game.width - 1), game.rnd.between(0, game.width - 1));
    seek(target,randomPoint);
}

function render() {
    game.debug.text("Seek times :"+ seekCounter, 10, 20);
}

// direction vector is the straight direction from the boid to the target
// subtract the current boid position
// then normalize it. A normalized vector has its length is 1, but it retains the same direction
// time to set magnitude (length) to boid speed
// then subtract the current boid velocity
// normalizing again
// set the magnitude to boid force, which should be WAY lower than its velocity
// we normalize the velocity and set the magnitude to boid speed