/*
  Check our the GOAL and the RULES of this exercise at the bottom of this file.
  
  After that, follow these steps before you start coding:

  1. rename the dancer class to reflect your name (line 35).
  2. adjust line 20 to reflect your dancer's name, too.
  3. run the code and see if a square (your dancer) appears on the canvas.
  4. start coding your dancer inside the class that has been prepared for you.
  5. have fun.
*/

let dancer;

function setup() {
  // no adjustments in the setup function needed...
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");

  // ...except to adjust the dancer's name on the next line:
  dancer = new NurbolDancer(width / 2, height / 2);
}

function draw() {
  // you don't need to make any adjustments inside the draw loop
  background(0);
  drawFloor(); // for reference only

  dancer.update();
  dancer.display();
}

// You only code inside this class.
// Start by giving the dancer your name, e.g. LeonDancer.
class NurbolDancer {
  constructor(startX, startY) {
    this.x = startX
    this.y = startY
    this.t = random(1000)
    this.angle = 0
    this.armAngle = 0
    this.legAngle = 0
    this.bounceY = 0
    this.headBob = 0
    this.spinAngle = 0
    this.green = random(10, 200)
    this.col = color(255, 80, this.green)
  }

  update() {
    this.t += 0.05;
    this.angle = sin(this.t) * 0.3
    this.armAngle = sin(this.t * 2) * 0.8
    this.legAngle = sin(this.t * 2) * 0.4
    this.bounceY = sin(this.t * 3.5) * -15
    this.headBob = sin(this.t * 2) * 4
    this.spinAngle = sin(this.t * 0.5) * 0.2
  }

  display() {
    push();
    translate(this.x, this.y + this.bounceY)
    rotate(this.spinAngle)

    // shadow
    noStroke();
    fill(0, 0, 0, 60)
    ellipse(0, 95 - this.bounceY, 60, 10)

    // legs
    this.drawLimb(-10, 60, -10 + sin(this.legAngle) * 25, 95, 6, this.col)
    this.drawLimb(10, 60, 10 - sin(this.legAngle) * 25, 95, 6, this.col)
    // feet
    fill(80, 60, 180)
    noStroke();
    ellipse(-10 + sin(this.legAngle) * 25, 97, 18, 8)
    ellipse(10 - sin(this.legAngle) * 25, 97, 18, 8)

    // body
    fill(this.col)
    stroke(220, 40, 90)
    strokeWeight(1.5)
    rect(-23, 10, 46, 52, 10)

    // belly pattern (dots)
    /* noStroke();
    fill(255, 160, 180, 180)
    ellipse(-10, 30, 8, 8)
    ellipse(10, 30, 8, 8)
    ellipse(0, 45, 8, 8); */

    // left arm
    push();
    translate(-23, 18)
    rotate(-this.armAngle - 0.3)
    this.drawLimb(0, 0, 0, 40, 7, this.col)
    // left hand
    fill(255, 200, 160)
    noStroke();
    ellipse(0, 44, 14, 14)
    pop();

    // right arm
    push();
    translate(23, 18)
    rotate(this.armAngle + 0.3)
    this.drawLimb(0, 0, 0, 40, 7, this.col)
    // right hand
    fill(255, 200, 160)
    noStroke();
    ellipse(0, 44, 14, 14)
    pop();

    // head
    fill(255, 200, 160)
    noStroke();
    rect(-6, -4, 12, 16, 4)
    push()
    translate(this.headBob, -20)
    fill(255, 200, 160)
    stroke(220, 160, 120)
    strokeWeight(1);
    ellipse(0, 0, 52, 52)

    // eyes
    fill(255)
    noStroke();
    ellipse(-11, -4, 14, 14)
    ellipse(11, -4, 14, 14)

    // pupils 
    fill(40, 30, 80);
    noStroke();
    let lookX = map(mouseX, 0, width, -3, 3);
    let lookY = map(mouseY, 0, height, -3, 3);
    lookX = constrain(lookX, -3, 3);
    lookY = constrain(lookY, -3, 3);

    ellipse(-11 + lookX, -3 + lookY, 7, 8);
    ellipse(11 + lookX, -3 + lookY, 7, 8);

    // eyebrows 
    stroke(120, 80, 60)
    strokeWeight(2)
    let browLift = sin(this.t * 2) * 2 + 3
    line(-16, -13 - browLift, -6, -11 - browLift)
    line(6, -11 - browLift, 16, -13 - browLift)

    // mouth
    noFill();
    stroke(180, 80, 80)
    strokeWeight(2)
    let smileW = 14 + sin(this.t * 2) * 3
    arc(0, 8, smileW, 10, 0, PI)

    // hair tufts
    stroke(80, 50, 30)
    strokeWeight(3)
    noFill();
    line(-10, -24, -14, -38)
    line(0, -26, 0, -40);
    line(10, -24, 14, -38)

    pop();

    pop();
  }

  drawLimb(x1, y1, x2, y2, weight, col) {
    stroke(col);
    strokeWeight(weight);
    line(x1, y1, x2, y2);
  }
}


/*
GOAL:
The goal is for you to write a class that produces a dancing being/creature/object/thing. In the next class, your dancer along with your peers' dancers will all dance in the same sketch that your instructor will put together. 

RULES:
For this to work you need to follow one rule: 
  - Only put relevant code into your dancer class; your dancer cannot depend on code outside of itself (like global variables or functions defined outside)
  - Your dancer must perform by means of the two essential methods: update and display. Don't add more methods that require to be called from outside (e.g. in the draw loop).
  - Your dancer will always be initialized receiving two arguments: 
    - startX (currently the horizontal center of the canvas)
    - startY (currently the vertical center of the canvas)
  beside these, please don't add more parameters into the constructor function 
  - lastly, to make sure our dancers will harmonize once on the same canvas, please don't make your dancer bigger than 200x200 pixels. 
*/