// models/Presentar.js

const mongoose = require('mongoose');

const presentarSchema = new mongoose.Schema({
  imagen: String,
  nombre: String,
  titulos: [
    { titulo: String, video: String },
    { titulo: String, video: String },
    { titulo: String, video: String }
  ]
});

const Presentar = mongoose.model('Presentar', presentarSchema);

module.exports = Presentar;


