var Canvas = function()
{
	// View type enum
	this.viewType = {
		normal : 0,
		highlight : 1
	}

	// Canvas
	this.canvas = null;
	this.context = null;
	
	// Data pointer
	this.people = null;
	this.nodes = null;
	this.links = null;
	this.tooltipPerson = null;
	this.highlightPerson = null;
	
	// View elements
	this.scale = 0;
	this.offset = {x: 0, y: 0};
	
	// Options
	this.viewMode = this.viewType.normal;
	this.color = null;
};

Canvas.prototype.Initialize = function(width, height, elemID)
{
	this.people = null;
	
	this.canvas = d3.select('#canvas');

	this.canvas.style("display","block")
	.attr("width", width)
    .attr("height", height);
	
	this.context = this.canvas.node().getContext('2d');
	
	this.scale = 0.5;
	this.color = d3.scale.category20();
}
Canvas.prototype.Destroy = function()
{
	this.people = null;

	if(this.canvas !== null)
	{
		this.canvas.style("display","none");
	}
	
	this.canvas = null;
	this.context = null;
};

Canvas.prototype.GetCanvas = function()
{
	return this.canvas;
}
Canvas.prototype.GetContext = function()
{
	return this.context;
}

Canvas.prototype.SetPeople = function(people)
{
	this.people = people;
}
Canvas.prototype.SetNodes = function(nodes)
{
	this.nodes = nodes;
}
Canvas.prototype.SetLinks = function(links)
{
	this.links = links;
}

Canvas.prototype.SetTooltipPerson = function(person)
{
	this.tooltipPerson = person;
}
Canvas.prototype.SetHighlightPerson = function(person)
{
	this.highlightPerson = person;
	
	if(person === null)
	{
		this.viewMode = this.viewType.normal;
	}
	else
	{
		this.viewMode = this.viewType.highlight;
	}
};

Canvas.prototype.Draw = function()
{
	var self = this;
	var canvas = this.canvas;
	var context = this.context;
	var nodes = this.nodes;
	var links = this.links;
	var color = this.color;
    
    context.clearRect(0,0, canvas.node().width, canvas.node().height);
    
    switch(this.viewMode)
    {
    	case this.viewType.normal:
    	{
    		for(var i in links)
			{
				this.DrawLink(links[i], function()
				{
					context.strokeStyle = "#000000";
					context.lineWidth = self.GetCanvasLength(2);
				});
			}
			
			for(var i in nodes)
			{
				this.DrawNode(nodes[i], function()
				{
					drawPersonFace(self, nodes[i].person);
				});
			}
    	}
    	break;
    	
    	case this.viewType.highlight:
    	{
			for(var i in nodes)
			{
				this.DrawNode(nodes[i], function()
				{
					drawPersonColor(self, nodes[i].person);
				});
			}
			
	    	var person = this.highlightPerson;
	    	var friends = person.GetFriends();
	    	
	    	for(var i in friends)
	    	{
	    		var friend = friends[i];
	    		var tempLink = 
	    		{
	    			source : person.GetData(),
	    			target : friend.GetData()
	    		};
	    		
	    		this.DrawLink(tempLink, function()
	    		{
	    			context.strokeStyle = "#000000";
					context.lineWidth = self.GetCanvasLength(2);
	    		});
	    	}
	    	
	    	for(var i in friends)
	   		{
				this.DrawPerson(friends[i], function(canvas, person)
				{
					drawPersonFace(canvas, person);
				});
	   		}
	    	
	    	this.DrawPerson(person, function(canvas, person)
	    	{
	    		drawPersonFace(canvas, person);
	    	});
	    	
			if(this.tooltipPerson !== null)
			{
				this.DrawPersonInformation(this.tooltipPerson);
			}

    	}
    	break;
    }
}
Canvas.prototype.DrawPersonInformation = function(person)
{
	var context = this.context;
	var canvas = this;
	
	var x = canvas.GetCanvasX(person.GetData().x);
	var y = canvas.GetCanvasY(person.GetData().y);
	var data = person.GetData();
	
	var infoWidth = 200;
	var infoHeight = 200;
	
	context.beginPath();
	
	context.moveTo(x - infoWidth / 2, y - 100);
	context.lineTo(x - infoWidth / 2, y - 100 - infoHeight);
	context.lineTo(x + infoWidth / 2, y - 100 - infoHeight);
	context.lineTo(x + infoWidth / 2, y - 100);
	context.lineTo(x - infoWidth / 2, y - 100);
	
	context.fillStyle = "#ABC";
	context.fill();
	
	context.font = "30px Consolas";
	context.fillStyle = "#000";
	context.fillText("Name : " + data.name, x - infoWidth / 2 + 10, y - 50 - infoHeight);
	
	context.closePath();
}
Canvas.prototype.DrawPerson = function(person, option)
{
	var self = this;
	var context = this.context;
	var color = this.color;
	var d = person.GetData();
	
	var x = self.GetCanvasX(d.x);
	var y = self.GetCanvasY(d.y);
	var r = self.GetCanvasLength(person.GetNode().node().getAttribute('r'));

	context.save();
	
	context.beginPath();
	context.arc(x, y, r, 0, 2 * Math.PI, false);

	if(typeof(option) == "function")
	{
		option(self, person);
	}
	
	context.stroke();
	context.closePath();
	
	context.restore();
}

Canvas.prototype.DrawNode = function(node, option)
{
	var person = node.person;
	this.DrawPerson(person, option);
}
Canvas.prototype.DrawLink = function(link, option)
{
	var self = this;
	var context = this.context;

	context.beginPath();
	context.moveTo(self.GetCanvasX(link.source.x), self.GetCanvasY(link.source.y));
	context.lineTo(self.GetCanvasX(link.target.x), self.GetCanvasY(link.target.y));
	
	if(typeof(option) == "function")
	{
		option();
	}
	context.stroke();
	context.closePath();
}

Canvas.prototype.SetScale = function(scale)
{
	scale = Math.max(0.1, scale);
	scale = Math.min(1.0, scale);
	this.scale = scale;
}

Canvas.prototype.GetScale = function()
{
	return this.scale;
}
Canvas.prototype.GetCanvasX = function(x)
{
	return (x + this.offset.x) * this.scale;
};
Canvas.prototype.GetCanvasY = function(y)
{
	return (y + this.offset.y) * this.scale;
};
Canvas.prototype.GetCanvasLength = function(length)
{
	return length * this.scale;
};

Canvas.prototype.GetRealX = function(canvasX)
{
	if(this.scale == 0)
	{
		return 0;
	}
	else
	{	
		return canvasX / this.scale - this.offset.x;
	}
};
Canvas.prototype.GetRealY = function(canvasY)
{
	if(this.scale == 0)
	{
		return 0;
	}
	else
	{	
		return canvasY / this.scale - this.offset.y;
	}
};
Canvas.prototype.GetRealLength = function(canvasLength)
{
	if(this.scale == 0)
	{
		return 0;
	}
	else
	{	
		return canvasLength / this.scale;
	}
};

Canvas.prototype.IsInner = function(person, mouseX, mouseY)
{
	var data = person.GetData();
	var r = person.GetNode().node().getAttribute('r');
	
	var relX = this.GetCanvasX(data.x);
	var relY = this.GetCanvasY(data.y);
	var relR = this.GetCanvasLength(r);
	
	if(Math.pow(mouseX - relX, 2) + Math.pow(mouseY - relY, 2) <= Math.pow(relR, 2))
	{
		return true;
	}
	else
	{
		return false;
	}
};

// Draw utility functions
var drawPersonFace = function(canvas, person)
{
	var context = canvas.context;
	var color = canvas.color;
	
	var d = person.GetData();
	
	if(d.imgDrawable === true)
	{
		var x = canvas.GetCanvasX(d.x);
		var y = canvas.GetCanvasY(d.y);
		var r = canvas.GetCanvasLength(person.GetNode().node().getAttribute('r'));
		var imgWidth = canvas.GetCanvasLength(d.img.width);
		var imgHeight = canvas.GetCanvasLength(d.img.height);
		
		context.lineWidth = canvas.GetCanvasLength(10);
		context.strokeStyle = color(d.group + 1);
		context.clip();
		context.drawImage(d.img, x - r, y - r, imgWidth, imgHeight);
//		context.fillStyle = "#DDDDDD";
//		context.fill();
	}
	else
	{
		drawPersonColor(canvas, person);
	}
};
var drawPersonColor = function(canvas, person)
{
	var context = canvas.context;
	var color = canvas.color;
	
	context.strokeStyle = color(person.GetData().group + 1);
	context.lineWidth = canvas.GetCanvasLength(2);
	context.fillStyle = "#DDDDDD";
	context.fill();
};