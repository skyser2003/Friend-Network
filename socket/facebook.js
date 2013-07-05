var FacebookUser = require('../models/facebook').FacebookUser;

exports.Initialize = function(socket)
{

	socket.on('Initialize', function (data) {
		var accessToken = data.accessToken;
		var user = new FacebookUser;
	
		user.Initialize(accessToken, function()
		{
			user.GetFriendList(function(friendList)
			{
				user.GetMutualFriendListOfFriendList(friendList, function(allMutualFriendList)
				{
					user.GetFriendsName(function(list)
					{
						socket.emit('Initial data', { friends : list, mutualFriends : allMutualFriendList});
					});
				});
			});
		});
	});
}
