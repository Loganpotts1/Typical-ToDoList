//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://logan-potts:sythelord9@cluster-prime-eqhjo.mongodb.net/todo-v2",{useNewUrlParser: true,useUnifiedTopology:true});

const itemSchema = new mongoose.Schema ({
  name: String
});
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const Item = mongoose.model("item", itemSchema);
const List = mongoose.model("list", listSchema);


const item1 = new Item({
  name:"Welcome to your personal ToDoList!"
});
const item2 = new Item({
  name:"Click the + to add a new item"
});
const item3 = new Item({
  name:"<--- Click this to delete it once you're done!"
});



app.get("/", function(req, res) {

    Item.find(function(err,results){

      if (results.length === 0){
        Item.insertMany([item1,item2,item3], function(err){
          if (err){
            console.log(err);
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: results});
      }

    });

});

app.post("/", function(req, res){
  const listName = req.body.list;
  const itemName = req.body.newItem;
  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName}, function(err, result){
      console.log(result.items);
      result.items.push(item);
      result.save();
    });
    res.redirect("/" + listName);
  }

});

app.post("/delete", function(req, res){
  const deleteId = req.body.delete;
  const listName = req.body.listName;
  if(listName === "Today"){
  Item.findByIdAndRemove(deleteId,function(err){
    console.log(err);
  });
  res.redirect("/");
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteId}}}, function(err, result){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});


app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customList", function(req,res){
  const listName = _.capitalize(req.params.customList);
  List.findOne({name:listName}, function(err,result){
    if(!err){
      if(!result){
        const newList = new List({
          name: listName,
          items: [item1,item2,item3]
        });
        newList.save();
        res.redirect("/" + req.params.customList);
      } else {
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    }
  });

})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);
