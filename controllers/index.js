/*
 * GET home page.
 */

exports.index = function(req, res)
{
	res.render('index', {title : "boo"});
};
exports.test = function(req,res)
{
	res.render('test');
}