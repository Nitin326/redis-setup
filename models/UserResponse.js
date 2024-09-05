const mongoose = require('mongoose');

const userResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: Number, required: true },
  selectedOption: { type: String, required: true }
});

const UserResponse = mongoose.model('UserResponse', userResponseSchema);

module.exports = UserResponse;
