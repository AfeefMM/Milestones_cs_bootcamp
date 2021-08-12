const express = require('express');
// We only need the routing methods from Express
const router = express.Router();
const bcryptjs = require('bcryptjs');
const UserModel = require('../models/UserModel.js');
const cloudinary = require('cloudinary').v2;
const { db } = require('../models/UserModel.js');
const passport = require('passport');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

// Get all of the users
// http://localhost:3001/users/
router.get('/', 
    (req, res) => {

        UserModel
        .find()
        .then(
            (dbDocument)=>{
                res.send(dbDocument)
            }
        )
        .catch(
            (error) => {
                console.log(error);
            }
        )

    }
);

// Post a new user
// http://localhost:3001/users/create
router.post('/create',
    (req, res) => {

        // Contains the user's submission
        const formData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber
        }

        UserModel
        .findOne({ email: formData.email }) // for example: jondoe@gmail.com
        .then(
            async (dbDocument) => {

                // If email exists, reject request
                if(dbDocument) {
                    res.send("Sorry, an account with this email already exists.");
                } 

                // Otherwise, create the account
                else {

                    // If avatar file is included...
                    if( Object.values(req.files).length > 0 ) {

                        const files = Object.values(req.files);
                        
                        // upload to Cloudinary
                        await cloudinary.uploader.upload(
                            files[0].path,
                            (cloudinaryErr, cloudinaryResult) => {
                                if(cloudinaryErr) {
                                    console.log(cloudinaryErr);
                                } else {
                                    // Include the image url in formData
                                    formData.avatar = cloudinaryResult.url;
                                }
                            }
                        )
                    };


                    // Generate a Salt
                    bcryptjs.genSalt(
                        (err, theSalt) => {
                            // Combine user's password + Salt to hash the password
                            bcryptjs.hash(
                                formData.password,  // first ingredient
                                theSalt,    // second ingredient
                                (err, hashedPassword) => {
                                    // Replace the password in the form with the hash
                                    formData.password = hashedPassword;

                                    // Create the document
                                    // Use the UserModel to create a new document
                                    UserModel
                                    .create(
                                        formData
                                    )
                                    .then(
                                        (dbDocument) => {
                                            res.send(dbDocument);
                                        }
                                    )
                                    .catch(
                                        (error) => {
                                            console.log(error);
                                        }
                                    );
                                }
                            )
                        }
                    );                
                }
            }
        )
        .catch(
            (err)=>{
                console.log(err);
            }
        )
    }
);

// Export the routes for 'users'
module.exports = router;

//login user
router.post('/login',
    (req,res) => {

        //capture form data
        const formData = {
            email: req.body.email,
            password:req.body.password
        }
        //check if email exists
        UserModel.findOne({email:formData.email})
        .then(
            (dbDocument) => {
        //if email exists
        if(dbDocument){

            //compare password sent against password in database
            bcryptjs.compare(
                formData.password,
                dbDocument.password
            )
            .then(
                (isMatch) => {
                    //if matches, login user
                    if(isMatch){
                    //generate payload
                    const payload = {
                        _id: dbDocument._id,
                        email: dbDocument.email
                    }
                    //generate jsonwebtoken (jwt)
                    jwt
                    .sign(
                        payload,
                        jwtSecret,
                        (err,jsonwebtoken) => {
                            if(err){
                                console.log(err);
                            }
                            else{
                                //send the jwt to the client
                                res.send(jsonwebtoken);
                            }
                        }
                    )
                    //send the jwt to the client
                    }
                    //else, reject login
                    else{
                        res.send("wrong email or password"); 
                    }
                }
            )
            .catch(
                (err) => {
                    console.log(err);
                }
            )   
        }
        //else
        else{
            //reject the login
            res.send("wrong email or password");
        }
            
            }    
        )
        .catch(
            (err) => {
                console.log(err);
            }
        )

    }
)

module.exports = router;

/*const express = require('express');
// We only need the routing methods from Express
const router = express.Router();
const bcryptjs = require('bcryptjs');
const UserModel = require('../models/UserModel.js');
const cloudinary = require('cloudinary');

// Get all of the users
// http://localhost:3001/users/
router.get('/', 
    (req, res) => {

        UserModel
        .find()
        .then(
            (dbDocument)=>{
                res.send(dbDocument)
            }
        )
        .catch(
            (error) => {
                console.log(error);
            }
        )

    }
);

// Post a new user
// http://localhost:3001/users/create
router.post('/create',
    (req, res) => {

        // Contains the user's submission
        const formData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber
        }

        UserModel
        .findOne({ email: formData.email }) // for example: jondoe@gmail.com
        .then(
            async (dbDocument) => {

                // If email exists, reject request
                if(dbDocument) {
                    res.send("Sorry, an account with this email already exists.");
                } 

                // Otherwise, create the account
                else {


                    //IF AVATAR IS INCLUDED, UPLOAD TO CLOUDINARY
                    if(Object.values(req.files).length> 0){

                        const files = Object.values(req.files);
                        //upload to cloudinary
                        await cloudinary.uploader.uploader(
                            req.files[0].path, 
                            (cloudinaryErr, cloudinaryResult) => {
                                if(cloudinaryErr){
                                    console.log(cloudinaryErr);
                                }

                                formData.avatar = cloudinaryResult.UserModel;
                            }
                        );
                    }

                    // Generate a Salt
                    bcryptjs.genSalt(
                        (err, theSalt) => {
                            // Combine user's password + Salt to hash the password
                            bcryptjs.hash(
                                formData.password,  // first ingredient
                                theSalt,    // second ingredient
                                (err, hashedPassword) => {
                                    // Replace the password in the form with the hash
                                    formData.password = hashedPassword;

                                    // Create the document
                                    // Use the UserModel to create a new document
                                    UserModel
                                    .create(
                                        formData
                                    )
                                    .then(
                                        (dbDocument) => {
                                            res.send(dbDocument);
                                        }
                                    )
                                    .catch(
                                        (error) => {
                                            console.log(error);
                                        }
                                    );
                                }
                            )
                        }
                    );                
                }
            }
        )
        .catch(
            (err)=>{
                console.log(err);
            }
        )
    }
);

// Export the routes for 'users'
module.exports = router;

*/