
/*
 * GET home page.
 */

var FacebookUser = require('../models/facebook').FacebookUser;

exports.index = function(req, res){
	var user = new FacebookUser;
	
	user.Initialize(function()
	{
		user.GetFriendList(function(friendList)
		{
			user.GetMutualFriendListOfFriendList(friendList, function(allMutualFriendList)
			{
				var string = JSON.stringify(allMutualFriendList);
				res.render('index', {data : string, title : 'boo'});
			});
		});
	});
};