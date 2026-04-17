let env;
let currentDecision = 0;
let decisionMade = false;
let ended = false;
let prompts = [
  "A trader offers silver for the last old pines.",
  "The herd has grown. Where should it graze?",
  "A river diversion would water crops but drain the marsh.",
  "A tribe offers goods for all your dried dung fuel.",
  "Wolves hunt near camp. Burn the brush to drive them out?"
];
let harmfulLabels = [
  "Fell the pines",
  "Graze one valley all season",
  "Divert the river",
  "Sell all the fuel",
  "Burn the brush"
];
let preservingLabels = [
  "Protect the grove",
  "Move the herd",
  "Share the water",
  "Trade only a little",
  "Post night watches"
];

function setup() {
  let canvas = createCanvas(800, 500);
  canvas.parent("p5-canvas-container");
  textFont("Georgia");
  env = new Environment();
}

function draw() {
  env.update();
  env.display();

  // Prompt bar at top
  noStroke();
  fill(0, 0, 0, 120);
  rect(0, 0, 800, 50);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(15);

  if (ended) {
    drawEnding();
    return;
  }

  text(prompts[currentDecision], 400, 25);

  // Buttons
  if (!decisionMade) {
    drawButton(80, 430, 300, 50, harmfulLabels[currentDecision], 120, 50, 50);
    drawButton(420, 430, 300, 50, preservingLabels[currentDecision], 50, 90, 60);
  } else {
    let label = "Next";
    if (currentDecision === 4) label = "See outcome";
    drawButton(330, 430, 140, 50, label, 60, 60, 80);
  }
}

function drawButton(x, y, w, h, label, r, g, b) {
  noStroke();
  fill(r, g, b);
  rect(x, y, w, h, 4);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(label, x + w / 2, y + h / 2);
}

function drawEnding() {
  fill(0, 0, 0, 150);
  rect(0, 0, 800, 500);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);

  let msg = "";
  if (env.health >= 0.66) msg = "The steppe endures.";
  else if (env.health >= 0.33) msg = "The steppe is wounded, but alive.";
  else msg = "The steppe is barren.";

  text(msg, 400, 250);
}

function mousePressed() {
  if (ended) return;

  if (!decisionMade) {
    // Harmful button
    if (mouseX > 80 && mouseX < 380 && mouseY > 430 && mouseY < 480) {
      env.applyDecision(true);
      decisionMade = true;
    }
    // Preserving button
    if (mouseX > 420 && mouseX < 720 && mouseY > 430 && mouseY < 480) {
      env.applyDecision(false);
      decisionMade = true;
    }
  } else {
    // Next button
    if (mouseX > 330 && mouseX < 470 && mouseY > 430 && mouseY < 480) {
      if (currentDecision === 4) {
        ended = true;
      } else {
        currentDecision = currentDecision + 1;
        decisionMade = false;
      }
    }
  }
}

class Environment {
  constructor() {
    this.health = 1.0;
    this.targetHealth = 1.0;

    // Trees r parallel arrays instead of object literals
    this.treeX = [];
    this.treeThreshold = [];
    for (let i = 0; i < 10; i++) {
      this.treeX.push(60 + i * 75);
      this.treeThreshold.push(i * 0.08);
    }

    // Dust also parallel arrays
    this.dustX = [];
    this.dustY = [];
    for (let i = 0; i < 40; i++) {
      this.dustX.push(random(800));
      this.dustY.push(random(70, 320));
    }
  }

  applyDecision(harmful) {
    if (harmful) {
      this.targetHealth = this.targetHealth - 0.18;
    } else {
      this.targetHealth = this.targetHealth + 0.04;
    }
    this.targetHealth = constrain(this.targetHealth, 0, 1);
  }

  update() {
    this.health = lerp(this.health, this.targetHealth, 0.05);

    // Move dust
    for (let i = 0; i < this.dustX.length; i++) {
      this.dustX[i] = this.dustX[i] + 0.3;
      if (this.dustX[i] > 800) this.dustX[i] = 0;
    }
  }

  display() {
    let h = this.health;

    // Sky will go from warm blue -> grey-brown
    let skyCol = lerpColor(color(140, 115, 90), color(150, 190, 220), h);
    background(skyCol);

    // Ground wil go from green -> dry yellow-brown
    let groundCol = lerpColor(color(150, 125, 85), color(110, 150, 75), h);
    noStroke();
    fill(groundCol);
    rect(0, 330, 800, 170);

    // Trees will disappear as health drops
    for (let i = 0; i < this.treeX.length; i++) {
      if (h > this.treeThreshold[i]) {
        let x = this.treeX[i];
        // Trunk
        fill(80, 55, 35);
        rect(x - 4, 305, 8, 30);
        // green -> brown
        let leafCol = lerpColor(color(110, 95, 65), color(70, 130, 75), h);
        fill(leafCol);
        circle(x, 300, 36);
      }
    }

    // Dust goes from yellow pollen -> grey dust
    let dustCol = lerpColor(color(140, 135, 125), color(235, 215, 140), h);
    fill(dustCol);
    for (let i = 0; i < this.dustX.length; i++) {
      circle(this.dustX[i], this.dustY[i], 3);
    }
  }
}