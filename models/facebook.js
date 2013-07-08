var Facebook = require('facebook-node-sdk');
var https = require("https");
var fs = require('fs');

exports.FacebookUser = function()
{
// public Functions
	this.Initialize = Initialize;

	this.SetUid = SetUid;
	this.GetFriendList = GetFriendList;
	this.GetMutualFriendListOfFriendList = GetMutualFriendListOfFriendList;
	this.GetFriendsName = GetFriendsName;

	this.facebook = null;
	this.uid = 0;
	this.friendList = null;
};

function Initialize(accessToken, callback)
{
	var user = this;

	fs.readFile("data/app_data.txt", {encoding : "UTF-8"}, function(err,data)
	{
		var appID = data.match(/appID=(.*)/)[1];
		var secret = data.match(/secret=(.*)/)[1];

		user.facebook = new Facebook({ appId: appID, secret: secret});
		user.facebook.setAccessToken(accessToken);
		user.facebook.getUser(function(err,uid)
		{
			user.SetUid(uid);
			callback();
		});

	});
}

function SetUid(uid)
{
	this.uid = uid;
}
function GetFriendList(callback)
{
	this.facebook.api('/' + this.uid + '/friends', function(err,data)
	{
		callback(data);
	});
}
function GetMutualFriendListOfFriendList(friendList, callback)
{
	var facebook = this.facebook;
	var batch = [];

	for(var i in friendList['data'])
	{
		var id = friendList['data'][i].id;

		batch.push(
		{
			method : "GET",
			relative_url : "me/mutualfriends/" + id,
		});
	}
	
	// Maxium batch query number is 50, so partitioning is required
	var batchQueries = [];
	var batchSize = 50;
	
	for(var i = 0; i < Math.floor(batch.length / batchSize) + 1; ++i)
	{
		var subBatch = batch.slice(batchSize * i, batchSize * (i+1));

		if(subBatch.length == 0)
		{
			continue;
		}

		batchQueries.push(subBatch);
	}

	var mutualFriendList = {};
	
	var callBatch = function(i, finalCallback)
	{
		facebook.api('', "POST", {batch : batchQueries[i]}, function(err, data)
		{
			var index = 0;
			
			for(var j in data)
			{
				var friendID = friendList['data'][i * batchSize + index].id;
				var tempList = JSON.parse(data[j]['body'])['data'];
				
				var list = [];
				for(var set in tempList)
				{
					list.push(tempList[set].id);
				}
				
				mutualFriendList[friendID] = list;
				++index;
			}
			
			if(i >= batchQueries.length - 1)
			{
				finalCallback(mutualFriendList);
			}
			else
			{
				callBatch(i+1, finalCallback);
			}
		});
	};

	callBatch(0, callback);
	
	return;
/*
	var params = {
		method : "fql.query",
		query : "SELECT uid1, uid2 FROM friend WHERE uid1 in (SELECT uid1 FROM friend WHERE uid2 = me()) AND uid2 IN (SELECT uid1 FROM friend WHERE uid2=me())"
	};

	this.facebook.api(params, function(err, data)
	{
		var nameQuery = {
			method : "fql.query",
			query : "SELECT "
		};
		callback(data);
	});*/
}
function GetFriendsName(callback)
{
	var params = 
	{
		method : "fql.query",
		query : "SELECT name,uid FROM user WHERE uid in (SELECT uid1 FROM friend WHERE uid2 = me())"
	}
	
	this.facebook.api(params, function(err, data)
	{
		callback(data);
	});
}
