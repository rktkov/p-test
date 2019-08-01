/**
 * Created by olegk on 01/08/2019.
 */
const path = require('path');
const fs = require('fs');
const async = require('async');
const userApi = require('../lib/userApi');
const historyApi = require('./cronJobHistory');
const CronJob = require('cron').CronJob;

let cronjob = null;

const cron_job_dir = path.join(__dirname, '../_cron_data');

if (!fs.existsSync(cron_job_dir)){
    fs.mkdirSync(cron_job_dir);
}

const cron_job_path_to_history = path.join(__dirname, '../_cron_data', 'cron_history');
const cron_job_path_to_users = path.join(__dirname, '../_cron_data', 'cron_users');

let history = new historyApi(cron_job_path_to_history, cron_job_path_to_users);

//get next page and update user list
function doJob(jobCallback){
    if(cronjob)
        cronjob.stop();

    const pageId = history.lastFetchedPage + 1;
    async.waterfall([
            //get next page from api
            function(callback){
                console.log("cron: getting user list for page:" + pageId + " started");
                userApi.get_user_from_page(pageId, callback);
            },
            //check and add page data to history
            function(pageData, callback){
                history.readPage(pageData, callback);
            },
            //flush history to file
            function(callback){
                history.flush(callback);
            }
        ],
        function(err){

            if(cronjob)
                cronjob.start();

            if(err){
                console.log("cron: error getting user list for page:" + pageId + " err:" + JSON.stringify(err));
                jobCallback(err);
            }
            else{
                console.log("cron: getting user list for page:" + pageId + " finished");
                jobCallback(null);
            }
        }
    );

}

//start monitoring users list page
function recreateAndStartCronJob() {
    history.init(false, function(err){
        if(err){
            console.log("cron: history init error:" + err);
            return;
        }

        console.log("cron: start to monitor user pages");
        if (cronjob) {
            cronjob.stop();
        }
        //run job every minute
        const cronTime = '* * * * *';
        cronjob = new CronJob(
            cronTime,
            function () {
                doJob(function(err){
                    //add error to log or notification system!!!
                });
            }
        );
        cronjob.start();
        console.log("cron: monitor job started");
    })

}

if (process.env.IS_TEST) {
    module.exports.doJob = doJob;
    module.exports.initHistory = function(callback){
        history.init(true, callback);
    }
    module.exports.closeHistory = function(cb){
        async.waterfall([
                function(callback){
                    history.close(callback);
                },
                function(callback){
                    fs.unlink(cron_job_path_to_history, callback);
                },
                function(callback){
                    fs.unlink(cron_job_path_to_users, callback);
                }
            ],
            function(err){
                cb(err);
            });
    }
}

module.exports.start_job = recreateAndStartCronJob;
module.exports.stop_job = function(){
    if(cronjob) {
        cronjob.stop();
        console.log("cron: monitor job stopped");
        history.close(function(err){
            if(err)
                console.log("cron: history close error:" + err);
            else
                console.log("cron: history closed");
        });
    }
};