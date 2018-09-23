const express = require('express');
const path = require('path');
const bodyParsor = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const config = require('./config/database');
const mongoose = require('mongoose');

// promise library for mongoose
mongoose.Promise = require('bluebird');

// bring in mongodb through config file
mongoose.connect(config.database, {useMongoClient: true});

// check database connection
mongoose.connection.on('connected', () => {
    console.log('connected to database');
});

// check database connection error
mongoose.connection.on('error', () => {
    console.log('database error');
});

const app = express();

// routes
const users = require('./routes/users');
const shifts = require('./routes/shifts');
const shiftpick = require('./routes/shiftpick');
const test = require('./routes/test');

// port number
const port = process.env.PORT || 8080;

// cors middleware
app.use(cors());

//set static folder (ionic proj)
app.use(express.static(path.join(__dirname, 'public')));

// passport middlware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// body parser middleware
app.use(bodyParsor.json());

app.use('/users', users);
app.use('/shifts', shifts);
app.use('/shiftpick', shiftpick);
app.use('/test', test);

//index route
app.get('/', (req, res) => {
    res.send('Invalid Endpoint');
});

//start server
app.listen(port, () => {
    console.log('server started on port: ' + port);
});