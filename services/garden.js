const Garden = require('../models/garden');

// Create a new garden
const createGarden = async(name, address) => {
  const garden = new Garden({ name:name, address:address });
  return await garden.save();
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
  // updateGarden,
  // deleteGarden,
};