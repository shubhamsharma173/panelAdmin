const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require('request');
const PORT = process.env.PORT || 5000;
const firebase = require('firebase');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

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
        'url': 'https://www.meraevents.com/us/resource/getEventAttendees?access_token=e794dfc2eb7d70da55fc12f281f819835137914b&eventId=236447',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'countryId=264; ipCountry=India; ipCity=Coimbatore; ipRegion=Tamil+Nadu; userip=106.207.206.80; ipCountry=India; ipCity=Coimbatore; ipRegion=Tamil+Nadu; userip=106.207.206.80; countryId=264; PHPSESSID=dv5v60j1dm005epf4qsju86644; ci_session=a%3A5%3A%7Bs%3A10%3A%22session_id%22%3Bs%3A32%3A%22000369eee67e99a562e9259bf72cb286%22%3Bs%3A10%3A%22ip_address%22%3Bs%3A12%3A%22172.31.32.48%22%3Bs%3A10%3A%22user_agent%22%3Bs%3A21%3A%22PostmanRuntime%2F7.26.5%22%3Bs%3A13%3A%22last_activity%22%3Bi%3A1603101169%3Bs%3A9%3A%22user_data%22%3Bs%3A0%3A%22%22%3B%7D3737fd1b17185a3b0ed3b2b0243821b719ee3148'
        },
        form: {
            'eventId': '236447'
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
                const substring1 = "With";
                const substring2 = "Masterclass";
                const substring3 = "Non-Member";
                let access_groups = []
                const ticketStrip = data[i].ticket_name.replace(/\s+/g, '')
                if (ticketStrip === "CXO") {
                    access_groups.push("CXO");
                } else if (ticketStrip === "Speaker") {
                    access_groups.push("speaker");
                } else {
                    const token = ticketStrip.indexOf(substring3);
                    if (token !== -1) {
                        access_groups.push("nonMember");
                    } else {
                        access_groups.push("member");
                    }
                    // console.log("ticket Strip: ",ticketStrip);
                    // let days = ticketStrip.match(/\d+/g);
                    // console.log("days: ",days);
                    let regExp = /\(([^)]+)\)/;
                    let type = regExp.exec(ticketStrip);
                    // console.log("type: ",type[1]);
                    const hasWith = type[1].indexOf(substring1)
                    // console.log("hasWith: ",hasWith);
                    const hasMc = type[1].indexOf(substring2)
                    // console.log("hasMc: ",hasMc);
                    if (hasWith !== -1) {
                        let splittedWith = type[1].split('With');
                        let dNum = splittedWith[0].match(/\d+/g); //days data
                        let mNum = splittedWith[1].match(/\d+/g); //MC data
                        // console.log("dNum: ",dNum);
                        // console.log("mNum: ",mNum);
                        // if only 1 day
                        if (dNum.includes("1") || dNum.includes("01")) {
                            //checking Which day
                            if (data[i].customfields[22].value === "23rd November") {
                                access_groups.push("1Day")
                            }
                            if (data[i].customfields[22].value === "24th November") {
                                access_groups.push("2Day")
                            }
                        }
                        // if two days
                        if (dNum.includes("2") || dNum.includes("02")) {
                            access_groups.push("1Day", "2Day") // adding both days
                        }
                        // if only 1 mc
                        if (mNum.includes("1") || mNum.includes("01")) {
                            // checking which mc
                            // console.log(data[i].customfields[18].value);
                            if (data[i].customfields[18].value === "23rd Day 1 Masterclass") {
                                access_groups.push("1MC")
                            }
                            if (data[i].customfields[18].value === "24th Day 2 Masterclass") {
                                access_groups.push("2MC")
                            }
                        }
                        // if both mc
                        if (mNum.includes("2") || mNum.includes("02")) {
                            access_groups.push("1MC", "2MC") //adding both mc
                        }
                    } else {
                        // either day or mc
                        if (hasMc !== -1) {
                            // has only mc
                            let mNum = type[1].match(/\d+/g);
                            // console.log("mNum only: ",mNum);
                            // if only 1 mc
                            if (mNum.includes("1") || mNum.includes("01")) {
                                // checking which mc
                                if (data[i].customfields[18].value === "23rd Day 1 Masterclass") {
                                    access_groups.push("1MC")
                                }
                                if (data[i].customfields[18].value === "24th Day 2 Masterclass") {
                                    access_groups.push("2MC")
                                }
                            }
                            // if both mc
                            if (mNum.includes("2") || mNum.includes("02")) {
                                access_groups.push("1MC", "2MC") //adding both mc
                            }
                        } else {
                            // has only days
                            let dNum = type[1].match(/\d+/g);
                            // console.log("dNum only: ",dNum); 
                            // if only 1 day
                            if (dNum.includes("1") || dNum.includes("01")) {
                                //checking Which day
                                if (data[i].customfields[22].value === "23rd November") {
                                    access_groups.push("1Day")
                                }
                                if (data[i].customfields[22].value === "24th November") {
                                    access_groups.push("2Day")
                                }
                            }
                            // if two days
                            if (dNum.includes("2") || dNum.includes("02")) {
                                access_groups.push("1Day", "2Day") // adding both days
                            }
                        }
                    }
                }
                let fres = '';
                let lres = '';
                let fullName = data[i].UserName.trim();
                // console.log("fullName: ",fullName);
                let res = fullName.split(" ");
                if (res.length === 1) {
                    fres = res[0];
                    lres = '';
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

                // console.log(data[i]);
                let attendee = {
                    id: data[i].attendeeId,
                    fname: fres,
                    lname: lres,
                    company: data[i].customfields[11].value,
                    designation: data[i].customfields[3].value,
                    phone: data[i].customfields[5].value,
                    industry: data[i].customfields[7].value,
                    employee_size: data[i].customfields[8].value,
                    years_of_experience: data[i].customfields[9].value,
                    address: data[i].customfields[10].value,
                    city: data[i].customfields[12].value,
                    state: data[i].customfields[14].value,
                    country: data[i].customfields[16].value,
                    email: data[i].Email,
                    ticket: data[i].ticket_name,
                    access_groups: ag,
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
                        registerApi(r);
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
            'url': 'https://www.engagez.net/remote/regform/305214?source=YRltI2URo&first_name=' + att.fname + '&last_name=' + att.lname + '&company=' + att.company + '&designation=' + att.designation + '&phone=' + att.phone + '&industry=' + att.industry + '&employee_size=' + att.employee_size + '&years_of_experience=' + att.years_of_experience + '&address=' + att.address + '&city=' + att.city + '&state=' + att.state + '&country=' + att.country + '&email=' + att.email + '&role=0&access_groups=' + att.access_groups,
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
                    phone: att.phone,
                    industry: att.industry,
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
                console.log(error);
            } else {
                let attend = {
                    id: att.id,
                    fname: att.fname,
                    lname: att.lname,
                    company: att.company,
                    designation: att.designation,
                    phone: att.phone,
                    industry: att.industry,
                    employee_size: att.employee_size,
                    years_of_experience: att.years_of_experience,
                    address: att.address,
                    city: att.city,
                    state: att.state,
                    country: att.country,
                    email: att.email,
                    ticket: att.ticket,
                    access_groups: att.access_groups,
                    status: response.body
                }
                dispData.push(attend);
                console.log(response.body);
            }
        })
    } catch (error) {
        let attend = {
            id: att.id,
            fname: att.fname,
            lname: att.lname,
            company: att.company,
            designation: att.designation,
            phone: att.phone,
            industry: att.industry,
            employee_size: att.employee_size,
            years_of_experience: att.years_of_experience,
            address: att.address,
            city: att.city,
            state: att.state,
            country: att.country,
            email: att.email,
            ticket: att.ticket,
            access_groups: att.access_groups,
            status: response.body.status
        }
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
            res.send(error);
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


app.listen(PORT, () => {
    console.log('app stared at ', PORT)
});