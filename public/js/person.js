var Person = function()
{
	this.node = null;
	this.friendList = [];
};

Person.prototype.Initialize = function(node)
{
	this.node = node;
};
Person.prototype.AddFriend = function(person)
{
	this.friendList.push(person);
};

Person.prototype.GetNode = function()
{
	return this.node;
};
Person.prototype.GetData = function()
{
	return this.GetNode().data()[0];
};
Person.prototype.GetUid = function()
{
	return this.GetData().uid;
};
Person.prototype.GetFriends = function()
{
	return this.friendList;
};

Person.prototype.FindFriend = function(uid)
{
	// Binary search, since friends' uids are in ascending order
	var noFriends = this.friendList.length;
	
	if(noFriends == 0)
	{
		return null;
	}

	var searchIndex = Math.floor(noFriends / 2);
	var lowerIndex = 0;
	var higherIndex = noFriends - 1;
	
	while(1)
	{
		var targetUid = this.friendList[searchIndex].GetData().uid;
		
		if(targetUid == uid)
		{
			return this.friendList[searchIndex];
		}
		else
		{
			// Incomplete
			var diff = searchIndex - lowerIndex;
			var absDiff = Math.abs(diff);
			var sign = (targetUid - uid) / Math.abs(targetUid - uid);
			
			// Not found
			if(Math.floor(absDiff) == 0)
			{
				break;
			}
			
			searchIndex += sign * Math.floor(absDiff);
		}
	}
	
	return null;
};