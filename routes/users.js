const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/users_model');

//register
router.post('/register', (req, res, next) => {
    let newUser = new User({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        lgNum: req.body.lgNum,
        recNum: req.body.recNum,
        alNum: req.body.alNum,
        nlExpire: req.body.nlExpire,
        wsiExpire: req.body.wsiExpire,
        lsiExpire: req.body.lsiExpire,
        cprExpire: req.body.cprExpire,
        aqftExpire: req.body.aqftExpire,
        spIntention: null,
        spTime: null,
        agreementSigned: false,
        savedShifts: [],
        pickedShifts: [],
    });

    User.getUserByUsername(newUser.username, (err, user) => {
        if(err){
            throw err;
        }
        if(user){
            res.json({success: false, msg: 'User: ' + req.body.username + ' already exists for ' + user.firstName + ' ' + user.lastName + ', Please create new username.' });
        } else {
            User.addUser(newUser, (err, callback) =>{
                if(err){
                    res.json({success: false, msg:'failed to register user'});
                } else {
                    res.json({success: true, msg:'Successfully registered user: ' + req.body.username});
                }
            });
        }
    });
});

//authenticate
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if(err){
            throw err;
        }
        if(!user){
            return res.json({success: false, msg: 'Incorrect Login'});
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err){
                throw err;
            }
            if(isMatch){
                const token = jwt.sign(user, config.secret, {
                    expiresIn: 604800 // 1 week in seconds
                });

                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    user: {
                        id: user._id,
                        username: user.username,                  
                        firstName: user.firstName,
                        lastName: user.lastName,
                        lgNum: user.lgNum,
                        recNum: user.recNum,
                        alNum: user.alNum,
                        nlExpire: user.nlExpire,
                        wsiExpire: user.wsiExpire,
                        lsiExpire: user.lsiExpire,
                        cprExpire: user.cprExpire,
                        aqftExpire: user.aqftExpire,
                        spIntention: user.spIntention,
                        spTime: user.spTime,
                        agreementSigned: user.agreementSigned
                    }
                });
            } else {
                return res.json({success: false, msg: 'Incorrect Login'});
            }
        });
    });
});

// profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    res.json({user: req.user});
});

// users
router.get('/users', (req, res, next) => {
    User.getUsers((err, users) => {
        if(err){
            console.log('Error occured while loading users data. ' + err);
        } else {
            res.json(users);
        }
    });
});

// expired awards
router.get('/expiredAwards', (req, res, next) => {
    User.getExpiredAwards((err, users) => {
        if(err){
            res.json({success: false, msg: 'Failed to load expired users'});
        } else {
            res.json({success: true, msg: 'Successfully loaded expired users', data: users});
        }
    });
});

// expiring awards 2 weeks time; includes expired
router.get('/expiringAwards', (req, res, next) => {
    User.getExpiringAwards((err, users) => {
        if(err){
            res.json({success: false, msg: 'Failed to load expiring users'});
        } else {
            res.json({success: true, msg: 'Successfully loaded expiring users', data: users});
        }
    });
});

router.post('/updateUser', (req, res, next) => {
    User.updateUserInfo(req.body, (err) => {
        if(err){
            res.json({success: false, msg: 'Failed to update user information'});
        } else {
            res.json({success: true, msg: 'Successfully updated user information'});
        }
    });
});

router.get('/getClipboard/:username', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    User.getClipboardByUsername(req.params.username, (err, clipboard) => {
        if(err){
            throw err;
        } else {
            res.json(clipboard);
        }
    });
});

router.post('/editClipboard', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    User.editClipboardByUsername(req.body.name, req.body._id, (err, clipboard) => {
        if(err){
            res.json({success: false, msg: 'Failed to add to clipboard'});
        } else {
            res.json({success: true, msg: 'Added shift to clipboard'});
        }
    });
});

router.post('/pullClipboard', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    User.pullClipboardByUsername(req.body.name, req.body._id, (err, clipboard) => {
        if(err){
            res.json({success: false, msg: 'Failed to remove from clipboard'});
        } else {
            res.json({success: true, msg: 'Removed shift from clipboard'});
        }
    });
});

router.post('/editPickedShifts', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    User.editPickedShiftsByUsername(req.body.name, req.body._id, (err, clipboard) => {
        if(err){
            res.json({success: false, msg: 'Failed to add to picked shifts'});
        } else {
            res.json({success: true, msg: 'Added to picked shifts'});
        }
    });
});

router.post('/setShiftpickIntention', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    User.setShiftpickIntention(req.body.username, req.body.spIntention, (err) => {
        if(err){
            res.json({success: false, msg: 'Failed to update shiftpick intention'});
        } else {
            if(req.body.spIntention == 'Picking'){
                User.setShiftpickTime(req.body.username, (err) => {
                    if(err){
                        res.json({success: false, msg: 'Failed to give shiftpick time after setting status'});
                    } else {
                        res.json({success: true, msg: 'Successfully updated intention and shiftpick time. Relog required!'});
                    }
                });
            } else {
                res.json({success: true, msg: 'Shiftpick Intention updated to ' + req.body.spIntention + '. Relog required!'});
            }
        }
    });
});

router.post('/setAgreementSigned', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    User.setAgreementSigned(req.body.username, (err) => {
        if(err){
            res.json({success: false, msg: 'Failed to sign agreement'});
        } else {
            res.json({success: true, msg: 'Successfully signed agreement. Relog required!'});
        }
    });
});
 
module.exports = router;