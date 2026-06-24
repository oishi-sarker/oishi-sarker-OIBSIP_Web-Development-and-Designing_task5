import Pizza from '../models/Pizza.js';

/**
 * Get all available pizzas (public).
 */
export const getPizzas = async (req, res) => {
  try {
    const filter = {};
    if (req.query.available === 'true') filter.isAvailable = true;
    const pizzas = await Pizza.find(filter).sort({ rating: -1, createdAt: -1 });
    res.json(pizzas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get a single pizza by id (public).
 */
export const getPizzaById = async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) return res.status(404).json({ message: 'Pizza not found' });
    res.json(pizza);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create a new pizza (admin only).
 */
export const createPizza = async (req, res) => {
  try {
    const pizza = await Pizza.create(req.body);
    res.status(201).json(pizza);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Update pizza (admin only).
 */
export const updatePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pizza) return res.status(404).json({ message: 'Pizza not found' });
    res.json(pizza);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Delete pizza (admin only).
 */
export const deletePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);
    if (!pizza) return res.status(404).json({ message: 'Pizza not found' });
    res.json({ message: 'Pizza deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
