const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const Shiftpick = require('../models/shiftpick_model');

const shiftFormat = {
    pool: {
        type: String,
        required: true
    },
    day: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        required: true
    },
    shiftTime: {
        type: String,
        required: true
    },
    hours: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: false
    },
    coverage: {
        type: String,
        required: false
    }
};

// must be changed for each season
// set switch array for each pool start and end dates
const firstMonday = "2017-09-11T";
const firstTuesday = "2017-09-12T";
const firstWednesday = "2017-09-06T";
const firstThursday = "2017-09-07T";
const firstFriday = "2017-09-08T";
const firstSaturday = "2017-09-09T";
const firstSunday = "2017-09-10T";
const blankSecondsString = ":00.000";
const weekInMilliseconds = 1000 * 60 * 60 * 24 * 7;

const Shift = module.exports = mongoose.model('shift', mongoose.Schema(shiftFormat));

module.exports.addShift = function(newShift, callback){
    newShift.save(callback);
};

module.exports.getAll = function(callback){
    Shift.find({}, callback);
};

module.exports.getPool = function(poolName, callback){
    Shift.find({pool: poolName}, callback);
};

module.exports.createShifts = function(shiftpickShifts, callback){
    shiftpickShifts.forEach((soloShift) => {
        let newShift = new Shift({
            pool: soloShift.pool,
            day: "",
            date: "",
            shiftTime: soloShift.shiftTime,
            hours: soloShift.hours,
            owner: soloShift.owner,
            coverage: "None"
        });
        if(soloShift.day == "Mon&Wed"){
            let newShift2 = new Shift({
                pool: soloShift.pool,
                day: "Wednesday",
                date: new Date(firstWednesday + soloShift.shiftTime.substr(0,5) + blankSecondsString),
                shiftTime: soloShift.shiftTime,
                hours: soloShift.hours / 2,
                owner: soloShift.owner,
                coverage: "None"
            });
            newShift.day = "Monday";
            newShift.hours = soloShift.hours / 2;
            newShift.date = new Date(firstMonday + soloShift.shiftTime.substr(0,5) + blankSecondsString);
            newShift2.save();
        } else if(soloShift.day == 'Tue&Thu'){
            let newShift2 = new Shift({
                pool: soloShift.pool,
                day: "Thursday",
                date: new Date(firstThursday + soloShift.shiftTime.substr(0,5) + blankSecondsString),
                shiftTime: soloShift.shiftTime,
                hours: soloShift.hours / 2,
                owner: soloShift.owner,
                coverage: "None"
            });
            newShift.day = "Tuesday";
            newShift.hours = soloShift.hours / 2;
            newShift.date = new Date(firstTuesday + soloShift.shiftTime.substr(0,5) + blankSecondsString);
            newShift2.save();
        } else if(soloShift.day == 'Monday'){
            newShift.day = "Monday";
            newShift.date = new Date(firstMonday + soloShift.shiftTime.substr(0,5) + blankSecondsString);
        } else if(soloShift.day == 'Tuesday'){
            newShift.day = "Tuesday";
            newShift.date = new Date(firstTuesday + soloShift.shiftTime.substr(0,5) + blankSecondsString);
        } else if(soloShift.day == 'Wednesday'){
            newShift.day = "Wednesday";
            newShift.date = new Date(firstWednesday + soloShift.shiftTime.substr(0,5) + blankSecondsString);
        } else if(soloShift.day == 'Thursday'){
            newShift.day = "Thursday";
            newShift.date = new Date(firstThursday + soloShift.shiftTime.substr(0,5) + blankSecondsString);
        } else if(soloShift.day == 'Friday'){
            newShift.day = "Friday";
            newShift.date = new Date(firstFriday + soloShift.shiftTime.substr(0,5) + blankSecondsString);
        } else if(soloShift.day == 'Saturday'){
            newShift.day = "Saturday";
            newShift.date = new Date(firstSaturday + soloShift.shiftTime.substr(0,5) + blankSecondsString);
        } else if(soloShift.day == 'Sunday'){
            newShift.day = "Sunday"
            newShift.date = new Date(firstSunday + soloShift.shiftTime.substr(0,5) + blankSecondsString);
        }
        newShift.save();
    });
    callback();
};

module.exports.rolloverShift = function(firstWeekShift, weekCount, callback){
    let newShift = new Shift({
        pool: firstWeekShift.pool,
        day: firstWeekShift.day,
        date: new Date(firstWeekShift.date.getTime() + weekCount * weekInMilliseconds),
        shiftTime: firstWeekShift.shiftTime,
        hours: firstWeekShift.hours,
        owner: firstWeekShift.owner,
        coverage: "None"
    });
    newShift.save();
};

module.exports.getUserShifts = function(usernameIn, callback){
    Shift.find({owner: usernameIn}, callback);
};

module.exports.getUserWeeklyShift = function(usernameIn, startDate, endDate, callback){
    Shift.find({
        owner: usernameIn,
        date: {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
        }
    }).sort({date: 1}).exec(callback);
};

module.exports.getNextShift = function(usernameIn, curDate, callback){
    Shift.find({
        owner: usernameIn,
        date: {
            $gte: new Date(curDate)
        }
    }).limit(1).sort({date: 1}).exec(callback);
};

module.exports.getLookingForCoverage = function(callback){
    Shift.find({
        coverage: "Looking",
        date: {
            $gte: new Date()
        }
    }).sort({date: 1}).exec(callback);
};

module.exports.changeShiftToLookingForCoverage = function(shiftId, callback){
    Shift.findByIdAndUpdate(shiftId, {coverage: "Looking"}, callback);
};

module.exports.changeShiftToStopLookingForCoverage = function(shiftId, callback){
    Shift.findByIdAndUpdate(shiftId, {coverage: "None"}, callback);
};

