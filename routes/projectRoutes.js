const express = require('express');
const Project = require('../models/Project');
const Location = require('../models/Location'); // Require to register schema to Mongoose
const User = require('../models/User'); // Require to register schema to Mongoose

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { energyType, status } = req.query;
    let filter = {};
    if (energyType) filter.energyType = energyType;
    if (status) filter.status = status;

    const projects = await Project.find(filter).populate('locationId').populate('createdBy', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  // Simplified for demo: no middleware used, user ID passed from strictly client side
  const { name, energyType, locationId, createdBy, capacityKW, pricePerKWh } = req.body;
  
  try {
    const lastProject = await Project.findOne().sort({ _id: -1 });
    let nextCount = 1;
    if (lastProject && lastProject._id && lastProject._id.startsWith('PRJ')) {
      nextCount = parseInt(lastProject._id.replace('PRJ', ''), 10) + 1;
    } else {
      nextCount = (await Project.countDocuments()) + 1;
    }
    const _id = `PRJ${String(nextCount).padStart(3, '0')}`;

    const newProject = new Project({
      _id,
      name,
      energyType,
      locationId,
      createdBy,
      capacityKW,
      pricePerKWh,
      status: 'active'
    });
    await newProject.save();
    res.json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProject) return res.status(404).json({ error: 'Project not found' });
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
