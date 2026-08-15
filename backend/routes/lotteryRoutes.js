const express = require('express');
const router = express.Router();
const controller = require('../controllers/lotteryController');

router.get('/', controller.getAllResults);
router.get('/search', controller.searchResults);
router.get('/status', controller.getStatus);
router.post('/refresh', controller.refreshResults);
router.get('/:id', controller.getResultById);
router.post('/', controller.createResult);
router.put('/:id', controller.updateResult);
router.delete('/:id', controller.deleteResult);

module.exports = router;
