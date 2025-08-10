const express = require('express');
const router = express.Router();
const { getMeals, addMeal, updateMeal, deleteMeal } = require('../../controllers/meals/index.js');

router.get('/', getMeals);
router.post('/', addMeal);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

module.exports = router;