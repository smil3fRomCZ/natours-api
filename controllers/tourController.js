const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // BUILD query
    // 1) Filtering
    const queryObject = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObject[field]);

    // 2) Advanced filtering
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matchedString) => `$${matchedString}`
    );
    const query = Tour.find(JSON.parse(queryString));

    // EXECUTE query
    const tours = await query;
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({ status: 'Fail', message: error });
  }
};
exports.getTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    const tour = await Tour.findById(tourId);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({ status: 'fail', message: error });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'Fail', message: error });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    const updatedData = req.body;
    const tour = await Tour.findByIdAndUpdate(tourId, updatedData, {
      new: true,
    });
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (error) {
    res.status(400).json({ status: 'Fail', message: error });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    await Tour.findByIdAndDelete(tourId);
    res.status(204).json({
      status: 'Deleted',
    });
  } catch (error) {
    res.status(400).json({ status: 'Fail', message: error });
  }
};
