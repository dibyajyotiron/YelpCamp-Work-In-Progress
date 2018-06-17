var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campgrounds");
var Comments = require("../models/comment");
var middleware = require("../middleware/index");
var crypto = require("crypto");
var async = require("async");
var nodemailer = require("nodemailer");
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

//Forgot password route --get form
router.get("/forgot", (req, res) => {
  res.render("forgot");
});

//Forgot Password route -- post form
router.post("/forgot", function(req, res, next) {
  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash("warning", "No account with that email address exists.");
            return res.redirect("/forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 900000; // 15 minutes

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "yelpcampresetpwd@gmail.com",
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: "yelpcampresetpwd@gmail.com",
          subject: "YelpCamp Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested to reset your password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.Please do not reply to this email.\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log("mail sent");
          req.flash(
            "success",
            "An e-mail has been sent to " +
              user.email +
              " with further instructions."
          );
          done(err, "done");
        });
      }
    ],
    function(err) {
      if (err) return next(err);
      res.redirect("/forgot");
    }
  );
});

//forgot password handle token
router.get("/reset/:token", function(req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    function(err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("reset", { token: req.params.token });
    }
  );
});
router.post("/reset/:token", function(req, res) {
  async.waterfall(
    [
      function(done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
          },
          function(err, user) {
            if (!user) {
              req.flash(
                "error",
                "Password reset token is invalid or has expired."
              );
              return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function(err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
              });
            } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect("back");
            }
          }
        );
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "yelpcampresetpwd@gmail.com",
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: "yelpcampresetpwd@gmail.com",
          subject: "Your password has been changed, Welcome back!",
          text:
            "Hello,\n\n" +
            "This is a confirmation email that the password for your account " +
            user.email +
            " has just been changed. Please do not reply to this email.\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash(
            "success",
            "Congratulations! Your password has been changed. Welcome back " +
              user.username +
              "!"
          );
          done(err);
        });
      }
    ],
    function(err) {
      res.redirect("/campgrounds");
    }
  );
});

//user profile route
router.get("/user/:id", function(req, res) {
  var perPage = 8;
  var pageQuery = parseInt(req.query.page);
  var page = pageQuery ? pageQuery : 1;
  var notFound = null;
  User.findById(req.params.id, function(err, foundUser) {
    if (err || !foundUser) {
      req.flash("warning", "Don't change user id!");
      res.redirect("/campgrounds");
    } else {
      Campground.find()
        .where("author.id")
        .equals(foundUser._id)
        .sort({ createdAt: "desc" })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec(function(err, campgrounds) {
          if (err || !campgrounds) {
            req.flash("error", "Something went wrong!");
            return res.redirect("/campgrounds");
          } else {
            Campground.count()
              .where("author.id")
              .equals(foundUser._id)
              .exec(function(err, count) {
                if (err) {
                  console.log(err);
                  res.redirect("back");
                } else {
                  console.log(campgrounds.length);
                  if (campgrounds.length === 0) {
                    notFound = `You've reached the end of the results!
                    ${
                      foundUser.username
                    } doesn't have any more offerings for you!`;
                    console.log(notFound);
                    res.render("profiles/show", {
                      user: foundUser,
                      campgrounds: campgrounds,
                      current: page,
                      pages: Math.ceil(count / perPage),
                      search: false,
                      notFound: notFound
                    });
                  } else {
                    res.render("profiles/show", {
                      user: foundUser,
                      campgrounds: campgrounds,
                      current: page,
                      pages: Math.ceil(count / perPage),
                      search: false,
                      notFound: notFound
                    });
                  }
                }
                //console.log(foundUser._id);
                //console.log(Campground.find().paths);
                // res.render("profiles/show", {
                //   user: foundUser,
                //   campgrounds: campgrounds
                // });
              });
          }
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
