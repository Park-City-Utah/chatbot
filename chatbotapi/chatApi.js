const { Configuration, OpenAIApi } = require("openai");
require('colors')
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize prompt, updatable
let initialPrompt = 'You are an interviewer in a technical interview for Javascript, you will ask three questions and allow the user to answer. Once they answer, you will encourage them and let them know if they were right or wrong, and provide the solution. You will keep track of the score, but you will only share it after the last question has been answered. After all three questions have been answered, you will share the score, thank them for their time, end the interview. You will not ask any questions that require coding.';

// Initialize conversation history
let conversationHistory = [
  { role: 'system', content: initialPrompt }
];

/**
 * Generate a response from the chatbot.
 * @param {string} userInput - The user's input to be sent to the chatbot.
 * @returns {Promise<string>} The chatbot's response to the user's input.
 */
const generateResponse = async (userInput) => {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    const openai = new OpenAIApi(configuration);

    const messages = conversationHistory.concat({ role: 'user', content: userInput });

    if (userInput.toLowerCase() === 'change prompt') {
      // Reset the conversation history and the model configuration
      initialPrompt = userInput;
      conversationHistory = [
        { role: 'system', content: initialPrompt }
      ];
      return "Prompt has been changed. You can start a new conversation.";
    } else {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });

      // Update conversation history with the response
      const responseContent = completion.data.choices[0].message['content'];
      conversationHistory.push({ role: 'user', content: userInput });
      conversationHistory.push({ role: 'assistant', content: responseContent });

      return responseContent;
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
    return "Sorry, there was an error processing your request.";
  }
};

/**
 * Main function to run the interactive chatbot.
 * This function initializes the conversation and listens for user input.
 * The chatbot responds to the user until the user types "exit" to end the chat.
 */
const main = async () => {
  rl.setPrompt("You: ");
  rl.prompt();

  rl.on('line', async function (userInput) {
    if (userInput.toLowerCase() === 'exit') {
      console.log("ChatBot: Goodbye! Have a great day!");
      rl.close();
    } else {
      // Add your logic to process userInput and generate a response
      let response = await generateResponse(userInput);
      console.log(`
ChatBot: ${response}
      `.yellow);
      rl.prompt();
    }
  }).on('close', function () {
    process.exit(0);
  });
}

main();
