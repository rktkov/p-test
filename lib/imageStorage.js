/**
 * Created by olegk on 01/08/2019.
 */
var fs = require('fs');
const path = require('path');


var storageIndex = {};

const storage_path = path.join(__dirname, '../_data');

function _add_image(id, data, callback){
    var path_to_file = path.join(storage_path, id);
    fs.writeFile(path_to_file, data, (err) => {
        if (err)
            return callback(err);

        console.log("file:" + path_to_file + " saved");
        callback(null, path_to_file);
    });
}

function _add_image_stream(id, stream, callback){
    var path_to_file = path.join(storage_path, id);

    var write_stream = fs.createWriteStream(path_to_file);

    write_stream.on("error", function(err){
        callback(err);
    });
    write_stream.on("finish", function(){
        console.log("file:" + path_to_file + " saved");
        callback(null, path_to_file);
    });

    stream.pipe(write_stream);
}

function _remove_image(id, callback){
    var path_to_file = path.join(storage_path, id);
    fs.unlink(path_to_file,
        function (err) {
            if (err) {
                console.log("file:" + path_to_file + " remove error:" + err);
                callback(err);

            }
            console.log("file:" + path_to_file + " removed");
            callback(null);
        });
}

function _get_image(id, callback){

    var path_to_file = path.join(storage_path, id);
    fs.readFile(path_to_file, (err, data) => {
        if (err)
            callback(err);

        callback(null, data);
    });
}

function _get_image_stream(id){
    var path_to_file = path.join(storage_path, id);
    var readStream = fs.createReadStream(path_to_file);

    return readStream;
}

function initialize(callback){

    if (!fs.existsSync(storage_path)){
        fs.mkdirSync(storage_path);
    }

    storageIndex = {};

    fs.readdir(storage_path, function(err, files){
        if(err) {
            return callback(err);
        }

        files.forEach(function(file) {
            storageIndex[file] = path.join(storage_path,file);
        });

        callback(null);

    });
}

function clear_storage() {

    fs.readdir(storage_path, function (err, files) {
        if (err) {
            console.log("storage directory read error during clean process");
        } else {

            files.forEach(function (file) {
                _remove_image(file,
                    function (err) {
                        if (err) {
                            console.log("file:" + file + " remove error:" + err);

                        }
                        console.log("file:" + file + " removed");
                    });
            });
        }
    });
}

function add_image(id, data, callback){

    var id_int = Number(id);
    if(isNaN(id_int))
        return callback("image id must be integer");

    id_int = parseInt(id);
    if(id_int < 0)
        return callback("image id must be positive integer");

    _add_image(id, data, function (err, file_path){
        if(err)
            return callback(err);

        storageIndex[id] = file_path;
        callback(null);
    });
}

function add_image_stream(id, stream, callback){
    var id_int = Number(id);
    if(isNaN(id_int))
        return callback("image id must be integer");

    id_int = parseInt(id);
    if(id_int < 0)
        return callback("image id must be positive integer");

    _add_image_stream(id, stream, function (err, file_path){
        if(err)
            return callback(err);

        storageIndex[id] = file_path;
        callback(null);
    });
}

function contains_image(id) {
    return storageIndex.hasOwnProperty(id);
}

function get_image(id, callback){
    if(!storageIndex.hasOwnProperty(id))
        return callback("image not exist");

    _get_image(id, callback);
}

function get_image_stream(id, callback){
    if(!storageIndex.hasOwnProperty(id))
        return callback("image not exist");

    try{
        const stream = _get_image_stream(id);
        callback(null, stream);
    }
    catch(ex){
        callback(ex.message, null);
    }
}

function remove_image(id, callback){
    if(!storageIndex.hasOwnProperty(id))
        return callback("image not exist");

    _remove_image(id, function(err){
        if(err)
            return callback(err);

        delete storageIndex[id];

        callback(null);
    })
}

module.exports.init = initialize;
module.exports.add = add_image;
module.exports.add_stream = add_image_stream;
module.exports.get = get_image;
module.exports.get_stream = get_image_stream;
module.exports.remove = remove_image;
module.exports.contains = contains_image;
module.exports.clear = clear_storage;