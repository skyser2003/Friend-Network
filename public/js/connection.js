var Connection = function()
{
	this.weight = 0.0;
	this.person1 = null;
	this.person2 = null;
};

Connection.prototype.SetVertices = function(person1, person2)
{
	this.person1 = person1;
	this.person2 = person2;
}