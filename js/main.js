function Magnet () {

	this.orbit = 150;
	this.position = { x: 0, y: 0 };
	this.dragging = false;
	this.connections = 0;
	this.size = 1;

	this.tic = function () {
		if (this.dragging) {
			this.position.x += ( mouseX - this.position.x ) * 0.2;
			this.position.y += ( mouseY - this.position.y ) * 0.2;
		}

		// Increase the size of the magnet center point depending on # of connections
		this.size += ( (this.connections/3) - this.size ) * 0.05;
		this.size = Math.max(this.size,2);
		this.connections = 0;
	}

	this.draw = function (context, skin) {
		var gradientFill = context.createRadialGradient(this.position.x,
			this.position.y, 0, this.position.x, this.position.y, this.size*10);
		gradientFill.addColorStop(0,skin.glowA);
		gradientFill.addColorStop(1,skin.glowB);

		context.beginPath();
		context.fillStyle = gradientFill;
		context.arc(this.position.x, this.position.y, this.size*10, 0, Math.PI*2, true);
		context.fill();
		context.beginPath();
		// context.fillStyle = '#00000000';
		context.arc(this.position.x, this.position.y, this.size, 0, Math.PI*2, true);
		context.fill();
	}
	
	return this;
}

function dist(p1, p2) {
	return Math.sqrt((p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y));
}

min = Math.min;
max = Math.max;

function Particle () {

	this.size = 0.5+Math.random()*3.5;
	this.position = { x: 0, y: 0 };
	this.shift = { x: 0, y: 0 };
	this.angle = 0;
	this.speed = 0.01 + (this.size/4) * 0.03;
	this.force = 1 - (Math.random()*.5);
	this.color = '#ffffff';
	this.orbit = 1;
	this.side = Math.random()>0.5?1:-1;
	this.magnet = null;
	this.deviation = Math.random()*0.05

	this.draw = function (context) {
		context.beginPath();
		context.fillStyle = this.color;
		context.arc(this.position.x, this.position.y, this.size/2, 0, Math.PI*2, true);
		context.fill();
	}

	this.tic = function (i, magnets) {

		var currentDistance = -1;
		var closestDistance = -1;
		var closestMagnet = null;
		
		var force = { x: 0, y: 0 };
		
		// For each particle, we check what the closes magnet is
		for (j = 0, jlen = magnets.length; j < jlen; j++) {
			magnet = magnets[j];
			
			currentDistance = dist(this.position, magnet.position) - (magnet.orbit * 0.5);
			
			if (true || this.magnet != magnet) {
				var fx = magnet.position.x - this.position.x;
				var fy = magnet.position.y - this.position.y;
				
				if (fx > -MAGNETIC_FORCE_THRESHOLD && fx < MAGNETIC_FORCE_THRESHOLD) {
					force.x += fx / MAGNETIC_FORCE_THRESHOLD;
				}
				
				if (fy > -MAGNETIC_FORCE_THRESHOLD && fy < MAGNETIC_FORCE_THRESHOLD) {
					force.y += fy / MAGNETIC_FORCE_THRESHOLD;
				}
			}
				
			if (closestMagnet == null || currentDistance < closestDistance) {
				closestDistance = currentDistance;
				closestMagnet = magnet;
			}
		}

		if (this.magnet == null || this.magnet != closestMagnet) {
			this.magnet = closestMagnet;
		}
		closestMagnet.connections += 1;

		// Rotation
		this.angle += this.speed;

		var size = max(1, this.force/4);
		
		var p = this;
		cs = closestMagnet;
		dy = Math.abs(cs.position.y-p.position.y);
		dx = Math.abs(cs.position.x-p.position.x);
		
		if (i == 3) {
			// console.log('dy', dy);
			// console.log('dx', dx);
			p.color = 'red'
		}

		// p.color = 'black'
		if (dy > cs.orbit*.5) {
			// p.color = 'green'
			if (dx < cs.orbit*.5) {
				// p.shift.y += 2*(dx/cs.orbit*2);
				p.color = 'grey'
				// p.shift.y += ((cs.position.y>p.position.y)?-1:1)*(dx/cs.orbit*.5);
			}
		}	

		// Appy the combined position including shift, angle and orbit
		this.position.x = this.shift.x + Math.cos(i+this.angle) * (this.orbit*(1-this.deviation/2))*1.5;
		this.position.y = this.shift.y + Math.sin(i+this.angle) * (this.orbit*(1-this.deviation/2));

		// this.position.x = this.position.x - this.position.x%15
		// this.position.y = this.position.y - this.position.y%15

		// Limit to screen bounds
		// if (this.side == -1);
		// 	this.position.x = Math.max(
		// 		Math.min(this.position.x,SCREEN_WIDTH-this.size/2),
		// 		this.size/2,
		// 		this.magnet.position.x*(1+this.deviation/5));
		// else
		// 	this.position.x = Math.max(
		// 		Math.min(this.position.x,
		// 			SCREEN_WIDTH-this.size/2,
		// 			this.magnet.position.x*(1-this.deviation/5)),
		// 		this.size/2);
		this.position.x = Math.max(Math.min(this.position.x,SCREEN_WIDTH-this.size/2),this.size/2);
		this.position.y = Math.max(Math.min(this.position.y,SCREEN_HEIGHT-this.size/2),this.size/2);
		
		// Translate towards the magnet position
		this.shift.x += ( (closestMagnet.position.x+(force.x*8)) - this.shift.x) * this.speed;
		this.shift.y += ( (closestMagnet.position.y+(force.y*8)) - this.shift.y) * this.speed;

		// Slowly inherit the cloest magnets orbit
		this.orbit += ( closestMagnet.orbit - this.orbit) * 0.1;
	}

	return this;

}

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var MAGNETS_AT_START = 4;
var PARTICLES_PER_MAGNET = 500;
var MAGNETIC_FORCE_THRESHOLD = 500;

var canvas;
var context;
var particles = [];
var magnets = [];

var mouseX = (window.innerWidth - SCREEN_WIDTH);
var mouseY = (window.innerHeight - SCREEN_HEIGHT);
var mouseIsDown = false;
var mouseDownTime = 0;

var skinIndex = 4;
var skins = [
	 { glowA: 'rgba(0,200,250,0.3)', glowB: 'rgba(0,200,250,0.0)', particleFill: '#ffffff', fadeFill: 'rgba(22,22,22,.6)', useFade: true },
	 { glowA: 'rgba(230,0,0,0.3)', glowB: 'rgba(230,0,0,0.0)', particleFill: '#ffffff', fadeFill: 'rgba(22,22,22,.6)', useFade: true },
	 { glowA: 'rgba(0,230,0,0.3)', glowB: 'rgba(0,230,0,0.0)', particleFill: 'rgba(0,230,0,0.7)', fadeFill: 'rgba(22,22,22,.6)', useFade: true },
	 { glowA: 'rgba(0,0,0,0.3)', glowB: 'rgba(0,0,0,0.0)', particleFill: '#333333', fadeFill: 'rgba(255,255,255,.6)', useFade: true },
	 { glowA: 'rgba(230,230,230,0)', glowB: 'rgba(0,0,0,0.0)', particleFill: '#222222', fadeFill: 'rgba(255,255,255,.6)', useFade: true },
	 { glowA: 'rgba(230,230,230,0)', glowB: 'rgba(230,230,230,0.0)', particleFill: '#ffffff', fadeFill: '', useFade: false }
];

var mouseMag;

Magnetic = new function() {

	
	this.init = function() {
		
		canvas = document.getElementById( 'world' );
		
		if (canvas && canvas.getContext) {
			context = canvas.getContext('2d');
			canvas.height = $(canvas).height();
			
			// Register event listeners
			document.addEventListener('mousemove', documentMouseMoveHandler, false);
			// document.addEventListener('mousedown', documentMouseDownHandler, false);
			document.addEventListener('mouseup', documentMouseUpHandler, false);
			document.getElementById( 'prevSkin' ).addEventListener('click', previousSkinClickHandler, false);
			document.getElementById( 'nextSkin' ).addEventListener('click', nextSkinClickHandler, false);
			window.addEventListener('resize', windowResizeHandler, false);
			
			createMagnets();
			
			// windowResizeHandler();
			
			setInterval( loop, 1000 / 30 );
		}
	}

	function createMagnets () {
		var w = 300;
		var h = 300;

		createMagnet({x:500, y:250});

		// createMagnet({x:500, y:300});
		
		return;
		for (var i = 0; i < MAGNETS_AT_START; i++) {
			var position = {
				x: ( SCREEN_WIDTH - w ) * 0.5 + (Math.random() * w), 
				y: ( SCREEN_HEIGHT - h ) * 0.5 + (Math.random() * h)
			};
			
			createMagnet( position );
		}
	}
	
	function createMagnet ( position ) {
		var m = new Magnet();
		m.position.x = position.x;
		m.position.y = position.y;
		
		magnets.push(m);
		
		createParticles( m.position );
		return m
	}

	function createParticles ( position ) {
		for (var i = 0; i < PARTICLES_PER_MAGNET; i++) {
			var p = new Particle();
			p.position.x = position.x;
			p.position.y = position.y;
			p.shift.x = position.x;
			p.shift.y = position.y;
			p.color = skins[skinIndex].particleFill;
			
			particles.push( p );
		}
	}

	function documentMouseMoveHandler(event) {
		rect = canvas.getBoundingClientRect();
		mouseX = event.clientX - rect.left
		mouseY = event.clientY - rect.top
		if (!mouseMag) {
			mouseMag = new Magnet();
			console.log('creating');
			mouseMag.position = {x: mouseX, y:mouseY}
			mouseMag.orbit = 10
			magnets.push(mouseMag);
		} else {
			mouseMag.position = {x: mouseX, y:mouseY}
		}
		// mouseX = event.clientX - (window.innerWidth - SCREEN_WIDTH) * .5;
		// mouseY = event.clientY - (window.innerHeight - SCREEN_HEIGHT) * .5;
		console.log(mouseX, mouseY);
	}
	
	function documentMouseDownHandler(event) {
		event.preventDefault();
		
		mouseIsDown = true;
		
		if( new Date().getTime() - mouseDownTime < 300 ) {
			// The mouse was pressed down twice with a < 300 ms interval: add a magnet
			createMagnet( { x: mouseX, y: mouseY } );
			mouseDownTime = 0;
		}
		
		mouseDownTime = new Date().getTime();
		
		for( var i = 0, len = magnets.length; i < len; i++ ) {
			magnet = magnets[i];
			
			if( dist( magnet.position, { x: mouseX, y: mouseY } ) < magnet.orbit * .5 ) {
				magnet.dragging = true;
				break;
			}
		}
	}
	
	function documentMouseUpHandler(event) {
		mouseIsDown = false;
		
		for( var i = 0, len = magnets.length; i < len; i++ ) {
			magnet = magnets[i];
			magnet.dragging = false;
		}
	}
		
	function previousSkinClickHandler(event) {
		event.preventDefault();
		--skinIndex;
		updateSkin();
	}
		
	function nextSkinClickHandler(event) {
		event.preventDefault();
		++skinIndex;
		updateSkin();
	}
	
	function updateSkin() {
		skinIndex = skinIndex < 0 ? skins.length-1 : skinIndex;
		skinIndex = skinIndex > skins.length-1 ? 0 : skinIndex;

		for (var i = 0, len = particles.length; i < len; i++) {
			particles[i].color = skins[skinIndex].particleFill;
		}
	}
	
	function windowResizeHandler() {
		SCREEN_WIDTH = window.innerWidth;
		SCREEN_HEIGHT = window.innerHeight;
		
		canvas.width = SCREEN_WIDTH;
		canvas.height = $();
		
		canvas.style.position = 'absolute';
		canvas.style.left = (window.innerWidth - SCREEN_WIDTH) * .5 + 'px';
		canvas.style.top = (window.innerHeight - SCREEN_HEIGHT) * .5 + 'px';
	}

	function loop () {
		
		if (skins[skinIndex].useFade) {
			context.fillStyle = skins[skinIndex].fadeFill;
			// context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		} else {
		}
			context.clearRect(0,0,canvas.width,canvas.height);
		
		var i, j, ilen, jlen;
		
		// Render the magnets
		for (j = 0, jlen = magnets.length; j < jlen; j++) {
			magnets[j].tic();
			magnets[j].draw(context, skins[skinIndex]);			
		}
		
		// Render the particles
		for (i = 0, ilen = particles.length; i < ilen; i++) {
			particles[i].tic(i, magnets);
			particles[i].draw(context);
		}
	}
	
};


// Magnetic.init();
	
/////////////////


function makeDot(pos) {
	context.beginPath();
	context.fillStyle = 'red';
	context.arc(pos.x, pos.y, 1, 0, Math.PI*2, true);
	context.fill();
}

// setCookie("html_player", 0, 365);

$().ready(function() {
	$(".schoolname")
		.mouseover(function (evt) {
			var school = $(evt.target).data('school');
			$(".person[data-school="+school+"]").addClass('sel');
			evt.stopPropagation();
			return false;
		})
		.mouseout(function (evt) {
			var school = $(evt.target).data('school');
			$(".person[data-school="+school+"]").removeClass('sel');
			evt.stopPropagation;
			return false;
		});
});

$(".bg-video").width(Math.max(document.width, document.height*500/281));
$(".bg-video").height(Math.max(document.height, document.width*281/500));

$('.overflow').height(500);

applyFullScreen = function () {
	// $('.fullscreen').width(document.width);
	// $('.fullscreen').height(document.height);
	for (var i=0; i<$(".fullscreen").length; i++) {
		$('canvas.fullscreen')[i].width = document.width;
		$('canvas.fullscreen')[i].height = document.height;
	}
	console.log(document.width, document.height)
}
applyFullScreen()

function randSigned() {
	return Math.random()>0.5?-Math.random():Math.random();
}

min = Math.min;
max = Math.max;
abs = Math.abs;
floor = Math.floor;

function randSign() {
	return Math.random()>0.5?1:-1;
}

var COLORS = ['#FF7100', '#FFA900', 'FD0006', '009B95'];


Line = function () {

	this.restart = function () {
		this.color = COLORS[_.random(1, COLORS.length)-1]
		this.side = Math.random()>0.5?1:-1;
		this.seed = max(0.1, Math.random())
		this.vel = this.side*max(0.1, Math.random())*10
		this.acc = 1
		this.dx = Math.random()*600-300
		this.dy = 200
		this.thickness = 3+Math.random()*5;
	}

	this.tic = function (i, timeLapse) {
		// this.seed += i*timeLapse*this.seed*this.vel
		// this.vel += timeLapse*this.acc*0.1
		// this.dx = 150*min(3, this.seed);
		// this.dy = 250*Math.abs(this.seed)*0.9;
		this.dx = this.dx+this.vel*this.seed
;		this.dy = this.dy+this.seed;
		
		if (Math.abs(this.dx) > 300)
			this.restart();
	}

	this.getPoints = function () {
		return [
			Mx-this.dx, d1.y-this.dy,
			Mx-this.dx, d2.y+this.dy,
			d2.x, d2.y
		]
	}

	this.draw = function () {
		context.beginPath();
		context.strokeStyle = this.color;
		context.lineWidth = this.thickness;
		context.moveTo(d1.x, d1.y)
		CanvasRenderingContext2D.prototype.bezierCurveTo.apply(context, this.getPoints());
		context.stroke();
		// console.log(this.getPoints(), this.seed)
	}
	this.restart()
	return this;
}

$().ready(function MC(canvas) {
	var canvas = $('canvas#mag')[0];
	context = canvas.getContext('2d');

	Mx = canvas.width/2;
	My = canvas.height/2;
	
	d1 = {x: Mx, y: My-100}
	d2 = {x: Mx, y: My+100}

	lines = [];
	for (var i=0; i<10; i++) {
		lines.push(new Line());
	}


	$(window).resize(function () {
		Mx = canvas.width/2;
		My = canvas.height/2;
		d1 = {x: Mx, y: My-100}
		d2 = {x: Mx, y: My+100}
		applyFullScreen()
	})


	function Draw() {
		context.clearRect(0, 0, canvas.width, canvas.height)
		makeDot({x: Mx, y:My})


		for (var i=0; i<10; i++) {
			lines[i].tic(i, 1/60);
			lines[i].draw();
			// drawLine(lines[i]);
		}
		
		makeDot(d1)
		makeDot(d2)
		setTimeout(Draw, 60);
	}

	Draw();

})


$(".person .square").tooltip({html:true})