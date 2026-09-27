import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { getDatabase } from "../config/db.js";
import { buildPdfDocument, writePdfToDisk, generateFallbackPdf } from "./pdfGenerator.js";

interface SampleMaterialDef {
  title: string;
  type: "note" | "pyq";
  subjectCode: string;
  academic_year: string;
  module_unit: string;
  file_name: string;
  file_size: string;
  description: string;
  downloads_count: number;
  views_count: number;
  pdfContent: string[];
}

export const SAMPLE_MATERIALS_CATALOG: SampleMaterialDef[] = [
  // 1. Foundational Note matching test.pdf
  {
    title: "Introduction to Computer Systems & Architecture (Sample Foundation Note)",
    type: "note",
    subjectCode: "CS401",
    academic_year: "2024-25",
    module_unit: "Unit 1: System Organization",
    file_name: "test.pdf",
    file_size: "1.2 MB",
    description: "Comprehensive foundational lecture notes covering Computer Organization, Von Neumann model, Instruction execution cycles, memory hierarchies, and hardware protection rings.",
    downloads_count: 520,
    views_count: 1450,
    pdfContent: [
      "Unit 1: Foundations of Computer Systems & Architecture",
      "1. Von Neumann Architecture: CPU, Arithmetic Logic Unit, Control Unit, and Memory Hierarchy",
      "2. Instruction Fetch-Decode-Execute Cycle: Program Counter (PC), Instruction Register (IR)",
      "3. Dual-Mode Operation: User Mode vs Kernel Mode execution and system call dispatching",
      "4. Memory Hierarchy: Registers, L1/L2/L3 Cache, Main Memory (RAM), and Secondary Storage",
      "5. AI Study Tools Guide: Use AI Summary & Quiz to master key terms before university exams",
    ],
  },

  // 2. Operating Systems - Process Synchronization
  {
    title: "Process Synchronization, Critical Section Problem & Semaphores",
    type: "note",
    subjectCode: "CS401",
    academic_year: "2024-25",
    module_unit: "Unit 2: Concurrency & Threads",
    file_name: "OS_Process_Sync_Notes.pdf",
    file_size: "1.4 MB",
    description: "Comprehensive handwritten & typed lecture notes covering Peterson's Solution, Counting & Binary Semaphores, Mutex Locks, and Classic Problems like Dining Philosophers & Producer-Consumer.",
    downloads_count: 642,
    views_count: 1890,
    pdfContent: [
      "Unit 2: Process Synchronization & Concurrency Control",
      "1. Critical Section Problem: Mutual Exclusion, Progress, Bounded Waiting conditions",
      "2. Peterson's Algorithm: Software-based solution for two concurrent processes",
      "3. Hardware Synchronization: Atomic TestAndSet() and CompareAndSwap() instructions",
      "4. Semaphores: wait() and signal() atomic operations; Counting vs Binary semaphores",
      "5. Classical Synchronization Problems: Producer-Consumer, Readers-Writers, Dining Philosophers",
      "6. Deadlocks & Banker's Safety Algorithm step-by-step verification trace",
    ],
  },

  // 3. Operating Systems - Virtual Memory
  {
    title: "Virtual Memory, Paging Architecture & Page Replacement",
    type: "note",
    subjectCode: "CS401",
    academic_year: "2024-25",
    module_unit: "Unit 3: Memory Management",
    file_name: "OS_Virtual_Memory_Paging.pdf",
    file_size: "1.6 MB",
    description: "Covers Address Translation, TLB hits/misses, Multi-level Paging, Inverted Page Tables, FIFO, LRU, Optimal Page Replacement, and Belady's Anomaly.",
    downloads_count: 480,
    views_count: 1320,
    pdfContent: [
      "Unit 3: Memory Management & Virtual Memory Architecture",
      "1. Logical vs Physical Address Translation: Page Number (p) and Page Offset (d)",
      "2. Translation Lookaside Buffer (TLB): Associative lookup and Effective Access Time (EAT)",
      "3. Multi-Level & Inverted Page Tables: Structure, scalability, and memory overhead tradeoffs",
      "4. Page Replacement Algorithms: FIFO, LRU (Least Recently Used), Optimal (Belady's Min)",
      "5. Belady's Anomaly: Why increasing frames can increase page faults in FIFO",
      "6. Thrashing: Degree of multiprogramming collapse and Working-Set Model prevention",
    ],
  },

  // 4. DBMS - Normalization
  {
    title: "Relational Algebra, SQL & Normalization (1NF to BCNF)",
    type: "note",
    subjectCode: "CS402",
    academic_year: "2024-25",
    module_unit: "Unit 3: Schema Design",
    file_name: "DBMS_Normalization_Notes.pdf",
    file_size: "2.1 MB",
    description: "Master normalization with real-world examples, functional dependency closure calculation, lossless join decomposition, and dependency preservation test methods.",
    downloads_count: 712,
    views_count: 2150,
    pdfContent: [
      "Unit 3: Relational Database Normalization Master Guide",
      "1. Functional Dependencies: Armstrong's Axioms (Reflexivity, Augmentation, Transitivity)",
      "2. First Normal Form (1NF): Eliminating repeating groups and atomic domain enforcement",
      "3. Second Normal Form (2NF): Eliminating partial functional dependencies on candidate keys",
      "4. Third Normal Form (3NF): Eliminating transitive dependencies (X -> Y where Y not in candidate key)",
      "5. Boyce-Codd Normal Form (BCNF): Strict condition that for every X -> Y, X must be a superkey",
      "6. Step-by-step algorithms for Canonical Cover and Lossless Join Decomposition",
    ],
  },

  // 5. DBMS - Transactions & ACID
  {
    title: "Transaction Processing, ACID Properties & Concurrency Control",
    type: "note",
    subjectCode: "CS402",
    academic_year: "2024-25",
    module_unit: "Unit 4: Transaction Management",
    file_name: "DBMS_Transactions_ACID.pdf",
    file_size: "1.9 MB",
    description: "In-depth notes on ACID properties, Conflict Serializability, Precedence Graphs, Two-Phase Locking (2PL), Deadlock Detection, and WAL Recovery.",
    downloads_count: 530,
    views_count: 1480,
    pdfContent: [
      "Unit 4: Transaction Processing & Concurrency Protocols",
      "1. ACID Properties: Atomicity, Consistency, Isolation, Durability breakdown",
      "2. Serializability: Conflict Serializability, View Serializability, and Precedence Graph testing",
      "3. Lock-Based Protocols: Shared (S) and Exclusive (X) locks; Two-Phase Locking (2PL)",
      "4. Strict 2PL vs Rigorous 2PL: Cascading abort prevention and serializable schedules",
      "5. Deadlock Handling: Wait-Die vs Wound-Wait timestamp schemes and Wait-For Graphs",
      "6. Log-Based Recovery: Write-Ahead Logging (WAL) and ARIES recovery algorithm",
    ],
  },

  // 6. DSA - Graph Algorithms
  {
    title: "Graph Algorithms: Shortest Path & Minimum Spanning Trees",
    type: "note",
    subjectCode: "CS301",
    academic_year: "2024-25",
    module_unit: "Unit 4: Advanced Graphs",
    file_name: "DSA_Graph_Algorithms.pdf",
    file_size: "1.8 MB",
    description: "Detailed pseudocode, time complexity proofs, and step-by-step traces for Dijkstra, Bellman-Ford, Floyd-Warshall, Kruskal, and Prim algorithms.",
    downloads_count: 890,
    views_count: 2670,
    pdfContent: [
      "Unit 4: Advanced Graph Algorithms & Complexity Proofs",
      "1. Graph Representations: Adjacency Matrix O(V^2) vs Adjacency List O(V+E) tradeoffs",
      "2. Single-Source Shortest Path: Dijkstra's Algorithm with Min-Heap in O((V+E) log V)",
      "3. Bellman-Ford Algorithm: Handling negative edge weights and cycle detection in O(V * E)",
      "4. All-Pairs Shortest Path: Floyd-Warshall Dynamic Programming in O(V^3)",
      "5. Disjoint Set Union (DSU): Path Compression and Union by Rank for near-linear O(alpha(V))",
      "6. Minimum Spanning Trees (MST): Kruskal's greedy edge sorting vs Prim's vertex expansion",
    ],
  },

  // 7. DSA - Dynamic Programming & Trees
  {
    title: "Dynamic Programming Patterns & Self-Balancing Trees",
    type: "note",
    subjectCode: "CS301",
    academic_year: "2024-25",
    module_unit: "Unit 5: DP & Advanced Trees",
    file_name: "DSA_DP_Trees_Notes.pdf",
    file_size: "2.2 MB",
    description: "Lecture notes on 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, AVL Tree rotations (LL, RR, LR, RL), and Red-Black Trees.",
    downloads_count: 620,
    views_count: 1780,
    pdfContent: [
      "Unit 5: Dynamic Programming Patterns & Self-Balancing Trees",
      "1. Dynamic Programming Paradigms: Optimal Substructure and Overlapping Subproblems",
      "2. 0/1 Knapsack: Recursive recurrence relation, Memoization table, and Tabulation state transition",
      "3. Longest Common Subsequence (LCS): Table filling and traceback path recovery",
      "4. Matrix Chain Multiplication: Parenthesization cost minimization in O(n^3)",
      "5. AVL Trees: Balance factor definition and 4 rotation cases (LL, RR, LR, RL)",
      "6. Red-Black Trees: Invariant properties (Black-height, Red-parent rule) and operations",
    ],
  },

  // 8. Computer Networks - Protocols & Subnetting
  {
    title: "TCP/IP Protocol Suite, Flow Control & CIDR Subnetting",
    type: "note",
    subjectCode: "CS501",
    academic_year: "2024-25",
    module_unit: "Unit 2: Transport & Network Layers",
    file_name: "CN_Protocols_Subnetting.pdf",
    file_size: "2.3 MB",
    description: "Complete guide on IP addressing, CIDR, VLSM calculation, TCP 3-way handshake, TCP Congestion Control (Slow Start, Congestion Avoidance), and sliding window protocols.",
    downloads_count: 450,
    views_count: 1290,
    pdfContent: [
      "Unit 2: Computer Networks & Transport Architecture",
      "1. OSI 7-Layer Model vs TCP/IP 4-Layer Architecture and protocol mapping",
      "2. IPv4 Addressing & CIDR: Subnet masks, network ID, broadcast address, and VLSM formulas",
      "3. Sliding Window Protocols: Stop-and-Wait, Go-Back-N (GBN), and Selective Repeat (SR)",
      "4. TCP Connection Management: 3-Way Handshake (SYN, SYN-ACK, ACK) and 4-Way Teardown (FIN)",
      "5. TCP Congestion Control: Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery",
      "6. Application Protocols: DNS recursive/iterative lookups, HTTP/1.1 vs HTTP/2 multiplexing",
    ],
  },

  // 9. Computer Architecture - Pipelining & Cache
  {
    title: "Instruction Pipelining, Hazards & Cache Memory Organization",
    type: "note",
    subjectCode: "CS403",
    academic_year: "2024-25",
    module_unit: "Unit 3: Processor Design & Memory",
    file_name: "CA_Pipelining_Hazards_Notes.pdf",
    file_size: "1.7 MB",
    description: "Covers 5-stage MIPS pipeline (IF, ID, EX, MEM, WB), Structural/Data/Control hazards, Forwarding, Branch prediction, Direct/Set-associative Cache mapping, and Cache hit time.",
    downloads_count: 380,
    views_count: 1040,
    pdfContent: [
      "Unit 3: Computer Architecture & Pipelining Organization",
      "1. 5-Stage RISC Pipeline: Instruction Fetch (IF), Instruction Decode (ID), Execute (EX), Memory (MEM), Writeback (WB)",
      "2. Pipeline Speedup Formula: Ideal speedup S = k (stages) under CPI = 1 assumption",
      "3. Pipeline Hazards: Structural hazards, Data hazards (RAW, WAR, WAW), Control hazards (Branches)",
      "4. Hazard Resolution Techniques: Stalling (bubbles), Data Forwarding/Bypassing, Branch Prediction",
      "5. Cache Mapping Techniques: Direct-Mapped, Fully Associative, and N-Way Set Associative",
      "6. Cache Performance: Hit Ratio, Miss Penalty, and Average Memory Access Time (AMAT)",
    ],
  },

  // 10. Web Technologies - REST & System Design
  {
    title: "RESTful API Architecture, JWT Authentication & Modern Web",
    type: "note",
    subjectCode: "IT502",
    academic_year: "2024-25",
    module_unit: "Unit 3: Web Systems Architecture",
    file_name: "WT_REST_Architecture_Notes.pdf",
    file_size: "2.0 MB",
    description: "Full-stack architectural guide covering REST constraints, HTTP methods and status codes, stateless JWT token authentication, CORS security policies, and caching.",
    downloads_count: 510,
    views_count: 1390,
    pdfContent: [
      "Unit 3: Web Technologies & Distributed Web Systems",
      "1. REST Constraints: Client-Server separation, Statelessness, Cacheability, Uniform Interface, Layered System",
      "2. HTTP Semantics: GET, POST, PUT, PATCH, DELETE idempotency and response status code taxonomy",
      "3. JSON Web Tokens (JWT): Header, Payload, Signature construction and cryptographic verification",
      "4. Web Security Essentials: Cross-Origin Resource Sharing (CORS), CSRF tokens, XSS mitigation",
      "5. API Scalability: Rate limiting, Reverse Proxies (Nginx), Load Balancers, and Redis caching",
    ],
  },

  // 11. Machine Learning - Supervised Methods
  {
    title: "Supervised Learning: Regressions, SVM & Decision Trees",
    type: "note",
    subjectCode: "CS601",
    academic_year: "2024-25",
    module_unit: "Unit 2: Supervised Methods",
    file_name: "ML_Supervised_Learning_Notes.pdf",
    file_size: "3.1 MB",
    description: "Mathematical formulation of Gradient Descent, Cost Functions, Regularization (L1 Lasso, L2 Ridge), Maximum Margin Hyperplane for SVM, and Information Gain / Gini Impurity.",
    downloads_count: 570,
    views_count: 1610,
    pdfContent: [
      "Unit 2: Machine Learning Supervised Learning Foundations",
      "1. Linear & Logistic Regression: Cost function formulation and Batch vs Stochastic Gradient Descent",
      "2. Regularization & Generalization: L1 Lasso (sparsity) and L2 Ridge (weight shrinkage) techniques",
      "3. Support Vector Machines (SVM): Hyperplane geometry, Soft-margin C parameter, and Kernel trick (RBF)",
      "4. Decision Trees: Shannon Entropy, Information Gain calculation, Gini Impurity, and Pruning strategies",
      "5. Ensemble Techniques: Bagging (Random Forest) vs Boosting (AdaBoost, XGBoost) mechanics",
    ],
  },

  // 12. Programming in C - Pointers & Memory
  {
    title: "Pointers, Dynamic Memory Allocation & Data Structures in C",
    type: "note",
    subjectCode: "CS101",
    academic_year: "2024-25",
    module_unit: "Unit 3: Pointers & Memory",
    file_name: "C_Pointers_Memory_Notes.pdf",
    file_size: "1.5 MB",
    description: "Deep dive into pointer arithmetic, double pointers, function pointers, malloc/calloc/realloc/free, memory leaks, and linked list construction.",
    downloads_count: 730,
    views_count: 2200,
    pdfContent: [
      "Unit 3: Programming in C - Advanced Pointers & Memory Management",
      "1. Pointer Fundamentals: Address-of (&), Dereference (*), and Pointer Arithmetic scaling",
      "2. Dynamic Memory Management: malloc(), calloc(), realloc(), and free() on the Heap",
      "3. Common Memory Bugs: Dangling pointers, Memory leaks, Buffer overflows, Double-free errors",
      "4. Structures & Self-Referential Types: Node struct definition and Singly Linked List operations",
    ],
  },

  // 13. Engineering Mathematics I - Linear Algebra
  {
    title: "Linear Algebra: Matrix Transformations, Eigenvalues & Diagonalization",
    type: "note",
    subjectCode: "MATH101",
    academic_year: "2024-25",
    module_unit: "Unit 2: Matrix Theory",
    file_name: "MATH_Linear_Algebra_Notes.pdf",
    file_size: "2.4 MB",
    description: "Matrix determinants, rank, Gaussian elimination, characteristic equations, Cayley-Hamilton theorem, Eigenvalues and Eigenvectors, and orthogonal diagonalization.",
    downloads_count: 610,
    views_count: 1720,
    pdfContent: [
      "Unit 2: Engineering Mathematics I - Matrix Theory & Linear Algebra",
      "1. Systems of Linear Equations: Row Echelon Form, Rank of a Matrix, and Rouché-Capelli Theorem",
      "2. Characteristic Equation: det(A - lambda*I) = 0 and computation of Eigenvalues & Eigenvectors",
      "3. Cayley-Hamilton Theorem: Verification and computation of inverse matrix A^(-1) and higher powers",
      "4. Diagonalization: Modal Matrix P, Spectral decomposition, and Orthogonal similarity transformations",
    ],
  },

  // 14. Digital Electronics
  {
    title: "Digital Electronics: Boolean Logic, Combinational Circuits & Flip-Flops",
    type: "note",
    subjectCode: "EC301",
    academic_year: "2024-25",
    module_unit: "Unit 3: Logic Design",
    file_name: "EC_Digital_Logic_Notes.pdf",
    file_size: "1.6 MB",
    description: "Karnaugh Maps (K-maps) simplification, Multiplexers, Decoders, Encoders, Half/Full Adders, Latches, SR/JK/D/T Flip-Flops, and Synchronous Counters.",
    downloads_count: 420,
    views_count: 1190,
    pdfContent: [
      "Unit 3: Digital Electronics & Sequential Logic Circuits",
      "1. Boolean Algebra & K-Maps: 3-variable and 4-variable Karnaugh Map minimization with Don't Care states",
      "2. Combinational Circuit Design: Multiplexers (4:1, 8:1), Demultiplexers, Decoders (3:8), and Priority Encoders",
      "3. Arithmetic Circuits: Half Adder, Full Adder, and Ripple Carry Adder propagation delay analysis",
      "4. Sequential Logic: SR Latch, Master-Slave JK Flip-Flop race-around condition, D and T Flip-Flops",
      "5. Synchronous Counter Design: Excitation tables, state diagrams, and Modulo-N counter construction",
    ],
  },

  // 15. PYQ: Operating Systems End-Term
  {
    title: "Operating Systems – End-Term University Exam (Solved with Answer Key)",
    type: "pyq",
    subjectCode: "CS401",
    academic_year: "2023-24",
    module_unit: "End-Term University Exam",
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

  // 16. PYQ: DBMS Mid-Term
  {
    title: "DBMS – Mid-Term Exam Paper (With Complete SQL Solutions)",
    type: "pyq",
    subjectCode: "CS402",
    academic_year: "2023-24",
    module_unit: "Mid-Term Examination",
    file_name: "DBMS_MidTerm_2023_Solved.pdf",
    file_size: "1.9 MB",
    description: "Mid-semester examination paper with ER diagrams, SQL queries for complex joins, and 3NF/BCNF normalization decomposition walkthrough.",
    downloads_count: 654,
    views_count: 1820,
    pdfContent: [
      "Database Management Systems Mid-Term Exam Paper",
      "Section A: Relational Algebra & Tuple Relational Calculus",
      "Section B: Complex SQL Queries with Group By, Having, and Correlated Subqueries",
      "Section C: Normalization problem with functional dependencies F = {A->B, BC->D, D->E}",
      "Model solutions written and reviewed by Computer Science Faculty.",
    ],
  },

  // 17. PYQ: DSA End-Semester
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

  // 18. PYQ: Computer Networks Final
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

export async function initDatabaseAndSeed(): Promise<void> {
  const db = await getDatabase();

  // Create uploads directories
  const targetDirs = [
    path.join(process.cwd(), "uploads"),
    path.join(process.cwd(), "public", "uploads"),
    path.join("/tmp", "uploads"),
  ];
  for (const d of targetDirs) {
    try {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    } catch {}
  }

  // Ensure default demo faculty & student accounts exist
  const salt = await bcrypt.genSalt(10);
  const facultyPasswordHash = await bcrypt.hash("faculty123", salt);
  const studentPasswordHash = await bcrypt.hash("student123", salt);

  let facultyId = 1;
  let studentId = 2;

  const facultyUser = await db.getOne("SELECT id, password FROM users WHERE email = ?;", ["faculty@college.edu"]);
  const studentUser = await db.getOne("SELECT id, password FROM users WHERE email = ?;", ["student@college.edu"]);

  if (!facultyUser) {
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
    facultyId = Number(facultyRes.insertId) || 1;
  } else {
    facultyId = Number(facultyUser.id) || 1;
    if (!facultyUser.password || facultyUser.password.length < 10) {
      await db.execute("UPDATE users SET password = ? WHERE id = ?;", [facultyPasswordHash, facultyId]);
    }
  }

  if (!studentUser) {
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
    studentId = Number(studentRes.insertId) || 2;
  } else {
    studentId = Number(studentUser.id) || 2;
    if (!studentUser.password || studentUser.password.length < 10) {
      await db.execute("UPDATE users SET password = ? WHERE id = ?;", [studentPasswordHash, studentId]);
    }
  }

  // Ensure subjects exist
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

  // Pre-generate PDF files on disk for all catalog items and test.pdf
  for (const item of SAMPLE_MATERIALS_CATALOG) {
    const pdfBuf = buildPdfDocument({
      title: item.title,
      subject: item.subjectCode,
      moduleUnit: item.module_unit,
      academicYear: item.academic_year,
      summaryNote: item.description,
      sections: [
        {
          heading: "Lecture Modules & Key Topics",
          items: item.pdfContent,
        },
      ],
    });
    writePdfToDisk(item.file_name, pdfBuf);
  }

  // Also ensure standalone test.pdf is always present
  const testBuf = generateFallbackPdf("test.pdf");
  writePdfToDisk("test.pdf", testBuf);

  // Check materials in database: if fewer than 10 or only test material, seed the full catalog
  const subjects = await db.query("SELECT id, code, name, semester, branch FROM subjects;");
  const subMap = new Map<string, any>();
  subjects.forEach((s) => subMap.set(s.code, s));

  const currentMaterials = await db.query("SELECT id, file_name FROM materials;");
  const existingFiles = new Set(currentMaterials.map((m: any) => m.file_name));

  for (const mat of SAMPLE_MATERIALS_CATALOG) {
    if (existingFiles.has(mat.file_name)) {
      // If test.pdf exists with old title, update it with full details
      if (mat.file_name === "test.pdf") {
        await db.execute(
          `UPDATE materials SET 
             title = ?, description = ?, module_unit = ?, academic_year = ?, 
             downloads_count = CASE WHEN downloads_count = 0 THEN 520 ELSE downloads_count END,
             views_count = CASE WHEN views_count = 0 THEN 1450 ELSE views_count END
           WHERE file_name = ?;`,
          [mat.title, mat.description, mat.module_unit, mat.academic_year, "test.pdf"]
        );
      }
      continue;
    }

    const sub = subMap.get(mat.subjectCode);
    if (!sub) continue;

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

  console.log(`[DB Seed] Verified ${SAMPLE_MATERIALS_CATALOG.length} demo lecture notes and PYQs with real PDF files.`);
}
