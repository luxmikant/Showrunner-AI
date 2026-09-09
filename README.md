# Showrunner-AI

## Autonomous Pre-Production & Scrimba Studio for Digital Filmmakers

> **Built for the [Agentic Cinema: The Blockbuster Hackathon](https://agentic-cinema.devpost.com/)**  
> **Track:** **Parallel Partner Track** *(Grounded in Parallel Web Systems Search & Extract)*  
> **Core Engine:** **Google Cloud Agent Builder / Gemini 2.5**

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688.svg)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-646cff.svg)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com)
[![Parallel](https://img.shields.io/badge/Parallel-Search%20%26%20Extract-orange.svg)](https://parallel.ai)

---

## 🌟 The Creator Problem: "The Text-Only Chasm"

In modern digital entertainment—**10–25 minute YouTube narrative shorts, high-production video essays (Johnny Harris, LEMMiNO, Kurzgesagt), and scripted visual podcasts**—creators operate in lean teams of 2 to 10 people.

Every production suffers from 4 critical bottlenecks:
1. **The Wall-of-Text Handoff Gap:** Writers hand video editors a 3,000-word Google Doc. Editors cannot envision the director's visual tone, leading to 20+ hours of painful re-editing.
2. **Research Rabbit Holes:** Fact-gathering and competitive video analysis consume 60% of pre-production time. Standard LLMs hallucinate outdated citations.
3. **The AV Disconnect:** Narration is written for the ear, not the eye. Static scenes lasting $>6$ seconds without visual cuts destroy audience retention.
4. **Disconnected Packaging:** Titles and thumbnails are treated as an afterthought instead of driving the script's core narrative hook.

---

## 🚀 The Solution: Showrunner AI

**Showrunner AI** is an autonomous multi-agent studio that transforms a rough topic or voice memo into an interactive, research-grounded, production-ready **Pre-Production Suite**:
* **Synchronized Two-Column AV Script:** The industry standard matching exact narration lines and sound design (left) with camera composition, lighting tone, and asset directives (right).
* **Visual Storyboard & Previs Gallery:** 16:9 cinematic shot cards, color palettes, and AI previs prompts ready for 3D animators and editors.
* **Grounded Parallel Web Dossier:** Real-time web research, verified historical facts, and competitor video blindspots powered by **Parallel Web Systems**.
* **Retention & High-CTR Packaging Suite:** 0:00–0:45 Cold Hook scoring, cut-frequency analysis, high-CTR titles, and visual thumbnail concepts.

```
┌─────────────────────────────────────────────────────────────┐
│               SHOWRUNNER AI MULTI-AGENT PIPELINE            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Agent 1: Trend & Lore Scout]  ◄── Parallel Search API/MCP │
│  (Deep web research, verified facts, competitor gap scout)  │
│         │                                                   │
│         ▼                                                   │
│  [Agent 2: Narrative & Beat Architect]  ◄── Gemini 2.5 Pro  │
│  (Two-Column AV Script, dialogue, emotional pacing)         │
│         │                                                   │
│         ▼                                                   │
│  [Agent 3: Visual Director & Storyboarder] ◄── Visual Previs│
│  (Camera angles, lighting tone, B-roll cues, shot cards)    │
│         │                                                   │
│         ▼                                                   │
│  [Agent 4: Packaging & Retention Auditor] ◄── Algorithm Opt │
│  (Hook scoring, visual cut density, title & thumb concepts) │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ How Parallel Web Systems Powers the Platform

Showrunner AI actively integrates the **Parallel Search & Extract API** (`parallel-web` Python SDK) at runtime:
1. **Multi-Query Trend Scouting:** Executes targeted natural language queries across contemporary news, technical repositories, and community archives in `fast` mode.
2. **Fact Verification & Grounding:** Extracts LLM-optimized excerpts to construct verified fact cards with outbound URLs, eliminating hallucination.
3. **Competitor Blindspot Extraction:** Analyzes existing coverage to find unexplored angles for the creator.
4. **Visual Sourcing:** Uncovers historical archive footage and blueprint references to populate editor B-roll tags.

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt
# (or: pip install parallel-web google-genai fastapi uvicorn pydantic python-dotenv httpx pytest)

# Set optional API keys in .env or environment
export PARALLEL_API_KEY="your_parallel_key_here"
export GEMINI_API_KEY="your_gemini_key_here"

# Run tests
pytest -v ../tests/

# Launch FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Verification & Testing

Showrunner AI comes with an automated pytest suite covering:
* **`test_parallel_tool_initialization`**: Validates Parallel client setup and fallback resiliency.
* **`test_parallel_search_returns_dossier`**: Validates live/mocked web search output, fact citations, and domain parsing.
* **`test_full_orchestration_pipeline`**: End-to-end integration test verifying that a raw concept successfully passes through all 4 agents and returns a valid `ShowrunnerProject`.

To run the suite:
```bash
pytest -v tests/
```

---

## 📂 Project Architecture

```
e:\agentic blockbuster hackathon\
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment configuration & API keys
│   │   ├── main.py                # FastAPI REST API endpoints
│   │   ├── agents/
│   │   │   ├── orchestrator.py    # Master multi-agent coordinator
│   │   │   ├── trend_scout.py     # Agent 1: Parallel Web Search & Extract
│   │   │   ├── beat_architect.py  # Agent 2: Gemini Two-Column AV Script
│   │   │   ├── visual_director.py # Agent 3: Storyboard & Previs directives
│   │   │   └── retention_auditor.py # Agent 4: Pacing & YouTube Packaging
│   │   ├── tools/
│   │   │   └── parallel_tool.py   # Official parallel-web SDK wrapper
│   │   └── models/
│   │       └── schemas.py         # Pydantic data contracts
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx         # Brand bar & export triggers
│   │   │   ├── PromptBar.tsx      # Multi-agent prompt orchestrator
│   │   │   ├── AVScriptView.tsx   # Synchronized Two-Column AV editor
│   │   │   ├── StoryboardGallery.tsx # 16:9 Previs card gallery
│   │   │   ├── ResearchDrawer.tsx # Parallel Web intelligence cards
│   │   │   ├── PackagingView.tsx  # High-CTR titles & thumbnail cards
│   │   │   └── SettingsModal.tsx  # Runtime API key modal
│   │   ├── types.ts               # Shared TypeScript schemas
│   │   ├── App.tsx                # Main production studio canvas
│   │   └── index.css              # Dark cinema theme styles
│   ├── package.json
│   └── vite.config.ts
├── tests/
│   ├── test_parallel_tool.py
│   └── test_agent_orchestration.py
└── README.md
```

---

## 🏆 Hackathon Alignment Checklist

- [x] **Google Cloud Agent Platform / Gemini 2.5**: Screenplay structure, narrative beats, and pacing analysis.
- [x] **Parallel Partner Track**: Active runtime integration of `parallel-web` for web search, fact extraction, and competitor blindspots.
- [x] **Production-Ready Experience**: Complete Two-Column AV script, Storyboard Previs gallery, and YouTube Packaging studio.
- [x] **ClickHouse Extension Ready**: Structured schema with timestamps and cut-duration telemetry ready for OLAP ingestion.
