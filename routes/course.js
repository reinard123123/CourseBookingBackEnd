//[SECTION] Dependencies and Modules
const express = require("express");
const courseController = require("../controllers/course");
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

//[SECTION] Routing Component
const router = express.Router();

//[SECTION] Route for creating a course
router.post("/", verify, verifyAdmin, courseController.addCourse); 

router.get("/all", verify, verifyAdmin, courseController.getAllCourses);

router.get("/", courseController.getAllActive);

router.get("/:courseId", courseController.getCourse);

//router.post("/specific", courseController.getCourse);
//[SECTION] Route for retrieving all courses
// router.get("/", (req,res)=>{
// 	courseController.getAllCourses().then(resultFromController => res.send(resultFromController));
// }); 

// Updating a course
router.patch("/:courseId", verify, verifyAdmin, courseController.updateCourse);

// [Section] Route to archiving a course (Admin)
router.patch("/:courseId/archive", verify, verifyAdmin, courseController.archiveCourse);

// [Section] Route to activate a course (Admin)
router.patch("/:courseId/activate", verify, verifyAdmin, courseController.activateCourse);

// [Section] Route for searching courses by name
router.post("/search", courseController.searchCourseByName);

//[SECTION] Route for getting enrolled users by course
router.get('/:courseId/enrolled-users', courseController.getEmailsOfEnrolledUsers);


//[SECTION] Export Route System
// Allows us to export the "router" object that will be accessed in our "index.js" file
module.exports = router;