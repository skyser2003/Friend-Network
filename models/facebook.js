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

	this.facebook = null;
	this.uid = 0;
	this.friendList = null;
};

function Initialize(callback)
{
	var user = this;

	fs.readFile("data/app_data.txt", {encoding : "UTF-8"}, function(err,data)
	{
		var appID = data.match(/appID=(.*)/)[1];
		var secret = data.match(/secret=(.*)/)[1];

		user.facebook = new Facebook({ appId: appID, secret: secret});

		/*https.request(
		{
			hostname : 'graph.facebook.com',
			path : '/oauth/access_token?client_id=' + appID + '&client_secret=' + secret + '&grant_type=client_credentials'
		},
		function(res)
		{
			console.log("https entered");
			res.on('data', function(html)
			{
				var accessToken = html.match(/access_token=(.*)/);

				if(accessToken != null)
				{*/
					var accessToken = [];
					//accessToken[1] = '413975995318982|5kdNUNTUqLdLxkUGGE5zOaakHCw';
					accessToken[1] = "CAAF4gkwlgsYBAN3ZCrdZBaulGdjnvszUXJ1kggwGrrQ3w8uqnQAZCd0Kl3ZBzCuuNno3EsB5rQKH6AA7nYvY2xR8VMOuQkf5B1I6bGoMcWeCOanAPNwY6K5qBSZAJAC2Wbj7kl3W7BJq23dRvjKyARwW8cBHfNHsYEhS3HHU5awZDZD";
					user.facebook.setAccessToken(accessToken[1]);
					user.facebook.getUser(function(err,uid)
					{
						user.SetUid(uid);
						callback();
					});
				/*}
			});
		});*/
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
	var batch = [];

	for(var i in friendList['data'])
	{
		var id = friendList['data'][i].id;

		batch.push(
		{
			method : "GET",
			relative_url : "me/mutualfriends/" + id
		});
	}

	var apiString = '?batch=' + JSON.stringify(batch);

	var params = {
		method : "fql.query",
		query : "SELECT uid1, uid2 FROM friend WHERE uid2 in (SELECT uid1 FROM friend WHERE uid2 = me()) AND uid1 IN (SELECT uid2 FROM friend WHERE uid1=me())"
	};

	this.facebook.api(params, function(err, data)
	{
		var nameQuery = {
			method : "fql.query",
			query : "SELECT "
		};
		callback(data);
	});
}