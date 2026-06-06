const Blog = require('../models/Blog');

exports.getAll = async (req, res) => {
  const blogs = await Blog.find().populate('author', 'name');
  res.json(blogs);
};

exports.getOne = async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'name');
  if (!blog) return res.status(404).json({ message: 'Not found' });
  res.json(blog);
};

exports.create = async (req, res) => {
  try {
    const blog = await Blog.create({ ...req.body, author: req.user.id, image: req.file?.path });
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(blog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
