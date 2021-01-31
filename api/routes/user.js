const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const userController = require('../controllers/users');

router.get('/', checkAuth, userController.users_find_all);
router.get('/:id', checkAuth, userController.user_get_single);
router.post('/signup', userController.user_sign_up);
router.post('/login', userController.user_log_in);
router.delete('/:id', checkAuth, userController.user_delete_single);

module.exports = router;
