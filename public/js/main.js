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
			// If not logged in or haven't authorized this app yet, do so
			if(data.status == "not_authorized" || data.status == "unknown")
			{
				FB.login();
			}
			
			var accessToken = data.authResponse.accessToken;
			var socket = io.connect(location.origin);
	
			socket.on("Initial data", function(data)
			{
				// Initialize
				var control = new Controller;
				control.Initialize(data, accessToken);
				control.Run();
			});
		
			socket.emit('Initialize', { accessToken : accessToken});
		});
	});
});
