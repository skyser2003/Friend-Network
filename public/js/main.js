// Entry point

function boo(json)
{
	console.log(json);
}

jQuery(document).ready(function()
{
	$.ajaxSetup({ cache: true });
	$.getScript('//connect.facebook.net/en_UK/all.js', function() {
		FB.init(
		{
			appId: '413975995318982',
			status     : true, // Check Facebook Login status
			xfbml      : true
		});
		
		FB.getLoginStatus(function(data)
		{
			var accessToken = data.authResponse.accessToken;
			var socket = io.connect(location.origin);
	
			socket.on("Initial data", function(data)
			{
				jQuery("#test").html(JSON.stringify(data));
				
				var map = new Map;
				map.Initialize(data, accessToken);
			});
		
			socket.emit('Initialize', { accessToken : accessToken});
		});
	});
});
