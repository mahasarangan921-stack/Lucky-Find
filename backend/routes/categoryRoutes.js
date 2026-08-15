const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');

router.get('/', controller.getAllCategories);
router.get('/:id', controller.getCategoryById);
router.post('/', controller.createCategory);
router.put('/:id', controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

module.exports = router;
