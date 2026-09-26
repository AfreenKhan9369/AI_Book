import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { getDatabase } from "../config/db.js";

// Helper to create a valid minimal PDF file for sample notes
function createSamplePdf(filePath: string, title: string, subject: string, notesContent: string[]): void {
  if (fs.existsSync(filePath)) return;

  const contentStream = [
    "BT",
    "/F1 20 Tf",
    "50 750 Td",
    `(${title.replace(/[()\\]/g, "")}) Tj`,
    "/F1 12 Tf",
    "0 -30 Td",
    `(Subject: ${subject.replace(/[()\\]/g, "")} | College Notes Repository) Tj`,
    "0 -15 Td",
    "(-----------------------------------------------------------------------------------) Tj",
    "0 -25 Td",
    ...notesContent.flatMap((line) => [
      `(${line.replace(/[()\\]/g, "")}) Tj`,
      "0 -18 Td",
    ]),
    "0 -30 Td",
    "(Generated & Verified by AI_Book College Notes Sharing System) Tj",
    "ET",
  ].join("\n");

  const streamLength = Buffer.byteLength(contentStream, "utf-8");

  const pdfDocument = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica-Bold
      >>
    >>
  >>
>>
endobj
4 0 obj
<<
  /Length ${streamLength}
>>
stream
${contentStream}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000306 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
${400 + streamLength}
%%EOF`;

  fs.writeFileSync(filePath, pdfDocument, "utf-8");
}

export async function initDatabaseAndSeed(): Promise<void> {
  const db = await getDatabase();

  // Create uploads directory (support serverless /tmp fallback if read-only)
  let uploadsDir = path.join(process.cwd(), "uploads");
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch {
    uploadsDir = path.join("/tmp", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
      } catch {}
    }
  }

  // Check if users exist
  const existingUsers = await db.query("SELECT COUNT(*) as count FROM users;");
  const userCount = Number(existingUsers[0]?.count || 0);

  let facultyId = 1;
  let studentId = 2;

  if (userCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const facultyPasswordHash = await bcrypt.hash("faculty123", salt);
    const studentPasswordHash = await bcrypt.hash("student123", salt);

    const facultyRes = await db.execute(
      `INSERT INTO users (name, email, password, role, branch, semester, roll_number, avatar) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        "Prof. Rajesh Sharma",
        "faculty@college.edu",
        facultyPasswordHash,
        "faculty",
        "Computer Science",
        4,
        "FAC-CS-101",
        "",
      ]
    );
    facultyId = facultyRes.insertId || 1;

    const studentRes = await db.execute(
      `INSERT INTO users (name, email, password, role, branch, semester, roll_number, avatar) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        "Aarav Patel",
        "student@college.edu",
        studentPasswordHash,
        "student",
        "Computer Science",
        4,
        "CS-2024-042",
        "",
      ]
    );
    studentId = studentRes.insertId || 2;
    console.log("[DB Seed] Seeded default faculty and student accounts.");
  }

  // Check if subjects exist
  const existingSubjects = await db.query("SELECT COUNT(*) as count FROM subjects;");
  const subjectCount = Number(existingSubjects[0]?.count || 0);

  if (subjectCount === 0) {
    const subjectsToSeed = [
      { code: "CS401", name: "Operating Systems", branch: "Computer Science", semester: 4, description: "Processes, Threads, CPU Scheduling, Concurrency, Virtual Memory and File Systems." },
      { code: "CS402", name: "Database Management Systems", branch: "Computer Science", semester: 4, description: "ER Model, Relational Algebra, SQL, Normalization, ACID Transactions, Indexing." },
      { code: "CS403", name: "Computer Architecture", branch: "Computer Science", semester: 4, description: "Instruction Set Architecture, Pipelining, Memory Hierarchy, Cache and I/O Organization." },
      { code: "CS301", name: "Data Structures & Algorithms", branch: "Computer Science", semester: 3, description: "Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, Dynamic Programming." },
      { code: "CS501", name: "Computer Networks", branch: "Computer Science", semester: 5, description: "OSI & TCP/IP layers, routing protocols, flow control, congestion, DNS, HTTP/HTTPS." },
      { code: "CS601", name: "Machine Learning", branch: "Computer Science", semester: 6, description: "Supervised and Unsupervised Learning, Regression, Classification, Neural Networks." },
      { code: "CS101", name: "Programming in C", branch: "Computer Science", semester: 1, description: "Pointers, structures, file handling, memory management, foundational problem solving." },
      { code: "MATH101", name: "Engineering Mathematics I", branch: "Computer Science", semester: 1, description: "Calculus, Linear Algebra, Matrices, Eigenvalues, Vector spaces." },
      { code: "EC301", name: "Digital Electronics", branch: "Electronics", semester: 3, description: "Boolean logic, logic gates, combinational and sequential circuit design, flip-flops." },
      { code: "IT502", name: "Web Technologies", branch: "Information Technology", semester: 5, description: "Full-stack development, HTTP protocols, REST APIs, client-server models, security." },
    ];

    for (const sub of subjectsToSeed) {
      await db.execute(
        `INSERT INTO subjects (code, name, branch, semester, description) VALUES (?, ?, ?, ?, ?);`,
        [sub.code, sub.name, sub.branch, sub.semester, sub.description]
      );
    }
    console.log("[DB Seed] Seeded subjects across semesters.");
  }

  // Check if materials exist
  const existingMaterials = await db.query("SELECT COUNT(*) as count FROM materials;");
  const materialCount = Number(existingMaterials[0]?.count || 0);

  if (materialCount === 0) {
    const subjects = await db.query("SELECT id, code, name, semester, branch FROM subjects;");
    const subMap = new Map<string, any>();
    subjects.forEach((s) => subMap.set(s.code, s));

    const sampleMaterials = [
      {
        title: "Process Synchronization & Critical Section Problem",
        type: "note",
        subjectCode: "CS401",
        academic_year: "2024-25",
        module_unit: "Unit 2: Concurrency",
        file_name: "OS_Process_Sync_Notes.pdf",
        file_size: "1.4 MB",
        description: "Comprehensive handwritten & typed lecture notes covering Peterson's Solution, Semaphores (Counting & Binary), Mutex Locks, and Classic Problems like Dining Philosophers & Producer-Consumer.",
        downloads_count: 342,
        views_count: 890,
        pdfContent: [
          "Unit 2: Process Synchronization and Mutexes",
          "1. Critical Section Problem: Mutual Exclusion, Progress, Bounded Waiting",
          "2. Peterson's Algorithm: Software solution for two processes",
          "3. Hardware synchronization: TestAndSet, CompareAndSwap instructions",
          "4. Semaphores: wait() and signal() atomic operations",
          "5. Deadlocks & Starvation: Prevention and Bankers Algorithm details",
        ],
      },
      {
        title: "Relational Algebra, SQL & Normalization (1NF to BCNF)",
        type: "note",
        subjectCode: "CS402",
        academic_year: "2024-25",
        module_unit: "Unit 3: Schema Design",
        file_name: "DBMS_Normalization_Notes.pdf",
        file_size: "2.1 MB",
        description: "Master normalization with real-world examples, functional dependency closure calculation, lossless join decomposition, and dependency preservation test methods.",
        downloads_count: 512,
        views_count: 1420,
        pdfContent: [
          "Unit 3: Relational Database Normalization Master Guide",
          "1. First Normal Form (1NF): Atomic values and eliminate repeating groups",
          "2. Second Normal Form (2NF): Full functional dependency on candidate key",
          "3. Third Normal Form (3NF): Elimination of transitive dependencies",
          "4. Boyce-Codd Normal Form (BCNF): For every X -> Y, X must be a super key",
          "5. Practice problems with step-by-step canonical cover calculation",
        ],
      },
      {
        title: "Graph Algorithms: Shortest Path & Minimum Spanning Trees",
        type: "note",
        subjectCode: "CS301",
        academic_year: "2024-25",
        module_unit: "Unit 4: Advanced Graphs",
        file_name: "DSA_Graph_Algorithms.pdf",
        file_size: "1.8 MB",
        description: "Detailed pseudocode, time complexity proofs, and step-by-step traces for Dijkstra, Bellman-Ford, Floyd-Warshall, Kruskal, and Prim algorithms.",
        downloads_count: 678,
        views_count: 1980,
        pdfContent: [
          "Unit 4: Advanced Graph Algorithms & Proofs",
          "1. Graph representations: Adjacency List vs Adjacency Matrix",
          "2. Dijkstra Algorithm with Min-Heap Priority Queue: O((V+E) log V)",
          "3. Bellman-Ford: Detecting negative weight cycles in O(V * E)",
          "4. Disjoint Set Union (DSU) with Path Compression & Union by Rank",
          "5. Kruskal's MST and Prim's greedy MST algorithm walkthroughs",
        ],
      },
      {
        title: "Virtual Memory, Paging & Page Replacement Algorithms",
        type: "note",
        subjectCode: "CS401",
        academic_year: "2024-25",
        module_unit: "Unit 3: Memory Management",
        file_name: "OS_Virtual_Memory_Paging.pdf",
        file_size: "1.6 MB",
        description: "Covers Address Translation, TLB hits/misses, Multi-level Paging, Inverted Page Tables, FIFO, LRU, Optimal Page Replacement, and Belady's Anomaly.",
        downloads_count: 420,
        views_count: 1100,
        pdfContent: [
          "Unit 3: Memory Management & Paging Architecture",
          "1. Logical vs Physical Address Space translation mechanism",
          "2. Translation Lookaside Buffer (TLB) and effective access time",
          "3. Belady's Anomaly explanation in FIFO page replacement",
          "4. LRU approximations: Reference Bit and Second-Chance Clock Algorithm",
          "5. Thrashing cause and Working Set Model solution",
        ],
      },
      {
        title: "TCP/IP Protocol Suite, Flow Control & Subnetting",
        type: "note",
        subjectCode: "CS501",
        academic_year: "2024-25",
        module_unit: "Unit 2: Transport & Network Layers",
        file_name: "CN_Protocols_Subnetting.pdf",
        file_size: "2.3 MB",
        description: "Complete guide on IP addressing, CIDR, VLSM calculation, TCP 3-way handshake, TCP Congestion Control (Slow Start, Congestion Avoidance), and sliding window protocols.",
        downloads_count: 289,
        views_count: 750,
        pdfContent: [
          "Unit 2: Computer Networks & Transport Architecture",
          "1. IPv4 Classful vs Classless Inter-Domain Routing (CIDR)",
          "2. Subnetting formulas and practical network division exercises",
          "3. TCP sliding window: Go-Back-N vs Selective Repeat ARQ",
          "4. TCP Congestion window dynamics: AIMD and Fast Retransmit",
          "5. Domain Name System (DNS) recursive vs iterative query flow",
        ],
      },
      {
        title: "Supervised Learning: Regressions, SVM & Decision Trees",
        type: "note",
        subjectCode: "CS601",
        academic_year: "2024-25",
        module_unit: "Unit 2: Supervised Methods",
        file_name: "ML_Supervised_Learning_Notes.pdf",
        file_size: "3.1 MB",
        description: "Mathematical formulation of Gradient Descent, Cost Functions, Regularization (L1 Lasso, L2 Ridge), Maximum Margin Hyperplane for SVM, and Information Gain / Gini Impurity.",
        downloads_count: 410,
        views_count: 980,
        pdfContent: [
          "Unit 2: Machine Learning Supervised Learning Foundations",
          "1. Linear & Logistic Regression: Cost function and Gradient Descent",
          "2. Bias-Variance Tradeoff and Regularization techniques",
          "3. Support Vector Machines: Kernels (RBF, Polynomial) and Soft Margins",
          "4. Decision Trees: Shannon Entropy, Information Gain, ID3 & CART",
          "5. Ensemble Methods: Random Forest and Gradient Boosted Trees",
        ],
      },
      // Previous Year Questions (PYQs)
      {
        title: "Operating Systems – End-Term University Exam (Solved with Answer Key)",
        type: "pyq",
        subjectCode: "CS401",
        academic_year: "2023-24",
        module_unit: "End-Term Exam",
        file_name: "OS_EndTerm_2024_Solved.pdf",
        file_size: "2.5 MB",
        description: "Official end-term question paper with verified model answers, diagrams, numerical solutions for Banker's Algorithm, and Page Replacement comparative tables.",
        downloads_count: 812,
        views_count: 2450,
        pdfContent: [
          "Operating Systems End-Term Examination (Year 2023-24)",
          "Part A (Short Questions 10 x 2 = 20 Marks):",
          "Q1: Differentiate between monolithic and microkernel architectures.",
          "Q2: What is Belady's Anomaly? Give one replacement algorithm that suffers from it.",
          "Part B (Numerical & Long Answers 5 x 16 = 80 Marks):",
          "Q3: Solve Banker's Safety Algorithm for given allocation matrix [Full Solution Included].",
          "Q4: Calculate Page Faults for FIFO, LRU, Optimal for reference string: 7,0,1,2,0,3,0,4,2,3,0,3,2.",
        ],
      },
      {
        title: "DBMS – Mid-Term Exam Paper (With Complete SQL Solutions)",
        type: "pyq",
        subjectCode: "CS402",
        academic_year: "2023-24",
        module_unit: "Mid-Term Exam",
        file_name: "DBMS_MidTerm_2023_Solved.pdf",
        file_size: "1.9 MB",
        description: "Mid-semester examination paper with ER diagrams, SQL queries for complex joins, and 3NF/BCNF normalization decomposition walkthrough.",
        downloads_count: 654,
        views_count: 1820,
        pdfContent: [
          "Database Management Systems Mid-Term Exam Paper",
          "Section A: Relational Algebra & Calculus",
          "Section B: Complex SQL Queries with Group By, Having, and Correlated Subqueries",
          "Section C: Normalization problem with functional dependencies F = {A->B, BC->D, D->E}",
          "Model solutions written and reviewed by Computer Science Faculty.",
        ],
      },
      {
        title: "Data Structures & Algorithms – End-Semester University PYQ",
        type: "pyq",
        subjectCode: "CS301",
        academic_year: "2022-23",
        module_unit: "End-Term Exam",
        file_name: "DSA_EndTerm_2023_Paper.pdf",
        file_size: "1.7 MB",
        description: "End-semester previous year question paper covering recursion trees, AVL rotations, Heapify, Dijkstra, and DP Knapsack problem.",
        downloads_count: 730,
        views_count: 2100,
        pdfContent: [
          "DSA End-Semester Question Paper (Year 2022-23)",
          "Questions on AVL Tree single and double rotations (LL, RR, LR, RL)",
          "Dynamic Programming 0/1 Knapsack recursive and memoized recurrence relation",
          "Shortest path algorithms comparison and time-complexity trade-offs",
        ],
      },
      {
        title: "Computer Networks – Final Examination 2023",
        type: "pyq",
        subjectCode: "CS501",
        academic_year: "2022-23",
        module_unit: "End-Term Exam",
        file_name: "CN_Final_Exam_2023.pdf",
        file_size: "2.0 MB",
        description: "University end-term examination paper with numericals on subnetting, Hamming code error correction, and socket programming concepts.",
        downloads_count: 480,
        views_count: 1350,
        pdfContent: [
          "Computer Networks End-Term Examination Paper",
          "Section 1: Physical & Data Link Layer framing and CRC error detection",
          "Section 2: IPv4 Subnetting numerical: Divide 192.168.1.0/24 into 4 equal subnets",
          "Section 3: Distance Vector Routing vs Link State Routing count-to-infinity problem",
        ],
      },
    ];

    for (const mat of sampleMaterials) {
      const sub = subMap.get(mat.subjectCode);
      if (!sub) continue;

      const pdfFilePath = path.join(uploadsDir, mat.file_name);
      createSamplePdf(pdfFilePath, mat.title, sub.name, mat.pdfContent);

      await db.execute(
        `INSERT INTO materials (
          title, type, subject_id, semester, branch, academic_year, module_unit,
          file_name, file_path, file_size, file_type, description, uploader_id, uploader_name,
          downloads_count, views_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          mat.title,
          mat.type,
          sub.id,
          sub.semester,
          sub.branch,
          mat.academic_year,
          mat.module_unit,
          mat.file_name,
          `/uploads/${mat.file_name}`,
          mat.file_size,
          "application/pdf",
          mat.description,
          facultyId,
          "Prof. Rajesh Sharma",
          mat.downloads_count,
          mat.views_count,
        ]
      );
    }
    console.log("[DB Seed] Seeded realistic notes and PYQs with real PDF files.");
  }
}
