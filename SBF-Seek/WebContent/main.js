var WIDTH = 1000;
var HEIGHT = 600;
var LOGIC_FRAME = 30;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var boidsAmount = 1;
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

function create() {
    game.stage.backgroundColor = '#000000';
    target = game.add.sprite(game.width / 2, game.height / 2, "target");
    //The anchor sets the origin point of the texture.
    // Setting than anchor to 0.5 means the textures origin is centered
    target.anchor.set(0.5);

    initBoids();
}

function update() {

    for (var i = 0; i < boidsAmount; i++) {
        seek(boids[i]);
        resetTarget(boids[i]);
    }

}

function initBoids() {
    for (var i = 0; i < boidsAmount; i++) {
        var randomPoint = new Phaser.Point(game.rnd.between(0, game.width - 1), game.rnd.between(0, game.height - 1));
        boids[i] = game.add.sprite(randomPoint.x, randomPoint.y, "boid")
        boids[i].anchor.set(0.5);
        boids[i].speed = game.rnd.between(100,200);
        boids[i].force = game.rnd.between(10, 20);
        game.physics.enable(boids[i], Phaser.Physics.ARCADE);
        boids[i].body.allowRotation = false;
    }
}

function seek(boid) {
    var direction = new Phaser.Point(target.x, target.y);
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

function resetTarget(boid) {
    if (boid.position.distance(target.position) < 2) {
        target.x = game.rnd.between(10, game.width - 10);
        target.y = game.rnd.between(10, game.height - 10);
        seekCounter++;
    }
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