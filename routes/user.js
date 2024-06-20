// Dependencies and Modules
const express = require("express");
const userController = require("../controllers/user");
const passport = require('passport');

// Import the auth module
const { verify, isLoggedIn } = require("../auth");

// Routing Component
const router = express.Router();


// [SECTION] Routes

// Route for checking if the user's email already exists in the database
// router.post("/checkEmail", (req, res) => {

// 	// Invokes the "checkEmailExists" function from the controller file to communicate with our database
// 	// Passes the "body" property of our request object "req" to the controller function
// 	userController.checkEmailExists(req.body).then(resultFromController => res.send(resultFromController));
// });

router.post("/checkEmail", userController.checkEmailExists);

router.post("/register", userController.registerUser);
/*
// Route for user registration
router.post("/register", (req, res) => {

	userController.registerUser(req.body).then(resultFromController => res.send(resultFromController));
});*/

// Route for user authentication (login)
router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getProfile);


// Route to enroll user to a course
router.post("/enroll", verify, userController.enroll);

//[SECTION] Route to get the user's enrollements array
router.get('/getEnrollments', verify, userController.getEnrollments);

// [SECTION] Google Login
// Route for initializing the Google OAuth consent screen
router.get('/google', passport.authenticate('google', {
	// Scopes that are allowed when retrieving user data
	scope: ['email', 'profile'],
	// Allows the OAuth consent screen to be "prompted" when the route is accessed to select a new account everytime the user tries to login.
	prompt: "select_account"
}));

// [SECTION] Route for callback URL for Google OAuth authentication
router.get('/google/callback', passport.authenticate('google', 
	{
		// If authentication is unsuccessful, redirect to "/users/failed" route
		failureRedirect: '/users/failed'
	}),
	// If authetication is successful, redirect to "/users/success" route
	function(req, res){
		res.redirect('/users/success');
	}

);

// [SECTION] Route for filed Google OAuth authentication
router.get('/failed', (req, res) => {
	
	console.log('User is not authenticated');
	res.send("Failed");
});

// [SECTION] Route for successfull authentication
router.get('/success', isLoggedIn, (req, res) => {

	console.log('You are logged in!');
	console.log(req.user);

	res.send(`Welcome ${req.user.displayName}`);

});

// [SECTION] Route for logginout of the application
router.get('/logout', (req, res) => {

	req.session.destroy((err) => {
		if(err){
			console.log('Error while destroying session: ', err);
		} else {
			req.logout(() => {
				console.log('You are logged out');
				res.redirect('/');
			});
		}
	});

});

// Reset user password route
router.put("/reset-password", verify, userController.resetPassword);

// Update user profile (firstName,lastName, mobileNo)
router.put("/profile", verify, userController.updateProfile);

// Export Route System
module.exports = router;