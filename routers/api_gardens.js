const express = require('express');
var router = express.Router();
const gardenController = require('../controllers/api_gardens');

router.get('/', (req, res) => {
  res.send('Gardens API is working!');
});

router.route('/')
    // .get(gardenController.getGardens)
    .post(gardenController.createGarden);
    
// router.route('/:id')
//     .get(gardenController.getGarden)
//     .patch(gardenController.updateGarden)
//     .delete(gardenController.deleteGarden);

module.exports = router;