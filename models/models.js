/*********************************************************************************************************
*	Model.js : Handle communication with the DB, data retrieval, data insertion, authentification, etc.
*   Author: Constant Pagoui.
*	Date: 03-01-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

require("dotenv").config();
const {categorySchema, countrySchema, citySchema, stateSchema, 
    locationSchema, tokenSchema, userSchema, providerSchema, postRequestSchema } = require(__dirname+"/schemas/schemas.js");

const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const passport = require("passport");

const User = mongoose.model("User", userSchema);

const PostRequest = mongoose.model("PostRequest", postRequestSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

const Provider = new mongoose.model("Provider", providerSchema);
const Category = new mongoose.model("Category", categorySchema);
const City = new mongoose.model("City", citySchema);
const State = new mongoose.model("State", stateSchema);
const Country = new mongoose.model("Country", countrySchema);
const Location = new mongoose.model("Location", locationSchema);
const Token = new mongoose.model("Token", tokenSchema);

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
exports.getProviderModel = function(){
    return Provider;
}
exports.getCountryModel = function(){
    return Country;
}
exports.getLocationModel = function(){
    return Location;
}
exports.getCityModel = function(){
    return City;
}
exports.getTokenModel = function(){
    return Token;
}

exports.loginUser = function(req, res){
    const user = new User({
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
}

exports.registerProvider = async function(req, res){

    const category = await Category.findOne({name:req.body.pRegisterCategory}).exec();
    if(!category) console.log("Provider category not found!");
    else console.log("Category found: "+category);
    const newProvider = await new Provider({
        categoryId : category._id,
        firstName: _.capitalize(req.body.pFirstName),
        lastName: _.capitalize(req.body.pLastName),
        email: req.body.pEmail,
        phone: req.body.pPhone,
        address: req.body.pAddress,
        username: req.body.pEmail,
        country: req.body.country_p,
        city: req.body.city_p,
        createdAt: new Date(),
        lastUpdate: new Date()
      });

      console.log("Provider instance created..");

      try{
        console.log("Checking if provider email exists: "+req.body.pEmail);
        let provider = await Provider.findOne({email: req.body.email}).exec();
        if(provider){
            console.log("Provider exists already: "+provider +" --");
            //return res.status(400).send("User with given email already exist!");
            const msg = "Provider with given email already exists!"; 
            res.render("register", {usr: newUser,link:null, cats: categories, msg: msg});
        }else{ 
            console.log("Email is solid, none found.");
        }

        
        await Provider.register(newProvider, req.body.pPassword, function(err, u){
            if (err) {
              console.log("Provider Registration error: "+err);
              // TODO: activate error message on modal
    
            } else 
                console.log("Provider has been successfully registered.");
                //res.redirect("/");
            });

        const code = generateDigit(6);
        let token = await new Token({
          userId: newProvider._id,
          token: code,
        }).save();
        const formAction = "/verify-p-email";
        const name = req.body.pFirstName; 
        const email = req.body.pEmail;
        //const link = `${process.env.BASE_URL}/user/verify/${newUser._id}/${token.token}`;
        
        const subject = "Verify Your MosalaPro Email Address";
        const message = "Hi "+name+",\n\nThank you for signing up with MosalaPro as a service provider. We appreciate your business."+
        "\nPlease use the code below to verify your MosalaPro Account:\n\n"
        +code +"\n\nThank you,\nMosalaPro TM";
        
        console.log("An Email sent to your account please verify");
        sendEmail(name, email, subject, message);
        res.render("emailVerification", {usr: null, link:null, cats: categories, userId: newProvider._id, form_action:formAction });
    }catch(error){
        res.status(400).send("An error occured (Provider Reg) : "+error);
    }
}

exports.loginProvider = function(req, res){
    const user = new Provider({
		username : _.trim(req.body.username),
		password : req.body.password
	});
	req.login(user, function(err){
        if (err) {
            console.log(err);
            // TODO: activate error message on modal
        } else {
            passport.authenticate("local")(req, res, function(){
                if(req.user.verified === true)
                    console.log("Provider has been successfully logged in");
                else    
                    // return message for modal
                    console.log("User has not been verified");
                res.redirect("/");
            });
        }
    });
}

exports.showHomePage = function(req, res){
    
    if(req.isAuthenticated()){
        res.render("home", {usr: req.user, link:null, cats: categories});
    }
    else
        res.render("home", {usr: null, link:null, cats: categories});
    
}

exports.registerUser = async function(req, res){

    const newUser = new User({
        firstName: _.capitalize(req.body.firstName),
        lastName: _.capitalize(req.body.lastName),
        email: _.trim(req.body.email),
        phone: req.body.phone,
        address: req.body.address,
        username: req.body.email,
        verified: false,
        country: req.body.country,
        city: req.body.city,
        createdAt: new Date(),
        lastUpdate: new Date()
    });

    try{
        console.log("User email that always exists: "+req.body.email);
        let user = await User.findOne({email: req.body.email}).exec();
        if(user){
            console.log("User that's always there: "+user +" --");
            //return res.status(400).send("User with given email already exist!");
            const msg = "User with given email already exist!"; 
            res.redirect("/");
            return;
            //res.render("register", {usr: newUser, cats: categories, msg: msg});
        }else{ 
            console.log("Email is solid, none found.");
        }

        
        await User.register(newUser, req.body.password, function(err, u){
            if (err) {
              console.log("User Registration error: "+err);
              // TODO: activate error message on modal
    
            } else 
                console.log("User has been successfully registered.");
                //res.redirect("/");
            });

        const code = generateDigit(6);
        let token = await new Token({
          userId: newUser._id,
          token: code,
        }).save();
        const formAction = "/verify-u-email";
        const name = req.body.firstName; 
        const email = req.body.email;
        //const link = `${process.env.BASE_URL}/user/verify/${newUser._id}/${token.token}`;
        
        const subject = "Verify Your MosalaPro Email Address";
        const message = "Hi "+name+",\n\nThank you for signing up with MosalaPro. We appreciate your business."+
        "\nPlease use the code below to verify your MosalaPro Account:\n\n"
        +code +"\n\nThank you,\nMosalaPro TM";
        
        console.log("An Email sent to your account please verify");
        sendEmail(name, email, subject, message);
        res.render("emailVerification", {usr: null, link:null, cats: categories, userId: newUser._id, form_action: formAction});
    }catch(error){
        res.status(400).send("An error occured : "+error);
    }
}

exports.resendCode = async function(req, res){
    try{
        let user = await User.findOne({_id: req.params.id}).exec();
        if(user)
            console.log("User found, resending email: ");
        else   
            console.log("User not found, could not resend email.");

        let tok = await Token.findOne({ userId: user._id }).exec();
        await Token.findByIdAndRemove(tok._id);

        const code = generateDigit(6);
        let token = await new Token({
          userId: user._id,
          token: code,
        }).save();

        const name = user.firstName;
        const email = user.email;
        const subject = "Verify Your MosalaPro Email Address";
        const message = "Hi "+name+",\n\nThank you for signing up with MosalaPro. We appreciate your business."+
        "\nPlease use the code below to verify your MosalaPro Account:\n\n"
        +code +"\n\nThank you,\nMosalaPro TM";
        
        console.log("An Email sent to your account please verify");
        sendEmail(name, email, subject, message);
        res.redirect(req.get('referer'));

    }catch(error){
        console.log("An error occured: "+ error);
        res.status(400).send("An error occured : "+error);
    }
}

exports.renderEmailVer = function(req, res, formAction){

    res.render("emailVerification", {usr: null, link:null, cats: categories, userId: req.body.id, form_action: formAction});
}

exports.verifyUserEmail = async function(req, res){

    try {
        const user = await User.findOne({ _id: req.body.id }).exec();
        if (!user) return res.status(400).send("User : Invalid link. User id: "+req.body.id);
    
        const token = await Token.findOne({ userId: user._id}).exec();

        if (!token) return res.status(400).send("Token : Invalid link");
        
        const codeEntered = ""+req.body.first + req.body.second + req.body.third + req.body.fourth + req.body.fifth + req.body.sixth;
        if(codeEntered == token.token){
            console.log("Code verification successful! logging in the user..")
            req.login(user, function(err){
                if (err) {
                    console.log("An error occured (Email Verification): "+err);
                    // TODO: activate error message on modal
                } else {
                        console.log("Email verification: User has been successfully logged in");
                        User.updateOne({ _id: user._id}, {$set: {verified: true}} );
                        Token.findByIdAndRemove(token._id);
                        res.redirect("/");
                }
            });
            
        }
        else{
            console.log("Email verification: Code entered does not match the one sent!");
            res.redirect(req.get('referer'));
            //res.render("emailVerification", {usr: null, cats: categories, userId: user._id});
        }
        
      } catch (error) {
        console.log("An error occured (Email verification): "+ error);
        res.status(400).send("An error occured : "+error);
    }
}

exports.verifyProviderEmail = async function(req, res){

    try {
        const provider = await Provider.findOne({ _id: req.body.id }).exec();
        if (!provider) return res.status(400).send("Provider email verification : Invalid link. Provider id: "+req.body.id);
    
        const token = await Token.findOne({ userId: provider._id}).exec();

        if (!token) return res.status(400).send("Token : Invalid link");
        
        const codeEntered = ""+req.body.first + req.body.second + req.body.third + req.body.fourth + req.body.fifth + req.body.sixth;
        if(codeEntered == token.token){
            console.log("Provider email verifiication: Code verification successful! logging in the provider..")
            Provider.updateOne({ _id: provider._id}, {$set: {verified: true}} );
            Token.findByIdAndRemove(token._id);
            console.log("Email verification: Provider has been successfully logged in");
            res.redirect("/");
        }   
        else{
            console.log("Email verification: Code entered does not match the one sent!");
            res.redirect(req.get('referer'));
            //res.render("emailVerification", {usr: null, cats: categories, userId: user._id});
        }
        
      } catch (error) {
        console.log("An error occured (Email verification): "+ error);
        res.status(400).send("An error occured : "+error);
    }
}

exports.showAboutUsPage = function(req, res){
 
    if(req.isAuthenticated()){
        res.render("about_us", {link:null, usr: req.user});
    }
    else
        res.render("about_us", {link:null, usr: null});
    
}

exports.showContactUsPage = function(req, res){

    if(req.isAuthenticated()){
        res.render("contact", {link:null, usr: req.user});
    }
    else
        res.render("contact", {link:null, usr: null});
    
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
        res.render("forProfessionals", {link:null, usr: req.user});
    }
    else
        res.render("forProfessionals", {link:null, usr: null});
}

exports.showFindProfessionalsPage = function(req, res){
    if(req.isAuthenticated())
        res.render("findprofessionals", {link:null, usr: req.user});
    else
        res.render("findprofessionals", {link:null, usr: null});
}

exports.showFindProfessionalsMdPage = function(req, res){
    if(req.isAuthenticated())
        res.render("findProMd", {link:null, usr: req.user});
    else
        res.render("findProMd", {link:null, usr: null});
}


const multer = require("multer");
const fs = require("fs");
exports.postServiceRequest = function (req, res) {
  //TODO:Uncomment following if to enabled authentication layer
  //if (req.isAuthenticated()) {
  if (true) {
    try {
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          const dir = "./postAttachments";
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }

          cb(null, dir); // Save files in the 'uploads' directory
        },
        filename: function (req, file, cb) {
          const uniquePrefix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, uniquePrefix + "-" + file.originalname); // Set a unique filename for the uploaded file
        },
      });

      const upload = multer({
        storage: storage,
        limits: {
          fileSize: 1024 * 1024 * 100, // Limit the file size to 100MB
        },
        fileFilter: function (req, file, cb) {
          cb(null, true); // Allow any type of file
        },
      }).array("files", 10); // Allow up to 10 files to be uploaded in one request

      upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          console.log(err);
          res.status(400).send({
            responseCode: 400,
            responseMessage: "Error uploading files",
          });
        } else if (err) {
          // An unknown error occurred when uploading
          console.log(err);
          res.status(400).send({
            responseCode: 400,
            responseMessage: "Error uploading files",
          });
        }

        // Everything went fine
        console.log("In the method postRequest.");
        console.log(req.files); // Contains information about the uploaded files
        //Storing in db
        const newRequest = new PostRequest({
          username: req.body.username,
          requestTitle: req.body.requestTitle,
          requestDescription: req.body.requestDescription,
          requestCategory: req.body.requestCategory,
          budget: req.body.requestBudget,
          deadline: req.body.requestDeadline,
          createdAt: new Date(),
          lastUpdate: new Date(),
          files: req.files.map((file) => file.filename),
        }).save().then(success =>{
            console.log("Posted successfully!");

            res.redirect("/")
        }).catch(err => {console.log("Error occured while saving into the db: "+err);});
       
      });
    } catch (e) {
      console.log(e);
      res.status(400).send({
        responseCode: 400,
        responseMessage: "Error posting service request: "+e,
      });
    }
  } 
};

exports.serviceRequest = function (req, res) {
    if(req.isAuthenticated()){
        console.log("Creating a service request..");
        res.render("serviceRequest",{usr: req.user, link:null});
    }else{
        console.log("User not connecting, redirecting to home page..");
        res.redirect("/");
    }

  };


const axios = require('axios');

global.sendEmail = async function sendEmail(name, email, subject, message) {
    
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
    
    return axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        }).catch(function (error) {console.log(error);});
}

const generateRandomString = (myLength) => {
    const chars =
      "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
      { length: myLength },
      (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );
  
    const randomString = randomArray.join("");
    return randomString;
  };

  const generateDigit = (myLength) => {
    const chars =
      "1234567890";
    const randomArray = Array.from(
      { length: myLength },
      (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );
  
    const randomDigit = randomArray.join("");
    return randomDigit;
  };
