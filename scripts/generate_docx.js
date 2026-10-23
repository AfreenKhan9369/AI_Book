import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load docx from /tmp/node_modules
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageBreak,
  HeightRule,
  ShadingType,
} = await import("/tmp/node_modules/docx/build/index.js");

const students = [
  { sNo: "1", roll: "24116002068", name: "Afreen" },
  { sNo: "2", roll: "24116002145", name: "Arushi Uttam" },
  { sNo: "3", roll: "24116002137", name: "Aradhana" },
];

const weeklyData = [
  {
    week: 1,
    date: "10/07/2026",
    done: "Formed the project group with Afreen, Arushi Uttam, and Aradhana under the Department of Computer Applications. Conducted an initial brainstorming session and literature review regarding academic note-sharing challenges faced by college students (fragmented WhatsApp groups, unindexed Google Drive folders, and scattered photocopies). Evaluated foundational problem statements in the EdTech domain.",
    next: "Perform detailed requirement analysis, identify key user personas (students, subject faculty, and system administrators), and formulate preliminary system objectives for the project proposal.",
    comments: "Good initiative and relevant problem selection. Ensure the project emphasizes academic authenticity, structured note categorization, and responsible AI assistance.",
  },
  {
    week: 2,
    date: "17/07/2026",
    done: "Conducted technical feasibility analysis for web deployment and AI integration. Researched and finalized the proposed technology stack: React 19, TypeScript, and Tailwind CSS for the frontend; Node.js and Express.js for the REST API backend; PostgreSQL/MySQL for relational database persistence; and Google Gemini API (via @google/genai) for AI summarization and quiz generation. Drafted high-level system scope.",
    next: "Finalize the official project title, prepare formal group registration documentation, and create initial application architectural block diagrams for supervisor submission.",
    comments: "Technology stack is modern and feasible for BCA final-year scope. Ensure API rate limits, secure credential handling, and database schemas are thoroughly planned.",
  },
  {
    week: 3,
    date: "24/07/2026",
    done: "Achieved Project Milestone: Formally submitted and received approval for the Project Title: 'AI_Book – Digital Notes Sharing System'. Allocated supervisor: Mrs. Priti Mishra, Assistant Professor. Established functional modular breakdown: 1) Authentication & User Management, 2) Notes Upload & Catalog Management, 3) Search & Multi-Page PDF Viewer, 4) AI Note Summarization, 5) AI Question-Answering Doubt Solver, and 6) AI Topic-Wise Quiz Generation.",
    next: "Draft the comprehensive Software Requirements Specification (SRS), finalize functional and non-functional requirements, and begin UML use-case diagram modeling.",
    comments: "Project title and modular structure approved. Ensure UML diagrams clearly demarcate permissions between Student and Faculty/Admin roles.",
  },
  {
    week: 4,
    date: "31/07/2026",
    done: "Prepared the formal Software Requirements Specification (SRS) document according to IEEE standards. Designed UML Use Case Diagrams, Class Diagrams, and Data Flow Diagrams (DFD Level 0 and Level 1). Designed the relational database schema comprising tables for 'users', 'subjects', 'materials', 'bookmarks', and 'quiz_history' with foreign key relationships and index optimizations.",
    next: "Draft the formal Project Synopsis document as per the PSIT College of Higher Education prescribed template for submission to the Departmental Project Committee (DPC).",
    comments: "Database schema and DFD diagrams are sound. Incorporate password hashing (bcrypt) and JWT token expiration policies explicitly into the specification.",
  },
  {
    week: 5,
    date: "07/08/2026",
    done: "Drafted the complete Project Synopsis including Abstract, Introduction, Objectives, Scope, System Hardware & Software Requirements, Detailed Module Descriptions, High-Level Architecture, and Reference Literature. Reviewed document formatting against BCA 5th Semester guidelines (Times New Roman, 1.5 line spacing, 300-500 words abstract).",
    next: "Complete final proofreading of the synopsis, obtain supervisor review and signature, and submit the proposal to the DPC prior to the 14th August deadline.",
    comments: "Synopsis is well written and comprehensive. Objectives align well with Course Outcomes (CO1 and CO2). Approved for formal submission.",
  },
  {
    week: 6,
    date: "14/08/2026",
    done: "Achieved Project Milestone: Formally submitted the signed Project Synopsis and Proposal to the Departmental Project Committee (DPC). Set up the team collaborative development environment: initialized Git repository on GitHub with branch protection rules, configured Node.js (v20+ LTS) Express server environment, and scaffolded the React 19 + Vite frontend project with Tailwind CSS.",
    next: "Commence backend development for Module 1 (Authentication & User Management). Implement database connection pooling and user schema migrations.",
    comments: "Proposal submission recorded. Maintain clean Git commit histories and adhere strictly to professional coding conventions across the repository.",
  },
  {
    week: 7,
    date: "21/08/2026",
    done: "Developed backend REST API endpoints for user authentication: POST /api/auth/register, POST /api/auth/login, and GET /api/auth/me. Integrated bcrypt.js for cryptographic password hashing (salt rounds: 10) and jsonwebtoken (JWT) for stateless authentication. Implemented authentication middleware (authenticateToken) to enforce role-based access control (Student vs Faculty/Admin). Tested endpoints using Postman.",
    next: "Develop frontend authentication interfaces (Login and Registration forms) with interactive role selection, validation, and JWT storage in browser local storage.",
    comments: "Auth API endpoints tested successfully. Ensure input validation prevents SQL injection and malformed email inputs.",
  },
  {
    week: 8,
    date: "28/08/2026",
    done: "Developed the frontend authentication layer: responsive Login and Register pages using Tailwind CSS; built React AuthContext to manage global session state, tokens, and active user profile; implemented ProtectedRoute components to restrict access based on user credentials. Added demo 1-click login presets for seamless evaluation.",
    next: "Design and implement the Faculty Studio Dashboard and the Multer-based PDF file upload pipeline for course lecture notes and Previous Year Question Papers (PYQs).",
    comments: "User interface is intuitive and clean. Proceed with file upload handling, ensuring proper MIME-type verification and maximum file size restrictions.",
  },
  {
    week: 9,
    date: "04/09/2026",
    done: "Developed the Notes Upload & Management Module. Configured Multer disk storage middleware for handling multipart/form-data. Implemented file validation ensuring only valid PDF documents under 15MB are accepted. Implemented POST /api/materials/upload with metadata extraction (academic year, semester 1-8, branch, module unit, file size). Built the Faculty Studio dashboard table allowing faculty to view and delete uploaded materials.",
    next: "Build the Student Notes Catalog interface with multi-level filtering by semester, branch, subject, and search keywords, alongside the PDF viewer.",
    comments: "Upload pipeline functions smoothly. Ensure uploaded files are stored with sanitized, unique filenames to prevent accidental file overwrites.",
  },
  {
    week: 10,
    date: "11/09/2026",
    done: "Developed the Student Notes Catalog (NotesCatalog.tsx) and Exam Archive (PyqCatalog.tsx). Implemented multi-parameter filtering (by semester, engineering branch, subject code, and title search). Integrated an in-browser responsive PDF reader with full-screen and page navigation controls. Added real-time view and download counters. Prepared presentation slides for Progress Evaluation 1 (CT-I).",
    next: "Present Phase 1 progress at the CT-I Evaluation session before the DPC panel. Demonstrate authentication, faculty uploads, and student catalog search.",
    comments: "Excellent UI polish and catalog organization. Prepare to defend architectural decisions and system design during the upcoming CT-I review.",
  },
  {
    week: 11,
    date: "18/09/2026",
    done: "Achieved Project Milestone: Successfully defended Progress Evaluation 1 (CT-I) before the DPC Evaluator Panel. Demonstrated live system workflows: student/faculty authentication, curriculum syllabus management, note uploads by professors, and real-time catalog search. Evaluators approved Phase 1 and provided recommendations for Phase 2 AI features.",
    next: "Integrate Google AI Studio (@google/genai SDK) and implement server-side PDF text extraction pipeline using pdf-parse for AI summarization.",
    comments: "Commendable performance in CT-I presentation. The committee approved the roadmap. Proceed immediately with Google Gemini API integration.",
  },
  {
    week: 12,
    date: "25/09/2026",
    done: "Integrated Google AI Studio using the official @google/genai SDK (Gemini 2.5/3.8 Flash model). Built backend text extraction utility using pdf-parse to parse text streams from uploaded PDF notes. Developed the AI Note Summarization API (POST /api/ai/summarize). Formulated academic system prompts to generate high-yield revision flashcards, key definitions, and core formulas with structured markdown formatting.",
    next: "Develop the Interactive AI Doubt Solver / Q&A chat module, allowing students to ask specific academic questions on any course subject.",
    comments: "AI summary quality is high and concise. Ensure proper error handling and fallback responses are active in case of external API rate limits.",
  },
  {
    week: 13,
    date: "02/10/2026",
    done: "Developed the Interactive AI Concept Solver & Q&A Assistant (POST /api/ai/ask). Implemented persona-guided prompt engineering to ensure responses strictly adhere to college syllabus standards. Built interactive frontend chat interface with subject-context selector, message history, clear-chat functionality, and formatted code/math blocks. Implemented student personal bookmarking system for study materials.",
    next: "Develop the AI Mock Quiz Generation module to auto-generate topic-wise multiple-choice questions with answer verification and explanations.",
    comments: "Q&A module answers technical questions accurately with academic focus. Ensure quiz generation produces valid, balanced difficulty questions.",
  },
  {
    week: 14,
    date: "09/10/2026",
    done: "Implemented the AI Quiz Generation Module (POST /api/ai/quiz). Configured prompt rules to generate structured JSON output containing 5 multiple-choice questions, 4 options each, correct answer indices, and faculty explanations. Built frontend interactive quiz interface with timer, option selection, instantaneous feedback, score calculation, canvas-confetti celebration animation, and quiz history recording in the database.",
    next: "Prepare for Progress Evaluation 2 (CT-II). Conduct comprehensive integration testing across all modules and prepare demonstration slides.",
    comments: "Quiz generator is an impressive, engaging learning feature. Test edge cases where notes contain diagrams or non-text elements.",
  },
  {
    week: 15,
    date: "16/10/2026",
    done: "Achieved Project Milestone: Successfully presented Progress Evaluation 2 (CT-II) before DPC Evaluators. Delivered an end-to-end live demonstration featuring note uploads, PDF viewing, AI summarization, doubt solving, and live quiz taking. Evaluator panel appreciated the real-time AI capabilities, responsive interface, and zero-latency performance.",
    next: "Conduct rigorous system testing: unit testing, security auditing, cross-device responsiveness verification, and performance profiling.",
    comments: "CT-II review completed with outstanding remarks. Focus on comprehensive testing, bug resolution, and final project documentation.",
  },
  {
    week: 16,
    date: "23/10/2026",
    done: "Executed comprehensive system testing: 1) Functional testing across all user workflows, 2) Security testing (JWT expiration, unauthorized access prevention, SQL injection safety, password hashing verification), 3) Cross-browser compatibility testing (Chrome, Firefox, Safari, Edge), and 4) Mobile/tablet responsiveness audit. Fixed minor CSS alignment issues on mobile viewports. Compiled complete test case reports.",
    next: "Finalize Project Diary, compile final Minor Project Report, complete code documentation, and prepare for final End-Semester Pre-University (PU) evaluation.",
    comments: "Testing results are comprehensive and satisfactory. Compile the project diary entries and verify all departmental signatures.",
  },
  {
    week: 17,
    date: "30/10/2026",
    done: "Achieved Project Milestone: Successfully completed End-Semester Minor Project Work Submission & Final Pre-University (PU) Evaluation. Presented the complete working AI_Book platform, project source code, test cases, and final documentation to supervisor Mrs. Priti Mishra and the Departmental Committee. Achieved all designated Course Outcomes (CO1-CO4) with highest academic standards.",
    next: "Prepare for final University Viva-Voce examination and semester-end practical presentation under C.S.J.M. University guidelines.",
    comments: "Outstanding project execution throughout the 17-week semester. The team displayed remarkable technical competence, dedication, and teamwork. Recommended for highest grade (A+).",
  },
];

// Reusable styling helpers
const BORDER_NONE = {
  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
};

const BORDER_SINGLE = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "4B5563" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "4B5563" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "4B5563" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "4B5563" },
};

function createHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "PSIT-College of Higher Education",
            bold: true,
            size: 22,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Kanpur-Delhi National Highway (NH-19), Bhauti, Kanpur-209305 (U.P.), India",
            size: 18,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Affiliated to Chhatrapati Shahu Ji Maharaj (C.S.J.M.) University, Kanpur",
            italics: true,
            size: 16,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "_________________________________________________________________________________",
            size: 14,
            font: "Times New Roman",
            color: "9CA3AF",
          }),
        ],
      }),
    ],
  });
}

function createFooter() {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: "_________________________________________________________________________________",
            size: 14,
            font: "Times New Roman",
            color: "9CA3AF",
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: BORDER_NONE,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: BORDER_NONE,
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Department of Computer Applications",
                        size: 18,
                        font: "Times New Roman",
                        italics: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                borders: BORDER_NONE,
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: "Minor Project 2026-27 (BCA-5005)",
                        size: 18,
                        font: "Times New Roman",
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Build sections
const docChildren = [];

// ==========================================
// PAGE 1: COVER PAGE
// ==========================================
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: "PSIT-College of Higher Education",
        bold: true,
        size: 32,
        font: "Times New Roman",
        color: "1E3A8A",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [
      new TextRun({
        text: "Kanpur-Delhi National Highway (NH-19), Bhauti, Kanpur-209305 (U.P.), India",
        size: 20,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [
      new TextRun({
        text: "DEPARTMENT OF COMPUTER APPLICATIONS",
        bold: true,
        size: 26,
        font: "Times New Roman",
        color: "111827",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: "Minor Project",
        bold: true,
        size: 24,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [
      new TextRun({
        text: "(2026-2027)",
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: "PROGRESS DIARY",
        bold: true,
        size: 30,
        font: "Times New Roman",
        underline: {},
        color: "1E3A8A",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [
      new TextRun({
        text: "(BCA-5005)",
        bold: true,
        size: 24,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 500 },
    children: [
      new TextRun({
        text: "AI_Book – Digital Notes Sharing System",
        bold: true,
        size: 28,
        font: "Times New Roman",
        color: "1E40AF",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: "Submitted By:",
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [
      new TextRun({
        text: "Afreen (Roll No: 24116002068)",
        size: 22,
        font: "Times New Roman",
        bold: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [
      new TextRun({
        text: "Arushi Uttam (Roll No: 24116002145)",
        size: 22,
        font: "Times New Roman",
        bold: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [
      new TextRun({
        text: "Aradhana (Roll No: 24116002137)",
        size: 22,
        font: "Times New Roman",
        bold: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: "Project_Id: BCA-5005-P04",
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 60 },
    children: [
      new TextRun({
        text: "Under the Supervision of:",
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [
      new TextRun({
        text: "Mrs. Priti Mishra",
        bold: true,
        size: 24,
        font: "Times New Roman",
        color: "1E3A8A",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [
      new TextRun({
        text: "Assistant Professor",
        size: 22,
        font: "Times New Roman",
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300 },
    children: [
      new TextRun({
        text: "PSIT College of Higher Education, Kanpur",
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==========================================
// PAGE 2: VISION, MISSION, PEOs, POs (PART 1)
// ==========================================
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 200 },
    children: [
      new TextRun({
        text: "Department Vision Statement",
        bold: true,
        size: 26,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 300 },
    children: [
      new TextRun({
        text: "To be a recognized department of Computer Application that produces versatile computer professional with the ability to adapt to the changing needs of computer and related Industry.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 200 },
    children: [
      new TextRun({
        text: "Department Mission Statements",
        bold: true,
        size: 26,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: "The mission of the Department of Computer Applications is:",
        size: 22,
        font: "Times New Roman",
        bold: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: "1. To provide broad based quality education with knowledge and attitude to succeed in Computer Application career.\n" +
              "2. To prepare students for emerging trends in Computer and related industry.\n" +
              "3. To develop competence in students by providing them skills and aptitude to foster culture of continuous and lifelong learning.\n" +
              "4. To develop practicing professionals who investigate, design and find workable solution to the related complex problems with awareness and concern for society and environment.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [
      new TextRun({
        text: "Program Educational Objectives (PEOs)",
        bold: true,
        size: 26,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "PEO-1: ", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({
        text: "Graduates will be efficient leading professionals with the knowledge of computer application discipline that enables them to pursue higher education and/or successful careers in national and global realms.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "PEO-2: ", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({
        text: "Graduates will possess the capability of designing successful and sustainable innovative solutions to real life problems that are technically sound, economically viable and socially acceptable.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "PEO-3: ", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({
        text: "Graduates will be competent team leaders, effective communicators and capable of working in multidisciplinary teams following ethical values.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "PEO-4: ", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({
        text: "Graduates will be capable of adapting to new technologies/tools, constantly upgrading their knowledge and skills with an attitude for life-long learning.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 200 },
    children: [
      new TextRun({ text: "PEO-5: ", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({
        text: "Graduates with an aptitude of self-employment will be able to initiate and build upon entrepreneurial ventures or demonstrate enterprising expertise for their employer organization.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 150 },
    children: [
      new TextRun({
        text: "Department Program Outcomes (POs)",
        bold: true,
        size: 26,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 150 },
    children: [
      new TextRun({
        text: "The students of Computer Application Department will be able to achieve the following outcomes:",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_SINGLE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "PO1", bold: true, size: 22, font: "Times New Roman" })],
              }),
            ],
          }),
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 85, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: "Computer Application Knowledge: Apply the knowledge of mathematics, social science, fundamentals of computer application, and management to the solution of complex problems.",
                    size: 21,
                    font: "Times New Roman",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==========================================
// PAGE 3: POs (PO2 to PO10)
// ==========================================
const poList = [
  { code: "PO2", text: "Problem Analysis: Identify, formulate, review research literature, and analyse complex problems reaching substantiated conclusions using basic principles." },
  { code: "PO3", text: "Design/Development of Solutions: Design solutions for complex computer application problems and design system processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations." },
  { code: "PO4", text: "Conduct Investigations of Complex Problems: Use research-based knowledge and research methods including design of experiments, including analysis and interpretation of data, and synthesis of information to provide valid conclusions for complex problems that cannot be solved by straightforward application of knowledge, that may not have a unique solution, and that require consideration of appropriate constraints." },
  { code: "PO5", text: "Modern Tool Usage: Create, select, and apply appropriate techniques, resources, and modern Computer Application and IT tools including prediction and modelling to complex Computer Application activities with an understanding of the limitations." },
  { code: "PO6", text: "The Computer Professionals and Society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional computer application practice." },
  { code: "PO7", text: "Environment and Sustainability: Understand the impact of the professional computer application solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development." },
  { code: "PO8", text: "Ethics: Apply ethical principles and commit to professional ethics and responsibilities and norms of the computer application practice." },
  { code: "PO9", text: "Individual and Teamwork: Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings." },
  { code: "PO10", text: "Communication: Communicate effectively on complex Computer Application activities with the community and with society at large, such as, being able to comprehend and write effective reports and design/maintain documentation, make effective presentations, and give and receive clear instructions." },
];

docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 150 },
    children: [
      new TextRun({
        text: "Department Program Outcomes (POs) - Continued",
        bold: true,
        size: 24,
        font: "Times New Roman",
      }),
    ],
  }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_SINGLE,
    rows: poList.map(
      (po) =>
        new TableRow({
          children: [
            new TableCell({
              borders: BORDER_SINGLE,
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: po.code, bold: true, size: 21, font: "Times New Roman" })],
                }),
              ],
            }),
            new TableCell({
              borders: BORDER_SINGLE,
              width: { size: 85, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.JUSTIFIED,
                  children: [new TextRun({ text: po.text, size: 21, font: "Times New Roman" })],
                }),
              ],
            }),
          ],
        })
    ),
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==========================================
// PAGE 4: PO11, PO12, COs & CO-PO MAPPING
// ==========================================
docChildren.push(
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_SINGLE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "PO11", bold: true, size: 21, font: "Times New Roman" })],
              }),
            ],
          }),
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 85, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: "Project Management and Finance: Demonstrate knowledge and understanding of the computer application and management principles and apply these to one's own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.",
                    size: 21,
                    font: "Times New Roman",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "PO12", bold: true, size: 21, font: "Times New Roman" })],
              }),
            ],
          }),
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 85, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: "Life-long Learning: Recognize the need for and have the preparation and ability to engage in independent and lifelong learning in the broadest context of technological change.",
                    size: 21,
                    font: "Times New Roman",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 250, after: 150 },
    children: [
      new TextRun({
        text: "Course Outcomes (COs)",
        bold: true,
        size: 24,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: "On successful completion of this Minor Project course (BCA-5005), students will be able to:",
        size: 21,
        font: "Times New Roman",
      }),
    ],
  }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_SINGLE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "S No", bold: true, size: 21, font: "Times New Roman" })] })],
          }),
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 85, type: WidthType.PERCENTAGE },
            shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: "Course Outcome", bold: true, size: 21, font: "Times New Roman" })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CO1", bold: true, size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Identify [L1: Remember] and finalize the problem statement by surveying a variety of domains.", size: 21, font: "Times New Roman" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CO2", bold: true, size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Specify [L2: Understand] the design methodologies appropriate to solve the problem.", size: 21, font: "Times New Roman" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CO3", bold: true, size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Apply [L3: Apply] appropriate tools and techniques, resources to implement design exhibiting integrity and ethical behaviour of engineering practices.", size: 21, font: "Times New Roman" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CO4", bold: true, size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Test and defend [L4: Analyse] their work along with their team members through reports and presentations.", size: 21, font: "Times New Roman" })] })] }),
        ],
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 250, after: 150 },
    children: [
      new TextRun({
        text: "CO-PO/PSO Mapping",
        bold: true,
        size: 24,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_SINGLE,
    rows: [
      new TableRow({
        children: ["CO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12"].map(
          (h) =>
            new TableCell({
              borders: BORDER_SINGLE,
              shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 18, font: "Times New Roman" })] })],
            })
        ),
      }),
      new TableRow({
        children: ["CO1", "3", "-", "-", "-", "-", "3", "3", "3", "3", "-", "3", "3"].map(
          (v) => new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: v, size: 18, font: "Times New Roman" })] })] })
        ),
      }),
      new TableRow({
        children: ["CO2", "-", "3", "-", "2", "-", "3", "-", "3", "3", "-", "3", "-"].map(
          (v) => new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: v, size: 18, font: "Times New Roman" })] })] })
        ),
      }),
      new TableRow({
        children: ["CO3", "-", "-", "3", "2", "3", "-", "-", "3", "3", "-", "3", "3"].map(
          (v) => new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: v, size: 18, font: "Times New Roman" })] })] })
        ),
      }),
      new TableRow({
        children: ["CO4", "-", "-", "-", "-", "-", "-", "-", "3", "3", "3", "3", "-"].map(
          (v) => new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: v, size: 18, font: "Times New Roman" })] })] })
        ),
      }),
      new TableRow({
        children: ["Avg", "3", "3", "3", "2", "3", "3", "3", "3", "3", "3", "3", "3"].map(
          (v) =>
            new TableCell({
              borders: BORDER_SINGLE,
              shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: v, bold: true, size: 18, font: "Times New Roman" })] })],
            })
        ),
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==========================================
// PAGE 5: INNER TITLE PAGE
// ==========================================
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 150 },
    children: [
      new TextRun({
        text: "AI_Book – Digital Notes Sharing System",
        bold: true,
        size: 32,
        font: "Times New Roman",
        color: "1E40AF",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 150 },
    children: [new TextRun({ text: "A", size: 24, font: "Times New Roman" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 150 },
    children: [
      new TextRun({
        text: "Report submitted in partial fulfillment of the requirement for the degree of",
        size: 22,
        font: "Times New Roman",
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [
      new TextRun({
        text: "Bachelor of Computer Application (BCA)",
        bold: true,
        size: 26,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: "Under the Supervision of:", bold: true, size: 22, font: "Times New Roman" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 50 },
    children: [new TextRun({ text: "Mrs. Priti Mishra", bold: true, size: 24, font: "Times New Roman", color: "1E3A8A" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: "Assistant Professor, Department of Computer Applications", size: 21, font: "Times New Roman", italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: "By:", bold: true, size: 22, font: "Times New Roman" })],
  }),
  ...students.map(
    (s) =>
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: `${s.name} (Roll No: ${s.roll})`,
            bold: true,
            size: 22,
            font: "Times New Roman",
          }),
        ],
      })
  ),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 100 },
    children: [
      new TextRun({
        text: "PSIT College Of Higher Education, Kanpur",
        bold: true,
        size: 24,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: "C.S.J.M. University, Kanpur",
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: "(Academic Session: 2026–2027)",
        size: 20,
        font: "Times New Roman",
        italics: true,
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==========================================
// PAGE 6: DECLARATION
// ==========================================
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 300 },
    children: [
      new TextRun({
        text: "DECLARATION",
        bold: true,
        size: 28,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 200, line: 360 },
    children: [
      new TextRun({
        text: "We hereby declare that the work presented in this report entitled ",
        size: 22,
        font: "Times New Roman",
      }),
      new TextRun({
        text: "“AI_Book – Digital Notes Sharing System”",
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
      new TextRun({
        text: ", was carried out by us in partial fulfillment of the requirements for the award of the degree of Bachelor of Computer Application (BCA) at PSIT-College of Higher Education, affiliated to Chhatrapati Shahu Ji Maharaj University, Kanpur. We have not submitted the matter embodied in this report for the award of any other degree or diploma of any other University or Institute.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 200, line: 360 },
    children: [
      new TextRun({
        text: "We have given due credit to the original authors/sources for all the words, ideas, diagrams, graphics, computer programs, experiments, results, that are not our original contribution. We have used quotation marks to identify verbatim sentences and given credit to the original authors/sources.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 400, line: 360 },
    children: [
      new TextRun({
        text: "We affirm that no portion of our work is plagiarized, and the experiments, source code, and results reported in this report are not manipulated. In the event of any complaint of plagiarism or manipulation of results, we shall be fully responsible and answerable.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: BORDER_NONE,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ children: [new TextRun({ text: "Date: 30/10/2026", size: 22, font: "Times New Roman", bold: true })] }),
              new Paragraph({ children: [new TextRun({ text: "Place: Kanpur", size: 22, font: "Times New Roman", bold: true })] }),
            ],
          }),
          new TableCell({
            borders: BORDER_NONE,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ children: [new TextRun({ text: "1. Afreen (24116002068)", size: 21, font: "Times New Roman" })] }),
              new Paragraph({ children: [new TextRun({ text: "   Signature: __________________", size: 21, font: "Times New Roman" })] }),
              new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "2. Arushi Uttam (24116002145)", size: 21, font: "Times New Roman" })] }),
              new Paragraph({ children: [new TextRun({ text: "   Signature: __________________", size: 21, font: "Times New Roman" })] }),
              new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "3. Aradhana (24116002137)", size: 21, font: "Times New Roman" })] }),
              new Paragraph({ children: [new TextRun({ text: "   Signature: __________________", size: 21, font: "Times New Roman" })] }),
            ],
          }),
        ],
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==========================================
// PAGE 7: CERTIFICATE
// ==========================================
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 300 },
    children: [
      new TextRun({
        text: "Certificate",
        bold: true,
        size: 28,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 250, line: 360 },
    children: [
      new TextRun({
        text: "This is to certify that the Minor Project Progress Diary and Report entitled ",
        size: 22,
        font: "Times New Roman",
      }),
      new TextRun({
        text: "“AI_Book – Digital Notes Sharing System”",
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
      new TextRun({
        text: ", submitted by ",
        size: 22,
        font: "Times New Roman",
      }),
      new TextRun({
        text: "Afreen (Roll No: 24116002068), Arushi Uttam (Roll No: 24116002145), and Aradhana (Roll No: 24116002137)",
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
      new TextRun({
        text: " in partial fulfillment of the requirement for the award of the degree of ",
        size: 22,
        font: "Times New Roman",
      }),
      new TextRun({
        text: "Bachelor of Computer Application (B.C.A.)",
        bold: true,
        size: 22,
        font: "Times New Roman",
      }),
      new TextRun({
        text: " of PSIT-College Of Higher Education, affiliated to C.S.J.M. University, Kanpur, is a record of the candidates' own authentic work carried out by them under my supervision and guidance.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 400, line: 360 },
    children: [
      new TextRun({
        text: "The project embodies results of original work and studies carried out by the students themselves. To the best of my knowledge, the matter presented in this diary and project report has not formed the basis for the award of any other degree or diploma to the candidates or to anybody else.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({ spacing: { before: 600 } }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: BORDER_NONE,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ children: [new TextRun({ text: "Signature: ____________________", size: 22, font: "Times New Roman" })] }),
              new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: "Head of Department (HOD)", bold: true, size: 22, font: "Times New Roman" })] }),
              new Paragraph({ children: [new TextRun({ text: "Department of Computer Applications", size: 20, font: "Times New Roman" })] }),
              new Paragraph({ children: [new TextRun({ text: "PSIT-College of Higher Education", size: 20, font: "Times New Roman" })] }),
            ],
          }),
          new TableCell({
            borders: BORDER_NONE,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Signature: ____________________", size: 22, font: "Times New Roman" })] }),
              new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 80 }, children: [new TextRun({ text: "Mrs. Priti Mishra", bold: true, size: 22, font: "Times New Roman" })] }),
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Project Supervisor", size: 20, font: "Times New Roman" })] }),
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Assistant Professor, Dept. of Computer Applications", size: 20, font: "Times New Roman" })] }),
            ],
          }),
        ],
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==========================================
// PAGE 8: ABSTRACT
// ==========================================
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 300 },
    children: [
      new TextRun({
        text: "Abstract",
        bold: true,
        size: 28,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 180, line: 360 },
    children: [
      new TextRun({
        text: "Ask any college student where they keep their academic notes, and you will likely get a different answer every time – a WhatsApp group message here, a friend's phone gallery screenshot there, or a stack of photocopied pages that rarely survives through exam week intact. Critical study material routinely gets scattered across chats, personal cloud drives, and physical paper handouts. As a direct consequence, substantial academic time that ought to be dedicated to conceptual learning and problem solving is wasted simply locating the correct, up-to-date syllabus notes.",
        size: 24,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 180, line: 360 },
    children: [
      new TextRun({
        text: "“AI_Book – Digital Notes Sharing System” was conceived to systematically eliminate this widespread challenge. It is an enterprise-grade, web-based academic platform engineered to establish a unified, structured repository for college study notes, previous year university question papers (PYQs), and syllabus handouts. Designed with strict role-based access control, faculty members and administrators can seamlessly upload and categorize multi-page PDF documents tagged by engineering branch, academic year, semester, subject code, and syllabus unit module. Students can instantly filter, search, view in a native digital reader, or download verified materials from any desktop or mobile device.",
        size: 24,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 180, line: 360 },
    children: [
      new TextRun({
        text: "What elevates AI_Book beyond conventional document storage repositories is the intelligent artificial intelligence layer woven deeply into its architecture using Google AI Studio and the Google Gemini API. Long, mathematically dense lecture notes are parsed and summarized into concise revision flashcards highlighting core principles and essential formulas. Furthermore, an integrated Academic Doubt Solver enables students to query concepts grounded strictly in their official curriculum, while an automated Quiz Generator creates timed, 5-question multiple-choice self-assessments with faculty explanations. By integrating robust digital cataloging with modern generative AI assistance, AI_Book empowers students with a collaborative, high-yield academic ecosystem.",
        size: 24,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 200 },
    children: [
      new TextRun({ text: "Keywords: ", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({
        text: "Digital Notes Sharing, PDF Viewer, Role-Based Access Control, Google Gemini API, AI Summarization, Interactive Quiz Generator, React, Node.js, Higher Education.",
        size: 22,
        font: "Times New Roman",
        italics: true,
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==========================================
// PAGE 9: SYNOPSIS ATTACHMENT PLACEHOLDER
// ==========================================
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 300 },
    children: [
      new TextRun({
        text: "Synopsis",
        bold: true,
        size: 28,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: "(Attach the signed copy of synopsis here)",
        bold: true,
        size: 24,
        font: "Times New Roman",
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 200, after: 150, line: 360 },
    children: [
      new TextRun({
        text: "The approved Project Synopsis for “AI_Book – Digital Notes System” was officially submitted and accepted by the Departmental Project Committee (DPC), Department of Computer Applications, PSIT College of Higher Education, Kanpur.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 150, line: 360 },
    children: [
      new TextRun({
        text: "Key Synopsis Specifications Summary:\n" +
              "• Project Title: AI Book – Digital Notes System\n" +
              "• Academic Session: 2026–2027 (BCA 5th Semester, BCA-5005)\n" +
              "• Student Team: Afreen (24116002068), Arushi Uttam (24116002145), Aradhana (24116002137)\n" +
              "• Project Supervisor: Mrs. Priti Mishra, Assistant Professor\n" +
              "• Modules: 1) Authentication & User Management, 2) Notes Upload & Management, 3) Notes Search & Access, 4) AI Summarization Module, 5) AI Question-Answering Module, 6) AI Quiz Generation Module\n" +
              "• Technology Stack: React 19, TypeScript, Tailwind CSS, Node.js, Express.js, PostgreSQL/MySQL, Google Gemini API (@google/genai), Multer, pdf-parse, JWT, bcrypt.",
        size: 22,
        font: "Times New Roman",
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==========================================
// PAGE 10: MINOR PROJECT TIMELINE / SCHEDULE
// ==========================================
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 100 },
    children: [
      new TextRun({
        text: "Minor Project-Time Line",
        size: 22,
        font: "Times New Roman",
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [
      new TextRun({
        text: "PROJECT SCHEDULE ODD SEM 2026-2027",
        bold: true,
        size: 26,
        font: "Times New Roman",
        underline: {},
      }),
    ],
  }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_SINGLE,
    rows: [
      new TableRow({
        children: ["ACTIVITY", "DEADLINE", "PERSON INCHARGE", "DOCUMENT / FORM"].map(
          (h) =>
            new TableCell({
              borders: BORDER_SINGLE,
              shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 20, font: "Times New Roman" })] })],
            })
        ),
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Title / Group Formation / Supervisor Allocation", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Till 24th July-2026", bold: true, size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Supervisor / Group leader", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Project Proposal", size: 20, font: "Times New Roman" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Proposal Submission", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Till 14th Aug-2026", bold: true, size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Supervisor / DPC", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Project Proposal", size: 20, font: "Times New Roman" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Progress Evaluation 1", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "During CT-I (18th Sep-2026)", bold: true, size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DPC / Evaluators", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Power Point Presentation / Synopsis", size: 20, font: "Times New Roman" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Weekly Performance Monitoring", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Throughout the semester (Every Friday)", bold: true, size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Supervisor", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Project Diary", size: 20, font: "Times New Roman" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Progress Evaluation 2", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "During CT-II (16th Oct-2026)", bold: true, size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DPC / Evaluators", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Power Point Presentation", size: 20, font: "Times New Roman" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "End Semester Report (Project work Submission) / Final Evaluation", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "During PU (30th Oct-2026)", bold: true, size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Supervisor", size: 20, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Project Diary / Power Point Presentation", size: 20, font: "Times New Roman" })] })] }),
        ],
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==========================================
// PAGES 11 - 27: 17 WEEKLY PROGRESS SHEETS
// ==========================================
weeklyData.forEach((w) => {
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 60 },
      children: [
        new TextRun({
          text: `(To be filled by Students for every week to show the Weekly Progress of Project)`,
          italics: true,
          size: 20,
          font: "Times New Roman",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `WEEK ${w.week} PROGRESS SHEET`,
          bold: true,
          size: 24,
          font: "Times New Roman",
          underline: {},
          color: "1E3A8A",
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: BORDER_NONE,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: BORDER_NONE,
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Subject Code: ", bold: true, size: 21, font: "Times New Roman" }),
                    new TextRun({ text: "BCA 5005", size: 21, font: "Times New Roman" }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Meeting Date: ", bold: true, size: 21, font: "Times New Roman" }),
                    new TextRun({ text: `${w.date} (Friday)`, bold: true, size: 21, font: "Times New Roman", color: "1E40AF" }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: BORDER_NONE,
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: "Group Id: ", bold: true, size: 21, font: "Times New Roman" }),
                    new TextRun({ text: "BCA-5005-P04", size: 21, font: "Times New Roman" }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: "Session: ", bold: true, size: 21, font: "Times New Roman" }),
                    new TextRun({ text: "2026–2027 (Odd Semester)", size: 21, font: "Times New Roman" }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 100, after: 100 } }),
    // Attendance Table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: BORDER_SINGLE,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: BORDER_SINGLE,
              width: { size: 10, type: WidthType.PERCENTAGE },
              shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "S No", bold: true, size: 19, font: "Times New Roman" })] })],
            }),
            new TableCell({
              borders: BORDER_SINGLE,
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Roll Number", bold: true, size: 19, font: "Times New Roman" })] })],
            }),
            new TableCell({
              borders: BORDER_SINGLE,
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Student Name", bold: true, size: 19, font: "Times New Roman" })] })],
            }),
            new TableCell({
              borders: BORDER_SINGLE,
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Status on Meeting Date", bold: true, size: 19, font: "Times New Roman" })] })],
            }),
            new TableCell({
              borders: BORDER_SINGLE,
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Student Signature", bold: true, size: 19, font: "Times New Roman" })] })],
            }),
          ],
        }),
        ...students.map(
          (s) =>
            new TableRow({
              children: [
                new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.sNo, size: 19, font: "Times New Roman" })] })] }),
                new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.roll, size: 19, font: "Times New Roman" })] })] }),
                new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: s.name, bold: true, size: 19, font: "Times New Roman" })] })] }),
                new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Present", size: 19, font: "Times New Roman", color: "047857", bold: true })] })] }),
                new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.name.split(" ")[0], italics: true, size: 18, font: "Times New Roman" })] })] }),
              ],
            })
        ),
      ],
    }),
    new Paragraph({ spacing: { before: 120, after: 60 } }),
    new Paragraph({
      children: [
        new TextRun({ text: "Project Title: ", bold: true, size: 20, font: "Times New Roman" }),
        new TextRun({ text: "AI_Book – Digital Notes Sharing System", size: 20, font: "Times New Roman" }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: "Name of Project Supervisor: ", bold: true, size: 20, font: "Times New Roman" }),
        new TextRun({ text: "Mrs. Priti Mishra (Assistant Professor)", size: 20, font: "Times New Roman" }),
      ],
    }),
    // Box 1: Work done in current week
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: BORDER_SINGLE,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: BORDER_SINGLE,
              shading: { fill: "F9FAFB", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Work done in current Week:", bold: true, size: 20, font: "Times New Roman", color: "1E3A8A" })],
                }),
                new Paragraph({
                  spacing: { before: 60, after: 60, line: 320 },
                  alignment: AlignmentType.JUSTIFIED,
                  children: [new TextRun({ text: w.done, size: 20, font: "Times New Roman" })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 100 } }),
    // Box 2: Work to be done in next week
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: BORDER_SINGLE,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: BORDER_SINGLE,
              shading: { fill: "F9FAFB", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Work to be done in next Week:", bold: true, size: 20, font: "Times New Roman", color: "1E3A8A" })],
                }),
                new Paragraph({
                  spacing: { before: 60, after: 60, line: 320 },
                  alignment: AlignmentType.JUSTIFIED,
                  children: [new TextRun({ text: w.next, size: 20, font: "Times New Roman" })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 100 } }),
    // Box 3: Supervisor comments
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: BORDER_SINGLE,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: BORDER_SINGLE,
              shading: { fill: "FEF3C7", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Supervisor Comments:", bold: true, size: 20, font: "Times New Roman", color: "92400E" })],
                }),
                new Paragraph({
                  spacing: { before: 60, after: 100, line: 320 },
                  alignment: AlignmentType.JUSTIFIED,
                  children: [new TextRun({ text: w.comments, size: 20, font: "Times New Roman", italics: true })],
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: `Supervisor Signature / Date: `, bold: true, size: 19, font: "Times New Roman" }),
                    new TextRun({ text: `Priti Mishra  /  ${w.date}`, size: 19, font: "Times New Roman" }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );
});

// ==========================================
// PAGE 28: FINAL EVALUATION SHEET
// ==========================================
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [
      new TextRun({
        text: "(To be filled by Project Supervisor)",
        bold: true,
        size: 24,
        font: "Times New Roman",
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [
      new TextRun({
        text: "FINAL MINOR PROJECT EVALUATION SHEET",
        bold: true,
        size: 26,
        font: "Times New Roman",
        underline: {},
        color: "1E3A8A",
      }),
    ],
  }),
  new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "Project Title: ", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({ text: "AI_Book – Digital Notes Sharing System", size: 22, font: "Times New Roman" }),
    ],
  }),
  new Paragraph({
    spacing: { after: 250 },
    children: [
      new TextRun({ text: "Project Id: ", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({ text: "BCA-5005-P04", size: 22, font: "Times New Roman" }),
    ],
  }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_SINGLE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "S No", bold: true, size: 21, font: "Times New Roman" })] })],
          }),
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Roll No", bold: true, size: 21, font: "Times New Roman" })] })],
          }),
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 35, type: WidthType.PERCENTAGE },
            shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Name of the student", bold: true, size: 21, font: "Times New Roman" })] })],
          }),
          new TableCell({
            borders: BORDER_SINGLE,
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Grade by Supervisor", bold: true, size: 21, font: "Times New Roman" })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "24116002068", size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Afreen", bold: true, size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "A+", bold: true, size: 22, font: "Times New Roman", color: "047857" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "2", size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "24116002145", size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Arushi Uttam", bold: true, size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "A+", bold: true, size: 22, font: "Times New Roman", color: "047857" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3", size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "24116002137", size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ children: [new TextRun({ text: "Aradhana", bold: true, size: 21, font: "Times New Roman" })] })] }),
          new TableCell({ borders: BORDER_SINGLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "A+", bold: true, size: 22, font: "Times New Roman", color: "047857" })] })] }),
        ],
      }),
    ],
  }),
  new Paragraph({ spacing: { before: 250, after: 100 } }),
  new Paragraph({
    children: [
      new TextRun({ text: "Type of the project (Software / Software and Hardware / Simulation or Modelling): ", bold: true, size: 21, font: "Times New Roman" }),
      new TextRun({ text: "Software (Full-Stack Web Application with Generative AI)", size: 21, font: "Times New Roman", color: "1E40AF", bold: true }),
    ],
  }),
  new Paragraph({
    spacing: { before: 150, after: 100 },
    children: [
      new TextRun({ text: "Any other Remark:\n", bold: true, size: 21, font: "Times New Roman" }),
      new TextRun({
        text: "The student team demonstrated exemplary dedication, consistency, and professional teamwork across all 17 weekly development sprints. The final platform seamlessly satisfies all intended technical and academic objectives, successfully integrating role-based curriculum material management with cutting-edge Google Gemini AI summarization and quiz generation. All Course Outcomes (CO1-CO4) were thoroughly satisfied.",
        size: 21,
        font: "Times New Roman",
        italics: true,
      }),
    ],
  }),
  new Paragraph({ spacing: { before: 300, after: 150 } }),
  new Paragraph({
    children: [
      new TextRun({ text: "Supervisor Name and Signature: ", bold: true, size: 21, font: "Times New Roman" }),
      new TextRun({ text: "Mrs. Priti Mishra  (Assistant Professor)  _________________________", size: 21, font: "Times New Roman" }),
    ],
  }),
  new Paragraph({
    spacing: { before: 250, after: 100 },
    children: [
      new TextRun({ text: "Grading Scheme:\n", bold: true, size: 21, font: "Times New Roman", underline: {} }),
      new TextRun({ text: "A+: Outstanding  |  A: Excellent  |  B+: Good  |  B: Average  |  C: Not Satisfactory", size: 20, font: "Times New Roman" }),
    ],
  })
);

// Instantiate Document
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440,
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      headers: {
        default: createHeader(),
      },
      footers: {
        default: createFooter(),
      },
      children: docChildren,
    },
  ],
});

// Output path
const outputPath = path.join(process.cwd(), "public", "AI_Book_Project_Diary_BCA_5_Sem.docx");
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outputPath, buffer);
console.log(`[SUCCESS] Word document generated successfully at: ${outputPath} (${buffer.length} bytes)`);
