/*********************************************************************************************************
*	App.js : gateway of the application, handles requirements, tools and resources that need to be used.
*   Author: Constant Pagoui.
*	Date: 03-01-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

//------------------REQUIREMENTS & TOOLS ------------------------------//

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const models = require(__dirname + "/models/models.js");
const compression = require("compression");
const session = require("express-session");
const passport = require("passport");

// const emailValidator = required("email-validator");

//------------------DATABASE CONNECTION ------------------------------//

mongoose.connect(process.env.DBURI, {
	useNewUrlParser:true,
	useUnifiedTopology: true,
	family:4
}).then(success=>{
	console.log("Successfully connected to the database.");
}).catch(err=>{console.log("Error occured while connecting to the database.\n"+err);});

//------------------GENERAL CONFIGURATION ------------------------------//

const app = express();
app.use(compression());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

require('./api-routes/routes')(app);

//------------------SETTING UP PORT------------------------------//
app.listen(process.env.PORT || 3000, function() {
  console.log("Server successfully started online and locally on port 3000");
});

