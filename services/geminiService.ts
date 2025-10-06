
import { Person, ApiSettings } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// --- Fallback Local Scoring Logic ---

const WEIGHTS = {
  URGENCY: 5,
  VISA_TYPE: 3,
  CITY_DEMAND: 2,
};

const VISA_TYPE_SCORES: Record<string, number> = {
  business: 10,
  education: 8,
  family: 5,
  tourism: 3,
  default: 1,
};

const CITY_DEMAND_SCORES: Record<string, number> = {
  Istanbul: 10,
  Ankara: 7,
  Izmir: 5,
  default: 3,
};

const calculatePriorityScore = (person: Person): number => {
  let urgencyScore = 0;
  if (person.latestDate) {
    const daysUntilDeadline = (new Date(person.latestDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    urgencyScore = Math.max(0, 10 - (daysUntilDeadline / 9));
  } else {
    urgencyScore = 1;
  }
  const visaTypeScore = VISA_TYPE_SCORES[person.visaType] || VISA_TYPE_SCORES.default;
  const cityScore = CITY_DEMAND_SCORES[person.city] || CITY_DEMAND_SCORES.default;
  const totalScore = 
    urgencyScore * WEIGHTS.URGENCY +
    visaTypeScore * WEIGHTS.VISA_TYPE +
    cityScore * WEIGHTS.CITY_DEMAND;
  return totalScore;
};

const getPrioritizedPersonLocally = (people: Person[]): Person | null => {
    console.log("AI Service: Falling back to local scoring mechanism.");
    if (people.length === 0) return null;

    const prioritized = [...people].sort((a, b) => {
        return calculatePriorityScore(b) - calculatePriorityScore(a);
    });
    
    const bestCandidate = prioritized[0];
    if(bestCandidate) {
        console.log(`Local Scoring: Prioritized ${bestCandidate.fullName} with a score of ${calculatePriorityScore(bestCandidate).toFixed(2)}.`);
    }
    return bestCandidate;
}


/**
 * Uses the Google Gemini API to determine the most critical person to check for an appointment.
 * It sends a detailed prompt with applicant data and prioritization criteria.
 * If the API call fails, it falls back to a local scoring algorithm to ensure resilience.
 */
export const getPrioritizedPerson = async (people: Person[], apiSettings: ApiSettings): Promise<Person | null> => {
  console.log("AI Service: Analyzing candidates for prioritization using Gemini API...");
  
  const runningPeople = people.filter(p => p.status === 'RUNNING');
  if (runningPeople.length === 0) {
    return null;
  }

  try {
    if (!apiSettings.token) {
      throw new Error("Gemini API key is not configured.");
    }
    
    const ai = new GoogleGenAI({ apiKey: apiSettings.token });

    const prompt = `
      You are an expert assistant for managing Schengen visa applications. Your task is to identify the single most critical applicant to check for an appointment right now from the provided list.

      Analyze the applicants based on the following criteria, in order of importance:
      1.  **Urgency:** The 'latestDate' is the travel deadline. Applicants with closer deadlines are more urgent. Today's date is ${new Date().toISOString().split('T')[0]}.
      2.  **Visa Type Priority:** Some visa types are more critical. The priority order is: 'business' > 'education' > 'family' > 'tourism'.
      3.  **City Demand:** Major cities are more competitive and require more frequent checks. The priority order is: 'Istanbul' > 'Ankara' > 'Izmir'.

      Applicants List (JSON):
      ${JSON.stringify(runningPeople.map(p => ({ id: p.id, latestDate: p.latestDate, visaType: p.visaType, city: p.city })), null, 2)}

      Based on your analysis, return a JSON object containing the 'id' of the single most critical applicant.
      Example response: { "personId": 1678886400000 }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    personId: {
                        type: Type.NUMBER,
                        description: "The unique ID of the most critical applicant."
                    }
                },
                required: ["personId"],
            }
        }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && result.personId) {
        const foundPerson = runningPeople.find(p => p.id === result.personId);
        if (foundPerson) {
            console.log(`Gemini API: Prioritized ${foundPerson.fullName}.`);
            return foundPerson;
        }
    }
    // If Gemini returns a weird result, fall back
    throw new Error("Gemini returned an invalid or missing person ID.");

  } catch (error) {
    console.error("Gemini API prioritization failed. Falling back to local logic.", error);
    return getPrioritizedPersonLocally(runningPeople);
  }
};