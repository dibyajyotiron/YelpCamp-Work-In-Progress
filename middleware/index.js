var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");

//middleware
var middleObj = {};

middleObj.checkCampOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function(err, found) {
      if (err) {
        req.flash("error", "Something unexpected happened!!");
        res.redirect("back");
      } else if (found.author.id.equals(req.user._id)) {
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
      if (err) {
        req.flash("error", "Something unexpected happened!!");
        res.redirect("back");
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
    req.flash("warning", "You need to be logged in first to edit a comment!");
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

module.exports = middleObj;
