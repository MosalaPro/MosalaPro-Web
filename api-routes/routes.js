
/*********************************************************************************************************
*	Routes.js : Handles web app routing and url requests.
*   Author: Constant Pagoui.
*	Date: 03-22-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

const CategoryModel = require("../models/category");
const CountryModel = require("../models/country");
const NotificationModel = require("../models/notification");
const Message = require("../services/message");
const messageHander = new Message();
const JobApplication = require("../services/jobApplication");
const jobApplicationHander = new JobApplication();
const UserService = require("../services/user");
const PostRequestModel = require("../models/postRequest");
const BookingModel = require("../models/booking");
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
const fs = require('fs');
const JobApplicationModel = require("../models/jobApplication");
const BookingService = require("../services/booking");
const UserModel = require("../models/user");

fs.readFile('./public/data/categories.json', 'utf8', (err, data) => {
  if (err) {
    console.log('APP:: Error reading file from disk: '+err)
  } else {
    // parse JSON string to JSON object
    const cates = JSON.parse(data)

    // print all databases
    cates.forEach(kat => {
      //console.log(`${kat.name}: ${kat.icon}`);
      categories.push(kat);
    })
  }
});


countries = [];
fs.readFile('./public/data/countries.json', 'utf8', (err, data) => {
    if (err) {
      console.log('APP:: Error reading file from disk: '+err)
    } else {
      // parse JSON string to JSON object
      const kountries = JSON.parse(data)
  
      // print all databases
      kountries.forEach(ctry => {
        countries.push(ctry);
      })
    }
  });

module.exports = function(app){
    require("dotenv").config();
    const root = require('path').resolve('./');
    
app.get("/", async function(req, res){

        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            if(req.user.accountType=="provider"){
                const pRequests = await PostRequestModel.find({providerId:req.user._id}).exec();
                const ja = await jobApplicationHander.getAppliedJobs(req, res);
                res.render("providerDashboard", {usr: req.user, notifications: notifs, cats: categories, ja:ja, countries: countries, postRequests: pRequests});
            }
            else  {
                const pRequests = await PostRequestModel.find({username:req.user.username}).exec();
                requestProviders = await UserService.getProviders();
                // pRequests.forEach(request =>{
                //     provider = await UserModel.find
                // })
                console.log(notifs);
                res.render("userDashboard", {usr: req.user, notifications: notifs, link: null, postRequests: pRequests, providers: requestProviders, cats: categories, 
                    countries: countries});
            }
        }
        else
            res.render("home", {usr: null, cats: categories, countries: countries });
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

    app.get("/notifications", async function(req, res){
        if (req.isAuthenticated()) {
            const notifs = await NotificationModel.find({receiverId: req.user._id}).limit(4).exec();
            res.render("notifications", {
              usr: req.user,
              cats: categories,
              notifications: notifs,
              countries: countries,
              link: null
            });
          } else {
            res.redirect("/");
          }
    });
    app.post("/notifications", async function(req, res){
        const limit = req.body.lim;
        console.log("Limit sent: "+limit);
        let notifs = await NotificationModel.find({receiverId: req.user._id}).limit(limit).exec();
        notifis = [];
        notifs.forEach(not =>{
            not.age = Math.floor(Math.abs( new Date() - not.createdAt ) / (1000*3600*24));
            console.log("Age: "+not.age);
        });
        console.log("Notifications loaded: "+notifs.length);
        res.status(200).send({message:"Ok", status:200, notifications:notifs});
        return;

    });
    app.get("/user", async function(req, res){
        console.log(req.isAuthenticated());
        if (req.isAuthenticated()) {
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("user", {
              usr: req.user,
              cats: categories,
              notifications: notifs,
              countries: countries,
              link: null
            });
          } else {
            res.redirect("/");
        }
    });

    app.get("/user-edit", async function(req, res){
        if (req.isAuthenticated()) {
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("userEdit", {
              usr: req.user,
              cats: categories,
              countries: countries,
              notifications: notifs,
              link:null
            });
          } else {
            res.redirect("/");
          }
    });

    app.post("/user-edit", upload.single("photo"), async function (req, res) {
        if (req.isAuthenticated()) {
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
          if(req.file)
            req.body.photo = req.file.filename;
          if (UserService.update({ _id: req.user._id, ...req.body })) {
            res.redirect("/user");
          } else {
            res.redirect("/user-edit", { notifications: notifs, link: null, cats: categories });
          }
        } else {
          res.redirect("/");
        }
      });

    app.post("/update-sr", async function(req, res){
        if(req.isAuthenticated()){
            //if(req.file)
            PostRequestService.updateServiceRequest(req, res);
        }
        else    
            res.redirect("/");
    })
    
    app.post("/register-user", async (req, res) => {
        UserService.register(req, res);
    });

    app.get("/register-user", function(req, res){
        res.render("emailVerification", {usr: null, link:null, cats: categories, userId: req.body.id, form_action: "/verify-u-email" });
    });

    app.get("/service-requests", async function(req, res){
        
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            const jobRequests = await PostRequestService.getActiveRequests(req, res);
            res.render("jobRequests", {notifications: notifs, usr: req.user, jobs: jobRequests, link:null, cats: categories});
        }
        else{
            res.redirect("/");
        }
    });

    app.post("/login-u", function(req, res){
        UserService.login(req, res);
    });

    // app.post("/login-p", function(req, res){
    //     ProviderService.login(req, res);
    // });

    app.get("/professionals", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("forProfessionals", {usr: req.user, notifications: notifs, link: req.link, cats: categories, countries: countries});
        }
        else
            res.render("forProfessionals", {usr: null, link:null, cats: categories, countries: countries });
    });

    app.get("/find-services", async function(req, res){
        const result = await UserModel.find({accountType:"provider"}).exec();
        const pages = result.length > 10 ? (Math.floor(result.length / 10))+1 : 1; 
        console.log("result length: "+result.length+" Pages: "+pages);  
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("findprofessionals", {usr: req.user, notifications: notifs, link: req.link, cats: categories, countries: countries, professionals: result, 
                pages:pages, total: result.length});
        }
        else
            res.render("findprofessionals", {usr: null, notifications: null, link:null, cats: categories, countries: countries, professionals: result, 
                pages:pages, total: result.length});
    });

    app.get("/term-of-use", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("termsAndConditions", {usr: req.user, notifications: notifs, link: req.link, cats: categories, countries: countries});
        }
        else
            res.render("termsAndConditions", {usr: null, notifications: null, link:null, cats: categories, countries: countries });
    });

    app.get("/do-not-sell", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("doNotSell", {usr: req.user, notifications: notifs, link: req.link, cats: categories, countries: countries});
        }
        else
            res.render("doNotSell", {usr: null, notifications: null, link:null, cats: categories, countries: countries });
    });

    app.get("/privacy-policy", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("privacyPolicy", {usr: req.user, notifications: notifs, link: req.link, cats: categories, countries: countries});
        }
        else
            res.render("privacyPolicy", {usr: null, notifications: null, link:null, cats: categories, countries: countries });
    })

    app.get("/about-us", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("about_us", {usr: req.user, notifications: notifs, link:null, cats: categories});
        }
        else
            res.render("about_us", {usr: null, notifications: null, link: null, cats: categories });
    });

    app.get("/contact-us", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("contact", {usr: req.user, notifications: notifs, link: null, cats: categories});
        }
        else
            res.render("contact", {usr: null,  notifications:null, link: null,  cats: categories });
    });

    app.get("/myrequests", async function(req, res){
    if(req.isAuthenticated()){
        try{
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            const pRequests = await PostRequestModel.find({username:req.user.username, status:"active"}).exec();
            if(pRequests){
                console.log("Requests found: "+pRequests.length);
            }else{
                console.log("No requests found with username: "+req.user.username);
            }
            res.render("manageUserRequests", {usr: req.user, notifications: notifs, postRequests: pRequests, link: null,  cats: categories});
        }catch(error) {res.redirect("/")};
    }
    else
        res.redirect("/");
    });

    app.get("/getbookings", async function(req, res){
        if(req.isAuthenticated()){
            try{
                console.log("Pro: "+req.user._id);
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                let pRequests = [];
                if(req.query?.type == "all")
                    pRequests = await BookingModel.find({providerId:req.user._id}).exec();
                else
                    pRequests =  await BookingModel.find({providerId:req.user._id, status:req.query?.type}).exec();

                if(pRequests){
                    console.log("GetBookings found: "+pRequests.length);
                }else{
                    console.log("No requests found with username: "+req.user.username);
                }
                console.log("Bookings: "+pRequests.length);
                res.send(pRequests);
            }catch(error) {res.redirect("/")};
        }
        else
            res.redirect("/");
    });

    app.get("/getrequests", async function(req, res){
        if(req.isAuthenticated()){
            try{
                console.log("User: "+req.user.username);
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                let pRequests = [];
                if(req.query?.type == "all")
                    pRequests = await PostRequestModel.find({username:req.user.username}).exec();
                else
                    pRequests = await PostRequestModel.find({username:req.user.username, status:req.query?.type}).exec();

                if(pRequests){
                    console.log("Requests found: "+pRequests.length);
                }else{
                    console.log("No requests found for user: "+req.user.username);
                }
                console.log("Requests: "+pRequests.length);
                res.send(pRequests);
            }catch(error) {
                console.log("Error occured: "+error);
                res.redirect("/")
            };
        }
        else
            res.redirect("/");
    });

    app.get("/manage-request", async function(req, res){
        if(req.isAuthenticated()){
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                const req_ = await PostRequestModel.findOne({_id: req.query?.rq}).exec();
                res.render("manageRequest", {usr: req.user, notifications: notifs, request: req_, link: null,  cats: categories});
            }catch(error){
                console.log("Error occured: "+error);
                res.redirect("/myrequests");
            }
        }
        else
            res.redirect("/");
    })

    app.get("/mybookings", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            const bookings = await BookingModel.find({providerId:req.user._id, status: "active"}).exec();
            if(bookings){
                console.log("Bookings found: "+bookings.length);
            }else{
                console.log("No requests found with username: "+req.user.username);
            }
            res.render("manageServiceRequests", {usr: req.user, notifications: notifs, postRequests:bookings, link: null,  cats: categories});
            
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
        res.render("emailVerification", {usr: null, notifications: null, cats: categories, userId: req.body.iddl, link: null});
    });
    app.get("/userdash", async function(req, res){
        
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            console.log(notifs);
            const pRequests = await PostRequestModel.find({username:req.user.username}).exec();
            res.render("userDashboard", {usr: req.user, notifications: notifs, cats: categories, postRequests: pRequests, link: null});
        }
        else
        res.redirect("/");
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
        
        res.render("emailVerification", {usr: null, link:null,  notifications:null, cats: categories, userId: req.body.id, form_action: "verify-email"});
    });
  
    app.get("/profile", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("userProfile", {usr: req.user, notifications: notifs, link:null, cats: categories, countries: countries});
        }else   res.redirect("/");
    });


    app.post("/profile", upload.single("photo"), async function(req, res){
        if(req.isAuthenticated()){
            if(req.file)
                req.body.photo = req.file.filename;
                req.body.accountType = "provider";
            if(UserService.updateUser({_id: req.user._id, ...req.body}))
                res.redirect("/profile");
            else
                console.log("Update failed!");
            
        }else res.redirect("/");
        
    });

    app.post("/apply-for-sr", async function(req, res){
        jobApplicationHander.apply(req, res);
    });

    app.get("/p-profile", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("userEdit", {usr: req.user, notifications: notifs, link:null,  cats: categories, countries: countries});
        }else{res.redirect("/");}
    });

    app.get("/join-as-pro", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("joinAsProProfile", {usr: req.user, notifications: notifs, link:null,  cats: categories, countries: countries});
        }else{res.redirect("/");}
    });

    app.get('/pro-profile/:id/', async function (req, res) {
        let provider = await UserService.findUser(req, res);
        if( req.isAuthenticated() && provider){
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                res.render("proProfile", {usr: req.user, notifications: notifs, pro: provider, cats: categories, link:req.link});
            }catch(error){res.redirect("/");}
            
        }else
        res.render("proProfile", {usr: null, notifications: null, pro: provider, cats: categories, link:req.link});
   });
   app.get('/service-request-booking/:id/', async function (req, res) {
    let provider = await UserService.findUser(req, res);
    if( req.isAuthenticated() && provider){
        const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("bookPro", {usr: req.user, notifications: notifs, pro: provider, cats: categories, link:req.link});
        
    }else
        res.redirect("/");
});
    
    app.post('/verify-p-email', function(req, res) {
        //model.verifyProviderEmail(req, res);
        UserService.verifyEmail(req, res);
    });
    
    app.post("/send-message", function(req, res){
        console.log("About to send message..");
        messageHander.sendMessage(req, res);

    });

    app.get("/resendCode/:id", function(req, res){
        //model.resendCode(req, res);
        UserService.resendCode(req, res);
    });
    app.get("/service-request", async function (req, res) {
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            console.log("Creating a service request..");
            res.render("serviceRequest",{usr: req.user, notifications: notifs, link:null,  cats: categories});
        }else{
            console.log("User not connecting, redirecting to home page..");
            res.redirect("/");
        }
    });

    app.post("/postServiceRequest",function(req,res){
        PostRequestService.postServiceRequest(req,res);
    });

    app.post("/submitBooking",function(req,res){
        console.log("Booking routed..");
        BookingService.postBooking(req,res);
    });

    app.get("/find-professionals", async function (req, res) {
        const result = await UserService.find(req.query);
        res.send(result);
      });


    app.get("/find-services-md", async function(req, res){
        
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("findProMd", {link:null, usr: req.user, notifications: notifs, cats: categories});
        }
        else
            res.render("findProMd", {link:null, notifications: null, usr: null,  cats: categories });
    });

    app.get("/sr-details/:jobId", async function(req, res){
        if(req.isAuthenticated()){
            try{
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            const sr = await PostRequestModel.findOne({_id: req.params.jobId}).exec();
            res.render("jobRequestDetails", {job: sr, notifications: notifs, link:null, usr: req.user, cats: categories});
            }catch(error){
                res.redirect("/");
            }
        }
        else
            res.redirect("/");
    });
    app.get("/job-application/:jobId", async function(req, res){
        if(req.isAuthenticated()){
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                const ja = await JobApplicationModel.findOne({jobId: req.params.jobId}).exec();
                const sr = await PostRequestModel.findOne({_id: req.params.jobId}).exec();
                sr.createdAt = ja.createdAt;
                res.render("jobApplicationDetails", {job: sr, notifications: notifs, link:null, usr: req.user, cats: categories});
            }catch(error){
                res.redirect("/");
            }
           
        }
        else
            res.redirect("/");
    });
    app.get('/files/:filename', function(req, res){
        const file = `postAttachments/${req.params.filename}`;
        res.download(file);
      });

    app.get('/:anything/', async function (req, res) {
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("page_not_found", {usr: req.user, notifications: notifs, cats: categories, link:req.link});
        }else
         res.render("page_not_found", {usr: null, notifications: null, cats: categories, link:null });
   });

    app.get('*', async function (req, res) {
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("page_not_found", {usr: req.user, notifications: notifs, cats: categories, link:req.link});
        }else
         res.render("page_not_found", {usr: null, notifications: null, cats: categories, link:null });
    });
    
    app.use(async function(req, res, next) {
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("page_not_found", {usr: req.user, notifications: notifs, cats: categories, link:req.link});
        }else
         res.render("page_not_found", {usr: null, notifications: null,cats: categories, link:null });
    });


}


