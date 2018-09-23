const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Shiftpick = require('../models/shiftpick_model');
const User = require('../models/users_model');


router.post('/addShifts', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shiftpick.addShifts(req.body.newShifts, (err, shift) =>{
        if(err){
            console.log(err);
            res.json({success: false, msg:'failed to add shifts'});
        } else {
            res.json({success: true, msg:'success in adding shifts'});
        }
    });
});

//add single shift into shift database
router.post('/addShift', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    let newShift = new Shift({
        pool: req.body.pool,
        day: req.body.day,
        shiftTime: req.body.shiftTime,
        description: req.body.description,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        hours: req.body.hours,
        owner: req.body.owner,
    });
    Shiftpick.addShift(newShift, (err, shift) =>{
        if(err){
            console.log(err);
            res.json({success: false, msg:'failed to add shift'});
        } else {
            res.json({success: true, msg:'success in adding shift'});
        }
    });
});

//the route gets each shift type
router.get('/getShiftById/:id', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shiftpick.getShiftById(req.params.id, (err, shift) => {
        if(err){
            throw err;
        } else {
            res.json(shift);
        }
    });
});

router.get('/getPoolDay/:pool/:day', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Shiftpick.getPoolDay(req.params.pool, req.params.day, (err, shifts) => {
        if(err){
            console.log(err);
        } else {
            res.json(shifts);
        }
    });
});

router.post('/pickShift', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    let arrayClipboardShifts = [];
    Shiftpick.getShiftById(req.body._id, (err, shiftToPick) => {
        if(shiftToPick.owner != 'Not Picked'){
            res.json({success: false, msg: shiftToPick.owner + " has already picked this shift."});
        } else {
            User.getClipboardByUsername(req.body.name, (err, clipboard) => {
                clipboard[0].pickedShifts.forEach((shiftId) => {
                    Shiftpick.getShiftById(shiftId, (err, shiftPicked) => {
                        arrayClipboardShifts.push(shiftPicked);
                    });
                });
            });
            setTimeout(() => {
                Shiftpick.checkConflict(arrayClipboardShifts, shiftToPick, (err, conflictMessage, conflictResult) => {
                    // console.log(conflictResult);
                    if(!conflictResult){
                        Shiftpick.pickShift(req.body.name, req.body._id, (err, shift) => {
                            if(err){
                                console.log(err);
                                res.json({success: false, msg: 'Error occurred.'});
                            } else {
                                res.json({success: true, msg: 'Successfully picked shift.'});
                            }
                        });
                    } else {
                        res.json({success: false, msg: conflictMessage});
                    }
                });
            }, 500);
        }
    });
});



module.exports = router;