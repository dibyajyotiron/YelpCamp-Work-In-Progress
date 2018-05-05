var express = require("express"),
  app = express(),
  request = require("request"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  localStrategy = require("passport-local"),
  User = require("./models/user"),
  bodyParser = require("body-parser"),
  Campground = require("./models/campgrounds"),
  Comment = require("./models/comment"),
  seedDB = require("./seeds"),
  methodOverride = require("method-override"),
  flash = require("connect-flash"),
  port = process.env.PORT || 3000;

// mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect(
  "mongodb://dibya_ww:12345@ds117010.mlab.com:17010/yelpcamp_dibya"
);

//require routes
var commentRoutes = require("./routes/comments"),
  campgroundRoutes = require("./routes/campgrounds"),
  indexRoutes = require("./routes/index");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");
//seed the database
//seedDB();

//Passport Configuration
app.use(
  require("express-session")({
    secret: "It is YelpCamp",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.info = req.flash("info");
  res.locals.warning = req.flash("warning");
  next();
});
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.listen(port, function() {
  console.log("YelpCamp server has started!!");
});
