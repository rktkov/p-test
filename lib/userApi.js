/**
 * Created by olegk on 01/08/2019.
 */

const https = require('https');
const url = require('url');
const async = require('async');

const storage = require('../lib/imageStorage');

var host = '127.0.0.1';
var GET = "GET";
var POST = "POST";
var PUT = "PUT";
var DELETE = "DELETE";

var api_host = "https://reqres.in/";
var api_domain = "reqres.in";
var api_path_user = "/api/users/";

module.exports.get_user = function (user_id, callback){

    const path = url.resolve(api_path_user, user_id);

    const full_path = url.resolve(api_host, path);

    https.get(full_path, function(resp){

        if(resp.statusCode != 200)
            return callback(resp.statusMessage);

        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            data = JSON.parse(data);
            callback(null, data.data);
        });

    }).on("error", (err) => {
        return callback(err);
    });

}
module.exports.get_user_from_page = function (page, callback){

    let path = url.resolve(api_path_user, "?page=");
    path = path + page;

    var request = https.request(
        {
            host: api_domain,
            path: path,
            method: "GET"
        },
        function(resp) {
            if(resp.statusCode != 200)
                return callback(resp.statusMessage);

            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                data = JSON.parse(data);
                callback(null, data);
            });
        });
    request.on("error", function(err){
        return callback(err);
    });

    request.end();

}