var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var User = require("../models/user");
//middleware
var middleObj = {};

middleObj.checkCampOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function(err, found) {
      if (err || !found) {
        req.flash(
          "warning",
          "The requested Campground doesn't exist anymore!!"
        );
        res.redirect("/campgrounds");
      } else if (found.author.id.equals(req.user._id) || req.user.isAdmin) {
        //found.author.id is a mongoose object and other one is a string
        next();
      } else {
        req.flash(
          "warning",
          "You can only make changes to a campground you added"
        );
        res.redirect("/campgrounds/" + req.params.id);
      }
    });
  } else {
    req.flash("error", "You need to be logged in");
    res.redirect("/login");
  }
};

middleObj.checkCommentOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, found) {
      if (err || !found) {
        req.flash("warning", "Comment no longer exists!!");
        res.redirect("/campgrounds");
      } else {
        if (found.author.id.equals(req.user._id)) {
          //found.author.id is a mongoose object and other one is a string
          next();
        } else {
          req.flash("error", "You're not allowed to do this");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("warning", "You need to be logged in first to edit your bio!");
    res.redirect("back");
  }
};

middleObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You've to login first to do this!");
  res.redirect("/login");
};

// middleObj.checkProfileOwnership = function(req, res, next) {
//   if (req.isAuthenticated()) {
//     User.findById(req.params.id, function(err, found) {
//       console.log(req.params.id);
//       console.log(found._id);
//       if (err || !found) {
//         console.log(found);
//         req.flash("warning", "The requested User doesn't exist anymore!!");
//         res.redirect("/campgrounds");
//       } else if (found._id === req.params.id) {
//         next();
//       } else {
//         req.flash("warning", "You can only make changes to your profile!");
//         res.redirect("/campgrounds/" + req.params.id);
//       }
//     });
//   } else {
//     req.flash("error", "You need to be logged in");
//     res.redirect("/login");
//   }
// };
middleObj.checkProfileOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    User.findById(req.params.id, (err, foundUser) => {
      // console.log(req.params.id);
      // console.log(foundUser._id);
      if (err || !foundUser) {
        console.log(err);
        req.flash("warning", "The requested User doesn't exist anymore!!");
        res.redirect("/campgrounds");
      } else if (foundUser._id.equals(req.user._id)) {
        next();
      } else {
        req.flash("warning", "You can only make changes to your profile!");
        res.redirect("/user/" + req.params.id);
      }
    });
    //next();
  } else {
    req.flash("error", "You need to be logged in");
    res.redirect("/login");
  }
};

module.exports = middleObj;
