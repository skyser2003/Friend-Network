// Entry point
jQuery(document).ready(function()
{
	var socket = io.connect(location.origin);
	var accessToken = location.href.match(/\?access_token=([^&]*)/)[1];
	
	socket.on("Here is your initial data", function(data)
	{
		jQuery("#test").html(JSON.stringify(data));
	});

	socket.emit('Give me initial data', { accessToken : accessToken});
});