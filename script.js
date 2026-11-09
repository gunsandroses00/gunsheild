const canvas= document.getElementById("space");
const ctx=canvas.getContext("2d");
const gravitySlider=document.getElementById("gravity");
const massSlider=document.getElementById("mass");
const velocitySlider=document.getElementById("velocity");
const addButton=document.getElementById("addPlanet");
const pauseButton=document.getElementById("pauseBtn");
const resetButton= document.getElementById("resetBtn");

const COLORS={
    background: "#000000",
    Star:"#ffffff",
    planet:"#53ff9b",
    planetColors:["#53ff9b","#ffffff","#b5ffd5"],
    orbit:"rgba(83,255,155,0.18)",
    glow:"#53ff9b"
}
let gravity=1;
let planetMass=10;
let velocityMultiplier=1;
let paused= false;

const star={
    x:0,
    y:0,
    mass:1000,
    radius:11
};





let planets=[];
const G=0.18;
let selectedPlanet=null;






function resizeCanvas(){
    const rect=canvas.getBoundingClientRect();
    const oldX= star.x;
    const oldY=star.y;
    const dpr=window.devicePixelRatio|| 1;
    canvas.width=rect.width*dpr;
    canvas.height=rect.height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    star.x=rect.width/2;
    star.y=rect.height/2;
    if (oldX !==0|| oldY!==0){
        planets.forEach(planet=>{
            planet.x+=star.x-oldX;
            planet.y+=star.y-oldY;
        });
    }
    draw();
}
function addPlanet(distance=null){
    const angle=Math.random()*Math.PI*2;
    const radius=distance|| 100+Math.random()*160;
    const x=star.x+Math.cos(angle)*radius;
    const y=star.y+Math.sin(angle)*radius;
    const speed=Math.sqrt(
        G*gravity*star.mass/radius)*velocityMultiplier;
    const planet={
        x:x,
        y:y,
        vx: -Math.sin(angle)*speed,
        vy: Math.cos(angle)*speed,
        mass: planetMass,
        radius: Math.max(4,Math.min(10, 3+planetMass*0.2)),

        color: COLORS.planetColors[
            Math.floor(Math.random()*COLORS.planetColors.length)
        ],
        trail:[]
    };
    planets.push(planet);
    updateStats();
}
function updateStats(){
    document.getElementById("planetCount").textContent=planets.length;
}


function updatePhysics() {
    const substeps = 4;
    const dt = 1 / substeps;
    for (let step = 0; step < substeps; step++) {
        const accelerations = planets.map(() => ({
            ax: 0,
            ay: 0
        }));
        planets.forEach((planet, i) => {
            const dx = star.x - planet.x;
            const dy = star.y - planet.y;
            const distanceSquared = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSquared);
            if (distance < 25) return;
            const acceleration =
                G * gravity * star.mass / distanceSquared;
            accelerations[i].ax +=
                (dx / distance) * acceleration;
            accelerations[i].ay +=
                (dy / distance) * acceleration;
        });
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const p1 = planets[i];
                const p2 = planets[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distanceSquared = dx * dx + dy * dy;
                const distance = Math.sqrt(distanceSquared);
                if (distance < 12) continue;
                const acceleration1 =
                    G * gravity * p2.mass / distanceSquared;
                const acceleration2 =
                    G * gravity * p1.mass / distanceSquared;
                accelerations[i].ax +=
                    (dx / distance) * acceleration1;
                accelerations[i].ay +=
                    (dy / distance) * acceleration1;
                accelerations[j].ax -=
                    (dx / distance) * acceleration2;
                accelerations[j].ay -=
                    (dy / distance) * acceleration2;
            }
        }
        planets.forEach((planet, i) => {
            planet.vx += accelerations[i].ax * dt;
            planet.vy += accelerations[i].ay * dt;
            planet.x += planet.vx * dt;
            planet.y += planet.vy * dt;
        });

    }
}

function drawStar(){
    const glow= ctx.createRadialGradient(
        star.x, star.y, 2,
        star.y, star.y,55
    );

    glow.addColorStop(0,"#ffffff");
    glow.addColorStop(0.2,"#ffffff");
    glow.addColorStop(0.5,"#53ff9b");
    glow.addColorStop(1,"transparent");

    ctx.fillStyle=glow;
    ctx.beginPath();
    ctx.arc(
        star.x,
        star.y,
        55,
        0,
        Math.PI*2
    );
    ctx.fill();
    ctx.fillstyle=COLORS.star;
    ctx.beginPath();
    ctx.arc(
        star.x,
        star.y,
        star.radius,
        0,
        Math.PI*2
    );
    ctx.fill();
}






function drawPlanets(){
    planets.forEach(planet=>{
        if(planet.trail.length>1){
            ctx.beginPath();
            ctx.moveTo(
                planet.trail[0].x,
                planet.trail[0].y
            );
            planet.trail.forEach(point=>{
                ctx.lineTo(point.x,point.y);
            });
            ctx.strokeStyle=COLORS.orbit;
            ctx.lineWidth=1.5;
            ctx.stroke();
        }
        ctx.shadowBlur=15;
        ctx.shadowColor=planet.color;
        ctx.fillStyle=planet.color;
        ctx.beginPath();
        ctx.arc(
            planet.x,
            planet.y,
            planet.radius,
            0,
            Math.PI*2
        );
        ctx.fill();
        ctx.shadowBlur=0;
    });
}



function draw(){
    const rect=canvas.getBoundingClientRect();
    ctx.clearRect(0,0,rect.width,rect.height);
    drawStar();
    drawPlanets();
    updatePlanetDetails();
}



function animate(){
    if(!paused){
        updatePhysics();
    }
    draw();
    requestAnimationFrame(animate);
}

gravitySlider.addEventListener("input",()=>{
    gravity=Number(gravitySlider.value);
    document.getElementById("gravityValue").textContent=gravity.toFixed(1);
});

massSlider.addEventListener("input",()=>{
    planetMass=Number(massSlider.value);
    document.getElementById("massValue").textContent=planetMass;
});

velocitySlider.addEventListener("input",()=>{
    const newVelocity=Number(velocitySlider.value);
    const factor=newVelocity/velocityMultiplier;
    planets.forEach(planet=>{
        planet.vx*=factor;
        planet.vy*=factor;
    });
    velocityMultiplier=newVelocity;
    document.getElementById("velocityValue").textContent= velocityMultiplier.toFixed(1);
});
addButton.addEventListener("click",()=>{
    addPlanet();
});

pauseButton.addEventListener("click",()=>{
    paused= !paused;
    pauseButton.textContent=paused ?"RESUME SIMULATION" :"PAUSE SIMULATION";
    document.getElementById("simStatus").textContent=paused ?"Paused": "Running";
});
function resetUniverse(){
    planets=[];
    addPlanet(110);
    addPlanet(170);
    addPlanet(230);
    updateStats();
}
resetButton.addEventListener("click",()=>{
    resetUniverse();
});
resizeCanvas();
resetUniverse();
animate();
 window.addEventListener("resize",resizeCanvas);

 canvas.addEventListener("click",(event)=>{
    const rect=canvas.getBoundingClientRect();
    const mouseX=event.clientX-rect.left;
    const mouseY=event.clientY-rect.top;
    selectedPlanet=null;
    for(const planet of planets){
        const dx=mouseX-planet.x;
        const dy=mouseY-planet.y;

        const distance=Math.sqrt(dx*dx+dy*dy);
        if(distance <= planet.radius+10){
            selectedPlanet=planet;
            break;
        }
    }
    updatePlanetDetails();
})
function updatePlanetDetails(){
    if(!selectedPlanet) return;
    const speed=Math.sqrt(
        selectedPlanet.vx**2+
        selectedPlanet.vy**2
    );
    const dx=selectedPlanet.x-star.x;
    const dy=selectedPlanet.y-star.y;
    const distance= Math.sqrt(dx*dx+dy*dy);
    document.getElementById("planetName").textContent="Planet#" + (planets.indexOf(selectedPlanet)+1);
    document.getElementById("detailMass").textContent=selectedPlanet.mass.toFixed(1);
    document.getElementById("detailVelocity").textContent= speed.toFixed(2)+"units/frame";
    document.getElementById("detailDistance").textContent= distance.toFixed(1)+"units";
    document.getElementById("detailPosition").textContent= selectedPlanet.x.toFixed(0)+","+
                                                        selectedPlanet.y.toFixed(0);
}


