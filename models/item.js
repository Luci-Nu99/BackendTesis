const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  nombre: { type: String, unique: true },
  imagen: String,
  videos: {
    opcion: String,
    labial: String,
    tactil: String
  }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
