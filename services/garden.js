const Garden = require('../models/garden');

// Create a new garden
const createGarden = async(name, address, image) => {
  const garden = new Garden({ name:name, address:address, image:image });
  return await garden.save();
};
const getAllGardens = async () => {
  return await Garden.find({});
  
};
const getGarden = async (id) => {
  try{

    return await Garden.findById(id);
  } catch (error) {
    return null; // Return null if garden not found
  }

};
// Update a garden by ID
const updateGarden = async (id, updateData) => {
  try {
    return await Garden.findByIdAndUpdate(id, updateData, { new: true });
  } catch (error) {
    throw new Error(`Failed to update garden: ${error.message}`);
  }
};

// Delete a garden by ID
const deleteGarden = async (id) => {
  try {
    return await Garden.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Failed to delete garden: ${error.message}`);
  }
};

module.exports = {
  createGarden,
  getAllGardens,
  getGarden,
  updateGarden,
  deleteGarden,
};