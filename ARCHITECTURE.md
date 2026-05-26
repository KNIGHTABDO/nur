# Cognitive Architecture & System Dynamics

Welcome to the deep architectural specification of **Nur**. This document details the cognitive pipelines, agentic workflows, inference processes, and execution states that power Nur's high-fidelity, rate-limit preserving Islamic RAG architecture.

---

## 1. Cognitive Architecture Diagram

The cognitive architecture governs how Nur consumes user input, models constraints, and directs flows to enforce maximum theological authenticity while executing under tight rate limits.

```mermaid
graph TB
    subgraph Cognitive Loop
        Query[User Input] --> IntentDecoder[Groq Intent Classifier]
        IntentDecoder --> Decision{Search Required?}
        
        Decision -->|No| PromptEngineer[System Prompt Constraints]
        PromptEngineer --> DirectSynthesizer[Groq direct synthesis]
        
        Decision -->|Yes| DatabaseRetriever[Fanar-Sadiq Sovereign Database RAG]
        DatabaseRetriever --> ReferenceValidator[Reference extractor & URL mapper]
        
        ReferenceValidator --> Structurer[Zero-Creativity Groq Restructure Parser]
        Structurer --> FiqhSynthesizer[Fiqh Summarizer]
    end
    
    subgraph Theological Constraints
        StrictRules[1. Zero external rulings added<br/>2. Diacritics enforced for Arabic Quran<br/>3. Identification strictly as 'Nur']
    end
    
    DirectSynthesizer --> StrictRules
    Structurer --> StrictRules
    FiqhSynthesizer --> StrictRules
    
    StrictRules --> FinalPayload[Final JSON Response Object]
```

---

## 2. Agentic Workflow Diagram

The agentic workflow manages multi-stage database retrievals, validation cycles, and failover fallbacks.

```mermaid
graph TD
    User([Seeker / User]) -->|Submits Query| FE[React + TypeScript Frontend]
    FE -->|Loads Keys| Env[Env / LocalStorage Variables]
    FE -->|Triggers Router| GR[Groq Router: llama-3.3-70b]
    
    GR -->|Intent Classifier| Dec{Decision Gate}
    
    Dec -->|Intent A: Conversational| GroqDirect[Groq Direct Generator]
    Dec -->|Intent B: Academic Search| FanarRAG[Fanar-Sadiq RAG API]
    
    FanarRAG -->|Raw references + Verdict| GroqRestruct[Groq Restructure Parser]
    
    GroqDirect -->|Formatted JSON| UI[Response Mapping & UI Render]
    GroqRestruct -->|Formatted JSON| UI
    
    %% Fallbacks
    FanarRAG -.->|On Rate Limit 429 or Fail| GroqFallback[Groq Fallback RAG]
    GroqFallback -->|Alquran.cloud + HadithAPI Search| GroqRestruct
    
    UI -->|Render Arabic diacritics / Quran / Hadith lists| Screen[ChatView Screen]
    Screen -->|Debug Inspect 🐛| Modal[Debug Inspector Modal]
```

---

## 3. Decision Pipeline

The Decision Pipeline resolves routing gates when both keys are loaded, preventing extraneous queries from hitting the premium sovereign database.

```mermaid
flowchart TD
    Start([Receive User Query]) --> GetKeys[Load VITE_GROQ_API_KEY & VITE_FANAR_API_KEY]
    GetKeys --> CheckKeys{Are keys configured?}
    
    CheckKeys -->|No Keys| Mock[Return Mock Offline Greeting / Prompt Settings]
    CheckKeys -->|Groq Key Only| GroqRAG[Execute Groq Fallback RAG Directly]
    CheckKeys -->|Fanar Key Only| FanarDirect[Execute Fanar-Sadiq Directly]
    
    CheckKeys -->|Both Keys| Classify[Send to Groq Router Classifier]
    
    Classify --> RuleCheck{Query Intent Classification}
    
    RuleCheck -->|Conversational / Greeting / Meta / Secular| IntentA[Intent A: Direct conversational completion]
    RuleCheck -->|Jurisprudence / Quran Lookup / Hadith / Islamic Law| IntentB[Intent B: Academic Fanar RAG request]
    
    IntentA --> BuildResponse[Generate Nur-styled direct answer] --> FormatUI[Package with debugMetadata engine: groq] --> End([Render Response])
    
    IntentB --> RunFanar[Invoke fetchFanarSadiqResponse]
    RunFanar --> RunParser[Invoke Groq Restructuring Parser] --> FormatUI2[Package with debugMetadata engine: fanar] --> End
```

---

## 4. Processing Pipeline

The detailed processing sequence illustrating how raw database extracts are ingested, categorized, mapped, and structured into beautiful, diacritically correct UI arrays.

```mermaid
flowchart TD
    Start[User Query: Zakat on gold rules] --> Router[Groq Classifier]
    Router -->|Classified as Fiqh| Fanar[Fanar-Sadiq API Call]
    
    subgraph Fanar Processing
        Fanar --> Retrieval[Semantic Library Query]
        Retrieval --> CrossRef[Cross-reference canonical texts]
        CrossRef --> RawOutput[Raw Scholarly Verdict text + Array of Reference sources]
    end
    
    RawOutput --> GroqParser[Groq Restructuring Parser]
    
    subgraph Groq Restructuring
        GroqParser --> CleanAnswer[Format answer in elegant markdown]
        GroqParser --> ExtractQuran[Extract Quranic verses with Arabic diacritics & English translations]
        GroqParser --> ExtractHadith[Extract Hadith text]
        GroqParser --> FormulateFiqh[Synthesize clean Fiqh consensus bullets]
        GroqParser --> MapUrls[Map citation urls to Sunnah.com & Quran.com]
    end
    
    GroqRestructuring --> UI[Populate NurResponse Object]
    UI --> Render[Render beautiful glassmorphic UI card]
```

---

## 5. Reasoning & Inference Pipeline

The reasoning pipeline represents the semantic embedding extraction and deduction states.

```mermaid
flowchart LR
    subgraph Inference Phase
        Q[User Query] --> Embeddings[Sovereign Islamic Embedding Space]
        Embeddings --> RAG[RAG Retrieval Core]
        Context[Verified Scholar Hadiths & Quran Verses]
    end
    
    subgraph Reasoning Phase
        Context --> Prompt[Strict Synthesizer Instruction]
        Prompt --> Model[Fanar-Sadiq Large Reasoner]
        Model --> ScholarlyOutput[Scholarly Verdict]
    end
    
    subgraph Formatting Phase
        ScholarlyOutput --> Restruct[Groq zero-creativity JSON parser]
        Restruct --> Output[Final UI Schema mapping]
    end
```

---

## 6. Execution Graph (State Machine)

The state-transition flow governing frontend execution cycles, network requests, and fallback routing actions.

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    state Idle {
        [*] --> WaitingForInput
    }
    
    state DispatchQuery {
        WaitingForInput --> RoutingStage : Submit Query
        RoutingStage --> DirectResponseStage : Intent A Resolved
        RoutingStage --> FanarRAGStage : Intent B Resolved
        
        DirectResponseStage --> PackagePayload
        
        state FanarRAGStage {
            [*] --> FanarRequest
            FanarRequest --> GroqRestructureStage : Request Success
            FanarRequest --> GroqFallbackStage : Request Failure (429/Network)
            
            GroqFallbackStage --> GroqRestructureStage
        }
        
        GroqRestructureStage --> PackagePayload
    }
    
    state RenderResponse {
        PackagePayload --> UIUpdate : Formatted JSON
        UIUpdate --> [*]
    }
    
    UIUpdate --> Idle : Complete
```

---

## Model Specifications & Theological Constraints

### 1. Unified Engine Specs
*   **Groq Supervisor**: `llama-3.3-70b-versatile` in JSON mode. Chosen for ultra-low latency inference, high adherence to complex structured schemas, and exceptional instruction compliance.
*   **Sovereign Islamic RAG Engine**: `Fanar-Sadiq` on QCRI's Sovereign Islamic API. Fine-tuned specifically on verified Islamic literature, classical texts, jurisprudence catalogs, and authentic Hadith corpora.

### 2. Zero-Creativity Restructuring Guardrails
To prevent AI hallucinations in Islamic rulings (which is a grave issue in classical LLMs), the Groq parsing prompt is restricted by **zero-creativity guardrails**:
- **Strict Ingestion**: The parser is forbidden from drawing from its generic pre-trained weights to formulate jurisprudential arguments. It must syntactically format **only** what the Fanar RAG engine retrieves.
- **Canonical Reference Mapping**: RAG citations are automatically mapped to verified digital domains ([Quran.com](https://quran.com) and [Sunnah.com](https://sunnah.com)).
