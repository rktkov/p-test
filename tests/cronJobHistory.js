/**
 * Created by olegk on 01/08/2019.
 */

const expect = require('chai').expect;
const async = require('async');
const fs = require('fs');
const path = require('path');

const api = require('../cron/cronJobHistory');
const cronJob = require('../cron/cronPayload');

const test_cron_job_path_to_history = path.join(__dirname, '_test_data', 'cron_history');
const test_cron_job_path_to_users = path.join(__dirname, '_test_data', 'cron_users');

let history = new api(test_cron_job_path_to_history, test_cron_job_path_to_users);

let page1 = {
    page: 1,
    data:[
        {
            id:1
        },
        {
            id:2
        }
    ]
};

let page2 = {
    page: 2,
    data:[
        {
            id:3
        },
        {
            id:4
        }
    ]
};

let page3 = {
    page: 3,
    data:[
        {
            id:5
        },
        {
            id:6
        }
    ]
};

let page4 = {
    page: 4,
    data:[
        {
            id:1
        },
        {
            id:7
        }
    ]
};

describe("cron history API", function() {

    before(function(done) {
        history.init(true, function(err){
            if(err)
                throw err;
            done();
        })
    });

    after(function(done) {
        async.waterfall([
                //function(callback){
                //    history.close(callback);
                //},
                function(callback){
                    fs.unlink(test_cron_job_path_to_history,
                        function (err) {
                            if (err) {
                                console.log("file:" + test_cron_job_path_to_history + " remove error:" + err);
                                callback(err);

                            }
                            console.log("file:" + test_cron_job_path_to_history + " removed");
                            callback(null);
                        });
                },
                function(callback){
                    fs.unlink(test_cron_job_path_to_users,
                        function (err) {
                            if (err) {
                                console.log("file:" + test_cron_job_path_to_users + " remove error:" + err);
                                callback(err);

                            }
                            console.log("file:" + test_cron_job_path_to_users + " removed");
                            callback(null);
                        });
                }
            ],
            function(err, callback){
                done();
            });
    });

    it("add page 1 to history", function(done) {

        history.readPage(page1, function(err){
            expect(err).to.be.null;
            expect(history.users.length).to.be.equal(2);
            done();
        })
    });

    it("add page 1 to history again", function(done) {

        history.readPage(page1, function(err){
            expect(err).to.be.null;
            expect(history.users.length).to.be.equal(2);
            done();
        })
    });

    it("add page 2 to history", function(done) {

        history.readPage(page2, function(err){
            expect(err).to.be.null;
            expect(history.users.length).to.be.equal(4);
            done();
        });
    });

    it("flush history to files", function(done) {
        history.flush(  function(err){
            expect(err).to.be.null;
            expect(history.users.length).to.be.equal(0);
            done();
        });
    });

    it("add page 1 to history again after flush", function(done) {
        history.readPage(page1, function(err){
            expect(err).to.be.null;
            expect(history.users.length).to.be.equal(0);
            done();
        });
    });

    it("add page 4 to history with user already saved in the past", function(done) {
        history.readPage(page4, function(err){
            expect(err).to.be.null;
            expect(history.users.length).to.be.equal(1);
            done();
        });
    });

    it("close history", function(done) {
        history.close(function(err){
            expect(err).to.be.null;
            expect(history.users.length).to.be.equal(0);
            done();
        });
    });

    it("init history after close", function(done) {
        history.init(false, function(err){
            expect(err).to.be.null;
            expect(history.pagesFetched).not.to.be.null;
            expect(history.userIdsFetched).not.to.be.null;

            expect(history.pagesFetched.hasOwnProperty("4")).to.be.true;

            done();
        });
    });

    it("add page 1 to history after close", function(done) {

        history.readPage(page1, function(err){
            expect(err).to.be.null;
            expect(history.users.length).to.be.equal(0);
            done();
        })
    });
});