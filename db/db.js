const mongoose = require('mongoose');

// Conexión a la base de datos
mongoose.connect('mongodb://localhost:27017/sinvoz', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexión a MongoDB establecida.');
  })
  .catch(err => console.error('Error al conectar con MongoDB:', err));
