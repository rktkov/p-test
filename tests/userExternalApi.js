/**
 * Created by olegk on 01/08/2019.
 */

const expect = require('chai').expect;

const api = require('../lib/userApi');

describe("user External REST API", function() {

    it("get user with id=1 from API", function(done) {

        api.get_user("1", function(err, result){
            expect(err).to.be.null;
            console.log(result);
            expect(result.id).to.be.equal(1);
            done();
        });
    });

    it("get users from page 1 from API", function(done) {

        api.get_user_from_page(1, function(err, result){
            expect(err).to.be.null;
            console.log(result);
            expect(result.page).to.be.equal(1);
            done();
        });
    });
});