const jwt = require("jsonwebtoken");

// Used in the algorithm for encrypting our data which makes it difficult to decode the information without the defined secret keyword.
const secret = "CourseBookingAPI";



// [Section] Token Creation
/*
	Analogy
		Pack a gift and provide a lock with the secret code as the key
*/
module.exports.createAccessToken = (user) => {

	// When the user logs in, a token will be create with the user's information
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}

	// Generate a JSON web token using the jwt's sign method
	// Generates the token using the form data and the secret code with no additional options provided
	return jwt.sign(data, secret, {});
}

// [SECTION] Token Verfication
/*
	Analogy - Receive the gift and open the lock to verify if the sender is legitimate and the gist was not tampered with
*/
module.exports.verify = (req, res, next) => {

	console.log(req.headers.authorization);

	// contains sensitive data and especially our token
	let token = req.headers.authorization;

	if(typeof token === "undefined"){
		return res.status(401).send({ auth: "Failed. No Token." });

	} else {
		console.log(token);
		token = token.slice(7, token.length); //"Bearer aaa.bbb.ccc"
		console.log(token);

	// [SECTION] Token Decryption
		/*
        	Analogy
		        Open the gift and get the content
	        - Validate the token using the "verify" method decrypting the token using the secret code.
	        - token - the jwt token passed from the request headers.
	        - secret - the secret word from earlier which validates our token
	        - function(err,decodedToken) - err contains the error in verification, decodedToken contains the decoded data within the token after verification
        */
		jwt.verify(token, secret, function(err, decodedToken){

			if(err){
				return res.send({
					auth: "Failed",
					message: err.message
				});
			
			} else {
				// console.log("Result from verify method:");
				// console.log(decodedToken);

				req.user = decodedToken;

				next();
			}

		})
	}

}

module.exports.verifyAdmin = (req, res, next) => {

	console.log(`verifyAdmin: ${req.user}`);

	if(req.user.isAdmin){

		next();
	} else {

		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}

}

// Middleware to check if the user is authenticated with google auth
module.exports.isLoggedIn = (req, res, next) => {

	if(req.user){
		next();
	} else {
		res.sendStatus(401);
	}

}