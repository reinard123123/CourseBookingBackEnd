// Package for configuring environment variables.
require('dotenv').config();
// Passport is an authentication middleware for Node.js
const passport = require('passport');
// Strageties are algorithms that are used to for specific purposes. This case authenticating the application using the Google API Console project OAuth Client ID Credentials
const GoogleStrategy = require('passport-google-oauth20').Strategy;


// This configures Passport to use the Google OAuth 2.0
passport.use(new GoogleStrategy({
	clientID: process.env.clientID,
	clientSecret: process.env.clientSecret,
	callbackURL: "http://localhost:4000/users/google/callback",
	passReqToCallback: true
}, 

// This is the callback function that gets executed when a user is successfully authenticated
function(request, accessToken, refreshToken, profile, done){

	// 'done' is a parameter used in the function that functions as a callback.
	return done(null, profile);
}
));

// This function is used to serialize the user object into a session
passport.serializeUser(function(user, done){
	done(null, user);
});

// This function is used to deserialze the user object from the session.
passport.deserializeUser(function(user, done){
	done(null, user);
});