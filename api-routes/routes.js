
module.exports = function(app){
    require("dotenv").config();
    const root = require('path').resolve('./');
    const model = require(root + "/models/models.js");

    app.get("/", function(req, res){
       
        model.showHomePage(req, res);
    });

    app.get("/login", function(req, res){
        res.render("login", {usr: null});
    });
    
    app.get("/register", function(req, res){
        res.render("register");
    });

    app.post("/register-user", function(req, res){
        
        const name = req.body.firstName; 
        const email = req.body.email;
        const subject = "Verify Your MosalaPro Email Address";
        const message = "Hi "+name+",\n\nPlease enter the following verification code to access your MosalaPro Account.\n";
        //implement your spam protection or checks.
        console.log(model.sendEmail(name, email, subject, message, req, res));
    });

    app.post("/verify-email", function(req, res){
        console.log("Code entered: "+req.code);
        console.log("User: "+req.usr);
    });

    app.post("/register-pro", function(req, res){
        model.registerProvider(req, res);
    });

    app.post("/login-u", function(req, res){
        model.loginUser(req, res);
    });

    app.get("/professionals", function(req, res){
        res.render("forProfessionals", {usr: null, cats: req.cats});
    });

    app.get("/find-services", function(req, res){
        model.showFindServicesPage(req, res);
    });

    app.get("/about-us", function(req, res){
        model.showAboutUsPage(req, res);
    });

    app.get("/contact-us", function(req, res){
        model.showContactUsPage(req, res);
    });

    app.get("/logout", function(req, res, next ){
        req.logout(function(err){
            if(err){return next(err);}
            res.redirect("/");
        });
    });

    app.get('*', function (req, res) {
         res.render("page_not_found", {usr: null, cats: req.cats});
    });

}


