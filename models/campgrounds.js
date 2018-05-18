var mongoose = require("mongoose");

var campSchema = new mongoose.Schema({
  name: String,
  image: String,
  cost: Number,
  description: String,
  location: String,
  lat: Number,
  lng: Number,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment" //name of the model
    }
  ]
});
module.exports = mongoose.model("Campground", campSchema);
