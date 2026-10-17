// Everything on the page comes from here: the two resumes (the newer one for projects, the older one for the
// MPOnline programme and the Deep Research Agent) and the TrustMesh project log. No phone number is published.

export const PROFILE = {
  name: "Ayushmaan Gupta",
  role: "AI engineer in training",
  line: "I build AI systems, then try to break them honestly.",
  school: "Vellore Institute of Technology, Bhopal",
  degree: "B.Tech. Computer Science and Engineering (AI & Machine Learning)",
  years: "2023 to 2027",
  cgpa: "8.40 / 10",
  coursework: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision"],
  github: "https://github.com/ACUTE02",
  linkedin: "https://www.linkedin.com/in/ayushmaan-gupta-6b22a828a/",
  email: "ayushmaangupta225@gmail.com",
  resume: "https://drive.google.com/file/d/1dxgV9srfLW7HasC4_ou7HTHU617CadIp/view?usp=sharing",
  githubUser: "ACUTE02",
};

export interface Project {
  id: string;
  title: string;
  status: string;
  summary: string;
  bullets: string[];
  stack: string[];
  repo: string | null; // null = not public (yet)
  repoName: string | null; // used to find the live repository on GitHub
  figure: { value: string; label: string };
}

export const PROJECTS: Project[] = [
  {
    id: "trustmesh",
    title: "TrustMesh",
    status: "Portfolio research project, runs locally",
    summary: "Two fraud detectors on two public datasets, and the evidence for how far to trust each one.",
    bullets: [
      "Graph engine: on a time split, XGBoost with four graph statistics scored 0.7482 PR-AUC and beat every graph neural network tried (best 0.5913). A random split would have hidden that: the same GraphSAGE scored 0.7730 random against 0.5115 by time.",
      "Voice engine: a model that looked too good (EER 0.0097) was reading leading silence; trimmed it scored 0.2380. A frozen wav2vec2 encoder with a small head reached EER 0.0166 and held up on attacks it never saw.",
      "Serving: FastAPI, Neo4j, SQLite and a React and Three.js site in Docker. Limits are stated first: not validated on real phone calls, the combined score has no measured accuracy, the Visual Engine is designed and not built.",
    ],
    stack: ["Python", "XGBoost", "PyTorch Geometric", "wav2vec2", "FastAPI", "Neo4j", "React", "Three.js", "Docker"],
    repo: "https://github.com/ACUTE02/Trust_Mesh",
    repoName: "Trust_Mesh",
    figure: { value: "0.7482", label: "PR-AUC, time split" },
  },
  {
    id: "climate",
    title: "Multi-Agent Climate Risk Analyst",
    status: "Shipped",
    summary: "A six-agent system on a LangGraph state machine that forecasts drought and checks its own claims.",
    bullets: [
      "LLM function calling for tool routing, a deterministic fallback router and a self-correction retry loop; served by FastAPI and Dockerized.",
      "Leak-free SPI-3 drought forecasting over 45 years of data. Ridge beat an LSTM and shipped on a measured skill score of +0.21 to +0.26, replicated across 4 validation windows.",
      "RAG over a 224-chunk corpus with ChromaDB and Gemini embeddings: precision@5 = 1.0 and MRR = 1.0 on a 12-query set.",
      "A non-LLM grounding guardrail verifies every generated figure (precision 1.0, recall 0.93, F1 0.96) and caught a real fabrication. 300+ tests.",
    ],
    stack: ["LangGraph", "LangChain", "Gemini API", "ChromaDB", "Scikit-learn", "FastAPI", "Docker", "pytest"],
    repo: "https://github.com/ACUTE02/Muti-Agent-Climate-Risk-Analyst",
    repoName: "Muti-Agent-Climate-Risk-Analyst",
    figure: { value: "+0.21 to +0.26", label: "forecast skill, 1-month lead" },
  },
  {
    id: "slm",
    title: "Climate-Domain SLM",
    status: "Currently building",
    summary: "Fine-tuning an open-weight model on a climate question-answer set, then measuring what it costs to serve.",
    bullets: [
      "QLoRA fine-tuning with HuggingFace Transformers and PEFT over a domain dataset derived from a curated technical corpus.",
      "DPO preference alignment with TRL; runs, hyperparameters and metrics tracked in MLflow.",
      "vLLM inference behind FastAPI to benchmark latency, throughput and token cost against the base model.",
    ],
    stack: ["Transformers", "PEFT", "QLoRA", "TRL", "MLflow", "vLLM", "FastAPI"],
    repo: "https://github.com/ACUTE02/Climate-Domain-SLM-project",
    repoName: "Climate-Domain-SLM-project",
    figure: { value: "in progress", label: "no results claimed yet" },
  },
  {
    id: "adaptive",
    title: "Adaptive AI Learning Platform",
    status: "Built",
    summary: "An AI layer for a learning platform: it adapts difficulty and decides what a student is about to forget.",
    bullets: [
      "LLM-driven curriculum generation and a Socratic tutor with topic-boundary guardrails and an anti-cheat remediation pipeline.",
      "Semantic retrieval on PostgreSQL and pgvector: 512-token contextual chunks with 50-token overlap, 768-dimension embeddings, async embedding workers.",
      "A Dynamic Difficulty Adjustment engine and a nightly APScheduler job that computes retention probability from assessment history.",
    ],
    stack: ["FastAPI", "LangChain", "Gemini", "PostgreSQL", "pgvector", "SQLModel", "Alembic", "APScheduler"],
    repo: "https://github.com/ACUTE02/adaptive-learning-platform",
    repoName: "adaptive-learning-platform",
    figure: { value: "768-d", label: "embeddings, pgvector" },
  },
  {
    id: "research",
    title: "Deep Research Agent",
    status: "Built",
    summary: "A multi-agent pipeline that searches, reads, writes a report and then scores its own work.",
    bullets: [
      "LangChain and Gemini agents search, synthesise and self-critique structured reports.",
      "Tavily for web search and BeautifulSoup for clean article text, with network timeouts handled.",
      "A Streamlit front end with live step tracking and an evaluation score ring.",
    ],
    stack: ["LangChain", "Gemini API", "Tavily", "BeautifulSoup", "Streamlit"],
    repo: "https://github.com/ACUTE02/Muti-Agent-AI-Research",
    repoName: "Muti-Agent-AI-Research",
    figure: { value: "self-critique", label: "second pass scores the report" },
  },
  {
    id: "face",
    title: "Facial Recognition Attendance System",
    status: "Built",
    summary: "Face detection and recognition that marks attendance and writes subject-wise reports.",
    bullets: [
      "OpenCV Haar Cascades for detection and an LBPH model for recognition.",
      "Time-stamped logging and subject-wise attendance reports through a Tkinter dashboard.",
    ],
    stack: ["Python", "OpenCV", "NumPy", "Pandas", "Tkinter"],
    repo: "https://github.com/ACUTE02/Facial-Recognition-Attendance-System",
    repoName: "Facial-Recognition-Attendance-System",
    figure: { value: "LBPH", label: "recognition model" },
  },
];

export const SKILLS: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "SQL", "C++"] },
  { group: "ML and deep learning", items: ["Scikit-learn", "XGBoost", "PyTorch", "TensorFlow", "OpenCV", "LSTM", "Time-series forecasting"] },
  { group: "LLM and GenAI", items: ["Gemini API", "RAG pipelines", "Prompt engineering", "Embedding models", "Chunking", "NLP"] },
  { group: "Agentic AI", items: ["LangGraph", "LangChain", "Multi-agent systems", "Function calling", "Tool use", "Self-correction"] },
  { group: "Backend and deployment", items: ["FastAPI", "REST APIs", "Docker"] },
  { group: "Data and visualisation", items: ["Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn"] },
  { group: "Databases", items: ["PostgreSQL", "ChromaDB", "pgvector", "Neo4j"] },
  { group: "Tools", items: ["Git", "GitHub"] },
];

export const EXPERIENCE = {
  org: "MPOnline",
  program: "Advanced Software Engineering and AI Foundation Program",
  when: "July 2026 to present",
  kind: "Certification programme",
  bullets: [
    "Working on TutorHunt, a location-based student and tutor matching platform.",
    "Wrote the Requirement Analysis document: functional and non-functional requirements.",
    "Designed a SQL Server DDL schema of 10 tables for matching, booking and location features.",
    "Part of a 7-member team; contributed to Agile sprint planning across development phases.",
  ],
};

export const CERTS: { name: string; by: string; url: string }[] = [
  { name: "AWS Certified AI Practitioner", by: "Amazon Web Services", url: "https://www.linkedin.com/posts/ayushmaan-gupta-6b22a828a_aws-awscertified-aipractitioner-ugcPost-7488583881537994753-stzo/" },
  { name: "Applied Machine Learning in Python", by: "University of Michigan", url: "https://www.linkedin.com/posts/ayushmaan-gupta-6b22a828a_im-happy-to-share-that-ive-obtained-a-new-activity-7405703246499246080-v_xH" },
  { name: "Fundamentals of AI and ML", by: "Vityarthi", url: "https://www.linkedin.com/posts/ayushmaan-gupta-6b22a828a_aiml-certification-machinelearning-activity-7227958256701235200-CiQP" },
  { name: "Google IT Support Professional Certificate", by: "Google", url: "https://www.credly.com/badges/bd79887b-ee35-4ed4-8148-2bf65684b8ce/print" },
];

// Used when the GitHub API cannot be reached (offline, rate limit): the repositories the resumes link to.
export const FALLBACK_REPOS = [
  { name: "Trust_Mesh", description: "Two fraud detectors on two public datasets, and the evidence for how far to trust each.", language: "Python" },
  { name: "Grow-Vyaapar", description: null as string | null, language: null as string | null },
  { name: "Voice-Command-Shopping-Assistant", description: null, language: null },
  { name: "Stock-Prediction-System", description: null, language: null },
  { name: "Muti-Agent-Climate-Risk-Analyst", description: "Six LangGraph agents for drought forecasting, RAG and a non-LLM grounding check.", language: "Python" },
  { name: "Climate-Domain-SLM-project", description: "QLoRA and DPO fine-tuning of an open-weight model on climate question answering.", language: "Python" },
  { name: "adaptive-learning-platform", description: "AI layer for a learning platform: difficulty adjustment, retention model, Socratic tutor.", language: "Python" },
  { name: "Muti-Agent-AI-Research", description: "Search, scrape, write and self-critique research agent.", language: "Python" },
  { name: "Facial-Recognition-Attendance-System", description: "OpenCV face recognition that logs attendance.", language: "Python" },
  { name: "LSTM_model_drought_", description: "LSTM drought forecasting.", language: "Python" },
  { name: "Data-Analysis-Visualization", description: "IPL data analysis and visualisation.", language: "Python" },
  { name: "Statistical-Hypothesis-Testing-and-Outlier-Detection", description: "Hypothesis testing and outlier detection.", language: "Python" },
].map((r) => ({ ...r, url: `https://github.com/ACUTE02/${r.name}`, stars: 0, updated: "", fork: false }));

export const CHAPTERS = [
  { id: "top", label: "Start" },
  { id: "path", label: "Path" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Work" },
  { id: "repos", label: "Repositories" },
  { id: "contact", label: "Contact" },
] as const;
