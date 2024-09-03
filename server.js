const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Presentar = require('./models/Presentar');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

const { uploadFile } = require('./util/s3');


mongoose.connect('mongodb://ec2-54-210-137-11.compute-1.amazonaws.com:27017/sinvoz', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexión a MongoDB establecida.');
  })
  .catch(err => console.error('Error al conectar con MongoDB:', err));

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'imagen') {
      cb(null, 'public/imagenes');
    } else if (file.fieldname === 'video') {
      cb(null, 'public/videos');
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Ruta para guardar datos y archivos en S3
app.post('/presentar', upload.fields([{ name: 'imagen' }, { name: 'video' }]), async (req, res) => {
  try {
    const { nombre, titulos } = req.body;
    
    // Subir imagen a AWS S3 y obtener la URL pública
    const imagenFile = req.files['imagen'][0];
    const imagenURL = await uploadFile(imagenFile.originalname, imagenFile.path, imagenFile.mimetype);

    // Subir cada video a AWS S3 y obtener sus URLs públicas
    const videoFiles = req.files['video'];
    const videoURLs = await Promise.all(videoFiles.map(file => 
      uploadFile(file.originalname, file.path, file.mimetype)
    ));

    // Formatear los títulos para asociarlos con las URLs de los videos
    const formattedTitulos = titulos.map((titulo, index) => ({
      titulo,
      video: videoURLs[index]
    }));

    // Crear un nuevo documento de Presentar
    const presentar = new Presentar({
      imagen: imagenURL,
      nombre,
      titulos: formattedTitulos
    });

    // Guardar el documento en MongoDB
    await presentar.save();

    res.status(201).send(presentar);
  } catch (error) {
    console.error('Error en /presentar:', error);
    res.status(400).send({ error: error.message });
  }
});



app.get('/presentar', async (req, res) => {
  try {
    const presentaciones = await Presentar.find();
    res.json(presentaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los datos de presentación' });
  }
});



// Nueva ruta para obtener una presentación por nombre
app.get('/completar/:nombre', async (req, res) => {
  try {
    const nombre = req.params.nombre;
    const presentacion = await Presentar.findOne({ nombre });

    if (presentacion) {
      res.json(presentacion);
    } else {
      res.status(404).json({ message: 'No se encontró la presentación con ese nombre' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la presentación' });
  }
});

// Nueva ruta para obtener una presentación por nombre y aplicar un tipo específico de manipulación
app.get('/completar/:nombre/:tipo', async (req, res) => {
  try {
    const { nombre, tipo } = req.params;
    const presentacion = await Presentar.findOne({ nombre });

    if (presentacion) {
      let resultado;
      let letrasEliminadas;
      switch (tipo) {
        case 'incompleto1':
          [resultado, letrasEliminadas] = removeFirstLetter(presentacion.nombre);
          
          break;
        case 'incompleto2':
          [resultado, letrasEliminadas] = removeTwoRandomLettersWithUnderscore(presentacion.nombre);
          break;
        case 'incompletoTotal':
          [resultado, letrasEliminadas] = replaceAllWithUnderscores(presentacion.nombre);
          break;
        case 'letrasSeparadas':
          resultado = presentacion.nombre.split('');
          break;
        default:
          return res.status(400).json({ message: 'Tipo no válido' });
      }
      res.json({ nombreOriginal: presentacion.nombre, nombreManipulado: resultado, letrasEliminadas });
    } else {
      res.status(404).json({ message: 'No se encontró la presentación con ese nombre' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la presentación' });
  }
});

// Nueva ruta para obtener una presentación por nombre y aplicar un tipo específico de manipulación
app.get('/completar/:nombre/:tipo/:letraFaltante', async (req, res) => {
  try {
    const { nombre, tipo, letraFaltanteMayuscula } = req.params;
    const presentacion = await Presentar.findOne({ nombre });
    letraFaltante =letraFaltanteMayuscula.toUpperCase();
    if (presentacion) {
      let resultado;
      let letrasEliminadas;
      switch (tipo) {
        case 'incompleto1':
          [resultado, letrasEliminadas] = removeFirstLetter(presentacion.nombre);
          break;
        case 'incompleto2':
          [resultado, letrasEliminadas] = removeTwoRandomLettersWithUnderscore(presentacion.nombre);
          break;
        case 'incompletoTotal':
          [resultado, letrasEliminadas] = replaceAllWithUnderscores(presentacion.nombre);
          break;
        case 'letrasSeparadas':
          resultado = presentacion.nombre.split('');
          letrasEliminadas = [];
          break;
        default:
          return res.status(400).json({ message: 'Tipo no válido' });
      }

      if (!validateMissingLetter(letrasEliminadas, letraFaltante)) {
        res.json({
          nombreOriginal: presentacion.nombre,
          nombreManipulado: resultado,
          letrasEliminadas
        });
      } else {
        res.status(400).json({ message: 'Letra faltante incorrecta' });
      }
    } else {
      res.status(404).json({ message: 'No se encontró la presentación con ese nombre' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la presentación' });
  }
});

// Función para reemplazar todas las letras con _
function replaceAllWithUnderscores(str) {
  const letrasEliminadas = str.split('').reverse(); // Guarda todas las letras en un array de manera invertida
  const resultado = '_'.repeat(str.length); // Reemplaza todas las letras por guiones bajos
  return [resultado, letrasEliminadas];
}
function validateMissingLetter(letrasEliminadas, missingLetter) {
  return !letrasEliminadas.includes(missingLetter);
}

// Función para remover la primera letra y reemplazarla por _
function removeFirstLetter(str) {
  if (str.length <= 1) return ['_', str]; // Si la longitud es 1 o menos, devuelve un solo guion bajo

  const letraEliminada = str.charAt(0);
  const resultado = '_' + str.substring(1);
  return [resultado, letraEliminada];
}

// Función para remover dos letras aleatorias y reemplazarlas por _
function removeTwoRandomLettersWithUnderscore(str) {
  if (str.length <= 2) return [str.substring(1), '']; // Si la longitud es 2 o menos, solo remueve la primera letra

  let chars = str.split('');
  let indexesToRemove = [];

  while (indexesToRemove.length < 2) {
    let randomIndex = Math.floor(Math.random() * (chars.length - 1)) + 1; // Evita la primera letra
    if (!indexesToRemove.includes(randomIndex)) {
      indexesToRemove.push(randomIndex);
    }
  }

  indexesToRemove.sort((a, b) => b - a); // Ordena en orden descendente para no cambiar índices al remover

  let letrasEliminadas = [];
  for (let index of indexesToRemove) {
    const letraEliminada = chars[index];
    letrasEliminadas.push(letraEliminada);
    chars.splice(index, 1, '_'); // Reemplaza la letra eliminada por _
  }

  return [chars.join(''), letrasEliminadas];
}



app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
