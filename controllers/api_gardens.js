const garden_Service = require('../services/garden');    
//home page button is going to call the getGardens function
//plus every time the user creates a garden, it will call this function to update the list
const getGardens = async (req, res) => {
  const gardens = await garden_Service.getAllGardens();
  res.json(gardens);
};
//getting garden by id for future search
const getGarden = async (req, res) => {
  const garden = await garden_Service.getGarden(req.params.id);
  res.render('garden', { garden });
  if (!garden) {
    res.status(404).send('Garden not found');
  }
};
const createGarden = async (req, res) => {
        try {
                const { name, address } = req.body;
                const image = req.file ? `/uploads/${req.file.filename}` : null;

                const garden = await garden_Service.createGarden(name, address, image);
                res.status(201).json(garden);
        } catch (err) {
                res.status(400).json({ error: err.message });
        }
        // const garden = await garden_Service.createGarden(req.body.name, req.body.address)
        // res.json(garden);
    
};
module.exports = {
    createGarden,
    getGardens,
    getGarden
}