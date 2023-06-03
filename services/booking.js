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
const NotificationModel = require("../models/notification");

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
              const pro = await UserModel.findOne({_id:req.body.providerId}).exec();
              if(pro){
                console.log("BOOKING:: Provider found.");
              }else{console.log("BOOKING:: Error occured while retrieving provider. "); return;};

              console.log(pro); 
              const newRequest = await new PostRequestModel({
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
              }).save();
              if(newRequest){
                console.log("BOOKING:: Job request saved successfully: "+ newRequest);
              }else{console.log("BOOKING:: Error occured while saving jr into the db: "); return;};

              const newBooking = await new BookingModel({
                username: req.body.username,
                providerId: req.body.providerId,
                bookingTitle: req.body.bookingTitle,
                bookingDescription: req.body.bookingDescription,
                budget: req.body.bookingBudget,
                deadline: req.body.bookingDeadline,
                category: newRequest.requestCategory,
                jobId: newRequest._id,
                status: "active",
                createdAt: new Date(),
                lastUpdate: new Date(),
                files: req.files.map((file) => file.filename),
              }).save();
              if(newBooking){
                  const notification = await new NotificationModel({
                  causedByUserId: req.user._id,
                  causedByItem: newRequest._id,
                  receiverId: req.body.providerId,
                  title: "Your have been booked for a service.",
                  content: req.user.firstName+" "+req.user.lastName+" has has booked you for the following service: <a href='/booking?b="+newBooking._id+"'>"+req.body.bookingTitle+"</a>",
                  createdAt: new Date(),
                  lastUpdate: new Date()
                    }).save().then(success=>{
                      console.log("BOOKING:: cancel booking notification- Notification sent to user.");
                  }).catch(err=>{
                    console.log("BOOKING:: cancel booking notification - Error occured: "+err);
                  });
                  console.log("Posted successfully!");
      
              }else{console.log("Error occured while saving into the db: "+err);};
             
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

      confirmBooking: async (req, res)=>{
          const booking = await BookingModel.findByIdAndUpdate(req.body.bookingId, {status:"in-progress", lastUpdate: new Date()}).exec();

          if(booking){
          const job = await PostRequestModel.findByIdAndUpdate(booking.jobId, {status: "in-progress", lastUpdate: new Date()}).exec();
          console.log("BOOKING:: booking has been successfully confirmed");
          const customer = await UserModel.findOne({username: booking.username}).exec();
          const notification = await new NotificationModel({
            causedByUserId: req.user._id,
            causedByItem: job._id,
            receiverId: customer._id,
            title: "Your booking has been confirmed.",
            content: "Servive provider "+req.user.firstName+" "+req.user.lastName+" has confirmed your service booking. Your service request is in progress.",
            createdAt: new Date(),
            lastUpdate: new Date()
              }).save().then(success=>{
                console.log("BOOKING:: cancel booking notification- Notification sent to user.");
            }).catch(err=>{
              console.log("BOOKING:: cancel booking notification - Error occured: "+err);
            });
          res.status(200).send({status: 200, message: "Ok"});
          return;
        }else{
          console.log("BOOKING:: Error occured. Could not find booking.");
          res.status(401).send({status: 401, message: "Error"});
          return;
        }

        return;
      },

      cancelBooking: async (req, res)=>{
        const booking = await BookingModel.findByIdAndUpdate(req.body.bookingId, {status:"cancelled", lastUpdate: new Date()}).exec();
        if(booking){
          const job = await PostRequestModel.findByIdAndUpdate(booking.jobId, {status: "active", lastUpdate: new Date()}).exec();
          console.log("BOOKING:: booking has been successfully cancelled");
          const customer = await UserModel.findOne({username: booking.username}).exec();
          const notification = await new NotificationModel({
              causedByUserId: req.user._id,
              causedByItem: job._id,
              receiverId: customer._id,
              title: "Your booking has been cancelled.",
              content: "Servive provider "+req.user.firstName+" "+req.user.lastName+" has cancelled your service booking. Your request has been listed for other providers to apply.",
              createdAt: new Date(),
              lastUpdate: new Date()
                }).save().then(success=>{
                  console.log("BOOKING:: cancel booking notification- Notification sent to user.");
              }).catch(err=>{
                console.log("BOOKING:: cancel booking notification - Error occured: "+err);
              });

          res.status(200).send({status: 200, message: "Ok"});
          return;
        }else {
          console.log("BOOKING:: Error occured. Could not find booking.");
          res.status(401).send({status: 401, message: "Error"});
          return;
        };

        return;
      }

}

module.exports = BookingService;
