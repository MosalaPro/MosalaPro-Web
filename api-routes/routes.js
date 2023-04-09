
/*********************************************************************************************************
*	Routes.js : Handles web app routing and url requests.
*   Author: Constant Pagoui.
*	Date: 03-22-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

const CategoryModel = require("../models/category");
const CountryModel = require("../models/country");
const UserService = require("../services/user");
const PostRequestModel = require("../models/postRequest");
const PostRequestService = require("../services/postrequest");
const stripe = require('stripe')(process.env.STRIPE_SEC_KEY);
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const _ = require("lodash");
const link = null;

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, callback) {
    crypto.randomBytes(16, function (err, buf) {
      if (err) return callback(err);
      const randomString = buf.toString("hex");
      const extension = path.extname(file.originalname);
      const filename = randomString + extension;
      callback(null, filename);
    });
  },
});

const upload = multer({ storage: storage });

categories = [];
CategoryModel.find({"name":{$ne:null}}, function(err, foundCategories){
    if(err){
        console.log(err);
    }
    else{
        console.log("Categories found: "+foundCategories.length);
        categories = foundCategories;
    }
});

countries = [];
CountryModel.find({"name":{$ne:null}}, function(err, foundCountries){
    if(err){console.log(err);}
    else{
        console.log("Countries found: "+foundCountries.length);
        countries = foundCountries;
    }
});


module.exports = function(app){
    require("dotenv").config();
    const root = require('path').resolve('./');
    
app.get("/", async function(req, res){

        if(req.isAuthenticated()){
            if(req.user.accountType=="provider")
                res.render("home", {usr: req.user, cats: categories, countries: countries});
            else  {
                const pRequests = await PostRequestModel.find({username:req.user.username}).limit(8).exec();
                requestProviders = await UserService.getProviders();
                // pRequests.forEach(request =>{
                //     provider = await UserModel.find
                // })
                res.render("userDashboard", {usr: req.user, link: null, postRequests: pRequests, providers: requestProviders, cats: categories, countries: countries});
            }
        }
        else
            res.render("home", {usr: null, cats: categories, countries: countries});
    });

    app.get("/payment", async function(req, res) {
        res.render("payment");
    })

    app.get("/charge", async function(req, res) {
        res.send("charge");
    })

    app.post("/charge", async function(req, res) {
        if(req.isAuthenticated()) {
            const card = {
                number: req.body.cardNumber,
                exp_month: req.body.expiryMonth,
                exp_year: req.body.expiryYear,
                cvc: req.body.cvc
            };
            try{
                const token = await stripe.tokens.create({ card });

                let amount = 0;
                if(req.body.plan === "bronze") {
                    amount = 5000;
                } else if(req.body.plan === "gold") {
                    amount = 10000;
                } else if(req.body.plan === "platinum") {
                    amount = 25000;
                }
                stripe.charges.create({
                    amount,
                    currency: 'usd',
                    description: 'Subscription',
                    source: token.id,
                }, async function(err, charge) {
                    if (err) {
                        res.send('Payment failed');
                    } else {
                        await UserService.createSubscription(req.user._id, req.body.plan)
                        res.redirect('/');
                    }
                });
            }catch(err){
                console.log("Card payment error: "+err);
                res.redirect('/');
            }

            
        } else {
            res.redirect('/');

        }
 
    })

    app.get("/user", async function(req, res){
        console.log(req.isAuthenticated());
        if (req.isAuthenticated()) {
            res.render("user", {
              usr: req.user,
              cats: categories,
              countries: countries,
              link: null
            });
          } else {
            res.redirect("/");
        }
    });

    app.get("/user-edit", async function(req, res){
        if (req.isAuthenticated()) {
            res.render("userEdit", {
              usr: req.user,
              cats: categories,
              countries: countries,
              link:null
            });
          } else {
            res.redirect("/");
          }
    });

    app.post("/user-edit", upload.single("photo"), async function (req, res) {
        if (req.isAuthenticated()) {
          if(req.file)
            req.body.photo = req.file.filename;
          if (UserService.update({ _id: req.user._id, ...req.body })) {
            res.redirect("/user");
          } else {
            res.redirect("/user-edit", { link: null, cats: categories });
          }
        } else {
          res.redirect("/");
        }
      });


    app.post("/register-user", async (req, res) => {
        UserService.register(req, res);
    });
    app.get("/register-user", function(req, res){
        res.render("emailVerification", {usr: null, link:null, cats: categories, userId: req.body.id, form_action: "/verify-u-email"});
    });

    app.post("/login-u", function(req, res){
        UserService.login(req, res);
    });

    // app.post("/login-p", function(req, res){
    //     ProviderService.login(req, res);
    // });

    app.get("/professionals", function(req, res){
        if(req.isAuthenticated())
            res.render("forProfessionals", {usr: req.user, link: req.link, cats: categories, countries: countries});
        else
            res.render("forProfessionals", {usr: null, link:null, cats: categories, countries: countries});
    });

    app.get("/find-services", async function(req, res){
        const result = await UserService.find(req.query);   
        console.log(result);
        if(req.isAuthenticated())
            res.render("findprofessionals", {usr: req.user, link: req.link, cats: categories, countries: countries, professionals: result});
        else
            res.render("findprofessionals", {usr: null, link:null, cats: categories, countries: countries, professionals: result});
    });

    app.get("/about-us", function(req, res){
        if(req.isAuthenticated())
            res.render("about_us", {usr: req.user, link:null, cats: categories});
        else
            res.render("about_us", {usr: null, link: null, cats: categories});
    });

    app.get("/contact-us", function(req, res){
        if(req.isAuthenticated())
            res.render("contact", {usr: req.user, link: null, cats: categories});
        else
            res.render("contact", {usr: null, link: null,  cats: categories});
    });

    app.get("/myrequests", async function(req, res){
    if(req.isAuthenticated()){
        const pRequests = await PostRequestModel.find({username:req.user.username}).exec();
        if(pRequests){
            console.log("Requests found: "+pRequests);
        }else{
            console.log("No requests found with username: "+req.user.username);
        }
        res.render("manageServiceRequests", {usr: req.user, postRequests: pRequests, link: null,  cats: categories});
    }
    else
        res.redirect("/");
    });

    app.post('/update-password', function(req, res){
        if(req.isAuthenticated())
            UserService.updatePassword(req, res);
        else
            res.redirect("/");
    });
    
    app.post("/authenticate", function(req, res){
        console.log("User Id: "+req.body.iddl);
        res.render("emailVerification", {usr: null, cats: categories, userId: req.body.iddl, link: null});
    });
    app.get("/userdash", async function(req, res){
        
        if(req.isAuthenticated()){
            const pRequests = await PostRequestModel.find({username:req.user.username}).exec();
            res.render("userDashboard", {usr: req.user, cats: categories, postRequests: pRequests, link: null});
        }
        else
        res.render("userDashboard", {usr: req.user, cats: categories, postRequests: null, link: null});
    });
    app.get("/verified", function(req, res){
        res.render("emailVerified", {usr:null, cats: categories});
    });

    app.get("/logout", function(req, res, next ){
        req.logout(function(err){
            if(err){return next(err);}
            res.redirect("/");
        });
    });
    

    app.post("/verify-email", function(req, res){
        UserService.verifyEmail(req, res);
    });
   
    app.post("/register-pro", function(req, res){
        UserService.register(req, res);
    });
    app.get("/register-pro", function(req, res){
        res.render("emailVerification", {usr: null, link:null, cats: categories, userId: req.body.id, form_action: "verify-email"});
    });
  
    app.get("/profile", function(req, res){
        if(req.isAuthenticated()){
            res.render("userProfile", {usr: req.user, link:null, cats: categories, countries: countries});
        }else   res.redirect("/");
    });

    app.post("/profile", function(req, res){
        if(req.isAuthenticated()){
            if(UserService.updateUser({_id: req.user._id, ...req.body}))
                res.redirect("/profile");
            else
                console.log("Update failed!");
            
        }else res.redirect("/");
        
    });
    app.get("/p-profile", function(req, res){
        if(req.isAuthenticated()){
            res.render("userEdit", {usr: req.user, link:null,  cats: categories, countries: countries});
        }else{res.redirect("/");}
    });
    
    app.post('/verify-p-email', function(req, res) {
        //model.verifyProviderEmail(req, res);
        UserService.verifyEmail(req, res);
    });
    
    app.get("/resendCode/:id", function(req, res){
        //model.resendCode(req, res);
        UserService.resendCode(req, res);
    });
    // app.get("/professionals", function(req, res){
    //     model.showForProPage(req, res);
    // });
    app.get("/service_request", function (req, res) {
        if(req.isAuthenticated()){
            console.log("Creating a service request..");
            res.render("serviceRequest",{usr: req.user, link:null,  cats: categories});
        }else{
            console.log("User not connecting, redirecting to home page..");
            res.redirect("/");
        }
    });

    app.post("/postServiceRequest",function(req,res){
        console.log("/postServiceRequest")
        PostRequestService.postServiceRequest(req,res);
    });

    app.get("/find-professionals", async function (req, res) {
        const result = await UserService.find(req.query);
        res.send(result);
      });

    app.get("/find-services-md", function(req, res){
        
        if(req.isAuthenticated())
            res.render("findProMd", {link:null, usr: req.user, cats: categories});
        else
            res.render("findProMd", {link:null, usr: null,  cats: categories});
    });



    app.get('/:anything/', function (req, res) {
        if(req.isAuthenticated()){
            res.render("page_not_found", {usr: req.user, cats: categories, link:req.link});
        }else
         res.render("page_not_found", {usr: null, cats: categories, link:null});
   });

    app.get('*', function (req, res) {
        if(req.isAuthenticated()){
            res.render("page_not_found", {usr: req.user, cats: categories, link:req.link});
        }else
         res.render("page_not_found", {usr: null, cats: categories, link:null});
    });
    
    app.use(function(req, res, next) {
        if(req.isAuthenticated()){
            res.render("page_not_found", {usr: req.user, cats: categories, link:req.link});
        }else
         res.render("page_not_found", {usr: null, cats: categories, link:null});
    });


}


