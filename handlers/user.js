/**
 * Created by olegk on 01/08/2019.
 */

const https = require('https');
const url = require('url');
const async = require('async');

const storage = require('../lib/imageStorage');
const userApi = require('../lib/userApi');

var host = '127.0.0.1';
var GET = "GET";
var POST = "POST";
var PUT = "PUT";
var DELETE = "DELETE";

var api_host = "https://reqres.in/";
var api_path = "/api/users/";

function _get_user_id(req, res){

    const user_id = req.params.userId;

    var id_int = Number(user_id);
    if(isNaN(id_int)) {
        res.status(400).send("image id must be integer").end();
        return null;
    }

    id_int = parseInt(user_id);
    if(id_int < 0) {
        res.status(400).send("image id must be positive integer").end();
        return null;
    }

    return user_id;
}

function _get_avatar_from_url(url, callback){
    const request = https.get(url, function(resp) {
        return callback(null, resp);
    });

    request.on('error', function(err) {
        callback(err, null);
    });
}

function get_user(req, res){
    const user_id = _get_user_id(req, res);

    if(user_id == null) return;

    userApi.get_user(user_id, function(err, result){
        if(err)
            return res.status(500).send(err).end();

        res.status(200).send(result).end();
    });
}

function get_user_image(req, res){
    const user_id = _get_user_id(req, res);

    if(user_id == null) return;

    //check if avatar with user_id exist
    if (storage.contains(user_id)){
        storage.get_stream(user_id, function(err, stream){
            if(err)
                return res.status(500).send(err).end();

            stream.pipe(res);
        })
        return;
    }

    async.waterfall([
            //get user data from api
            function(callback){
                userApi.get_user(user_id, callback);
            },
            //get user avatar stream from url
            function(result, callback){
                const avatar_url = result.avatar;

                _get_avatar_from_url(avatar_url, callback);
            },
            //save new user avataro to storage
            function(stream, callback){
                storage.add_stream(user_id, stream, callback);
            },
            //return new user avatar from storage to client
            function(callback){
                storage.get_stream(user_id, callback);
            }
        ],
    function(err, stream){
        if(err)
            return res.status(500).send(err).end();

        stream.pipe(res);
    });
}

function remove_user_image(req, res){
    const user_id = _get_user_id(req, res);

    if(user_id == null) return;

    //check if avatar with user_id exist
    if (!storage.contains(user_id))
        return res.status(404).send("image for id:" + user_id + " not found in storage").end();

    storage.remove(user_id, function(err){
        if(err)
            return res.status(500).send(err).end();

        res.status(200).send("image for id:" + user_id + " removed from storage").end();
    })
}

module.exports.get_user = get_user;
module.exports.get_user_image = get_user_image;
module.exports.remove_user_image = remove_user_image;