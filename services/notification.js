/*********************************************************************************************************
*	notification.js : Handles notifications events.
*   Author: Constant Pagoui.
*	Date: 04-14-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

const NotificationModel = require("../models/notification");


class Notification {

    async notify(req, res){

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