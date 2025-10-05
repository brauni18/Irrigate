const lineConfigurations = require('../services/line_configurations');

const createLine = async (req, res) => {
    try {
        const { name, gardenId, lineNumber, plantType, maintenanceLevel, location, interval, areaSize, dripperSettings, flowRate, calculatedValues } = req.body;
        if (!name || !gardenId || !lineNumber || !plantType || !maintenanceLevel || !location || !interval || !areaSize || !dripperSettings) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        else {
            const line = await lineConfigurations.createLine(name, gardenId, lineNumber, plantType, maintenanceLevel, location, interval, areaSize, dripperSettings, flowRate, calculatedValues);
            res.status(201).json(line);
        }
    } catch (err) {
        console.error('Error in createLine controller:', err); // Add this line
        res.status(400).json({ error: err.message });
    }
};
const getLines = async (req, res) => {
    try {
        const lines = await lineConfigurations.getAllLines();
        res.status(200).json(lines);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
const getLine = async (req, res) => {
    try {
        const line = await lineConfigurations.getLine(req.params.id);
        res.status(200).json(line);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
const updateLine = async (req, res) => {
    try {
        const { name, gardenId, lineNumber, plantType, maintenanceLevel, location, interval, areaSize, dripperSettings, flowRate, calculatedValues } = req.body;
        const line = await lineConfigurations.updateLine(req.params.id, { name, gardenId, lineNumber, plantType, maintenanceLevel, location, interval, areaSize, dripperSettings, flowRate, calculatedValues });
        res.status(200).json(line);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
const deleteLine = async (req, res) => {
    try {
        const line = await lineConfigurations.deleteLine(req.params.id);
        res.status(200).json(line);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
module.exports = {
    createLine,
    getLines,
    getLine,
    updateLine,
    deleteLine
};  