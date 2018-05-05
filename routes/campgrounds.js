var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware");

//INDEX - show all campgrounds
router.get("/", function(req, res) {
  Campground.find({}, function(err, allCamps) {
    if (err) {
      console.log(err);
    } else {
      res.render("campground/index", {
        camps: allCamps
      });
    }
  });
});
//CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res) {
  var name = req.body.name;
  var image = req.body.image;
  var description = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var cost = req.body.cost;
  var newCampground = {
    name: name,
    image: image,
    description: description,
    cost: cost,
    author: author
  };
  Campground.create(newCampground, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      req.flash("success", "Successfully created Campground");
      res.redirect("/campgrounds");
    }
  });
  //campgrounds.push(newCampground)
});
//NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("campground/new");
});
// SHOW ROUTE :  Shows info about a campground
router.get("/:id", function(req, res) {
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCamp) {
      if (err) console.log(err);
      else {
        console.log(foundCamp);
        res.render("campground/show", { campground: foundCamp });
      }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampOwnership, function(req, res) {
  //check if user is logged in
  Campground.findById(req.params.id, function(err, found) {
    //found.author.id is a mongoose object and other one is a string
    res.render("campground/edit", { campground: found });
  });
  //if logged in check if it was created by him
  //if not redirect to login
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampOwnership, function(req, res) {
  Campground.findByIdAndUpdate(req.params.id, req.body.camp, function(
    err,
    updated
  ) {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      req.flash("error", "Campground can not be deleted!!");
      res.redirect("/campgrounds");
    } else {
      req.flash("warning", "Campground deleted");
      res.redirect("/campgrounds");
    }
  });
});

module.exports = router;
