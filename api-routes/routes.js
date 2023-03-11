
module.exports = function(app){

    const root = require('path').resolve('./');
    const model = require(root + "/models/models.js");

    app.get("/", function(req, res){
       
        model.showHomePage(req, res);
    });

    app.get("/login", function(req, res){
        res.render("login");
    });
    
    app.get("/register", function(req, res){
        res.render("register");
    });

    app.post("/register-user", function(req, res){
        model.registerUser(req, res);
    });

    app.post("/register-pro", function(req, res){
        model.registerProvider(req, res);
    });

    app.post("/login-u", function(req, res){
        model.loginUser(req, res);
    });

    app.get("/about-us", function(req, res){
        res.render("about_us", {usr: null});
    });

    app.get("/contact-us", function(req, res){
        res.render("contact", {usr: null});
    });

    app.get("/logout", function(req, res, next ){
        req.logout(function(err){
            if(err){return next(err);}
            res.redirect("/");
        });
    });

    app.get('*', function (req, res) {
         res.render("page_not_found", {usr: null});
    });

}


