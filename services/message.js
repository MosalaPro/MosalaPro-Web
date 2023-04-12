/*********************************************************************************************************
*	message.js : Handles message exchange between user and provider.
*   Author: Constant Pagoui.
*	Date: 04-11-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

const MessageModel = require("../models/message");

const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);


class Message {
    async sendMessage(req, res){
        console.log("Req info: "+req.body.userId+" - "+req.body.proId+" "+req.body.messageTitle+" - "+req.body.content);
        const newMessage = await new MessageModel({
            senderId: req.body.userId,
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
                console.log("MESSAGE:: Message has been sent successfully.");
                res.status(200).send({message:"Message sent successfully!", status:200} );
                return;
            }
        });
        return;
    }

}

module.exports = Message;