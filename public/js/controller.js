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
	var self = this;
	
	self.map = new Map;
	self.canvas = new Canvas;
	
	self.width = 1024;
	self.height = 700;
	self.nodeRadius = 25;
	
	var map = self.map;
	var canvas = self.canvas;
	
	// Initialize view & model
	map.Initialize(data, accessToken);
	canvas.Initialize(self.width, self.height, "canvas");

	var errImg = new Image();
	errImg.width = self.nodeRadius * 2;
	errImg.height = self.nodeRadius * 2;
	errImg.src = "http://pic.skyser.kr/img/소나.jpg";
	
	// Initliaze a few more
	var people = map.GetPeople();
	
	for(var uid in people)
	{
		var personData = people[uid].GetData();
		var node = people[uid].GetNode();

    	var img = new Image();
    	img.width = self.nodeRadius * 2;
    	img.height = self.nodeRadius * 2;
    	img.src = "https://graph.facebook.com/" + uid + "/picture?type=square&access_token=" + accessToken;
    	
		personData.img = img;
		node.attr("r", self.nodeRadius);
		
		(function(uuid)
		{
			var personData = people[uuid].GetData();
			personData.img.onerror = function(e)
	    	{
	    		personData.img = errImg;
	    	};
	    	personData.img.onload = function()
	    	{
				personData.imgDrawable = true;
	    	};
		})(uid);
	}
	
	var force = map.GetForce();
	
	force.size([self.width, self.height])
	.start();
};

Controller.prototype.Run = function()
{
	var self = this;
	var map = this.map;
	
	var canvasElem = self.canvas.GetCanvas();
	var canvas = self.canvas;
	
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
		    		var d = person.GetData();
		    		
		    		if(canvas.IsInner(person, mouse[0], mouse[1]))
		    		{
		    			console.log(person.GetData().name);
			  			
				  		self.selectedPerson = person;
				  		self.fixPosition.x = canvas.GetRealX(mouse[0]);
				  		self.fixPosition.y = canvas.GetRealY(mouse[1]);
				  		
				  		return;
		    		}
		    	}
		    	
		    	self.draggingCanvas = true;
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
			  	self.draggingCanvas = true;
    		}
    		break;
    	}
    });
    
    canvasElem.on('mouseup', function(d,i)
    {
    	self.selectedPerson = null;
    	
    	if(self.hoverPerson === null)
    	{
    		self.fixPosition.x = self.fixPosition.y = -1;
    	}
    	
    	self.draggingCanvas = false;
    });
    
    canvasElem.on('mousemove', function(d,i)
    {
    	var mouse = d3.mouse(this);
    	
    	// Dragging node
    	if(self.selectedPerson !== null)
    	{
    		var data = self.selectedPerson.GetData();
    		
	    	data.x = canvas.GetRealX(mouse[0]);
	    	data.y = canvas.GetRealY(mouse[1]);
	    	
	    	self.fixPosition.x = canvas.GetRealX(mouse[0]);
	    	self.fixPosition.y = canvas.GetRealY(mouse[1]);
    	}
    	// Hovering over a node
    	else if(self.hoverPerson !== null && canvas.IsInner(self.hoverPerson, mouse[0], mouse[1]))
    	{
	    	var data = self.hoverPerson.GetData();
	    	
	    	data.x = self.fixPosition.x;
	    	data.y = self.fixPosition.y;
    	}
    	// Moving around canvas
    	else if(self.draggingCanvas == true)
    	{
	    	canvas.offset.x += canvas.GetRealLength(mouse[0] - self.prevMouse.x);
	    	canvas.offset.y += canvas.GetRealLength(mouse[1] - self.prevMouse.y);
    	}
    	// Just hovering
    	else
    	{
    		self.hoverPerson = null;
    		
    		for(var uid in people)
    		{
    			var person = people[uid];
    			
    			if(canvas.IsInner(person, mouse[0], mouse[1]))
    			{
    				self.hoverPerson = person;
    				self.fixPosition.x = person.GetData().x;
    				self.fixPosition.y = person.GetData().y;
    			};
    		}
       	}
    	
    	self.prevMouse.x = mouse[0];
    	self.prevMouse.y = mouse[1];
    });
    
    canvasElem.on('mousewheel', function(d,i)
    {
    	var mouse = d3.mouse(this);
    	var delta = d3.event.wheelDeltaY;
    	
    	var beforeScale = canvas.GetScale();
    	canvas.SetScale(beforeScale * (1 + 0.001 * delta));
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
		
		if(self.selectedPerson !== null)
		{
			var data = self.selectedPerson.GetData();
			
			data.x = self.fixPosition.x;
			data.y = self.fixPosition.y;
			canvas.SetHighlightPerson(self.hoverPerson);
		}
		else if(self.hoverPerson !== null)
		{
			var data = self.hoverPerson.GetData();
			
			data.x = self.fixPosition.x;
			data.y = self.fixPosition.y;
			
			canvas.SetTooltipPerson(self.hoverPerson);
			canvas.SetHighlightPerson(self.hoverPerson);
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
