const express = require('express');
const router = express.Router();
const controller = require('../controllers/announcementController');

router.get('/', controller.getAllAnnouncements);
router.get('/:id', controller.getAnnouncementById);
router.post('/', controller.createAnnouncement);
router.put('/:id', controller.updateAnnouncement);
router.delete('/:id', controller.deleteAnnouncement);

module.exports = router;
