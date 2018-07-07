var mongoose = require("mongoose");

var campSchema = new mongoose.Schema({
  name: String,
  image: String,
  cost: Number,
  description: String,
  location: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
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
  ],
  ratings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rating"
    }
  ],
  rating: { type: Number, default: 0 }
});
module.exports = mongoose.model("Campground", campSchema);
