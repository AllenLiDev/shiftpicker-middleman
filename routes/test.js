const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Test = require('../models/test_model');

module.exports = router;

router.get('/getTestData', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Test.getTestData((err, shifts) => {
        if(err){
            console.log(err);
        } else {
            res.json({success: true, data: shifts});
        }
    });
});

router.post('/saveShift',  passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Test.updateShift(req.body, (err, callback) => {
        if(err){
            res.json({success: false, msg: callback});
        } else {
            res.json({success: true})
        }
    });
});