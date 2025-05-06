/* 
 some old code to help draw trees in jsxgraph
 using draw_tree(divid, tree_template, labs) will make a jsxgraph board and add it to the div with id divid.
 tree_template is a list of binary strings such as ["000","001","010","011","100","101","110","111"]
 which represents nodes in a binary tree
 and labs is a list of labels using inorder traversal 
*/

function labelise(lrpair, nextLabel){
  //if the tree is pre-order traversed, then the label affixed to the vertex is the step n at which that vertex is visited.
  var left = [], right = [], mylabel = nextLabel;
  nextLabel++;
  if (lrpair[0].length > 0) { 
    var pre_left = labelise(lrpair[0],nextLabel);
    nextLabel = pre_left[1];
    left = pre_left[0];
  }
  if (lrpair[1].length > 0) {
    var pre_right = labelise(lrpair[1],nextLabel);
    right = pre_right[0];
    nextLabel = pre_right[1];
  }
  return [[left,right,mylabel], nextLabel];
}

function split(l) {
  if (l.length == 0) { return []; }
  else {
    var left = [], right = [];
    for (var x of l) {
      if (x.length > 0) {
	    if (x[0] == "0") { left.push(x.substr(1)); }
	    else { right.push(x.substr(1)); }
      }
    } 
    return [split(left),split(right)];
  }
}

function Tree(lrpair) {
  var left = lrpair[0], right=lrpair[1];
  this._labelindex = lrpair[2];
  if (left.length === 0) { this._left = null; }
  else { this._left = new Tree(left); }
  if (right.length === 0) { this._right = null; }
  else { this._right = new Tree(right); }
}

function treestructure(binary_strings) {
	//returns a tree structure where:
	// tree["_left"] is the left sub-tree
	// tree["_right"] is the right sub-tree
	// tree["_labelindex"] is the index when this vertex is visited according to pre-order traversal
	var structure = labelise(split(binary_strings),0)[0];
	return new Tree(structure);
}

function draw_tree(divid, tree_template, labs) {
	//labels must be given using inorder traversal form
	var tree = treestructure(tree_template),
		n = preorder(tree).length,
		info = draw_info(tree,[0,0],15,2),
		labels = [],
		xmax = 15,
		ymin = -10, 
		vertex_size = 10,
		coords = info[0],
		edges = info[1],
		boundbox= [-xmax, 2, xmax, ymin],
		board = JXG.JSXGraph.initBoard(divid, {boundingbox: boundbox, axis: false, showNavigation: false, pan: {enabled:false}, zoom:{enabled:false}, showCopyright:false});

	for (var i = 0; i < n; ++i){
		labels[i] = i < labs.length ? labs[i] : "";
	}

	const pointProperties = {strokeColor:'black', name:"", size:vertex_size, fixed:true, showInfoBox:false, fillColor:'white', highlight:false},
		textProperties = { fixed:true, fontsize:14, anchorX:'middle', anchorY:'middle', useMathJax:false, highlight:false, },
		segmentProperties = { highlight:false, fixed:true, strokeColor:'black' };

	for (var i = 0; i < coords.length; ++i) {
		var c = coords[i],
			l = labels.length > i ? labels[i] : "",
			tc = [c[0],c[1],l];
		board.create('point',c,pointProperties);
		board.create('text',tc,textProperties);
	}
	for (var e of edges) {
		board.create('segment',e,segmentProperties);
	}
	return board;
}

function draw_info(tree, root_coord, width, ystep) {
	var coords_list = [root_coord], edge_list = [];
	if (tree._left) {
		var left_coord = [root_coord[0]-width/2,root_coord[1]-ystep];
		edge_list.push([root_coord,left_coord]);
		var next_info = draw_info(tree._left, left_coord, width/2, ystep);
		coords_list = coords_list.concat(next_info[0]);
		edge_list = edge_list.concat(next_info[1]);
	}
	if (tree._right){
		var right_coord = [root_coord[0]+width/2,root_coord[1]-ystep];
		edge_list.push([root_coord,right_coord]);
		var next_info = draw_info(tree._right, right_coord, width/2, ystep);
		coords_list = coords_list.concat(next_info[0]);
		edge_list = edge_list.concat(next_info[1]);
	}
	return [coords_list, edge_list];
}

function preorder(tree) {
  var labels = [tree._labelindex];
  if (tree._left) { labels = labels.concat(preorder(tree._left)); }
  if (tree._right) { labels = labels.concat(preorder(tree._right)); }
  return labels
}

function postorder(tree) {
	var labels = []
	if (tree._left) { labels = labels.concat(postorder(tree._left)); }
	if (tree._right) { labels = labels.concat(postorder(tree._right)); }
	labels.push(tree._labelindex);
	return labels
}

function inorder(tree) {
  var labels = [];
  if (tree._left) { labels = labels.concat(inorder(tree._left)); }
  labels.push(tree._labelindex);
  if (tree._right) { labels = labels.concat(inorder(tree._right)); }
  return labels;
}

