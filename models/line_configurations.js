const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Line = new Schema({
    name: {
        type: String,
        required: true
    },
    gardenId: {
        type: String,
        required: true
    },
    lineNumber: {
        type: Number,
        required: true
    },
    plantType: {
        type: String,
        required: true
    },
    maintenanceLevel: {
        type: Number,
        required: true
    },
     location: {
        type: String,
        required: true
    },
    interval:{
        type: Number,
        required: true
    },
    areaSize:{
        type: Number,
        required: true
    },
     dripperSettings: {
        distance: {
            type: Number, // meters between drippers
            required: true,
            default: 0.5
        },
        flowRate: {
            type: Number, // L/h per dripper
            required: true,
            default: 2.3
        }
    },
   calculatedValues: {
        duration: Number, // minutes
        waterAmount: Number, // liters per interval
        totalPlants: Number,
        pipeLength: Number, // meters
        totalFlowRate: Number, // L/h
        plantCoefficient: Number
    },
    // isActive: {
    //     type: Boolean,
    //     default: true
    // },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Line", Line);