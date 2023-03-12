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
const passportLocalMongoose = require("passport-local-mongoose");

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


const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook");

const findOrCreate = require("mongoose-findorcreate");

const app = express();
mongoose.set('strictQuery', false);

app.use(express.static("public"));
app.use(compression());
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


const User = models.getUserModel();

passport.use(User.createStrategy()); 

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy ({
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	callbackURL: process.env.GOOGLE_CALLBACK_URL,
	userProfileURL: process.env.GOOGLE_PROFILE_URL
},
	function(accessToken, refreshToken, profile, cb){
		console.log(profile);

		User.findOne({google_id: profile.id}, function(err, existingUser){
			if(existingUser){
				return cb(err, existingUser);
			}else{
				var newUser = new User({
					google_id : profile.id,
					google_photo : profile.photos[0].value,
					email : profile.email,
					display_name : profile.displayName,
					username: profile.email,
					firstName: profile._json.given_name,
					lastName: profile._json.family_name,
					createdAt: new Date(),
					lastUpdate: new Date()
				}).save(function(err,newUser){
					if(err) throw err;
					return cb(err, newUser);
				});
			}
		});

	})

);

passport.use(new FacebookStrategy({
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL,
	profileFields: ['id', 'displayName', 'link', 'name', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
	  console.log(profile);
	User.findOne({facebook_id: profile.id}, function(err, existingUser){
		if(existingUser){
			return cb(err, existingUser);
		}else{
			var newUser = new User({
				facebook_id : profile.id,
				facebook_photo : profile.photos[0].value,
				email : profile.email,
				display_name : profile.displayName,
				username: profile.email,
				firstName: profile._json.first_name,
				lastName: profile._json.last_name,
				createdAt: new Date(),
				lastUpdate: new Date()
			}).save(function(err,newUser){
				if(err) throw err;
				return cb(err, newUser);
			});
		}
	});
   
  }
));


app.get("/auth/google",
	passport.authenticate("google", {scope: ["profile"]}));
	
app.get("/auth/google/mosalapro", 
	passport.authenticate("google", {failureRedirect: "/login"}), function(err, res){
		res.redirect("/");
	});
	
app.get("/auth/facebook",
  passport.authenticate("facebook"));

app.get('/auth/facebook/mosalapro',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
	console.log("successful FB");
    res.redirect('/');
});
  
require('./api-routes/routes')(app);


//------------------SETTING UP PORT------------------------------//
app.listen(process.env.PORT || 3000, function() {
  console.log("Server successfully started online and locally on port 3000");
});

