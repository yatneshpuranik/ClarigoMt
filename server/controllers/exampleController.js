import Example from '../models/exampleModel.js';

// @desc    Get all examples
// @route   GET /api/examples
export const getExamples = async (req, res) => {
  try {
    const examples = await Example.find();
    res.status(200).json(examples);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an example
// @route   POST /api/examples
export const createExample = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide title and description' });
    }
    const example = await Example.create({ title, description });
    res.status(201).json(example);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
