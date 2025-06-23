const express = require('express');
const router = express.Router();
const {
    getAllTables,
   
} = require('../controllers/table.controller');


router.get('/all', getAllTables);                   

module.exports = router; 