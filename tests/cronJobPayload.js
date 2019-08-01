/**
 * Created by olegk on 01/08/2019.
 */

const expect = require('chai').expect;

const cronJob = require('../cron/cronPayload');

describe("cron pauload API", function() {

    before(function(done) {
        cronJob.initHistory(function(err){
            if(err)
                throw err;
            done();
        })
    });

    after(function(done) {
        cronJob.closeHistory(function(err){
                done();
            });
    });

    it("do job for page 1", function(done) {
        cronJob.doJob(function(err){
            expect(err).to.be.null;
            done();
        });
    });

    it("do job for page 2", function(done) {
        cronJob.doJob(function(err){
            expect(err).to.be.null;
            done();
        });
    });
});