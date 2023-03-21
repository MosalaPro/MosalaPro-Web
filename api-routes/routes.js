
module.exports = function(app){
    require("dotenv").config();
    const root = require('path').resolve('./');
    const model = require(root + "/models/models.js");
    const Token = model.getTokenModel();
    const User = model.getUserModel();
    const Country = model.getCountryModel();
    const City = model.getCityModel();
    const Location = model.getLocationModel();
    
    app.get("/", function(req, res){
       
        model.showHomePage(req, res);
    });

    app.get("/login", function(req, res){
        res.render("login", {usr: null});
    });
    
    app.get("/register", function(req, res){
        res.render("register");
    });
    app.post("/register-user", async (req, res) => {
        model.registerUser(req, res);
    });

    app.get("/professionals", function(req, res){
        model.showForProPage(req, res);
    });

    app.get("/find-services", function(req, res){
        model.showFindProfessionalsPage(req, res);
    });

    app.get("/about-us", function(req, res){
        model.showAboutUsPage(req, res);
    });

    app.get("/contact-us", function(req, res){
        model.showContactUsPage(req, res);
    });

    app.get("/service-request", function(req, res){
        model.showServiceRequestPage(req, res);
    });
    app.get("/verification", function(req, res){
        res.render("emailVerification", {usr: null, cats: categories});
    });
    app.get("/verified", function(req, res){
        res.render("emailVerified", {usr:null, cats: categories});
    });
    app.get("/user/verify/:id/:token", async (req, res) => {
        model.verifyEmail(req, res);
      });
    app.get("/logout", function(req, res, next ){
        req.logout(function(err){
            if(err){return next(err);}
            res.redirect("/");
        });
    });
    app.get('/:anything/', function (req, res) {
        res.render("page_not_found", {usr: null, cats: categories});
   });

    app.get('*', function (req, res) {
         res.render("page_not_found", {usr: null, cats: categories});
    });
    
    
    app.use(function(req, res, next) {
        res.render("page_not_found", {usr: null, cats: categories});
    });

    app.post("/verify-email", function(req, res){
        // if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
        // {
        //   console.log("Something went to wrong, please try again");
        // }
        // const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        // const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
        // request(verificationURL,function(error,response,body) {
        //   body = JSON.parse(body);
        //   if(body.success !== undefined && !body.success) {
        //     console.log("Captcha verification failed");
        //   }
        //   res.json({"responseSuccess" : "Sucess"});
        // });
       
        model.verifyEmail(req, res);
    });

    

   
    app.post("/register-pro", function(req, res){
        model.registerProvider(req, res);
    });

    app.post("/login-u", function(req, res){
        model.loginUser(req, res);
    });

}


