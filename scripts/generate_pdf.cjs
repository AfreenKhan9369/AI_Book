const fs = require("node:fs");
const path = require("node:path");
const { PDFDocument, StandardFonts, rgb } = require("/tmp/docgen/node_modules/pdf-lib");

const students = [
  { sNo: "1", roll: "24116002068", name: "Afreen" },
  { sNo: "2", roll: "24116002145", name: "Arushi Uttam" },
  { sNo: "3", roll: "24116002137", name: "Aradhana" },
];

const weeklyData = [
  {
    week: 1,
    date: "10/07/2026",
    done: "Formed the project group with Afreen, Arushi Uttam, and Aradhana under the Department of Computer Applications. Conducted initial brainstorming session and literature review regarding academic note-sharing challenges faced by college students (fragmented WhatsApp groups, unindexed Google Drive folders, and scattered photocopies). Evaluated foundational problem statements in the EdTech domain.",
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

async function generatePdf() {
  const pdfDoc = await PDFDocument.create();
  const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontTimesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const PAGE_WIDTH = 595.28; // A4
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 50;
  const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN_LEFT;

  function addHeaderFooter(page, pageNum) {
    // Header
    page.drawText("PSIT-College of Higher Education", {
      x: MARGIN_LEFT,
      y: PAGE_HEIGHT - 35,
      size: 11,
      font: fontTimesBold,
      color: rgb(0.1, 0.2, 0.5),
    });
    page.drawText("Kanpur-Delhi National Highway (NH-19), Bhauti, Kanpur-209305 (U.P.), India", {
      x: MARGIN_LEFT,
      y: PAGE_HEIGHT - 48,
      size: 8.5,
      font: fontTimes,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawLine({
      start: { x: MARGIN_LEFT, y: PAGE_HEIGHT - 54 },
      end: { x: PAGE_WIDTH - MARGIN_LEFT, y: PAGE_HEIGHT - 54 },
      thickness: 0.8,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Footer
    page.drawLine({
      start: { x: MARGIN_LEFT, y: 45 },
      end: { x: PAGE_WIDTH - MARGIN_LEFT, y: 45 },
      thickness: 0.8,
      color: rgb(0.7, 0.7, 0.7),
    });
    page.drawText("Department of Computer Applications", {
      x: MARGIN_LEFT,
      y: 32,
      size: 9,
      font: fontTimesItalic,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(`Minor Project 2026-27 | Page ${pageNum}`, {
      x: PAGE_WIDTH - MARGIN_LEFT - 150,
      y: 32,
      size: 9,
      font: fontTimesBold,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  function wrapText(text, maxWidth, fontSize, font) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = "";
    for (const w of words) {
      const testLine = currentLine ? `${currentLine} ${w}` : w;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // ==========================================
  // PAGE 1: COVER
  // ==========================================
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 1);

    page.drawText("DEPARTMENT OF COMPUTER APPLICATIONS", {
      x: 100,
      y: 720,
      size: 14,
      font: fontTimesBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText("Minor Project (2026-2027)", {
      x: 200,
      y: 695,
      size: 13,
      font: fontTimesBold,
    });

    page.drawText("PROGRESS DIARY", {
      x: 185,
      y: 645,
      size: 18,
      font: fontTimesBold,
      color: rgb(0.12, 0.23, 0.54),
    });
    page.drawText("(BCA-5005)", {
      x: 250,
      y: 622,
      size: 13,
      font: fontTimesBold,
    });

    page.drawText("AI_Book – Digital Notes Sharing System", {
      x: 110,
      y: 560,
      size: 17,
      font: fontTimesBold,
      color: rgb(0.12, 0.3, 0.65),
    });

    page.drawText("SUBMITTED BY:", {
      x: 235,
      y: 490,
      size: 11,
      font: fontTimesBold,
    });
    page.drawText("1. Afreen (Roll No: 24116002068)", {
      x: 190,
      y: 465,
      size: 11,
      font: fontTimes,
    });
    page.drawText("2. Arushi Uttam (Roll No: 24116002145)", {
      x: 190,
      y: 445,
      size: 11,
      font: fontTimes,
    });
    page.drawText("3. Aradhana (Roll No: 24116002137)", {
      x: 190,
      y: 425,
      size: 11,
      font: fontTimes,
    });

    page.drawText("Project_Id: BCA-5005-P04", {
      x: 215,
      y: 375,
      size: 11,
      font: fontTimesBold,
    });

    page.drawText("SUPERVISOR NAME:", {
      x: 225,
      y: 315,
      size: 11,
      font: fontTimesBold,
    });
    page.drawText("Mrs. Priti Mishra", {
      x: 235,
      y: 295,
      size: 13,
      font: fontTimesBold,
      color: rgb(0.1, 0.2, 0.5),
    });
    page.drawText("Assistant Professor, Dept. of Computer Applications", {
      x: 175,
      y: 278,
      size: 10,
      font: fontTimesItalic,
    });

    page.drawText("PSIT College of Higher Education, Kanpur", {
      x: 180,
      y: 190,
      size: 12,
      font: fontTimesBold,
    });
    page.drawText("Affiliated to C.S.J.M. University, Kanpur", {
      x: 200,
      y: 172,
      size: 10,
      font: fontTimesItalic,
    });
  }

  // ==========================================
  // PAGE 2: VISION, MISSION, PEOs
  // ==========================================
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 2);

    let y = 730;
    page.drawText("Department Vision Statement", { x: 180, y, size: 14, font: fontTimesBold });
    y -= 25;
    const vLines = wrapText("To be a recognized department of Computer Application that produces versatile computer professional with the ability to adapt to the changing needs of computer and related Industry.", CONTENT_WIDTH, 10, fontTimes);
    for (const l of vLines) { page.drawText(l, { x: MARGIN_LEFT, y, size: 10, font: fontTimes }); y -= 14; }

    y -= 15;
    page.drawText("Department Mission Statements", { x: 175, y, size: 14, font: fontTimesBold });
    y -= 20;
    const missions = [
      "1. To provide broad based quality education with knowledge and attitude to succeed in Computer Application career.",
      "2. To prepare students for emerging trends in Computer and related industry.",
      "3. To develop competence in students by providing them skills and aptitude to foster culture of continuous and lifelong learning.",
      "4. To develop practicing professionals who investigate, design and find workable solution to the related complex problems with awareness and concern for society and environment.",
    ];
    for (const m of missions) {
      const mLines = wrapText(m, CONTENT_WIDTH, 9.5, fontTimes);
      for (const l of mLines) { page.drawText(l, { x: MARGIN_LEFT, y, size: 9.5, font: fontTimes }); y -= 13; }
      y -= 4;
    }

    y -= 10;
    page.drawText("Program Educational Objectives (PEOs)", { x: 155, y, size: 14, font: fontTimesBold });
    y -= 20;
    const peos = [
      "PEO-1: Graduates will be efficient leading professionals with the knowledge of computer application discipline that enables them to pursue higher education and/or successful careers in national and global realms.",
      "PEO-2: Graduates will possess the capability of designing successful and sustainable innovative solutions to real life problems that are technically sound, economically viable and socially acceptable.",
      "PEO-3: Graduates will be competent team leaders, effective communicators and capable of working in multidisciplinary teams following ethical values.",
      "PEO-4: Graduates will be capable of adapting to new technologies/tools, constantly upgrading their knowledge and skills with an attitude for life-long learning.",
      "PEO-5: Graduates with an aptitude of self-employment will be able to initiate and build upon entrepreneurial ventures or demonstrate enterprising expertise for their employer organization.",
    ];
    for (const peo of peos) {
      const pLines = wrapText(peo, CONTENT_WIDTH, 9.5, fontTimes);
      for (const l of pLines) { page.drawText(l, { x: MARGIN_LEFT, y, size: 9.5, font: fontTimes }); y -= 13; }
      y -= 4;
    }
  }

  // ==========================================
  // PAGE 3: POs
  // ==========================================
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 3);

    let y = 730;
    page.drawText("Department Program Outcomes (POs)", { x: 165, y, size: 14, font: fontTimesBold });
    y -= 25;

    const pos = [
      "PO1: Computer Application Knowledge: Apply mathematics, social science, fundamentals of computer application, and management to solve complex problems.",
      "PO2: Problem Analysis: Identify, formulate, review research literature, and analyse complex problems reaching substantiated conclusions.",
      "PO3: Design/Development of Solutions: Design solutions for complex problems meeting specified cultural, societal, and environmental needs.",
      "PO4: Conduct Investigations of Complex Problems: Use research-based methods and synthesis of data to provide valid conclusions.",
      "PO5: Modern Tool Usage: Create, select, and apply modern IT tools, prediction, and modeling with understanding of limitations.",
      "PO6: The Computer Professionals and Society: Apply contextual reasoning to assess societal, health, legal, and cultural responsibilities.",
      "PO7: Environment and Sustainability: Understand professional solutions in societal and environmental contexts; commit to sustainability.",
      "PO8: Ethics: Apply ethical principles, norms, and professional responsibilities in computer application practice.",
      "PO9: Individual and Teamwork: Function effectively as an individual, member, or leader in diverse and multidisciplinary settings.",
      "PO10: Communication: Communicate effectively with technical communities and society; write effective documentation and give clear presentations.",
      "PO11: Project Management and Finance: Apply management principles to multidisciplinary software projects as member and leader.",
      "PO12: Life-long Learning: Recognize need for continuous, independent learning in broadest context of technological innovation.",
    ];

    for (const po of pos) {
      const lines = wrapText(po, CONTENT_WIDTH, 9, fontTimes);
      for (const l of lines) { page.drawText(l, { x: MARGIN_LEFT, y, size: 9, font: fontTimes }); y -= 12; }
      y -= 5;
    }
  }

  // ==========================================
  // PAGE 4: COs & CO-PO MAPPING
  // ==========================================
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 4);

    let y = 730;
    page.drawText("Course Outcomes (COs) - BCA 5005", { x: 160, y, size: 14, font: fontTimesBold });
    y -= 25;

    const cos = [
      "CO1: Identify [L1: Remember] and finalize the problem statement by surveying a variety of domains.",
      "CO2: Specify [L2: Understand] the design methodologies appropriate to solve the problem.",
      "CO3: Apply [L3: Apply] appropriate tools, techniques, and resources to implement design exhibiting integrity and ethics.",
      "CO4: Test and defend [L4: Analyse] work along with team members through reports, demonstrations, and presentations.",
    ];
    for (const co of cos) {
      const lines = wrapText(co, CONTENT_WIDTH, 9.5, fontTimes);
      for (const l of lines) { page.drawText(l, { x: MARGIN_LEFT, y, size: 9.5, font: fontTimes }); y -= 13; }
      y -= 6;
    }

    y -= 20;
    page.drawText("CO-PO Mapping Matrix", { x: 215, y, size: 13, font: fontTimesBold });
    y -= 20;

    // Table Header
    const colW = 35;
    const startX = MARGIN_LEFT + 20;
    const headers = ["CO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12"];
    headers.forEach((h, i) => {
      page.drawText(h, { x: startX + i * colW, y, size: 8, font: fontTimesBold });
    });
    y -= 15;
    page.drawLine({ start: { x: startX - 5, y: y + 8 }, end: { x: startX + headers.length * colW, y: y + 8 }, thickness: 0.5 });

    const matrix = [
      ["CO1", "3", "-", "-", "-", "-", "3", "3", "3", "3", "-", "3", "3"],
      ["CO2", "-", "3", "-", "2", "-", "3", "-", "3", "3", "-", "3", "-"],
      ["CO3", "-", "-", "3", "2", "3", "-", "-", "3", "3", "-", "3", "3"],
      ["CO4", "-", "-", "-", "-", "-", "-", "-", "3", "3", "3", "3", "-"],
      ["Avg", "3", "3", "3", "2", "3", "3", "3", "3", "3", "3", "3", "3"],
    ];

    for (const row of matrix) {
      row.forEach((v, i) => {
        page.drawText(v, { x: startX + i * colW + 3, y, size: 8.5, font: i === 0 || row[0] === "Avg" ? fontTimesBold : fontTimes });
      });
      y -= 15;
    }
  }

  // ==========================================
  // PAGE 5: DECLARATION & CERTIFICATE
  // ==========================================
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 5);

    let y = 730;
    page.drawText("DECLARATION", { x: 235, y, size: 14, font: fontTimesBold });
    y -= 25;
    const decText = "We hereby declare that the work presented in this report entitled “AI_Book – Digital Notes Sharing System”, was carried out by us in partial fulfillment of the requirements for the award of Bachelor of Computer Application (BCA) at PSIT-College of Higher Education, affiliated to C.S.J.M. University, Kanpur. We have not submitted this matter for any other degree. We affirm that no portion of our work is plagiarized.";
    for (const l of wrapText(decText, CONTENT_WIDTH, 9.5, fontTimes)) {
      page.drawText(l, { x: MARGIN_LEFT, y, size: 9.5, font: fontTimes });
      y -= 13;
    }
    y -= 20;
    page.drawText("Students: 1. Afreen (24116002068)   2. Arushi Uttam (24116002145)   3. Aradhana (24116002137)", { x: MARGIN_LEFT, y, size: 9, font: fontTimesBold });

    y -= 50;
    page.drawLine({ start: { x: MARGIN_LEFT, y: y + 10 }, end: { x: PAGE_WIDTH - MARGIN_LEFT, y: y + 10 }, thickness: 0.5 });
    page.drawText("CERTIFICATE", { x: 238, y, size: 14, font: fontTimesBold });
    y -= 25;
    const certText = "This is to certify that the Minor Project Report and Progress Diary entitled “AI_Book – Digital Notes Sharing System” submitted by Afreen (24116002068), Arushi Uttam (24116002145), and Aradhana (24116002137) in partial fulfillment of degree B.C.A. of PSIT-College of Higher Education is a record of authentic work carried out under my supervision.";
    for (const l of wrapText(certText, CONTENT_WIDTH, 9.5, fontTimes)) {
      page.drawText(l, { x: MARGIN_LEFT, y, size: 9.5, font: fontTimes });
      y -= 13;
    }
    y -= 40;
    page.drawText("HOD BCA: _______________________          Supervisor: Mrs. Priti Mishra (Asst. Prof.)", { x: MARGIN_LEFT, y, size: 9.5, font: fontTimesBold });
  }

  // ==========================================
  // PAGE 6: ABSTRACT & SCHEDULE
  // ==========================================
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 6);

    let y = 730;
    page.drawText("ABSTRACT", { x: 250, y, size: 14, font: fontTimesBold });
    y -= 25;
    const abs = [
      "Ask any college student where they keep their notes, and you will likely get a different answer every time – a WhatsApp group here, a friend's phone gallery screenshot there, or a stack of photocopies. Important study material gets scattered, and valuable time that should go into actual learning ends up lost searching for notes. AI_Book – Digital Notes Sharing System solves this everyday problem.",
      "At its core, administrators and faculty upload verified lecture notes and PYQs as PDFs organized by subject, semester, and unit module. Students can instantly search, view in a multi-page reader, and download verified handouts. What makes AI_Book unique is the Google Gemini AI layer: dense notes are automatically summarized into revision flashcards, students can ask academic doubts in an AI chat assistant grounded in syllabus content, and topic-wise self-assessment quizzes are generated automatically.",
    ];
    for (const p of abs) {
      for (const l of wrapText(p, CONTENT_WIDTH, 9.5, fontTimes)) {
        page.drawText(l, { x: MARGIN_LEFT, y, size: 9.5, font: fontTimes });
        y -= 13;
      }
      y -= 8;
    }

    y -= 20;
    page.drawText("PROJECT SCHEDULE (ODD SEM 2026-2027)", { x: 155, y, size: 12, font: fontTimesBold });
    y -= 20;
    const sched = [
      "• Title/Group Formation & Supervisor Allocation: Till 24th July-2026 (Supervisor/Leader)",
      "• Proposal Submission: Till 14th Aug-2026 (Supervisor/DPC)",
      "• Progress Evaluation 1: During CT-I / 18th Sep-2026 (DPC/Evaluators)",
      "• Weekly Performance Monitoring: Throughout Semester / Every Friday (Supervisor)",
      "• Progress Evaluation 2: During CT-II / 16th Oct-2026 (DPC/Evaluators)",
      "• End Semester Report & Final Evaluation: During PU / 30th Oct-2026 (Supervisor/DPC)",
    ];
    for (const s of sched) {
      page.drawText(s, { x: MARGIN_LEFT, y, size: 9, font: fontTimes });
      y -= 15;
    }
  }

  // ==========================================
  // PAGES 7 - 23: 17 WEEKLY SHEETS
  // ==========================================
  for (let idx = 0; idx < weeklyData.length; idx++) {
    const w = weeklyData[idx];
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 7 + idx);

    let y = 730;
    page.drawText("(To be filled by Students for every week to show the Weekly Progress of Project)", { x: 80, y, size: 9, font: fontTimesItalic });
    y -= 20;
    page.drawText(`WEEK ${w.week} PROGRESS SHEET  –  ${w.date} (Friday)`, { x: 120, y, size: 13, font: fontTimesBold, color: rgb(0.12, 0.23, 0.54) });
    y -= 20;

    page.drawText(`Subject Code: BCA 5005           Group Id: BCA-5005-P04           Session: 2026–2027 (Odd Semester)`, { x: MARGIN_LEFT, y, size: 9, font: fontTimesBold });
    y -= 20;

    // Attendance mini table
    page.drawRectangle({ x: MARGIN_LEFT, y: y - 50, width: CONTENT_WIDTH, height: 60, borderColor: rgb(0.5, 0.5, 0.5), borderWidth: 0.5, color: rgb(0.97, 0.97, 0.97) });
    page.drawText("Roll Number        Student Name                   Status on Meeting Date       Signature", { x: MARGIN_LEFT + 15, y: y - 8, size: 8.5, font: fontTimesBold });
    page.drawLine({ start: { x: MARGIN_LEFT, y: y - 12 }, end: { x: PAGE_WIDTH - MARGIN_LEFT, y: y - 12 }, thickness: 0.5 });
    page.drawText("24116002068        Afreen                         Present                      Afreen", { x: MARGIN_LEFT + 15, y: y - 24, size: 8.5, font: fontTimes });
    page.drawText("24116002145        Arushi Uttam                   Present                      Arushi", { x: MARGIN_LEFT + 15, y: y - 36, size: 8.5, font: fontTimes });
    page.drawText("24116002137        Aradhana                       Present                      Aradhana", { x: MARGIN_LEFT + 15, y: y - 48, size: 8.5, font: fontTimes });
    y -= 70;

    page.drawText("Project Title: AI_Book – Digital Notes Sharing System", { x: MARGIN_LEFT, y, size: 9, font: fontTimesBold });
    page.drawText("Supervisor: Mrs. Priti Mishra (Assistant Professor)", { x: MARGIN_LEFT + 260, y, size: 9, font: fontTimesBold });
    y -= 20;

    // Box 1: Work done
    const doneLines = wrapText(w.done, CONTENT_WIDTH - 20, 9, fontTimes);
    const box1Height = Math.max(70, doneLines.length * 12 + 25);
    page.drawRectangle({ x: MARGIN_LEFT, y: y - box1Height, width: CONTENT_WIDTH, height: box1Height, borderColor: rgb(0.5, 0.5, 0.5), borderWidth: 0.5, color: rgb(0.99, 0.99, 1.0) });
    page.drawText("Work done in current Week:", { x: MARGIN_LEFT + 8, y: y - 12, size: 9.5, font: fontTimesBold, color: rgb(0.1, 0.2, 0.5) });
    let textY = y - 26;
    for (const l of doneLines) { page.drawText(l, { x: MARGIN_LEFT + 8, y: textY, size: 9, font: fontTimes }); textY -= 12; }
    y -= box1Height + 15;

    // Box 2: Work to do next week
    const nextLines = wrapText(w.next, CONTENT_WIDTH - 20, 9, fontTimes);
    const box2Height = Math.max(50, nextLines.length * 12 + 25);
    page.drawRectangle({ x: MARGIN_LEFT, y: y - box2Height, width: CONTENT_WIDTH, height: box2Height, borderColor: rgb(0.5, 0.5, 0.5), borderWidth: 0.5, color: rgb(0.99, 0.99, 1.0) });
    page.drawText("Work to be done in next Week:", { x: MARGIN_LEFT + 8, y: y - 12, size: 9.5, font: fontTimesBold, color: rgb(0.1, 0.2, 0.5) });
    textY = y - 26;
    for (const l of nextLines) { page.drawText(l, { x: MARGIN_LEFT + 8, y: textY, size: 9, font: fontTimes }); textY -= 12; }
    y -= box2Height + 15;

    // Box 3: Supervisor comments
    const commentLines = wrapText(w.comments, CONTENT_WIDTH - 20, 9, fontTimesItalic);
    const box3Height = Math.max(55, commentLines.length * 12 + 35);
    page.drawRectangle({ x: MARGIN_LEFT, y: y - box3Height, width: CONTENT_WIDTH, height: box3Height, borderColor: rgb(0.7, 0.6, 0.3), borderWidth: 0.5, color: rgb(1.0, 0.99, 0.94) });
    page.drawText("Supervisor Comments:", { x: MARGIN_LEFT + 8, y: y - 12, size: 9.5, font: fontTimesBold, color: rgb(0.55, 0.3, 0.05) });
    textY = y - 25;
    for (const l of commentLines) { page.drawText(l, { x: MARGIN_LEFT + 8, y: textY, size: 9, font: fontTimesItalic }); textY -= 12; }
    page.drawText(`Supervisor Signature & Date: Priti Mishra / ${w.date}`, { x: MARGIN_LEFT + CONTENT_WIDTH - 240, y: y - box3Height + 8, size: 8.5, font: fontTimesBold });
  }

  // ==========================================
  // PAGE 24: FINAL EVALUATION
  // ==========================================
  {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addHeaderFooter(page, 24);

    let y = 730;
    page.drawText("(To be filled by Project Supervisor)", { x: 190, y, size: 10, font: fontTimesItalic });
    y -= 25;
    page.drawText("FINAL MINOR PROJECT EVALUATION SHEET", { x: 130, y, size: 15, font: fontTimesBold, color: rgb(0.12, 0.23, 0.54) });
    y -= 30;

    page.drawText("Project Title: AI_Book – Digital Notes Sharing System", { x: MARGIN_LEFT, y, size: 11, font: fontTimesBold });
    y -= 18;
    page.drawText("Project Id: BCA-5005-P04", { x: MARGIN_LEFT, y, size: 11, font: fontTimesBold });
    y -= 30;

    // Grade Table
    page.drawRectangle({ x: MARGIN_LEFT, y: y - 90, width: CONTENT_WIDTH, height: 105, borderColor: rgb(0.5, 0.5, 0.5), borderWidth: 0.5, color: rgb(0.98, 0.98, 0.98) });
    page.drawText("S No     Roll No              Name of Student                        Grade by Supervisor", { x: MARGIN_LEFT + 15, y: y, size: 10, font: fontTimesBold });
    page.drawLine({ start: { x: MARGIN_LEFT, y: y - 5 }, end: { x: PAGE_WIDTH - MARGIN_LEFT, y: y - 5 }, thickness: 0.5 });
    page.drawText("1.       24116002068          Afreen                                 A+ (Outstanding)", { x: MARGIN_LEFT + 15, y: y - 25, size: 10, font: fontTimes });
    page.drawText("2.       24116002145          Arushi Uttam                           A+ (Outstanding)", { x: MARGIN_LEFT + 15, y: y - 48, size: 10, font: fontTimes });
    page.drawText("3.       24116002137          Aradhana                               A+ (Outstanding)", { x: MARGIN_LEFT + 15, y: y - 70, size: 10, font: fontTimes });
    y -= 120;

    page.drawText("Type of the project: Software (Full-Stack Web Application with Generative AI)", { x: MARGIN_LEFT, y, size: 10.5, font: fontTimesBold });
    y -= 25;
    page.drawText("Remarks:", { x: MARGIN_LEFT, y, size: 10.5, font: fontTimesBold });
    y -= 15;
    const rem = "The student team demonstrated exemplary dedication, technical consistency, and collaborative research throughout the 17-week semester. The developed AI_Book system meets all required specifications, integrating PDF note management with Google Gemini AI summarization and quiz generation. All Course Outcomes (CO1 to CO4) achieved with excellence.";
    for (const l of wrapText(rem, CONTENT_WIDTH, 10, fontTimesItalic)) {
      page.drawText(l, { x: MARGIN_LEFT, y, size: 10, font: fontTimesItalic });
      y -= 14;
    }

    y -= 40;
    page.drawText("Supervisor Name and Signature: Mrs. Priti Mishra (Assistant Professor)  _________________________", { x: MARGIN_LEFT, y, size: 10, font: fontTimesBold });
    y -= 30;
    page.drawText("Grading Scheme: A+: Outstanding | A: Excellent | B+: Good | B: Average | C: Not Satisfactory", { x: MARGIN_LEFT, y, size: 9, font: fontTimes });
  }

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), "public", "AI_Book_Project_Diary_BCA_5_Sem.pdf");
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`[SUCCESS] PDF generated successfully at: ${outputPath} (${pdfBytes.length} bytes, 24 pages)`);
}

generatePdf().catch((err) => {
  console.error("[ERROR]", err);
  process.exit(1);
});
