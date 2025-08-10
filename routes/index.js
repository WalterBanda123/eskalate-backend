const express = require('express');
const mealsRouter = require('./meals');

const router = express.Router();

router.use('/meals', mealsRouter);

module.exports = router;


