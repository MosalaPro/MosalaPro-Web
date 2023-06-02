
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
const Notification = require("../services/notification");
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

const notificationObj = new Notification();

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
                console.log("JA: "+ja.length);
                res.render("providerDashboard", {usr: req.user, notifications: notifs, cats: categories, ja:ja, countries: countries, postRequests: pRequests.reverse()});
            }
            else  {
                const pRequests = await PostRequestModel.find({username:req.user.username}).exec();
                const bookedPros = await PostRequestService.getBookedPros(req, res);
                requestProviders = await UserService.getProviders();
                // pRequests.forEach(request =>{
                //     provider = await UserModel.find
                // })
                res.render("userDashboard", {usr: req.user, notifications: notifs, bookedPros: bookedPros, link: null, postRequests: pRequests.reverse(), providers: requestProviders, cats: categories, 
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
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id, status:{$ne:"archived"}}).exec();
                let loadNotifs_ = await NotificationModel.find({receiverId: req.user._id}).limit(4).exec();
                res.render("notifications", {
                usr: req.user,
                cats: categories,
                notifications: notifs,
                countries: countries,
                loadNotifs: loadNotifs_.reverse(),
                link: null
                });
            }
            catch(error){
                console.log("Error occured while loading notifications: "+error);
            }
          } else {
            res.redirect("/");
          }
    });
    app.post("/notifications", async function(req, res){
        if(req.isAuthenticated()){
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id, status:{$ne:"archived"}}).exec();
                let loadNotifs_ = await NotificationModel.find({receiverId: req.user._id,  status: req.body.status}).limit(req.body.lim).exec();
                ages_ = [];
                loadNotifs_.reverse().forEach(not =>{
                    ages_.push(Math.floor(Math.abs( new Date() - not.createdAt ) / (1000*3600*24)));
                });
                console.log("Notifications loaded: "+notifs.length);
                res.status(200).send({message:"Ok", status:200, notifications:notifs, loadNotifs: loadNotifs_, ages: ages_});
                return;
            }catch(error){
                console.log("Error occured while loading notifications: "+error);
            }
        }else{
            res.redirect("/");
        }

    });

    app.get("/notification", async function(req, res){
        if(req.isAuthenticated()){
            try{
                if(req.user.accountType == "user") {
                    const postReqCompleted = await PostRequestModel.find({providerId: req.query?.p}).exec();
                    const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                    const notifi = await NotificationModel.findOne({_id: req.query?.n});
                    const provider = await UserModel.findOne({_id: req.query?.p}).exec();
                    const job_ = await PostRequestModel.findOne({_id: notifi.causedByItem}).exec();
                    const checkBooking_ = await BookingModel.findOne({jobId: notifi.causedByItem}).exec();
                    console.log("checkbooking: "+checkBooking_);
                    res.render("notificationDetails", {pro: provider, notifi: notifi, 
                        postRequestsCompleted: postReqCompleted.length,
                        job: job_, 
                        usr: req.user, notifications: notifs, 
                        link: null, cats: categories, 
                        checkBooking: checkBooking_, 
                        countries: countries} );
                }
                else{

                }

            }catch(error){
                console.log("Error occured while fetching notification: "+error);
            }
        }
        else{
            res.redirect("/");
        }
    });

    app.post("/read-notif", async function(req, res){

        if(req.isAuthenticated()){
            try{
                if(notificationObj.readNotification(req, res))
                    console.log("Notification read with success!");
                else    
                    console.log("Error occured while reading notification.");
            }catch(error){
                console.log("Error occured while loading notifications: "+error);
            }
        }else{
            res.redirect("/");
        }

    });

    app.get("/applicant", async function(req, res){
        if(req.isAuthenticated()){
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                const postReqCompleted = await PostRequestModel.find({providerId: req.query?.p}).exec();
                const provider = await UserModel.findById(req.query?.p).exec();
                const job_ = await PostRequestModel.findById(req.query?.j).exec();
                const checkBooking_ = await BookingModel.findOne({jobId: req.query?.j}).exec();
                res.render("applicantProfile", {pro: provider, 
                    job: job_, 
                    usr: req.user, notifications: notifs,
                    postRequestsCompleted: postReqCompleted.length,
                    checkBooking: checkBooking_,
                    link: null, cats: categories, 
                    countries: countries} );

            }catch(error){console.log("Error occured while loading notifications: "+error);
        }
        }else{
            res.redirect("/");
        }
    });

    app.get("/applications", async function(req, res){
        if(req.isAuthenticated() && req.user.accountType == "provider"){
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                const allApplications = await jobApplicationHander.getAppliedJobs(req, res);
                let ja = [];
                allApplications.forEach(app=>{
                    if(app.appStatus == "applied");
                    ja.push(app);
                });
                
                res.render("manageJobApplications", {usr: req.user, notifications: notifs, allApp: allApplications, ja: ja, link: null,  cats: categories});
                }catch(error){
                    console.log("Error occured: "+error);
                    res.redirect("/");
                }
        }else{
            res.redirect("/")
        }
    });

    app.get("/get-applications", async function(req, res){
        if(req.isAuthenticated()){
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                const allApplications = await jobApplicationHander.getAppliedJobs(req, res);
                let ja = [];
                if(req.query?.type == "all")
                    ja = allApplications
                else{
                    allApplications.forEach(app=>{
                        if(app.appStatus == req.query?.type)
                            ja.push(app);
                    });
                }
                res.send(ja);
            }catch(error) {
                console.log("Error occured: "+error);
                res.redirect("/")
            };
        }else
            res.redirect("/");

    });

    app.post("/delete-notif", async function(req, res){
        if(req.isAuthenticated()){
            try{
                if(notificationObj.deleteNotification(req, res))
                    console.log("Notification deleted with success!");
                else    
                    console.log("Error occured while deleting notification.");
            }catch(error){
                console.log("Error occured while loading notifications: "+error);
            }
        }
    });
    app.post("/hire-pro", async function(req, res) {
        if(req.isAuthenticated()){
            try{
                UserService.hireProvider(req, res);
            }
            catch(error){
                console.log("Error occured hire-pro: "+error);
            }
        }else
            res.redirect("/");
    });
    app.post("/reject-pro", async function(req, res){
        if(req.isAuthenticated()){
            try{
                UserService.rejectApplication(req, res);
            }
            catch(error){
                console.log("Error occured reject-pro: "+error);
            }
        }
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
            const allRequests = await PostRequestModel.find({username:req.user.username, status:"active"}).exec();
            const pRequests = await PostRequestModel.find({username:req.user.username, status:"active"}).limit(6).exec();
            if(pRequests){
                console.log("Requests found: "+pRequests.length);
            }else{
                console.log("No requests found with username: "+req.user.username);
            }
            res.render("manageUserRequests", {usr: req.user, notifications: notifs, postRequests: pRequests, allRequests: allRequests, link: null,  cats: categories});
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
                let allRequests = [];
                if(req.query?.type == "all"){
                    pRequests = await PostRequestModel.find({username:req.user.username}).limit(req.query?.lim).exec();
                    allRequests = await PostRequestModel.find({username:req.user.username}).exec();
                }
                else{
                    pRequests = await PostRequestModel.find({username:req.user.username, status:req.query?.type}).limit(req.query?.lim).exec();
                    allRequests = await PostRequestModel.find({username:req.user.username, status:req.query?.type}).exec();
                }

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
                const req_ = await PostRequestModel.findById(req.query?.rq).exec();
                let inPros = [];
                if(req_.status == "in-progress" || req_.status == "booked"){
                    const booking = await BookingModel.findOne({jobId: req_._id}).exec();
                    const pro = await UserModel.findById(booking.providerId).exec();
                    inPros.push(pro);
                }
                res.render("manageRequest", {usr: req.user, notifications: notifs.reverse(), interestedPros: inPros, request: req_, link: null,  cats: categories});
            }catch(error){
                console.log("Error occured: "+error);
                res.redirect("/myrequests");
            }
        }
        else
            res.redirect("/");
    })

    app.get("/mybookings", async function(req, res){
        if(req.isAuthenticated() &&  req.user.accountType == "provider"){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            const bookings = await BookingModel.find({providerId:req.user._id, status: "active"}).exec();
            if(bookings){
                console.log("Bookings found: "+bookings.length);
            }else{
                console.log("No requests found with username: "+req.user.username);
            }
            res.render("manageServiceRequests", {usr: req.user, notifications: notifs.reverse(), postRequests:bookings, link: null,  cats: categories});
            
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
            res.render("userDashboard", {usr: req.user, notifications: notifs.reverse(), cats: categories, postRequests: pRequests, link: null});
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
            res.render("userProfile", {usr: req.user, notifications: notifs.reverse(), link:null, cats: categories, countries: countries});
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

    app.get("/booking", async function(req, res){
        if(req.isAuthenticated() && req.user.accountType == "provider" && req.query?.b != null ){
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                const booking = await BookingModel.findOne({_id: req.query?.b}).exec();
                //const job_ = await PostRequestModel.findOne({_id: booking.jobId}).exec();
                const cust = await UserModel.findOne({username: booking.username}).exec();

                if(booking){
                    res.render("manageBooking", 
                    {usr: req.user, notifications: notifs.reverse(), 
                    link:null, cats: categories, 
                    countries: countries,
                    booking: booking,
                    job: booking,
                    customer: cust
                    });
                }
            }catch(error){
                console.log("Error occured: "+error);
            }
        }else
            res.redirect("/");
    });

    app.post("/confirm-booking", async function(req, res){
        if(req.isAuthenticated()){
            try{
                BookingService.confirmBooking(req, res);
            }catch(error){
                console.log("An error occured: "+error);
            }
        }
        else
            res.redirect("/");
    });
    
    app.post("/cancel-booking", async function(req, res){
        if(req.isAuthenticated() && req.user.accountType == "provider"){
            try{
                BookingService.cancelBooking(req, res);
            }catch(error){
                console.log("An error occured: "+error);
            }
        }else res.redirec("/");
    });

    app.get("/p-profile", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("userEdit", {usr: req.user, notifications: notifs.reverse(), link:null,  cats: categories, countries: countries});
        }else{res.redirect("/");}
    });

    app.get("/join-as-pro", async function(req, res){
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("joinAsProProfile", {usr: req.user, notifications: notifs.reverse(), link:null,  cats: categories, countries: countries});
        }else{res.redirect("/");}
    });

    app.get('/pro-profile/:id/', async function (req, res) {
        let provider = await UserService.findUser(req, res);
        if( req.isAuthenticated() && provider){
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                res.render("proProfile", {usr: req.user, notifications: notifs.reverse(), pro: provider, cats: categories, link:req.link});
            }catch(error){res.redirect("/");}
            
        }else
        res.render("proProfile", {usr: null, notifications: null, pro: provider, cats: categories, link:req.link});
   });
   app.get('/service-request-booking/:id/', async function (req, res) {
    let provider = await UserService.findUser(req, res);
    if( req.isAuthenticated() && provider){
        const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("bookPro", {usr: req.user, notifications: notifs.reverse(), pro: provider, cats: categories, link:req.link});
        
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
            res.render("serviceRequest",{usr: req.user, notifications: notifs.reverse(), link:null,  cats: categories});
        }else{
            console.log("User not connecting, redirecting to home page..");
            res.redirect("/");
        }
    });

    app.post("/postServiceRequest",function(req,res){
        PostRequestService.postServiceRequest(req,res);
    });

    app.post("/submitBooking",function(req,res){
        BookingService.postBooking(req,res);
    });

    app.get("/find-professionals", async function (req, res) {
        const result = await UserService.find(req.query);
        res.send(result);
      });


    app.get("/find-services-md", async function(req, res){
        
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("findProMd", {link:null, usr: req.user, notifications: notifs.reverse(), cats: categories});
        }
        else
            res.render("findProMd", {link:null, notifications: null, usr: null,  cats: categories });
    });

    app.get("/sr-details/:jobId", async function(req, res){
        if(req.isAuthenticated()){
            try{
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            const sr = await PostRequestModel.findOne({_id: req.params.jobId}).exec();
            const owner_ = await UserModel.findOne({username: sr.username});
            res.render("jobRequestDetails", {job: sr, notifications: notifs.reverse(), owner: owner_, link:null, usr: req.user, cats: categories});
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
                const postedBy = await UserModel.findOne({username: sr.username}).exec();
                sr.createdAt = ja.createdAt;
                sr.appStatus = ja.status;
                res.render("jobApplicationDetails", {job: sr, notifications: notifs.reverse(), link:null, postedBy:postedBy, usr: req.user, cats: categories});
            }catch(error){
                res.redirect("/");
            }
           
        }
        else
            res.redirect("/");
    });

    app.post("/cancel-application", async function(req, res) {
        if(req.isAuthenticated()){
            try{
                jobApplicationHander.cancelApplication(req, res);
            }catch(error){
                console.log("An error occured: "+error);
            }
        }
        else{
            res.redirect("/");
        }

    });

    app.get("/invoice", async function(req, res){
        if(req.isAuthenticated()){
            try{
                const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
                const job = await PostRequestModel.findOne({_id: req.query?.sr}).exec();
                const pro = await UserModel.findOne({_id: req.query?.p}).exec();
                res.render("invoice", {job: job, pro:pro, notifications: notifs.reverse(), link:null, usr: req.user, cats: categories});
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
            res.render("page_not_found", {usr: req.user, notifications: notifs.reverse(), cats: categories, link:req.link});
        }else
         res.render("page_not_found", {usr: null, notifications: null, cats: categories, link:null });
   });

    app.get('*', async function (req, res) {
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("page_not_found", {usr: req.user, notifications: notifs.reverse(), cats: categories, link:req.link});
        }else
         res.render("page_not_found", {usr: null, notifications: null, cats: categories, link:null });
    });
    
    app.use(async function(req, res, next) {
        if(req.isAuthenticated()){
            const notifs = await NotificationModel.find({receiverId: req.user._id}).exec();
            res.render("page_not_found", {usr: req.user, notifications: notifs.reverse(), cats: categories, link:req.link});
        }else
         res.render("page_not_found", {usr: null, notifications: null,cats: categories, link:null });
    });
}


