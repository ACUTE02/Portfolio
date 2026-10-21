export type MotifId =
  | "trustmesh" | "climate" | "adaptive" | "vyaapar" | "slm" | "research" | "voice" | "stock" | "face" | "posture" | "helpdesk";

export interface Project {
  slug: string;
  motif: MotifId;
  title: string;
  kind: string;
  status: string;
  summary: string;
  story: string[];
  stack: string[];
  repoName: string; // matched (ignoring punctuation) against the live GitHub list
  repo: string;
  live?: string;
  figure: { value: string; label: string };
  color: string; // accent for this project's object and panel
}

export const PROJECTS: Project[] = [
  {
    slug: "trustmesh", motif: "trustmesh", title: "TrustMesh", kind: "Fraud triage workbench", status: "Built, runs locally", color: "#f2b95a",
    summary: "A transaction-graph model and a voice-deepfake model in one workbench, explicit about how far each result can be trusted.",
    story: [
      "Graph engine: on a time split, XGBoost with four graph statistics scored 0.7482 PR-AUC and beat every graph neural network tried (best 0.5913). A random split would have hidden that: the same GraphSAGE scored 0.7730 random against 0.5115 by time.",
      "Voice engine: a model that looked too good (EER 0.0097) was reading leading silence; trimmed it scored 0.2380. A frozen wav2vec2 encoder with a 133,402-parameter head reached EER 0.0166 and held up on attacks it never saw.",
      "A codec-trained head reduced, but did not remove, the weakness on phone-compressed audio; it is an opt-in model and the default stays D.",
      "Limits are stated first: not validated on real phone calls, the combined score has no measured accuracy, the Visual Engine is designed and not built. 195 Python and 97 frontend tests; six 3D worlds on the site.",
    ],
    stack: ["Python", "XGBoost", "PyTorch", "wav2vec2", "FastAPI", "Neo4j", "React", "Three.js", "Docker"],
    repoName: "Trust_Mesh", repo: "https://github.com/ACUTE02/Trust_Mesh",
    figure: { value: "0.7482", label: "PR-AUC, time split" },
  },
  {
    slug: "climate-slm", motif: "slm", title: "Climate-Domain SLM", kind: "Small-model fine-tuning and serving", status: "Built, measured", color: "#8fb4e8",
    summary: "Qwen2.5 (0.5B and 1.5B) tuned to answer from a passage, or say it cannot, on Indian climate and disaster-management documents.",
    story: [
      "252 question-answer items built from 181 chunks of six Indian government documents (NDMA, IMD, ICAR, NIH Roorkee). Some questions are paired with a passage that does not hold the answer, and the model must reply with one exact refusal sentence. Split 156 / 53 / 43, checked by an independent LLM pass with evidence quotes and a human spot-check.",
      "LoRA SFT with Hugging Face Transformers and PEFT: a small grid over learning rate and LoRA against 4-bit QLoRA, three seeds for the winner, the checkpoint picked on validation by a rule written before the runs. The test split was used once per frozen model.",
      "Best model, 1.5B SFT: token F1 0.791 [0.688, 0.882], 0 of 32 false refusals and 11 of 11 correct refusals on test. Untuned, the 0.5B model got 0 of 11 refusals right and the 1.5B got 6. What tuning clearly adds is the refusal behaviour.",
      "DPO with a hand-written loss: v1 failed on validation (the models copied the passage instead of refusing) and never touched test. v2 added an NLL term and new pairs. Its gain over SFT sits inside overlapping intervals, so no claim is made that DPO beat SFT.",
      "Served with vLLM behind FastAPI (plus a plain transformers and a fake backend, micro-batching, no logging of the text). A parity check matched the evaluator on 52 to 53 of 53 prompts. On a free Colab T4, vLLM was about 3 to 4 times faster than plain transformers for the 0.5B models. Runs tracked in MLflow; 405 tests.",
    ],
    stack: ["Python", "Qwen2.5", "Transformers", "PEFT", "LoRA / QLoRA", "DPO", "vLLM", "FastAPI", "MLflow", "pytest"],
    repoName: "Climate-Domain-SLM-project", repo: "https://github.com/ACUTE02/Climate-Domain-SLM-project",
    figure: { value: "11 / 11", label: "correct refusals, 1.5B SFT (test)" },
  },
  {
    slug: "climate-risk-analyst", motif: "climate", title: "Multi-Agent Climate Risk Analyst", kind: "Agentic GenAI system", status: "Shipped", color: "#6fd3c4",
    summary: "Six LangGraph agents that forecast drought, retrieve evidence and check their own claims.",
    story: [
      "A six-agent system on a LangGraph state machine: LLM function calling for tool routing, a deterministic fallback router and a self-correction retry loop, served by FastAPI and Dockerized.",
      "Leak-free SPI-3 drought forecasting over 45 years of data. Ridge beat an LSTM and shipped on a measured skill score of +0.21 to +0.26, replicated across 4 validation windows, and is labelled \"no skill\" where it has none.",
      "RAG over a 224-chunk corpus with ChromaDB and Gemini embeddings: precision@5 = 1.0 and MRR = 1.0 on a 12-query set.",
      "A non-LLM grounding guardrail verifies every generated figure against tool outputs (precision 1.0, recall 0.93, F1 0.96) and caught a real fabrication. 300+ tests.",
    ],
    stack: ["LangGraph", "LangChain", "Gemini API", "ChromaDB", "Scikit-learn", "FastAPI", "Docker", "pytest"],
    repoName: "Muti-Agent-Climate-Risk-Analyst", repo: "https://github.com/ACUTE02/Muti-Agent-Climate-Risk-Analyst",
    figure: { value: "+0.21 to +0.26", label: "forecast skill vs climatology" },
  },
  {
    slug: "grow-vyaapar", motif: "vyaapar", title: "Grow Vyaapar", kind: "Retail platform with an agent that never sends", status: "Built", color: "#e3a3d6",
    summary: "Billing, inventory and customers for small Indian shops, with seven agents and two ML models that report their own limits.",
    story: [
      "One codebase for eight kinds of shop (grocery, pharmacy, apparel, optical, bakery, cosmetics, electronics, hardware) that differ only by rows in a config table; a test fails the build if a vertical name leaks into a service.",
      "Seven agents decide who to contact, what to promote and what runs out. They never send anything: delivery is always an explicit human action.",
      "Stock forecasts are served only where they beat a predict-the-mean baseline on held-out data; elsewhere the screen says so. The churn model's ROC-AUC sits under the project's own 0.75 target, and that is reported, not tuned away.",
      "POS with per-line GST and idempotent checkout, JWT auth with audit log, cross-tenant guards, FIFO batches. 406 tests passing.",
    ],
    stack: ["FastAPI", "Next.js", "React", "SQLAlchemy", "Alembic", "PostgreSQL", "scikit-learn", "Gemini API", "Docker"],
    repoName: "Grow-Vyaapar", repo: "https://github.com/ACUTE02/Grow-Vyaapar",
    figure: { value: "406", label: "passing tests" },
  },
  {
    slug: "adaptive-learning", motif: "adaptive", title: "Adaptive AI Learning Platform", kind: "Full-stack GenAI", status: "Built", color: "#8fb4e8",
    summary: "An AI layer for a learning platform that adapts difficulty and works out what a student is about to forget.",
    story: [
      "LLM-generated courses and assessments, and a Socratic AI tutor with topic-boundary guardrails and an anti-cheat remediation pipeline.",
      "Semantic retrieval on PostgreSQL and pgvector: 512-token contextual chunks with 50-token overlap, 768-dimension embeddings, async embedding workers.",
      "A Dynamic Difficulty Adjustment engine and a nightly APScheduler job that computes retention probability from assessment history (Ebbinghaus-style knowledge decay).",
    ],
    stack: ["FastAPI", "TypeScript", "LangChain", "Gemini", "PostgreSQL", "pgvector", "SQLModel", "Alembic", "APScheduler"],
    repoName: "adaptive-learning-platform", repo: "https://github.com/ACUTE02/adaptive-learning-platform",
    figure: { value: "768-d", label: "embeddings in pgvector" },
  },
  {
    slug: "deep-research-agent", motif: "research", title: "Deep Research Agent", kind: "Multi-agent research pipeline", status: "Built", color: "#6fd3c4",
    summary: "An agent that searches, reads, writes a report and then scores its own work.",
    story: [
      "LangChain and Gemini agents autonomously search, synthesise and self-critique structured reports.",
      "Tavily for advanced web search and BeautifulSoup for clean article text from multiple sources, with network timeouts handled.",
      "A Streamlit front end with real-time step tracking, custom CSS animations and an evaluation score ring.",
    ],
    stack: ["LangChain", "Gemini API", "Tavily", "BeautifulSoup", "Streamlit"],
    repoName: "Muti-Agent-AI-Research", repo: "https://github.com/ACUTE02/Muti-Agent-AI-Research",
    figure: { value: "self-critique", label: "second pass scores the report" },
  },
  {
    slug: "listenlist", motif: "voice", title: "ListenList", kind: "Voice-first shopping assistant", status: "Live demo", color: "#e3a3d6",
    summary: "Say \"find Dove soap under 100 rupees\" and the list, search and cart respond.",
    story: [
      "A React app driven by the browser's Web Speech API, with a complete text-command fallback when voice is unavailable.",
      "A deterministic command parser (regular expressions, quantity, unit, brand and price-range extraction) for five intents: add, remove, update quantity, search and unknown.",
      "Safe quantity handling: zero and negative quantities are rejected with feedback, spoken numbers and \"a dozen\" are understood, and categories come from the catalog or a whole-word keyword match so \"ham\" never misfiles \"shampoo\".",
    ],
    stack: ["React", "JavaScript", "Web Speech API", "Vercel"],
    repoName: "Voice-Command-Shopping-Assistant", repo: "https://github.com/ACUTE02/Voice-Command-Shopping-Assistant",
    live: "https://voice-shopping-assistant-orpin.vercel.app/",
    figure: { value: "5 intents", label: "parsed deterministically" },
  },
  {
    slug: "stock-prediction", motif: "stock", title: "Stock Price Prediction", kind: "Time-series ML", status: "Built", color: "#f2b95a",
    summary: "LSTM, XGBoost and an ensemble of the two, compared on stock price series.",
    story: [
      "An LSTM for sequential dependencies, XGBoost for regression-based forecasting, and an ensemble that combines both.",
      "Pandas and NumPy preprocessing, Matplotlib trend analysis, modular Python code.",
      "The README reports that the ensemble outperformed the single models; it publishes no numbers, so none are claimed here.",
    ],
    stack: ["Python", "TensorFlow", "XGBoost", "scikit-learn", "Pandas", "NumPy", "Matplotlib"],
    repoName: "Stock-Prediction-System", repo: "https://github.com/ACUTE02/Stock-Prediction-System",
    figure: { value: "LSTM + XGBoost", label: "ensemble" },
  },
  {
    slug: "face-attendance", motif: "face", title: "Facial Recognition Attendance", kind: "Computer vision", status: "Built", color: "#8fb4e8",
    summary: "Registers faces, recognises them live and writes the attendance down.",
    story: [
      "OpenCV Haar Cascades for face detection and an LBPH recognizer, trained on images captured through the app.",
      "A Tkinter dashboard for registration, time-stamped attendance, subject-wise reports and manual entry, with pyttsx3 spoken feedback.",
    ],
    stack: ["Python", "OpenCV", "NumPy", "Pandas", "Tkinter", "pyttsx3"],
    repoName: "Facial-Recognition-Attendance-System", repo: "https://github.com/ACUTE02/Facial-Recognition-Attendance-System",
    figure: { value: "LBPH", label: "recognition model" },
  },
  {
    slug: "posture-detection", motif: "posture", title: "Real-Time Posture Detection", kind: "Computer vision", status: "Built", color: "#6fd3c4",
    summary: "A webcam system that spots slouching, a forward head and uneven shoulders, and alerts on sustained poor posture.",
    story: [
      "MediaPipe Pose landmarks with rule-based logic over head-shoulder alignment, head displacement and shoulder symmetry; no training dataset needed.",
      "Issue-specific on-screen feedback and a time-based alert when poor posture is sustained.",
    ],
    stack: ["Python", "OpenCV", "MediaPipe", "NumPy"],
    repoName: "Computer-Vision-", repo: "https://github.com/ACUTE02/Computer-Vision-",
    figure: { value: "3 checks", label: "head, slouch, shoulders" },
  },
  {
    slug: "helpdesk", motif: "helpdesk", title: "HelpDesk Management", kind: "Layered web application", status: "Built", color: "#e3a3d6",
    summary: "A ticket system split into an API, an MVC front end and a test project.",
    story: [
      "ASP.NET Core Web API and MVC on Entity Framework Core and SQL Server, using the Repository Pattern and a service layer.",
      "Create, view, update, delete and filter tickets by status; Swagger documentation; async CRUD with dependency injection.",
      "xUnit tests with Moq so the controllers are tested without a database.",
    ],
    stack: ["C#", "ASP.NET Core", "Entity Framework Core", "SQL Server", "xUnit", "Moq"],
    repoName: "HelpDeskManagement", repo: "https://github.com/ACUTE02/HelpDeskManagement",
    figure: { value: "3 projects", label: "API, MVC, tests" },
  },
];

export const bySlug = (slug: string | undefined) => PROJECTS.find((p) => p.slug === slug);
