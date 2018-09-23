const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const userConfig = require('../config/user');

const UserFormat = {
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    lgNum: {
        type: String,
        required: true
    },
    recNum: {
        type: String,
        required: false
    },
    alNum: {
        type: String,
        required: false
    },
    nlExpire: {
        type: Date,
        required: true
    },
    wsiExpire: {
        type: Date,
        required: true
    },
    lsiExpire: {
        type: Date,
        required: true
    },
    cprExpire: {
        type: Date,
        required: true
    },
    aqftExpire: {
        type: Date,
        required: false
    },
    spIntention: {
        type: String,
        required: false
    },
    spTime: {
        type: Date,
        require: false
    },
    agreementSigned: {
        type: Boolean,
        require: false
    },
    savedShifts: [],
    pickedShifts: []
};

const User = module.exports = mongoose.model('user', mongoose.Schema(UserFormat));

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}

module.exports.getUsers = function(callback){
    User.find().select({_id: 0, username: 1, firstName: 1, lastName: 1, lgNum: 1, recNum: 1, alNum: 1, nlExpire: 1, lsiExpire: 1, wsiExpire: 1, cprExpire: 1, aqftExpire: 1}).lean().exec(callback);
}  

module.exports.getUserByUsername = function(username, callback){
    const query = {username: username};
    User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback){
    let datedUser = new User({
        username: newUser.username,
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        lgNum: newUser.lgNum,
        recNum: newUser.recNum,
        alNum: newUser.alNum,
        nlExpire: new Date(newUser.nlExpire),
        wsiExpire: new Date(newUser.wsiExpire),
        lsiExpire: new Date(newUser.lsiExpire),
        cprExpire: new Date(newUser.cprExpire),
        aqftExpire: new Date(newUser.aqftExpire),
        spIntention: null,
        spTime: null,
        agreementSigned: false,
        savedShifts: [],
        pickedShifts: [],
    });
    // salt + hash pass
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(userConfig.password, salt, (err, hash) =>{
            datedUser.password = hash;
        });
    });
    // save user
    datedUser.save(callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err){
            throw err;
        }
        callback(null, isMatch);
    });
}

module.exports.getExpiredAwards = function(callback){
    let nowDate = new Date();
    User.find({ $or: [
        {'nlExpire': {$lt: nowDate}},
        {'wsiExpire': {$lt: nowDate}},
        {'lsiExpire': {$lt: nowDate}},
        {'cprExpire': {$lt: nowDate}},
        {'aqftExpire': {$gt: new Date(0), $lt: nowDate}},
    ]}).select({_id: 0, firstName: 1, lastName: 1, nlExpire: 1, lsiExpire: 1, wsiExpire: 1, cprExpire: 1, aqftExpire: 1}).lean().exec(callback);
}

module.exports.getExpiringAwards = function(callback){
    let fortnite = new Date(new Date().getTime() + 1209600000);
    User.find({ $or: [
        {'nlExpire': {$lt: fortnite}},
        {'wsiExpire': {$lt: fortnite}},
        {'lsiExpire': {$lt: fortnite}},
        {'cprExpire': {$lt: fortnite}},
        {'aqftExpire': {$gt: new Date(0), $lt: fortnite}},
    ]}).select({_id: 0, firstName: 1, lastName: 1, nlExpire: 1, lsiExpire: 1, wsiExpire: 1, cprExpire: 1, aqftExpire: 1}).lean().exec(callback);
}

module.exports.updateUserInfo = function(userInfo, callback){
    User.update({ username: userInfo.username }, { $set: { 
        lgNum: userInfo.lgNum,
        recNum: userInfo.recNum,
        alNum: userInfo.alNum,
        nlExpire: userInfo.nlExpire,
        wsiExpire: userInfo.wsiExpire,
        lsiExpire: userInfo.lsiExpire,
        cprExpire: userInfo.cprExpire,
        aqftExpire: userInfo.aqftExpire
    }}, callback);
}

module.exports.getClipboardByUsername = function(newUsername, callback){
    User.find({ username: newUsername }, callback);
}

module.exports.editClipboardByUsername = function(newUsername, shiftIdea, callback){
    User.update({ username: newUsername }, { $addToSet: { savedShifts: shiftIdea }}, {upsert: true}, callback);
}

module.exports.pullClipboardByUsername = function(newUsername, shiftIdea, callback){
    User.update({ username: newUsername }, { $pull: { savedShifts: shiftIdea }}, callback);
}

module.exports.editPickedShiftsByUsername = function(newUsername, shiftIdea, callback){
    User.update({ username: newUsername }, { $addToSet: { pickedShifts: shiftIdea }}, {upsert: true}, callback);
}

module.exports.setShiftpickIntention = function(newUsername, intentionString, callback){
    User.update({ username: newUsername}, { $set: { spIntention: intentionString }}, callback);
}

module.exports.setShiftpickTime = function(newUsername, callback){
    User.update({ username: newUsername}, { $set: { spTime: new Date('2017-10-01') }}, callback);
}

module.exports.setAgreementSigned = function(newUsername, callback){
    User.update({ username: newUsername}, { $set: { agreementSigned: true }}, callback);
}