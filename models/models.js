/*********************************************************************************************************
*	Model.js : Handle communication with the DB, data retrieval, data insertion, authentification, etc.
*   Author: Constant Pagoui.
*	Date: 03-01-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

require("dotenv").config();
const schemas = require(__dirname+"/schemas/schemas.js");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook");
const findOrCreate = require("mongoose-findorcreate");
mongoose.set('strictQuery', false);

const User = new mongoose.model("User", schemas.getUserSchema());
const Provider = new mongoose.model("Provider", schemas.getProviderSchema());
const Category = new mongoose.model("Category", schemas.getCategorySchema());

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
        User.findOrCreate({googleId: profile.id}, function(err, user){
            return cb(err, user);
        });
    })

);

passport.use(new FacebookStrategy({
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'email']
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
        });
    }
));

exports.registerUser = function(req, res){

    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        username: req.body.email,
        createdAt: new Date(),
        lastUpdate: new Date()
      })

    User.register(newUser, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          // TODO: activate error message on modal

        } else {
          passport.authenticate("local")(req, res, function(){
            console.log("User has been successfully registered");
            res.redirect("/");
          });
        }
    });
}

exports.loginUser = function(req, res){
    const user = new User({
		username : req.body.username,
		password : req.body.password
	});
	req.login(user, function(err){
        if (err) {
            console.log(err);
            // TODO: activate error message on modal
        } else {
            passport.authenticate("local")(req, res, function(){
                console.log("User has been successfully logged in");
                res.redirect("/");
            });
        }
    });
}

exports.registerProvider = function(req, res){

    const proCategory = Category.findOrCreate({name:req.body.category});
    const newProvider = new Provider({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        username: req.body.email,
        category: proCategory,
        createdAt: new Date(),
        lastUpdate: new Date()
      })

    User.register(newProvider, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          // TODO: activate error message on modal

        } else {
          passport.authenticate("local")(req, res, function(){
            console.log("Provider has been successfully registered");
            res.redirect("/");
          });
        }
    });
}

exports.loginProvider = function(req, res){
    const user = new Provider({
		username : req.body.username,
		password : req.body.password
	});
	req.login(user, function(err){
        if (err) {
            console.log(err);
            // TODO: activate error message on modal
        } else {
            passport.authenticate("local")(req, res, function(){
                console.log("Provider has been successfully logged in");
                res.redirect("/");
            });
        }
    });
}

exports.showHomePage = function(req, res){
    Category.find({"name":{$ne:null}}, function(err, foundCategories){
        if(err){console.log(err);}
        else{
            console.log("Cats found: "+foundCategories.length);
            if(req.isAuthenticated()){
                res.render("home", {usr: req.user, cats: foundCategories});
            }
            else
                res.render("home", {usr: null, cats: foundCategories});
        }
    });
    
}