const express = require('express');
const router = express.Router();
const { getMeals, getMealById, addMeal, updateMeal, deleteMeal } = require('../../controllers/meals/index.js');

router.get('/', getMeals);
router.get('/:id', getMealById);
router.post('/', addMeal);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

module.exports = router;