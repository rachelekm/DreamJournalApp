'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const dreamSchema = mongoose.Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  submitDate: {
    type: String,
    required: true
  },
  keywords: [{
    type: String
  }],
  mood: [{
    type: String
  }],
  content: {
    type: String,
    required: true
  }
});

dreamSchema.methods.serialize = function() {
	return {submitDate: this.submitDate || '',
  keywords: this.keywords || '', 
  mood: this.mood || '',
  content: this.content || ''};
}

const dreamEntry = mongoose.model('dreamEntry', dreamSchema);

module.exports = {dreamEntry};