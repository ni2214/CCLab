// project b - steppe 

let game;
let env;
let sounds;
let ui;
let mx, my;
let sheep = [];
let sheepC = 15;

function preload() {
  sounds = new SoundBank()
  sounds.loadAll()
}

function setup() {
  let c = createCanvas(800, 500)
  c.parent("p5-canvas-container")
  textFont("Georgia")
  env = new Environment()
  ui = new UI()
  game = new Game()
  for (let i = 0; i < sheepC; i++) {
    sheep.push({ x: random(0, 800), y: random(350, 400), vx: random(-0.4, 0) })
  }
}

function draw() {
  mx = mouseX;
  my = mouseY;

  env.move();
  env.display();

  // play ambient if not on title
  if (game.state != "title") {
    sounds.loopOne("ambient", 0.3)
  }

  game.move()
  game.display()

  if (game.state != "title" && game.state != "ending") {
    ui.drawHUD(env, game)
  }
}

function mousePressed() {
  game.handleClick(mx, my)
}

// shared helpers for minigames - just plain functions
function drawTopBar(label) {
  noStroke();
  fill(0, 0, 0, 160);
  rect(0, 45, 800, 50);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(label, 400, 70);
}

function drawTimerBar(timer, timeLimit, r, g, b) {
  let left = 1 - (timer / timeLimit);
  fill(0, 0, 0, 120);
  rect(250, 110, 300, 10);;
  fill(r, g, b);
  rect(250, 110, 300 * left, 10);
}

// SOUND BANK
class SoundBank {
  constructor() {
    this.snd = []
  }

  loadAll() {
    let names = [
      "ambient", "chop", "pickup", "dig", "gallop", "fire",
      "bowshot", "wolfhowl", "milk", "wind", "shear",
      "success", "failure", "click"
    ]
    for (let i = 0; i < names.length; i++) {
      let n = names[i]
      try {
        this.snd.push({ name: n, sound: loadSound("lib/" + n + ".mp3") })
        console.log(snd)
      } catch (e) {
        this.snd.push({ name: n, sound: null })
      }
    }
  }

  getSound(name) {
    for (let i = 0; i < this.snd.length; i++) {
      if (this.snd[i].name == name) {
        return this.snd[i].sound
      }
    }
    return null
  }

  play(name, vol) {
    let s = this.getSound(name)
    if (s && s.isLoaded && s.isLoaded()) {
      if (vol == undefined) {
        vol = 0.6
      }
      if (s.isPlaying()) {
        s.stop()
      }
      s.play(0, 1, vol)
    }
  }

  loopOne(name, vol) {
    let s = this.getSound(name)
    if (s && s.isLoaded && s.isLoaded() && !s.isPlaying()) {
      if (vol == undefined) {
        vol = 0.4
      }
      s.setVolume(vol)
      s.loop()
    }
  }

  stop(name) {
    let s = this.getSound(name)
    if (s && s.isPlaying && s.isPlaying()) {
      s.stop()
    }
  }

  // turn off looping ones
  killLoops() {
    this.stop("gallop")
    this.stop("fire")
    this.stop("wind")
  }
}

// GAME
class Game {
  constructor() {
    this.state = "title"
    this.currentDec = 0
    this.outcomeText = ""
    this.minigame = null

    // all the decision text
    this.prompts = [
      "Summer has been dry. The wells are low and the grass is thin.",
      "Winter is coming. The tribe needs fuel for the long cold.",
      "Wolves start hunting near the camp. How should we drive them out?",
      "A Chinese merchant offers silver for double the cashmere this season.",
      "A dzud has come. The freeze is killing the weakest of the herd."
    ]

    this.harmChoices = [
      "Dig deeper wells",
      "Chop the pines",
      "Burn the bushes for fire",
      "Shear the goats twice",
      "Slaughter the weak"
    ]
    this.preserveChoices = [
      "Migrate to the river",
      "Gather argal",
      "Hunt them out",
      "Make aaruul instead",
      "Shelter every animal"
    ]

    this.harmHints = [
      "fast : drains the aquifer",
      "fast : harms the ridge",
      "safe : avoid the wolves",
      "rich : the goats grow weak",
      "fed : the herd shrinks for years"
    ]
    this.preserveHints = [
      "slow : spares the pasture",
      "slow : spares the land",
      "dangerous : might get injured",
      "humble : the old way",
      "hard : long cold night ahead"
    ]
  }

  // launch the right minigame for current decision + side
  startMinigame(harmful) {
    let i = this.currentDec
    if (harmful) {
      if (i == 0) {
        this.minigame = new DigMinigame()
      }
      if (i == 1) {
        this.minigame = new ChopMinigame()
      }
      if (i == 2) {
        this.minigame = new TorchMinigame()
      }
      if (i == 3) {
        this.minigame = new ShearMinigame()
      }
      if (i == 4) {
        this.minigame = new CullMinigame()
      }
    } else {
      if (i == 0) {
        this.minigame = new MigrateMinigame()
      }
      if (i == 1) {
        this.minigame = new GatherMinigame()
      }
      if (i == 2) {
        this.minigame = new HuntMinigame()
      }
      if (i == 3) {
        this.minigame = new MilkMinigame()
      }
      if (i == 4) {
        this.minigame = new ShelterMinigame()
      }
    }
    this.state = "minigame"
  }

  // called by minigames when they're done
  finishMinigame(landDelta, tribeDelta, msg, success) {
    env.apply(landDelta, tribeDelta)
    this.outcomeText = msg
    if (success) {
      sounds.play("success")
    } else {
      sounds.play("failure")
    }
    sounds.killLoops()
    this.state = "outcome"
  }

  move() {
    if (this.state == "minigame" && this.minigame) {
      this.minigame.move()
    }
  }

  display() {
    if (this.state == "title") {
      ui.drawTitle()
    } else if (this.state == "prompt") {
      ui.drawPrompt(this)
    } else if (this.state == "minigame" && this.minigame) {
      this.minigame.display()
    } else if (this.state == "outcome") {
      ui.drawOutcome(this)
    } else if (this.state == "ending") {
      ui.drawEnding(env)
    }
  }

  handleClick(x, y) {
    if (this.state == "title") {
      if (ui.inBox(x, y, 300, 380, 200, 50)) {
        sounds.play("click", 0.5)
        this.state = "prompt"
      }
    } else if (this.state == "prompt") {
      if (ui.inBox(x, y, 80, 430, 300, 50)) {
        sounds.play("click", 0.5)
        this.startMinigame(true)
      }
      if (ui.inBox(x, y, 420, 430, 300, 50)) {
        sounds.play("click", 0.5)
        this.startMinigame(false)
      }
    } else if (this.state == "minigame" && this.minigame) {
      this.minigame.handleClick(x, y)
    } else if (this.state == "outcome") {
      if (ui.inBox(x, y, 250, 430, 300, 50)) {
        sounds.play("click", 0.5)
        if (this.currentDec < this.prompts.length - 1) {
          this.currentDec = this.currentDec + 1
          this.state = "prompt"
        } else {
          this.state = "ending"
        }
      }
    } else if (this.state == "ending") {
      if (ui.inBox(x, y, 300, 400, 200, 50)) {
        sounds.play("click", 0.5)
        env = new Environment()
        this.currentDec = 0
        this.state = "title"
      }
    }
  }
}

// UI
class UI {
  constructor() { }

  // does a click hit this rectangle
  inBox(x, y, bx, by, bw, bh) {
    return x > bx && x < bx + bw && y > by && y < by + bh
  }

  drawButton(x, y, w, h, label, r, g, b) {
    let hover = mx > x && mx < x + w && my > y && my < y + h
    noStroke()
    if (hover) {
      fill(r + 30, g + 30, b + 30)
    } else {
      fill(r, g, b)
    }
    rect(x, y, w, h, 4)
    fill(255)
    textAlign(CENTER, CENTER)
    textSize(14)
    text(label, x + w / 2, y + h / 2)
  }

  drawHUD(env, game) {
    noStroke()
    // land bar on left
    fill(0, 0, 0, 140)
    rect(10, 10, 160, 22, 3)
    fill(255)
    textAlign(LEFT, CENTER)
    textSize(11)
    text("LAND", 18, 21)
    fill(100, 160, 80)
    rect(58, 15, 105 * env.health, 12, 2)
    noFill()
    stroke(255, 120)
    rect(58, 15, 105, 12, 2)
    noStroke()

    // tribe bar on right
    fill(0, 0, 0, 140)
    rect(630, 10, 160, 22, 3)
    fill(255)
    textAlign(LEFT, CENTER)
    textSize(11)
    text("TRIBE", 638, 21)
    fill(200, 140, 80)
    rect(683, 15, 100 * env.tribe, 12, 2)
    noFill()
    stroke(255, 120)
    rect(683, 15, 100, 12, 2)
    noStroke()

    // counter
    fill(255, 180)
    textAlign(CENTER, CENTER)
    textSize(10)
    text("decision " + (game.currentDec + 1) + " of " + game.prompts.length, 400, 21)
  }

  drawTitle() {
    fill(0, 0, 0, 120)
    rect(0, 0, 800, 500)
    fill(245, 235, 220)
    textAlign(CENTER, CENTER)
    textSize(34)
    text("STEPPE", 400, 180)
    textSize(14)
    fill(245, 235, 220, 200)
    text("five choices for your tribe", 400, 215)
    text("the land and your people both depend on you", 400, 240)
    this.drawButton(300, 380, 200, 50, "Begin", 90, 70, 50)
  }

  drawPrompt(game) {
    let i = game.currentDec
    noStroke()
    fill(0, 0, 0, 140)
    rect(0, 45, 800, 55)
    fill(255)
    textAlign(CENTER, CENTER)
    textSize(16)
    text(game.prompts[i], 400, 72)

    this.drawButton(80, 430, 300, 50, game.harmChoices[i], 123, 79, 34)
    this.drawButton(420, 430, 300, 50, game.preserveChoices[i], 123, 79, 34)

    fill(255, 200)
    textSize(11)
    text(game.harmHints[i], 230, 493)
    text(game.preserveHints[i], 570, 493)
    //sheep
    let visibleSheep = floor(sheep.length * env.tribe)
    for (let i = 0; i < visibleSheep; i++) {
      let h = sheep[i]
      // graze movement
      h.vx += random(-0.03, 0.03)
      h.vx = constrain(h.vx, -0.5, 0.5)
      h.x += h.vx
      fill(0, 0, 0, 80)
      ellipse(h.x, h.y + 10, 20, 4, 10)
      fill(230, 220, 200)
      ellipse(h.x + 5, h.y - 5, 6, 6)
      ellipse(h.x - 5, h.y + 5, 6, 6)
      ellipse(h.x, h.y, 6, 6)
      ellipse(h.x - 5, h.y - 5, 6, 6)
      ellipse(h.x + 5, h.y + 5, 6, 6)
      ellipse(h.x - 5, h.y, 6, 6)

      ellipse(h.x + 5, h.y, 6, 6)
      ellipse(h.x, h.y + 5, 6, 6)
      ellipse(h.x, h.y - 5, 6, 6)
      ellipse(h.x - 9, h.y, 6, 6)
      ellipse(h.x + 9, h.y, 6, 6)
      fill(100, 80, 60)
      ellipse(h.x - 10, h.y - 4, 10, 8)
    }
  }

  drawOutcome(game) {
    fill(0, 0, 0, 160)
    rect(0, 45, 800, 90)
    fill(255)
    textAlign(CENTER, CENTER)
    textSize(14)
    let lines = game.outcomeText.split("\n")
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], 400, 72 + i * 20)
    }
    let label
    if (game.currentDec < game.prompts.length - 1) {
      label = "Continue"
    } else {
      label = "See the years that follow"
    }
    this.drawButton(250, 430, 300, 50, label, 60, 60, 80)
  }

  drawEnding(env) {
    let h = env.health
    let t = env.tribe

    fill(0, 0, 0, 180)
    rect(0, 0, 800, 500)

    // pick ending
    let title, message
    if (h >= 0.5 && t >= 0.5) {
      title = "The steppe and tribe endure."
      message = "Generations from now, your grandchildren will tell of the year\nthe wells were low and the wolves came near, and the choices held."
    } else if (h >= 0.5 && t < 0.5) {
      title = "The land remembers what the tribe could not."
      message = "The grass is green again. The wells are deep.\nBut few remain to walk the steppe at dawn."
    } else if (h < 0.5 && t >= 0.5) {
      title = "The tribe is fed. The steppe is dust."
      message = "Bellies are full and the children are loud,\nbut the wind carries away what was once green."
    } else {
      title = "Nothing remains."
      message = "The fires are cold. The land is bare.\nThe tribe scatters to the four winds, looking for somewhere else."
    }

    fill(245, 235, 220)
    textAlign(CENTER, CENTER)
    textSize(24)
    text(title, 400, 180)
    textSize(14)
    fill(245, 235, 220, 220)
    let lines = message.split("\n")
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], 400, 230 + i * 20)
    }

    textSize(11)
    fill(255, 200)
    text("final land: " + h.toFixed(2) + "    final tribe: " + t.toFixed(2), 400, 320)

    this.drawButton(300, 400, 200, 50, "Begin again", 60, 60, 80)
  }
}

// MINIGAMES

//chopping pines
class ChopMinigame {
  constructor() {
    this.timer = 0;
    this.timeLimit = 300;
    this.hits = 0;
    this.target = 8;
    this.flash = 0;
    this.shake = 0;
  }

  display() {
    fill(0, 0, 0, 60);
    rect(0, 0, 800, 500);

    // tree
    push()
    translate(400 + this.shake, 0)
    fill(80, 55, 35)
    rect(-12, 180, 24, 180)
    fill(60, 110, 65)
    circle(0, 170, 180)
    circle(-50, 190, 120)
    circle(50, 190, 120)
    pop()

    // axe flash
    if (this.flash > 0) {
      stroke(255, 240, 180, this.flash * 12)
      strokeWeight(3)
      line(360, 250, 440, 280)
      strokeWeight(1)
      noStroke()
    }

    drawTopBar("CLICK to swing the axe  :  " + this.hits + " / " + this.target)
    drawTimerBar(this.timer, this.timeLimit, 200, 80, 60)

    this.move()
  }

  move() {
    this.timer = this.timer + 1
    if (this.flash > 0) {
      this.flash = this.flash - 1
    }
    if (this.shake != 0) {
      this.shake = this.shake * 0.7
    }

    if (this.hits >= this.target) {
      game.finishMinigame(-0.20, 0.15,
        "The pines fall. The ger is warm, the children laugh,\nbut the ridge stands bare against the sky.",
        true)
    } else if (this.timer >= this.timeLimit) {
      game.finishMinigame(-0.12, -0.08,
        "Night fell before the work was done.\nThe pines are wounded. The fire burns small.",
        false)
    }
  }

  handleClick(x, y) {
    if (y > 140) {
      this.hits = this.hits + 1
      this.flash = 20
      this.shake = random([-8, 8])
      sounds.play("chop", 0.8)
    }
  }
}

// gather argal
class GatherMinigame {
  constructor() {
    this.timer = 0;
    this.timeLimit = 1500;
    this.target = 8;
    this.collected = 0;
    this.bits = [];
    this.px = 400;
    this.py = 380;
    for (let i = 0; i < 12; i++) {
      this.bits.push({ x: random(60, 740), y: random(340, 460), picked: false })
    }
  }

  display() {
    drawTopBar("MOVE MOUSE to gather argal  :  " + this.collected + " / " + this.target + " needed")
    drawTimerBar(this.timer, this.timeLimit, 200, 160, 80)

    this.px = lerp(this.px, mx, 0.08)
    this.py = lerp(this.py, constrain(my, 330, 470), 0.08)

    // draw and pick
    for (let i = 0; i < this.bits.length; i++) {
      let b = this.bits[i]
      if (!b.picked) {
        fill(60, 45, 30)
        ellipse(b.x, b.y, 14, 8)
        fill(90, 70, 50)
        ellipse(b.x - 2, b.y - 1, 10, 5)
        let d = dist(this.px, this.py, b.x, b.y)
        if (d < 22) {
          b.picked = true
          sounds.play("pickup", 0.5)
          this.collected = this.collected + 1
        }
      }
    }

    // player
    fill(0, 0, 0, 80)
    ellipse(this.px, this.py + 18, 22, 6)
    fill(140, 70, 50)
    triangle(this.px - 10, this.py + 15, this.px + 10, this.py + 15, this.px, this.py - 8)
    fill(220, 190, 150)
    circle(this.px, this.py - 12, 10)
    fill(80, 50, 30)
    triangle(this.px - 6, this.py - 15, this.px + 6, this.py - 15, this.px, this.py - 22)

    this.move()
  }

  move() {
    this.timer = this.timer + 1
    if (this.collected >= this.target) {
      game.finishMinigame(0.12, -0.15,
        "The basket is full. The argal will burn slow and warm.\nThe pines still whisper on the ridge.",
        true)
    } else if (this.timer >= this.timeLimit) {
      game.finishMinigame(-0.12, -0.20,
        "Dusk came too soon. The basket is light.\nThe tribe will be cold tonight.",
        false)
    }
  }

  handleClick(x, y) {
    // gather uses mouse movement, no click
  }
}

// dig wells
class DigMinigame {
  constructor() {
    this.timer = 0;
    this.timeLimit = 3000;
    this.target = 7;
    this.hits = 0;
    this.depth = 0;
    this.angle = 0;
    this.flash = 0;
  }

  display() {
    fill(0, 0, 0, 80)
    rect(0, 0, 800, 500)

    drawTopBar("CLICK when the shovel is DOWN  :  " + this.hits + " / " + this.target)
    drawTimerBar(this.timer, this.timeLimit, 180, 140, 80)

    // hole
    fill(90, 65, 40)
    rect(300, 280, 200, 180)
    fill(50, 35, 20)
    let hd = 30 + this.depth * 120
    rect(360, 280, 80, hd)

    if (this.depth > 0.7) {
      fill(100, 140, 180, 180)
      rect(365, 275 + hd - 6, 70, 6)
    }

    this.angle = this.angle + 0.08
    let armY = 200 + sin(this.angle) * 80
    let atBottom = sin(this.angle) > 0.85

    push()
    translate(400, armY)
    stroke(100, 70, 40)
    strokeWeight(6)
    line(0, -30, 0, 30)
    noStroke()
    fill(atBottom ? color(220, 200, 150) : color(160, 150, 140))
    rect(-10, 25, 20, 20)
    pop()

    if (this.flash > 0) {
      fill(255, 240, 180, this.flash * 10)
      circle(400, 340, 80)
      this.flash = this.flash - 1
    }

    this.move()
  }

  move() {
    this.timer = this.timer + 1
    if (this.hits >= this.target) {
      game.finishMinigame(-0.20, 0.20,
        "Water rises from the deep.\nThe herds drink, but the groundwater is depleted slowly.",
        true)
    } else if (this.timer >= this.timeLimit) {
      game.finishMinigame(-0.15, -0.05,
        "The well is shallow and muddy.\nSome water for the tribe. Less grass next spring.",
        false)
    }
  }

  handleClick(x, y) {
    if (y > 140 && sin(this.angle) > 0.85) {
      this.hits = this.hits + 1
      this.flash = 20
      this.depth = this.hits / this.target
      sounds.play("dig", 0.7)
    }
  }
}

// migrating
class MigrateMinigame {
  constructor() {
    this.timer = 0
    this.timeLimit = 1200
    this.rx = 80
    this.ry = 400
    this.herd = []
    this.progress = 0
    this.scatter = 0
    for (let i = 0; i < 5; i++) {
      this.herd.push({ x: 40 + i * 12, y: 400 + random(-10, 10) })
    }
    sounds.loopOne("gallop", 0.3)
  }

  display() {
    fill(0, 0, 0, 60);
    rect(0, 0, 800, 500);

    drawTopBar("MOVE MOUSE to lead the tribe to the river  :  keep the herd close");

    // progress bar
    fill(0, 0, 0, 120);
    rect(250, 110, 300, 10);
    fill(100, 140, 180);
    rect(250, 110, 300 * this.progress, 10);

    // river
    fill(100, 140, 180, 200)
    rect(720, 380, 80, 50)
    fill(255)
    textSize(11)
    text("river", 760, 405)

    // rider follows mouse
    let tx = constrain(mx, 40, 720)
    let ty = constrain(my, 370, 450)
    this.rx = lerp(this.rx, tx, 0.08)
    this.ry = lerp(this.ry, ty, 0.08)
    this.progress = constrain((this.rx - 80) / 640, 0, 1)

    // herd follows in chain
    for (let i = 0; i < this.herd.length; i++) {
      let lead;
      let xOffset;
      if (i == 0) {
        lead = { x: this.rx, y: this.ry }
        xOffset = 40
      } else {
        lead = this.herd[i - 1]
        xOffset = 20
      }
      this.herd[i].x = lerp(this.herd[i].x, lead.x - xOffset, 0.04)
      this.herd[i].y = lerp(this.herd[i].y, lead.y, 0.04)
    }

    // check scatter
    let last = this.herd[this.herd.length - 1]
    let gap = this.rx - last.x
    if (gap > 280) {
      this.scatter = this.scatter + 0.5
    } else {
      this.scatter = max(0, this.scatter - 0.2)
    }

    // draw herd
    for (let i = 0; i < this.herd.length; i++) {
      let h = this.herd[i]
      fill(0, 0, 0, 80)
      ellipse(h.x, h.y + 10, 20, 4)
      fill(230, 220, 200)
      ellipse(h.x + 5, h.y - 5, 6, 6)
      ellipse(h.x - 5, h.y + 5, 6, 6)
      ellipse(h.x, h.y, 6, 6)
      ellipse(h.x - 5, h.y - 5, 6, 6)
      ellipse(h.x + 5, h.y + 5, 6, 6)
      ellipse(h.x - 5, h.y, 6, 6)

      ellipse(h.x + 5, h.y, 6, 6)
      ellipse(h.x, h.y + 5, 6, 6)
      ellipse(h.x, h.y - 5, 6, 6)
      ellipse(h.x - 9, h.y, 6, 6)
      ellipse(h.x + 9, h.y, 6, 6)
      fill(100, 80, 60)
      ellipse(h.x - 10, h.y - 4, 10, 8)
    }

    // rider + horse
    fill(0, 0, 0, 80);
    ellipse(this.rx, this.ry + 18, 24, 6);
    fill(120, 80, 55);
    ellipse(this.rx, this.ry + 5, 34, 16);
    fill(140, 70, 50);
    triangle(this.rx - 6, this.ry, this.rx + 6, this.ry, this.rx, this.ry - 20);
    fill(220, 190, 150);
    circle(this.rx, this.ry - 22, 8);

    if (this.scatter > 20) {
      fill(255, 80, 80, 180)
      textSize(12)
      textAlign(CENTER, CENTER)
      text("the herd is scattering!", 400, 130)
    }

    // small timer bar
    let tl = 1 - (this.timer / this.timeLimit)
    fill(0, 0, 0, 120)
    rect(250, 125, 300, 6)
    fill(180, 140, 80)
    rect(250, 125, 300 * tl, 6)

    this.move()
  }

  move() {
    this.timer = this.timer + 1
    let lastSheep = this.herd[this.herd.length - 1]

    if (lastSheep.x >= 500 && this.scatter < 60) {
      sounds.stop("gallop")
      game.finishMinigame(0.04, -0.10,
        "The tribe crosses to the far river.\nThe old pasture rests, and the children swim at dusk.",
        true)
    } else if (lastSheep.x >= 715 && this.scatter >= 60) {
      sounds.stop("gallop")
      game.finishMinigame(0.04, -0.05,
        "You reach the river, but some of the herd was lost on the way.\nThe tribe will eat thin this season.",
        false)
    } else if (this.timer >= this.timeLimit) {
      sounds.stop("gallop")
      game.finishMinigame(0.02, -0.15,
        "Darkness fell before the river.\nThe tribe camps hungry in the open.",
        false)
    }
  }

  handleClick(x, y) {
    // migrate uses mouse movement, no click
  }
}

// torch
class TorchMinigame {
  constructor() {
    this.timer = 0
    this.timeLimit = 1820
    this.target = 6
    this.lit = 0
    this.bushes = []
    for (let i = 0; i < 12; i++) {
      this.bushes.push({
        x: random(80, 720),
        y: random(340, 460),
        burning: false,
        burned: false,
        ignTime: 0
      })
    }
    sounds.play("wolfhowl", 0.3)
  }

  display() {
    fill(20, 15, 10, 180);
    rect(0, 0, 800, 500);

    fill(0, 0, 0, 180);
    noStroke();
    rect(0, 45, 800, 50);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("CLICK bushes to ignite them  :  " + this.lit + " / " + this.target + " scorched", 400, 70)

    drawTimerBar(this.timer, this.timeLimit, 200, 100, 60)

    let anyOnFire = false
    for (let i = 0; i < this.bushes.length; i++) {
      let b = this.bushes[i]
      if (b.burned) {
        fill(40, 30, 25)
        ellipse(b.x, b.y, 18, 8)
      } else if (b.burning) {
        anyOnFire = true
        let f = sin(frameCount * 0.3 + i) * 4
        fill(255, 140, 40, 200)
        circle(b.x, b.y - 6 + f, 22)
        fill(255, 200, 80, 200)
        circle(b.x, b.y - 10 + f, 14)
        fill(255, 240, 180, 150)
        circle(b.x, b.y - 14 + f, 8)

        b.ignTime = b.ignTime + 1
        // spread to neighbors
        if (b.ignTime > 40) {
          for (let j = 0; j < this.bushes.length; j++) {
            let other = this.bushes[j]
            if (!other.burning && !other.burned) {
              let d = dist(b.x, b.y, other.x, other.y)
              if (d < 70) {
                other.burning = true
                this.lit = this.lit + 1
              }
            }
          }
        }
        if (b.ignTime > 120) {
          b.burning = false
          b.burned = true
        }
      } else {
        fill(60, 80, 50);
        circle(b.x, b.y, 18);
        fill(80, 100, 60);
        circle(b.x - 3, b.y - 3, 10);
      }
    }

    // fire crackling sound
    if (anyOnFire) {
      sounds.loopOne("fire", 0.3)
    } else {
      sounds.stop("fire")
    }

    // wolf eyes
    for (let i = 0; i < 3; i++) {
      let wx = 50 + i * 250 + sin(frameCount * 0.02 + i) * 8
      fill(255, 200, 50, 180)
      circle(wx, 200, 4)
      circle(wx + 8, 200, 4)
    }

    this.move()
  }

  move() {
    this.timer = this.timer + 1

    if (this.lit >= this.target && this.lit < 10) {
      sounds.stop("fire")
      game.finishMinigame(-0.24, -0.02,
        "The brushland burns. The wolves flee the flames.\nThe tribe sleeps, but the grass will not return here for years.",
        true)
    } else if (this.lit >= 10) {
      sounds.stop("fire")
      game.finishMinigame(-0.30, -0.10,
        "The fire spread beyond your hand.\nThe wolves are gone, but so is the steppe for miles.",
        false)
    } else if (this.timer >= this.timeLimit) {
      sounds.stop("fire")
      game.finishMinigame(-0.10, -0.10,
        "The fires died before the wolves scattered.\nThe hunt goes on, and the tribe does not sleep.",
        false)
    }
  }

  handleClick(x, y) {
    if (y < 140) {
      return
    }
    for (let i = 0; i < this.bushes.length; i++) {
      let b = this.bushes[i]
      if (!b.burning && !b.burned) {
        let d = dist(x, y, b.x, b.y)
        if (d < 20) {
          b.burning = true
          this.lit = this.lit + 1
          break
        }
      }
    }
  }
}

// hunting
class HuntMinigame {
  constructor() {
    this.timer = 0
    this.timeLimit = 1200
    this.target = 3
    this.kills = 0
    this.arrows = 8
    this.injury = 0
    this.wolves = []
    for (let i = 0; i < 4; i++) {
      this.wolves.push({ x: random(100, 700), y: random(350, 440), alive: true, vx: random(-1.5, 1.5), vy: random(-0.5, 0.5) })
    }
    sounds.play("wolfhowl", 0.3)
  }

  display() {
    fill(0, 0, 0, 80)
    rect(0, 0, 800, 500)

    fill(0, 0, 0, 160)
    noStroke()
    rect(0, 45, 800, 50)
    fill(255)
    textAlign(CENTER, CENTER)
    textSize(14)
    text("AIM and CLICK to loose an arrow  :  " + this.kills + " / " + this.target + " wolves  :  " + this.arrows + " arrows left", 400, 70)

    drawTimerBar(this.timer, this.timeLimit, 160, 80, 80)

    // move and draw wolves
    for (let i = 0; i < this.wolves.length; i++) {
      let w = this.wolves[i]
      if (w.alive) {
        w.x = w.x + w.vx
        w.y = w.y + w.vy
        if (w.x < 60 || w.x > 740) {
          w.vx = w.vx * -1
        }
        if (w.y < 270 || w.y > 450) {
          w.vy = w.vy * -1
        }
        // sometimes change direction randomly
        if (random() < 0.02) {
          w.vx = random(-2, 2)
          w.vy = random(-0.8, 0.8)
        }

        fill(0, 0, 0, 80)
        ellipse(w.x, w.y + 10, 30, 5)
        fill(70, 65, 60)
        ellipse(w.x, w.y, 32, 14)
        fill(90, 85, 80)
        circle(w.x + (w.vx > 0 ? 14 : -14), w.y - 4, 10)
        fill(220, 180, 60)
        circle(w.x + (w.vx > 0 ? 16 : -16), w.y - 5, 2)

        if (w.x > 700) {
          this.injury = this.injury + 1
          w.x = random(100, 400)
        }
      }
    }

    // crosshair
    stroke(255, 100, 100, 180)
    strokeWeight(1)
    noFill()
    circle(mx, my, 24)
    line(mx - 16, my, mx + 16, my)
    line(mx, my - 16, mx, my + 16)
    noStroke()

    if (this.injury > 0) {
      fill(255, 80, 80, 180)
      textSize(12)
      textAlign(CENTER, CENTER)
      text("wolves reached the camp: " + this.injury, 400, 130)
    }

    this.move()
  }

  move() {
    this.timer = this.timer + 1

    if (this.kills >= this.target) {
      let gain = 0.12 - this.injury * 0.04
      let msg
      if (this.injury == 0) {
        msg = "Clean arrows, clean kills.\nThe wolves are dead and the tribe is whole."
      } else {
        msg = "The wolves are dead, but some broke through.\nThere are wounds to tend by morning."
      }
      game.finishMinigame(-0.03, gain, msg, true)
    } else if (this.arrows <= 0 || this.timer >= this.timeLimit) {
      game.finishMinigame(-0.03, -0.25,
        "The hunt failed. The wolves slipped into the dark,\nand the camp paid for it in blood.",
        false)
    }
  }

  handleClick(x, y) {
    if (y < 140) {
      return
    }
    if (this.arrows <= 0) {
      return
    }
    this.arrows = this.arrows - 1
    sounds.play("bowshot", 0.7)
    for (let i = 0; i < this.wolves.length; i++) {
      let w = this.wolves[i]
      if (w.alive) {
        let d = dist(x, y, w.x, w.y)
        if (d < 22) {
          w.alive = false
          this.kills = this.kills + 1
          return
        }
      }
    }
  }
}

// shearing goats
class ShearMinigame {
  constructor() {
    this.timer = 0
    this.timeLimit = 2080
    this.target = 8
    this.done = 0
    this.theGoats = []
    for (let i = 0; i < 8; i++) {
      this.theGoats.push({ x: 100 + (i % 4) * 160, y: 290 + floor(i / 4) * 100, wool: 1.0, sheared: false })
    }
  }

  display() {
    fill(0, 0, 0, 60)
    rect(0, 0, 800, 500)

    drawTopBar("CLICK each goat to shear it  :  " + this.done + " / " + this.target)
    drawTimerBar(this.timer, this.timeLimit, 220, 180, 100)

    for (let i = 0; i < this.theGoats.length; i++) {
      let g = this.theGoats[i]
      // shadow
      fill(0, 0, 0, 80)
      ellipse(g.x, g.y + 22, 50, 6)
      // body
      fill(245 - 100 * (1 - g.wool), 235 - 80 * (1 - g.wool), 215 - 60 * (1 - g.wool))
      ellipse(g.x, g.y, 50 + 10 * g.wool, 30 + 6 * g.wool)
      // head
      fill(180, 150, 120)
      ellipse(g.x - 20, g.y - 8, 20, 16)
      // horns
      stroke(60, 45, 30)
      strokeWeight(2)
      noFill()
      arc(g.x - 22, g.y - 16, 12, 14, PI, TWO_PI)
      arc(g.x - 14, g.y - 16, 10, 12, PI, TWO_PI)
      noStroke()

      if (g.sheared) {
        fill(150, 130, 100, 200)
        textSize(10)
        textAlign(CENTER, CENTER)
        text("done", g.x, g.y - 35)
      }
    }

    this.move()
  }

  move() {
    this.timer = this.timer + 1
    if (this.done >= this.target) {
      game.finishMinigame(-0.16, 0.15,
        "The wool fills the carts. Silver fills the pouch.\nThe goats shiver in the wind.",
        true)
    } else if (this.timer >= this.timeLimit) {
      game.finishMinigame(-0.14, -0.05,
        "Some wool was sheared, some left on the goats.\nThe merchant offered less than promised.",
        false)
    }
  }

  handleClick(x, y) {
    if (y < 140) {
      return
    }
    for (let i = 0; i < this.theGoats.length; i++) {
      let g = this.theGoats[i]
      if (!g.sheared) {
        let d = dist(x, y, g.x, g.y)
        if (d < 30) {
          g.sheared = true
          g.wool = 0
          this.done = this.done + 1
          sounds.play("shear", 0.6)
          return
        }
      }
    }
  }
}

class MilkMinigame {
  constructor() {
    this.timer = 0
    this.timeLimit = 2000
    this.target = 8
    this.hits = 0
    this.misses = 0
    this.pulse = 0
    this.flash = 0
    this.inWindow = false
  }

  display() {
    fill(0, 0, 0, 60)
    rect(0, 0, 800, 500)

    drawTopBar("CLICK in time with the pulse  :  " + this.hits + " / " + this.target + "    misses: " + this.misses)
    drawTimerBar(this.timer, this.timeLimit, 180, 200, 220)

    this.pulse = this.pulse + 0.06
    let pVal = sin(this.pulse)
    this.inWindow = pVal > 0.85

    push()
    translate(400, 320)

    fill(0, 0, 0, 80)
    ellipse(0, 50, 100, 12)

    // pail
    fill(120, 80, 50)
    rect(-40, 0, 80, 50)
    fill(150, 100, 60)
    rect(-40, -4, 80, 8)
    fill(80, 50, 30)
    rect(-40, 46, 80, 4)

    // milk inside
    let lvl = this.hits / this.target
    fill(245, 240, 220, 230)
    rect(-36, 4 + (1 - lvl) * 42, 72, lvl * 42)

    // pulse ring
    noFill()
    if (this.inWindow) {
      stroke(255, 220, 120, 220);
      strokeWeight(4);
    } else {
      stroke(180, 180, 200, 100);
      strokeWeight(2);
    }
    let r = 60 + pVal * 18
    circle(0, 25, r * 2)
    noStroke()

    if (this.flash > 0) {
      fill(255, 240, 180, this.flash * 10)
      circle(0, 25, 130)
      this.flash = this.flash - 1
    }
    pop()

    // goat at top
    fill(245, 235, 215);
    ellipse(400, 270, 70, 40);
    fill(180, 150, 120);;
    ellipse(370, 260, 22, 18);

    if (this.inWindow) {
      fill(255, 220, 120, 200);
      textSize(11);
      textAlign(CENTER, CENTER);
      text("now!", 400, 200);
    }

    this.move()
  }

  move() {
    this.timer = this.timer + 1
    if (this.hits >= this.target) {
      game.finishMinigame(0.02, 0.10,
        "The aaruul dries on the felt in the sun.\nNot rich, but the goats are strong, and the work is yours.",
        true)
    } else if (this.misses >= 8 || this.timer >= this.timeLimit) {
      game.finishMinigame(0.01, -0.08,
        "The rhythm broke. The pail sits half-full,\nand the merchant rides on without a trade.",
        false)
    }
  }

  handleClick(x, y) {
    if (y < 140) {
      return;
    }
    if (this.inWindow) {
      this.hits = this.hits + 1;
      this.flash = 20;
      sounds.play("milk", 0.6);
    } else {
      this.misses = this.misses + 1
    }
  }
}

// dzud harmful
class CullMinigame {
  constructor() {
    this.timer = 0
    this.timeLimit = 2080
    this.target = 5
    this.done = 0
    this.mistakes = 0
    this.animals = []
    let weakList = []
    while (weakList.length < 6) {
      let r = floor(random(10))
      if (weakList.indexOf(r) == -1) {
        weakList.push(r)
      }
    }
    for (let i = 0; i < 10; i++) {
      this.animals.push({ x: 80 + (i % 5) * 140, y: 290 + floor(i / 5) * 90, weak: weakList.indexOf(i) != -1, culled: false })
    }
  }

  display() {
    fill(0, 0, 0, 80)
    rect(0, 0, 800, 500)

    drawTopBar("CLICK the WEAK animals (drooping, thin)  :  " + this.done + " / " + this.target + "    mistakes: " + this.mistakes)
    drawTimerBar(this.timer, this.timeLimit, 160, 80, 80)

    for (let i = 0; i < this.animals.length; i++) {
      let a = this.animals[i]
      if (a.culled) {
        fill(60, 50, 45)
        ellipse(a.x, a.y, 40, 12)
        continue
      }

      fill(0, 0, 0, 80)
      ellipse(a.x, a.y + 22, 40, 5)

      // weak ones look smaller and greyer
      let bw, bh, r, g, b;
      if (a.weak) {
        bw = 38
        bh = 22
        r = 200
        g = 195
        b = 190
      } else {
        bw = 50
        bh = 30
        r = 240
        g = 230
        b = 215
      }
      fill(r, g, b)
      ellipse(a.x, a.y, bw, bh)

      fill(180, 150, 120)
      let hy = a.weak ? a.y - 2 : a.y - 8
      ellipse(a.x - 18, hy, 18, 14)

      if (a.weak) {
        // shivering line under weak ones
        let s = sin(frameCount * 0.4 + i) * 1
        stroke(150, 150, 160, 120)
        strokeWeight(1)
        line(a.x - 5 + s, a.y + 12, a.x + 5 + s, a.y + 12)
        noStroke()
      }
    }

    this.move()
  }

  move() {
    this.timer = this.timer + 1
    if (this.done >= this.target) {
      let pen = 0.18 - this.mistakes * 0.04
      let msg
      if (this.mistakes == 0) {
        msg = "The weak are taken. The tribe eats meat tonight,\nbut the herd is smaller for the spring."
      } else {
        msg = "The wrong animals were taken with the right.\nThe herd will struggle to recover."
      }
      game.finishMinigame(-0.14, pen, msg, true)
    } else if (this.timer >= this.timeLimit) {
      game.finishMinigame(-0.14, -0.15,
        "Indecision in the cold. Some animals froze where they stood.\nThe tribe eats little, and the herd is thin.",
        false)
    }
  }

  handleClick(x, y) {
    if (y < 140) {
      return
    }
    for (let i = 0; i < this.animals.length; i++) {
      let a = this.animals[i]
      if (!a.culled) {
        let d = dist(x, y, a.x, a.y)
        if (d < 28) {
          a.culled = true
          if (a.weak) {
            this.done = this.done + 1
          } else {
            this.mistakes = this.mistakes + 1
          }
          sounds.play("shear", 0.4)
          return
        }
      }
    }
  }
}

// dzud preserving
class ShelterMinigame {
  constructor() {
    this.timer = 0
    this.timeLimit = 2020
    this.herdX = 400
    this.herdY = 330
    this.threats = []
    this.spawnTimer = 0
    this.health = 1.0
    sounds.loopOne("wind", 0.5)
  }

  display() {
    // cold tint
    fill(180, 200, 220, 40)
    rect(0, 0, 800, 500)

    // snow
    for (let i = 0; i < 30; i++) {
      let sx = (frameCount * 1.5 + i * 73) % 800
      let sy = (frameCount * 2 + i * 51) % 500
      fill(240, 245, 250, 180)
      circle(sx, sy, 2)
    }

    fill(0, 0, 0, 160)
    noStroke()
    rect(0, 45, 800, 50)
    fill(255)
    textAlign(CENTER, CENTER)
    textSize(14)
    text("DRAG MOUSE around the herd to shield them  :  herd health " + floor(this.health * 100) + "%", 400, 70)

    drawTimerBar(this.timer, this.timeLimit, 180, 200, 220)

    // herd in center
    fill(0, 0, 0, 80)
    ellipse(this.herdX, this.herdY + 30, 90, 12)
    for (let i = 0; i < 5; i++) {
      let ax = this.herdX + (i - 2) * 18
      let ay = this.herdY + (i % 2) * 6
      fill(230, 220, 200)
      ellipse(ax, ay, 24, 16)
      fill(180, 150, 120)
      ellipse(ax - 10, ay - 4, 10, 8)
    }

    // shield
    noFill()
    stroke(255, 255, 255, 120)
    strokeWeight(2)
    circle(mx, my, 80)
    noStroke()

    // spawn threats from edges
    this.spawnTimer = this.spawnTimer + 1
    if (this.spawnTimer > 25) {
      this.spawnTimer = 0
      this.spawnThreat()
    }

    // update threats
    for (let i = this.threats.length - 1; i >= 0; i--) {
      let th = this.threats[i]
      th.x = th.x + th.vx
      th.y = th.y + th.vy

      // shield pushes them
      let ds = dist(mx, my, th.x, th.y)
      if (ds < 40) {
        let px = (th.x - mx) / ds
        let py = (th.y - my) / ds
        th.vx = px * 2.5
        th.vy = py * 2.5
      }

      // check herd
      let dh = dist(this.herdX, this.herdY, th.x, th.y)
      if (dh < 50) {
        this.health = max(0, this.health - 0.04)
        this.threats.splice(i, 1)
        continue
      }

      // off screen
      if (th.x < -50 || th.x > 850 || th.y < -50 || th.y > 550) {
        this.threats.splice(i, 1)
        continue
      }

      // draw
      if (th.type == "Cold") {
        fill(160, 200, 230)
        ellipse(th.x, th.y, 24, 12)
        fill(220, 180, 60)
        circle(th.x + 8, th.y - 2, 2)
      } else {
        // cold gust thing
        fill(160, 200, 230, 180)
        ellipse(th.x, th.y, 20, 14)
        fill(220, 235, 245, 200)
        ellipse(th.x - 4, th.y, 12, 8)
      }
    }

    this.move()
  }

  spawnThreat() {
    let edge = floor(random(4))
    let tx, ty
    if (edge == 0) {
      tx = -20; ty = random(150, 450)
    } else if (edge == 1) {
      tx = 820; ty = random(150, 450)
    } else if (edge == 2) {
      tx = random(800); ty = 130
    } else {
      tx = random(800); ty = 480
    }

    // aim at herd
    let dx = this.herdX - tx
    let dy = this.herdY - ty
    let d = sqrt(dx * dx + dy * dy)
    let sp = random(0.8, 1.6)
    let type = random() < 0.5 ? "wolf" : "cold"
    this.threats.push({ x: tx, y: ty, vx: (dx / d) * sp, vy: (dy / d) * sp, type: type })
  }

  move() {
    this.timer = this.timer + 1

    if (this.timer >= this.timeLimit) {
      sounds.stop("wind")
      if (this.health >= 0.6) {
        game.finishMinigame(0.04, -0.02,
          "Dawn breaks. The herd is shivering but whole.\nNo animal lost. The tribe walks lighter into spring.",
          true)
      } else if (this.health >= 0.3) {
        game.finishMinigame(0.03, -0.04,
          "Most of the herd survives.\nA few were lost to the wolves and the cold.",
          false)
      } else {
        game.finishMinigame(0.02, -0.18,
          "The night was too long. The herd is thin and frightened.\nThe tribe paid for kindness in blood and breath.",
          false)
      }
    }
  }

  handleClick(x, y) {
    // shelter uses mouse movement, no click
  }
}

// ENVIRONMENT
class Environment {
  constructor() {
    this.health = 1.0
    this.targetHealth = 1.0
    this.tribe = 1.0
    this.targetTribe = 1.0

    // trees
    this.treeX = []
    this.treeT = []
    for (let i = 0; i < 10; i++) {
      this.treeX.push(60 + i * 75)
      this.treeT.push(i * 0.08)
    }

    // dust
    this.dustX = []
    this.dustY = []
    for (let i = 0; i < 40; i++) {
      this.dustX.push(random(800))
      this.dustY.push(random(70, 320))
    }

    // figures near ger
    this.figX = []
    this.figT = []
    for (let i = 0; i < 5; i++) {
      this.figX.push(620 + i * 22)
      this.figT.push(i * 0.18)
    }
  }

  apply(landDelta, tribeDelta) {
    this.targetHealth = constrain(this.targetHealth + landDelta, 0, 1)
    this.targetTribe = constrain(this.targetTribe + tribeDelta, 0, 1)
  }

  move() {
    // smooth toward target
    this.health = lerp(this.health, this.targetHealth, 0.05)
    this.tribe = lerp(this.tribe, this.targetTribe, 0.05)

    // move dust
    for (let i = 0; i < this.dustX.length; i++) {
      this.dustX[i] = this.dustX[i] + 0.3
      if (this.dustX[i] > 800) {
        this.dustX[i] = 0
      }
    }
  }

  display() {
    let h = this.health
    let t = this.tribe

    // sky
    let skyCol = lerpColor(color(140, 115, 90), color(150, 190, 220), h)
    background(skyCol)

    // ground
    let gCol = lerpColor(color(150, 125, 85), color(110, 150, 75), h)
    noStroke()
    fill(gCol)
    rect(0, 330, 800, 170)

    // trees
    for (let i = 0; i < this.treeX.length; i++) {
      if (h > this.treeT[i]) {
        let x = this.treeX[i]
        fill(80, 55, 35)
        rect(x - 4, 305, 8, 30)
        let lc = lerpColor(color(110, 95, 65), color(70, 130, 75), h)
        fill(lc)
        circle(x, 300, 36)
      }
    }

    // dust
    let dCol = lerpColor(color(140, 135, 125), color(235, 215, 140), h)
    fill(dCol)
    for (let i = 0; i < this.dustX.length; i++) {
      circle(this.dustX[i], this.dustY[i], 3)
    }

    // ger
    this.drawGer(t)

    // people
    for (let i = 0; i < this.figX.length; i++) {
      if (t > this.figT[i]) {
        let x = this.figX[i]
        fill(0, 0, 0, 80)
        ellipse(x, 353, 10, 3)
        fill(100, 60, 45)
        triangle(x - 4, 350, x + 4, 350, x, 340)
        fill(220, 190, 150)
        circle(x, 337, 5)
      }
      if (t < this.figT[i]) {
        let x = this.figX[i]
        fill(255, 0, 0, 100)
        ellipse(x + 5, 350, 10, 3)
        fill(100, 60, 45)
        triangle(x + 10, 345, x, 350, x, 340)
        fill(220, 190, 150)
        circle(x + 12, 345, 5)
      }
    }

    // smoke
    if (t > 0.5) {
      fill(240, 235, 225, 120 * t)
      for (let i = 0; i < 3; i++) {
        let sy = 260 - i * 18
        let sx = 705 + sin(frameCount * 0.02 + i) * 6
        circle(sx, sy, 10 + i * 3)
      }
    }
    if (t > 0.5) {
      fill(240, 235, 225, 120 * t)
      for (let i = 0; i < 3; i++) {
        let sy = 260 - i * 18
        let sx = 760 + cos(frameCount * 0.02 + i) * 6
        circle(sx, sy, 10 + i * 3)
      }
    }
  }

  drawGer(t) {
    let a = 80 + 175 * t
    let s = 0.7 + 0.3 * t

    push()
    translate(700, 340)
    scale(s)
    // body
    fill(235, 225, 210, a)
    rect(-30, -40, 60, 40)
    // roof
    fill(215, 200, 180, a)
    triangle(-32, -40, 32, -40, 0, -65)
    // door
    fill(140, 50, 40, a)
    rect(-6, -20, 12, 20)
    // smoke hole
    fill(60, 40, 25, a)
    ellipse(0, -62, 8, 3)
    pop()
    push()
    translate(755, 340)
    scale(s)
    // body
    fill(245, 235, 220, a)
    rect(-30, -40, 60, 40)
    // roof
    fill(225, 210, 190, a)
    triangle(-32, -40, 32, -40, 0, -65)
    // door
    fill(140, 50, 40, a)
    rect(-6, -20, 12, 20)
    // smoke hole
    fill(60, 40, 25, a)
    ellipse(0, -62, 8, 3)
    pop()
  }
}