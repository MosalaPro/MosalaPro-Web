/*********************************************************************************************************
*	jobApplication.js : Handles job application operations performed by providers.
*   Author: Constant Pagoui.
*	Date: 04-13-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

const JobApplicationModel = require("../models/jobApplication");
const PostRequestModel = require("../models/postRequest");
const UserModel = require("../models/user");
const NotificationModel = require("../models/notification");


class JobApplication {
    async apply(req, res){
        console.log("Req info: "+req.body.username+" - "+req.user._id+" - "+req.body.jobId);
        const user = await UserModel.findOne({username: req.body.username}).exec();
        const newJobApplication = await new JobApplicationModel({
            userId: user._id,
            providerId:  req.user._id,
            jobId: req.body.jobId,
            createdAt: new Date(),
            lastUpdate: new Date()
        }).save( async function (err) {
            if (err) {
                console.log("JOBAPPLICATION:: Error occured while saving application: "+err);
                res.status(401).send({error:"Error occured while sending message", status: 300} );
                return;
            }else{
                console.log("JOBAPPLICATION:: Application has been sent successfully.");
                const notification = new NotificationModel({
                    causedByUserId: req.user._id,
                    receiverId: user._id,
                    title: "A service provider has applied for your service request.",
                    content: "Servive provider "+req.user.firstName+" "+req.user.firstName+" has applied for your service request. Open to check service provider's profile and hire.",
                    createdAt: new Date(),
                    lastUpdate: new Date()
                }).save(async function (err) {
                    if (err) {console.log("JOBAPPLICATION:: Error occured while creating notification.");}
                    else console.log("JOBAPPLICATION:: Notification has been successfuly saved"); });

                res.status(200).send({message:"JOBAPPLICATION:: Application sent successfully!", status:200} );
                return;
            }
        });
        return;
    }

}

module.exports = JobApplication;