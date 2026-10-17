// Skills as a graph: the lines are "used together in a project", not decoration.
export const GROUPS = [
  { id: "lang", label: "Languages", color: "#f2b95a" },
  { id: "ml", label: "ML and deep learning", color: "#6fd3c4" },
  { id: "genai", label: "LLM and GenAI", color: "#e3a3d6" },
  { id: "agent", label: "Agentic AI", color: "#8fb4e8" },
  { id: "back", label: "Backend and deployment", color: "#f2b95a" },
  { id: "front", label: "Frontend and 3D", color: "#6fd3c4" },
  { id: "data", label: "Data and databases", color: "#e3a3d6" },
  { id: "tools", label: "Tools", color: "#8fb4e8" },
] as const;

export type GroupId = (typeof GROUPS)[number]["id"];

export const SKILLS: { id: string; group: GroupId }[] = [
  { id: "Python", group: "lang" }, { id: "SQL", group: "lang" }, { id: "C++", group: "lang" }, { id: "JavaScript", group: "lang" },
  { id: "TypeScript", group: "lang" }, { id: "Java", group: "lang" }, { id: "C#", group: "lang" },
  { id: "Scikit-learn", group: "ml" }, { id: "XGBoost", group: "ml" }, { id: "PyTorch", group: "ml" }, { id: "TensorFlow", group: "ml" },
  { id: "OpenCV", group: "ml" }, { id: "LSTM", group: "ml" }, { id: "Time-series", group: "ml" }, { id: "MediaPipe", group: "ml" },
  { id: "Gemini API", group: "genai" }, { id: "RAG", group: "genai" }, { id: "Embeddings", group: "genai" }, { id: "Prompt engineering", group: "genai" },
  { id: "QLoRA", group: "genai" },
  { id: "LangGraph", group: "agent" }, { id: "LangChain", group: "agent" }, { id: "Multi-agent", group: "agent" }, { id: "Function calling", group: "agent" },
  { id: "FastAPI", group: "back" }, { id: "REST APIs", group: "back" }, { id: "Docker", group: "back" }, { id: "ASP.NET Core", group: "back" },
  { id: "React", group: "front" }, { id: "Next.js", group: "front" }, { id: "Three.js", group: "front" },
  { id: "PostgreSQL", group: "data" }, { id: "pgvector", group: "data" }, { id: "ChromaDB", group: "data" }, { id: "Neo4j", group: "data" },
  { id: "Pandas", group: "data" }, { id: "NumPy", group: "data" }, { id: "Matplotlib", group: "data" },
  { id: "Git", group: "tools" }, { id: "GitHub", group: "tools" }, { id: "pytest", group: "tools" },
];

export const LINKS: [string, string][] = [
  ["LangGraph", "LangChain"], ["LangGraph", "Multi-agent"], ["LangGraph", "Function calling"], ["LangGraph", "Gemini API"],
  ["Gemini API", "RAG"], ["RAG", "ChromaDB"], ["RAG", "Embeddings"], ["Embeddings", "pgvector"], ["pgvector", "PostgreSQL"],
  ["Gemini API", "Prompt engineering"], ["QLoRA", "PyTorch"], ["LangGraph", "FastAPI"], ["FastAPI", "Docker"], ["FastAPI", "REST APIs"],
  ["FastAPI", "PostgreSQL"], ["Python", "FastAPI"], ["Python", "Scikit-learn"], ["Python", "PyTorch"], ["Scikit-learn", "XGBoost"],
  ["XGBoost", "Neo4j"], ["LSTM", "Time-series"], ["LSTM", "TensorFlow"], ["Time-series", "Scikit-learn"], ["OpenCV", "MediaPipe"],
  ["Python", "OpenCV"], ["Pandas", "NumPy"], ["Pandas", "Matplotlib"], ["Python", "Pandas"], ["React", "Three.js"], ["React", "Next.js"],
  ["Next.js", "FastAPI"], ["TypeScript", "React"], ["JavaScript", "React"], ["C#", "ASP.NET Core"], ["SQL", "PostgreSQL"],
  ["Git", "GitHub"], ["pytest", "Python"], ["pytest", "FastAPI"], ["Java", "SQL"], ["C++", "SQL"],
];
