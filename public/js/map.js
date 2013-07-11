var Map = function()
{
	this.Draw = null; // depends on drawing type : SVG or Canvas
	
	this.people = [];
	this.selectedUid = 0;
	this.fixPosition = {x: -1, y: -1};
	
	this.width = 0;
	this.height = 0;
	
	this.scale = 1;
	
	this.nodes = [];
	this.links = [];
	this.nodeIndex = {};
};

Map.prototype.Initialize = function(data, accessToken)
{
	var nodes = this.nodes;
	var links = this.links;
	var nodeIndex = this.nodeIndex;

	var friends = {};
	var mutualFriends = data['mutualFriends'];
	var mutualFriendsFriendList = {};
	
	for(var i in data['friends'])
	{
		var uid = data['friends'][i]['uid'];
		var name = data['friends'][i]['name'];
		
		friends[uid] = name;
	}
	
	this.people = [];
	
	//this.width = document.body.clientWidth;
    //this.height = document.body.clientHeight * 0.95;
    
    this.width = 1024;
    this.height = 768;
    
	var force = d3.layout.force()
    .charge(-480)
    .linkDistance(120)
    .size([this.width, this.height]);
    
    for(var uid in friends)
    {
    	var img = new Image();
    	img.width = 50;
    	img.height = 50;
    	img.src = "https://graph.facebook.com/" + uid + "/picture?type=square&access_token=" + accessToken;
    	
	    nodes.push(
	    {
	    	name : friends[uid],
	    	uid : uid,
	    	img : img,
	    	group : 1
	    });
	    
	    nodeIndex[uid] = nodes.length - 1;
    }

    for(var friendID in mutualFriends)
    {
    	var mutuals = mutualFriends[friendID];
    	
    	for(var index in mutuals)
    	{
    		var uid1 = friendID;
	    	var uid2 = mutuals[index];
	    	
	    	var name1 = friends[uid1]['name'];
	    	var name2 = friends[uid2]['name'];
	    	
	    	//Find duplicate link
	    	var duplicate = false;
	    	
	    	for(var j in links)
	    	{
	    		if(links[j].source == nodeIndex[uid2] && links[j].target == nodeIndex[uid1])
	    		{
	    			duplicate = true;
	    			break;
	    		}
	    	}
	    	
	    	if(!duplicate)
	    	{
	  		    links.push(
		    	{
		    		source : nodeIndex[uid1],
		    		target : nodeIndex[uid2],
		    		value : 1
		    	});
	    	}
    	}
    }
    
    for(var i in links)
    {
    	var uidSource = nodes[links[i].source].uid;
    	var uidTarget = nodes[links[i].target].uid;
    	
    	if(mutualFriendsFriendList[uidSource] === undefined)
    	{
    		mutualFriendsFriendList[uidSource] = [];
    	}
    	if(mutualFriendsFriendList[uidTarget] === undefined)
    	{
    		mutualFriendsFriendList[uidTarget] = [];
    	}

    	mutualFriendsFriendList[uidSource].push(uidTarget);
    	mutualFriendsFriendList[uidTarget].push(uidSource);
    }
    
    var noGroups = 1;

   	for(var uid1 in mutualFriendsFriendList)
    {
    	for(var uid2 in mutualFriendsFriendList)
    	{
    		var noCommonFriends = 0;
    		var commonFriendsGroup = [];
    	
 			var node1 = nodes[nodeIndex[uid1]];
 			var node2 = nodes[nodeIndex[uid2]];

    		if(uid1 == uid2)
    		{
    			continue;
    		}
    		else if(node1.group != 1 && node2.group != 1 && node1.group != node2.group)
    		{
    			continue;
    		}
    		
    		for(var i=0;i<mutualFriendsFriendList[uid1].length;++i)
    		{
    			var commonFriendIndex = mutualFriendsFriendList[uid2].indexOf(mutualFriendsFriendList[uid1][i]); 
    			if(commonFriendIndex != -1)
    			{
    				++noCommonFriends;
    				commonFriendsGroup.push(mutualFriendsFriendList[uid1][i]);
    			}
    		}
    		
	 		if(noCommonFriends >= 10)
	 		{
	 			var setGroupID;
	 			
	 			if(node1.group != 1 && node2.group == 1)
	 			{
	 				setGroupID = node1.group;
	 			}
	 			else if(node1.group == 1 && node2.group != 1)
	 			{
	 				setGroupID = node2.group;
	 			}
	 			// Both friends don't have group yet
	 			else if(node1.group == 1 && node2.group == 1)
	 			{
	 				setGroupID = ++noGroups;
	 			}
	 			
	 			node1.group = setGroupID;
	 			node2.group = setGroupID;
	 			
	 			/*for(var i in commonFriendsGroup)
	 			{
	 				var index = nodeIndex[commonFriendsGroup[i]];
	 				nodes[index].group = setGroupID;
	 			}*/
	 		}
 		}
  	}
 	
 	force
		.nodes(nodes)
		.links(links)
		.start();

	// Data & part of view
			
    var svg = d3.select("#svg")
    .attr("width", this.width)
    .attr("height", this.height);

	var link = svg.selectAll(".link")
		.data(links)
		.enter()
		.append("line")
		
	var node = svg.selectAll('.node')
		.data(nodes)
 		.enter()
 		.append('circle')
 		.attr("r",20);
		//.call(force.drag);

 	this.DrawCanvas(force, node, link);
};
Map.prototype.Destroy = function()
{
	this.people = [];
};

Map.prototype.DrawSVG = function(force, node, link)
{
 	// View
    var svg = d3.select("#svg")
    .attr("width", this.width)
    .attr("height", this.height);
    
    d3.select("#canvas")
    .style("display","none");

	// Create thumbnail
	/*for(var uid in friends)
	{
		svg.append("pattern")
			.attr("id", uid)
			.attr("patternUnits", "objectBoundingBox")
			.attr("width","50")
			.attr("height","50")
			.append("image")
			.attr("xlink:href","https://graph.facebook.com/" + uid + "/picture?type=square&access_token=" + accessToken)
			.attr("x","0")
			.attr("y","0")
			.attr("width","1")
			.attr("height","1");
	}*/
	
	var color = d3.scale.category20();
	
		link.attr("class", "link")
		.style("stroke-width", function(d) { return Math.sqrt(d.value); });

	node.attr("class", "node")
		.style("fill", function(d) { return color(d.group); });

	node.append("title")
		.text(function(d) { return d.name; });
		
	force.on("tick", function() {
		force.resume();
		
	    link.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

	node.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; });
	});
	
	//node.attr("fill", function(d) { return "url(#" + d.uid + ")"; });
}
Map.prototype.DrawCanvas = function(force, node, link)
{
	var map = this;
	var color = d3.scale.category20();

	d3.select("#svg")
    .style("display", "none");

	var canvas = d3.select("#canvas")
    .attr("width", this.width)
    .attr("height", this.height);
    
    canvas.node().onmousedown = function() { return false; }
    
    var context = canvas.node().getContext("2d");
    
    canvas.on('mousedown', function(d,i)
    {
    	var mouse = d3.mouse(this);
    	
	  	node.each(function(d,i)
	  	{
	  		var x = d.x;
	  		var y = d.y;
	  		var r = this.getAttribute('r');
	  		
	  		var relX = map.GetCanvasX(x);
	  		var relY = map.GetCanvasY(y);
	  		var relR = map.GetCanvasLength(r);
	  		
	  		if(Math.pow(mouse[0] - relX, 2) + Math.pow(mouse[1] - relY, 2) <= Math.pow(relR, 2))
	  		{
	  			var index = map.nodeIndex[d.uid];
	  			console.log(map.nodes[index].name);
	  			
		  		map.selectedUid = d.uid;
		  		map.fixPosition.x = x;
		  		map.fixPosition.y = y;
		  		
		  		force.resume();
			}
	  	});
    });
    
    canvas.on('mouseup', function(d,i)
    {
    	map.selectedUid = 0;
    	map.fixPosition.x = map.fixPosition.y = -1;
    });
    
    canvas.on('mousemove', function(d,i)
    {
    	var mouse = d3.mouse(this);
    	
    	// Dragging
    	if(map.selectedUid != 0)
    	{
    		var index = map.nodeIndex[map.selectedUid];
    		
	    	map.nodes[index].x = map.GetRealX(mouse[0]);
	    	map.nodes[index].y = map.GetRealY(mouse[1]);
	    	
	    	map.fixPosition.x = map.GetRealX(mouse[0]);
	    	map.fixPosition.y = map.GetRealY(mouse[1]);
    	}
    	// Just hovering
    	else
    	{
    	}
    });
    
    canvas.on('mousewheel', function(d,i)
    {
    	var delta = d3.event.wheelDeltaY;
    	
    	map.scale += 0.0001 * delta;
    });
    
   	force.on("tick", function()
	{
		if(map.selectedUid != 0)
		{
			var index = map.nodeIndex[map.selectedUid];
			map.nodes[index].x = map.fixPosition.x;
			map.nodes[index].y = map.fixPosition.y;
		}
	});

	this.Draw = function()
    {
    	context.clearRect(0,0, canvas.node().width, canvas.node().height);
		
		link.each(function(d,i)
		{
			context.beginPath();
			context.strokeStyle = "#000000";
			context.lineWidth = map.GetCanvasLength(2);
			context.moveTo(map.GetCanvasX(d.source.x), map.GetCanvasY(d.source.y));
			context.lineTo(map.GetCanvasX(d.target.x), map.GetCanvasY(d.target.y));
			context.stroke();
		});
		
		node.each(function(d,i)
		{
			var x = map.GetCanvasX(d.x);
			var y = map.GetCanvasY(d.y);
			var r = map.GetCanvasLength(this.getAttribute('r'));
			var imgWidth = map.GetCanvasLength(d.img.width);
			var imgHeight = map.GetCanvasLength(d.img.height);

			context.save();
			
			context.beginPath();
			context.lineWidth = map.GetCanvasLength(2);
			context.strokeStyle = "#000000";
			context.arc(x, y, r, 0, 2 * Math.PI, false);
			context.clip();
			context.drawImage(d.img, x - r, y - r, imgWidth, imgHeight);
			context.stroke();
			context.closePath();
			
			context.restore();
		});
    };
	setInterval(map.Draw, 1000 / 60);
}

Map.prototype.GetCanvasX = function(x)
{
	return x * this.scale;
};
Map.prototype.GetCanvasY = function(y)
{
	return y * this.scale;
};
Map.prototype.GetCanvasLength = function(length)
{
	return length * this.scale;
};

Map.prototype.GetRealX = function(canvasX)
{
	if(this.scale == 0)
	{
		return 0;
	}
	else
	{	
		return canvasX / this.scale;
	}
};
Map.prototype.GetRealY = function(canvasY)
{
	if(this.scale == 0)
	{
		return 0;
	}
	else
	{	
		return canvasY / this.scale;
	}
};
Map.prototype.GetRealLength = function(canvasLength)
{
	if(this.scale == 0)
	{
		return 0;
	}
	else
	{	
		return canvasLength / this.scale;
	}
};