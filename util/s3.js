const AWS = require('aws-sdk');
const fs = require('fs');
require('dotenv').config();

// Configura las credenciales y la región de AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Crea un nuevo cliente S3
const s3 = new AWS.S3();


const uploadFile = async (fileName, filePath, mimeType) => {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `imagenes/${fileName}`,
    Body: fileContent,
    ContentType: mimeType
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // URL pública del archivo en S3
  } catch (err) {
    throw new Error(`Error al subir archivo a S3: ${err.message}`);
  }
};

module.exports = {
  uploadFile
};