const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const shiftFormat = {
    pool: {
        type: String,
        require: true
    },
    day: {
        type: String,
        require: true
    },
    shiftTime: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: false
    },
    startTime: {
        type: Number,
        required: true
    },
    endTime: {
        type: Number,
        required: true
    },
    hours: {
        type: Number,
        required: true
    },
    owner: {
        type: String,
        required: false
    }
};

const Shiftpick = module.exports = mongoose.model('shiftpick', mongoose.Schema(shiftFormat, {collection: 'shiftpick'}));

module.exports.getShiftById = function(shiftId, callback){
    Shiftpick.find({_id: shiftId}, callback);
}

module.exports.addShift = function(newShift, callback){
    newShift.save(callback);
}

module.exports.addShifts = function(newShifts, callback){
    Shiftpick.insertMany(newShifts, callback);
}

module.exports.getPoolDay = function(poolValue, dayValue, callback){
    Shiftpick.find({pool: poolValue, day: dayValue}, callback).sort({startTime: 1});
}

module.exports.pickShift = function(staff, shiftId, callback){
    Shiftpick.findByIdAndUpdate(shiftId, { owner: staff }, callback);
}

module.exports.getShiftById = function(shiftId, callback){
    Shiftpick.findById(shiftId, callback);
}

module.exports.getAll = function(callback){
    Shiftpick.find({}, callback);
}

module.exports.checkConflict = function(arrayPickedShifts, shiftToPick, callback){
    let conflict = false;
    let totalHours = shiftToPick.hours;
    let totalDays = [];
    let message = '';

    arrayPickedShifts.forEach((shift) => {
        if(!conflict){
            totalHours += shift.hours; // set total hours

            if((shift.day == 'Monday') || (shift.day == 'Tuesday') || (shift.day == 'Wednesday') || (shift.day == 'Thursday') || (shift.day == 'Friday') || (shift.day == 'Saturday') || (shift.day == 'Sunday')){
                //if single day
                if(!totalDays.includes(shift.day)){
                    totalDays.push(shift.day);
                }
            } else {
                // if double day push twice
                if(!totalDays.includes(shift.day)){
                    totalDays.push(shift.day);
                    totalDays.push(shift.day);
                }
            }

            if(totalDays.length > 5){
                message = 'Total days over 5';
                console.log(totalDays);
                conflict = true;
            } else if(totalHours > 40){
                message = 'Total hours over 40';
                conflict = true;
            } else if((shiftToPick.day == shift.day)){
                if((shift.day == 'Monday') || (shift.day == 'Tuesday') || (shift.day == 'Wednesday') || (shift.day == 'Thursday') || (shift.day == 'Friday') || (shift.day == 'Saturday') || (shift.day == 'Sunday')){
                    if((shiftToPick.hours + shift.hours) > 8 ) {
                        message = 'Over 8 hours a day';
                        conflict = true;
                    }
                } else if ((shift.day == "Mon&Wed") || (shift.day == "Tue&Thu")){
                    if((shiftToPick.hours + shift.hours) > 16) {
                        message = 'Over 8 hours a day';
                        conflict = true;
                    }
                } else if((shiftToPick.startTime == shift.startTime) || ((shiftToPick.startTime < shift.startTime) && (shiftToPick.endTime > shift.startTime)) || ((shiftToPick.startTime > shift.startTime) && (shift.endTime > shiftToPick.startTime))) {
                    message = 'Time conflict between shifts';
                    conflict = true;
                } else if((shiftToPick.endTime - shift.startTime > 12) || (shift.endTime - shiftToPick.startTime > 12)){
                    message = 'Shifts are over 12 hour period';
                    conflict = true;
                } else if((shiftToPick.pool != shift.pool) & ((shiftToPick.startTime == shift.endTime) || (shiftToPick.endTime == shift.startTime))){
                    message = 'Shift at two different pools with same end and start time';
                    conflict = true;
                }
            }
        }
    });
    setTimeout(() => {
        callback(null, message, conflict);
    }, 500);
}