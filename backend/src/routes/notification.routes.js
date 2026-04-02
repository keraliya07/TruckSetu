const router = require('express').Router();

const controller = require('../controllers/notification.controller');

router.get('/', controller.getAll);
router.patch('/:id/read', controller.markRead);
router.post('/read-all', controller.markAllRead);

module.exports = router;
