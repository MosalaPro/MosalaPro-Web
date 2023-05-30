/*********************************************************************************************************
*	booking.js : Handles booking submitted by the end user directly to provider.
* Author: Constant Pagoui.
*	Date: 05-14-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/
const UserModel = require("../models/user");
const CategoryModel = require("../models/category");
const BookingModel = require("../models/booking");
const passport = require("passport");
const JobApplication = require("./jobApplication");
const JobApplicationModel = require("../models/jobApplication");
const PostRequestModel = require("../models/postRequest");

const BookingService =  {
  
    postBooking: async(req, res)=>{
        //TODO:Uncomment following if to enabled authentication layer
        const multer = require("multer");
        const fs = require("fs");
        if (req.isAuthenticated()) {
          try {
            const storage = multer.diskStorage({
              destination: function (req, file, cb) {
                const dir = "./postAttachments";
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir);
                }
      
                cb(null, dir); // Save files in the 'uploads' directory
              },
              filename: function (req, file, cb) {
                const uniquePrefix =
                  Date.now() + "-" + Math.round(Math.random() * 1e9);
                cb(null, uniquePrefix + "-" + file.originalname); // Set a unique filename for the uploaded file
              },
            });
      
            const upload = multer({
              storage: storage,
              limits: {
                fileSize: 1024 * 1024 * 100, // Limit the file size to 100MB
              },
              fileFilter: function (req, file, cb) {
                cb(null, true); // Allow any type of file
              },
            }).array("files", 10); // Allow up to 10 files to be uploaded in one booking
      
            upload(req, res, async function (err) {
              if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                console.log(err);
                res.status(400).send({
                  responseCode: 400,
                  responseMessage: "Error uploading files",
                });
              } else if (err) {
                // An unknown error occurred when uploading
                console.log(err);
                res.status(400).send({
                  responseCode: 400,
                  responseMessage: "Error uploading files",
                });
              }
      
              // Everything went fine
              console.log("In the bookings.");
              const pro = await UserModel.findOne({_id:req.body.providerId}).then(success=>{
                console.log("BOOKING:: Provider found: "+pro.firstname +" "+pro.lastName);
              }).catch(err=>{console.log("BOOKING:: Error occured while retrieving provider: "+err);});

              console.log(req.files); 
              const newRequest = new PostRequestModel({
                username: req.body.username,
                requestTitle:  req.body.bookingTitle,
                requestDescription: req.body.bookingDescription,
                budget: req.body.bookingBudget,
                deadline: req.body.bookingDeadline,
                status: "booked",
                requestCategory: pro.category,
                files: req.files.map((file) => file.filename),
                createdAt: new Date(),
                lastUpdate: new Date(),
              }).save().then(success =>{
                console.log("BOOKING:: Job request saved successfully!");
            }).catch(err => {console.log("BOOKING:: Error occured while saving jr into the db: "+err);});

              const newBooking = new BookingModel({
                username: req.body.username,
                providerId: req.body.providerId,
                bookingTitle: req.body.bookingTitle,
                bookingDescription: req.body.bookingDescription,
                budget: req.body.bookingBudget,
                deadline: req.body.bookingDeadline,
                jobId: newRequest._id,
                status: "active",
                createdAt: new Date(),
                lastUpdate: new Date(),
                files: req.files.map((file) => file.filename),
              }).save().then(success =>{
                  console.log("Posted successfully!");
      
              }).catch(err => {console.log("Error occured while saving into the db: "+err);});
             
            });
          } catch (e) {
            console.log(e);
            res.status(400).send({
              responseCode: 400,
              responseMessage: "Error posting service booking: "+e,
            });
          }
        } 
      },



}

module.exports = BookingService;
