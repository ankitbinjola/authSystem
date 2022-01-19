require('dotenv').config();
require('./config/database').connect();
const express = require('express');
const User = require('./model/user');
const app = express();
app.use(express.json());

app.get('/',(req, res) => {
    res.send("hello world");
});


//register user

app.post('/register',async(req, res) => { 
    const {firstname, lastname, email,password } = req.body;

    if (!(email && firstname && lastname && password)){
        res.status(400).send('All fields are required');
    }

    //if user exist validation
    const existinguser = await User.findOne({email});

    if(existinguser){
        res.status(401).send('user already exist');
    }



});


module.exports = app;