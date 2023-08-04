const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//---------------------------------------Mongoose Connection---------------------------------------
mongoose.connect("mongodb://127.0.0.1:27017/BlogDB", {useNewUrlParser:true})
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

//---------------------------------------Mongoose Schema---------------------------------------
  const postSchema = mongoose.Schema({
    title: String,
    content: String
  });

  const blogSchema = mongoose.Schema({
    title: String,
    content: String
  });

// //---------------------------------------Mongoose Model---------------------------------------
  const Post = mongoose.model("Post", postSchema);
  const Blog = mongoose.model("Blog", postSchema);

//---------------------------------------Mongoose Documents------------------------------------
  const homepost = new Post({
    title: "Home",
    content: "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing."
  });

  const aboutpost = new Post({
    title: "About",
    content: "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui."
  });

  const contactpost = new Post({
    title: "Contact",
    content: "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero."
  });

//jshint esversion:6

let posts = [];

app.get("/", function (req, res) {
  Post.find()
    .then((results) => {
      if (results.length === 0) {
        homepost.save();
        aboutpost.save();
        contactpost.save();

        // Use Promise.all to handle multiple asynchronous operations
        Promise.all([Post.findOne({ title: "Home" }), Blog.find()])
          .then(([homepostcontent, blogs]) => {
            res.render("home", {
              homecontent: homepostcontent ? homepostcontent.content : '',
              blogs: blogs
            });
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        Post.findOne({ title: "Home" })
          .then(homepostcontent => {
            Blog.find()
              .then(blogs => {
                res.render("home", {
                  homecontent: homepostcontent ? homepostcontent.content : '',
                  blogs: blogs
                });
              })
              .catch(err => {
                console.log(err);
              });
          })
          .catch(err => {
            console.log(err);
          });
      }
    })
    .catch(err => {
      console.log(err);
    });
});


app.get("/about", function(req,res){
    Post.findOne({title: "About"})
    .then(aboutpostcontent => {
      res.render("about",{ aboutcontent: aboutpostcontent.content});
    })
    .catch(err => {
      console.log(err);
    });
})

app.get("/contact", function(req,res){
    Post.findOne({title: "Contact"})
    .then(contactpostcontent => {
      res.render("contact",{contactcontent: contactpostcontent.content});
    })
    .catch(err => {
      console.log(err);
    });
})
  
  app.get("/posts/:ptitle", function(req, res) {
    const ptitle = req.params.ptitle.toLowerCase();
    
    // Blog.findOne({title: ptitle} )
    Blog.findOne({ title: { $regex: new RegExp(ptitle, "i") } }) //$regex is for lowercase check in mongodb
    .then(blog => {
        if (blog) {
          res.render("post", {
            posttitle: blog.title,
            postblog: blog.content
          });
        } else {
          console.log("Blog not found");
        }
      })
      .catch(err => {
        console.log(err);
      });
});


app.get("/compose", function(req,res){
  res.render("compose", {});
});

app.post("/compose", function(req, res) {
  const blog = new Blog({
    title: req.body.title,
    content: req.body.blog
  });

  Blog.insertMany([blog])
    .then(blog => {
    })
    .catch(err => {
      console.log(err);
    });
    res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
