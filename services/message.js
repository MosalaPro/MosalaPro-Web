/*********************************************************************************************************
*	message.js : Handles message exchange between user and provider.
*   Author: Constant Pagoui.
*	Date: 04-11-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

const MessageModel = require("../models/message");
const NotificationModel = require("../models/notification");
const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);


class Message {
    async sendMessage(req, res){
        console.log("Req info: "+req.user._id+" - "+req.body.proId+" "+req.body.messageTitle+" - "+req.body.content);
        const newMessage = await new MessageModel({
            senderId: req.user._id,
            recipientId:  req.body.proId,
            title: req.body.messageTitle,
            content: req.body.content,
            createdAt: new Date()
        }).save(function (err) {
            if (err) {
                console.log("MESSAGE:: Error occured while sending message: "+err);
                res.status(401).send({error:"Error occured while sending message"} );
                return;
            }else{
                const notification = new NotificationModel({
                    causedByUserId: req.user._id,
                    receiverId: req.body.proId,
                    icon: "fa-envelope",
                    title: "You have a new message.",
                    content: "Message from "+req.user.firstName+ " "+req.user.lastName+": <br>"+
                                            req.body.messageTitle+ " <br>"+  req.body.content,
                    createdAt: new Date(),
                    lastUpdate: new Date()
                }).save(async function (err) {
                    if (err) {console.log("MESSAGE:: Error occured while creating notification.");}
                    else console.log("MESSAGE:: Notification has been successfuly saved"); });

                console.log("MESSAGE:: Message has been sent successfully.");
                res.status(200).send({message:"Message sent successfully!", status:200} );
                return;
            }
        });
        return;
    }

}

module.exports = Message;