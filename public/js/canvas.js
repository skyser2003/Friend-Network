var Canvas = function()
{
	this.canvas = null;
	this.context = null;
	
	// Data pointer
	this.people = null;
	this.link = null;
	
	// View elements
	this.scale = 0;
	this.offset = {x: 0, y: 0};
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
Canvas.prototype.SetLink = function(link)
{
	this.link = link;
}

Canvas.prototype.Draw = function(nodes, links)
{
	var self = this;
	var canvas = this.canvas;
	var context = this.context;
	
	var color = d3.scale.category20();
    
    context.clearRect(0,0, canvas.node().width, canvas.node().height);
	
	for(var i in links)
	{
		var d = links[i];

		context.beginPath();
		context.strokeStyle = "#000000";
		context.lineWidth = self.GetCanvasLength(2);
		context.moveTo(self.GetCanvasX(d.source.x), self.GetCanvasY(d.source.y));
		context.lineTo(self.GetCanvasX(d.target.x), self.GetCanvasY(d.target.y));
		context.stroke();
	}
	
	for(var i in nodes)
	{
		var d = nodes[i];
		var person = d.person;
		
		var x = self.GetCanvasX(d.x);
		var y = self.GetCanvasY(d.y);
		var r = self.GetCanvasLength(person.GetNode().node().getAttribute('r'));
		var imgWidth = self.GetCanvasLength(d.img.width);
		var imgHeight = self.GetCanvasLength(d.img.height);

		context.save();
		
		context.beginPath();
		context.lineWidth = self.GetCanvasLength(10);
		context.strokeStyle = color(d.group);
		context.arc(x, y, r, 0, 2 * Math.PI, false);
		context.clip();
		context.drawImage(d.img, x - r, y - r, imgWidth, imgHeight);
		context.stroke();
		context.closePath();
		
		context.restore();
	}
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