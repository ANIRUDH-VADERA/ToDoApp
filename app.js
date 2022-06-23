//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
const cookieParser = require("cookie-parser");
const { createTokens, validateToken, verifyRoles} = require("./JWT");
const jwt = require('jsonwebtoken');
const JWP_SECRET = process.env.JWP_SECRET;
const ROLES_LIST = require("./roles_list.js");

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var count_home=0;
var count_office=0;
var count_personal=0;
var count_today=0;
var count_tomorrow=0;
var count_yesterday=0;
var count_archive=0;
var count_all=0;
var today;
var tommorow;
var yesterday;
var mm;
var dd;
var yyyy;

let mainUsername;
let role;
mongoose.connect("mongodb://localhost:27017/internDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
    content: String,
    date: String,
    tag: String,
    checked: Boolean,
    realDate: String,
});

const Item = mongoose.model('Item', itemsSchema);

const userSchema =  new mongoose.Schema({
    name: {type: String, required: true,unique: true},
    password: {type: String, required: true},
    roles:{
        User:Number,
        Admin:Number
    },
    listItems: [itemsSchema]
});

const User = mongoose.model('User', userSchema);

String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};



app.get("/mainPage",validateToken,function(req,res){
        mainUsername = req.mainUsername;
        role = req.roles;
        if(role[0]===null){
            role = role[1];
        }
        else{
            role = role[0];
        }
        if(role===5150){
            role = "Admin"
        }
        else{
            role = "User"
        }
        today = new Date();
        dd = String(today.getDate()).padStart(2, '0');
        mm = String(today.getMonth() + 1).padStart(2, '0');
        yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;
        yesterday = new Date(new Date().getTime() - 24*60*60*1000);
        dd = String(yesterday.getDate()).padStart(2, '0');
        mm = String(yesterday.getMonth() + 1).padStart(2, '0'); 
        yyyy = yesterday.getFullYear();
        yesterday = yyyy + '-' + mm + '-' + dd;
        tommorow =  new Date(new Date().getTime() + 24*60*60*1000);
        dd = String(tommorow.getDate()).padStart(2, '0');
        mm = String(tommorow.getMonth() + 1).padStart(2, '0'); 
        yyyy = tommorow.getFullYear();
        tommorow = yyyy + '-' + mm + '-' + dd;
        User.find({name:mainUsername},function(err,foundUser){
            var items = foundUser[0].listItems;
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
                if(item.realDate===today){
                    User.updateOne({name:mainUsername,"listItems._id":(item._id)},{$set:{'listItems.$.date': "Today" }},{},function(err){
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Successfully updated to database");
                        }
                    });
                }
                else if(item.realDate===tommorow){
                    User.updateOne({name:mainUsername,"listItems._id":(item._id)},{$set:{'listItems.$.date': "Tomorrow" }},{},function(err){
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Successfully updated to database");
                        }
                    });
                }
                else if(item.realDate===yesterday){
                    User.updateOne({name:mainUsername,"listItems._id":(item._id)},{$set:{'listItems.$.date': "Yesterday" }},{},function(err){
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Successfully updated to database");
                        }
                    });
                }
                else{

                }
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
            res.render("home",{role:role,mainUsername:mainUsername,status:"",previous:"/",clicked:"MainPage",items:items, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
        });
});

app.get("/",function(req,res){
    res.render("landing");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/items/:itemTitle",validateToken,function(req,res){
    mainUsername = req.mainUsername;
    role = req.roles;
    if(role[0]===null){
        role = role[1];
    }
    else{
        role = role[0];
    }
    if(role===5150){
        role = "Admin"
    }
    else{
        role = "User"
    }
    const itemTag = _.capitalize(req.params.itemTitle);
    User.find({name:mainUsername},function(err,foundUser){
        var items = foundUser[0].listItems;
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
    });
    if(itemTag==="Home" || itemTag==="Office" || itemTag==="Personal"){
        User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.tag",[itemTag]]}}}}}]).exec(function(err,items){
            if(err){
                console.log(err);
            }
            else{
                res.render("home",{role:role,mainUsername:mainUsername,status:"",previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
            }
        });
    }
    else{
        if(itemTag==="Archieve"){
            User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.checked",[true]]}}}}}]).exec(function(err,items){
                count_archive=items[0].listItems.length;
                if(err){
                    console.log(err);
                }
                else{
                    res.render("home",{role:role,mainUsername:mainUsername,status:"",previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                }
            });
        }
        else if(itemTag==="All"){
            User.find({name:mainUsername},function(err,items){
                res.render("home",{role:role,mainUsername:mainUsername,status:"",previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
            });
        }
        else{
            User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.date",[itemTag]]}}}}}]).exec(function(err,items){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("home",{role:role,mainUsername:mainUsername,status:"",previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                }
            });
        }
    }
});


app.post("/register",function(req,res){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            name: req.body.username,
            password: hash,
            roles:{
                User: 2001
            },
            listItems: []
        });
        newUser.save(function(err){
            if(err){
                if(err.code === 11000){
                    res.send("Duplicate User");
                }
                res.send(err);
            }
            else{
                res.redirect("/login");
            }
        });
    });
});

app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    const itemTag = _.capitalize(req.params.itemTitle);
    const status = req.body.btnradio;
    const accessToken = req.cookies["access-token"];  
    const validToken = jwt.verify(accessToken, JWP_SECRET);
    mainUsername = validToken.name;
    role = validToken.roles;
    if(role[0]===null){
        role = role[1];
    }
    else{
        role = role[0];
    }
    if(role===5150){
        role = "Admin"
    }
    else{
        role = "User"
    }

    User.findOne({name: username},function(err,foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if(result === true){
                        const accessToken = createTokens(foundUser);
                        res.cookie("access-token", accessToken, {
                            maxAge: 60 * 60 * 24 * 30 * 1000,
                            httpOnly: true,
                        });
                        if(role==="Admin"){
                            res.redirect("/admin");
                        }
                        else{
                            res.redirect("/mainPage");
                        }
                    }
                    else{
                        res.send("Incorrect password");
                    }
                });            
            }
        }
    });
})


app.post("/items/:itemTitle",function(req,res){
    const itemTag = _.capitalize(req.params.itemTitle);
    const status = req.body.btnradio;
    const accessToken = req.cookies["access-token"];  
    const validToken = jwt.verify(accessToken, JWP_SECRET);
    mainUsername = validToken.name;
    role = validToken.roles;
    if(role[0]===null){
        role = role[1];
    }
    else{
        role = role[0];
    }
    if(role===5150){
        role = "Admin"
    }
    else{
        role = "User"
    }
    if(status==="completed"){
        if(itemTag==="Home" || itemTag==="Office" || itemTag==="Personal"){
            User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.tag",[itemTag]]}}}}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.checked",[true]]}}}}}]).exec(function(err,items){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("home",{role:role,mainUsername:mainUsername,status:status,previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                }
            });
        }
        else{
            if(itemTag==="All"){
                User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.checked",[true]]}}}}}]).exec(function(err,items){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render("home",{role:role,mainUsername:mainUsername,status:status,previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                    }
                });
            }
            else{
                User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.date",[itemTag]]}}}}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.checked",[true]]}}}}}]).exec(function(err,items){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render("home",{role:role,mainUsername:mainUsername,status:status,previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                    }
                });
            }
        }
    }
    else if(status==="todo"){ 
        if(itemTag==="Home" || itemTag==="Office" || itemTag==="Personal"){
            User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.tag",[itemTag]]}}}}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.checked",[false]]}}}}}]).exec(function(err,items){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("home",{role:role,mainUsername:mainUsername,status:status,previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                }
            });
        }
        else{
            if(itemTag==="All"){
                User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.checked",[false]]}}}}}]).exec(function(err,items){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render("home",{role:role,mainUsername:mainUsername,status:status,previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                    }
                });
            }
            else{
                User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.date",[itemTag]]}}}}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.checked",[false]]}}}}}]).exec(function(err,items){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render("home",{role:role,mainUsername:mainUsername,status:status,previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                    }
                });
            }
        }
    }
    else{
        if(itemTag==="Home" || itemTag==="Office" || itemTag==="Personal"){
            User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.tag",[itemTag]]}}}}}]).exec(function(err,items){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("home",{role:role,mainUsername:mainUsername,status:status,previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                }
            });
        }
        else{
            if(itemTag==="All"){
                User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{}}}}}]).exec(function(err,items){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render("home",{role:role,mainUsername:mainUsername,status:status,previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                    }
                });
            }
            else{
                User.aggregate([{$match:{name:mainUsername}},{$project:{listItems:{$filter:{input:"$listItems",as:"items",cond:{$in:["$$items.date",[itemTag]]}}}}}]).exec(function(err,items){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render("home",{role:role,mainUsername:mainUsername,status:status,previous:req.params.itemTitle,clicked:itemTag,items:items[0].listItems, count_all:count_all, count_home:count_home, count_office:count_office, count_personal:count_personal, count_today:count_today, count_tomorrow:count_tomorrow, count_archive:count_archive, count_yesterday:count_yesterday});
                    }
                });
            }
        }
    }
});

app.post("/delete", function (req, res) {
    var item_id = req.body.deleteItem;
    User.findOneAndUpdate({name:mainUsername},{ $pull: { listItems: { _id: item_id } } },function(err,foundList){
        if(err){
            res.send(err);
        }
        else{
            res.redirect('back');
        }
    });
});


app.post("/update", function (req, res) {
    const accessToken = req.cookies["access-token"];  
    const validToken = jwt.verify(accessToken, JWP_SECRET);
    mainUsername = validToken.name;
    role = validToken.roles;
    if(role[0]===null){
        role = role[1];
    }
    else{
        role = role[0];
    }
    if(role===5150){
        role = "Admin"
    }
    else{
        role = "User"
    }
    var item_id = req.body.checkInput;
    if(Array.isArray(item_id)){
        count_archive++;
        item_id = item_id[0];
    }
    else{
        count_archive--;
    }
    User.find({name:mainUsername},{listItems:{$elemMatch:{_id:item_id.toObjectId()}}},function(err,toUpdate){
        if(err){
            console.log(err);
        }
        else{
            User.updateOne({name:mainUsername,"listItems._id":item_id.toObjectId()},{$set:{'listItems.$.checked': !toUpdate[0].listItems[0].checked }},{},function(err,found){
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully updated to database");
                }
            });
            res.redirect('back');
        }
    });
});

app.post("/mainPage",function(req,res){
    mainUsername = req.mainUsername;
    const accessToken = req.cookies["access-token"];  
    const validToken = jwt.verify(accessToken, JWP_SECRET);
    mainUsername = validToken.name;
    role = validToken.roles;
    if(role[0]===null){
        role = role[1];
    }
    else{
        role = role[0];
    }
    if(role===5150){
        role = "Admin"
    }
    else{
        role = "User"
    }
    today = new Date();
    dd = String(today.getDate()).padStart(2, '0');
    mm = String(today.getMonth() + 1).padStart(2, '0');
    yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    yesterday = new Date(new Date().getTime() - 24*60*60*1000);
    dd = String(yesterday.getDate()).padStart(2, '0');
    mm = String(yesterday.getMonth() + 1).padStart(2, '0'); 
    yyyy = yesterday.getFullYear();
    yesterday = yyyy + '-' + mm + '-' + dd;
    tommorow =  new Date(new Date().getTime() + 24*60*60*1000);
    dd = String(tommorow.getDate()).padStart(2, '0');
    mm = String(tommorow.getMonth() + 1).padStart(2, '0'); 
    yyyy = tommorow.getFullYear();
    tommorow = yyyy + '-' + mm + '-' + dd;
    var date;
    if(req.body.date===today){
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
        User.findOne({name:mainUsername},function(err,foundUser){
            const add = new Item({ 
                content: req.body.content,
                date: date,
                tag: "Home",
                checked: false,
                realDate:req.body.date
            });
            foundUser.listItems.push(add);
            foundUser.save(function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully added to database");
                    res.redirect("back");
                }
            });
        });
    }
    if(req.body.personal){
        User.findOne({name:mainUsername},function(err,foundUser){
            const add = new Item({ 
                content: req.body.content,
                date: date,
                tag: "Personal",
                checked: false,
                realDate:req.body.date
            });
            foundUser.listItems.push(add);
            foundUser.save(function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully added to database");
                    res.redirect("back");
                }
            });
        });
    }
    if(req.body.office){
        User.findOne({name:mainUsername},function(err,foundUser){
            const add = new Item({ 
                content: req.body.content,
                date: date,
                tag: "Office",
                checked: false,
                realDate:req.body.date
            });
            foundUser.listItems.push(add);
            foundUser.save(function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully added to database");
                    res.redirect("back");
                }
            });
        });
    }
});


// For Admin 

app.get("/admin",validateToken,verifyRoles(ROLES_LIST.Admin),function(req,res){
    mainUsername = req.mainUsername;
    role = req.roles;
    if(role[0]===null){
        role = role[1];
    }
    else{
        role = role[0];
    }
    if(role===5150){
        role = "Admin"
    }
    else{
        role = "User"
    }
    var tempList = [];
    User.find({},function(err,users){
        users.map((user)=>{
            if(user.roles.User){
                User.find({name:user.name},function(err,foundUser){
                    var tempObj = {
                        name : user.name,
                        items: foundUser[0].listItems
                    };
                    tempList.push(tempObj);
                });
            }
        });
        setTimeout(()=>{
            res.render("admin",{mainUsername:mainUsername,role:role,clicked:"No",items:tempList});
        },1000);
    });
});

app.get("/admin/report",validateToken,verifyRoles(ROLES_LIST.Admin),function(req,res){
    mainUsername = req.mainUsername;
    role = req.roles;
    if(role[0]===null){
        role = role[1];
    }
    else{
        role = role[0];
    }
    if(role===5150){
        role = "Admin"
    }
    else{
        role = "User"
    }
    today = new Date();
    dd = String(today.getDate()).padStart(2, '0');
    mm = String(today.getMonth() + 1).padStart(2, '0');
    yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    var count_last7 = 0;
    var count_last7_before = 0;
    var count_average;
    var date = new Date();
    var d1 = new Date(today);
    var d3 = new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000));
    var d4 = new Date(date.getTime() - (14 * 24 * 60 * 60 * 1000));
    User.find({},function(err,foundUsers){
        foundUsers.map((user)=>{
            User.find({name:user.name},function(err,foundUser){
                foundUser[0].listItems.map((item)=>{
                    var d2 = new Date(item.realDate);
                    if(d2<=d1 && d2>=d3){
                        count_last7++;
                    }
                    if(d2<=d3 && d2>=d4){
                        count_last7_before++;
                    }
                });
            });
        });
    });
    setTimeout(()=>{
        count_average = count_last7/7;
        res.render("report",{count_average:count_average,count_last7:count_last7,count_last7_before:count_last7_before,currentDay:today,mainUsername:mainUsername,role:role,clicked:"Yes"});
    },1000)
});

// Listening on Port 3000

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function() {
    console.log('Server started on port '+ port);
});