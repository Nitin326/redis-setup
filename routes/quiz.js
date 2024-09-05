const express = require('express');
const { getQuestions, submitAnswers, getQuizStatus } = require('../controllers/quizController');
const auth = require('../middlewares/auth'); // Ensure users are authenticated

const router = express.Router();

// Route to get the predefined questionsx`
router.get('/questions', auth, getQuestions);

// Route to submit user answers
router.post('/submit', auth, submitAnswers);

// Route to stats user questions and answers
router.get('/status', auth, getQuizStatus);

module.exports = router;
  