const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

const googleGenAi = async (desc) => {
  try {
    console.log("Calling Gemini with:", desc);

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: `
You are an expense categorization assistant.

Categorize the following expense into exactly one of these categories:

Food
Petrol
Shopping
Travel
Bills
Entertainment
Salary
Health
Education
Other

Expense description:
${desc}

Return only the category name.
      `,
    });

    console.log("Gemini response:", interaction.output_text);

    return interaction.output_text.trim();
  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
};

module.exports = { googleGenAi };
