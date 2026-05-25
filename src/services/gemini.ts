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

export const fetchGeminiResponse = async (
  queryText: string,
  apiKey: string,
  history: ChatTurn[] = []
): Promise<NurAgentResult> => {
  const activeModel = "gemini-3.5-flash";

  try {
    // Build Phase 1 contents history payload
    const contentsPayload: any[] = [];
    history.forEach(turn => {
      contentsPayload.push({
        role: turn.role,
        parts: [{ text: turn.text }]
      });
    });
    // Add current user prompt
    contentsPayload.push({
      role: "user",
      parts: [
        {
          text: `${queryText}\n\nIMPORTANT SYSTEM ROUTING INSTRUCTION: If you decide to reply directly as a conversational greeting or meta-question without calling the search tool, write a warm and friendly plain text greeting. Do NOT output a JSON block, do NOT write code blocks, just output the plain text directly.`
        }
      ]
    });

    // ==========================================
    // PHASE 1: INTENT & TOOL DECISION ROUTER
    // ==========================================
    const urlPhase1 = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
    
    const responsePhase1 = await fetch(urlPhase1, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: contentsPayload,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTIONS }]
        },
        tools: [
          {
            functionDeclarations: [
              {
                name: "search_islamic_sources",
                description: "Searches authentic Islamic resources (the Holy Quran and Sunnah Hadith) for verses and authentic teachings related to a query. Use this tool ONLY when the user's query asks for religious rulings, Quran verses, Hadiths, Islamic practices, or historical jurisprudence. Do NOT call this tool for conversational queries (like 'hey', 'hello', 'what can you do', 'help', etc.), greetings, or meta-questions about who you are, your name, or your capabilities.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    query: {
                      type: "STRING",
                      description: "The search query. MUST be an extremely concise, single-word or two-word core keyword representing the main topic (e.g., 'music' instead of 'music instruments', 'prayer' instead of 'how to pray', 'fasting' instead of 'fasting during travel', 'charity' instead of 'giving charity to the poor'). Keep it strictly to one word if possible."
                    },
                    sourceType: {
                      type: "STRING",
                      enum: ["quran", "hadith", "both"],
                      description: "Specify whether to search Quran, Hadith, or both based on what is relevant."
                    }
                  },
                  required: ["query", "sourceType"]
                }
              }
            ]
          }
        ]
      })
    });

    if (responsePhase1.status === 429) {
      throw new Error("Gemini Rate Limit (429) exceeded");
    }

    if (!responsePhase1.ok) {
      const errText = await responsePhase1.text();
      throw new Error(`Phase 1 API error: ${responsePhase1.status} - ${errText}`);
    }

    const dataPhase1 = await responsePhase1.json();
    const candidate = dataPhase1.candidates?.[0];
    const firstPart = candidate?.content?.parts?.[0];
    
    // Check if the model invoked our search tool
    if (firstPart?.functionCall && firstPart.functionCall.name === "search_islamic_sources") {
      const args = firstPart.functionCall.args as { query: string; sourceType: string };
      const searchQuery = args.query || queryText;
      const sourceType = args.sourceType || "both";

      let retrievedQuran: NurQuranVerse[] = [];
      let retrievedHadith: NurHadith[] = [];
      const sourcesUsed: string[] = [];

      // ----------------------------------------
      // Execute Quran Search
      // ----------------------------------------
      if (sourceType === "quran" || sourceType === "both") {
        try {
          const quranRes = await fetch(
            `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/all/en`
          );
          if (quranRes.ok) {
            const quranData = await quranRes.json();
            if (quranData.data?.matches && quranData.data.matches.length > 0) {
              // Take top 3 matching verses
              const matches = quranData.data.matches.slice(0, 3);
              const versesWithArabic = await Promise.all(
                matches.map(async (match: any) => {
                  try {
                    // Fetch Arabic text with diacritics
                    const arRes = await fetch(
                      `https://api.alquran.cloud/v1/ayah/${match.number}/quran-simple`
                    );
                    const arData = await arRes.json();
                    return {
                      arabic: arData.data?.text || "",
                      english: match.text || "",
                      reference: `Surah ${match.surah?.englishName || "Quran"} (${match.surah?.number}:${match.numberInSurah})`,
                      url: `https://quran.com/${match.surah?.number || 1}/${match.numberInSurah || 1}`
                    };
                  } catch (e) {
                    console.error("Failed to fetch Arabic verse details", e);
                    return {
                      arabic: "",
                      english: match.text || "",
                      reference: `Surah ${match.surah?.englishName || "Quran"} (${match.surah?.number}:${match.numberInSurah})`,
                      url: `https://quran.com/${match.surah?.number || 1}/${match.numberInSurah || 1}`
                    };
                  }
                })
              );
              retrievedQuran = versesWithArabic;
              sourcesUsed.push("Al Quran Cloud API");
            }
          }
        } catch (e) {
          console.error("Quran Search Fetch failed", e);
        }
      }

      // ----------------------------------------
      // Execute Hadith Search
      // ----------------------------------------
      if (sourceType === "hadith" || sourceType === "both") {
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
              sourcesUsed.push("Hadith API (pages.dev)");
            }
          }
        } catch (e) {
          console.error("Hadith Search Fetch failed", e);
        }
      }

      // Ensure sourcesUsed has at least one catalog entry if blank
      if (sourcesUsed.length === 0) {
        sourcesUsed.push("Islamic Canonical Databases");
      }

      // ==========================================
      // PHASE 2: SYNTHESIZER WITH RETRIEVED TEXTS
      // ==========================================
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
5. Format your output strictly matching the requested JSON schema.
`;

      const contentsPhase2: any[] = [];
      history.forEach(turn => {
        contentsPhase2.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      });
      contentsPhase2.push({
        role: "user",
        parts: [{ text: synthesisPrompt }]
      });

      const responsePhase2 = await fetch(urlPhase1, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: contentsPhase2,
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTIONS }]
          },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                answer: { 
                  type: "STRING", 
                  description: "Detailed, comprehensive answer in English, matching a humble and authoritative tone." 
                },
                quran: {
                  type: "ARRAY",
                  description: "Quranic verses cited. MUST match the retrieved Quranic verses.",
                  items: {
                    type: "OBJECT",
                    properties: {
                      arabic: { type: "STRING" },
                      english: { type: "STRING" },
                      reference: { type: "STRING" }
                    },
                    required: ["arabic", "english", "reference"]
                  }
                },
                hadith: {
                  type: "ARRAY",
                  description: "Hadiths cited. MUST match the retrieved Hadiths.",
                  items: {
                    type: "OBJECT",
                    properties: {
                      arabic: { type: "STRING" },
                      english: { type: "STRING" },
                      reference: { type: "STRING" }
                    },
                    required: ["english", "reference"]
                  }
                },
                fiqh: {
                  type: "ARRAY",
                  description: "Short bullets describing schools of thought, scholarly consensus, or legal verdicts.",
                  items: { type: "STRING" }
                },
                sources: {
                  type: "ARRAY",
                  description: "List of general sources referenced.",
                  items: { type: "STRING" }
                }
              },
              required: ["answer", "quran", "hadith", "fiqh", "sources"]
            }
          }
        })
      });

      if (responsePhase2.status === 429) {
        throw new Error("Gemini Rate Limit (429) exceeded on synthesis Phase 2");
      }

      if (!responsePhase2.ok) {
        const errText = await responsePhase2.text();
        throw new Error(`Phase 2 API error: ${responsePhase2.status} - ${errText}`);
      }

      const dataPhase2 = await responsePhase2.json();
      const textResponse = dataPhase2.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error("Empty content returned from Generative AI synthesizer.");
      }

      const parsedResponse: NurResponse = JSON.parse(textResponse);
      
      // Re-construct the sources list using the actual CDN/canonical URLs of the retrieved items
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
          name: "Islamic Canonical Databases",
          url: "https://hadithapi.pages.dev"
        });
      }

      parsedResponse.sources = finalSources;

      return {
        response: parsedResponse,
        toolCalled: true
      };
    } else {
      // ----------------------------------------
      // Conversational Route (No Tool Decided)
      // ----------------------------------------
      let chatText = firstPart?.text || "As-salāmu 'alaykum. How can I assist you on your spiritual path of Islamic study today?";
      
      // Robust JSON unpacking check: in case Gemini outputs custom JSON wrapper for the greeting
      const trimmed = chatText.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          chatText = parsed.answer || parsed.response || parsed.text || chatText;
        } catch (e) {
          // Attempt simple key/value capture if parse fails
          const match = trimmed.match(/"(?:response|answer|text)"\s*:\s*"([^"]+)"/);
          if (match && match[1]) {
            chatText = match[1];
          }
        }
      }

      return {
        response: {
          answer: chatText,
          quran: [],
          hadith: [],
          fiqh: [],
          sources: []
        },
        toolCalled: false
      };
    }
  } catch (error) {
    console.error("Error invoking Gemini API Agent:", error);
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
            answer: "As-salāmu 'alaykum! I am Nur, your AI companion for Islamic knowledge. Please configure your Groq or Gemini API Key in the Settings page to unlock real-time, authentic Islamic search and synthesis.",
            quran: [],
            hadith: [],
            fiqh: ["An API Key is required in Settings to enable real-time searches."],
            sources: [{ name: "Nur System Helper", url: "https://api.groq.com" }]
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
  apiKey: string,
  history: ChatTurn[] = []
): Promise<NurAgentResult> => {
  // 1. Resolve keys from server environment (.env via VITE_) or client LocalStorage
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || apiKey || localStorage.getItem("nur_gemini_api_key") || "";
  const groqKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem("nur_groq_api_key") || "";
  
  // 2. Resolve default engine (defaults to "groq" as requested by the user)
  const defaultEngine = localStorage.getItem("nur_default_engine") || "groq";

  console.log(`[Nur Router] defaultEngine: ${defaultEngine}, geminiKeyConfigured: ${!!geminiKey}, groqKeyConfigured: ${!!groqKey}`);

  // Executor helpers
  const runGroq = async (): Promise<NurAgentResult> => {
    if (!groqKey) throw new Error("Groq API Key is not configured.");
    return fetchGroqFallback(queryText, groqKey, history);
  };

  const runGemini = async (): Promise<NurAgentResult> => {
    if (!geminiKey) throw new Error("Gemini API Key is not configured.");
    return fetchGeminiResponse(queryText, geminiKey, history);
  };

  // 3. Dual-Failover Routing Logic
  if (defaultEngine === "groq") {
    if (groqKey) {
      try {
        return await runGroq();
      } catch (err) {
        console.warn("[Nur Router] Groq failed/rate-limited. Attempting failover to Gemini...", err);
        if (geminiKey) {
          try {
            return await runGemini();
          } catch (geminiErr) {
            console.error("[Nur Router] Failover to Gemini also failed:", geminiErr);
          }
        }
        return {
          response: {
            answer: `As-salāmu 'alaykum. The primary Groq engine encountered an issue, and the secondary Gemini fallback was unsuccessful. Details: ${(err as Error).message}`,
            quran: [],
            hadith: [],
            fiqh: ["Primary Groq engine query failed.", "Gemini fallback not configured or also failed."],
            sources: [{ name: "Nur AI Systems", url: "https://api.groq.com" }]
          },
          toolCalled: false
        };
      }
    } else if (geminiKey) {
      console.log("[Nur Router] Groq key missing. Querying Gemini directly...");
      try {
        return await runGemini();
      } catch (err) {
        return {
          response: {
            answer: `As-salāmu 'alaykum. The Groq key is not configured, and the Gemini query failed: ${(err as Error).message}`,
            quran: [],
            hadith: [],
            fiqh: ["Gemini query failed."],
            sources: [{ name: "Error Handler", url: "https://generativelanguage.googleapis.com" }]
          },
          toolCalled: false
        };
      }
    } else {
      return getMockDefaultResponse(queryText);
    }
  } else {
    // defaultEngine === "gemini"
    if (geminiKey) {
      try {
        return await runGemini();
      } catch (err) {
        console.warn("[Nur Router] Gemini failed/rate-limited. Attempting failover to Groq...", err);
        if (groqKey) {
          try {
            return await runGroq();
          } catch (groqErr) {
            console.error("[Nur Router] Failover to Groq also failed:", groqErr);
          }
        }
        return {
          response: {
            answer: `As-salāmu 'alaykum. The primary Gemini engine encountered an issue, and the secondary Groq fallback was unsuccessful. Details: ${(err as Error).message}`,
            quran: [],
            hadith: [],
            fiqh: ["Primary Gemini engine query failed.", "Groq fallback not configured or also failed."],
            sources: [{ name: "Nur AI Systems", url: "https://api.groq.com" }]
          },
          toolCalled: false
        };
      }
    } else if (groqKey) {
      console.log("[Nur Router] Gemini key missing. Querying Groq directly...");
      try {
        return await runGroq();
      } catch (err) {
        return {
          response: {
            answer: `As-salāmu 'alaykum. The Gemini key is not configured, and the Groq query failed: ${(err as Error).message}`,
            quran: [],
            hadith: [],
            fiqh: ["Groq query failed."],
            sources: [{ name: "Error Handler", url: "https://api.groq.com" }]
          },
          toolCalled: false
        };
      }
    } else {
      return getMockDefaultResponse(queryText);
    }
  }
};
