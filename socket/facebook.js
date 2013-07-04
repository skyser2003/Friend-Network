var FacebookUser = require('../models/facebook').FacebookUser;

exports.Initialize = function(data, socket)
{
	var accessToken = data.accessToken;
	var user = new FacebookUser;
	
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
			socket.emit('Here is your initial data', list);
		});
	});
}