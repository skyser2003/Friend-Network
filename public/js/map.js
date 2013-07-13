var Map = function()
{
	this.people = {};
	
	this.force = null;	
	this.nodes = [];
	this.links = [];
	this.nodeIndex = {};
};

Map.prototype.Initialize = function(data, accessToken)
{
	// Initialize member variables
	this.people = {};

	var nodes = this.nodes;
	var links = this.links;
	var nodeIndex = this.nodeIndex;

	var friends = {};
	var mutualFriends = data['mutualFriends'];
	var mutualFriendsFriendList = {};
	
    var svg = d3.select("#svg");

	for(var i in data['friends'])
	{
		var uid = data['friends'][i]['uid'];
		var name = data['friends'][i]['name'];
		
		friends[uid] = name;
	}

	// Create node
    for(var uid in friends)
    {
	    nodes.push(
	    {
	    	person : null,
	    	name : friends[uid],
	    	uid : uid,
	    	img : null,
	    	group : 1
	    });
	    
	    nodeIndex[uid] = nodes.length - 1;
    }
    
    // Create node
    for(var i in nodes)
    {
	    var person = new Person;

	    var node = svg.append('circle')
	    .attr("class","node")
	    .data([nodes[i]]);
	    
	    person.Initialize(node);
	    
	    this.people[nodes[i].uid] = person;
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
    
    // Linking
    for(var i in links)
    {
    	var uidSource = nodes[links[i].source].uid;
    	var uidTarget = nodes[links[i].target].uid;
    	
   		this.people[uidSource].AddFriend(this.people[uidTarget]);
   		this.people[uidTarget].AddFriend(this.people[uidSource]);
    }

	// Data & part of view
    for(var i in links)
    {
    	svg.append('line')
	    .attr("class","link")
	    .data([links[i]]);
    }
    
   	this.force = d3.layout.force()
   	.charge(-480 * 2)
    .linkDistance(500)
    .linkStrength(0.5);

 	this.force
		.nodes(nodes)
		.links(links)
};
Map.prototype.Destroy = function()
{
	this.people = [];
};

Map.prototype.Generate = function()
{
};

Map.prototype.GetForce = function()
{
	return this.force;
};
Map.prototype.GetPeople = function()
{
	return this.people;
};
Map.prototype.GetNodes = function()
{
	return this.nodes;
};
Map.prototype.GetLinks = function()
{
	return this.links;
};