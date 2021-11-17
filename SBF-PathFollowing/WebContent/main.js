var WIDTH = 800;
var HEIGHT = 600;
var LOGIC_FRAME = 30;
var POINT_NUMBER = 7;

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var boidsAmount = 1;
var boids = [];
var target;
var increment = 1 / game.width;
var path;
var index = 0;
var find = false;
var points = {
    'x': [0,60, 200, 120, 456, 840, 450],
    'y': [0,60, 300, 120, 50, 780, 800]
};
var frameCounter = 0;
var seekCounter = 0;

function preload() {

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.load.image("boid", "assets/sprites/ship.png");


}

function create() {

    game.stage.backgroundColor = '#000000';

    // Draw the path
    path = game.add.bitmapData(game.width, game.height);
    path.addToWorld();
    for (var i = 0; i < 1; i += increment) {
        var positionX = game.math.bezierInterpolation(points.x, i);
        var positionY = game.math.bezierInterpolation(points.y, i);
        path.rect(positionX,  positionY, 3, 3, 'rgba(245, 0, 0, 1)');
    }

    //The anchor sets the origin point of the texture.
    // Setting than anchor to 0.5 means the textures origin is centered
    var random = game.rnd.between(0,8);
    target = new Phaser.Point(points.x[random],points.y[random]);

    initBoids();
}

function update() {

    for (var i = 0; i < boidsAmount; i++) {

        if (boids[i].position.distance(target) > 50 && find == false){
            console.log(boids[i].position.distance(target));
            seek(boids[i]);
        }
        else {
            find = true;
            pathFinding(boids[i]);
            }
    }
}

function render() {
}

function pathFinding(boid) {
    boid.x = target.x;
    boid.y = target.y;
    var positionX = game.math.bezierInterpolation(points.x, index);
    var positionY = game.math.bezierInterpolation(points.y, index);
    target.x = positionX;
    target.y = positionY;

    index += increment;
    if(positionY > 800){
        index = 0;
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

// direction vector is the straight direction from the boid to the target
// subtract the current boid position
// then normalize it. A normalized vector has its length is 1, but it retains the same direction
// time to set magnitude (length) to boid speed
// then subtract the current boid velocity
// normalizing again
// set the magnitude to boid force, which should be WAY lower than its velocity
// we normalize the velocity and set the magnitude to boid speed