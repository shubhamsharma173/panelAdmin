const mongoose = require("mongoose");

const apiSchema = new mongoose.Schema({
    id: { type: String, unique: [true, 'Duplicate Entry!'] },
    fname: { type: String },
    lname: { type: String },
    company: { type: String },
    designation: { type: String },
    department: { type: String },
    phone: { type: String },
    work_phone: { type: String },
    in: { type: String },
    employee_size: { type: String },
    years_of_experience: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    email: { type: String },
    ticket: { type: String },
    access_groups: { type: String },
    status: { type: String },
    time : { type : Date, default: Date.now }  
  }, {
    writeConcern: {
      w: 'majority',
      j: true,
      wtimeout: 1000
    }
  });

  const Api = mongoose.model("Api", apiSchema, "Api");
  
  module.exports = Api;