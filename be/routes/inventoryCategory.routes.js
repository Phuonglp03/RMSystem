const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories } = require('../controllers/inventoryCategory.controller');

router.post('/', createCategory);       // POST /api/categories
router.get('/', getAllCategories);      // GET /api/categories

module.exports = router;
