// Import the express function.
const express = require('express');

// Import CORS (Cross-Origin Resource Sharing) to allow external 
// HTTP requests to Express
const cors = require('cors');

//cloudinary CDN service

const cloudinary = require('cloudinary').v2;


const expressFormData = require('express-form-data');

//import passport and passport-jwt for user authentication
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecret = process.env.JWT_SECRET;


//this will tell passport where to find the jsonwebtoken and how to extract the payload
const passportJwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken,
    secretOrKey: jwtSecret
}

//this will tell the passport what todo with the payload
const passportjwt = (passport) => {
    passport.use(
        new JwtStrategy(
            passportJwtOptions,
            (jwtPayload,done) => {

                //tell passport what todo
                UserModel
                .findOne({_id: jwtPayload._id})
                .then(
                    (dbDocument) => {
                        //the done() will pass the dbDocument to Express
                        //the user's document then can be accessed via req.user
                        return done(null, dbDocument)
                    }
                )
                .catch(
                    (err) => {
                        if(err){
                            console.log(err);
                        }
                        return done(null,null)
                    }
                )
            }
        )
    )
}

require('dotenv').config();
// This will make 'server' an object with methods 
// for server operations
const server = express();


// Parse urlencoded bodies and where the Content-Type header matches the type option
server.use( express.urlencoded({ extended: false }) );
// Tell express to parse JSON data
server.use( express.json() );
// Tell express to allow external HTTP requests
server.use(cors());
// Tell express about expressFormData
server.use(expressFormData.parse());

// Import mongoose to connect to MongoDB Atlas
const mongoose = require('mongoose');

// Import the Model
const userRoutes = require('./routes/user-routes.js');
const productRoutes = require('./routes/product-routes.js');
const UserModel = require('./models/UserModel.js');


// NOTE: Make sure to enter your connection string.
const connectionString = process.env.MONGODB_CONNECTION_STRING;

const connectionConfig = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose
.connect(connectionString, connectionConfig)  // returns Promise
.then(
    () => {
        console.log('DB is connected');
    }
)
.catch(
    (dbError) => {
        console.log('error occurred', dbError);
    }
);

//configure cloudinary

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    }
);

// A method to process a GET HTTP request.
// server.get(path, callbackFunction)
server.get(
    '/',                        // http://localhost:3001/
    (req, res) => { 
        res.send("<html><head><title>Home</title></head><body><h1>Welcome to Dany's Website</h1></body></html>")
    }
);

server.use(
    '/users', userRoutes
);

server.use(
    '/products', productRoutes
);

// The .listen() will connect the server
// to an available Port
// server.listen(portNumber, callbackFunction)
server.listen(
    process.env.PORT || 3001,
    () => {
        console.log('Server is running on http://localhost:3001/');
    }
)