
var express = require("express")
var app = express()
var Users = require("./schema/user");
var Problem = require("./schema/problem");
const { Payload } =require("dialogflow-fulfillment");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var dff = require('dialogflow-fulfillment')
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/mydb", { useUnifiedTopology: true, useNewUrlParser: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(res,req)=>{
   res.sendFile(__dirname + "/test.html");
});


//Request Handler
app.post("/botservice", (req, res) => {


   async function UserIdentification(agent) {
      var user=await Users.find({phnno: agent.parameters.phnno});
      
      if(user.length==0){
         agent.add("Enter the mobile number registered with us")
      }else{
         console.log("Retrieved User:"+ user[0].uname);
         agent.context.set({
            'name': 'username',
            'lifespan': 50,
            'parameters': {
               'uname': user[0].uname
            }
         });
        
         agent.add("Hello " + user[0].uname+ " !!\nIs there any problem to be reported?");
   
      }
     

   }

   function send_choice(agent)
{
	var payLoadData=
		{
  "richContent": [
    [
      {
        "type": "list",
        "title": "Internet Down",
        "subtitle": "Press '1' for Internet is down",
        "event": {
          "name": "",
          "languageCode": "",
          "parameters": {}
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "list",
        "title": "Slow Internet",
        "subtitle": "Press '2' Slow Internet",
        "event": {
          "name": "",
          "languageCode": "",
          "parameters": {}
        }
      },
	  {
        "type": "divider"
      },
	  {
        "type": "list",
        "title": "Buffering problem",
        "subtitle": "Press '3' for Buffering problem",
        "event": {
          "name": "",
          "languageCode": "",
          "parameters": {}
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "list",
        "title": "No connectivity",
        "subtitle": "Press '4' for No connectivity",
        "event": {
          "name": "",
          "languageCode": "",
          "parameters": {}
        }
      }
    ]
  ]
}
agent.add(new Payload(agent.UNSPECIFIED,payLoadData,{sendAsMessage:true, rawPayload:true }));
}


   async function record_problem(agent) {

      var issue_vals={1:"Internet Down",2:"Slow Internet",3:"Buffering problem",4:"No connectivity"};
  
      const intent_val=agent.parameters.Issuetype;
      
      var val=issue_vals[intent_val];
      console.log(val+"  "+intent_val);

      var myData = new Problem();
      myData.id = Math.floor((Math.random() * 10000000) + 1);
      myData.uid = agent.getContext("phnno").parameters.phnno;
      myData.date = new Date();
      myData.problem = val;
      myData.status = "Pending";   
      

      myData.save()
         .then(item => {
            console.log("Problem Recorded ");
         })
         .catch(err => {
            res.status(400).send("unable to save to database " + err);
         });
      console.log("Number: "+myData.uid);
     
            s=agent.getContext("username").parameters.uname;
            agent.add("Hey " + s + "! Sorry for your inconvenience, we got your problem  \""+myData.problem+"\" \n We are working on it. Use this code to check the status: " + myData.id);

         

     
   }


   const agent = new dff.WebhookClient({
      request: req,
      response: res
   });

   var intentMap = new Map();
   
   intentMap.set('Getting-number',UserIdentification);
   intentMap.set('Trouble-yes', send_choice);
   intentMap.set('Issue-type', record_problem);  

   agent.handleRequest(intentMap);

});

//To insert user data
app.post("/insert", (req, res) => {
   var myData = new Users(req.body);
   myData.save()
      .then(item => {
         console.log("User added !! " + req.body.phnno);

      })
      .catch(err => {
         res.status(400).send("unable to save to database " + err);
      });

});

//Port Listening
app.listen(8080)
