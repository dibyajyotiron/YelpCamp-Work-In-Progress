var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campgrounds");
var Comments = require("../models/comment");
var middleware = require("../middleware/index");
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
  var newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar,
    bio: req.body.bio
  });
  if (req.body.adminCode === process.env.admin_Code) {
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

//user profile route
router.get("/user/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if (err || !foundUser) {
      req.flash("warning", "Don't change user id!");
      res.redirect("/campgrounds");
    } else {
      Campground.find()
        .where("author.id")
        .equals(foundUser._id)
        .exec(function(err, campgrounds) {
          if (err || !campgrounds) {
            req.flash("error", "Something went wrong!");
            return res.redirect("/campgrounds");
          }
          //console.log(foundUser._id);
          //console.log(Campground.find().paths);
          res.render("profiles/show", {
            user: foundUser,
            campgrounds: campgrounds
          });
        });
    }
  });
});
//Profile Edit Route
router.get("/user/:id/edit", middleware.checkProfileOwnership, function(
  req,
  res
) {
  User.findById(req.params.id, function(err, found) {
    // if (err || !found) {
    //   // console.log(err);
    //   // req.flash("error", "Don't tamper with the user id!");
    //   res.redirect("/campgrounds");
    // } else {
    res.render("../views/profiles/edit.ejs", { user: found });
    //}
    //found.author.id is a mongoose object and other one is a string
  });
});

//Profile Update Route
router.put("/user/:id", middleware.checkProfileOwnership, function(req, res) {
  //console.log(req.body);

  User.findByIdAndUpdate(req.params.id, req.body, function(err, updated) {
    if (err || !updated) {
      console.log(err);
      req.flash("error", "Something went wrong!");
      res.redirect("/campgrounds");
    } else {
      req.flash("info", "User Details Updated!");
      res.redirect("/user/" + req.params.id);
    }
  });
});

module.exports = router;
