const express = require('express');
const mealsRouter = require('./meals');
const restaurantRouter = require('./restaurant');

const router = express.Router();

router.use('/meals', mealsRouter);
router.use('/restaurants', restaurantRouter);

module.exports = router;


