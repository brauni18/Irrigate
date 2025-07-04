const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Garden = new Schema({
    address: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    Date: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("Garden", Garden);