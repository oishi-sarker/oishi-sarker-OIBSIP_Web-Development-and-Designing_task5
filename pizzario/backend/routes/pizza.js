import express from 'express';
import { getPizzas, getPizzaById, createPizza, updatePizza, deletePizza } from '../controllers/pizzaController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPizzas);
router.get('/:id', getPizzaById);
router.post('/', protect, adminOnly, createPizza);
router.put('/:id', protect, adminOnly, updatePizza);
router.delete('/:id', protect, adminOnly, deletePizza);

export default router;
