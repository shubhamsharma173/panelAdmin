const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require('request');
const PORT = process.env.PORT || 5000;
const firebase = require('firebase');
const _ = require('lodash');
require('dotenv').config()
const mongoose = require("mongoose");


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const url = process.env.URL;

//Database connection to atlas using mongoose...
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{console.log("Mongo connected");})
.catch((error)=>{console.log(error)})
mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);

const Api = require("./models/api");

firebase.initializeApp({
    apiKey: "AIzaSyDmn-3kRZyHuACUs74Pw06j3ilotG77QiM",
    authDomain: "registerapi-ec8bc.firebaseapp.com",
    databaseURL: "https://registerapi-ec8bc.firebaseio.com",
    projectId: "registerapi-ec8bc",
    storageBucket: "registerapi-ec8bc.appspot.com",
    messagingSenderId: "198057974974",
    appId: "1:198057974974:web:e2c021a949d902b9a692ef",
    measurementId: "G-MDQ53PSCFQ"
});

let counter = 0, allReg = 0, dispData = [], regData = [];
function updateCount(cntr) {
    firebase.database().ref('counter').set({
        allRegis: cntr
    });
}


async function MeraEventData() {
    counter += 1;
    let options = {
        'method': 'POST',
        'url': 'https://www.meraevents.com/us/resource/getEventAttendees?access_token=0395ea2df3cdfd8f6e8bc7ef66c5aa6d182135a4&eventId=236902',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'countryId=264; ipCountry=India; ipCity=Coimbatore; ipRegion=Tamil+Nadu; userip=106.207.206.80; ipCountry=India; ipCity=Coimbatore; ipRegion=Tamil+Nadu; userip=106.207.206.80; countryId=264; PHPSESSID=dv5v60j1dm005epf4qsju86644; ci_session=a%3A5%3A%7Bs%3A10%3A%22session_id%22%3Bs%3A32%3A%22000369eee67e99a562e9259bf72cb286%22%3Bs%3A10%3A%22ip_address%22%3Bs%3A12%3A%22172.31.32.48%22%3Bs%3A10%3A%22user_agent%22%3Bs%3A21%3A%22PostmanRuntime%2F7.26.5%22%3Bs%3A13%3A%22last_activity%22%3Bi%3A1603101169%3Bs%3A9%3A%22user_data%22%3Bs%3A0%3A%22%22%3B%7D3737fd1b17185a3b0ed3b2b0243821b719ee3148'
        },
        form: {
            'eventId': '236902'
        }
    };
    request(options, function (error, response) {
        if (error) {
            console.log(error)
        } else {
            const data = JSON.parse(response.body);
            // console.log(data);
            regData = [];
            for (let i = 0; i < data.length - allReg; i++) {
              const substring3 = "Non-Member";
              let access_groups = [];
              const ticketStrip = data[i].ticket_name;
              const token = ticketStrip.indexOf(substring3);
              const ticketStrip2 = data[i].ticket_name.replace(/\s+/g, "");
              if (ticketStrip2 === "CXO") {
                access_groups.push("CXO");
              } else if (ticketStrip2 === "Speaker") {
                access_groups.push("Speaker");
              } else {
                if (token !== -1) {
                  access_groups.push("nonMember");
                } else {
                  access_groups.push("member");
                }
                // console.log("ticket Strip: ",ticketStrip);
                // let days = ticketStrip.match(/\d+/g);
                // console.log("days: ",days);
                const regExp = /\(([^)]+)\)/;
                const type = regExp.exec(ticketStrip);
                const str = type[1];
                // console.log(str);
                const days = str.split(" ");
                if (
                  days[0] === "Three" ||
                  days[0] === "Two" ||
                  days[0] === "One"
                ) {
                  // Talent Acquisition,Talent Management,Talent Wellbeing,Talent Development
                  // console.log("Three: ",data[i].customfields[26].value);
                  const conclaves = data[i].customfields[26].value.split(",");
                  if (conclaves.includes("Talent Acquisition")) {
                    access_groups.push("TalentAcquisition");
                  }
                  if (conclaves.includes("Talent Management")) {
                    access_groups.push("TalentManagement");
                  }
                  if (conclaves.includes("Talent Wellbeing")) {
                    access_groups.push("TalentWellbeing");
                  }
                  if (conclaves.includes("Talent Development")) {
                    access_groups.push("TalentDevelopment");
                  }
                } else {
                  if (days[0] === "All") {
                    access_groups.push(
                      "TalentAcquisition",
                      "TalentManagement",
                      "TalentWellbeing",
                      "TalentDevelopment"
                    );
                  }
                  // console.log("All: ",data[i].customfields[26].value);
                }
              }
              let lower = _.toLower(data[i].customfields[15].value);
              let countryy = _.startCase(lower);
              let fres = "";
              let lres = "";
              let fullName = data[i].UserName.trim();
              // console.log("fullName: ",fullName);
              let res = fullName.split(" ");
              if (res.length === 1) {
                fres = res[0];
                lres = "";
              } else {
                // console.log(res);
                lres = res[res.length - 1];
                res.pop();
                // console.log(res);
                fres = res.join(" ");
                // console.log("fname: ",fres);
                // console.log("lname: ",lres);
              }
              let ag = access_groups.join();
              let attendee = new Api({
                id: data[i].attendeeId,
                fname: fres,
                lname: lres,
                email: data[i].Email,
                ticket: data[i].ticket_name,
                access_groups: ag,
                company: data[i].customfields[2].value,
                designation: data[i].customfields[3].value,
                phone: data[i].customfields[5].value,
                work_phone: data[i].customfields[6].value,
                in: data[i].customfields[7].value,
                department: data[i].customfields[8].value,
                employee_size: data[i].customfields[9].value,
                years_of_experience: data[i].customfields[10].value,
                address: data[i].customfields[11].value,
                city: data[i].customfields[13].value,
                pin_code: data[i].customfields[17].value,
                country: countryy,
              });
              try {
                Api.findOne({ id: attendee.id }, (err, doc) => {
                  if (doc !== null) {
                  } else {
                    attendee.save();
                  }
                });
              } catch (error) {
                console.log(error);
              }
              regData.push(attendee);
            }

            // console.log("regData: ", regData);
            allReg += regData.length;
            updateCount(allReg);
            try {
                if (regData.length > 0) {
                    // console.log(regData);
                    regData.forEach((r) => {
                        // registerApi(r);
                    })
                }
            } catch (error) {
                console.log(error);
            }
        }
    })
}
async function registerApi(att) {
    try {
        // console.log("reg");
        let request = require('request');
        let options = {
            'method': 'POST',
            'url': 'https://www.engagez.net/remote/regform/803017?source=hUJwvaJbN&password=shrmit2356&first_name=' + att.fname + '&last_name=' + att.lname + '&company=' + att.company + '&designation=' + att.designation + '&department=' + att.department + '&phone=' + att.phone + '&work_phone=' + att.work_phone + '&in=' + att.in + '&employee_size=' + att.employee_size + '&years_of_experience=' + att.years_of_experience + '&address=' + att.address + '&city=' + att.city + '&country=' + att.country + '&pin_code=' + att.pin_code + '&email=' + att.email + '&role=0&access_groups=' + att.access_groups,
            'headers': {
                'Cookie': '__cfduid=d130d0b37c46807b7d090b4f4306fa0bb1599372126; SESSddd6530e3c99d048a97beb1370a6a33e=nuunj7c5larbf9gv0mc5vkl4mt'
            }
        };
        request(options, function (error, response) {
            if (error) {
                let attend = {
                    id: att.id,
                    fname: att.fname,
                    lname: att.lname,
                    company: att.company,
                    designation: att.designation,
                    department: att.department,
                    phone: att.phone,
                    work_phone: att.work_phone,
                    in: att.in,
                    employee_size: att.employee_size,
                    years_of_experience: att.years_of_experience,
                    address: att.address,
                    city: att.city,
                    state: att.state,
                    country: att.country,
                    email: att.email,
                    ticket: att.ticket,
                    access_groups: att.access_groups,
                    status: error
                }
                dispData.push(attend);
                let epc=error;
                console.log(error);
                Api.findOneAndUpdate({id:att.id},{status:epc}, { new: true },(err,doc)=>{
                    if(err){console.log(err);}
                });
            } else {
                let attend = {
                    id: att.id,
                    fname: att.fname,
                    lname: att.lname,
                    company: att.company,
                    designation: att.designation,
                    department: att.department,
                    phone: att.phone,
                    work_phone: att.work_phone,
                    in: att.in,
                    employee_size: att.employee_size,
                    years_of_experience: att.years_of_experience,
                    address: att.address,
                    city: att.city,
                    state: att.state,
                    country: att.country,
                    email: att.email,
                    ticket: att.ticket,
                    access_groups: att.access_groups,
                    status: "success"
                }
                Api.findOneAndUpdate({id:att.id},{status:"SUCCESS"}, { new: true },(err,doc)=>{
                    if(err){console.log(err);}
                });
                dispData.push(attend);
                // console.log();
            }
        })
    } catch (error) {
        let attend = {
            id: att.id,
            fname: att.fname,
            lname: att.lname,
            company: att.company,
            designation: att.designation,
            department: att.department,
            phone: att.phone,
            work_phone: att.work_phone,
            in: att.in,
            employee_size: att.employee_size,
            years_of_experience: att.years_of_experience,
            address: att.address,
            city: att.city,
            state: att.state,
            country: att.country,
            email: att.email,
            ticket: att.ticket,
            access_groups: att.access_groups,
            status: error
        }
        let epc=error;
        Api.findOneAndUpdate({id:att.id},{status:epc}, { new: true },(err,doc)=>{
            if(err){console.log(err);}
        });
        dispData.push(attend);
        console.log(error);
    }
}

setInterval(function () {
    firebase.database().ref('/counter').once('value').then(function (snapshot) {
        let sn = snapshot.toJSON();
        // console.log(sn);
        allReg = sn.allRegis;
        console.log(allReg);
    }).then(() => {
        MeraEventData();
    });

}, 10000)

app.get("/", function (req, res) {
    res.render("lock-screen");
})
app.post("/login", function (req, res) {
    let password = req.body.pass,
        email = req.body.email;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            res.redirect("/admin");
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                res.send('Wrong password.');
            } else {
                res.send(errorMessage);
            }
            // res.send(error);
        });
})

app.get("/admin", function (req, res) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log(dispData);
            console.log(counter);
            console.log(allReg);
            res.render("panel", { data: dispData, cnt: counter, rejo: allReg });
        } else {
            res.redirect("/");
        }
    })
})

app.get("/admin-panel",(req,res) => {
    Api.find({},(err,docs)=>{
        res.render("adminPanel",{list: docs});
    })
})

app.get("/reg/:attid",(req,res)=>{
    // console.log(req.params.attid);
    Api.findOne({id:req.params.attid},(err,doc)=>{
        if(err){
            console.log(err);
        }else{
            if(doc!==null){
                // console.log(doc);
                registerApi(doc);
                setTimeout(()=>{res.redirect("/admin-panel")},3000);
                
            }else{
                res.send("Not Found!")
            }
        }
    })
})

app.listen(PORT, () => {
    console.log('app stared at ', PORT)
});