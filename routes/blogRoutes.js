const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/blogController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', auth, admin, upload.single('image'), create);
router.put('/:id', auth, admin, update);
router.delete('/:id', auth, admin, remove);

module.exports = router;
