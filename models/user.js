"use strict";

var https = require('https'),
    querystring = require('querystring');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        firstname:      DataTypes.STRING,
        lastname:       DataTypes.STRING,
        orig_address:   DataTypes.STRING,
        country:        DataTypes.STRING,
        state:          DataTypes.STRING,
        city:           DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                // Define model associations here.
            },
            add: function(firstname, lastname, address, cb) {
                // OpenStreetMap address search service
                console.log('Attempting user creation:', firstname, lastname, address);
                https.request({
                    host: 'nominatim.openstreetmap.org',
                    path: '/search?format=json&q=' + querystring.escape(address)
                }, function(response) {
                    debugger
                    var information = '';
                    response.on('data', function(data) {
                        information += data;
                    });
                    response.on('end', function() {
                        information = JSON.parse(information);

                        if (information.length == 0) {
                            cb({
                                message: 'Address cannot be parsed'
                            });
                        }

                        var googleHost = 'maps.googleapis.com',
                            googleAPIKey = 'AIzaSyANcjt4_BXgoeWEGJT-_lvLzaLiPpcwKz8',
                            queryURL = '/maps/api/geocode/json?key=' + googleAPIKey +
                                '&latlng=' + information[0].lat + ',' + information[0].lon;
                        // Google reverse geocode service
                        https.request({
                            host: googleHost,
                            path: queryURL
                        }, function(res) {
                            debugger
                            var incomingData = '';
                            res.on('data', function(data) {
                                incomingData += data;
                            });

                            res.on('end', function() {
                                incomingData = JSON.parse(incomingData);
                            });
                        }).end();
                    });
                }).end();
            }
        }
    });

    return User;
};
