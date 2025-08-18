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
// Edit (update) a garden by ID
// async function editGarden(id, data) {
//   return await Garden.findByIdAndUpdate(id, data, { new: true });
// }

// // Delete a garden by ID
// async function deleteGarden(id) {
//   return await Garden.findByIdAndDelete(id);
// }

// // (Optional) Get a garden by ID
// async function getGardenById(id) {
//   return await Garden.findById(id);
// }

// // (Optional) Get all gardens
// async function getAllGardens() {
//   return await Garden.find();
// }

module.exports = {
  createGarden,
  getAllGardens,
  getGarden
  // updateGarden,
  // deleteGarden,
};