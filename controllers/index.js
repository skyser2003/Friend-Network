
/*
 * GET home page.
 */

var FacebookUser = require('../models/facebook').FacebookUser;

exports.index = function(req, res)
{
	if(req.query.access_token !== undefined)
	{
		var user = new FacebookUser;
		var accessToken = req.query.access_token;
		
		user.Initialize(accessToken, function()
		{
			/*user.GetFriendList(function(friendList)
			{
				user.GetMutualFriendListOfFriendList(friendList, function(allMutualFriendList)
				{
					var string = JSON.stringify(allMutualFriendList);
					res.render('index', {data : string, title : 'boo'});
				});
			});*/
			
			user.GetFriendsName(function(list)
			{
				res.render('index', {title : "boo", data : JSON.stringify(list)});
			});
		});
	}
	else
	{
		res.render('index_no_access_token');
	}
};