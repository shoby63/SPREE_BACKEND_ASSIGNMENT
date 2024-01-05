const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const user =require('./user');
const noteSchema = new Schema({
    id:{
        type:String,
        required:true,
        unique:true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      ref: 'User', // Reference to the User model
      required: true,
    },
    sharedWith: [
      {
        type:String,
        ref: 'User', // Reference to the User model
      },
    ],
    created_at: {
        type: Date,
        default: Date.now,
      },
      updated_at: {
        type: Date,
        default: Date.now,
      },
  });
  
  // Create the Note model
  noteSchema.index({ title: 'text', content: 'text' });
  const Notes = mongoose.model('Note', noteSchema);
  

  module.exports = Notes;