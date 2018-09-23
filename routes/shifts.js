const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Shift = require('../models/shifts_model');
const Shiftpick = require('../models/shiftpick_model');

//TO DO: create multiple shift insertion
/*db.collection('restaurants').insertMany(req.body.my_restaurants, function(err, restaurants){
    if(err) console.log(err);
    else console.log("restaurants Added Successfully");
    --if collection name is retaurants
});*/


//add single shift into shift database
router.post('/addShift', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    let newShift = new Shift({
        pool: req.body.pool,
        day: req.body.day,
        date: req.body.date,
        shiftTime: req.body.shiftTime,
        hours: req.body.hours,
        owner: req.body.owner,
        coverage: req.body.coverage
    });
    Shift.addShift(newShift, (err, shift) =>{
        if(err){
            console.log(err);
            res.json({success: false, msg:'failed to add shift'});
        } else {
            res.json({success: true, msg:'success in adding shift'});
        }
    });
});

//create needs inherit first date*
router.post('/createShifts', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shiftpick.getAll((err, fetchedShifts) => {
        if(err){
            res.json({success: false, msg:'failed to fetch shifts'});
        } else {
            Shift.createShifts(fetchedShifts, (err) => {
                if(err){
                    res.json({success: false, msg: 'failed to create shifts'});
                } else{
                    res.json({success: true, msg: 'successfully created shifts'});
                }
            });
        }
    });
});

router.post('/rolloverShifts', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shift.getPool(req.body.pool, (err, firstWeekShifts) => {
        if(err){
            res.json({success: false, msg: 'failed to fetch first week shifts'});
        } else {
            firstWeekShifts.forEach((firstWeekShift) => {
                for(var count = 1; count < req.body.weeks; count++){
                    Shift.rolloverShift(firstWeekShift, count, (err) => {
                        if(err){
                            res.json({success: false, msg: 'failed to roll over shifts'});
                        }
                    });
                }
            });
            res.json({success: true, msg: 'successfully rolled over shifts'});
        }
    });
});

router.get('/getUserShifts/:username', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shift.getUserShifts(req.params.username, (err, userShifts) => {
        if(err){
            res.json({success: false, msg: "failed to fetch user shifts"});
        } else {
            res.json(userShifts);
        }
    });
});

router.get('/getUserWeeklyShifts/:username/:startDate/:endDate', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shift.getUserWeeklyShift(req.params.username, req.params.startDate, req.params.endDate, (err, userWeeklyShifts) => {
        if(err){
            res.json({success: false, msg: "failed to fetch user shifts"});
        } else {
            res.json(userWeeklyShifts);
        }
    });
});

router.get('/getUserNextShift/:username/:date', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shift.getNextShift(req.params.username, req.params.date, (err, nextShift) => {
        if(err){
            res.json({success: false, msg: "failed to fetch user shifts"});
        } else {
            res.json(nextShift);
        }
    });
});

router.get('/getLookingForCoverage/', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shift.getLookingForCoverage((err, coverageShifts) => {
        if(err){
            res.json({success: false, msg: "failed to fetch user shifts"});
        } else {
            res.json(coverageShifts);
        }
    });
});

router.post('/changeShiftToLookingForCoverage', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shift.changeShiftToLookingForCoverage(req.body.id, (err, coverageShifts) => {
        if(err){
            res.json({success: false, msg: "failed to put shift up for coverage."});
        } else {
            res.json({success: true, msg: 'shift is now looking for coverage'});
        }
    });
});

router.post('/changeShiftToStopLookingForCoverage', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shift.changeShiftToStopLookingForCoverage(req.body.id, (err, coverageShifts) => {
        if(err){
            res.json({success: false, msg: "failed to put shift up for coverage."});
        } else {
            res.json({success: true, msg: 'shift is now looking for coverage'});
        }
    });
});

module.exports = router;