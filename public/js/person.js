var Person = function()
{
	this.node = null;
	this.friendList = [];
};

Person.prototype.Initialize = function(node)
{
	this.node = node;
	node.data()[0].person = this;
};
Person.prototype.AddFriend = function(person)
{
	this.friendList.push(person);
};

Person.prototype.GetNode = function()
{
	return this.node;
};
Person.prototype.GetData = function()
{
	return this.node.data()[0];
};
Person.prototype.GetUid = function()
{
	return node.data()[0].uid;
};
Person.prototype.GetFriends = function()
{
	return this.friendList;
}
