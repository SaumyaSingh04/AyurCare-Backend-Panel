const express = require('express');
const router = express.Router();
const { getAll, getMyAppointments, create, update, remove } = require('../controllers/appointmentController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/', auth, admin, getAll);
router.get('/my', auth, getMyAppointments);
router.post('/', auth, create);
router.put('/:id', auth, admin, update);
router.delete('/:id', auth, admin, remove);

module.exports = router;
