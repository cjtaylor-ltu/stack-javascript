function graph(coeffs) {
	var xmin = 0, xmax=22, ymin=0, ymax=900, xstep=1, ystep=100,
		boundbox = [xmin-xstep, ymax+ystep/2,xmax+4*xstep, ymin-ystep],
		board = JXG.JSXGraph.initBoard(divid, {boundingbox: boundbox, showNavigation: false, pan: {enabled:false}, zoom:{enabled:false}, showCopyright:false});


	board.options.layer['axis'] = 8;
	board.options.layer['curve'] = 9;

	function gr(c,x) { return c*x*x; }
	function mf(x) { return x*x+2*x+30; }

	var fs = [
		function(x){return gr(coeffs[0],x);}, 
		function(x){return gr(coeffs[1],x);}, 
		function(x){return gr(coeffs[2],x);},
		function(x){return gr(coeffs[3],x);},
	]

	var fsr = [], labels=["f(n)"];
	for (var i = 0; i < coeffs.length; ++i) {
		fsr[i] = function(x){ return gr(coeffs[i],x) - mf(x); }
		labels.push("\\(" + coeffs[i] + "n^2\\)");
	}

	for (var i = 0; i < 4; ++i){
		var r = JXG.Math.Numerics.fzero(fsr[i],[xmin+1,xmax]), p1 = [r,0], p2 = [r,fs[i](r)];
		board.create('line',[p1,p2],{fixed:true,highlight:false,straightFirst:false,straightLast:false,dash:1});
	}

	board.create('functiongraph',[mf,xmin+1,xmax],{strokeWidth:3,highlight:false});

	for (var i = 0; i < 4; ++i){
		board.create('functiongraph',[(fs[i]),xmin+1,xmax],{highlight:false});
	}

	var xax = board.create('axis',[[0,0],[xmax+xstep/2,0]],{lastArrow:false,straightFirst:false,straightLast:false,highlight:false});
	var yax = board.create('axis',[[0,0],[0,ymax+ystep/2]],{lastArrow:false,straightFirst:false,straightLast:false,highlight:false});
	xax.removeAllTicks();
	yax.removeAllTicks();
	board.create(
		'ticks',
		[xax],
		{
			tickEndings:[0,1],
      ticksDistance:xstep,
			strokeColor:'#646464',
			majorHeight:10,
			minorTicks:0,
			drawLabels:true,
			label:{offset:[0,-15],anchorX:'middle',highlight:false},
			highlight:false
		}
	);

	board.create(
		'ticks',
		[yax],
		{
			tickEndings:[1,0],
      ticksDistance: ystep,
			strokeColor:'#646464',
			majorHeight:10,
			minorTicks:0,
			drawLabels:true,
			label:{offset:[-6,0],anchorX:'right',highlight:false},
			highlight:false
		}
	);

	var pt = [xmax+xstep/2,mf(xmax)+20,"$" + labels[0] + "$"]
	board.create('text',pt,{fixed:true,highlight:false,parse:false,anchorY:'bot'})
	for (var i = 1; i < labels.length; i++){
		board.create('text',[xmax+xstep/2,fs[i-1](xmax)+20, labels[i]],{fixed:true,highlight:false,parse:false}) 
	}
}

graph(coeffs);
