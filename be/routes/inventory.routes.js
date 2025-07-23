const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  restockInventory,
  createIngredientWithInventory,
  updateQuantity
} = require('../controllers/inventory.controller');

router.get('/', getAllInventory);
router.post('/restock', restockInventory);
router.post('/create-with-ingredient', createIngredientWithInventory);
router.put('/:id', updateQuantity);


module.exports = router;
