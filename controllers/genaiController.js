const genAi = require("@google/genai");
require("dotenv").config();

const ai = new genAi.GoogleGenAI({
     apiKey: process.env.API_KEY
});


const googleGenAi = async (desc) =>{
      const response = await ai.models.generateContent({
           model: "gemini-3.7-flash",
            contents: `
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
        `
    });

    return response.text.trim();

};


module.exports = {googleGenAi};