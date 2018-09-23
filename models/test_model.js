const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const testFormat = {
    startTime: Number,
    endTime: Number,
    owner: String
};

const Test = module.exports = mongoose.model('test', mongoose.Schema(testFormat, {collection: 'test'}));

module.exports.getTestData = function(callback){
    Test.find({}, callback);
};

module.exports.updateShift = function(shift, callback){
    if(shift._id == undefined){
        Test.create(shift, callback);
    } else {
        console.log(shift);
        Test.findByIdAndUpdate(
            shift._id,
            {
                startTime: shift.startTime,
                endTime: shift.endTime,
                owner: shift.owner
            },
            callback
        );
    }
}