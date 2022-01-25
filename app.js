require('dotenv').config();
require('./config/database').connect();
const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');
const User = require('./model/user');
const auth = require('./middleware/auth');
const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/',(req, res) => {
    res.send("hello world");
});


//register user

app.post('/register', async(req, res) => { 
try {
    const {firstname, lastname, email, password } = req.body;

    if (!(email && firstname && lastname && password)){
        res.status(400).send('All fields are required');
    }

    //if user exist validation
    const existinguser = await User.findOne({email});

    if(existinguser){
        res.status(401).send('user already exist');
    }


    const myEncryptPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        firstname,
        lastname,
        email: email.toLowerCase(),
        password: myEncryptPassword
    });

    // token creation

    const token = jwt.sign({ user_id: user._id, email }, process.env.SECRET_KEY, { expiresIn: '2h'});

    user.token = token;

    user.password = undefined;


    res.status(201).json(user);

} catch (error) {
    console.log(error);
}
   
});




//USER LOGIN

app.post("/login", async(req, res) => { 

    try {
        
        const { email, password } = req.body;

        if(!(email && password)){
            res.status(400).send("Field is missing");
            return;
        }
        
        const user = await User.findOne({email});


     const checkvalue  = await bcrypt.compare(password, user.password)

        if(user && (await bcrypt.compare(password, user.password))){
            const token = jwt.sign({user_id: user.id, email}, process.env.SECRET_KEY, {expiresIn: "2h"});
            user.token = token;
            user.password = undefined;
            // res.status(200).json(user);
            //for cookies

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.status(200).cookie('token', token, options).json({
                success : true,
                token,
                user
            })
        }else{
            res.status(400).send("incorrect user");
        }



    } catch (error) {
        console.log(error);
    }


});


//dashboard request

app.get("/dashboard", auth,  (req, res) => {
    res.send("welcome to Dashboard");
})


module.exports = app;