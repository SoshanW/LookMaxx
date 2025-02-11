const canvas = document.querySelector(".canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext("2d");
const frameCount = 210;

const currentFrame = (index) => `./assets/${(index + 1).toString()}.png`;
const images= []; // store all images
let face = {frame : 0};

for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

gsap.to(face, {
  frame : frameCount - 1,
  snap : "frame",
  ease: "none",
  scrollTrigger : {
    scrub: true,
    pin: "canvas",
    end: "500%",  
  },
  onUpdate: render,
});

images[0].onLoad = render;

function render(){
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(images[face.frame], 0, 0);
}