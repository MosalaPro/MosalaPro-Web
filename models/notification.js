/*********************************************************************************************************
*	notification.js : Defines notifications model.
*   Author: Constant Pagoui.
*	Date: 04-14-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

const mongoose = require("mongoose");

// Service Request
const notificationSchema = new mongoose.Schema({
    causedByUserId: { type: String, required:true },
    receiverId: { type: String, required:true },
    title:{type: String, required: true},
    content: String,
    status: {
        type: String,
        default: "unread"
    },
    createdAt:{
        type: Date,
        required: true
    },
    lastUpdate:{
        type: Date,
        required: true
    }
});
notificationSchema.plugin(require("mongoose-findorcreate"));

const NotificationModel = new mongoose.model("Notification", notificationSchema);

module.exports = NotificationModel;