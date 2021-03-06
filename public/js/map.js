var Map = function()
{
	this.people = {};
	
	this.force = null;	
	this.nodes = [];
	this.links = [];
	this.groups = [];
};

Map.prototype.Initialize = function(data, accessToken)
{
	var self = this;
	
	// Initialize member variables
	self.people = {};

	var people = self.people;
	var nodes = self.nodes;
	var links = self.links;

	var nodeIndex = {}; // This is necessary to use d3.js.  Do not delete.
	var mutualFriends = data['mutualFriends'];
	var mutualFriendsFriendList = {};
	
    var svg = d3.select("#svg");

	for(var i in data['friends'])
	{
		var uid = data['friends'][i]['uid'];
		var name = data['friends'][i]['name'];
		
		var person = new Person;
		var datum = {
			//d3.js data set
			// None!
			
			// custom data set
	    	name : name,
	    	group : -1,
	    	person : person,
	    	uid : uid,
	    	img : null,
	    	imgDrawable : false
	    }
	
	    var node = svg.append('circle')
	    .attr("class","node")
	    .data([datum]);
	    
	    person.Initialize(node);
	    people[uid] = person;
		nodes.push(datum);
	    nodeIndex[uid] = nodes.length - 1;
	}

    for(var friendID in mutualFriends)
    {
    	var mutuals = mutualFriends[friendID];
    	
    	for(var index in mutuals)
    	{
    		var uid1 = friendID;
	    	var uid2 = mutuals[index];
	    	
	    	var name1 = people[uid1].GetData()['name'];
	    	var name2 = people[uid2].GetData()['name'];
	    	
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
	    	
	    	if(duplicate == false)
	    	{
	  		    links.push(
		    	{
		    		// d3.js data set
		    		source : nodeIndex[uid1],
		    		target : nodeIndex[uid2],
		    		value : 1
		    		
		    		// custom data set
		    		// None!
		    	});
	    	}
    	}
    }
    
    // Linking
    for(var i in links)
    {
    	var uidSource = nodes[links[i].source].uid;
    	var uidTarget = nodes[links[i].target].uid;
    	
   		self.people[uidSource].AddFriend(self.people[uidTarget]);
   		self.people[uidTarget].AddFriend(self.people[uidSource]);
    }
    
    // Create group
    var groupID = 0;
    for(var i in links)
    {
    	var uid1 = nodes[links[i].source].uid;
    	var uid2 = nodes[links[i].target].uid;
    	
    	var person1 = self.people[uid1];
    	var person2 = self.people[uid2];
    	
    	// If they both have group, skip
    	if(person1.GetData().group != -1 && person2.GetData().group != -1)
    	{
    		continue;
    	}
    	
    	var commonFriendsCount = 0;
    	
    	var friends1 = person1.GetFriends();
    	var friends2 = person2.GetFriends();
    	
    	for(var j in friends1)
    	{
    		var friend1 = friends1[j];
    		
    		for(var k in friends2)
    		{
    			var friend2 = friends2[k];
    			
    			if(friend1 === friend2)
    			{
    				++commonFriendsCount;
    			}
    		}
    	}
    	
    	// They belong to same group
    	if(commonFriendsCount >= 5)
    	{
    		var group1 = person1.GetData().group;
    		var group2 = person2.GetData().group;
    		
    		// Create a new group
    		if(group1 == -1 && group2 == -1)
    		{
    			person1.GetData().group = groupID;
    			person2.GetData().group = groupID;

    			self.groups[groupID] = [];
				self.groups[groupID].push(person1);
				self.groups[groupID].push(person2);
				   			
    			++groupID;
    		}
    		else
    		{
    			var existingGroup = group1 == -1 ? group2 : group1;
    			person1.GetData().group = existingGroup;
    			person2.GetData().group = existingGroup;
    			
    			if(group1 == -1)
    			{
    				self.groups[existingGroup].push(person1);
    			}
    			else
    			{
    				self.groups[existingGroup].push(person2);
    			}
    		}
    	}
    }

	// Data & part of view
    for(var i in links)
    {
    	svg.append('line')
	    .attr("class","link")
	    .data([links[i]]);
    }
    
   	self.force = d3.layout.force()
   	.charge(-480 * 2)
    .linkDistance(500)
    .linkStrength(0.5);

 	self.force
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