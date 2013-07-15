var Controller = function()
{
	this.map = null;
	this.canvas = null;
	this.drawID = 0;
	
	this.selectedPerson = null;
	this.hoverPerson = null;
	this.draggingCanvas = false;
	
	this.fixPosition = {x: 0, y: 0};
	this.prevMouse = {x: 0, y: 0};
		
	this.width = 0;
	this.height = 0;
	this.nodeRadius = 0;
};

Controller.prototype.Initialize = function(data, accessToken)
{
	this.map = new Map;
	this.canvas = new Canvas;
	
	this.width = document.body.clientWidth;
	this.height = 768;
	this.nodeRadius = 25;
	
	var map = this.map;
	var canvas = this.canvas;
	
	// Initialize view & model
	map.Initialize(data, accessToken);
	canvas.Initialize(this.width, this.height, "canvas");
	
	// Initliaze a few more
	var people = map.GetPeople();
	
	for(var uid in people)
	{
    	var img = new Image();
    	img.width = this.nodeRadius * 2;
    	img.height = this.nodeRadius * 2;
    	img.src = "https://graph.facebook.com/" + uid + "/picture?type=square&access_token=" + accessToken;
		
		var data = people[uid].GetData();
		var node = people[uid].GetNode();
		
		data.img = img;
		node.attr("r", this.nodeRadius);
	}
	
	var force = map.GetForce();
	
	force.size([this.width, this.height])
	.start();
};

Controller.prototype.Run = function()
{
	var control = this;
	var map = this.map;
	
	var canvasElem = this.canvas.GetCanvas();
	var canvas = this.canvas;
	
	var force = map.GetForce();
	var people = map.GetPeople();
	
	canvasElem.node().onmousedown = function() { return false;};
	canvasElem.node().oncontextmenu = function() { return false;};
	
	canvasElem.on('mousedown', function(d,i)
    {
		// Click a node
    	var mouse = d3.mouse(this);
    	var event = window.event;
    	
    	switch(event.button)
    	{
    		// Left button
    		case 0:
    		{
    			for(var uid in people)
		    	{
		    		var person = people[uid];
		    		var node = person.GetNode();
		    		var d = person.GetData();
		    		
		    		if(canvas.IsInner(person, mouse[0], mouse[1]))
		    		{
		    			console.log(person.GetData().name);
			  			
				  		control.selectedPerson = person;
				  		control.fixPosition.x = canvas.GetRealX(mouse[0]);
				  		control.fixPosition.y = canvas.GetRealY(mouse[1]);
				  		
				  		return;
		    		}
		    	}
    		}
    		break;
    		
    		// Wheel button
    		case 1:
    		{
    			
    		}
    		break;
    		
    		// Right button
    		case 2:
    		{
			  	control.draggingCanvas = true;
    		}
    		break;
    	}
    });
    
    canvasElem.on('mouseup', function(d,i)
    {
    	control.selectedPerson = null;
    	
    	if(control.hoverPerson === null)
    	{
    		control.fixPosition.x = control.fixPosition.y = -1;
    	}
    	
    	control.draggingCanvas = false;
    });
    
    canvasElem.on('mousemove', function(d,i)
    {
    	var mouse = d3.mouse(this);
    	
    	// Dragging node
    	if(control.selectedPerson !== null)
    	{
    		var data = control.selectedPerson.GetData();
    		
	    	data.x = canvas.GetRealX(mouse[0]);
	    	data.y = canvas.GetRealY(mouse[1]);
	    	
	    	control.fixPosition.x = canvas.GetRealX(mouse[0]);
	    	control.fixPosition.y = canvas.GetRealY(mouse[1]);
    	}
    	// Hovering over a node
    	else if(control.hoverPerson !== null && canvas.IsInner(control.hoverPerson, mouse[0], mouse[1]))
    	{
	    	var data = control.hoverPerson.GetData();
	    	
	    	data.x = control.fixPosition.x;
	    	data.y = control.fixPosition.y;
    	}
    	// Moving around canvas
    	else if(control.draggingCanvas == true)
    	{
	    	canvas.offset.x += canvas.GetRealLength(mouse[0] - control.prevMouse.x);
	    	canvas.offset.y += canvas.GetRealLength(mouse[1] - control.prevMouse.y);
    	}
    	// Just hovering
    	else
    	{
    		control.hoverPerson = null;
    		
    		for(var uid in people)
    		{
    			var person = people[uid];
    			
    			if(canvas.IsInner(person, mouse[0], mouse[1]))
    			{
    				control.hoverPerson = person;
    				control.fixPosition.x = person.GetData().x;
    				control.fixPosition.y = person.GetData().y;
    			};
    		}
       	}
    	
    	control.prevMouse.x = mouse[0];
    	control.prevMouse.y = mouse[1];
    });
    
    canvasElem.on('mousewheel', function(d,i)
    {
    	var mouse = d3.mouse(this);
    	var delta = d3.event.wheelDeltaY;
    	
    	var beforeScale = canvas.GetScale();
    	canvas.scale += 0.001 * delta * (beforeScale == 0 ? 1 : beforeScale);
    	var afterScale = canvas.GetScale();
    	
    	var alphaX = 0;
    	var alphaY = 0;
    	
    	if(beforeScale != 0 && afterScale != 0)
    	{
    		alphaX = mouse[0] * (1 / afterScale - 1 / beforeScale);
    		alphaY = mouse[1] * (1 / afterScale - 1 / beforeScale);
    	}
    	
    	canvas.offset.x += alphaX;
    	canvas.offset.y += alphaY;
    });
    
   	force.on("tick", function()
	{
		force.alpha(0.01);
		canvas.SetTooltipPerson(null);
		canvas.SetHighlightPerson(null);
		
		if(control.selectedPerson !== null)
		{
			var data = control.selectedPerson.GetData();
			
			data.x = control.fixPosition.x;
			data.y = control.fixPosition.y;
			canvas.SetHighlightPerson(control.hoverPerson);
		}
		else if(control.hoverPerson !== null)
		{
			var data = control.hoverPerson.GetData();
			
			data.x = control.fixPosition.x;
			data.y = control.fixPosition.y;
			
			canvas.SetTooltipPerson(control.hoverPerson);
			canvas.SetHighlightPerson(control.hoverPerson);
		}
	});
	
	var nodes = map.GetNodes();
	var links = map.GetLinks();
	
	canvas.SetNodes(nodes);
	canvas.SetLinks(links);
	
	var wrapperDraw = function()
	{
		canvas.Draw(nodes, links);
	}
	
	this.drawID = setInterval(wrapperDraw, 1000 / 60);
};
Controller.prototype.Stop = function()
{
	clearInterval(this.drawID);
}
