//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const _ = require('lodash');

const app = express();

mongoose.connect("mongodb://localhost:27017/internDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
    content: String,
    date: String,
    tag: String,
    checked: Boolean
});

const Item = mongoose.model('Item', itemsSchema);

// const userSchema =  new mongoose.Schema({
//     name: String,
//     password: String,
//     listItems: [itemsSchema]
// });

// const User = mongoose.model('User', userSchema);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.get("/",function(req,res){
    Item.find({}, function (err, items) {
        res.render("home",{items:items});
    });
});


app.post("/delete", function (req, res) {
    var item_id = req.body.deleteItem;
    Item.findByIdAndRemove(item_id, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully deleted to database");
        }
    });
    res.redirect("/");
});

app.post("/update", function (req, res) {
    var item_id = req.body.checkInput;
    console.log(req.body);
    // Item.find({_id:item_id}, function (err, toUpdate) {
    //     console.log(toUpdate);
    //     Item.findOneAndUpdate({_id:item_id},{checked:!toUpdate.checked},function (err) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log("Successfully updated to database");
    //         }
    //     });
    // });
    // res.redirect("/");
});



app.post("/",function(req,res){
    if(req.body.home){
        const add = new Item({ 
            content: req.body.content,
            date: req.body.date,
            tag: "home",
            checked: false,
        });
        Item.insertMany(add, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully saved to database");
            }
        });
        res.redirect("/");
    }
    if(req.body.personal){
        const add = new Item({ 
            content: req.body.content,
            date: req.body.date,
            tag: "personal",
            checked: false,
        });
        Item.insertMany(add, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully saved to database");
            }
        });
        res.redirect("/");
    }
    if(req.body.office){
        const add = new Item({ 
            content: req.body.content,
            date: req.body.date,
            tag: "office",
            checked: false,
        });
        Item.insertMany(add, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully saved to database");
            }
        });
        res.redirect("/");
    }
});

// Listening on Port 3000

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function() {
    console.log('Server started on port '+ port);
});