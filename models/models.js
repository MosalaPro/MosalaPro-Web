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
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook");
const express = require("express");
mongoose.set('strictQuery', false);
const bodyParser = require("body-parser");
const session = require("express-session");
const root = require('path').resolve('./');
const passport = require("passport");

const User = mongoose.model("User", schemas.getUserSchema());
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

const Provider = new mongoose.model("Provider", schemas.getProviderSchema());
const Category = new mongoose.model("Category", schemas.getCategorySchema());
const City = new mongoose.model("City", schemas.getCitySchema());
const State = new mongoose.model("State", schemas.getStateSchema());
const Country = new mongoose.model("Country", schemas.getCountrySchema());


categories = [];
Category.find({"name":{$ne:null}}, function(err, foundCategories){
    if(err){
        console.log(err);
    }
    else{
        console.log("Categories found: "+foundCategories.length);
        categories = foundCategories;
    }
});

countries = [];
Country.find({"name":{$ne:null}}, function(err, foundCountries){
    if(err){console.log(err);}
    else{
        console.log("Countries found: "+foundCountries.length);
        countries = foundCountries;
    }
});

exports.getUserModel = function(){
    return User;
}

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
    
    if(req.isAuthenticated()){
        res.render("home", {usr: req.user, cats: categories});
    }
    else
        res.render("home", {usr: null, cats: categories});
    
}

exports.showFindServicesPage = function(req, res){

            
    if(req.isAuthenticated()){
        res.render("findServices", {usr: req.user, map_api:process.env.GOOGLE_MAP_API});
    }
    else
        res.render("findServices", {usr: null, map_api:process.env.GOOGLE_MAP_API});
}

exports.showAboutUsPage = function(req, res){

    if(req.isAuthenticated()){
        res.render("about_us", {usr: req.user});
    }
    else
        res.render("about_us", {usr: null});
    
}

exports.showContactUsPage = function(req, res){

    if(req.isAuthenticated()){
        res.render("contact", {usr: req.user});
    }
    else
        res.render("contact", {usr: null});
    
}

exports.getCities = function(country){
    City.find({"country_name": country}, function(err, foundCities){
        if(err){
            console.log(err);
        }else{
            return foundCities;
        }
    });
}

exports.getStates = function(country){
    State.find({"country_name": country}, function(err, foundStates){
        if(err){
            console.log(err);
        }else{
            return foundStates;
        }
    });
}

exports.showForProPage = function(req, res){

    if(req.isAuthenticated()){
        res.render("forProfessionals", {usr: req.user});
    }
    else
        res.render("forProfessionals", {usr: null});
}

exports.showServiceRequestPage = function(req, res){

    if(req.isAuthenticated()){
        // render service requests page for users
        res.render("forProfessionals", {usr: req.user});
        }
        // otherwise send user to the login page 
}

    const axios = require('axios');

    exports.sendEmail = async function (name, email, subject, message, req, res) {
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.email,
            address: req.body.address,
            createdAt: new Date(),
            lastUpdate: new Date()
        });
        const data = JSON.stringify({
            "Messages": [{
            "From": {"Email": process.env.EMAIL_SENDER, "Name": "MosalaPro"},
            "To": [{"Email": email, "Name": name}],
            "Subject": subject,
            "TextPart": message
            }]
        });

        const config = {
            method: 'post',
            url: 'https://api.mailjet.com/v3.1/send',
            data: data,
            headers: {'Content-Type': 'application/json'},
            auth: {username: process.env.MAILJET_API_KEY, password: process.env.MAILJET_API_SECRET},
        };
        res.render("emailVerification", {usr: newUser, cats: req.cats});
        return axios(config)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
            console.log(error);
            });

    }
