function generateLabels(l,n,style,labelOffset) {
	//pads out l until it has length n, utilising style as necessary.
	var newlist = [];
	for (var i = 0; i < n; ++i){
		var text;
		if (l[i] !== undefined) { text = l[i]; }
		else {
			var alph = "abcdefghijklmnopqrstuvwxyz",
				Alph = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			switch(style){
				case "Alph": 
					text = Alph[(i+labelOffset) % 26];
					break;
				case "alph":
					text = alph[(i+labelOffset) % 26];
					break;
				case "num":
					text = (i+labelOffset).toString();
					break;
				default: 
					text = "";
			}
		}
		newlist[i] = text;
	}
	return newlist;
}

function insert_graph(divid, adj, options = {}) {
	//manage default options
	function ifdef(opt, def) { return opt !== undefined ? opt : def; }

	var flexible = ifdef(options.flexible,true),
		rectangle = ifdef(options.rectangle,false),
		edgeColour = ifdef(options.edgeColour,"blue"),
		vertexColour = ifdef(options.vertexColour,"red"),
		scale = ifdef(options.scale,1),
		vertexSize = ifdef(options.vertexSize,5),
		edgeSize = ifdef(options.edgeSize,5),
		showLabels = ifdef(options.showLabels,true),
		labelPosition = "awayFromOrigin",
		labelStyle = ifdef(options.labelStyle,"Alph"),
		labelStart = ifdef(options.labelStart,0),
		labelOffset = rectangle ? 0.2 : 0.3,
		width = scale*ifdef(options.width,300),
		height = scale*ifdef(options.height,300),
		PointStyle = { name:"", face:'o', size:vertexSize, fixed:!flexible, strokeColour:vertexColour, highlight:false, showInfobox:false, },
		EdgeStyle = { strokeWidth:edgeSize, strokeColor:edgeColour, fixed:true },
		n = adj.length,
		coords = [],
		labels = generateLabels([],n,labelStyle,labelStart),
		labelinfo = [],
		boundbox = [-3,3,3,-3],
		points = [];

	if (rectangle) {
		var r = 1, //distance between vertices
			bottom_number = Math.ceil(n/2),
			top_number = Math.floor(n/2),
			shift = (bottom_number-1)/2,
			top_offset = n%2 == 0 ? 0 : 0.5;
		boundbox = [-shift-0.5,1.25,shift+0.5,-1.25];
		for (var i=0; i < n; i++) {
			if (i < bottom_number) { coords[i] = [i*r-shift,-0.5]; }
			else { coords[i] = [(i*r) % bottom_number + top_offset-shift, 0.5]; }
		}
	}
	else {
		var r = 2, //radius of circle
			angle = Math.PI*2/n;
		for (var i=0; i < n; i++){
			coords[i] = [r*Math.cos(i*angle+Math.PI/2),r*Math.sin(i*angle+Math.PI/2)];
		}
	}

	var board = JXG.JSXGraph.initBoard(divid, { boundingbox: boundbox, axis: false, showNavigation: false, pan: {enabled:false}, zoom:{enabled:false}});

	for (var i = 0; i < n; ++i){
		var ps = {...PointStyle};
		ps.name = labels[i];
		ps.label = {autoPosition:true,offset:[5,-5],anchorX:'middle',anchorY:'middle'};
		var p = board.create('point',coords[i],ps);
		points[i] = p;
	}

	for (var i=0; i < n; i++){
		for (var j=i+1; j < n; j++){
			if (adj[i][j] !== 0)
			{
				board.create('segment',[points[i],points[j]],EdgeStyle);
			}
		}
	}

	return board;
}
