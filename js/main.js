
MagneticCamp = new (function () {
	
	// Never do this without your parent's supervision.
	var min = Math.min,
		max = Math.max,
		abs = Math.abs,
		floor = Math.floor,
		random = Math.random;

	// Globals: you may touch this
	var LAPSE = 60
		, COLORS = ['#FF7100', '#FFA900', '#FD0006', '#009B95']
		, SEED = Math.random() // still useless :(
		, NUMLINES = 10
		;

	// Variables defined in this.init()
	var canvas, context,
		Mx, My, d1, d2;

	var Line = function () {
		return {
			start: function () {
				this.vel = (Math.random()>.5?-1:1)*max(5, random()*20)*.4;
				this.color = COLORS[_.random(1, COLORS.length)-1];
				this.thickness = 3+random()*3;
				this.dx = random()*500-250; // = [-300, 300[
				this.dy = 150;
				return this;
			},

			tic: function (timeLapse) {		
				this.dx += this.vel*.2;
				this.dy += max(1, abs(this.vel))*0.1;
				if (abs(this.dx) > 300 || abs(this.dy) > 400)
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
		// Sort so that lines in the front are redered last.
		lines = _.sortBy(lines,
					function (e) {
						return -e.dx+e.thickness*(e.vel>0)?1:-1;
					});
		setTimeout(Draw, LAPSE);
	}

	var Setup = function () {
		$('canvas.fullscreen')[0].width = $(window).width();
		$('canvas.fullscreen')[0].height = $(window).height();
		Mx = canvas.width/2;
		My = $('.title').offset().top+$('.title').height()/2;
		d1 = {x: Mx, y: My-100};
		d2 = {x: Mx, y: My+100};
	}

	$(window).resize(Setup);

	this.init = function () {
		canvas = $('canvas#mag')[0];
		context = canvas.getContext('2d');
		Setup();
		Draw();
	}

});

$().ready(function () {	MagneticCamp.init() });

$(".person .square").tooltip({html:true})

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
