let scanned = [];
let flower;
let rockets;

let curflower = 0;
let curRocket = 0;
let rocketY = 500;
let rocketSpeedY = 0;

function preload() {
  for (let i = 1; i <= 19; i++) {
    scanned.push(loadImage("20260320153440-" + i + ".jpg"));
  }
}

function setup() {
  createCanvas(800, 500);

  eraseBg(scanned, 10);
  flower = crop(scanned, 800, 500, 750, 950);
  rockets = crop(scanned, 1600, 800, 600, 800);
}

function draw() {
  background(255);

  // examples: fkiwer
  let fx = 50;
  let fy = 50;
  let fw = flower[0].width * 0.5;
  let fh = flower[0].height * 0.5;
  let count = 1;

  if (mouseX > fx && mouseX < fx + fw && mouseY > fy && mouseY < fy + fh) {
    curflower = floor((frameCount / 10) % flower.length)
  } else {
    curflower = curflower
  }

  image(flower[curflower], fx, fy, fw, fh);


  // rocket

  if (mouseIsPressed) {
    curRocket = floor((frameCount / 8) % rockets.length);
  } else {
    curRocket = 0;
  }

  image(
    rockets[curRocket],
    mouseX - 140,
    mouseY - 160,
    rockets[0].width * 0.4,
    rockets[0].height * 0.4
  );


  // You shouldn't need to modify these helper functions:
}
function crop(imgs, x, y, w, h) {
  let cropped = [];
  for (let i = 0; i < imgs.length; i++) {
    cropped.push(imgs[i].get(x, y, w, h));
  }
  return cropped;
}

function eraseBg(imgs, threshold = 10) {
  for (let i = 0; i < imgs.length; i++) {
    let img = imgs[i];
    img.loadPixels();
    for (let j = 0; j < img.pixels.length; j += 4) {
      let d = 255 - img.pixels[j];
      d += 255 - img.pixels[j + 1];
      d += 255 - img.pixels[j + 2];
      if (d < threshold) {
        img.pixels[j + 3] = 0;
      }
    }
    img.updatePixels();
  }
  // this function uses the pixels array
  // we will cover this later in the semester - stay tuned
}
