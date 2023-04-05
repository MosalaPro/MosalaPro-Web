/*********************************************************************************************************
*	User.js : Handles user operations and requests.
* Author: Constant Pagoui.
*	Date: 03-18-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

const UserModel = require("../models/user");
const TokenModel = require("../models/token");
const CategoryModel = require("../models/category");

const EmailSender = require("../services/emailsender");
const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const passport = require("passport");
const userEmailSender = new EmailSender();

passport.use(UserModel.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  UserModel.findById(id, function(err, user) {
    done(err, user);
  });
});

const UserService = {
  login: async (req, res) => {
    const user = new UserModel({
      username : _.trim(req.body.username),
      password : req.body.password
    });
    req.login(user, function(err){
          if (err) {
              console.log(err);
              // TODO: activate error message on modal
          } else {
              passport.authenticate("local")(req, res, function(){
                  if(req.user.verified === true){
                      console.log("User has been successfully logged in");
                      
                  }else{
                      console.log("User has not been verified");
                      req.logout(function(err){
                          if(err){return next(err);}
                      });
                  }
                  if(req.body.link){
                      console.log("Redirecting to link: "+req.body.link);
                      res.redirect(req.body.link);
                  }else
                      res.redirect("/");
              });
          }
      });
  },
  register: async (req, res) => {
    let newUser = null;
    let password = "";
    let isPro = false;
    if(req.body.userType == "provider"){
      const category = await CategoryModel.findOne({name:req.body.pCategory}).exec();
      newUser = await new UserModel({
        categoryId : category._id,
        category: category.name,
        firstName: _.capitalize(req.body.pFirstName),
        lastName: _.capitalize(req.body.pLastName),
        email: req.body.pEmail,
        phone: req.body.pPhone,
        address: req.body.pAddress,
        username: req.body.pEmail,
        country: req.body.country_p,
        city: req.body.city_p,
        accountType: req.body.userType,
        createdAt: new Date(),
        lastUpdate: new Date()
      });
      isPro = true;
      password = req.body.pPassword;
    }
    else{
      newUser = new UserModel({
        firstName: _.capitalize(req.body.firstName),
        lastName: _.capitalize(req.body.lastName),
        email: _.trim(req.body.email),
        phone: req.body.phone,
        address: req.body.address,
        username: req.body.email,
        accountType: req.body.userType,
        verified: false,
        country: req.body.country,
        city: req.body.city,
        createdAt: new Date(),
        lastUpdate: new Date()
      });
      password = req.body.password;
    }
    

    try{
      console.log("USER:: User email that always exists: "+newUser.email);
      let user = await UserModel.findOne({email: newUser.email}).exec();
      if(user){
          console.log("USER:: User that's always there: "+user +" --");
          //return res.status(400).send("User with given email already exist!");
          const msg = "User with given email already exist!"; 
          res.redirect("/");
          return;
          //res.render("register", {usr: newUser, cats: categories, msg: msg});
      }else{ 
          console.log("USER:: Email is solid, none found.");
          await UserModel.register(newUser, password, function(err, u){
          if (err) {
            console.log("USER:: User Registration error: "+err);
            // TODO: activate error message on modal

          } else {
              let tok = TokenModel.findOne({ userId: newUser._id }).exec();
              TokenModel.findByIdAndRemove(tok._id);
              console.log("User has been successfully registered.");
          }
              //res.redirect("/");
          });
          if(isPro){
            if(userEmailSender.sendProCode(6, newUser)){
                res.render("emailVerification", {usr: null, link:null, cats: categories, userId: newUser._id});
            }else{
                console.log("USER:: Could not send code!");
            }
          }
          else{
            if(userEmailSender.sendCode(6, newUser)){
              res.render("emailVerification", {usr: null, link:null, cats: categories, userId: newUser._id});
          }else{
              console.log("USER:: Could not send code!");
          }
          }
          
      }
    }catch(error){
        res.status(400).send("USER:: An error occured : "+error);
    }
  
  },

  resendCode: async(req, res)=>{
    try{
      let user = await UserModel.findOne({_id: req.params.id}).exec();
      if(user){
          console.log("USER:: User found, resending email..");
          let tok = await TokenModel.findOne({ userId: user._id }).exec();
          await TokenModel.findByIdAndRemove(tok._id).exec();

          if(userEmailSender.sendCode(6, user)){
            res.render("emailVerification", {usr: null, link:null, cats: categories, userId: user._id});
          }else{
              console.log("USER:: Could not resend code!");
          }
      }
      else   
          console.log("USER:: User not found, could not resend email.");
      
    }catch(error){
        console.log("USER:: An error occured: "+ error);
        res.status(400).send("USER:: An error occured : "+error);
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const user = await UserModel.findOne({ _id: req.body.id }).exec();
      if (!user) return res.status(400).send("USER:: User : Invalid link. User id: "+req.body.id);
  
      const token = await TokenModel.findOne({ userId: user._id}).exec();

      if (!token) return res.status(400).send("USER:: Token : Invalid link");
      
      const codeEntered = ""+req.body.first + req.body.second + req.body.third + req.body.fourth + req.body.fifth + req.body.sixth;
      if(codeEntered == token.token){
          console.log("USER:: Code verification successful! logging in the user..")
          req.login(user, function(err){
              if (err) {
                  console.log("USER:: An error occured (Email Verification): "+err);
                  // TODO: activate error message on modal
              } else {
                      console.log("USER:: Email verification: User has been successfully logged in");
                      UserModel.updateOne({ _id: user._id}, {$set: {verified: true}} ).exec();
                      TokenModel.findByIdAndRemove(token._id).exec();
                      res.redirect("/");
              }
          });
          
      }
      else{
          console.log("USER:: Email verification: Code entered does not match the one sent!");
          res.redirect(req.get('referer'));
          //res.render("emailVerification", {usr: null, cats: categories, userId: user._id});
      }
      
    } catch (error) {
      console.log("USER:: An error occured (Email verification): "+ error);
      res.status(400).send("An error occured : "+error);
    }
  },
  find: async(query) => {
    const filters = {};
    if(query?.country_search && query?.country_search !== "Country")
      filters.country = query.country_search;
    
    if(query?.city_search && query?.city_search !== "Select City")
      filters.city = query.city_search;

    if(query?.search !== "")
      filters.role = new RegExp(query.search, "i");

    filters.accountType = "provider";

    if(query?.category !== "" && query?.category !== "Select Category")
      filters.category = query.category;

    const res = await UserModel.find(filters);
    return res;
  },
  update: async (data) => {
    data.skills = data.skills.toString().split(",").filter(skill => skill !== '');
    const res = await UserModel.findByIdAndUpdate(data._id, data);
    if(!res)
      return false;
    return true;
  },
  createSubscription: async (_id, type) => {
    let period = 0;
    if(type === "bronze")
      period = 90;
    else if(type === "gold")
      period = 180;
    else if(type === "platinum")
      period = 365;
    
    const expire = new Date();
    expire.setDate(expire.getDate() + period);
    const subscription = {
      expire: expire.valueOf(),
      plan: type,
    }
    const res = await UserModel.findByIdAndUpdate(_id, { subscription });
  }
}



module.exports = UserService;
