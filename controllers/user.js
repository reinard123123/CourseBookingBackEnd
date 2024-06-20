// Dependencies and Modules
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const auth = require("../auth");


// Controller Functions

// Controller to check if the email already exists
/*
	Business Logic:
	1. Use mongoose "find" method to find duplicate emails
	2. Use the "then" method to return a response based on the result of the "find" method
*/
module.exports.checkEmailExists = (req, res) => {

	if(req.body.email.includes("@")){
		// The result is sent back to the client via the "then" method found in the route file
		return User.find({ email: req.body.email })
		.then(result => {

			// The find method return a record if a match is found
			if(result.length > 0) {

				// If there is a duplicate email, send true with 409 http status code back to the client
				return res.status(409).send({ error: "Duplicate Email Found" });

			// No duplicate email found. The user is not yet registered in the database
			} else {

				return res.status(404).send({ error: "Email not found" });
			}

		})
		.catch(err => {
			console.error("Error in find", err);
			return res.status(500).send({ error: "Error in Find" })
		});

	} else {
		res.status(400).send({ error: "Invalid Email" });
	}

}


// [SECTION] Controller for User Registration
/*
	Steps:
	1. Create a new User object using the mongoose model and the information from the request body
	2. Make sure that the password is encrypted
	3. Save the new User to the database
*/
module.exports.registerUser = (req,res) => {

    // Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        return res.status(400).send({ error: "Email invalid" });
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({ error: "Mobile number invalid" });
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({ error: "Password must be atleast 8 characters" });
    // If all needed requirements are achieved
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({ message: "Registered Successfully" }))
        .catch(err => {
        	console.error("Error in saving: ", err);
        	return res.status(500).send({ error: "Error in save" })
        })
    }

};

// [SECTION] Controller for User Authentication
/*
	Steps:
	1. Check the database if the user email exists
	2. Compare the password provided in the login form with the password stored in the database
	3. Generate/return a JSON web token if the user is successfully logged in and return false if not
*/
module.exports.loginUser = (req, res) => {

	if(req.body.email.includes("@")){
		return User.findOne({email: req.body.email})
		.then(result => {

			// User does not exist
			if(result === null){

				return res.status(404).send({ error: "No Email Found" });

			// User exists
			} else {

				// The compareSync method is used to compare a non encryted password from the login form to the encrypted password from the database and returns "true" or "false" value depending on the result.
				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				// If passwords match/result above is true
				if(isPasswordCorrect){

					// Generate an access token
					return res.status(200).send({
						access: auth.createAccessToken(result)
					})

				// Password do not match
				} else {

					return res.status(401).send({ error: "Email and passowrd do not match" });

				}

			}

		})
		.catch(err => {
			console.error("Error in find: ", err)
			return res.status(500).send({ error: "Error in find"})
		});

	} else {

		res.status(400).send({ error: "Invalid" });

	}
}

//[SECTION] Retrieve user details
/*
	Steps:
	1. Retrieve the user document using it's id
	2. Change the password to an empty string to hide the password
	3. Return the updated user record
*/
module.exports.getProfile = (req, res) => {

	try {
		
		return User.findById(req.user.id)
		.then(user => {

			if (user.id){
				user.password = "";
				return res.status(200).send({ user });

			} else {

				return res.status(404).send({ error: "User not found"});

			}

		})
		.catch(err => {
			console.error("Error in fetching user profile", err)
			return res.status(500).send({ error: 'Failed to fetch user profile' })
		})

	} catch (err){

		console.error("Error in user profile", err)
		return res.status(500).send({ error: 'Error in user profile' })
	}
};


//[SECTION] Controller for enrolling a user
/*
    Steps:
    1. Retrieve the user's id
    2. Change the password to an empty string to hide the password
    3. Return the updated user record
*/
module.exports.enroll = (req, res) => {

	console.log(req.user.id);
	console.log(req.body.enrolledCourses);

	// Process stops here and sends response IF user is an admin
	if(req.user.isAdmin){

		return res.status(403).send({ error: "Admin is forbidden" });
	}


	let newEnrollment = new Enrollment({
		userId: req.user.id,
		enrolledCourses: req.body.enrolledCourses,
		totalPrice: req.body.totalPrice
	});

	return newEnrollment.save()
	.then(enrolled => {
		return res.status(201).send({
			message: "Successfully Enrolled",
			enrolled: enrolled
		});
	})
	.catch(err => {
		console.error("Error in enrolling: ", err)
		return res.status(500).send({ error: "Error in enrolling" })
	});
	
}

//[SECTION] Get enrollments
/*
    Steps:
    1. Use the mongoose method "find" to retrieve all enrollments for the logged in user
    2. If no enrollments are found, return a 404 error. Else return a 200 status and the enrollment record
*/
module.exports.getEnrollments = (req, res) => {

    return Enrollment.find({userId : req.user.id})
        .then(enrollments => {
            
            if (enrollments.length > 0) {
                return res.status(200).send({ enrollments });
            }

            return res.status(404).send({ error: 'No enrollments found'});
        })
        .catch(err => {
        	console.error("Error in fetching enrollments")
        	return res.status(500).send({ error: 'Failed to fetch enrollments' })
        });
};

// Reset Password
module.exports.resetPassword = async (req, res) => {
	try{
		console.log(req.body);

		const {newPassword} = req.body;
		const {id} = req.user;

		// Hashing the new password in the req.body (newPassword)
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await User.findByIdAndUpdate(id, {password: hashedPassword});

		// Sending a success response
		res.status(200).json({message: "Password reset successfully"})
	}
	catch(error){
		console.error(error);
		res.status(500).json({message: "Internal Server Error"})
	}
}


// Update user profile
module.exports.updateProfile = async (req, res) => {
	try{
		// read the req.body's properties and values
		console.log(req.body);

		const {id} = req.user;
		const {firstName, lastName, mobileNo} = req.body;

		// Update user's profile in the DB
		const updatedUser = await User.findByIdAndUpdate(
				id,
				{firstName, lastName, mobileNo}
			)

		res.send(updatedUser);
	}
	catch (error){
		console.error(error);
		res.status(500).send({message: "Failed to update profile"})
	}
}

