const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Garden = new Schema({
    name: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: true
    },
    image:{type: String},

    controller: {
        name : {
            type: String,
            required: true
        },
        lineCount :{
            type: Number,
        },
    },
    Date: {
        type: Date,
        default: Date.now
    },
    update:{
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("Garden", Garden);
