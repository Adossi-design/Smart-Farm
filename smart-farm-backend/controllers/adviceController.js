const { Advice, User } = require('../models');

exports.getAdvice = async (req, res) => {
  try {
    const advice = await Advice.findAll({
      include: [{ model: User, as: 'author', attributes: ['name'] }],
      order: [['date', 'DESC']]
    });
    res.json(advice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAdvice = async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const advice = await Advice.create({
      title,
      category,
      content,
      image,
      authorId: req.user.id,
      date: new Date()
    });

    res.status(201).json(advice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyAdvice = async (req, res) => {
  try {
    const advice = await Advice.findAll({ where: { authorId: req.user.id } });
    res.json(advice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};