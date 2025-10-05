const garden_Service = require('../services/garden');    
//home page button is going to call the getGardens function
//plus every time the user creates a garden, it will call this function to update the list
const getGardens = async (req, res) => {
  try {
    const gardens = await garden_Service.getAllGardens();
    res.json(gardens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//getting garden by id for future search
const getGarden = async (req, res) => {
  try {
    const garden = await garden_Service.getGarden(req.params.id);
    if (!garden) {
      return res.status(404).json({ error: 'Garden not found' });
    }
    res.json(garden);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
};

const updateGarden = async (req, res) => {
    try {
        const { name, address } = req.body;
        const updateData = { name, address };
        
        // If a new image is uploaded, include it in the update
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }
        
        const garden = await garden_Service.updateGarden(req.params.id, updateData);
        if (!garden) {
            return res.status(404).json({ error: 'Garden not found' });
        }
        res.json(garden);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteGarden = async (req, res) => {
    try {
        const garden = await garden_Service.deleteGarden(req.params.id);
        if (!garden) {
            return res.status(404).json({ error: 'Garden not found' });
        }
        res.json({ message: 'Garden deleted successfully', garden });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    createGarden,
    getGardens,
    getGarden,
    updateGarden,
    deleteGarden
}