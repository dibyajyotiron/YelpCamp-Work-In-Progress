var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);
// Search Regular Expression

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//INDEX - show all campgrounds

router.get("/", function(req, res) {
  var notFound = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi"); //g is global, i is ignore case
    Campground.find({ name: regex }, function(err, allCamps) {
      if (err) {
        console.log(err);
      } else {
        if (allCamps.length < 1) {
          notFound =
            "Sorry, we could not find any matching result!! Try something else!";
        }
        res.render("campground/index", {
          camps: allCamps,
          notFound: notFound
        });
      }
    });
  } else {
    Campground.find({}, function(err, allCamps) {
      if (err) {
        console.log(err);
      } else {
        res.render("campground/index", {
          camps: allCamps,
          notFound: notFound
        });
      }
    });
  }
});
//CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res) {
  var name = req.body.name;
  var image = req.body.image;
  var description = req.body.description;
  var cost = req.body.cost;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      console.log(err);
      console.log(data);
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {
      name: name,
      image: image,
      description: description,
      cost: cost,
      author: author,
      location: location,
      lat: lat,
      lng: lng
    };
    Campground.create(newCampground, function(err, newlyCreated) {
      if (err) {
        console.log(err);
      } else {
        req.flash("success", "Successfully created Campground");
        res.redirect("/campgrounds");
      }
    });
  });
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
      if (err || !foundCamp) {
        console.log(err);
        req.flash("error", "Please don't change Campground id!");
        res.redirect("/campgrounds");
      } else {
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
  //console.log(req.body.camp.location);
  geocoder.geocode(req.body.camp.location, function(err, data) {
    if (err || !data.length) {
      console.log(err);
      console.log(data);
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    req.body.camp.lat = data[0].latitude;
    req.body.camp.lng = data[0].longitude;
    req.body.camp.location = data[0].formattedAddress;
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
