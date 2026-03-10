let d = 200 / 5;
let Col;
let x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5;
let vx, vy;
let wormHue;
let foodHue = 40;
let segDist = 18;
let t = 0;

let foodX = 0;
let foodY = 0;
let foodOn = false;

let wasPressed = false;

function setup() {
    let canvas = createCanvas(800, 500);
    canvas.parent("p5-canvas-container")
    colorMode(HSB);
    x0 = random(0, width);
    y0 = random(0, height)
    x1 = x0 - segDist
    y1 = y0
    x2 = x1 - segDist
    y2 = y0
    x3 = x2 - segDist
    y3 = y0
    x4 = x3 - segDist
    y4 = y0
    x5 = x4 - segDist
    y5 = y0

    vx = 2;
    vy = 0;
    bgCol = random(30, 50)
    wormHue = random(30, 50);
    Col = wormHue;
}

function draw() {
    drawBg()
    drawCreature()
}



function drawBg() {
    background(24, 45, 10);
    noStroke();
    drawGridLayer(-50, 20, 20, 10, 20, 5);
    drawGridLayer(-40, 10, 25, 20, 15, 5);
}
// drawBg grids
function drawGridLayer(offA, offB, satNear, satFar, offScaleFar, offScaleNear) {
    for (let y = d / 2; y <= height; y += d) {
        for (let x = d / 2; x <= width; x += d) {

            let offset = map(noise(frameCount * 0.003 + x * y), 0, 1, offA, offB);

            let distance = dist(mouseX, mouseY, x, y);
            let wormDist = dist(x0, y0, x, y)
            let Sat = map(wormDist, 0, width / 10, satNear, satFar);

            let offsetX = map(noise(frameCount * 0.01 + x * y), 0, 1, -offScaleFar, offScaleFar);
            let offsetY = map(noise(frameCount * 0.01 + x * y), 0, 1, offScaleFar, -offScaleFar);

            if (distance < width / 8) {
                offsetX = map(noise(frameCount * 0.01 + x * y), 0, 1, -offScaleNear, offScaleNear);
                offsetY = map(noise(frameCount * 0.01 + x * y), 0, 1, offScaleNear, -offScaleNear);
            }

            fill(Col, bgCol, Sat);
            circle(x + offsetX, y + offsetY, d + offset);
        }
    }
}


function drawCreature() {
    // Place food (NO mousePressed function, just logic here)
    placeFood();

    // Light/heat circle (repels worm)
    drawLight(140);

    // Draw food
    drawFood();

    //Head steering (attract to food, repel from light)
    // Start with a gentle wiggly drift
    let steerRand = noise(0.5, 0.6)
    let steerX = cos(t * steerRand) * 0.6;
    let steerY = sin(t * steerRand) * 0.6;

    // Attraction to food
    if (foodOn) {
        let ax = foodX - x0;
        let ay = foodY - y0;
        let ad = dist(x0, y0, foodX, foodY);
        if (ad < 1) {
            ad = 1
        }
        ax /= ad;
        ay /= ad; // normalize
        steerX += ax * 1.4;
        steerY += ay * 1.4;
    }

    // Repulsion from mouse light
    let rx = x0 - mouseX;
    let ry = y0 - mouseY;
    let rd = dist(x0, y0, mouseX, mouseY);
    if (rd < 1) {
        rd = 1
    }

    // Eat food if head is close
    eatFood();

    // only repel if close
    let repelRadius = 140;
    if (rd < repelRadius) {
        rx /= rd;
        ry /= rd; // normalize away
        let strength = (repelRadius - rd) / repelRadius;
        steerX += rx * strength * 3.0;
        steerY += ry * strength * 3.0;
    }

    // velocity 
    vx = lerp(vx, steerX * 3.0, 0.15);
    vy = lerp(vy, steerY * 3.0, 0.15);

    // Move head
    x0 += vx;
    y0 += vy;

    // Keep head on canvas
    x0 = constrain(x0, 20, width - 20);
    y0 = constrain(y0, 20, height - 20);


    // Follow segments (each segment tries to stay segDist behind the previous)
    // Segment 1 follows head
    let dx = x1 - x0;
    let dy = y1 - y0;
    let d = sqrt(dx * dx + dy * dy);
    if (d < 0.0001) {
        d = 0.0001
    }
    let tx = x0 + (dx / d) * segDist;
    let ty = y0 + (dy / d) * segDist;
    x1 = lerp(x1, tx, 0.35);
    y1 = lerp(y1, ty, 0.35);

    dx = x2 - x1;
    dy = y2 - y1;
    d = sqrt(dx * dx + dy * dy);
    if (d < 0.0001) {
        d = 0.0001
    }
    tx = x1 + (dx / d) * segDist;
    ty = y1 + (dy / d) * segDist;
    x2 = lerp(x2, tx, 0.35);
    y2 = lerp(y2, ty, 0.35);

    // Segment 3 follows segment 2
    dx = x3 - x2;
    dy = y3 - y2;
    d = sqrt(dx * dx + dy * dy);
    if (d < 0.0001) {
        d = 0.0001
    }
    tx = x2 + (dx / d) * segDist;
    ty = y2 + (dy / d) * segDist;
    x3 = lerp(x3, tx, 0.35);
    y3 = lerp(y3, ty, 0.35);

    // Segment 4 follows segment 3
    dx = x4 - x3;
    dy = y4 - y3;
    d = sqrt(dx * dx + dy * dy);
    if (d < 0.0001) {
        d = 0.0001
    }
    tx = x3 + (dx / d) * segDist;
    ty = y3 + (dy / d) * segDist;
    x4 = lerp(x4, tx, 0.35);
    y4 = lerp(y4, ty, 0.35);

    // Segment 5 follows segment 4
    dx = x5 - x4;
    dy = y5 - y4;
    d = sqrt(dx * dx + dy * dy);
    if (d < 0.0001) {
        d = 0.0001
    }
    tx = x4 + (dx / d) * segDist;
    ty = y4 + (dy / d) * segDist;
    x5 = lerp(x5, tx, 0.35);
    y5 = lerp(y5, ty, 0.35);


    //Draw worm
    drawWorm(Col);

    t += 0.08;
}
function placeFood() {
    if (mouseIsPressed && !wasPressed) {
        foodX = mouseX;
        foodY = mouseY;
        foodOn = true;
        foodHue = random(0, 360);
        wasPressed = true;
    }
    if (!mouseIsPressed) {
        wasPressed = false;
    }
}

function drawLight(dia) {
    let pulse = map(sin(t * 1), -1, 1, 0.9, 1.1);
    let R1 = dia * pulse;
    let R2 = (dia - 60) * pulse;

    noStroke();
    fill(40, 53, 50, 0.25);
    ellipse(mouseX, mouseY, R1, R1);

    fill(42, 33, 90, 0.35);
    ellipse(mouseX, mouseY, R2, R2);
}
function drawFood() {
    if (foodOn) {
        let pulse = 2 + sin(t * 2) * 1.5;
        fill(foodHue, 55, 58);
        ellipse(foodX, foodY, 8 + pulse);
    }
}

function eatFood() {
    if (foodOn) {
        if (dist(x0, y0, foodX, foodY) < 16) {
            foodOn = false;
            wormHue = foodHue;
            Col = wormHue;
        }
    }
}

function drawWorm(v) {
    stroke(v, 45, 50);
    strokeWeight(6);
    line(x0, y0, x1, y1);
    line(x1, y1, x2, y2);
    line(x2, y2, x3, y3);
    line(x3, y3, x4, y4);
    line(x4, y4, x5, y5);

    noStroke();
    let r0 = 16 + sin(t + 0 * 0.6) * 2;
    let r1 = 12 + sin(t + 1 * 0.6) * 2;
    let r2 = 12 + sin(t + 2 * 0.6) * 2;
    let r3 = 12 + sin(t + 3 * 0.6) * 2;
    let r4 = 12 + sin(t + 4 * 0.6) * 2;
    let r5 = 12 + sin(t + 5 * 0.6) * 2;

    fill(v - 10, 47, 40);
    ellipse(x5, y5, r5, r5);
    ellipse(x4, y4, r4, r4);
    ellipse(x3, y3, r3, r3);
    ellipse(x2, y2, r2, r2);
    ellipse(x1, y1, r1, r1);

    fill(0);
    push();
    translate(x0, y0);

    let ang = atan2(vy, vx);   // direction head is moving
    rotate(ang);

    // head
    noStroke();
    fill(v - 10, 47, 40);
    ellipse(0, 0, r0, r0);

    // eyes
    fill(23, 10, 70);
    ellipse(6, -4, 3, 3);
    ellipse(6, 4, 3, 3);

    fill(347, 44, 67)
    ellipse(9, 0, 4, 7)

    pop();
}
