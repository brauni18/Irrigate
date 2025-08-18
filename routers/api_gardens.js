const express = require('express');
const multer = require('multer');
var router = express.Router();
const gardenController = require('../controllers/api_gardens');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Append timestamp to avoid name conflicts
  }
});
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});



router.route('/')
    .get(gardenController.getGardens)
    .post(upload.single('image'), gardenController.createGarden);

// router.route('/:id')
//     .get(gardenController.getGarden);
//     .patch(gardenController.updateGarden)
//     .delete(gardenController.deleteGarden);

module.exports = router;