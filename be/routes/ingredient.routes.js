const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.find().sort({ createdAt: -1 });
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy nguyên liệu' });
  }
});

module.exports = router;
