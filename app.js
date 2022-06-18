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

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

var count_home=0;
var count_office=0;
var count_personal=0;
var count_today=0;
var count_tomorrow=0;
var count_yesterday=0;
var count_archive=0;
var count_all=0;

app.get("/",function(req,res){
    Item.find({}, function (err, items) {
        count_home=0;
        count_office=0;
        count_personal=0;
        count_today=0;
        count_tomorrow=0;
        count_yesterday=0;
        count_archive=0;
        count_all=0;
        count_all = items.length;
        items.map((item)=>{
            if(item.tag==="Home"){
                count_home++;
            }
            else if(item.tag==="Office"){
                count_office++;
            }
            else if(item.tag==="Personal"){
                count_personal++;
            }
            if(item.date==="Today"){
                count_today++;
            }
            else if(item.date==="Tomorrow"){
                count_tomorrow++;
            }
            else if(item.date==="Yesterday"){
                count_yesterday++;
            }
            if(item.checked===true){
                count_archive++;
            }
        });
        res.render("home",{clicked:"",items:items, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
    });
});

app.get("/items/:itemTitle",function(req,res){
    const itemTag = _.capitalize(req.params.itemTitle);
    if(itemTag==="Home" || itemTag==="Office" || itemTag==="Personal"){
        Item.find({tag:itemTag}, function (err, items) {
            res.render("home",{clicked:itemTag,items:items, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
        });
    }
    else{
        if(itemTag==="Archieve"){
            Item.find({checked:true}, function (err, items) {
                count_archive=items.length;
                res.render("home",{clicked:itemTag,items:items, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:items.length, count_yesterday:count_yesterday});
            });
        }
        else if(itemTag==="All"){
            Item.find({}, function (err, items) {
                res.render("home",{clicked:itemTag,items:items, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
            });
        }
        else{
            Item.find({date:itemTag}, function (err, items) {
                res.render("home",{clicked:itemTag,items:items, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
            });
        }
    }
});

app.post("/delete", function (req, res) {
    var item_id = req.body.deleteItem;
    Item.findByIdAndRemove(item_id, function (err) {
        if (err) {
            console.log(err);
        } else {
            Item.find({}, function (err, items) {
                count_home=0;
                count_office=0;
                count_personal=0;
                count_today=0;
                count_tomorrow=0;
                count_yesterday=0;
                count_archive=0;
                count_all=0;
                count_all = items.length;
                items.map((item)=>{
                    if(item.tag==="Home"){
                        count_home++;
                    }
                    else if(item.tag==="Office"){
                        count_office++;
                    }
                    else if(item.tag==="Personal"){
                        count_personal++;
                    }
                    if(item.date==="Today"){
                        count_today++;
                    }
                    else if(item.date==="Tomorrow"){
                        count_tomorrow++;
                    }
                    else if(item.date==="Yesterday"){
                        count_yesterday++;
                    }
                });
            });
            console.log("Successfully deleted to database");
        }
    });
    res.redirect('back');
});

app.post("/update", function (req, res) {
    var item_id = req.body.checkInput;
    if(Array.isArray(item_id)){
        count_archive++;
        item_id = item_id[0];
        Item.find({_id:item_id}, function (err, toUpdate) {
            Item.findOneAndUpdate({_id:item_id},{checked:!toUpdate[0].checked},function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully updated to database");
                }
            });
        });
        res.redirect('back');
    }
    else{
        count_archive--;
        Item.find({_id:item_id}, function (err, toUpdate) {
            Item.findOneAndUpdate({_id:item_id},{checked:!toUpdate[0].checked},function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully updated to database");
                }
            });
        });
        res.redirect('back');

    }
});



app.post("/",function(req,res){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    var yesterday = new Date(new Date().getTime() - 24*60*60*1000);
    dd = String(yesterday.getDate()).padStart(2, '0');
    mm = String(yesterday.getMonth() + 1).padStart(2, '0'); 
    yyyy = yesterday.getFullYear();
    yesterday = yyyy + '-' + mm + '-' + dd;
    var tommorow =  new Date(new Date().getTime() + 24*60*60*1000);
    dd = String(tommorow.getDate()).padStart(2, '0');
    mm = String(tommorow.getMonth() + 1).padStart(2, '0'); 
    yyyy = tommorow.getFullYear();
    tommorow = yyyy + '-' + mm + '-' + dd;
    var date;
    if(req.body.date===today){
        console.log("hi");
        date = "Today";
    }
    else if(req.body.date===tommorow){
        date = "Tomorrow";
    }
    else if(req.body.date===yesterday){
        date = "Yesterday";
    }
    else{
        date = req.body.date
    }
    if(req.body.home){
        const add = new Item({ 
            content: req.body.content,
            date: date,
            tag: "Home",
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
            date: date,
            tag: "Personal",
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
            date: date,
            tag: "Office",
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