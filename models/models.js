/*********************************************************************************************************
*	Model.js : Handle communication with the DB, data retrieval, data insertion, authentification, etc.
*   Author: Constant Pagoui.
*	Date: 03-01-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

require("dotenv").config();
const {categorySchema, countrySchema, citySchema, stateSchema, 
    locationSchema, tokenSchema, userSchema, providerSchema } = require(__dirname+"/schemas/schemas.js");

const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const passport = require("passport");

const User = mongoose.model("User", userSchema);
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
		username : req.body.username,
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
        res.render("home", {usr: req.user, cats: categories});
    }
    else
        res.render("home", {usr: null, cats: categories});
    
}

exports.registerUser = async function(req, res){

    try{
        console.log("User email that always exists: "+req.body.email);
        let user = await User.findOne({email: req.body.email}).exec();
        if(user){
            console.log("User that's always there: "+user +" --");
            return res.status(400).send("User with given email already exist!"); 
        }else{ 
            console.log("Email is solid, none found.");
        }

        const code = generateRandomString(10);
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            username: req.body.email,
            verified: false,
            country: req.body.country,
            city: req.body.city,
            createdAt: new Date(),
            lastUpdate: new Date()
        });

        await User.register(newUser, req.body.password, function(err, u){
            if (err) {
              console.log("User Registration error: "+err);
              // TODO: activate error message on modal
    
            } else 
                console.log("User has been successfully registered.");
                //res.redirect("/");
            });

    
        let token = await new Token({
          userId: newUser._id,
          token: require('crypto').randomBytes(32).toString('hex'),
        }).save();

        const name = req.body.firstName; 
        const email = req.body.email;
        const link = `${process.env.BASE_URL}/user/verify/${newUser._id}/${token.token}`;
        
        const subject = "Verify Your MosalaPro Email Address";
        const message = "Hi "+name+",\n\nThank you for signing up with MosalaPro. We appreciate your business."+
        "\nPlease click on this link to verify your MosalaPro Account:\n\n"
        +link +"\n\nThank you,\nMosalaPro TM";
        
            //implement your spam protection or checks.
        console.log("An Email sent to your account please verify");
        sendEmail(name, email, subject, message, req, res, code);
        res.render("emailVerification", {usr: null, cats: categories});
    }catch(error){
        res.status(400).send("An error occured : "+error);
    }
}

exports.verifyEmail = async function(req, res){

    try {
        const user = await User.findOne({ _id: req.params.id }).exec();
        if (!user) return res.status(400).send("User : Invalid link");
    
        const token = await Token.findOne({
          userId: user._id,
          token: req.params.token,
        }).exec();
        if (!token) return res.status(400).send("Token : Invalid link");
    
        await User.updateOne({ _id: user._id}, {$set: {verified: true}} );
        await Token.findByIdAndRemove(token._id);
    
        //res.send("email verified sucessfully");
        res.render("emailVerified", {usr: null, cats: categories});
      } catch (error) {
        res.status(400).send("An error occured");
    }

    // console.log("User email from req: "+req.body.mail);
    // const user = await User.findOne({ email: req.body.mail }).exec();
    // console.log("User: "+user);
    // if (!user) return res.status(400).send("User with given email not found!");
    // console.log("UserId: "+user._id);
    // const foundToken = await Token.findOne({ userId: user._id }).exec();
    // if (!foundToken) return res.status(400).send("Token for given email not found!");
    // console.log("Token: "+foundToken.token+" - code: "+req.body.emailCode);
    // if(foundToken.token === req.body.emailCode){
    //     //Normally will render to user profile
    //     await User.updateOne({ _id: user._id}, {$set: {verified: true}} );
    //     console.log("User email has been verified!");
    //     res.redirect("/");
        
    // }else{
    //     console.log("Codes don't match");
    // }
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

exports.showFindProfessionalsPage = function(req, res){
    if(req.isAuthenticated())
        res.render("findprofessionals", {usr: req.user});
    else
        res.render("findprofessionals", {usr: null});
}

exports.showServiceRequestPage = function(req, res){

    if(req.isAuthenticated()){
        // render service requests page for users
        res.render("forProfessionals", {usr: req.user});
        }
        // otherwise send user to the login page 
}



const multer = require("multer");
const fs = require('fs')
exports.postServiceRequest = function(req, res) {
  try {
    console.log("exports.postServiceRequest");
    console.log(req.body);

    let { requestTitle, requestDescription, requestCategory } = req.body;

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const dir = './postAttachments';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        cb(null, dir); // Save files in the 'uploads' directory
      },
      filename: function (req, file, cb) {
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniquePrefix + '-' + file.originalname); // Set a unique filename for the uploaded file
      }
    });

    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 100 // Limit the file size to 100MB
      },
      fileFilter: function (req, file, cb) {
        cb(null, true); // Allow any type of file
      },
    }).array('files', 10); // Allow up to 10 files to be uploaded in one request

    upload(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        console.log(err);
        res.status(400).send({ responseCode: 400, "responseMessage": "Error uploading files" });
      } else if (err) {
        // An unknown error occurred when uploading
        console.log(err);
        res.status(400).send({ responseCode: 400, "responseMessage": "Error uploading files" });
      }

      // Everything went fine
      console.log(req.files); // Contains information about the uploaded files

      res.send({ responseCode: 14, "responseMessage": "posted successfully",request:req.body });
    });
    
  } catch (e) {
    console.log(e);
    res.status(400).send({ responseCode: 400, "responseMessage": "Error posting service request" });
  }
};

const axios = require('axios');


global.sendEmail = async function sendEmail(name, email, subject, message, req, res) {
    
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
