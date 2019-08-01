/**
 * Created by olegk on 01/08/2019.
 */
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');
const storage = require('../lib/imageStorage');

const test_data1_path = path.join(__dirname, '_test_data', 'test1');
const test_data2_path = path.join(__dirname, '_test_data', 'test2');

const test_data10_path = path.join(__dirname, '_test_data', 'test10');

const test_data1 = fs.readFileSync(test_data1_path);
const test_data2 = fs.readFileSync(test_data2_path);

describe("image storage API", function() {
    before(function(done) {
        storage.clear();
        storage.init(function (err) {
            done();
        });

    });

    after(function(done) {
        storage.clear();
        done();
    });

    //it("should return admin checker rights", function(done) {
    //    _sendRequest('/controller/security/checker', GET, null, adminCheckerRights, done, 'admin', 'admin');
    //});

    it("should add file 1 to storage", function(done) {
        storage.add("1", test_data1, function(err){
            expect(err).to.be.null;
            done();
        })
    });

    it("should add file 2 to storage", function(done) {
        storage.add("2", test_data2, function(err){
            expect(err).to.be.null;
            done();
        })
    });

    it("should add file 10 to storage as stream", function(done) {

        var file_stream = fs.createReadStream(test_data1_path);

        storage.add_stream("10", file_stream, function(err){
            expect(err).to.be.null;
            done();
        })
    });

    it("should add new file image to storage if file with same id exist", function(done) {
        storage.add("1", test_data2, function(err){
            expect(err).to.be.null;
            done();
        })
    });

    it("should return error if file id has wrong type - not number", function(done) {
        storage.add("asdfasdf", test_data1, function(err){
            expect(err).not.to.be.null;
            done();
        })
    });

    it("should return error if file id has wrong type - negative number", function(done) {
        storage.add("-1", test_data1, function(err){
            expect(err).not.to.be.null;
            done();
        })
    });

    it("should get 2 files from storage", function(done) {
        storage.get("1", function(err, data){
            expect(err).to.be.null;
            expect(data).not.to.be.null;

            storage.get("2", function(err, data) {
                expect(err).to.be.null;
                expect(data).not.to.be.null;

                done();
            });
        })
    });

    it("should get 10 file from stream", function(done) {

        var write_stream = fs.createWriteStream(test_data10_path);

        write_stream.on("error", function (err) {
            expect(false).to.be.true;
            done();
        });
        write_stream.on("finish", function () {
            expect(true).to.be.true;
            done();
        });

        storage.get_stream("10", function (err, stream) {
            expect(err).to.be.null;
            expect(stream).not.to.be.null;

            stream.pipe(write_stream);
        });
    });

    it("should return error if file with id not exist in storage", function(done) {
        storage.get("3", function(err, data){
            expect(err).not.to.be.null;
            expect(data).to.be.undefined;
            done();
        })
    });


    it("should return true if file with id exist in storage", function(done) {
        expect(storage.contains("1")).to.be.true;
        expect(storage.contains("2")).to.be.true;
        done();

    });

    it("should return false if file with id exist not in storage", function(done) {
        expect(storage.contains("3")).to.be.false;
        expect(storage.contains("4")).to.be.false;
        done();

    });

    it("should initialize storage", function(done) {
        storage.init(function(err){
            expect(err).to.be.null;

            expect(storage.contains("1")).to.be.true;
            expect(storage.contains("2")).to.be.true;
            done();
        });


    });

    it("should remove file from storage", function(done) {
        storage.remove("1", function(err){
            expect(err).to.be.null;

            expect(storage.contains("1")).to.be.false;
            done();
        })
    });

    it("should return error if try to remove file not existing in storage", function(done) {
        storage.remove("1", function(err){
            expect(err).not.to.be.null;

            expect(storage.contains("1")).to.be.false;
            done();
        })
    });
});