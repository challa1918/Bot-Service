
var express = require("express")
var app = express()
var Users = require("./schema/user");
var Problem = require("./schema/problem");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var dff = require('dialogflow-fulfillment')
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/mydb", { useUnifiedTopology: true, useNewUrlParser: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//Request Handler
app.post("/botservice", (req, res) => {

   var s = "none";


   async function demo(agent) {
      await Users.find({ phnno: req.body.queryResult.parameters.phone }, (err, results) => {
         if (err) {
            s = "Please enter a valid number";
            return console.log(err)
         }
         console.log(results[0].uname)
         s = results[0].uname

      });
      agent.context.set({
         'name': 'username',
         'lifespan': 50,
         'parameters': {
            'uname': s
         }
      });
      agent.add("Hello " + s + " !!\nIs there any problem to be reported?");


   }



   async function problem(agent) {
      console.log(req.body.queryResult.parameters.problem)

      var myData = new Problem();
      myData.id = Math.floor((Math.random() * 10000000) + 1);
      myData.problem = req.body.queryResult.parameters.problem;
      myData.status = "Pending";   
      myData.date = new Date();
      myData.uid = agent.getContext("phnno").parameters.phone;
      myData.save()
         .then(item => {
            console.log("Problem Recorded");
         })
         .catch(err => {
            res.status(400).send("unable to save to database " + err);
         });
      var s = "no";
      await Users.find({ phnno: agent.getContext("phnno").parameters.phone }, (err, results) => {
         if (err) return console.log(err)
         console.log(results[0].uname)
         s = results[0].uname;


      });

      agent.add("Hey " + s + "! Sorry for your inconvenience, we got your problem, we are working on it. Use this code to check the status: " + myData.id);

   }

   const agent = new dff.WebhookClient({
      request: req,
      response: res
   });

   var intentMap = new Map();
   intentMap.set('GetUser', demo)

   intentMap.set('GetUser - yes', problem);

   agent.handleRequest(intentMap);

});

//To insert user data
app.post("/insert", (req, res) => {
   var myData = new Users(req.body);
   myData.save()
      .then(item => {
         console.log("User added added!! " + req.body.phnno);

      })
      .catch(err => {
         res.status(400).send("unable to save to database " + err);
      });

});

//Port Listening
app.listen(8080)