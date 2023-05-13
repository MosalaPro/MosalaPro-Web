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
const CountryModel = require("../models/country");
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
      username : _.trim(_.toLower(req.body.username)),
      password : req.body.password
    });
    req.login(user, function(err){
          if (err) {
              console.log("USER:: An error occured : ", err);
              res.status(400).send({ error: "Wrong username or password" });
              return;
          } else {
              passport.authenticate("local")(req, res, function(){
                  if(req.user.verified === true){
                      console.log("User has been successfully logged in");
                      res.status(200).send({message:"Ok", status:200});
                      //res.redirect("/");
                      return;
                  }else{
                      res.status(402).send({message:"Your account has not been verified.", id:req.user._id, status: 402} );
                      req.logout(function(err){
                          if(err){return next(err);}
                      });
                      return;
                  }
                  
              });
          }
      });
      return;
  },
  register: async (req, res) => {
    let newUser = null;
    let password = "";
    let isPro = false;
    
    if(req.body.userType == "provider"){
      const category = await CategoryModel.findOne({name:req.body.pCategory}).exec();
      const countryCode = await CountryModel.findOne({name: req.body.country_p}).exec();
      newUser = await new UserModel({
        categoryId : category._id,
        category: category.name,
        firstName: _.capitalize(req.body.pFirstName),
        lastName: _.capitalize(req.body.pLastName),
        email: _.toLower(req.body.pEmail),
        phone: req.body.pPhone,
        address: req.body.pAddress,
        username: req.body.pEmail,
        countryCode: countryCode.phone_code,
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
      const countryCode = await CountryModel.findOne({name: req.body.country}).exec();
      newUser = new UserModel({
        firstName: _.capitalize(req.body.firstName),
        lastName: _.capitalize(req.body.lastName),
        email: _.trim(req.body.email),
        phone: req.body.phone,
        address: req.body.address,
        username: _.toLower(req.body.email),
        accountType: req.body.userType,
        countryCode: countryCode.phone_code,
        verified: false,
        country: req.body.country,
        subscriptionPlan: "",
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
          console.log("USER:: User already exists: "+user +" --");
          //return res.status(400).send("User with given email already exist!");
          const msg = "User with given email already exist!"; 
          res.status(300).send(msg);
          return;
          //res.render("register", {usr: newUser, cats: categories, msg: msg});
      }else{ 
          console.log("USER:: Email is solid, none found.");
          await UserModel.register(newUser, password, function(err, u){
          if (err) {
            console.log("USER:: User Registration error: "+err);
            res.status(409).send({error: err});
            return;
          } else {
              let tok = TokenModel.findOne({ userId: newUser._id }).exec();
              TokenModel.findByIdAndRemove(tok._id).exec();
              console.log("User has been successfully registered.");
              if(isPro){
                if(userEmailSender.sendProCode(6, newUser)){
                    //res.render("emailVerification", {usr: null, link:null, cats: categories, userId: newUser._id});
                    res.status(200).send({userId: newUser._id, status:200});
                    return;
                }else{
                    console.log("USER:: Could not send code!");
                    res.status(408).send({error: "USER:: Could not send code!"});
                    return;
                }
              }
              else{
                if(userEmailSender.sendCode(6, newUser)){
                    res.status(200).send({userId: newUser._id, status:200});
                      return;
                }else{
                    console.log("USER:: Could not send code!");
                    res.status(408).send({error: "USER:: Could not send code!"});
                    return;
                }
              }
          }
          });
          return;
          
      }
    }catch(error){
        res.status(400).send("USER:: An error occured : "+error);
        return;
    }
    return;
  
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
      else{
          console.log("USER:: User not found, could not resend email.");
          res.render("emailVerification", {usr: null, link:null, cats: categories, userId: req.params.id});
          return;
      }
      
    }catch(error){
        console.log("USER:: An error occured: "+ error);
        //res.status(400).send("USER:: An error occured : "+error);
        res.render("emailVerification", {usr: null, link:null, cats: categories, userId: req.params.id});
        return;
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
                  return res.status(400).send("An error occured (Email Verification)");
                  // TODO: activate error message on modal
              } else {
                      console.log("USER:: Email verification: User has been successfully logged in");
                      UserModel.updateOne({ _id: user._id}, {$set: {verified: true}} ).exec();
                      TokenModel.findByIdAndRemove(token._id).exec();
                      //res.redirect("/");
                      return res.status(200).send({msg:" Code verification successful!", status:200});
              }
          });
          return;
      }
      else{
          console.log("USER:: Email verification: Code entered does not match the one sent!");
          //res.redirect(req.get('referer'));
          return res.status(400).send("USER:: Email verification: Code entered does not match the one sent!");
          //res.render("emailVerification", {usr: null, cats: categories, userId: user._id});
      }
      
    } catch (error) {
      console.log("USER:: An error occured (Email verification): "+ error);
      return res.status(400).send("An error occured : "+error);
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
  getProviders : async()=>{
    const providers = await UserModel.find({accountType:"provider"}).limit(8).exec();
    return providers;
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
  },

  updateUser: async (userData) => {
    const result = await UserModel.findByIdAndUpdate(userData._id, userData);
    if(result)
      console.log("USER:: User updated");
    else
      console.log("USER:: Update failed");
  }, 
  updatePassword : async(req, res)=>{
      req.user.authenticate(req.body.accountPassword, function(err,model,passwordError){
        if(passwordError){
          console.log("USER:: Error occured while authenticating user: "+err);
          res.status(400).send('The given password is incorrect!!');
          return;
         } else if(model) {
          console.log(`USER:: Correct password ${model}`)
          req.user.setPassword(req.body.newPassword, function(){
            req.user.save();
            res.status(200).send('Password has been updated successfully!');
            return;
            });
          } else {
            console.log('USER:: Incorrect password');
            res.status(304).send("Inccorect password");
            return;
        }
    return;
    });
  },

  findUser: async(req, res)=>{
    let user = await UserModel.findOne({_id: req.params.id}).exec();
    if(user)
      return user;
    else{
      user = await UserModel.findOne({facebook_id: req.params.id}).exec();
      if(user)
        return user;
      else user = await UserModel.findOne({google_id: req.params.id}).exec();
        return user;
    }
    return;
  }
}
module.exports = UserService;
