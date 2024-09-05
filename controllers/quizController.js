const questions = require("../data/questions.json"); // Assuming your JSON file is in the data folder
const UserResponse = require("../models/UserResponse");
const client = require("../config/redis");

// Fetch predefined questions
exports.getQuestions = (req, res) => {
  try {
    res.json(questions);
  } catch (error) {
    res.status(500).json({message: "Server error", error});
  }
};

// Submit user answers
exports.submitAnswers = async (req, res) => {
  const {questionId, selectedOption} = req.body; // Expecting { questionId, selectedOption } in the request body
  const userId = req.user.id; // Assuming user ID is set by auth middleware

  let questionsAnswered = await UserResponse.find({userId});

  try {
    // Create a new user response document
    const response = new UserResponse({
      userId,
      questionId,
      selectedOption,
    });

    // Save the response to the database
    await response.save();

    // Fetch the existing quiz status from Redis
    const cachedStatus = await client.get(`quizStatus:${userId}`);

    let status;
    if (cachedStatus) {
      // Parse the cached status
      status = JSON.parse(cachedStatus);

      // Update the status with the new response
      status.answeredQuestionsCount += 1;
      status.remainingQuestionsCount -= 1;
      status.percentageCompleted = (
        (status.answeredQuestionsCount / status.totalQuestions) *
        100
      ).toFixed(2);
      status.answeredQuestions.push(response); // Add the new response to the array
    } else {
      // If no cache exists, initialize the status
      status = {
        totalQuestions: await questions.length,
        answeredQuestionsCount: questionsAnswered.length,
        remainingQuestionsCount: totalQuestions - answeredQuestionsCount,
        percentageCompleted: (answeredQuestionsCount / totalQuestions) * 100,
        answeredQuestions: questionsAnswered.push(response),
      };
    }

    // Save the updated status back into Redis with expiration time
    await client.setEx(`quizStatus:${userId}`, 180, JSON.stringify(status));

    res.json({message: "Answer submitted successfully", status});
  } catch (error) {
    res.status(500).json({message: "Server error", error});
  }
};

exports.getQuizStatus = async (req, res) => {
  const userId = req.user.id; // Assuming user ID is set by auth middleware

  try {
    // Check Redis cache for user's quiz status
    const cachedStatus = await client.get(`quizStatus:${userId}`);

    if (cachedStatus) {
      // If status is found in Redis, return the cached data
      return res.json(JSON.parse(cachedStatus));
    }

    // Fetch total number of questions
    const totalQuestions = await questions.length;

    // Fetch user's responses
    const userResponses = await UserResponse.find({userId});

    // Calculate answered, remaining, and percentage completed
    const answeredQuestionsCount = userResponses.length;
    const remainingQuestionsCount = totalQuestions - answeredQuestionsCount;
    const percentageCompleted = (answeredQuestionsCount / totalQuestions) * 100;

    // Construct the status object
    const status = {
      totalQuestions,
      answeredQuestionsCount,
      remainingQuestionsCount,
      percentageCompleted: percentageCompleted.toFixed(2), // Optional: rounding to 2 decimal places
      answeredQuestions: userResponses, // Include the user's responses
    };

    // Cache the status in Redis with an expiration time (e.g., 60 seconds)
    await client.setEx(`quizStatus:${userId}`, 180, JSON.stringify(status));

    // Return the status to the client
    res.json(status);
  } catch (error) {
    res.status(500).json({message: "Server error", error});
  }
};
