const express = require('express');
const router = express.Router();
const WorksModel = require('../models/worksModel'); // Adjust the path as needed
const authVerifyMiddleware = require('../authVerifyMiddleware');

// Create a new work
router.post('/', authVerifyMiddleware, (req, res) => {
    const { title, classNote, description, status, email } = req.body;

    // Create a new work instance using the WorksModel schema
    const newWork = new WorksModel({
      title,
      classNote,
      description,
      status,
      email,
});
newWork.save((err, savedWork) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to create a new work.' });
    }
    res.status(201).json({ message: 'Work created successfully', work: savedWork });
  });
});
// Read all works
router.get('/', (req, res) => {
    WorksModel.find({}, (err, works) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to fetch works.' });
        }
        res.status(200).json(works);
      });
});

// Read a specific work by ID
router.get('/:id', (req, res) => {
    const workId = req.params.id;

    WorksModel.findById(workId, (err, work) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch the work.' });
      }
      if (!work) {
        return res.status(404).json({ message: 'Work not found.' });
      }
      res.status(200).json(work);
    });
});

// Update a work by ID
router.put('/:id', authVerifyMiddleware, (req, res) => {
    const workId = req.params.id;
  const updateData = req.body; // Data to update

  WorksModel.findByIdAndUpdate(workId, updateData, { new: true }, (err, updatedWork) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to update the work.' });
    }
    res.status(200).json(updatedWork);
  });
});

// Delete a work by ID
router.delete('/:id', authVerifyMiddleware, (req, res) => {
    const workId = req.params.id;

    WorksModel.findByIdAndRemove(workId, (err, removedWork) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to delete the work.' });
      }
      res.status(200).json({ message: 'Work deleted successfully', work: removedWork });
    });
});

module.exports = router;
