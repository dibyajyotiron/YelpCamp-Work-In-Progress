var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campgrounds");
var Rating = require("../models/rating");
var middleware = require("../middleware/index");

router.post("/", middleware.isLoggedIn, middleware.checkRatingExists, function(
  req,
  res
) {
  Campground.findById(req.params.id, function(err, campground) {
    if (err) {
      console.log(err);
    } else if (req.body.rating) {
      Rating.create(req.body.rating, function(err, rating) {
        if (err) {
          console.log(err);
          res.redirect("back");
        } else {
          req.flash("success", "Successfully added a rating!");
          rating.author.id = req.user._id;
          rating.author.username = req.user.username;
          rating.save();
          campground.ratings.push(rating);
          campground.save();
        }
      });
    } else {
      req.flash("warning", "Please select a rating to submit!");
    }
    res.redirect("/campgrounds/" + campground._id);
  });
});

module.exports = router;
