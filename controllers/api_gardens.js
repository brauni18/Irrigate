const garden_Service = require('../services/garden');
// const garden_Model = require('../models/garden');    

const createGarden = async (req, res) => {
        try {
                const garden = await garden_Service.createGarden(req.body.name, req.body.address);
                res.status(201).json(garden);
        } catch (err) {
                res.status(400).json({ error: err.message });
        }
        // const garden = await garden_Service.createGarden(req.body.name, req.body.address)
        // res.json(garden);
    
};
module.exports = {
    createGarden,
}