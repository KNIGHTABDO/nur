export interface NurQuranVerse {
  arabic: string;
  english: string;
  reference: string;
  url?: string;
}

export interface NurHadith {
  arabic?: string;
  english: string;
  reference: string;
  url?: string;
}

export interface NurSource {
  name: string;
  url: string;
}

export interface NurResponse {
  answer: string;
  quran: NurQuranVerse[];
  hadith: NurHadith[];
  fiqh: string[];
  sources: NurSource[];
  debugMetadata?: {
    engineUsed: "fanar" | "groq" | "gemini";
    rawRequest: any;
    rawResponse: any;
  };
}

// System instructions to enforce AI identity, constraints, anonymization and scopes
const SYSTEM_INSTRUCTIONS = `
You are Nur, an enlightened AI companion dedicated strictly to authentic Islamic knowledge.
You serve seekers of truth with wisdom, calm focus, humility, and absolute reverence.

CRITICAL IDENTITY RULES:
1. You are "Nur", and only "Nur".
2. You must NEVER reveal or mention that you are a model created by Google, run on Gemini, utilize 1.5, 3.5, or any other specific version.
3. If asked about your creators, model name, or underlying AI, you must politely respond: "I am Nur, your AI companion for Islamic knowledge."

CRITICAL SCOPE & CONTENT RULES:
1. You must ONLY answer questions directly related to Islam, such as Quranic verses, Tafsir, Hadith, Fiqh (Islamic jurisprudence), Islamic history, and moral or spiritual ethics in Islam.
2. If a user asks a secular, general, or unrelated question (e.g., programming, math, pop-culture, general science, non-Islamic politics), you must politely decline:
   "As-salāmu 'alaykum. My purpose is strictly to assist with Islamic knowledge, Quran studies, Hadith, and moral jurisprudence. I kindly ask that we keep our dialogues centered on these topics."
3. You must be extremely authentic. Ground every single response in verified references. If you are not absolutely sure about a ruling, Hadith authenticity, or verse mapping, you must state that you do not know or are unsure, and decline to speculate.

CRITICAL FORMATTING RULES:
1. You must return your response STRICTLY as a JSON object matching the requested schema.
2. For Quranic verses, provide the full Arabic script WITH proper diacritical marks (Tashkeel) and symbols in the "arabic" field, and the English translation in the "english" field.

CRITICAL TOOL CALLING RULES:
1. When calling the search tool, you must generate an extremely concise, single-word or two-word core search term.
2. Do NOT use long phrases, adjectives, verbs, or multiple concepts. For example, if the user asks about "music instruments in Islam", your search query MUST be simply "music". If they ask about "how to pray", the search query must be simply "prayer". If they ask about "giving charity to the poor", the search query must be simply "charity".
3. The databases search via exact keyword matches, so long phrases return zero results. Keeping search queries to a single core noun (e.g., "music", "prayer", "fasting", "marriage", "divorce", "wudu") guarantees successful retrieval.
`;

export interface NurAgentResult {
  response: NurResponse;
  toolCalled: boolean;
}

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export const fetchFanarSadiqResponse = async (
  queryText: string,
  apiKey: string,
  history: ChatTurn[] = [],
  groqKey?: string
): Promise<NurAgentResult> => {
  const endpoint = "https://api.fanar.qa/v1/chat/completions";

  try {
    // 1. Process and clean conversational history context
    const messages = history.map(turn => {
      let contentText = turn.text;
      
      // If history contains raw JSON payload from previous steps, unpack its text answer
      if (contentText.startsWith("{") && contentText.endsWith("}")) {
        try {
          const parsed = JSON.parse(contentText);
          contentText = parsed.answer || contentText;
        } catch (e) {}
      }

      return {
        role: turn.role === "model" ? "assistant" : "user",
        content: contentText
      };
    });

    // Add current user prompt
    messages.push({
      role: "user",
      content: queryText
    });

    const payload = {
      model: "Fanar-Sadiq",
      messages: messages
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 429) {
      throw new Error("Fanar API rate limit reached (429 Too Many Requests).");
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Fanar API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message;
    const answer = assistantMessage?.content || "";
    const rawReferences: any[] = assistantMessage?.references || [];

    const quranVerses: NurQuranVerse[] = [];
    const hadiths: NurHadith[] = [];
    const sources: NurSource[] = [];

    // Parse and map Fanar's native references to existing Nur response structure (default fallback mapping)
    rawReferences.forEach((ref) => {
      const sourceLower = (ref.source || "").toLowerCase();
      const contentLower = (ref.content || "").toLowerCase();

      const isQuran = sourceLower.includes("quran") || 
                      sourceLower.includes("surah") || 
                      sourceLower.includes("ayah") ||
                      contentLower.includes("allah says") ||
                      contentLower.includes("says in the quran");

      const isHadith = sourceLower.includes("hadith") || 
                        sourceLower.includes("bukhari") || 
                        sourceLower.includes("muslim") || 
                        sourceLower.includes("tirmidhi") || 
                        sourceLower.includes("abu dawud") || 
                        sourceLower.includes("ibn majah") || 
                        sourceLower.includes("an-nasa'i") ||
                        sourceLower.includes("prophet");

      let refUrl = "https://api.fanar.qa";
      if (isQuran) {
        refUrl = "https://quran.com";
        const match = sourceLower.match(/(\d+):(\d+)/);
        if (match) {
          refUrl = `https://quran.com/${match[1]}/${match[2]}`;
        }
      } else if (isHadith) {
        refUrl = "https://sunnah.com";
        if (sourceLower.includes("bukhari")) refUrl = "https://sunnah.com/bukhari";
        else if (sourceLower.includes("muslim")) refUrl = "https://sunnah.com/muslim";
        else if (sourceLower.includes("tirmidhi")) refUrl = "https://sunnah.com/tirmidhi";
        else if (sourceLower.includes("abu dawud") || sourceLower.includes("abudawud")) refUrl = "https://sunnah.com/abudawud";
        else if (sourceLower.includes("ibn majah") || sourceLower.includes("ibnmajah")) refUrl = "https://sunnah.com/ibnmajah";
        else if (sourceLower.includes("an-nasa'i") || sourceLower.includes("nasai")) refUrl = "https://sunnah.com/nasai";
      } else if (sourceLower.startsWith("http://") || sourceLower.startsWith("https://")) {
        refUrl = ref.source;
      }

      if (isQuran) {
        quranVerses.push({
          arabic: "", 
          english: ref.content || "",
          reference: ref.source || "Holy Quran",
          url: refUrl
        });
      } else if (isHadith) {
        hadiths.push({
          english: ref.content || "",
          reference: ref.source || "Hadith Reference",
          url: refUrl
        });
      }

      sources.push({
        name: ref.source || `Reference #${ref.number || ref.index}`,
        url: refUrl
      });
    });

    // ----------------------------------------------------
    // HYBRID RESTRENGTHENING SYNTHESIS VIA GROQ (IF KEY ACTIVE)
    // ----------------------------------------------------
    if (groqKey) {
      try {
        const groqPrompt = `
You are a zero-creativity JSON restructuring parser for authentic Islamic knowledge.
Your sole task is to take the raw response content and verified references retrieved from a sovereign Islamic database (Fanar API), and format them strictly into the requested JSON schema.

CRITICAL INSTRUCTIONS:
1. You must be 0% creative. Do NOT add any external knowledge, rulings, or text. Rely ONLY on the provided Fanar response content and Fanar references.
2. Clean up the "answer" field: remove redundant copy-pasted references or lists from the bottom of the main text. Keep the core text response perfectly polished, readable, and beautifully formatted in markdown.
3. Correctly classify and populate the "quran" array: extract any Quranic verses cited in the Fanar response or references. For each verse, extract the Arabic diacritical script (tashkeel) if available, and the English translation.
4. Correctly classify and populate the "hadith" array: extract any Hadith narrations cited in the Fanar response or references. Include Arabic if available, and English.
5. Formulate clear, concise jurisprudential "fiqh" summary bullet points based strictly on the rulings stated in the Fanar text.
6. Populate the "sources" list with verified canonical sources matching the references. Provide a name and a clean URL.

JSON Response Schema (MUST MATCH EXACTLY):
{
  "answer": "Clean, beautifully formatted, concise text response in English.",
  "quran": [
    {
      "arabic": "Arabic text with tashkeel (if cited in the Fanar text/references)",
      "english": "English translation of the verse",
      "reference": "e.g., Surah Al-Baqarah (2:185)",
      "url": "https://quran.com/2/185"
    }
  ],
  "hadith": [
    {
      "arabic": "Arabic text (if cited)",
      "english": "English translation",
      "reference": "e.g., Sahih al-Bukhari (Hadith #1)",
      "url": "https://sunnah.com/bukhari/1"
    }
  ],
  "fiqh": [
    "Specific legal verdict bullet 1",
    "Specific legal verdict bullet 2"
  ],
  "sources": [
    {
      "name": "Reference source name",
      "url": "Reference source URL"
    }
  ]
}

Input Context to Restructure:
=== Raw Fanar Response ===
${answer}

=== Raw Fanar References ===
${JSON.stringify(rawReferences, null, 2)}
`;

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a zero-creativity JSON parser that strictly structures provided text without adding any external information." },
              { role: "user", content: groqPrompt }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const parsed = JSON.parse(groqData.choices?.[0]?.message?.content || "{}");
          
          if (parsed.answer && Array.isArray(parsed.quran) && Array.isArray(parsed.hadith) && Array.isArray(parsed.sources)) {
            return {
              response: {
                answer: parsed.answer,
                quran: parsed.quran,
                hadith: parsed.hadith,
                fiqh: Array.isArray(parsed.fiqh) ? parsed.fiqh : ["Synthesized using authentic Fanar RAG digital library references."],
                sources: parsed.sources.length > 0 ? parsed.sources : sources,
                debugMetadata: {
                  engineUsed: "fanar",
                  rawRequest: payload,
                  rawResponse: {
                    fanarResponse: data,
                    groqRestructured: parsed
                  }
                }
              },
              toolCalled: true
            };
          }
        }
      } catch (groqErr) {
        console.warn("[Nur Router] Groq restructuring failed, falling back to client-side mapping:", groqErr);
      }
    }

    // Default Fallback Response
    return {
      response: {
        answer: answer,
        quran: quranVerses,
        hadith: hadiths,
        fiqh: ["Synthesized dynamically using authentic Fanar RAG digital library references."],
        sources: sources.length > 0 ? sources : [{ name: "Fanar Islamic RAG Catalog", url: "https://api.fanar.qa" }],
        debugMetadata: {
          engineUsed: "fanar",
          rawRequest: payload,
          rawResponse: data
        }
      },
      toolCalled: true
    };
  } catch (error) {
    console.error("fetchFanarSadiqResponse failed:", error);
    throw error;
  }
};

// Helper for dynamic local greeting test inside fallback
// Groq Fallback Engine
export const fetchGroqFallback = async (
  queryText: string,
  groqKey: string,
  history: ChatTurn[] = [],
  preFetchedQuran?: NurQuranVerse[],
  preFetchedHadith?: NurHadith[]
): Promise<NurAgentResult> => {
  if (!groqKey) {
    return {
      response: {
        answer: "As-salāmu 'alaykum. The primary engine is currently unavailable. Please configure a Groq API Key in the Settings page to activate the automated high-speed Groq fallback sanctuary.",
        quran: [],
        hadith: [],
        fiqh: ["AI engine rate-limited or unavailable.", "Groq API Key is not configured in Settings preferences."],
        sources: []
      },
      toolCalled: false
    };
  }

  // Phase 1: Dynamic AI Query & Intent Optimizer
  let shouldSearch = true;
  let searchQuery = queryText;

  try {
    const optimizerRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are Nur's intelligent search router. 
            Analyze the user's inquiry and decide if it requires searching canonical Islamic databases (Quranic verses, Hadiths, scholarly Fiqh rulings).
            Greetings, conversational chit-chat, capability meta-questions (e.g., 'what can you do', 'help', who you are) should NOT search.
            If search is required, extract a single-word or at most two-word core noun keyword in English for the search (e.g. "prayer", "fasting", "charity", "marriage"). Do not output phrases.
            
            Respond STRICTLY in JSON format:
            {
              "shouldSearch": true or false,
              "searchQuery": "single core search keyword if shouldSearch is true, otherwise empty"
            }`
          },
          { role: "user", content: queryText }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (optimizerRes.ok) {
      const optData = await optimizerRes.json();
      const parsedOpt = JSON.parse(optData.choices?.[0]?.message?.content || "{}");
      shouldSearch = parsedOpt.shouldSearch !== false;
      searchQuery = parsedOpt.searchQuery || queryText;
      console.log(`[Groq AI Router] Original: "${queryText}" -> Optimized Search Query: "${searchQuery}" (shouldSearch: ${shouldSearch})`);
    }
  } catch (e) {
    console.warn("Groq query optimizer failed, fallback to raw text:", e);
  }

  if (!shouldSearch) {
    // ----------------------------------------
    // Conversational Completion Route
    // ----------------------------------------
    const messages = [
      { role: "system", content: SYSTEM_INSTRUCTIONS },
      ...history.map(turn => ({
        role: turn.role === "model" ? "assistant" as const : "user" as const,
        content: turn.text.startsWith("{") && turn.text.endsWith("}") 
          ? JSON.parse(turn.text).answer || turn.text 
          : turn.text
      })),
      { role: "user", content: queryText }
    ];

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || "";
      const trimmed = text.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          text = parsed.answer || parsed.response || parsed.text || text;
        } catch (e) {}
      }

      return {
        response: {
          answer: text,
          quran: [],
          hadith: [],
          fiqh: [],
          sources: []
        },
        toolCalled: false
      };
    } catch (e) {
      console.error("Groq Greet query failed", e);
      throw e;
    }
  } else {
    // ----------------------------------------
    // Search & Deep Synthesis Route
    // ----------------------------------------
    let retrievedQuran: NurQuranVerse[] = preFetchedQuran || [];
    let retrievedHadith: NurHadith[] = preFetchedHadith || [];

    if (!preFetchedQuran && !preFetchedHadith) {
      // Execute live Quranic lookup using the optimized query
      try {
        const quranRes = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/all/en`);
        if (quranRes.ok) {
          const quranData = await quranRes.json();
          if (quranData.data?.matches && quranData.data.matches.length > 0) {
            const matches = quranData.data.matches.slice(0, 3);
            retrievedQuran = await Promise.all(
              matches.map(async (match: any) => {
                try {
                  const arRes = await fetch(`https://api.alquran.cloud/v1/ayah/${match.number}/quran-simple`);
                  const arData = await arRes.json();
                  return {
                    arabic: arData.data?.text || "",
                    english: match.text || "",
                    reference: `Surah ${match.surah?.englishName || "Quran"} (${match.surah?.number}:${match.numberInSurah})`,
                    url: `https://quran.com/${match.surah?.number || 1}/${match.numberInSurah || 1}`
                  };
                } catch (e) {
                  return {
                    arabic: "",
                    english: match.text || "",
                    reference: `Surah ${match.surah?.englishName || "Quran"} (${match.surah?.number}:${match.numberInSurah})`,
                    url: `https://quran.com/${match.surah?.number || 1}/${match.numberInSurah || 1}`
                  };
                }
              })
            );
          }
        }
      } catch (e) {
        console.error("Groq Quran pre-fetch failed", e);
      }

      // Execute live Hadith lookup using the optimized query
      try {
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const queryUrl = isLocal
          ? `/hadith-proxy/api/search?q=${encodeURIComponent(searchQuery)}&limit=3`
          : `https://hadithapi.pages.dev/api/search?q=${encodeURIComponent(searchQuery)}&limit=3`;
        const hadithRes = await fetch(queryUrl);
        if (hadithRes.ok) {
          const hadithData = await hadithRes.json();
          if (hadithData.results && hadithData.results.length > 0) {
            retrievedHadith = hadithData.results.map((item: any) => {
              const bookTitle = item.book || "Authentic Collection";
              const colSlug = item.collection || "";
              let standardCollName = bookTitle;
              if (colSlug === "bukhari") standardCollName = "Sahih al-Bukhari";
              else if (colSlug === "muslim") standardCollName = "Sahih Muslim";
              else if (colSlug === "abudawud") standardCollName = "Sunan Abu Dawud";
              else if (colSlug === "ibnmajah") standardCollName = "Sunan Ibn Majah";
              else if (colSlug === "tirmidhi") standardCollName = "Jami` at-Tirmidhi";

              return {
                arabic: item.hadith_arabic || "",
                english: (item.header ? `${item.header}\n` : "") + (item.hadith_english || ""),
                reference: `${standardCollName} (Hadith #${item.id || item.refno || ""})`,
                url: `https://hadithapi.pages.dev/api/${item.collection || "bukhari"}/${item.id || 1}`
              };
            });
          }
        }
      } catch (e) {
        console.error("Groq Hadith pre-fetch failed", e);
      }
    }

    const synthesisPrompt = `
Original User Inquiry: "${queryText}"
Decided Search Query: "${searchQuery}"

Retrieved Database Context:
Quranic Verses:
${JSON.stringify(retrievedQuran, null, 2)}

Authentic Hadiths:
${JSON.stringify(retrievedHadith, null, 2)}

Please synthesize a complete, beautiful, and authentic response to the user's inquiry strictly utilizing the retrieved texts where applicable.
Ensure you follow all the rules of the "Nur" persona:
1. Identify strictly as "Nur". No Google, Gemini, or version terms.
2. Ground the response in the retrieved Quranic verses and Hadiths. Cite the reference strings exactly as retrieved.
3. Formulate legal/jurisprudential bullets (fiqh) and general sources list.
4. If the retrieved texts do not directly solve the query, state so humbly and provide the closest authentic guidance without speculating.
5. Format your output strictly as a JSON object matching this schema:
{
  "answer": "detailed English response",
  "quran": [ { "arabic": "arabic diacritical script", "english": "translation", "reference": "exact reference" } ],
  "hadith": [ { "arabic": "arabic script", "english": "translation", "reference": "exact reference" } ],
  "fiqh": [ "fiqh bullet 1", "fiqh bullet 2" ],
  "sources": [ "source title 1" ]
}
`;

    const messages = [
      { role: "system", content: SYSTEM_INSTRUCTIONS },
      ...history.map(turn => ({
        role: turn.role === "model" ? "assistant" as const : "user" as const,
        content: turn.text.startsWith("{") && turn.text.endsWith("}") 
          ? JSON.parse(turn.text).answer || turn.text 
          : turn.text
      })),
      { role: "user", content: synthesisPrompt }
    ];

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      const textResponse = data.choices?.[0]?.message?.content;
      if (!textResponse) {
        throw new Error("Empty content returned from Groq synthesizer.");
      }

      const parsedResponse: NurResponse = JSON.parse(textResponse);

      const finalSources: NurSource[] = [];
      retrievedQuran.forEach(verse => {
        finalSources.push({
          name: verse.reference,
          url: verse.url || "https://quran.com"
        });
      });
      retrievedHadith.forEach(hadith => {
        finalSources.push({
          name: hadith.reference,
          url: hadith.url || "https://hadithapi.pages.dev"
        });
      });

      if (finalSources.length === 0) {
        finalSources.push({
          name: "Groq Fallback Sanctuary",
          url: "https://api.groq.com"
        });
      }

      parsedResponse.sources = finalSources;
      
      parsedResponse.debugMetadata = {
        engineUsed: "groq",
        rawRequest: { 
          optimizedSearchQuery: searchQuery,
          messages, 
          model: "llama-3.3-70b-versatile" 
        },
        rawResponse: data
      };

      return {
        response: parsedResponse,
        toolCalled: true
      };
    } catch (e) {
      console.error("Groq deep query failed", e);
      throw e;
    }
  }
};

// Helper to generate the default mock responses when no credentials are configured
const getMockDefaultResponse = (queryText: string): Promise<NurAgentResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isGreeting = 
        queryText.toLowerCase().includes("hey") || 
        queryText.toLowerCase().includes("hello") || 
        queryText.toLowerCase().includes("salam") || 
        queryText.toLowerCase().includes("peace");

      if (isGreeting) {
        resolve({
          response: {
            answer: "As-salāmu 'alaykum! I am Nur, your AI companion for Islamic knowledge. Please configure your Groq or Fanar API Key in the Settings page to unlock real-time, authentic Islamic search and synthesis.",
            quran: [],
            hadith: [],
            fiqh: ["An API Key is required in Settings to enable real-time searches."],
            sources: []
          },
          toolCalled: false
        });
      } else {
        resolve({
          response: {
            answer: `As-salāmu 'alaykum. I received your question: "${queryText}". Please configure your API Key in the Settings page to unlock real-time, dynamic Islamic synthesis for any question.`,
            quran: [
              {
                arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَقُولُوا قَوْلًا سَدِيدًا",
                english: "O you who have believed, fear Allah and speak words of appropriate justice.",
                reference: "Quran 33:70",
                url: "https://quran.com/33/70"
              }
            ],
            hadith: [],
            fiqh: ["An API Key is required in Settings to enable real-time searches."],
            sources: [{ name: "Nur System Helper", url: "https://api.groq.com" }]
          },
          toolCalled: true
        });
      }
    }, 1000);
  });
};

// Global Routing AI Director
export const fetchNurResponse = async (
  queryText: string,
  _apiKey: string, // Kept for signature compatibility
  history: ChatTurn[] = []
): Promise<NurAgentResult> => {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem("nur_groq_api_key") || "";
  const fanarKey = import.meta.env.VITE_FANAR_API_KEY || localStorage.getItem("nur_fanar_api_key") || "";

  console.log(`[Nur Router] groqKeyConfigured: ${!!groqKey}, fanarKeyConfigured: ${!!fanarKey}`);

  // Scenario 1: Neither key is configured
  if (!groqKey && !fanarKey) {
    console.log("[Nur Router] No credentials configured. Returning default mock response...");
    return getMockDefaultResponse(queryText);
  }

  // Scenario 2: Groq is configured (enabling intelligent routing)
  if (groqKey) {
    if (fanarKey) {
      // Both Groq and Fanar configured (unified smart routing pipeline)
      try {
        const messages = [
          {
            role: "system" as const,
            content: `
You are the routing director for Nur, an enlightened Islamic AI companion.
Analyze the user's inquiry and the conversation history to decide if answering it requires querying our sovereign Islamic search database (Fanar API) for specific Quranic verses, Hadith narrations, or formal jurisprudential rulings, or if it is a conversational turn that you can answer directly.

CRITICAL INTENT CLASSIFICATION RULES:
1. Set "shouldSearchFanar" to true ONLY if the query asks for:
   - Islamic jurisprudential rulings/verdicts (Fiqh on marriage, Zakat, inheritance, purity, banking, etc.).
   - Specific citations/lookups of Quranic verses or Hadith narrations.
   - Deep theological positions, historical Islamic facts, or scholarly consensus.
2. Set "shouldSearchFanar" to false for:
   - Greetings (e.g., "Assalamu alaykum", "Hello", "Hey", "Good morning").
   - Follow-up conversational pleasantries, simple dialogue, thanks, or praise (e.g., "JazakAllah khair", "Thank you", "BarakAllahu feek", "Understood", "Okay").
   - Questions about your identity, capabilities, creators, or purpose (e.g., "Who are you?", "What is your name?", "What can you do?").
   - Any secular, general, or unrelated questions (e.g., coding, mathematics, science, non-Islamic news, creative writing).

CRITICAL CONVERSATIONAL ANSWER RULES (Only when "shouldSearchFanar" is false):
1. Write the final response in the "conversationalAnswer" field.
2. You are Nur, and only Nur. Never mention Google, Gemini, Groq, or specific model versions. If asked about your creators or technology, politely say: "I am Nur, your AI companion for Islamic knowledge."
3. Keep the response beautifully written, concise, respectful, and perfectly aligned with the authentic Islamic identity of Nur.
4. If the query is secular/unrelated/out of scope, you MUST politely decline to answer using the exact message:
   "As-salāmu 'alaykum. My purpose is strictly to assist with Islamic knowledge, Quran studies, Hadith, and moral jurisprudence. I kindly ask that we keep our dialogues centered on these topics."

Respond STRICTLY in JSON format matching this schema:
{
  "shouldSearchFanar": true | false,
  "conversationalAnswer": "Response text if shouldSearchFanar is false, otherwise empty string."
}
`
          },
          ...history.map(turn => {
            let contentText = turn.text;
            if (contentText.startsWith("{") && contentText.endsWith("}")) {
              try {
                const parsed = JSON.parse(contentText);
                contentText = parsed.answer || contentText;
              } catch (e) {}
            }
            return {
              role: turn.role === "model" ? "assistant" as const : "user" as const,
              content: contentText
            };
          }),
          { role: "user" as const, content: queryText }
        ];

        const routerResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            response_format: { type: "json_object" }
          })
        });

        if (!routerResponse.ok) {
          throw new Error(`Groq Router request failed: ${routerResponse.status}`);
        }

        const routerData = await routerResponse.json();
        const rawContent = routerData.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(rawContent);

        console.log(`[Nur Smart Router] shouldSearchFanar: ${parsed.shouldSearchFanar}`);

        if (parsed.shouldSearchFanar) {
          // Intent B: RAG Search required
          try {
            return await fetchFanarSadiqResponse(queryText, fanarKey, history, groqKey);
          } catch (fanarErr) {
            console.warn("[Nur Router] Fanar RAG failed. Using high-speed Groq fallback RAG...", fanarErr);
            return await fetchGroqFallback(queryText, groqKey, history);
          }
        } else {
          // Intent A: Conversational turn handled directly by Groq
          return {
            response: {
              answer: parsed.conversationalAnswer || "As-salāmu 'alaykum. I am Nur, your AI companion. How may I assist you in your pursuit of Islamic knowledge today?",
              quran: [],
              hadith: [],
              fiqh: [],
              sources: [],
              debugMetadata: {
                engineUsed: "groq",
                rawRequest: {
                  messages,
                  model: "llama-3.3-70b-versatile"
                },
                rawResponse: routerData
              }
            },
            toolCalled: false
          };
        }
      } catch (routerErr) {
        console.warn("[Nur Router] Groq routing classification failed. Falling back to default RAG paths...", routerErr);
        // Fallback to calling Fanar directly, failing over to Groq RAG
        try {
          return await fetchFanarSadiqResponse(queryText, fanarKey, history, groqKey);
        } catch (fanarErr) {
          return await fetchGroqFallback(queryText, groqKey, history);
        }
      }
    } else {
      // Groq configured but no Fanar key -> Fallback RAG via Groq
      console.log("[Nur Router] Only Groq key is configured. Querying Groq Fallback RAG directly...");
      return fetchGroqFallback(queryText, groqKey, history);
    }
  }

  // Scenario 3: Only Fanar is configured (no Groq for routing)
  console.log("[Nur Router] Only Fanar key is configured. Querying Fanar directly...");
  return fetchFanarSadiqResponse(queryText, fanarKey, history);
};
