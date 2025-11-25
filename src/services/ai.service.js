import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function generateContent(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: `
        you are a bug detector tool we just provide you code and in response you just tell us where the bug is.
        Make Sure to tell the bug in brief. 
        If there is just prompt insted of code then return "Enter Valid Code"
      `
    }
  });
  return response.text
};

export { generateContent };