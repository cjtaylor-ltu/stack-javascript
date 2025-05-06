// lazy approach to drawing finite state machine with 4 states in a square

const radius = 20,
	pointstyle = {strokeWidth:2,showInfoBox:false,name:"",fixed:true,strokeColor:"black",highlight:false,size:radius,fillColor:"white"},
	acceptstyle = {strokeWidth:2,showInfoBox:false,name:"",fixed:true,strokeColor:"black",highlight:false,size:radius-4,fillColor:"white"},
	linestyle = {fixed:true,strokeColor:"black",highlight:false,strokeWidth:2},
	textstyle = {fixed:true,anchorX:'middle',anchorY:'bot',fontSize:15,parse:false},
	tristyle = {fixed:true,highlight:false,borders:{fixed:true,strokeColor:"black",highlight:false},fillColor:"black",fillOpacity:1};

function maketriangle(board,center,nose,def=0.02) {
	//get angle between center and nose
	var theta = Math.atan2(nose[1]-center[1],nose[0]-center[0]),
		pre = [[def,0],[-def,def],[-def,-def]],
		pts = [];
	for (var pt of pre) {
		pts.push([center[0]+Math.cos(theta)*pt[0]-Math.sin(theta)*pt[1],center[1]+Math.sin(theta)*pt[0]+Math.cos(theta)*pt[1]]);
	}
	var poly = board.create('polygon',pts,tristyle);
	for (var v of poly.vertices) {
		v.hideElement()
	}
	return poly
}


function fsm1(transition_table, init, accepting) {
	var coordinates = [[0,0],[1,0],[1,-1],[0,-1]],
		boundbox = [-0.5,0.5,1.5,-1.5];

	var board = JXG.JSXGraph.initBoard(divid, {boundingbox: boundbox, axis: false, showNavigation: false, pan: {enabled:false}, zoom:{enabled:false}, showCopyright:false});
	board.suspendUpdate();

	var r_actual = 20*2/500,
		num = transition_table.states,
		points = [];

	for (var i = 0; i < coordinates.length; ++i){
		points.push(board.create('point',coordinates[i],pointstyle));
		board.create('text',[coordinates[i][0]-0.01,coordinates[i][1]+0.03,"\\(S_{" + (i+1) + "}\\)"],textstyle);
	}

	for (var i of accepting) {
		board.create('point',coordinates[i-1],acceptstyle);
	}

	board.create('arrow',[[coordinates[init-1][0]-3*r_actual,coordinates[init-1][1]],
		[coordinates[init-1][0]-r_actual,coordinates[init-1][1]]],linestyle)

	var destinations = [], outs=[];
	for (var t of transition_table) {
		if (t[0] == t[1]) { 
			outs.push([[t[0]-1,"\\(0,1\\)"]]); 
			destinations.push([t[0]-1]); 
		}
		else { 
			outs.push([[t[0]-1,"\\(0\\)"],[t[1]-1,"\\(1\\)"]]); 
			destinations.push([t[0]-1,t[1]-1]);
		}
	}

	var makeLoop = function(x,y) {
		var mult = y < 0 ? -1 : 1;
		var fx = function(t) { return x+0.5*0.15*Math.sin(t); }
		var fy = function(t) { return y+mult*0.2*Math.cos((t-Math.PI)/2); }
		board.create('curve',[fx, fy, 0, 2*Math.PI],linestyle);
	}

	for (var i = 0; i < outs.length; ++i) {
		for (var p of outs[i]){
			if (p[0] == i) { 
				//loop 
				makeLoop(coordinates[i][0], coordinates[i][1]);
				var cx = coordinates[i][0],
					cy = coordinates[i][1],
					mult = cy < 0 ? -1 : 1,
					tc = [cx, cy+mult*0.2],
					tnose = [tc[0]+0.02,tc[1]],
					tmult = cy < 0 ? -0.9 : 1.2;
				maketriangle(board, tc, tnose);
				board.create('text',[cx,cy+tmult*0.5*0.2*2+tmult*0.05,p[1]],textstyle);
			} 
			else {      
				var x1 = coordinates[i][0],
					y1 = coordinates[i][1],
					x2 = coordinates[p[0]][0],
					y2 = coordinates[p[0]][1],
					midpoint = [(x1+x2)/2,(y1+y2)/2];

				if (y1 == y2) {
					//straight lines if they have the same y-coordinate but are not too far away.
					//or if there is a conflict
					var dist = Math.abs(x1-x2),
						curve = dist > 1 ? 0.35 : 0.07;
					if (dist > 1 || destinations[p[0]].includes(i)) {
						var p3;
						//curve up if left-to-right
						//down otherwise
						if(x1 > x2) { p3 = board.create('point',[midpoint[0],midpoint[1]-curve]); }
						else { p3 = board.create('point',[midpoint[0],midpoint[1]+curve]); }
						p3.hideElement();
						board.create('circumcirclearc',[points[i],p3,points[p[0]]],linestyle);
						var diff = x1 > x2 ? -0.01 : 0.01,
							shift = x1 > x2 ? -0.05 : 0.1,
							tc = [p3.X(), p3.Y()],
							tnose = [tc[0]+2*diff,tc[1]];
						maketriangle(board, tc, tnose);
						board.create('text',[p3.X(),p3.Y()+shift,p[1]],textstyle);
					}
					else {
						var tc = [midpoint[0], midpoint[1]],
							xsh = x1 > x2 ? -0.02 : 0.02,
							tnose = [tc[0]+xsh,tc[1]];
						maketriangle(board, tc, tnose);
						board.create('segment',[points[i],points[p[0]]],linestyle);
						board.create('text',[midpoint[0],midpoint[1]+0.1,p[1]],textstyle);
					}
				}

				//if differing y-coordinates, default to straight line unless conflict
				else if (destinations[p[0]].includes(i)) {
					var co, diffs = [0,0,0,0], tshift = [0,0];
					if (x1 == x2) {
						if (y1 > y2) {
							co = [midpoint[0]+0.1,midpoint[1]];
							diffs = [0,0.01,0,-0.01];
							tshift = [0.1,0];
						}
						else { 
							co = [midpoint[0]-0.1,midpoint[1]];
							diffs = [0,-0.01,0,0.01];
							tshift = [-0.05,0];
						}
					}
					else if(x1 > x2) { 
						var slope = (y2-y1)/(x2-x1);
						co = [midpoint[0],midpoint[1]-0.1];
						diffs = [0.005,slope*0.005,0,0];
						tshift = slope > 0 ? [0.05,0] : [-0.05,-0.05];
					}
					else { 
						var slope = (y2-y1)/(x2-x1);
						co = [midpoint[0],midpoint[1]+0.1];
						diffs = [0,0,0.005,slope*0.005];
						tshift = slope > 0 ? [-0.1,0.05] : [0.1,0.1];
					}
					var ar = [[co[0]+diffs[0],co[1]+diffs[1]],[co[0]+diffs[2],co[1]+diffs[3]]],
						p3 = board.create('point',co);
					p3.hideElement();
					board.create('circumcirclearc',[points[i],p3,points[p[0]]],linestyle);
					var diff = x1 > x2 ? -0.01 : 0.01,
						shift = x1 > x2 ? -0.1 : 0.1,
						tc = [co[0],co[1]],
						xsh = x1 > x2 ? -0.02 : 0.02,
						tnose = [tc[0]+xsh,tc[1]+xsh*slope];
					maketriangle(board, tc,tnose);
					board.create('text',[co[0]+tshift[0],co[1]+tshift[1],p[1]],textstyle);
				}
				else {
					var ar, tshift, tc = [...midpoint], tnose;
					if (x1 == x2) {
						var yshift = y1 > y2 ? -0.02 : 0.02;
						tnose = [tc[0],tc[1]+yshift];
						tshift = [0.05,0];
					}
					else {
						var slope = (y2-y1)/(x2-x1),
							pre_shift = x1 < x2 ? 0.02 : -0.02;
						tnose = [tc[0]+pre_shift,tc[1]+pre_shift*slope];
						tshift = slope > 0 ? [0.05,0] : [0.05,0.05];
					}
					maketriangle(board, tc,tnose);
					board.create('segment',[points[i],points[p[0]]],linestyle);
					board.create('text',[midpoint[0]+tshift[0],midpoint[1]+tshift[1],p[1]],textstyle);
				}
			}
		}
	}
	board.unsuspendUpdate();

	return board;
}

function fsm2(transition_table, init, accepting, coordinates) {
	var min_x = coordinates[0][0], min_y = coordinates[0][1], max_x = coordinates[0][0], max_y = coordinates[0][1];
	for (var c of coordinates){
		min_x = Math.min(min_x,c[0]);
		max_x = Math.max(max_x,c[0]);
		min_y = Math.min(min_y,c[1]);
		max_y = Math.max(max_y,c[1]);
	}
	var boundbox = [min_x-0.5,max_y+1,max_x+0.5,min_y-1],
	 board = JXG.JSXGraph.initBoard(divid, {boundingbox: boundbox, axis: false, showNavigation: false, pan: {enabled:false}, zoom:{enabled:false}, showCopyright:false});
	board.suspendUpdate();

	var r_actual = 4*radius/750,
		num = transition_table.states,
		points = [];

	for (var i = 0; i < coordinates.length; ++i){
		points.push(board.create('point',coordinates[i],pointstyle));
		board.create('text',[coordinates[i][0]-0.01,coordinates[i][1]+0.05,"\\(S_{" + (i+1) + "}\\)"],textstyle);
	}

	for (var i of accepting) {
		board.create('point',coordinates[i-1],acceptstyle);
	}

	board.create('arrow',[[coordinates[init-1][0]-3*r_actual,coordinates[init-1][1]],
		[coordinates[init-1][0]-r_actual,coordinates[init-1][1]]],linestyle)

	var destinations = [], outs=[];
	for (var t of transition_table) {
		if (t[0] == t[1]) { 
			outs.push([[t[0]-1,"\\(0,1\\)"]]); 
			destinations.push([t[0]-1]); 
		}
		else { 
			outs.push([[t[0]-1,"\\(0\\)"],[t[1]-1,"\\(1\\)"]]); 
			destinations.push([t[0]-1,t[1]-1]);
		}
	}

	var makeLoop = function(x,y) {
		var mult = y < 0 ? -1 : 1;
		var fx = function(t) { return x+0.5*0.2*Math.sin(t); }
		var fy = function(t) { return y+mult*0.7*2*0.2*Math.cos((t-Math.PI)/2); }
		board.create('curve',[fx, fy, 0, 2*Math.PI],linestyle);
	}

	for (var i = 0; i < outs.length; ++i) {
		for (var p of outs[i]){
			if (p[0] == i) { 
				//loop 
				makeLoop(coordinates[i][0], coordinates[i][1]);
				var cx = coordinates[i][0],
					cy = coordinates[i][1],
					mult = cy < 0 ? -1 : 1,
					tc = [cx, cy+mult*0.2*1.4],
					tnose = [tc[0]+0.02,tc[1]],
					tmult = cy < 0 ? -0.9 : 1.2;
				maketriangle(board, tc, tnose);
				board.create('text',[cx,cy+tmult*0.7*0.2*2+tmult*0.07,p[1]],textstyle);
			} 
			else {      
				var x1 = coordinates[i][0],
					y1 = coordinates[i][1],
					x2 = coordinates[p[0]][0],
					y2 = coordinates[p[0]][1],
					midpoint = [(x1+x2)/2,(y1+y2)/2];

				if (y1 == y2) {
					//straight lines if they have the same y-coordinate but are not too far away.
					//or if there is a conflict
					var dist = Math.abs(x1-x2),
						neg = dist > 1 && Math.ceil(dist) % 2 == 1 ? -1 : 1,
						curve = dist > 1 ? 0.175*neg*dist : 0.07;
					if (dist > 1 || destinations[p[0]].includes(i)) {
						var p3;
						//curve up if left-to-right
						//down otherwise
						if(x1 > x2) { p3 = board.create('point',[midpoint[0],midpoint[1]-curve]); }
						else { p3 = board.create('point',[midpoint[0],midpoint[1]+curve]); }
						p3.hideElement();
						board.create('circumcirclearc',[points[i],p3,points[p[0]]],linestyle);
						var diff = x1 > x2 ? -0.01 : 0.01,
							shift = x1 > x2 ? -0.05 : 0.15,
							tc = [p3.X(), p3.Y()],
							tnose = [tc[0]+2*diff,tc[1]];
						maketriangle(board, tc, tnose);
						board.create('text',[p3.X(),p3.Y()+shift,p[1]],textstyle);
					}
					else {
						var tc = [midpoint[0], midpoint[1]],
							xsh = x1 > x2 ? -0.02 : 0.02,
							tnose = [tc[0]+xsh,tc[1]];
						maketriangle(board, tc, tnose);
						board.create('segment',[points[i],points[p[0]]],linestyle);
						board.create('text',[midpoint[0],midpoint[1]+0.15*neg,p[1]],textstyle);
					}
				}

				//if differing y-coordinates, default to straight line unless conflict
				else if (destinations[p[0]].includes(i)) {
					var co, diffs = [0,0,0,0], tshift = [0,0];
					if (x1 == x2) {
						if (y1 > y2) {
							co = [midpoint[0]+0.1,midpoint[1]];
							diffs = [0,0.01,0,-0.01];
							tshift = [0.1,0];
						}
						else { 
							co = [midpoint[0]-0.1,midpoint[1]];
							diffs = [0,-0.01,0,0.01];
							tshift = [-0.05,0];
						}
					}
					else if(x1 > x2) { 
						var slope = (y2-y1)/(x2-x1);
						co = [midpoint[0],midpoint[1]-0.1];
						diffs = [0.005,slope*0.005,0,0];
						tshift = slope > 0 ? [0.05,0] : [-0.05,-0.05];
					}
					else { 
						var slope = (y2-y1)/(x2-x1);
						co = [midpoint[0],midpoint[1]+0.1];
						diffs = [0,0,0.005,slope*0.005];
						tshift = slope > 0 ? [-0.1,0.05] : [0.1,0.1];
					}
					var ar = [[co[0]+diffs[0],co[1]+diffs[1]],[co[0]+diffs[2],co[1]+diffs[3]]],
						p3 = board.create('point',co);
					p3.hideElement();
					board.create('circumcirclearc',[points[i],p3,points[p[0]]],linestyle);
					var diff = x1 > x2 ? -0.01 : 0.01,
						shift = x1 > x2 ? -0.1 : 0.1,
						tc = [co[0],co[1]],
						xsh = x1 > x2 ? -0.02 : 0.02,
						tnose = [tc[0]+xsh,tc[1]+xsh*slope];
					maketriangle(board, tc,tnose);
					board.create('text',[co[0]+tshift[0],co[1]+tshift[1],p[1]],textstyle);
				}
				else {
					var ar, tshift, tc = [...midpoint], tnose;
					if (x1 == x2) {
						var yshift = y1 > y2 ? -0.02 : 0.02;
						tnose = [tc[0],tc[1]+yshift];
						tshift = [0.05,0];
					}
					else {
						var slope = (y2-y1)/(x2-x1),
							pre_shift = x1 < x2 ? 0.02 : -0.02;
						tnose = [tc[0]+pre_shift,tc[1]+pre_shift*slope];
						tshift = slope > 0 ? [0.05,0] : [0.05,0.05];
					}
					maketriangle(board, tc,tnose);
					board.create('segment',[points[i],points[p[0]]],linestyle);
					board.create('text',[midpoint[0]+tshift[0],midpoint[1]+tshift[1],p[1]],textstyle);
				}
			}
		}
	}
	board.unsuspendUpdate();

	return board;
}

function fsm_omit(transition_table, init, accepting, coordinates, omit, omit_order) {
	var min_x = coordinates[0][0], min_y = coordinates[0][1], max_x = coordinates[0][0], max_y = coordinates[0][1];
	for (var c of coordinates){
		min_x = Math.min(min_x,c[0]);
		max_x = Math.max(max_x,c[0]);
		min_y = Math.min(min_y,c[1]);
		max_y = Math.max(max_y,c[1]);
	}
	var boundbox = [min_x-0.5,max_y+1,max_x+0.5,min_y-1],
		board = JXG.JSXGraph.initBoard(divid, {boundingbox: boundbox, axis: false, showNavigation: false, pan: {enabled:false}, zoom:{enabled:false}, showCopyright:false});
	board.suspendUpdate();

	var r_actual = (max_x-min_x+1)*radius/750,
		num = transition_table.states,
		points = [];

	for (var i = 0; i < coordinates.length; ++i) {
		points.push(board.create('point',coordinates[i],pointstyle));
		board.create('text',[coordinates[i][0]-0.01,coordinates[i][1]+0.03,"\\(S_{" + (i+1) + "}\\)"],textstyle);
	}

	for (var i of accepting) {
		board.create('point',coordinates[i-1],acceptstyle);
	}
	board.create('arrow',[[coordinates[init-1][0]-3*r_actual,coordinates[init-1][1]],
		[coordinates[init-1][0]-r_actual,coordinates[init-1][1]]],linestyle);

	var destinations = [],
		letters = ["\\(A\\)","\\(B\\)","\\(C\\)","\\(D\\)","\\(E\\)","\\(F\\)","\\(G\\)","\\(H\\)","\\(I\\)","\\(J\\)"],
	//^surely you won't need more than that!
		outs = [],
		ind = 1,
		order = omit_order;

	for (var t of transition_table){
		if (t[0] == t[1]) { 
			var label = omit.includes(ind) ? letters.shift() : "\\(0,1\\)";
			outs.push([[t[0]-1,label]]); 
			destinations.push([t[0]-1]); 
		}
		else { 
			var label0 = "\\(0\\)";
			var label1 = "\\(1\\)";
			if (omit.includes(ind)) {
				var lets = [letters.shift(),letters.shift()];
				var first = order.shift();
				label0 = first == 0 ? lets[0] : lets[1];
				label1 = first == 1 ? lets[0] : lets[1];
			}
			outs.push([[t[0]-1,label0],[t[1]-1,label1]]); 
			destinations.push([t[0]-1,t[1]-1]);
		}
		++ind;
	}

	var makeLoop = function(x,y) {
		var mult = y < 0 ? -1 : 1
		var fx = function(t) { return x+0.5*0.2*Math.sin(t); }
		var fy = function(t) { return y+mult*0.7*2*0.2*Math.cos((t-Math.PI)/2); }
		board.create('curve',[fx, fy, 0, 2*Math.PI],linestyle);
	}

	for (var i = 0; i < outs.length; ++i){
		for (var p of outs[i]){
			if (p[0] == i) { 
				//loop 
				var cx = coordinates[i][0],
					cy = coordinates[i][1],
					mult = cy < 0 ? -1 : 1,
					tc = [cx, cy+mult*0.2*1.4],
					tnose = [tc[0]+0.02,tc[1]],
					tmult = cy < 0 ? -0.9 : 1.2;
				makeLoop(coordinates[i][0],coordinates[i][1]);
				maketriangle(board, tc, tnose);
				board.create('text',[cx,cy+tmult*0.7*0.2*2+tmult*0.07,p[1]],textstyle);
			} 
			else {      
				var x1 = coordinates[i][0],
					y1 = coordinates[i][1],
					x2 = coordinates[p[0]][0],
					y2 = coordinates[p[0]][1],
					midpoint = [(x1+x2)/2,(y1+y2)/2];

				if (y1 == y2) {
					//straight lines if they have the same y-coordinate but are not too far away.
					//or if there is a conflict
					var dist = Math.abs(x1-x2),
						neg = dist > 1 && Math.ceil(dist) % 2 == 1 ? -1 : 1,
						curve = dist > 1 ? 0.175*neg*dist : 0.07;
					if (dist > 1 || destinations[p[0]].includes(i)) {
						var p3;
						//curve up if left-to-right
						//down otherwise
						if(x1 > x2) { p3 = board.create('point',[midpoint[0],midpoint[1]-curve]); }
						else { p3 = board.create('point',[midpoint[0],midpoint[1]+curve]); }
						p3.hideElement();
						board.create('circumcirclearc',[points[i],p3,points[p[0]]],linestyle);
						var diff = x1 > x2 ? -0.01 : 0.01,
						shift = x1 > x2 ? -0.05 : 0.15,
						tc = [p3.X(), p3.Y()],
						tnose = [tc[0]+2*diff,tc[1]];
						maketriangle(board, tc, tnose);
						board.create('text',[p3.X(),p3.Y()+shift,p[1]],textstyle);
					}
					else {
						var tc = [midpoint[0], midpoint[1]],
						xsh = x1 > x2 ? -0.02 : 0.02,
						tnose = [tc[0]+xsh,tc[1]];
						maketriangle(board, tc, tnose);
						board.create('segment',[points[i],points[p[0]]],linestyle);
						board.create('text',[midpoint[0],midpoint[1]+0.15*neg,p[1]],textstyle);
					}
				}

				//if differing y-coordinates, default to straight line unless conflict
				else if (destinations[p[0]].includes(i)){
					var co, diffs = [0,0,0,0], tshift = [0,0];
					if (x1 == x2) {
						if (y1 > y2) {
							co = [midpoint[0]+0.1,midpoint[1]];
							diffs = [0,0.01,0,-0.01];
							tshift = [0.1,0];
						}
						else { 
							co = [midpoint[0]-0.1,midpoint[1]];
							diffs = [0,-0.01,0,0.01];
							tshift = [-0.05,0];
						}
					}
					else if(x1 > x2) { 
						var slope = (y2-y1)/(x2-x1);
						co = [midpoint[0],midpoint[1]-0.1];
						diffs = [0.005,slope*0.005,0,0];
						tshift = slope > 0 ? [0.05,0] : [-0.05,-0.05];
					}
					else { 
						var slope = (y2-y1)/(x2-x1);
						co = [midpoint[0],midpoint[1]+0.1];
						diffs = [0,0,0.005,slope*0.005];
						tshift = slope > 0 ? [-0.1,0.05] : [0.1,0.1];
					}
					var ar = [[co[0]+diffs[0],co[1]+diffs[1]],[co[0]+diffs[2],co[1]+diffs[3]]],
						p3 = board.create('point',co);
					p3.hideElement();
					board.create('circumcirclearc',[points[i],p3,points[p[0]]],linestyle);
					var diff = x1 > x2 ? -0.01 : 0.01,
					shift = x1 > x2 ? -0.1 : 0.1,
					tc = [co[0],co[1]],
					xsh = x1 > x2 ? -0.02 : 0.02,
					tnose = [tc[0]+xsh,tc[1]+xsh*slope];
					maketriangle(board, tc,tnose);
					board.create('text',[co[0]+tshift[0],co[1]+tshift[1],p[1]],textstyle);
				}
				else {
					var ar, tshift, tc = [...midpoint], tnose;
					if (x1 == x2) {
						var yshift = y1 > y2 ? -0.02 : 0.02;
						tnose = [tc[0],tc[1]+yshift];
						tshift = [0.05,0];
					}
					else {
						var slope = (y2-y1)/(x2-x1),
							pre_shift = x1 < x2 ? 0.02 : -0.02;
						tnose = [tc[0]+pre_shift,tc[1]+pre_shift*slope];
						tshift = slope > 0 ? [0.05,0] : [0.05,0.05];
					}
					maketriangle(board, tc,tnose);
					board.create('segment',[points[i],points[p[0]]],linestyle);
					board.create('text',[midpoint[0]+tshift[0],midpoint[1]+tshift[1],p[1]],textstyle);
				}
			}
		}
	}

	board.unsuspendUpdate()
	return board
}


