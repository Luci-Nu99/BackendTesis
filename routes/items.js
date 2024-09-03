
const express = require('express');
const router = express.Router();
const Item = require('../models/item');



router.post('/items', async (req, res, next) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).send(newItem);
  } catch (error) {
    next(error);
  }
});


router.get('/items', async (req, res, next) => {
  try {
    const items = await Item.find();
    res.send(items);
  } catch (error) {
    next(error);
  }
});



router.get('/items/:idOrNombreUnico', async (req, res, next) => {
  try {
    const item = await Item.findOne({ $or: [{ _id: req.params.idOrNombreUnico }, { nombre: req.params.idOrNombreUnico }] });
    if (!item) {
      return res.status(404).send({ message: 'Item not found' });
    }
    res.send(item);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
