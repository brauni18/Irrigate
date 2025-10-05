const LineConfiguration = require('../models/line_configurations');
const Garden = require('../models/garden');
// Create a new line configuration

const createLine = async (name, gardenId, lineNumber, plantType, maintenanceLevel, location, interval, areaSize, dripperSettings, flowRate, calculatedValues) => {
    try {
        console.log('Creating line with data:', { name, gardenId, lineNumber, plantType, maintenanceLevel, location, interval, areaSize, dripperSettings }); // Add this
        
        const lineConfig = new lineConfiguration({
            name,
            gardenId,
            lineNumber,
            plantType,
            maintenanceLevel,
            location,
            interval,
            areaSize,
            dripperSettings,
            calculatedValues
        });
        
        const result = await lineConfig.save();
        console.log('Line created successfully:', result); // Add this
        return result;
    } catch (error) {
        console.error('Error in service createLine:', error); // Add this
        throw new Error(`Error creating line configuration: ${error.message}`);
    }
};
const getAllLines = async () => {
    return await LineConfiguration.find({});
};

const getLine = async (id) => {
    return await LineConfiguration.findById(id);
};

const updateLine = async (id, data) => {
    return await LineConfiguration.findByIdAndUpdate(id, data, { new: true });
};

const deleteLine = async (id) => {
    return await LineConfiguration.findByIdAndDelete(id);
};

module.exports = {
    createLine,
    getAllLines,
    getLine,
    updateLine,
    deleteLine
};
