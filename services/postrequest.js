/*********************************************************************************************************
*	postrequest.js : Handle service request submitted by the end user etc.
*   Author: Constant Pagoui.
*	Date: 03-19-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/
const ProviderModel = require("../models/provider");
const UserModel = require("../models/user");
const CategoryModel = require("../models/category");
const PostRequestModel = require("../models/postRequest");
const passport = require("passport");

const PostRequestService =  {
  
    postServiceRequest: async(req, res)=>{
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
            }).array("files", 10); // Allow up to 10 files to be uploaded in one request
      
            upload(req, res, function (err) {
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
              console.log("In the method postRequest.");
              console.log(req.files); // Contains information about the uploaded files
              //Storing in db
              const newRequest = new PostRequestModel({
                username: req.body.username,
                requestTitle: req.body.requestTitle,
                requestDescription: req.body.requestDescription,
                requestCategory: req.body.requestCategory,
                budget: req.body.requestBudget,
                deadline: req.body.requestDeadline,
                status: "active",
                createdAt: new Date(),
                lastUpdate: new Date(),
                files: req.files.map((file) => file.filename),
              }).save().then(success =>{
                  console.log("Posted successfully!");
      
                  res.redirect("/")
              }).catch(err => {console.log("Error occured while saving into the db: "+err);});
             
            });
          } catch (e) {
            console.log(e);
            res.status(400).send({
              responseCode: 400,
              responseMessage: "Error posting service request: "+e,
            });
          }
        } 
      }


}

module.exports = PostRequestService;
