const express = require('express');
var router = express.Router();
const gardenController = require('../controllers/api_gardens');

router.get('/', (req, res) => {
  res.send('Gardens API is working!');
});

router.route('/')
    // .get(gardenController.getGardens)
    .post(async (req, res) => {
      try {
        // Adjust field names as needed
        const { name, address, irrigation } = req.body;
        const newGarden = await Garden.create({ name, address, Irrigation: irrigation });
        res.status(201).json(newGarden);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

// router.route('/:id')
//     .get(gardenController.getGarden)
//     .patch(gardenController.updateGarden)
//     .delete(gardenController.deleteGarden);

module.exports = router;