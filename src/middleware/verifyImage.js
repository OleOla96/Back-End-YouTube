const path = require('path');
const multer = require('multer');
const MB = 5; // 5 MB
const FILE_SIZE_LIMIT = MB * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './public/images/avatar');
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const verifyImage = multer({
  storage: storage,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Upload failed. Only "jpeg, jpg, png" files allowed.');
    }
  },
}).single('avatar');

verifyImage.errorHandler = function (err, req, res, next) {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).send({ message: `Upload failed. This file exceeds the file size limit of ${MB}MB.` });
    } else if (err.code !== 'LIMIT_FILE_SIZE') {
      res.status(500).send({ message: 'Upload failed. Only "jpeg, jpg, png" files allowed.' });
    } else {
      res.status(500).send(err);
    }
  } else {
    next();
  }
};

module.exports = verifyImage;
