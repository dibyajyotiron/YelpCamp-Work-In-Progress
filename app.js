var express = require("express")
var app = express()
///////////////////////////////////////////
var request = require("request")
//////////////////////////////////////////
var mongoose = require("mongoose")
mongoose.connect("mongodb://localhost/yelp_camp")
///////////////////////////////////////////
var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}))
///////////////////////////////////////////
app.set("view engine","ejs")
///////////////////////////////////////////
var campSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
})
var Campground = mongoose.model("Campground",campSchema)
//////////////////////////////////////////

//////////////////////////////////////////
app.get("/",function(req,res){
    res.render("landing")
})
app.get("/campgrounds",function(req,res){
    Campground.find({},function(err,allCamps){
        if(err){
            console.log(err)
        }
        else{
            res.render("index",{camps: allCamps})
        }
    })
    
})
// Campground.create({
//     name : "Heaven's garden", 
//     image : "https://s3.amazonaws.com/imagescloud/images/medias/camping/camping-tente.jpg",
//     description: "This is heaven's garden for you to explore."
// },function(err,campground){
//     if(err){
//         console.log(err)
//     }
//     else{
//         console.log("Camp created")
//         console.log(campground)
//     }
// })

app.post("/campgrounds",function(req,res){
    var name = req.body.name
    var image = req.body.image
    var description = req.body.description
    var newCampground = {name:name, image:image, description:description}
    Campground.create(newCampground,function(err,newlyCreated){
        if(err){
            console.log(err)
        }
        else{
            res.redirect("/campgrounds")
        }
    })
    //campgrounds.push(newCampground)
    
})
app.get("/campgrounds/new",function(req, res) { 
    res.render("new")
})

app.get("/campgrounds/:id",function(req,res){
    Campground.findById(req.params.id,function(err, foundCamp){
        if(err)
        console.log(err)
        else{
            res.render("show",{campground: foundCamp})
        }
    })
})



























///////////////////////////////////
app.listen(3000, function(){
    console.log("Yelpcamp server has started!!")
})