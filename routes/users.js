const express = require('express');
const users = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user');
users.use(cors());

process.env.SecretKey = 'secret';

//creating router to register users
users.post('/register', (req, res, next) => {
    const today = new Date();

    //fetching the details of users from the form
    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    }

    //find the user if email doesn't match with any of the email in database then insert the new user else send error
    User.findOne({
        email: req.body.email
    })
    .then(user => {
        if(!user) {
            //encrypting password and store a hash
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                userData.password = hash;
                User.create(userData)
                .then(user => {
                    res.json({status: user.email + ' registered!'});
                })
                .catch(err => {
                    res.send('error: ' + err)
                });
            });
        } 
        else {
            res.json({error: 'User already exists'});
        }
    })
    .catch(err => {
        res.send('error: ' + err);
    }); 
});

//create router for login and find the user with th email
users.post('/login', (req, res, next) => {
    User.findOne({
        email:req.body.email
    })
    .then(user => {
        if(user) {
            //if email found then compare password if matches then display the user details
            if(bcrypt.compareSync(req.body.password, user.password)) {
                const payload = {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
                //token contains the user details and display user till the expires time
                let token = jwt.sign(payload, process.env.SecretKey, {
                    expiresIn: 1440
                })
                res.send(token);
            }
            else {
                res.json({error: "User doesn't exist"})
            }
        }
        else {
            res.json({error: "User doesn't exist"})
        }
    })
    .catch(err => {
        res.send('error: ' + err);
    });
});

//create router to delete the user simply entering email also have a choice to add password
users.delete('/delete', (req, res, next) => {
    User.findOneAndDelete({
        email:req.body.email
    })
    .then(user => {
        if(!user) {
            //if email found then compare password if matches then display the user details
            res.send("user not found!");
        }
        else {
            res.send("User deleted");
        }
    })
    .catch(err => {
        res.send('error: ' + err);
    });
});

//Updating user name we can update anything but here only first and last name
users.put('/update', (req, res, next) => {
    User.findOneAndUpdate({
        email:req.body.email
    }, {firstName:req.body.firstName, lastName:req.body.lastName})
    .then(user => {
        if(user) {
            //if email found then compare password if matches then display the user details
                const updated = {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
                res.send(updated);
        }
        else {
            res.json({error: "User doesn't exist"})
        }
    })
    .catch(err => {
        res.send('error: ' + err);
    });
});

//accessing profile of the user means print its details
users.get('/profile', (req, res) => {
    //decode the user details and compare the id and then display it's details
    var decoded = jwt.varify(req.headers['authorization'], process. env.SecretKey);

    User.findOne({
        _id: decoded._id
    })
    .then(user => {
        if(user) {
            res.json(user);
        }
        else{
            res.send('User not found');
        }
    })
    .catch(err => {
        res.send('error: ' + err);
    });
});

module.exports = users;