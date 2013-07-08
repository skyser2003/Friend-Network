var Map = function()
{
	this.people = [];
	
	this.width = 0;
	this.height = 0;
};

Map.prototype.Initialize = function(data, accessToken)
{
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
	
	this.width = document.body.clientWidth;
    this.height = document.body.clientHeight * 0.95;
    
	var force = d3.layout.force()
    .charge(-480)
    .linkDistance(120)
    .size([this.width, this.height]);
   
    var nodes = [];
    var links = [];
    var nodeIndex = {};
    
    for(var uid in friends)
    {
	    nodes.push(
	    {
	    	name : friends[uid],
	    	uid : uid,
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

 	this.DrawSVG(force, nodes, links);
};
Map.prototype.Destroy = function()
{
	this.people = [];
};

Map.prototype.DrawSVG = function(force, nodes, links)
{
 	// View
    var svg = d3.select("#canvas")
    .attr("width", this.width)
    .attr("height", this.height);

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
	
	var link = svg.selectAll(".link")
		.data(links)
		.enter().append("line")
		.attr("class", "link")
		.style("stroke-width", function(d) { return Math.sqrt(d.value); });

	var node = svg.selectAll('.node')
		.data(nodes)
 		.enter()
 		.append("circle")
		.attr("class", "node")
		.attr("r", 20)
		.style("fill", function(d) { return color(d.group); })
		.call(force.drag);

	node.append("title")
		.text(function(d) { return d.name; });
		
	force.on("tick", function() {
	    link.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

	node.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; });
	});
	
	//node.attr("fill", function(d) { return "url(#" + d.uid + ")"; });
}
Map.prototype.DrawCanvas = function(force, nodes, links)
{
	var svg = d3.select("#canvas")
    .attr("width", 0)
    .attr("height", 0);

	var canvas = d3.select("#canvas_temp")
    .attr("width", this.width)
    .attr("height", this.height);
    
    var context = canvas.node().getContext("2d");

	var link = svg.selectAll(".link")
		.data(links);

	var node = svg.selectAll('.node')
		.data(nodes)
 		.enter()
 		.append('circle')
		.call(force.drag);
		
	force.on("tick", function() {
		context.clearRect(0,0, canvas.node().width, canvas.node().height);
		
		node.each(function(d,i)
		{
			context.beginPath();
			context.arc(d.x, d.y, 25, 0, 2 * Math.PI, false);
			context.fillStyle = "green";
			context.fill();
			context.stroke();
		});
	});
}
