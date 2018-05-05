var mongoose = require("mongoose"),
  Campground = require("./models/campgrounds"),
  Comment = require("./models/comment");
var data = [
  {
    name: "Cloud's  rest",
    image:
      "http://www.onguma.com/uploads/6/2/0/8/6208718/201604-aoba-935_orig.jpg",
    description:
      "The best place to go for outing.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
  },
  {
    name: "Heaven's gate",
    image:
      "https://cdn.vox-cdn.com/thumbor/-JoPdcgAuLTUsWiDZ62CX4wb33k=/0x0:5225x3479/1200x800/filters:focal(2195x1322:3031x2158)/cdn.vox-cdn.com/uploads/chorus_image/image/54137643/camping_tents.0.jpg",
    description:
      "The best place to go for outing in a budget.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
  },
  {
    name: "Rocky Desert",
    image:
      "https://i.kinja-img.com/gawker-media/image/upload/s--R5wWF5Ob--/c_fill,fl_progressive,g_center,h_358,q_80,w_636/c9pd8amxevnsn36ldwd5.jpg",
    description:
      "The best place to go for outing if you have the budget.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
  }
];

function seedDB() {
  // Remove Campgrounds
  Campground.remove({}, function(err) {
    if (err) {
      console.log(err);
    } else console.log("removed");
    data.forEach(function(camps) {
      Campground.create(camps, function(err, campground) {
        if (err) {
          console.log(err);
        } else {
          console.log("Campground added");
          //create a comment
          Comment.create(
            {
              text: "This is a test comment",
              author: "Homer"
            },
            function(err, comment) {
              if (err) {
                console.log(err);
              } else {
                campground.comments.push(comment);
                campground.save();
                console.log("Comment added");
              }
            }
          );
        }
      });
    });
  });
}
module.exports = seedDB;
