const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//creating schema for user
const UserSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

//create a model users and export the module
module.exports = User = mongoose.model('users', UserSchema);