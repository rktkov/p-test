var express = require('express');
var handlers = require('../handlers/user');
var router = express.Router();

/* GET user by ID. */
router.get('/:userId', function(req, res, next) {
  handlers.get_user(req, res);
});

/* GET user avatar by ID. */
router.get('/:userId/avatar', function(req, res, next) {
  handlers.get_user_image(req, res);
});

/* DELETE user avatar by ID. */
router.delete('/:userId/avatar', function(req, res, next) {
  handlers.remove_user_image(req, res);
});

module.exports = router;
