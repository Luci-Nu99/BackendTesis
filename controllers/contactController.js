const Contact = require('../models/contact');
const { uploadFile } = require('../util/s3');

// Controlador para listar todos los contactos
const listarContactos = async (req, res) => {
  try {
    const query = req.query.q || '';
    const regex = new RegExp(query, 'i'); // Expresión regular para búsqueda insensible a mayúsculas
    const contactos = await Contact.find({
      $or: [{ nombre: regex }, { apellidos: regex }]
    });
    res.json(contactos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Controlador para crear un nuevo contacto
const crearContacto = async (req, res) => {
  try {
    const { nombre, apellidos, correo, fecha_nac } = req.body;
    const fotoFile = req.file; // Archivo de imagen enviado desde el cliente

    // Validar campos obligatorios
    if (!nombre || !apellidos || !correo || !fecha_nac || !fotoFile) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

     // Verificar si ya existe un contacto con el mismo correo
     const existeContacto = await Contact.findOne({ correo });
     if (existeContacto) {
       return res.status(400).json({ error: 'Ya existe un contacto con este correo electrónico.' });
     }

    // Subir imagen a AWS S3 y obtener la URL pública
    const fotoURL = await uploadFile(fotoFile.originalname, fotoFile.path, fotoFile.mimetype);

    // Crear nuevo contacto en la base de datos
    const nuevoContacto = new Contact({
      nombre,
      apellidos,
      correo,
      fecha_nac,
      foto: fotoURL // Guardar la URL de la imagen en S3
    });

    // Guardar el contacto en MongoDB
    await nuevoContacto.save();

    res.status(201).json({ mensaje: 'Contacto creado correctamente.', contacto: nuevoContacto });
  } catch (error) {
    console.error('Error en crearContacto:', error);
    res.status(500).json({ error: error.message });
  }
};

// Controlador para obtener un contacto por su ID
const obtenerContacto = async (req, res) => {
  const { id } = req.params;

  try {
    const contacto = await Contact.findById(id);
    if (!contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado.' });
    }
    res.json(contacto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para actualizar un contacto por su ID
const actualizarContacto = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellidos, correo, fecha_nac } = req.body;
  const fotoFile = req.file; // Archivo de imagen enviado desde el cliente

  try {
    let actualizarDatos = {
      nombre,
      apellidos,
      correo,
      fecha_nac
    };

    // Si se envió una nueva imagen, subirla a AWS S3 y actualizar la URL
    if (fotoFile) {
      const fotoURL = await uploadFile(fotoFile.originalname, fotoFile.path, fotoFile.mimetype);
      
      actualizarDatos.foto = fotoURL;
    }

    // Actualizar el contacto en MongoDB
    const contactoActualizado = await Contact.findByIdAndUpdate(id, actualizarDatos, { new: true });

    if (!contactoActualizado) {
      return res.status(404).json({ error: 'Contacto no encontrado.' });
    }

    res.json({ mensaje: 'Contacto actualizado correctamente.', contacto: contactoActualizado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Función para eliminar imagen en AWS S3
const eliminarImagenS3 = async (fotoURL) => {
  // Obtener el nombre del bucket y la clave (ruta) del objeto en S3 desde la URL
  const urlPartes = fotoURL.split('/');
  const bucketName = urlPartes[2].split('.')[0];
  const key = decodeURIComponent(urlPartes.slice(3).join('/'));

  // Parámetros para eliminar el objeto de S3
  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    // Eliminar el objeto de S3
    await s3.deleteObject(params).promise();
    console.log(`Imagen eliminada de S3: ${fotoURL}`);
  } catch (error) {
    console.error(`Error al eliminar la imagen de S3: ${fotoURL}`, error);
    throw error; // Propagar el error para manejarlo en el controlador
  }
};


// Controlador para eliminar un contacto por su ID
const eliminarContacto = async (req, res) => {
  const { id } = req.params;

  try {
    const contactoEliminado = await Contact.findByIdAndDelete(id);
    if (!contactoEliminado) {
      return res.status(404).json({ error: 'Contacto no encontrado.' });
    }
    res.json({ mensaje: 'Contacto eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listarContactos,
  crearContacto,
  obtenerContacto,
  actualizarContacto,
  eliminarContacto
};
