var express = require('express'),
    router = express.Router(),
    models = require('../models');

/* GET users listing. */
router.get('/', function(req, res) {
    res.render('user_search', {
        title: 'User Search'
    });
});

/* GET Users based on search parameters */
router.get('/search', function(req, res) {
    if (!req.xhr)
        return res.status(403).send('Unauthorised');
    if (!req.param('searchTerm') || !req.param('mode'))
        return res.status(400).send('Bad Request');

    var searchMode = req.param('mode'),
        searchTerm = req.param('searchTerm');
    models.User.findAll({
        where: searchMode + " LIKE '%" + searchTerm + "%'"
    }).success(function(results) {
        return res.status(200).json({
            success: true,
            results: results
        });
    }).error(function(err) {
        return res.status(400).json({
            success: false,
            error: err
        });
    });
});

/* GET User add page */
router.get('/add', function(req, res) {
    res.render('add_user', {
        title: 'Add User'
    });
});

/* POST Receive user information and create new user */
router.post('/add_user', function(req, res) {
    var firstname   = req.param('firstname').toString('utf-8'),
        lastname    = req.param('lastname').toString('utf-8'),
        address     = req.param('address').toString('utf-8');

    models.User.add(firstname, lastname, address, function(err, obj) {
        if (err)
            return res.status(400).json({
                success: false,
                message: err.message
            });

        // Success happened
        return res.status(200).json({
            success: true,
            object: obj
        });
    });
});

module.exports = router;
