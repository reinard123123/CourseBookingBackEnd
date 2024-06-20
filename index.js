// [SECTION] Dependencies and Modules
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");

// Google Login
const passport = require('passport');
const session = require('express-session');
require('./passport');

// Allows our backend application to be available to our frontend application
// Allow us to control the app's "Cross Origin Resource Sharing" settings.
const cors = require("cors");

// [SECTION] Routes
// Allows access to routes defined within our application
const courseRoutes = require("./routes/course");
const userRoutes = require("./routes/user");


// [SECTION] Environment Setup
const port = 4000;

// [SECTION] Server Setup
const app = express();
// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// Allow all resources to access our backend application
app.use(cors());

// [SECTION] Google Login
// Creates a session with the given data
// resave prevents the session from overwriting the secret while the session is active
// saveUninitialized prevents the data from storing data in the session while the data has not been initialized
app.use(session({
	secret: process.env.clientSecret,
	resave: false,
	saveUninitialize: false
}));
// Initialize the passport package when the application runs
app.use(passport.initialize());
// Creates a session using the passport package
app.use(passport.session());


// [SECTION] Database Connection
// Connect to our MongoDB database
mongoose.connect("mongodb+srv://reinardbornillo15:reinard1231@reinard.akjsmz3.mongodb.net/b385-courseBookingAPI?retryWrites=true&w=majority&appName=reinard");

// Prompt a message in the terminal once the connection is "open"
mongoose.connection.once("open", () => console.log("Now connected to MongoDB Atlas."));


// [SECTION] Backend Routes

// http://localhost:4000/users
// Defines the "/users" string to be included for all user routes defined in the "user" router file.
// Groups all routes in userRoutes under "/users"
app.use("/courses", courseRoutes);
app.use("/users", userRoutes);




// [SECTION] Server Gateway Response
if(require.main === module){
	app.listen(port, () => console.log(`API is now online on port ${port}`))
}

module.exports = { app, mongoose };