import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipeName: { type: Type.STRING, description: "The name of the recipe." },
        description: { type: Type.STRING, description: "A short, enticing description of the dish." },
        prepTime: { type: Type.STRING, description: "Preparation time, e.g., '15 minutes'." },
        cookTime: { type: Type.STRING, description: "Cooking time, e.g., '25 minutes'." },
        servings: { type: Type.STRING, description: "Number of servings, e.g., '4 people'." },
        ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of ingredients with quantities."
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Step-by-step cooking instructions."
        },
        error: { type: Type.STRING, description: "If a recipe cannot be generated, provide a reason here (e.g., 'Insufficient ingredients')." }
    },
    required: ["recipeName", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions"]
};


export const generateRecipe = async (
    ingredients: string,
    dietaryOptions: string[],
    language: string
): Promise<Recipe | null> => {
    try {
        const prompt = `Generate a single, creative recipe based on the following available ingredients: ${ingredients}. 
The recipe must adhere to these dietary guidelines: ${dietaryOptions.length > 0 ? dietaryOptions.join(', ') : 'None'}. 
The output language for the recipe should be ${language}. 
If no reasonable recipe can be made, be creative and suggest a very simple preparation or use the 'error' field to state what is missing.
Your response must be in JSON format conforming to the provided schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });

        const text = response.text.trim();
        if (text) {
             try {
                const parsedJson = JSON.parse(text);
                return parsedJson as Recipe;
            } catch (e) {
                console.error("Failed to parse JSON response:", text);
                return { 
                    error: "The AI returned an invalid recipe format. Please try again.",
                    recipeName: "", description: "", prepTime: "", cookTime: "", servings: "", ingredients: [], instructions: [] 
                };
            }
        }
        return null;

    } catch (error) {
        console.error("Error generating recipe:", error);
        throw new Error("Failed to generate recipe. Please check your API key and try again.");
    }
};
