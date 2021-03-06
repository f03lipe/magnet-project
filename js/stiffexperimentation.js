

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
			context.fillStyle = ['red', 'green', 'black'][c]
			context.arc(this.x, this.y, 5, 0, 2*Math.PI, true)
			context.fill()
		}

		return this
	}


	return particle;
})();


c = document.getElementById("world");
context = c.getContext("2d");

c.width = $(c).width()
c.height = $(c).height()

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

c2 = document.getElementById('world2')
c2.width = $(c2).width()
c2.height = $(c2).height()

function drawLine(x, y, x2, y2) {
	var context2 = c2.getContext('2d')
	context2.beginPath()
	context2.moveTo(x, y)
	context2.lineTo(x2, y2)
	context2.stroke()
}

AnimateOnFramerate = function (callback) {
	setTimeout(callback, 1000/60);
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

exp3();


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