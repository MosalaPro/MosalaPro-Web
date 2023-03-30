
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
    
    app.post("/login-u", function(req, res){
        model.loginUser(req, res);
    });
    
    app.get("/register", function(req, res){
        res.render("register");
    });
    app.get("/profile", function(req, res){
        res.render("userProfile", {usr: req.user, link:null, cats: categories});
    });
    app.get("/p-profile", function(req, res){
        res.render("professionalProfile", {usr: req.user, link:null,  cats: categories});
    });
    app.post("/register-pro", function(req, res){
        model.registerProvider(req, res);
    });
    app.get("/register-pro", function(req, res){
        model.renderEmailVer(req, res, "/verify-p-email");
    });
    app.post('/verify-p-email', function(req, res) {
        model.verifyProviderEmail(req, res);
    });
    app.post("/register-user", async (req, res) => {
        model.registerUser(req, res);
    });
    app.get("/register-user", function(req, res){
        model.renderEmailVer(req, res, "/verify-u-email");
    });
    app.post('/verify-u-email', function(req, res) {
        model.verifyUserEmail(req, res);
    });
    
    app.get("/resendCode/:id", function(req, res){
        model.resendCode(req, res);
    });
    app.get("/professionals", function(req, res){
        model.showForProPage(req, res);
    });
    app.get("/service_request", function (req, res) {
        model.serviceRequest(req, res);
      });
    app.post("/postServiceRequest",function(req,res){
        console.log("/postServiceRequest")
        model.postServiceRequest(req,res);
    });
    app.get("/find-services", function(req, res){
        model.showFindProfessionalsPage(req, res);
    });

    app.get("/find-services-md", function(req, res){
        model.showFindProfessionalsMdPage(req, res);
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
        res.render("page_not_found", {usr: null, link:null, cats: categories});
   });

    app.get('*', function (req, res) {
         res.render("page_not_found", {usr: null, link:null, cats: categories});
    });
   
    
    app.use(function(req, res, next) {
        res.render("page_not_found", {usr: null, link:null, cats: categories});
    });
    

}


