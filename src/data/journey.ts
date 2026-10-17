export interface Milestone {
  id: string;
  when: string;
  title: string;
  where: string;
  detail: string;
  kind: "education" | "experience" | "cert" | "hackathon";
  url?: string;
}

// The 3D spiral climbs in this order (education first, then credentials, then current work).
export const JOURNEY: Milestone[] = [
  { id: "vit", when: "2023 to 2027", title: "B.Tech CSE (AI & ML)", where: "VIT Bhopal", kind: "education",
    detail: "CGPA 8.40 / 10. Coursework: Machine Learning, Deep Learning, NLP, Computer Vision." },
  { id: "vityarthi", when: "Certificate", title: "Fundamentals of AI and ML", where: "Vityarthi", kind: "cert",
    detail: "Certification.", url: "https://www.linkedin.com/posts/ayushmaan-gupta-6b22a828a_aiml-certification-machinelearning-activity-7227958256701235200-CiQP" },
  { id: "bah", when: "2025", title: "Bharatiya Antariksh Hackathon", where: "ISRO x Hack2skill", kind: "hackathon",
    detail: "Led development of an AI help bot (Neo4j knowledge graph, scraped ingestion) among 8,000+ teams nationally." },
  { id: "michigan", when: "Certificate", title: "Applied Machine Learning in Python", where: "University of Michigan", kind: "cert",
    detail: "Certification.", url: "https://www.linkedin.com/posts/ayushmaan-gupta-6b22a828a_im-happy-to-share-that-ive-obtained-a-new-activity-7405703246499246080-v_xH" },
  { id: "google", when: "Certificate", title: "Google IT Support Professional Certificate", where: "Google", kind: "cert",
    detail: "Certification.", url: "https://www.credly.com/badges/bd79887b-ee35-4ed4-8148-2bf65684b8ce/print" },
  { id: "aws", when: "Certificate", title: "AWS Certified AI Practitioner", where: "Amazon Web Services", kind: "cert",
    detail: "Certification.", url: "https://www.linkedin.com/posts/ayushmaan-gupta-6b22a828a_aws-awscertified-aipractitioner-ugcPost-7488583881537994753-stzo/" },
  { id: "mponline", when: "July 2026 to present", title: "Advanced Software Engineering and AI Foundation Program", where: "MPOnline", kind: "experience",
    detail: "Working on TutorHunt, a location-based student and tutor matching platform: wrote the Requirement Analysis document, designed a 10-table SQL Server schema, and took part in Agile sprint planning in a team of 7." },
];
