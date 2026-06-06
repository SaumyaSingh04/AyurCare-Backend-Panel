const express = require('express');
const router = express.Router();
const { getAll, getOne, update, remove } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/', auth, admin, getAll);
router.get('/:id', auth, getOne);
router.put('/:id', auth, update);
router.delete('/:id', auth, admin, remove);

module.exports = router;
