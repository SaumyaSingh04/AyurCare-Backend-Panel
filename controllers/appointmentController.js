const Appointment = require('../models/Appointment');

exports.getAll = async (req, res) => {
  const appointments = await Appointment.find().populate('user', 'name email');
  res.json(appointments);
};

exports.getMyAppointments = async (req, res) => {
  const appointments = await Appointment.find({ user: req.user.id });
  res.json(appointments);
};

exports.create = async (req, res) => {
  try {
    const appointment = await Appointment.create({ ...req.body, user: req.user.id });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
