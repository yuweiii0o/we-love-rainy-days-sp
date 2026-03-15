let socket;
let players = {};
let myID;

let synth;

let pulses = [];
let collisionCooldown = 0;

// rain particles
let rain = [];
let rainCount = 200;

// glow status
let glowPlayers = {};
let glowDuration = 20;

function setup(){

createCanvas(window.innerWidth, window.innerHeight);

socket = io();

synth = new p5.PolySynth();

textAlign(CENTER,CENTER);
textSize(28);

// create rain
for(let i=0;i<rainCount;i++){

rain.push({
x:random(width),
y:random(height),
speed:random(4,10),
len:random(10,20)
});

}

socket.on("connect", ()=>{

myID = socket.id;

});

socket.on("state",(data)=>{

players = data;

});

socket.on("playChord",(data)=>{

playChord(data);

});

}

function draw(){

background(0);

// draw rain
drawRain();

// draw players
drawPlayers();

// draw pulses
drawPulses();

// glow time
updateGlow();

// send my position
if(myID){

socket.emit("move",{
x:mouseX,
y:mouseY
});

}

// check collision
checkCollisions();

if(collisionCooldown>0){
collisionCooldown--;
}

}

function drawRain(){

stroke(255);
strokeWeight(1);

for(let r of rain){

line(r.x,r.y,r.x,r.y+r.len);

r.y += r.speed;

if(r.y > height){
r.y = -20;
r.x = random(width);
}

}

}

function drawPlayers(){

textSize(44);

for(let id in players){

let p = players[id];

push();

noStroke();

// glow setting
if(glowPlayers[id] > 0){

drawingContext.shadowBlur = 25;
drawingContext.shadowColor = "white";

}else{

drawingContext.shadowBlur = 0;

}

if(id === myID){
fill(0,255,220);
}else{
fill(255);
}

text("💧",p.x,p.y);

pop();

}

}

function drawPulses(){

for(let p of pulses){

push();

noFill();
stroke(200,255,255);
strokeWeight(2);

drawingContext.shadowBlur = 25;
drawingContext.shadowColor = "white";

ellipse(p.x,p.y,p.r);

pop();

p.r += 5;

}

pulses = pulses.filter(p=>p.r<220);

}

function updateGlow(){

for(let id in glowPlayers){

glowPlayers[id]--;

if(glowPlayers[id] <= 0){
delete glowPlayers[id];
}

}

}

function checkCollisions(){

if(collisionCooldown>0) return;

let ids = Object.keys(players);

for(let i=0;i<ids.length;i++){

for(let j=i+1;j<ids.length;j++){

let a = players[ids[i]];
let b = players[ids[j]];

let d = dist(a.x,a.y,b.x,b.y);

if(d < 45){

collisionCooldown = 30;

// mark users
glowPlayers[ids[i]] = glowDuration;
glowPlayers[ids[j]] = glowDuration;

socket.emit("collision",{
x:(a.x+b.x)/2,
y:(a.y+b.y)/2
});

}

}

}

}

function playChord(data){

let chords = [
["C4","E4","G4"],
["D4","F4","A4"],
["E4","G4","B4"],
["F4","A4","C5"],
["G4","B4","D5"]
];

let chord = random(chords);

for(let note of chord){
synth.play(note,0.5,0,0.5);
}

pulses.push({
x:data.x,
y:data.y,
r:20
});

}

// unlock audio
function mousePressed(){

userStartAudio();

}

function windowResized(){
resizeCanvas(window.innerWidth, window.innerHeight);
}