'use strict';

var _ = require('underscore');

var service = {
	sendJsonResponse: sendJsonResponse,
	indexOf: indexOf,
	getJsonFromFile: getJsonFromFile,
    jsonifyQuery: jsonifyQuery
};

module.exports = service;

function sendJsonResponse(res, status, content) {
	res.status(status);
	res.json(content);
}

function indexOf(arr, param, value) {
	return _.chain(arr).pluck(param).indexOf(value).value();
}

function getJsonFromFile(file) {
    var fs 	= require('fs');
    var json = getConfig(file);

    return json;

    function readJsonFileSync(filepath, encoding) {
        if (typeof (encoding) === 'undefined') {
            encoding = 'utf8';
        }
        var file = fs.readFileSync(filepath, encoding);
        return JSON.parse(file);
    }

    function getConfig(file) {
        var filepath = __dirname + file;
        return readJsonFileSync(filepath);
    }
}

// turn query string into JSON object
function jsonifyQuery(string) {
    var attrs = string.split('&');
    var keys = [];
    var values = [];

    _.each(attrs, function(elem, index, arr) {
        var split = elem.split('=');
        keys.push(split[0]);
        values.push(split[1]);
    });

    return _.object(keys, values);
}
