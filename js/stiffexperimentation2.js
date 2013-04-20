

Magnet = (function () {
	function magnet (pos) {
		this.x = pos[0]
		this.y = pos[1]

		this.draw = function (context) {
			context.beginPath()
			context.fillStyle = 'red'
			context.arc(this.x, this.y, 10, 0, 2*Math.PI, true)
			context.fill()
		}
		
		return this;
	}

	return magnet;
})();



Particle = (function () {

	function particle (p, a) {
		this.x = this.x0 = p[0]
		this.y = this.y0 = p[1]
		this.ax = a[0]
		this.ay = a[1]

		this.push = function (push) {
			this.ax += push[0]/1 // mass
			this.ay += push[1]/1 // mass
		}

		this.tic = function (timestep) {
			x = 2*this.x-this.x0+this.ax*timestep*timestep
			// if (c.width < x) {
			// 	x = this.x0
			// 	this.x0 = this.x
			// 	this.x = c.width-(c.width-this.x0)
			// 	this.ax = 0
			// } else if (x < 0) {
			// 	x = this.x0
			// 	this.x0 = this.x
			// 	this.x = this.x0
			// 	this.ax = 0
			// } else {
			this.x0 = this.x
			this.x = max(0, min(x, c.width));

			y = 2*this.y-this.y0+this.ay*timestep*timestep
			/*
			if (c.height < y) {
				y = this.y0
				this.y0 = this.y
				this.y = c.height-(c.height-this.y0)*1.5
			} else if (y < 0) {
				y = this.y0
				this.y0 = this.y
				this.y = this.y0
			} else {
				this.y0 = this.y
				this.y = max(0, min(y, c.height));
			}*/
			this.y0 = this.y
			this.y = max(0, min(y, c.height));
		}

		this.draw = function (context) {
			context.beginPath()
			context.fillStyle = 'green'
			context.arc(this.x, this.y, 2, 0, 2*Math.PI, true)
			context.fill()
		}

		return this
	}


	return particle;
})();


c = document.getElementById("world");
context = c.getContext("2d");

// c.width = $(c).width()
// c.height = $(c).height()

function randSign() { 
	if (Math.random()<0.5)
		return -1;
	return 1;
}

function diff(p1, p2) {
	return [sqrt(), sqrt()]
}

function max(a, b) {
	return a>b?a:b;
}

function min(a, b) {
	return a>b?b:a;
}

function pnRand() {
	return randSign()*Math.random();
}

function randLoc() {
	return [Math.random()*c.width, Math.random()*c.height];
}

// c2 = document.getElementById('world2')
// c2.width = $(c2).width()
// c2.height = $(c2).height()

function drawLine(x, y, x2, y2) {
	var context2 = c2.getContext('2d')
	context2.beginPath()
	context2.moveTo(x, y)
	context2.lineTo(x2, y2)
	context2.stroke()
}

timeit=500

$('button[speed=500]').click(function(){window.timeit=500});
$('button[speed=100]').click(function(){window.timeit=100});
$('button[speed=1000]').click(function(){window.timeit=1000});
$('button[speed=3000]').click(function(){window.timeit=500});
$('button[speed=99999]').click(function(){window.timeit=99999});

AnimateOnFramerate = function (callback) {
	setTimeout(callback, window.timeit);
}

TS = 1
function exp1() {
	p = []
	for (i=0; i<300; i++) {
		ax = pnRand()
		ay = pnRand()

		p.push(new Particle(randLoc(), [ax, 2+ay]))
	}

	(function Draw () {
		console.log('tic')
		context.clearRect(0, 0, c.width, c.height)
		for (i=0; i<p.length; i++) {
			p[i].tic(TS)
			p[i].draw(context)
			// p[i].force([pnRand(), pnRand()])
		}
		AnimateOnFramerate(Draw)
	})();
}


function stiff (p1, p2, rest) {
	delta = Math.sqrt(Math.pow(p2.y-p1.y,2)+Math.pow(p2.x-p1.x,2))
	diff = (delta-rest)/delta;
	
	xf = (p1.x<p2.x)?1:-1;
	yf = (p1.y<p2.y)?1:-1;

	p1.x += diff*(p2.x-p1.x)/2
	p2.x -= diff*(p2.x-p1.x)/2
	
	p1.y += diff*(p2.y-p1.y)/2
	p2.y -= diff*(p2.y-p1.y)/2

}

function exp2() {
	p1 = new Particle(randLoc(), [0, 0]);
	p2 = new Particle(randLoc(), [0, 0]);

	drawLine(250, 125, 350, 125);
	drawLine(250, 200, 350, 200);
	drawLine(250, 250, 350, 250);
	drawLine(250, 300, 350, 300);


	c = 0;

	p1.draw(context);
	p2.draw(context);

	c = 1;

	;
	(function Draw() {
		context.clearRect(0, 0, c.width, c.height)

		console.log('\n')
		console.log('p1', p1.x, p1.y)
		console.log('p2', p2.x, p2.y)

		stiff(p1, p2, 30)

		p1.draw(context)
		p2.draw(context)
		c += 1


		AnimateOnFramerate(Draw)
	})()
}

function exp3() {
	
	p = [];
	for (var i=0; i<30; i++)
		p.push(new Particle(randLoc(), [0, 0]));

	(function Draw () {
		context.clearRect(0, 0, c.width, c.height)
		
		for (i=0; i<p.length; i++) {
			p[i].x = max(0, min(p[i].x, c.width-10))
			p[i].y = max(0, min(p[i].y, c.height-10))
		}

		for (i=0; i<p.length; i++) {
			stiff(p[i], p[(i+1)%p.length], 20);
			stiff(p[i], p[(i+2)%p.length], 20);
		}

		for (i=0; i<p.length; i++) {
			p[i].draw(context)
		}

		AnimateOnFramerate(Draw)
	})();

	var point = false;

	$(c).mousedown(function (event) {
		rect = c.getBoundingClientRect()
		x = event.clientX - rect.left
		y = event.clientY - rect.top
		console.log('oi', x, y);
		for (var i=0; i<p.length; i++) {
			if (Math.abs(x-p[i].x) < 5 && Math.abs(y-p[i].y) < 5) {
				point = p[i]
				return;
			}
		}
	})
	$(c).mouseup(function (event) {
		point = false;
	})

	$(c).mousemove(function (event) {
		if (!point) return;
		rect = c.getBoundingClientRect()
		x = event.clientX - rect.left
		y = event.clientY - rect.top
		point.x = x
		point.y = y
	});
}

function dist(p1, p2) {
	return Math.sqrt(Math.pow(p2.y-p1.y,2)+Math.pow(p2.x-p1.x,2));
}

sin = Math.sin
asin = Math.asin
cos = Math.cos
acos = Math.acos
tan = Math.tan
atan = Math.atan
sqrt = Math.sqrt;

function exp4() {
	mag = new Magnet([200, 150]);
	P = [new Particle([120,100], [0, 0])];

	radius = dist(mag, P[0])

	p = P[0];
	p.draw(context);

	(function Draw() {
		mag.draw(context);
		radius = dist(mag, p);
		console.log(radius)

		var x = p.x0
		var y = p.y0
		a = asin((p.x0-mag.x)/radius)%0.1;
		console.log(p.y,
			'a', a,
			'1', sin(0.001+a),
			'1*r', sin(0.001+a)*radius,
			'1*r-mag.y', sin(0.001+a)*radius-mag.y,
			'radius', radius)
		p.x = p.x0 = sin(0.1+a)*radius+mag.x;
		p.y = p.y0 = cos(0.1+a)*radius+mag.y;
		
		p.draw(context);
		// p.tic(TS)

		AnimateOnFramerate(Draw);
	})();

	$(c).mousemove(function (event) {
		rect = c.getBoundingClientRect()
		x = event.clientX - rect.left
		y = event.clientY - rect.top

		// P[0].x = x
		// P[0].y = y
	});
	$(c).mousedown(function (event) {
		rect = c.getBoundingClientRect()
		x = event.clientX - rect.left
		y = event.clientY - rect.top
				radius = dist(mag, P[0])

		console.log('click', x, y);

		// P[0].x = P[0].x0 = x
		// P[0].y = P[0].y0 = y
		var a = asin(x/dist({x:x,y:y},mag));
		console.log('a:', a, mag.y-y, x-mag.x, radius)
	})
}

exp4();


// _loop: ->

// 	# Synchronise window.fps
// 	thisFrameFPS = 1000 / ((now=new Date) - lastUpdate)
// 	window.fps += (thisFrameFPS - window.fps) / 1;
// 	lastUpdate = now * 1 - 1

	// window.setTimeout =>
	// 	@_loop()
	// , 1000/@fps
	
	// return if window.canvasStop or
	// 	window.mouseDown and window.mouseOverCanvas
	
	// @board.tic()