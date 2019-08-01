/**
 * Created by olegk on 01/08/2019.
 */

const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const http = require('http');

const start = require('../bin/www').listen;
const exit = require('../bin/www').exit;

const ip = "127.0.0.1";
const port = require('../bin/www').port;
const storage = require('../lib/imageStorage');

const test_avatar_path = path.join(__dirname, '_test_data', 'avatar_1');

describe("users REST API", function() {
    before(function(done) {
        storage.clear();
        start(function (err) {
            done();
        })
    });

    after(function(done) {
        exit();
        storage.clear();
        done();
    });

    //it("should return admin checker rights", function(done) {
    //    _sendRequest('/controller/security/checker', GET, null, adminCheckerRights, done, 'admin', 'admin');
    //});

    it("get user with 1 from API", function(done) {
        const path = "http://"+ip+":"+port+"/api/user/1";

        http.get(path, (resp) => {

            expect(resp.statusCode).to.be.equal(200);

            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                data = JSON.parse(data);

                console.log(data);
                expect(data).not.to.be.null;
                expect(data.id).to.be.equal(1);
                done();
            });

        }).on("error", (err) => {
            expect(true).to.be.false;
            done();
        });

    });

    it("get user with not number ID return 400 error", function(done) {
        const path = "http://"+ip+":"+port+"/api/user/asdfas";

        http.get(path, (resp) => {

            expect(resp.statusCode).to.be.equal(400);
            done();

        }).on("error", (err) => {
            expect(true).to.be.false;
            done();
        });

    });

    it("get user with negative number ID return 400 error", function(done) {
        const path = "http://"+ip+":"+port+"/api/user/-20";

        http.get(path, (resp) => {

            expect(resp.statusCode).to.be.equal(400);
            done();

        }).on("error", (err) => {
            expect(true).to.be.false;
            done();
        });

    });

    it("get user with id 1 avatar from URL", function(done) {
        const path = "http://"+ip+":"+port+"/api/user/1/avatar";

        http.get(path, (resp) => {

            expect(resp.statusCode).to.be.equal(200);

            var write_stream = fs.createWriteStream(test_avatar_path);

            write_stream.on("error", function (err) {
                expect(false).to.be.true;
                done();
            });
            write_stream.on("finish", function () {
                expect(true).to.be.true;
                done();
            });

            resp.pipe(write_stream);

        }).on("error", (err) => {
            expect(true).to.be.false;
            done();
        });

    });

    it("get user with id 1 avatar from storage", function(done) {
        const path = "http://"+ip+":"+port+"/api/user/1/avatar";

        http.get(path, (resp) => {

            expect(resp.statusCode).to.be.equal(200);

            var write_stream = fs.createWriteStream(test_avatar_path);

            write_stream.on("error", function (err) {
                expect(false).to.be.true;
                done();
            });
            write_stream.on("finish", function () {
                expect(true).to.be.true;
                done();
            });

            resp.pipe(write_stream);

        }).on("error", (err) => {
            expect(true).to.be.false;
            done();
        });

    });

    it("remove user avatar with id 1 from storage", function(done) {
        //const path = "http://"+ip+":"+port+"/api/user/1/avatar";

        var request = http.request(
            {
                host: '127.0.0.1',
                port: 3000,
                path: '/api/user/1/avatar',
                method: 'DELETE'
            },
            function(resp) {
                expect(resp.statusCode).to.be.equal(200);
                done();
            });
        request.on("error", function(err){
            expect(true).to.be.false;
            done();
        });

        request.end();
    });

    it("remove user avatar with id 1 from storage return 404 error", function(done) {
        var request = http.request(
            {
                host: '127.0.0.1',
                port: 3000,
                path: '/api/user/1/avatar',
                method: 'DELETE'
            },
            function(resp) {
                expect(resp.statusCode).to.be.equal(404);
                done();
            });
        request.on("error", function(err){
            expect(true).to.be.false;
            done();
        });

        request.end();

    });

    it("remove user avatar with not number ID return 400 error", function(done) {
        var request = http.request(
            {
                host: '127.0.0.1',
                port: 3000,
                path: '/api/user/asfasd/avatar',
                method: 'DELETE'
            },
            function(resp) {
                expect(resp.statusCode).to.be.equal(400);
                done();
            });
        request.on("error", function(err){
            expect(true).to.be.false;
            done();
        });

        request.end();
    });

    it("remove user avatar with negative number ID return 400 error", function(done) {
        var request = http.request(
            {
                host: '127.0.0.1',
                port: 3000,
                path: '/api/user/-20/avatar',
                method: 'DELETE'
            },
            function(resp) {
                expect(resp.statusCode).to.be.equal(400);
                done();
            });
        request.on("error", function(err){
            expect(true).to.be.false;
            done();
        });

        request.end();

    });
});