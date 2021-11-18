var WIDTH = 1000;
var HEIGHT = 700;
var LOGIC_FRAME = 30;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var boidsAmount = 3;
var boids = [];
var target;
var reset = false;
var frameCounter = 0;
var arriveCounter = 0;

function preload() {

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.load.image("boid", "assets/sprites/ship.png");
    game.load.image("target", "assets/sprites/circle.png");  

}


function create() {
    game.stage.backgroundColor = '#000000';
    target = new Phaser.Point(game.width / 2, game.height / 2);
    // target = game.add.sprite(game.width / 2, game.height / 2, "target");
    // target.anchor.set(0.5);
    initBoids();
    resetTarget();
}

function update() {
    if(!reset){
        for (var i = 0; i < boidsAmount; i++) {
            seek(boids[i]);
            resetTarget();

        }
    }else{
        for (var i = 0; i < boidsAmount; i++) {
            flee(boids[i]);
            if(boids[i].position.distance(target.position) > 600){
                resetTarget();
                reset = false;
            }
        }
    }

}

function render() {
}

function initBoids() {
    for (var i = 0; i < boidsAmount; i++) {
        var randomPoint = new Phaser.Point(game.rnd.between(0, game.width - 1), game.rnd.between(0, game.height - 1));
        boids[i] = game.add.sprite(randomPoint.x, randomPoint.y, "boid")
        boids[i].anchor.set(0.5);
        boids[i].speed = game.rnd.between(50,200);
        boids[i].force = game.rnd.between(10, 20);
        game.physics.enable(boids[i], Phaser.Physics.ARCADE);

        game.physics.startSystem(Phaser.Physics.ARCADE);

        boids[i].body.collideWorldBounds = true;
        boids[i].body.bounce.setTo(1,1);
        boids[i].body.allowRotation = false;

        boids[i].body.onCollide = new Phaser.Signal();
        boids[i].body.onCollide.add(hitSprite, this);

    }
}

function resetTarget() {
    var x = 0, y = 0;

    for (var i = 0; i < boidsAmount; i++) {
        x += boids[i].x;
        y += boids[i].y;
    }

    target.x = x/boidsAmount;
    target.x = y/boidsAmount;
}

function arrive(boid) {
    var direction = new Phaser.Point(target.x, target.y);
    var distance;
    var accelerator;

    direction.subtract(boid.x, boid.y);
    distance = direction.getMagnitude();

    accelerator = distance - 150;

    vectorOperation(direction, boid);

    boid.body.velocity.setMagnitude(boid.speed + accelerator);

    boid.angle = 180 + Phaser.Math.radToDeg(Phaser.Point.angle(boid.position, new Phaser.Point(boid.x + boid.body.velocity.x, boid.y + boid.body.velocity.y)));

}


function seek(boid) {
    var direction = new Phaser.Point(target.x, target.y);
    direction.subtract(boid.x, boid.y);
    vectorOperation(direction, boid);
    boid.body.velocity.setMagnitude(boid.speed);

    boid.angle = 180 + Phaser.Math.radToDeg(Phaser.Point.angle(boid.position, new Phaser.Point(boid.x + boid.body.velocity.x, boid.y + boid.body.velocity.y)));

}

function hitSprite() {
    reset = true;
}

function flee(boid) {
    var direction = new Phaser.Point(boid.x, boid.y);
    direction.subtract(target.x, target.y);
    vectorOperation(direction, boid);
    boid.body.velocity.setMagnitude(boid.speed);

    boid.angle = 180 + Phaser.Math.radToDeg(Phaser.Point.angle(boid.position, new Phaser.Point(boid.x + boid.body.velocity.x, boid.y + boid.body.velocity.y)));

}

function vectorOperation(direction, boid) {
    direction.normalize();
    direction.setMagnitude(boid.speed);
    direction.subtract(boid.body.velocity.x, boid.body.velocity.y);
    direction.normalize();
    direction.setMagnitude(boid.force);
    boid.body.velocity.add(direction.x, direction.y);

    boid.body.velocity.normalize();
}
// direction vector is the straight direction from the boid to the target
// subtract the current boid position
// then normalize it. A normalized vector has its length is 1, but it retains the same direction
// time to set magnitude (length) to boid speed
// then subtract the current boid velocity
// normalizing again
// set the magnitude to boid force, which should be WAY lower than its velocity
// we normalize the velocity and set the magnitude to boid speed