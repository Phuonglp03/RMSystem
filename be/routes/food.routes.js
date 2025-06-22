const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food.controller');

router.post('/', foodController.upload.array('images', 5), foodController.createFood);
router.put('/:id', foodController.upload.array('images', 5), foodController.updateFood);
router.delete('/:id', foodController.deleteFood);
router.get('/', foodController.getAllFoods);
router.get('/:id', foodController.getFoodById);

module.exports = router;