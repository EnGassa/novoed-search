"use strict";

var https = require('https'),
    querystring = require('querystring'),
    _ = require('underscore');

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
                https.request({
                    host: 'nominatim.openstreetmap.org',
                    path: '/search?format=json&q=' + querystring.escape(address)
                }, function(response) {
                    var osmLocationInfo = '';
                    response.on('data', function(data) {
                        osmLocationInfo += data;
                    });
                    response.on('end', function() {
                        osmLocationInfo = JSON.parse(osmLocationInfo);

                        if (osmLocationInfo.length == 0) {
                            return cb({
                                message: 'Address cannot be parsed'
                            });
                        }

                        var googleHost = 'maps.googleapis.com',
                            googleAPIKey = 'AIzaSyANcjt4_BXgoeWEGJT-_lvLzaLiPpcwKz8',
                            queryURL = '/maps/api/geocode/json?key=' + googleAPIKey +
                                '&result_type=locality' +
                                '&latlng=' +
                                osmLocationInfo[0].lat + ',' + osmLocationInfo[0].lon;

                        // Google reverse geocode service
                        https.request({
                            host: googleHost,
                            path: queryURL
                        }, function(res) {
                            var gLocationData = '';
                            res.on('data', function(data) {
                                gLocationData += data;
                            });

                            res.on('end', function() {
                                gLocationData = JSON.parse(gLocationData);
                                var gCountry = null,
                                    gState = null,
                                    gCity = null;
                                try {
                                    if(gLocationData['status'] == 'OK') {
                                        gCountry = _.find(gLocationData['results'][0]['address_components'], function(addr) {
                                            return _.contains(addr['types'], 'country');
                                        });
                                        gState = _.find(gLocationData['results'][0]['address_components'], function(addr) {
                                            return _.contains(addr['types'], 'administrative_area_level_1');
                                        });
                                        gCity = _.find(gLocationData['results'][0]['address_components'], function(addr) {
                                            return _.contains(addr['types'], 'locality');
                                        });
                                    } else {
                                        throw "Location unparseable"
                                    }
                                } catch (err) {
                                    return cb({
                                        success: false,
                                        message: err
                                    });
                                }

                                User.create({
                                    firstname: firstname,
                                    lastname: lastname,
                                    orig_address: address,
                                    country: gCountry['long_name'],
                                    state:gState['long_name'],
                                    city: gCity['long_name']
                                }).success(function(userCreated) {
                                    cb(null, userCreated);
                                }).error(function(error) {
                                    cb({
                                        success: false,
                                        message: error
                                    });
                                });

                            });
                        }).end();
                    });
                }).end();
            }
        }
    });

    return User;
};
