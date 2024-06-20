//[SECTION] Dependencies and Modules
const Course = require("../models/Course");

//[SECTION] Create a course
/*
	Steps: 
	1. Instantiate a new object using the Course model and the request body data
	2. Save the record in the database using the mongoose method "save"
	3. Use the "then" method to send a response back to the client appliction based on the result of the "save" method
*/
module.exports.addCourse = (req, res) => {
	
		try {
			// Creates a variable "newCourse" and instantiates a new "Course" object using the mongoose model
			// Uses the information from the request body to provide all the necessary information
			let newCourse = new Course({
				name : req.body.name,
				description : req.body.description,
				price : req.body.price
			});

			Course.findOne({ name: req.body.name })
			.then(existingCourse => {

					if(existingCourse) {
							return res.status(409).send({ error: 'Course already exists.' });
					}

					return newCourse.save()
					.then(savedCourse => res.status(201).send({ savedCourse }))
					.catch(err => {

							console.error("Error in saving the course: ", err);

							return res.status(500).send({ error: 'Failed to save the course.' });
					});

			})
			.catch(err => {

					console.error("Error in finding the course: ", err);

					return res.status(500).send({
						error: "Error finding the course"
					});
			})

		} catch(err) {

				console.error("Error in finding the course: ", err);

				return res.status(500).send({
					error: "Error creating newCourse object."
				});
		}

}; 


//[SECTION] Retrieve all courses
/*
	Steps: 
	1. Retrieve all courses using the mongoose "find" method
	2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.getAllCourses = (req, res) => {

	return Course.find({})
	.then(courses => {

			if(courses.length > 0){

					return res.status(200).send({ courses });

			} else {

					return res.status(200).send({ message: 'No courses found.' });
			}

	})
	.catch(err => {
			console.error("Error in finding all courses: ", err);
			return res.status(500).send({ error: 'Error finding courses.' });
	});

};

module.exports.getAllActive = (req, res) => {
	Course.find({ isActive: true })
	.then(courses => {

		if(courses.length > 0){
				return res.status(200).send({ courses });
		}
		// If there are no results found
		else {

			return res.status(200).send({ message: 'No active courses found.' });
		}

	})
	.catch(err => {	

			console.error("Error in finding active courses: ", err);
			return res.status(500).send({ error: 'Error finding active courses.' });

	});
}

module.exports.getCourse = (req, res) => {
	Course.findById(req.params.courseId)
	.then(course => {

			if(!course){
					return res.status(404).send({ error: 'Course not found' });
			} 

			return res.status(200).send({ course })

	})
	.catch(err => {
			console.error("Error in fetching the course: ", err);
			return res.status(500).send({ error: 'Failed to fetch course' })
	});
			
}

/* Update a course
	Steps:
	1. Create an object containing the data from the request body.
	2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
	3. Use the "then" method to send a response back to the client appliction based on the result of the "find" method

*/
module.exports.updateCourse = (req, res) => {
	
	// Make variable names more descriptive to enhance code readability
	const courseId = req.params.courseId;

	let updatedCourse = {
		name: req.body.name,
		description: req.body.description,
		price: req.body.price
	}

	return Course.findByIdAndUpdate(courseId, updatedCourse, { new: true })
	.then(updatedCourse => {

		if(updatedCourse){
			res.status(200).send({
					message: 'Course updated successfully',
					updatedCourse: updatedCourse
			});
		}
		else{
			res.status(404).send({ error: 'Course not found.'});
		}

	})
	.catch(err => {
			console.error("Error in updating a course: ", err);
			return res.status(500).send({ error: 'Error in updating a course.'});
	})
}


//[SECTION] Archive a course
  /*
    Steps: 
    1. Create an object and with the keys to be updated in the record
    2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
    3. If a course is updated send a response of "true" else send "false"
    4. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
  */
module.exports.archiveCourse = (req, res) => {

		if(req.user.isAdmin === false){
			return res.status(403).send({ error: "Forbidden" });
		}

    let updateActiveField = {
        isActive: false
    }

      return Course.findByIdAndUpdate(req.params.courseId, updateActiveField)
      .then(archiveCourse => {
          if (archiveCourse) {
              res.status(200).send({
              		message: 'Course archived successfully',
              		archiveCourse: archiveCourse
              });
          } else {
              res.status(400).send({ error: 'Course not found'});
          }
      })
      .catch(err => {
      		console.error("Error in archiving a course: ", err);
      		return res.status(500).send({ error: 'Error in archiving a course.'});
      });
};

// [SECTION] Activating a Course
module.exports.activateCourse = (req, res) => {

		if(req.user.isAdmin === false){
			return res.status(403).send({ error: "Forbidden" });
		}

    let updateActiveField = {
        isActive: true
    }

      return Course.findByIdAndUpdate(req.params.courseId, updateActiveField)
      .then(activateCourse => {
          if (activateCourse) {
              res.status(200).send({
              		message: "Course activated successfully",
              		activateCourse: activateCourse
              });
          } else {
              res.status(400).send({ error: "Course not found" });
          }
      })
      .catch(err => {
      		console.error("Error in activating a course: ", err);
      		return res.status(500).send({ error: 'Error in activating a course.'});
      });
};


// Search course by name
module.exports.searchCourseByName = async (req, res) => {
	try{
		// read the req.body's properties and values
		const {courseName} = req.body;

		// Use a regular expression to perform a case-insensitive search
		const courses = await Course.find({
			name: {$regex: courseName, $options: "i"}
		})

		res.json(courses);

	}
	catch(error){
		console.error(error);
		res.status(500).json({error: "Internal Server Error"})
	}
}

//[SECTION] Get enrolled users via course ID
// Contextualize it to use our module export approach.
module.exports.getEmailsOfEnrolledUsers = async (req, res) => {
	const courseId = req.params.courseId; // Use req.params instead of req.body

	try {
		// Find the course by courseId
		const course = await Course.findById(courseId);
	
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}
	
		// Get the userIds of enrolled users from the course
		const userIds = course.enrollees.map(enrollee => enrollee.userId);
	
		// Find the users with matching userIds
		const enrolledUsers = await User.find({ _id: { $in: userIds } }); // Use userIds variable instead of undefined "users"
	
		// Extract the emails from the enrolled users
		const emails = enrolledUsers.map(user => user.email); // Use map instead of forEach
	
		res.status(200).json({ userEmails: emails }); // Use the correct variable name userEmails instead of emails
	} catch (error) {
		res.status(500).json({ message: 'An error occurred while retrieving enrolled users' });
	}
};