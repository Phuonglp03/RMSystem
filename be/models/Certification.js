const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date, 
    },
    proofImage: {
      type: String, 
      trim: true,
    },
    
  }
 
);

const Certification = mongoose.model('Certification', certificationSchema);

module.exports = Certification;