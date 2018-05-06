var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route
router.get("/", function(req, res) {
  res.render("landing");
});

// show register form
router.get("/register", function(req, res) {
  res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({ username: req.body.username });
  if (req.body.adminCode === "dibyajyotiron_123") {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Hey " + user.username + ", Sign Up successful!");
      res.redirect("/campgrounds");
    });
  });
});

//show login form
router.get("/login", function(req, res) {
  res.render("login");
});

//handling login logic
router.post("/login", function(req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: ("success",
    "Hey " + req.body.username + ", welcome to YelpCamp!")
  })(req, res);
});
// logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("info", "Logged you Out");
  res.redirect("/campgrounds");
});

module.exports = router;
