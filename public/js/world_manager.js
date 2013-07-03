var WorldManager = function()
{
	this.world = null;
};

WorldManager.prototype.Initialize = function()
{
	this.world = new b2World(new b2Vec2(0,10), true);
}