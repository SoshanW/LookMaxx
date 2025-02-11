const canvas = document.querySelector(".canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext("2d");
const frameCount = 210;

const currentFrame = (index) => `./assets/${(index + 1).toString()}.png`;