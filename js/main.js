
var schools = {
	'cefet': { color: '#009B95' },
	'cp2': { color: '#FF7100' },
	'cm': { color: '#00C90D' },
	'cap': { color: '#FB202D' },
}

MagneticCamp = new (function (data) {

	var data = data || {};
	
	// Never do this without your parent's supervision.
	var max = Math.max,
		abs = Math.abs,
		random = Math.random;

	// Globals: you may touch this
	var LAPSE = 60
		, COLORS = data.colors || _.pluck(schools, 'color') // ['#009B95', '#FF7100', '#00C90D', '#FB202D']
		, NUMLINES = data.strings || 10
		;

	var header = $('header')
	
	// Variables defined in this.init()
	var canvas, context,
		Mx, My, d1, d2;

	var Line = function () {
		return {
			start: function () {
				this.color = COLORS[_.random(1, COLORS.length)-1];
				this.thickness = 2+random()*1;
				this.vel = (random()>.5?-1:1)*max(1, random()*4)*4;
				this.dx = random()*600-300; // = [-300, 300[
				this.dy = 150;
				return this;
			},

			tic: function (timeLapse) {		
				this.dx += this.vel*.2;
				this.dy += max(1, abs(this.vel))*0.1;
				if (abs(this.dx) > 500 || abs(this.dy) > 600)
					this.start();
			},

			getBezierPoints: function () {
				return [
					Mx-this.dx, d1.y-this.dy,
					Mx-this.dx, d2.y+this.dy,
					d2.x, d2.y
				]
			},

			draw: function (context) {
				context.beginPath();
				context.strokeStyle = this.color;
				context.lineWidth = this.thickness;
				context.moveTo(d1.x, d1.y)
				CanvasRenderingContext2D.prototype.bezierCurveTo.apply(context, this.getBezierPoints());
				context.stroke();
			},
		}
	}
	
	var lines = [];
	for (var i=0; i<NUMLINES; i++)
		lines.push(new Line(i).start());

	var Draw = function() {
		context.clearRect(0, 0, canvas.width, canvas.height)
		for (var i=0; i<NUMLINES; i++) {
			lines[i].tic(1/LAPSE);	// tic
			lines[i].draw(context);	// toc
		}
		setTimeout(Draw, LAPSE);
	}

	var Setup = function () {
		$('canvas.fullscreen')[0].width = $(window).width();
		$('canvas.fullscreen')[0].height = $(window).height();
		Mx = canvas.width/2;
	
		if (header.length)
			My = header.offset().top+header.height()/2-header.parent().offset().top;
		else
			My = canvas.height/2;
		d1 = {x: Mx, y: My-130};
		d2 = {x: Mx, y: My+130};
	}

	$(window).resize(Setup);

	this.init = function () {
		canvas = $('canvas#mag')[0];
		context = canvas.getContext('2d');
		Setup();
		Draw();
	}
});

function setUpSharrre() {
	$('.twitter').sharrre({
		share: { twitter: true },
		template: '<a class="box" href="#"><div class="share"><span></span>Tweet</div></a>',
		enableHover: false,
		enableTracking: true,
		buttons: { twitter: {via: 'magnetproject'}},
		click: function(api, options){
			api.simulateClick();
			api.openPopup('twitter');
		}
	});
	$('.facebook').sharrre({
		share: { facebook: true },
		template: '<a class="box" href="#"><div class="share"><span></span>Share</div></a>',
		enableHover: false,
		enableTracking: true,
		click: function(api, options){
			api.simulateClick();
			api.openPopup('facebook');
		}
	});
}

function setScrollAnimations() {
	var prog = $('#donate .progress').offset(),
		backup = $("#back-up");

	$(document).scroll(function() {
		var top = $(document).scrollTop();
		// if (Math.abs(top - prog.top) < 500)
		// 	$("#donate .progress").addClass('visible');
				
		if (top < 700) {
			backup.css('opacity', 0);
		} else {
			backup.css('opacity', .8);
		}		
	})
}