// assumes 600px wide 400px tall
function pascal(rows, max) {
	var boundbox = [-8.5,0.5,8.5,-8.5],
		board = JXG.JSXGraph.initBoard(divid, {boundingbox: boundbox, axis: false, showNavigation: false, pan: {enabled:false}, zoom:{enabled:false}, showCopyright:false});

	const LineStyle = {fixed:true,strokeColor:"black",highlight:false},
		TextStyle = {fontsize:14,fixed:true,useMathJax:true,highlight:false,anchorX:'middle',anchorY:'middle'};

	for (var i=0; i < max+1; i++) {
		var p1 = [2*i-max,-max],
			p2 = [i,-i],
			p3 = [i-max,i-max];
		board.create('segment',[p1,p2],LineStyle);
		board.create('segment',[p1,p3],LineStyle);
	}

	for (var i=0; i<rows.length; ++i) {
		for (var j = 0; j < rows[i].length; ++j) {
			board.create('text',[-i+2*j,-i-1,"\\("+rows[i][j]+"\\)"],TextStyle);
		}
	}

	board.create('text',[-1.4,0,"\\(p(n)\\)"],TextStyle);
	board.create('text',[-2.4,-1,"\\(q(n)\\)"],TextStyle);
	board.create('text',[0.7,0,"\\(s(n)\\)"],TextStyle);

	return board
}
