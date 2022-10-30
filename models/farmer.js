const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const FarmerSchema = new Schema({
    username: { type: String, required: true, unique: [ true, 'ID Number already exist' ] },
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    phone: { type: String, required: true},
    address: { type: String},
    country: {type: String, default: null},
    state: {type: String, default: null},
    city: {type: String, default: null},
    image: { type: String, default: 'null' },
    product:[{type: Object, default:Array}]
}, { timestamps: true });

//plugin passport-local-mongoose to enable password hashing and salting and other things
FarmerSchema.plugin(passportLocalMongoose);

//connect the schema with user table
const Farmer = mongoose.model('farmer', FarmerSchema);

//export the model 
module.exports = Farmer;