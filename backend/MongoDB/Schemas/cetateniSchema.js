const mongoose = require('mongoose');

const drivingInfoSchema = new mongoose.Schema({
    vehicleInfo: String
});

const cetateanSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    cnp: { 
        type: String, 
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[1-8]\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(0[1-9]|[1-4]\d|5[0-2])\d{4}$/.test(v);
            },
            message: props => `${props.value} nu este un CNP valid!`
        }
    },
    address: String,
    drivingInfo: drivingInfoSchema,

    foto: String
});

module.exports = mongoose.model('Citizen', cetateanSchema);