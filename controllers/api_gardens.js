const garden_Service = require('../services/garden');
const garden_Model = require('../models/garden');    

const createGarden = async (req, res) => {
    try {
        const garden = await garden_Service.createGarden(req.body);
        res.status(201).json(garden);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}