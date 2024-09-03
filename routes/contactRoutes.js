const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Rutas CRUD para contactos
router.get('/', contactController.listarContactos);
router.post('/', contactController.crearContacto);
router.get('/:id', contactController.obtenerContacto);
router.put('/:id', contactController.actualizarContacto);
router.delete('/:id', contactController.eliminarContacto);

module.exports = router;

