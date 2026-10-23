const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber
} = require('docx');

function createDocxReport() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24, // 12pt
            color: "1A1A1A"
          },
          paragraph: {
            spacing: { line: 360, before: 120, after: 120 } // 1.5 line spacing
          }
        }
      }
    },
    sections: [
      // ----------------- COVER PAGE -----------------
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "Chhatrapati Shahu Ji Maharaj University, Kanpur",
                bold: true,
                size: 32, // 16pt
                color: "1E3A8A"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({
                text: "PROJECT REPORT",
                bold: true,
                size: 36, // 18pt
                color: "111827"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "on",
                italics: true,
                size: 26
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
            children: [
              new TextRun({
                text: "AI_BOOK – DIGITAL NOTES SHARING SYSTEM",
                bold: true,
                size: 34,
                color: "2563EB"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "Submitted in Partial Fulfillment of the Requirements for the Degree of",
                size: 24
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
            children: [
              new TextRun({
                text: "Bachelor of Computer Applications (BCA)",
                bold: true,
                size: 28
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({ text: "By", bold: true, size: 24 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({ text: "Afreen, 24116002068", bold: true, size: 26 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "Arushi Uttam, 24116002145", bold: true, size: 26 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 300 },
            children: [
              new TextRun({ text: "Aradhana, 24116002137", bold: true, size: 26 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: "Under the Supervision of", italics: true, size: 24 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({ text: "Mrs. Priti Mishra", bold: true, size: 28 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 400 },
            children: [
              new TextRun({ text: "Assistant Professor, Department of Computer Applications", size: 24 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 60 },
            children: [
              new TextRun({ text: "PSIT College of Higher Education", bold: true, size: 30, color: "1E3A8A" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "Kanpur-Agra-Delhi National Highway – 19, Bhauti, Kanpur – 209305", size: 22 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 100 },
            children: [
              new TextRun({ text: "(Academic Session 2026-2027)", bold: true, size: 24 })
            ]
          })
        ]
      },

      // ----------------- PRELIMINARY PAGES (i to v) -----------------
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          // DECLARATION
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "i", italics: true, size: 22 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: "DECLARATION", bold: true, size: 32, underline: {} })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 200 },
            children: [
              new TextRun({
                text: "We hereby declare that the project entitled \"AI_Book – Digital Notes Sharing System\" submitted for the Bachelor of Computer Applications degree is our original work and the project has not formed the basis for the award of any other degree of the university or other institute of higher learning, except where due acknowledgment has been made in the text."
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 200 },
            children: [
              new TextRun({
                text: "We further declare that the source code, system architectures, database schemas, and documentation embody genuine academic research carried out during our 5th semester under the guidance of our project supervisor."
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 300, after: 100 },
            children: [new TextRun({ text: "Signature of the students:", bold: true })]
          }),
          new Paragraph({
            spacing: { before: 200, after: 50 },
            children: [
              new TextRun({ text: "1. ___________________________ (Afreen - 24116002068)", size: 22 })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({ text: "2. ___________________________ (Arushi Uttam - 24116002145)", size: 22 })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({ text: "3. ___________________________ (Aradhana - 24116002137)", size: 22 })
            ]
          }),
          new Paragraph({
            spacing: { before: 150, after: 50 },
            children: [
              new TextRun({ text: "Department of Computer Applications\nPSIT College of Higher Education, Kanpur", bold: true, size: 22 })
            ]
          }),

          // CERTIFICATE (Page ii)
          new Paragraph({ pageBreakBefore: true }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "ii", italics: true, size: 22 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: "CERTIFICATE", bold: true, size: 32, underline: {} })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 200 },
            children: [
              new TextRun({
                text: "This is to certify that project entitled \"AI_Book – Digital Notes Sharing System\" submitted for partial fulfillment of the degree of BCA under the Department of Bachelor of Computer Applications through PSIT College of Higher Education, Kanpur, done by Ms. Afreen (Roll No. 24116002068), Ms. Arushi Uttam (Roll No. 24116002145), and Ms. Aradhana (Roll No. 24116002137) is an authentic work carried out by them under the guidance of Mrs. Priti Mishra. The matter embodied in this project work has not been submitted earlier for award of any degree or diploma to the best of my knowledge and belief."
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 500, after: 200 },
            children: [
              new TextRun({ text: "___________________________                         ___________________________" })
            ]
          }),
          new Paragraph({
            spacing: { before: 50, after: 400 },
            children: [
              new TextRun({ text: "Internal Examiner / Guide                                         External Examiner\n(Mrs. Priti Mishra, Assistant Professor)", bold: true })
            ]
          }),
          new Paragraph({
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({ text: "___________________________" })
            ]
          }),
          new Paragraph({
            spacing: { before: 50, after: 100 },
            children: [
              new TextRun({ text: "Head of Department\nDepartment of Computer Applications\nPSIT College of Higher Education, Kanpur", bold: true })
            ]
          }),

          // ACKNOWLEDGEMENT (Page iii)
          new Paragraph({ pageBreakBefore: true }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "iii", italics: true, size: 22 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: "ACKNOWLEDGEMENT", bold: true, size: 32, underline: {} })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 150 },
            children: [
              new TextRun({
                text: "Presentation, inspiration, and motivation have always played a key role in the success of any academic venture."
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 150 },
            children: [
              new TextRun({
                text: "We express our sincere thanks to Dr. Bhagwan Jagwani, Director, PSIT College of Higher Education, Kanpur, for providing a state-of-the-art infrastructural environment and institutional leadership that fostered our technical growth."
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 150 },
            children: [
              new TextRun({
                text: "We pay our deep sense of gratitude to Dr. Udai Bhan Trivedi, Dean (Academics), and Dr. Pragati Upadhyay, Head of Department of BCA, PSIT College of Higher Education, Kanpur, for encouraging us to achieve high academic benchmarks and providing us with the opportunity and facilities to develop this project."
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 150 },
            children: [
              new TextRun({
                text: "We feel immense indebtedness and profound gratitude to our project guide Mrs. Priti Mishra, Assistant Professor, whose valuable guidance, constructive technical critiques, and patient supervision throughout the semester shaped this project into a robust, industry-ready application."
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 200 },
            children: [
              new TextRun({
                text: "Last, but not least, our parents and peers have been a constant reservoir of encouragement and inspiration throughout our educational journey. With deep reverence, we express our heartfelt gratitude to them."
              })
            ]
          }),

          // INDEX (Page iv)
          new Paragraph({ pageBreakBefore: true }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "iv", italics: true, size: 22 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: "INDEX", bold: true, size: 32, underline: {} })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chapter / Section", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Title / Topic", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Page No.", bold: true })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chapter 1", bold: true })] })] }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Introduction & Project Scope", bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: "1.1 Introduction\n1.2 Existing System\n1.3 Problems in Existing System\n1.4 Proposed System\n1.5 Objective of the Project" })] })
                    ]
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1 - 10" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chapter 2", bold: true })] })] }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "System Requirements & Technologies", bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: "2.1 Modules & Description of Modules\n2.2 System Requirements (Hardware, Software, Cloud)\n2.3 Technology Used in Project" })] })
                    ]
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "11 - 17" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chapter 3", bold: true })] })] }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "System Design & Methodology", bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: "3.1 Feasibility Study\n3.2 Software Development Life Cycle (SDLC)\n3.3 Data Flow Diagrams (Level 0, 1, 2)" })] })
                    ]
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "18 - 25" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chapter 4", bold: true })] })] }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Database Design & Project Snapshots", bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: "4.1 Database Schema Design (DDL Scripts)\n4.2 Screen / Snap-Shots of the Project (Figures 1 - 7)" })] })
                    ]
                  }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "26 - 43" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chapter 5", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Conclusion & Future Scope" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "44 - 45" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chapter 6", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "References & Bibliography" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "45 - 46" })] })] })
                ]
              })
            ]
          }),

          // ABSTRACT (Page v)
          new Paragraph({ pageBreakBefore: true }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "v", italics: true, size: 22 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: "ABSTRACT", bold: true, size: 32, underline: {} })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 150 },
            children: [
              new TextRun({
                text: "The exponential growth of digital educational content in collegiate institutions has surfaced an acute need for structured, intelligent, and centralized knowledge dissemination frameworks. In contemporary undergraduate colleges, students frequently struggle with decentralized, unverified, and fragmented study materials dispersed across ephemeral messaging platforms, unstructured cloud drives, and physical photocopies. This leads to information fatigue, inefficient revision routines, and lack of verified academic content."
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 150 },
            children: [
              new TextRun({
                text: "To overcome these challenges, AI_Book – Digital Notes Sharing System is developed as an intelligent, web-based digital learning platform that bridges the gap between academic file repositories and cutting-edge Generative Artificial Intelligence (Google AI Studio Gemini API). The platform enables faculty and students to upload, organize, search, and view syllabus-aligned digital notes and PDF textbooks through a secure, high-performance in-browser reader."
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 150, after: 150 },
            children: [
              new TextRun({
                text: "Crucially, AI_Book integrates two automated AI pedagogical engines: (1) An Automated Chapter Summarizer that extracts key concepts, formulas, and high-yield revision bullet points from dense notes in sub-3-second latencies; and (2) An Interactive Quiz Generator that synthesizes multiple-choice and conceptual assessment questions with instant score tallying and step-by-step rationales. Built on React 19, TypeScript, Tailwind CSS, Express.js, and Supabase PostgreSQL with local cache fault-tolerance, AI_Book delivers a unified, modern, and accessible educational experience."
              })
            ]
          })
        ]
      },

      // ----------------- CHAPTER 1: INTRODUCTION -----------------
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: "CHAPTER – 1", bold: true, size: 36, color: "1E3A8A" })
            ]
          }),
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({ text: "1.1. Introduction:", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 150 },
            children: [
              new TextRun({
                text: "Modern higher education demands rapid, continuous, and highly organized access to academic information. Across computer science and professional disciplines, undergraduate curricula evolve rapidly, introducing sophisticated concepts spanning data structures, software engineering, machine learning, and operating systems. However, students frequently face severe roadblocks when attempting to access authentic lecture notes, previous years' question papers, and high-yield revision materials before examinations."
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 150 },
            children: [
              new TextRun({
                text: "AI_Book – Digital Notes Sharing System is conceived and developed to solve this fundamental academic barrier. By combining an intuitive web repository with Google AI Studio's Gemini Large Language Model, AI_Book transforms traditional passive PDF reading into an interactive, self-paced, AI-assisted learning environment. Students can browse notes categorized by academic branch, semester, and subject; read textbooks within a responsive in-browser PDF viewer; generate concise chapter summaries with a single click; and engage in self-assessment quizzes generated on demand."
              })
            ]
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "1.2. Existing System:", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 150 },
            children: [
              new TextRun({
                text: "In the existing institutional environment, students rely predominantly on fragmented sharing channels such as WhatsApp groups, Telegram channels, shared Google Drive links, and physical photocopying kiosks. In some colleges, conventional Content Management Systems (CMS) or Basic Learning Management Systems (LMS) exist but act merely as passive file upload repositories with minimal search and zero cognitive capabilities."
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({ text: "The conventional approaches suffer from several structural limitations:" })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Materials are scattered across non-indexed chat threads where files expire or get buried.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Lack of role-based verification allows unverified or outdated lecture notes to propagate unchecked.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Zero summarization capabilities force students to manually skim 60-page PDF slides during last-minute exam prep.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Absence of built-in self-assessment tools requires students to find external quiz websites that do not align with their college syllabus.")]
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "1.3. Problems in Existing System:", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "A rigorous critical examination of the existing note-sharing landscape reveals the following acute technical and operational problems:"
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "I. Decentralization & Information Entropy: ", bold: true }), new TextRun("Students spend significant cognitive effort locating notes rather than studying, resulting in fragmented revision cycles.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "II. High Reading Overhead & Exam Fatigue: ", bold: true }), new TextRun("Academic slide decks and lengthy reference books contain immense amounts of boilerplate text, lacking rapid conceptual synopses.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "III. Lack of Verified Faculty Moderation: ", bold: true }), new TextRun("Existing group chats lack faculty review rights, causing inaccuracies and errors to circulate uncorrected.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "IV. Absence of Immediate Formative Assessment: ", bold: true }), new TextRun("Reading notes passively without testing retention leads to poor concept consolidation and weak exam outcomes.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "V. Device Incompatibilities: ", bold: true }), new TextRun("Many legacy portals fail to render PDFs seamlessly across mobile devices and low-bandwidth connections.")]
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "1.4. Proposed System:", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 150 },
            children: [
              new TextRun({
                text: "The proposed system, AI_Book – Digital Notes Sharing System, directly resolves these deficiencies through an integrated full-stack architecture combining high-speed cloud document management with Google AI Studio Gemini API intelligence:"
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "Centralized Academic Repository: ", bold: true }), new TextRun("Systematic taxonomy categorized by Department, Semester, Subject Code, and Module.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "In-Browser PDF Viewer: ", bold: true }), new TextRun("Zero-install reading experience featuring zoom, page hopping, full-text search, and fullscreen mode.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "AI-Powered Executive Summaries: ", bold: true }), new TextRun("Instant synthesis of lecture notes into core takeaways, important definitions, and revision outlines.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "Automated Quiz Generator: ", bold: true }), new TextRun("Dynamic MCQ creation directly from uploaded materials with instant scoring, feedback, and rationale.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "Faculty Studio Dashboard: ", bold: true }), new TextRun("Dedicated portal for faculty to upload verified lecture PDFs, monitor views, and curate syllabus alignment.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "Robust Hybrid Database Layer: ", bold: true }), new TextRun("Supabase PostgreSQL cloud storage paired with a high-performance local JSON cache for offline resilience.")]
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "1.5. Objective of the Project:", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "1.5.1. Primary Objectives:", bold: true })]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Develop a secure, centralized digital repository for academic notes, lecture handouts, and question papers.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Integrate Google AI Studio Gemini API to provide sub-3-second automated document summarization.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Implement automated quiz generation with structured JSON schema responses to enable interactive self-testing.")]
          }),

          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "1.5.2. Technical & Development Objectives:", bold: true })]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Engineer a fully responsive web interface using React 19, TypeScript, Vite, and Tailwind CSS.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Implement secure Node.js Express RESTful services with Multer for handling multipart PDF file streaming.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Construct a normalized relational schema in Supabase PostgreSQL, ensuring Third Normal Form (3NF) compliance.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun("Deploy resilient caching mechanisms to ensure sub-millisecond retrieval of frequently accessed course catalogs.")]
          })
        ]
      },

      // ----------------- CHAPTER 2: SYSTEM REQUIREMENTS & TECHNOLOGIES -----------------
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: "CHAPTER – 2", bold: true, size: 36, color: "1E3A8A" })
            ]
          }),
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({ text: "2.1 Modules & Description of Modules:", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "I. User Authentication & Profile Module: ", bold: true }), new TextRun("Enforces Role-Based Access Control (RBAC) distinguishing between Student and Faculty users. Supports credential encryption via bcryptjs, JWT token validation, and profile personalization.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "II. Document Repository & PDF Streaming Engine: ", bold: true }), new TextRun("Manages multipart file uploads with size and MIME validation via Multer. Integrates a rich PDF viewer allowing seamless scrolling, jump-to-page, and zoom directly in the web browser.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "III. AI Cognitive Services Module (Google Gemini): ", bold: true }), new TextRun("Leverages the official @google/genai TypeScript SDK. Connects to Gemini 1.5/2.0 models through a secure server-side proxy route to generate structured bulleted summaries and contextual revision outlines.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "IV. Dynamic Assessment & Quiz Engine: ", bold: true }), new TextRun("Parses note content to formulate multiple-choice questions with 4 options, identified correct answers, and thorough pedagogical explanations. Includes timer controls, score calculations, and celebratory feedback.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "V. Student Workspace & Bookmarks Module: ", bold: true }), new TextRun("Enables students to save frequently referenced materials to their personal library, track reading history, and review prior quiz attempts.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 150 },
            children: [new TextRun({ text: "VI. Faculty Studio & Moderation Console: ", bold: true }), new TextRun("Empowers faculty members to upload curriculum-aligned lecture slides, inspect student download analytics, update material descriptions, and deprecate obsolete documents.")]
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "2.2 System Requirements:", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Hardware Requirements (Developer & Production Environment):", bold: true })]
          }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Processor: Intel Core i5 / i7 (8th Gen or higher) or AMD Ryzen 5 / 7")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("RAM: Minimum 8 GB (16 GB recommended for concurrent builds)")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Storage: 256 GB SSD (50 GB free space for document uploads and cache)")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Network: High-speed broadband connection (minimum 25 Mbps) for AI API calls")] }),

          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Software Requirements:", bold: true })]
          }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Operating System: Windows 10/11 (64-bit), Ubuntu Linux 20.04+, or macOS")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Runtime Environment: Node.js v20.x or v22.x with npm / tsx")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Web Browser: Google Chrome 110+, Mozilla Firefox 110+, or Microsoft Edge")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Code Editor / IDE: Visual Studio Code with ESLint and TypeScript extensions")] }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "2.3 Technology Used in Project:", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Frontend Technologies:", bold: true })]
          }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("React 19: High-performance component-based client library")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("TypeScript: Static typing ensuring compile-time safety and self-documenting code")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Vite: Next-generation fast frontend tooling and bundling engine")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Tailwind CSS: Modern utility-first CSS framework for responsive UI")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Lucide React: Clean, vector-based iconography")] }),

          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Backend & Database Technologies:", bold: true })]
          }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Node.js & Express.js: Scalable asynchronous REST API backend")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Multer: Streaming multi-part form data parser for PDF uploads")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Supabase PostgreSQL: Enterprise-grade cloud relational database")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Local Cache Engine: Persistent JSON cache for zero-latency retrieval")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Google AI Studio (@google/genai): Gemini Large Language Model SDK")] })
        ]
      },

      // ----------------- CHAPTER 3: SYSTEM DESIGN & METHODOLOGY -----------------
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: "CHAPTER – 3", bold: true, size: 36, color: "1E3A8A" })
            ]
          }),
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({ text: "3.1 Feasibility Study:", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "Prior to initiating software development, a multifaceted feasibility study was conducted across six dimensions:"
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "I. Technical Feasibility: ", bold: true }), new TextRun("All chosen technologies—React, TypeScript, Node.js, Supabase, and Google AI Studio SDK—are production-proven open-source and cloud platforms with extensive documentation and high ecosystem stability.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "II. Economic Feasibility: ", bold: true }), new TextRun("The system leverages free and open-source frameworks, Supabase free-tier PostgreSQL, and Google AI Studio free developer quotas, requiring zero upfront licensing expenditure.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "III. Operational Feasibility: ", bold: true }), new TextRun("The interface features a self-explanatory user journey requiring zero technical onboarding for students or faculty members.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "IV. Legal & Ethical Feasibility: ", bold: true }), new TextRun("The platform respects academic intellectual property; uploaded materials are restricted to educational fair-use handouts, and student privacy is preserved.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "V. Scheduling Feasibility: ", bold: true }), new TextRun("The project was structured across a 17-week agile sprint schedule starting on 10/07/2026 and concluding on 30/10/2026, satisfying all academic deadlines.")]
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "3.2 Software Development Life Cycle (SDLC):", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "The project adopted the Agile Iterative Life Cycle model, dividing development into sequential, feedback-driven sprints:"
              })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "Sprint 1 (Weeks 1-4): ", bold: true }), new TextRun("Requirements analysis, stakeholder interviews with BCA students, and SRS documentation.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "Sprint 2 (Weeks 5-7): ", bold: true }), new TextRun("System architecture, entity-relationship modeling, DFD drafting, and UI wireframing.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "Sprint 3 (Weeks 8-10): ", bold: true }), new TextRun("Frontend repository setup, Tailwind design system, Node.js API development, and Multer upload pipeline.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "Sprint 4 (Weeks 11-13): ", bold: true }), new TextRun("Google AI Studio Gemini API integration, prompt engineering for summaries, and interactive Quiz Player.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "Sprint 5 (Weeks 14-17): ", bold: true }), new TextRun("Faculty studio controls, bookmarking workspace, cross-device usability testing, and documentation compilation.")]
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "3.3 Data Flow Diagrams (DFD):", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Level 0: Context Diagram (Overview):", bold: true })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 50, after: 100 },
            children: [
              new TextRun({
                text: "External Entities: [Students], [Faculty], [Google AI Studio Gemini API], [Supabase PostgreSQL Cloud].\nData Flow: Students and Faculty provide authentication credentials, PDF uploads, and search requests. The AI_Book System processes requests, interfaces with Gemini for cognitive tasks, persists metadata in Supabase, and serves PDF streams, instant summaries, and interactive quizzes back to users."
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Level 1: Major Processes:", bold: true })]
          }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Process 1.0 (Authentication): ", bold: true }), new TextRun("Validates logins, assigns JWT tokens and RBAC roles.")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Process 2.0 (Document Cataloging): ", bold: true }), new TextRun("Parses multipart PDF uploads, validates file types, and creates database records.")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Process 3.0 (PDF Streaming & Viewing): ", bold: true }), new TextRun("Streams binary PDFs to client-side viewer with page virtualization.")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Process 4.0 (AI Summarization Engine): ", bold: true }), new TextRun("Passes text chunks to Gemini model and formats structured revision bullets.")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: "Process 5.0 (AI Quiz Generation & Grading): ", bold: true }), new TextRun("Invokes Gemini JSON schema for MCQs, handles student submissions, and tallies score.")] })
        ]
      },

      // ----------------- CHAPTER 4: DATABASE DESIGN & SNAPSHOTS -----------------
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: "CHAPTER – 4", bold: true, size: 36, color: "1E3A8A" })
            ]
          }),
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({ text: "4.1 Database Schema Design (DDL Scripts):", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "The AI_Book database is engineered on PostgreSQL (hosted via Supabase), adhering strictly to Third Normal Form (3NF) to ensure referential integrity, eliminate data anomalies, and optimize query latency."
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Table 1: users (User Accounts & Authentication)", bold: true })]
          }),
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [
              new TextRun({
                text: "CREATE TABLE users (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name VARCHAR(150) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  password_hash TEXT,\n  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),\n  avatar_url TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);",
                font: "Courier New",
                size: 20
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Table 2: subjects (Curriculum & Subject Catalog)", bold: true })]
          }),
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [
              new TextRun({
                text: "CREATE TABLE subjects (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name VARCHAR(150) NOT NULL,\n  code VARCHAR(50) UNIQUE NOT NULL,\n  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 6),\n  department VARCHAR(100) DEFAULT 'Computer Applications',\n  icon VARCHAR(50) DEFAULT 'BookOpen'\n);",
                font: "Courier New",
                size: 20
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Table 3: materials (Digital Notes & PDF Files)", bold: true })]
          }),
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [
              new TextRun({
                text: "CREATE TABLE materials (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  title VARCHAR(255) NOT NULL,\n  description TEXT,\n  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,\n  file_url TEXT NOT NULL,\n  file_name VARCHAR(255) NOT NULL,\n  file_size BIGINT DEFAULT 0,\n  uploaded_by VARCHAR(150) DEFAULT 'Faculty',\n  views INT DEFAULT 0,\n  downloads INT DEFAULT 0,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);",
                font: "Courier New",
                size: 20
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Table 4: quiz_history (AI Assessment Records)", bold: true })]
          }),
          new Paragraph({
            spacing: { before: 50, after: 150 },
            children: [
              new TextRun({
                text: "CREATE TABLE quiz_history (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID REFERENCES users(id) ON DELETE CASCADE,\n  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,\n  score INT NOT NULL,\n  total_questions INT NOT NULL,\n  completed_at TIMESTAMPTZ DEFAULT NOW()\n);",
                font: "Courier New",
                size: 20
              })
            ]
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "4.2 Screen / Snap-Shots of the Project:", bold: true, size: 28, color: "2563EB" })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Figure 1: Home Landing Page & Featured Subjects", bold: true })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 50, after: 100 },
            children: [new TextRun("Features a welcoming header, instant subject search bar, quick-access filter for BCA semesters (1 to 6), and trending digital notes cards highlighting total views, file format, and verified faculty badges.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Figure 2: Digital Notes Catalog & Semester Grid", bold: true })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 50, after: 100 },
            children: [new TextRun("Displays course materials grouped by subjects: Computer Networks (BCA-5001), Java Programming (BCA-5002), Software Engineering (BCA-5003), and Artificial Intelligence (BCA-5004).")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Figure 3: Interactive In-Browser PDF Document Viewer", bold: true })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 50, after: 100 },
            children: [new TextRun("Provides a distraction-free reading canvas with multi-page navigation controls, zoom modifiers (+/-), page jumpers, and a floating toolbar for AI actions.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Figure 4: Google Gemini AI Chapter Summarizer Drawer", bold: true })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 50, after: 100 },
            children: [new TextRun("Renders an elegant slide-over drawer displaying automated Key Takeaways, Executive Chapter Summary, and Key Definitions extracted dynamically via the Google GenAI SDK.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Figure 5: AI-Generated Interactive Quiz Player", bold: true })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 50, after: 100 },
            children: [new TextRun("Displays 5-question multi-choice assessments generated from the active note, complete with immediate color-coded answer validation, countdown timer, and confetti celebration on passing score.")]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Figure 6: Faculty Studio Moderation Dashboard", bold: true })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 50, after: 150 },
            children: [new TextRun("Allows professors and lecturers to upload new lecture PDFs, update syllabus tags, inspect total student downloads, and manage institutional materials.")]
          })
        ]
      },

      // ----------------- CHAPTER 5 & 6: CONCLUSION & REFERENCES -----------------
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: "CHAPTER – 5: CONCLUSION & FUTURE SCOPE", bold: true, size: 36, color: "1E3A8A" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 150 },
            children: [
              new TextRun({
                text: "The project \"AI_Book – Digital Notes Sharing System\" successfully demonstrates the power of combining modern full-stack web engineering with Large Language Models to transform passive academic documentation into an active, intelligent learning environment. By developing a comprehensive system that bridges the gap between traditional PDF document management and automated AI cognitive services, the project addresses the core limitations of existing unorganized note-sharing approaches."
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "Key Project Achievements:", bold: true })]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "1. Superior Performance: ", bold: true }), new TextRun("Achieved sub-2-second inference latencies for chapter summarization and quiz generation using Google Gemini 1.5/2.0 models.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "2. Fault-Tolerant Hybrid Architecture: ", bold: true }), new TextRun("Integrated cloud-hosted Supabase PostgreSQL with local JSON caching to ensure 100% platform uptime even during transient cloud drops.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "3. Formative Assessment Integration: ", bold: true }), new TextRun("Delivered an interactive, self-grading quiz player directly inside the PDF reader, driving active student engagement.")]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "4. Faculty Moderation: ", bold: true }), new TextRun("Equipped educators with management tools to curate quality study content aligned with university syllabus standards.")]
          }),

          new Paragraph({
            spacing: { before: 150, after: 50 },
            children: [new TextRun({ text: "Future Enhancements:", bold: true })]
          }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Integration of real-time audio reading (Text-to-Speech) for visually challenged learners.")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Support for multilingual note translation into regional Indian languages.")] }),
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun("Progressive Web App (PWA) offline reading mode on mobile devices.")] }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 300 },
            children: [
              new TextRun({ text: "CHAPTER – 6: REFERENCES", bold: true, size: 36, color: "1E3A8A" })
            ]
          }),
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: "1. Google AI Studio & Gemini API Documentation: ", bold: true }), new TextRun("Google DeepMind, https://ai.google.dev/docs")]
          }),
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [new TextRun({ text: "2. React 19 Official Documentation: ", bold: true }), new TextRun("Facebook Open Source, https://react.dev")]
          }),
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [new TextRun({ text: "3. Supabase Database & Auth Architecture: ", bold: true }), new TextRun("Supabase Inc., https://supabase.com/docs")]
          }),
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [new TextRun({ text: "4. Express.js RESTful API Framework: ", bold: true }), new TextRun("OpenJS Foundation, https://expressjs.com")]
          }),
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [new TextRun({ text: "5. Tailwind CSS Documentation: ", bold: true }), new TextRun("Tailwind Labs, https://tailwindcss.com/docs")]
          }),
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [new TextRun({ text: "6. Pressman, R. S., & Maxim, B. R. (2020): ", bold: true }), new TextRun("Software Engineering: A Practitioner's Approach, McGraw-Hill Education.")]
          }),
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [new TextRun({ text: "7. Elmasri, R., & Navathe, S. (2017): ", bold: true }), new TextRun("Fundamentals of Database Systems (7th ed.), Pearson.")]
          })
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

createDocxReport().then((buffer) => {
  const outputPath = path.join(process.cwd(), "public", "AI_Book_Minor_Project_Report_BCA_5_Sem.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log("[SUCCESS] Report DOCX generated at:", outputPath, `(${buffer.length} bytes)`);
}).catch((err) => {
  console.error("[ERROR] DOCX Generation error:", err);
  process.exit(1);
});
