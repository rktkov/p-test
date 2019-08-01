/**
 * Created by olegk on 01/08/2019.
 */
const fs = require('fs');
const path = require('path');
const async = require('async');


function CronJobHistory(path_to_history_file, path_to_data_file) {
    this.path_to_history_file = path_to_history_file;
    this.path_to_data_file = path_to_data_file;

    this.pagesFetched = null;
    this.userIdsFetched = null;
    this.lastFetchedPage = -1;

    this.users = [];
}

//initialize cron job history to exclude previously readed users
CronJobHistory.prototype.init = function(startNew, callback) {
    //if history files not exist, initialize empty history
    if (!fs.existsSync(this.path_to_history_file) || !fs.existsSync(this.path_to_data_file)) {
        this.pagesFetched = {};
        this.userIdsFetched = {};
        this.lastFetchedPage = 0;

        this.users = [];

        //fs.closeSync(fs.openSync(this.path_to_history_file, 'w'));
        //fs.closeSync(fs.openSync(this.this.path_to_data_file, 'w'));

        return callback(null);
    }

    //if history files exist and history has to be removed, initialize empty history and delete history files
    if (startNew) {
        this.pagesFetched = {};
        this.userIdsFetched = {};
        this.lastFetchedPage = 0;

        this.users = [];

        fs.unlinkSync(this.path_to_history_file);
        fs.unlinkSync(this.path_to_data_file);

        //fs.closeSync(fs.openSync(this.path_to_history_file, 'w'));
        //fs.closeSync(fs.openSync(this.this.path_to_data_file, 'w'));

        return callback(null);
    }

    //if history files exist, restore object from files
    const data = fs.readFileSync(this.path_to_history_file);//, function (err, data) {
    //if (err)
    //    return callback(err);

    try {
        const history = JSON.parse(data);
        this.pagesFetched = history.pagesFetched;
        this.userIdsFetched = history.userIdsFetched;
        this.lastFetchedPage = history.lastFetchedPage;
    }
    catch (ex) {
        return callback(ex);
    }

    callback(null);
    //});
}

//flush current status of job history to files
CronJobHistory.prototype.flush = function(callback) {
    if (this.pagesFetched == null || this.userIdsFetched == null)
        return callback("history is not initialized");

    const history_json = {
        pagesFetched: this.pagesFetched,
        userIdsFetched: this.userIdsFetched,
        lastFetchedPage: this.lastFetchedPage
    };

    const new_users = JSON.stringify(this.users);

    const history_file = this.path_to_history_file;
    const users_file = this.path_to_data_file;

    const history = JSON.stringify(history_json);
    try {
        fs.writeFileSync(history_file, history);
        fs.appendFileSync(users_file, new_users);
        this.users = [];
        callback(null);
    }
    catch (ex) {
        callback(ex);
    }
}


//add new data from new page to history
CronJobHistory.prototype.readPage = function(data, callback) {
    if (this.pagesFetched == null || this.userIdsFetched == null)
        return callback("history is not initialized");

    if (this.pagesFetched.hasOwnProperty(data.page))
        return callback(null);

    if (data.data.length == 0) {
        return callback(null);
    }

    for (var i in data.data) {
        const user = data.data[i];
        if (this.userIdsFetched.hasOwnProperty(user.id))
            continue;

        this.users.push(user);
        this.userIdsFetched[user.id] = true;
    }

    this.pagesFetched[data.page] = true;
    this.lastFetchedPage = data.page;

    callback(null);
}

CronJobHistory.prototype.close = function(callback) {
    this.flush(function (err) {
        if (err)
            return callback(err);

        this.pagesFetched = null;
        this.userIdsFetched = null;

        this.users = [];
        callback(null);
    })
}

module.exports = CronJobHistory;