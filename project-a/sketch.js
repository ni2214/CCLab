/*
Template for IMA's Creative Coding Lab 

Project A: Generative Creatures
CCLaboratories Biodiversity Atlas 
*/

body {
    background-color: rgb(20, 12, 1);
    color: white;
    font-family: "Lova Ya Like A Sister", cursive;
    font-weight: 400;
    font-style: normal;
    font-size: 1em;
    line-height: 1.5em;
}

/* title */
#title-wrapper {
    text-align: center;
}

.headline {
    font-size: 5em;
    font-family: "Shizuru", system-ui;
    font-weight: 400;
    font-style: normal;
    margin-top: 80px;
    margin-bottom: 60px;
}

/* main content */
#main-wrapper {
    width: 800px;
    position: relative;
    margin: auto;
}

.black {
    color: rgb(138, 121, 97);
}

.red {
    color: deeppink;
}

.green {
    color: LightSeaGreen;
}

.yellow {
    color: GoldenRod;
}

.two-columns {
    display: flex;
}

.left {
    width: 50%;
    padding: 0px 10px 0px 0px;
}

.right {
    width: 50%;
    padding: 0px 0px 0px 10px;
}

#footer {
    text-align: center;
    font-size: 0.7em;
    margin-top: 60px;
    padding-bottom: 30px;
}

/* home button */
#home a {
    position: fixed;
    right: 15px;
    top: 15px;
    padding: 5px 10px;
    color: dimgrey;
    border: solid grey 0.5px;
    font-size: 0.6em;
    text-decoration: none;
}

#home a:hover {
    background-color: black;
    color: white;
    font-weight: bold;
}

/* p5.js sketch */
canvas {
    display: block;
}

#p5-canvas-container {
    margin: auto;
    width: 1200px;
}
