// Entry point
jQuery(document).ready(function()
{
	var socket = io.connect(location.origin);
	var accessToken = location.href.match(/\?access_token=([^&]*)/)[1];
	
	socket.on("Initial data", function(data)
	{
		jQuery("#test").html(JSON.stringify(data));
	});

	socket.emit('Initialize', { accessToken : accessToken});
});
