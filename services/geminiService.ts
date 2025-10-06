
import { Person } from '../types';
// In a real application, you would import the GoogleGenAI client.
// import { GoogleGenAI } from "@google/genai";
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simulates calling the Gemini API to determine the best candidate for an appointment check.
 * In a real-world scenario, this function would send detailed information about each person
 * (e.g., visa type, urgency, location) and potentially current market conditions (e.g., which
 * centers are known to release appointments) to a Gemini model with a specific prompt.
 * The model would then return a prioritized list or the single best candidate.
 */
export const getPrioritizedPerson = async (people: Person[]): Promise<Person | null> => {
  console.log("AI Service: Analyzing candidates for prioritization...");

  // Simulate network latency for an API call
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
  
  const runningPeople = people.filter(p => p.status === 'RUNNING');
  if (runningPeople.length === 0) {
    return null;
  }

  // Mock AI Logic: Prioritize people with the earliest 'latestDate' as they are more urgent.
  // This simulates a simple heuristic that a more complex AI model could perform.
  let prioritized = [...runningPeople].sort((a, b) => {
    const dateA = a.latestDate ? new Date(a.latestDate).getTime() : Infinity;
    const dateB = b.latestDate ? new Date(b.latestDate).getTime() : Infinity;
    return dateA - dateB;
  });

  const bestCandidate = prioritized[0];
  console.log(`AI Service: Prioritized ${bestCandidate.fullName} due to urgency.`);

  // Example of a prompt that could be used with a real Gemini model:
  /*
  const prompt = `
    Given the following list of Schengen visa applicants, identify the single most critical person to check for an appointment right now.
    Consider these factors:
    1. Urgency: The 'latestDate' indicates their travel deadline. Earlier deadlines are more critical.
    2. Visa Type: Business and education visas might have higher priority.
    3. Location: Some centers (e.g., Istanbul) are more competitive than others.

    Applicants:
    ${JSON.stringify(runningPeople, null, 2)}

    Return a JSON object with the 'passportNo' of the most critical applicant.
    Example: { "passportNo": "U12345678" }
  `;
  
  // const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, ... });
  // const result = JSON.parse(response.text);
  // return runningPeople.find(p => p.passportNo === result.passportNo) || null;
  */

  return bestCandidate;
};
