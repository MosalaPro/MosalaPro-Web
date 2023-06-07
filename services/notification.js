/*********************************************************************************************************
*	notification.js : Handles notifications events.
*   Author: Constant Pagoui.
*	Date: 04-14-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

const BookingModel = require("../models/booking");
const NotificationModel = require("../models/notification");
const PostRequestModel = require("../models/postRequest");
const UserModel = require("../models/user");


class Notification {

    async notifyBookingQuotation(req, res){

        const job = await BookingModel.findById(req.body.jobId).exec();
        
        if(job){
            const endUser = await UserModel.findOne({username: job.username}).exec();
            const notification = await new NotificationModel({
                causedByUserId: req.user._id,
                causedByItem: job.jobId,
                receiverId: endUser._id,
                title: "Service Provider has provided a quotation for your booking.",
                content: "Servive provider "+req.user.firstName+" "+req.user.lastName+" has sent you a  quotation for your booking. Check service provider's required budget.",
                createdAt: new Date(),
                lastUpdate: new Date()
            }).save().then(success=> {
                    console.log("NOTIFICATION:: Notification has been successfuly saved"); 
                
                }).catch(err=> {console.log("NOTIFICATION:: Error occured while creating notification.")});
            return;
        }
        
    }
    async readNotification(req, res){

        const notif = await NotificationModel.findByIdAndUpdate(req.body._id, {status: "read", lastUpdate: new Date()}).exec();
        if(notif){
            res.status(200).send({message:"Notification read with success.", status: 200});
            return true;
        }
        else {
            res.status(401).send({message:"Notification reading failed.", status: 401});
            return false;
        }
    }
    async deleteNotification(req, res){
        const notif = await NotificationModel.findByIdAndUpdate(req.body._id, {status: "archived", lastUpdate: new Date()}).exec();
        if(notif){
            res.status(200).send({message:"NOTIFICATION:: Notification removed with success.", status: 200});
            return true;
        }
        else {
            res.status(401).send({message:"NOTIFICATION:: Notification removing failed.", status: 401});
            return false;
        }
    }
    async getNotificationList(){

    }

    

}

module.exports = Notification;