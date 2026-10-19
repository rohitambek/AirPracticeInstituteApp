import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import {
  Chapter,
  NotificationItem,
  PdfMaterial,
  PracticeSubmission,
  PYQPaper,
  Question,
  ShortNote,
  Subject,
  TextbookContent,
  User,
} from './types.ts';

interface DatabaseSchema {
  users: User[];
  subjects: Subject[];
  chapters: Chapter[];
  textbookContents: TextbookContent[];
  shortNotes: ShortNote[];
  questions: Question[];
  pyqPapers: PYQPaper[];
  submissions: PracticeSubmission[];
  notifications: NotificationItem[];
  pdfMaterials: PdfMaterial[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

class DatabaseService {
  private db: DatabaseSchema = {
    users: [],
    subjects: [],
    chapters: [],
    textbookContents: [],
    shortNotes: [],
    questions: [],
    pyqPapers: [],
    submissions: [],
    notifications: [],
    pdfMaterials: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        this.db.pdfMaterials = this.db.pdfMaterials || [];
        this.ensureAdminUser();
        this.ensureInitialPdfMaterials();
        this.save();
        console.log('[Database] Loaded existing database from file with PDF materials.');
        return;
      } catch (err) {
        console.error('[Database] Failed to parse existing database.json, reseeding...', err);
      }
    }

    this.seedInitialData();
    this.save();
  }

  private ensureAdminUser() {
    this.db.users = this.db.users || [];
    const existingAdmin = this.db.users.find(u => u.role === 'ADMIN' || u.loginId === 'ADMIN001');
    if (!existingAdmin) {
      const salt = bcrypt.genSaltSync(10);
      const adminUser: User = {
        id: 'usr-air-admin-01',
        loginId: 'ADMIN001',
        name: 'Principal / Admin',
        email: 'admin@airpractice.edu',
        mobile: '9820098200',
        passwordHash: bcrypt.hashSync('admin123', salt),
        targetExam: '12th Maharashtra State Board & MHT-CET',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.db.users.push(adminUser);
      console.log('[Database] Seeded Admin User: ADMIN001 / admin123');
    }
  }

  private ensureInitialPdfMaterials() {
    this.db.pdfMaterials = this.db.pdfMaterials || [];
    if (this.db.pdfMaterials.length === 0) {
      this.db.pdfMaterials = [
        {
          id: 'pdf-mat-1',
          title: '12th Physics Maharashtra State Board Complete Textbook PDF',
          section: 'Textbook',
          subject: 'Physics',
          chapterTitle: 'Rotational Dynamics & Complete Syllabus',
          year: 2024,
          description: 'Official Maharashtra State Bureau of Textbook Production and Curriculum Research syllabus textbook.',
          fileName: '12th_Physics_HSC_Textbook_2024.pdf',
          fileSize: '14.8 MB',
          fileUrl: 'https://archive.org/download/hsc-physics-12th-board/12th_Physics_Maharashtra_State_Board.pdf',
          uploadedBy: 'Principal / Admin',
          uploadedAt: '2026-09-20T10:00:00.000Z',
        },
        {
          id: 'pdf-mat-2',
          title: 'Physics High-Yield Formulae & Rapid Revision Notes PDF',
          section: 'Short Notes',
          subject: 'Physics',
          chapterTitle: 'Rotational Dynamics',
          year: 2024,
          description: 'Compact summary with moment of inertia formulas, banking of roads derivations, and shortcut tricks.',
          fileName: 'Physics_Rotational_Dynamics_Quick_Notes.pdf',
          fileSize: '2.1 MB',
          fileUrl: 'https://archive.org/download/hsc-physics-12th-board/Rotational_Dynamics_Short_Notes.pdf',
          uploadedBy: 'Principal / Admin',
          uploadedAt: '2026-09-22T14:30:00.000Z',
        },
        {
          id: 'pdf-mat-3',
          title: 'Chemistry Organic Reactions & Mechanisms Cheat-Sheet PDF',
          section: 'Short Notes',
          subject: 'Chemistry',
          chapterTitle: 'Halogen Derivatives & Aldehydes',
          year: 2024,
          description: 'Complete list of named reactions, reagents, conversions, and test-distinction reactions.',
          fileName: 'Chemistry_Organic_Reactions_Quick_Revision.pdf',
          fileSize: '3.4 MB',
          fileUrl: 'https://archive.org/download/hsc-chemistry-12th/Organic_Chemistry_Summary_Notes.pdf',
          uploadedBy: 'Principal / Admin',
          uploadedAt: '2026-09-23T09:15:00.000Z',
        },
        {
          id: 'pdf-mat-4',
          title: '12th HSC Board March 2024 Physics Official Question Paper & Solutions PDF',
          section: 'State Board PYQ Papers',
          subject: 'Physics',
          year: 2024,
          description: 'Original Board Examination paper with step-by-step model solution and marks breakdown.',
          fileName: 'HSC_Board_March_2024_Physics_Paper_Solutions.pdf',
          fileSize: '4.6 MB',
          fileUrl: 'https://archive.org/download/hsc-board-pyq-2024/HSC_March_2024_Physics_Solution.pdf',
          uploadedBy: 'Principal / Admin',
          uploadedAt: '2026-09-24T11:00:00.000Z',
        },
        {
          id: 'pdf-mat-5',
          title: '12th HSC Board March 2023 Chemistry Official Paper with Marking Scheme PDF',
          section: 'State Board PYQ Papers',
          subject: 'Chemistry',
          year: 2023,
          description: 'Full official state board question paper with teacher model solutions.',
          fileName: 'HSC_Board_March_2023_Chemistry_Paper.pdf',
          fileSize: '3.9 MB',
          fileUrl: 'https://archive.org/download/hsc-board-pyq-2023/HSC_March_2023_Chemistry_Paper.pdf',
          uploadedBy: 'Principal / Admin',
          uploadedAt: '2026-09-24T12:00:00.000Z',
        },
        {
          id: 'pdf-mat-6',
          title: 'Mathematics Calculus & Vectors Model Practice Paper PDF',
          section: 'Question Papers',
          subject: 'Mathematics',
          year: 2024,
          description: '50-marks chapter-wise practice test designed according to latest HSC state board pattern.',
          fileName: 'Maths_Calculus_Model_Question_Paper_2024.pdf',
          fileSize: '1.8 MB',
          fileUrl: 'https://archive.org/download/hsc-maths-papers/Maths_Calculus_Practice_Paper.pdf',
          uploadedBy: 'Principal / Admin',
          uploadedAt: '2026-09-25T15:20:00.000Z',
        },
        {
          id: 'pdf-mat-7',
          title: 'MHT-CET 2024 Physics & Chemistry (PCM Shift 1) Original Paper with Key PDF',
          section: 'MHT-CET PYQ Papers',
          subject: 'Physics',
          year: 2024,
          description: 'Full MHT-CET actual entrance exam questions paper with official Maharashtra CET cell answer key.',
          fileName: 'MHT_CET_2024_PCM_Shift1_Question_Paper.pdf',
          fileSize: '5.2 MB',
          fileUrl: 'https://archive.org/download/mht-cet-pyq-2024/MHT_CET_2024_PCM_Shift1.pdf',
          uploadedBy: 'Principal / Admin',
          uploadedAt: '2026-09-26T08:45:00.000Z',
        },
        {
          id: 'pdf-mat-8',
          title: 'State Board Physics Textbook Exercises & Complete Question Bank PDF',
          section: 'Textbook Questions',
          subject: 'Physics',
          chapterTitle: 'Rotational Dynamics & Mechanical Properties',
          year: 2024,
          description: 'All in-text and chapter-end exercise questions with verified board answers.',
          fileName: 'Physics_Textbook_Questions_And_Answers.pdf',
          fileSize: '6.1 MB',
          fileUrl: 'https://archive.org/download/hsc-physics-qa/Physics_Exercise_Solutions.pdf',
          uploadedBy: 'Principal / Admin',
          uploadedAt: '2026-09-26T16:00:00.000Z',
        },
      ];
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Error persisting database.json:', err);
    }
  }

  private seedInitialData() {
    console.log('[Database] Seeding fresh initial data...');

    // 1. Demo Student User matching the reference HTML prototype credentials
    // DEMO_USER = "AIR84780", DEMO_PASS = "nwt5CiwQ"
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('nwt5CiwQ', salt);

    const demoUser: User = {
      id: 'usr-air-84780',
      loginId: 'AIR84780',
      name: 'Rohit Ambekar',
      email: 'rohitambekar0198@gmail.com',
      mobile: '9876543210',
      passwordHash: demoPasswordHash,
      targetExam: '12th Maharashtra State Board & MHT-CET',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.users.push(demoUser);

    // 2. Subjects (PCMB)
    const subjects: Subject[] = [
      {
        id: 'sub-phy',
        name: 'Physics',
        icon: '⚡',
        tagline: 'Concept MCQs • Numericals • PYQs • Chapter Tests',
        totalChapters: 8,
      },
      {
        id: 'sub-chem',
        name: 'Chemistry',
        icon: '🧪',
        tagline: 'Reactions • Concepts • MCQs • PYQs • Tests',
        totalChapters: 8,
      },
      {
        id: 'sub-math',
        name: 'Mathematics',
        icon: '📐',
        tagline: 'Problems • MCQs • Important Questions • PYQs',
        totalChapters: 8,
      },
      {
        id: 'sub-bio',
        name: 'Biology',
        icon: '🧬',
        tagline: 'NCERT-linked concepts • Diagrams • MCQs • PYQs',
        totalChapters: 8,
      },
    ];
    this.db.subjects = subjects;

    // 3. Chapters
    const chapters: Chapter[] = [
      // Physics
      { id: 'ch-phy-1', subjectId: 'sub-phy', chapterNumber: 1, title: 'Rotational Dynamics', description: 'Circular motion, Banking of roads, Moment of Inertia, Rolling Motion', weightage: '7 Marks' },
      { id: 'ch-phy-2', subjectId: 'sub-phy', chapterNumber: 2, title: 'Mechanical Properties of Fluids', description: 'Surface tension, Bernoulli equation, Viscosity, Stokes law', weightage: '7 Marks' },
      { id: 'ch-phy-3', subjectId: 'sub-phy', chapterNumber: 3, title: 'Kinetic Theory of Gases & Radiation', description: 'Mean free path, Pressure of ideal gas, Stefan-Boltzmann law', weightage: '7 Marks' },
      { id: 'ch-phy-4', subjectId: 'sub-phy', chapterNumber: 4, title: 'Thermodynamics', description: 'First law, Isothermal, Adiabatic, Carnot engine, Refrigerators', weightage: '7 Marks' },
      { id: 'ch-phy-5', subjectId: 'sub-phy', chapterNumber: 5, title: 'Oscillations & Wave Optics', description: 'Simple harmonic motion, Huygens wave theory, Interference, Diffraction', weightage: '8 Marks' },
      { id: 'ch-phy-6', subjectId: 'sub-phy', chapterNumber: 6, title: 'Electrostatics & Current Electricity', description: 'Gauss Law, Electric potential, Capacitors, Kirchhoff laws, Meter bridge', weightage: '8 Marks' },
      { id: 'ch-phy-7', subjectId: 'sub-phy', chapterNumber: 7, title: 'Magnetic Effects of Electric Current', description: 'Biot-Savart Law, Ampere circuital law, Galvanometer conversion', weightage: '6 Marks' },
      { id: 'ch-phy-8', subjectId: 'sub-phy', chapterNumber: 8, title: 'Modern Physics & Semiconductors', description: 'Photoelectric effect, Bohr atomic model, Logic gates, Solar cells', weightage: '8 Marks' },

      // Chemistry
      { id: 'ch-chem-1', subjectId: 'sub-chem', chapterNumber: 1, title: 'Solid State', description: 'Crystal lattices, Unit cells, Bragg law, Defects and Electrical properties', weightage: '5 Marks' },
      { id: 'ch-chem-2', subjectId: 'sub-chem', chapterNumber: 2, title: 'Solutions', description: 'Raoults law, Colligative properties, Elevation in boiling point, Osmotic pressure', weightage: '6 Marks' },
      { id: 'ch-chem-3', subjectId: 'sub-chem', chapterNumber: 3, title: 'Ionic Equilibria', description: 'Ostwald dilution law, Buffer solutions, pH and pOH, Solubility product', weightage: '6 Marks' },
      { id: 'ch-chem-4', subjectId: 'sub-chem', chapterNumber: 4, title: 'Chemical Thermodynamics', description: 'Internal energy, Enthalpy, Hess law, Gibbs free energy spontaneity', weightage: '8 Marks' },
      { id: 'ch-chem-5', subjectId: 'sub-chem', chapterNumber: 5, title: 'Electrochemistry & Chemical Kinetics', description: 'Nernst equation, Kohlrausch law, Rate laws, Arrhenius equation', weightage: '9 Marks' },
      { id: 'ch-chem-6', subjectId: 'sub-chem', chapterNumber: 6, title: 'Transition & Inner Transition Elements', description: 'd-Block & f-Block properties, Lanthanoid contraction, Coordination compounds', weightage: '8 Marks' },
      { id: 'ch-chem-7', subjectId: 'sub-chem', chapterNumber: 7, title: 'Halogen Derivatives & Alcohols', description: 'SN1 vs SN2 mechanism, Reimer-Tiemann reaction, Lucas test', weightage: '8 Marks' },
      { id: 'ch-chem-8', subjectId: 'sub-chem', chapterNumber: 8, title: 'Aldehydes, Ketones & Carboxylic Acids', description: 'Cannizzaro reaction, Aldol condensation, Clemmensen reduction', weightage: '8 Marks' },

      // Mathematics
      { id: 'ch-math-1', subjectId: 'sub-math', chapterNumber: 1, title: 'Mathematical Logic', description: 'Statements, Truth tables, Logical connectives, Quantifiers, Duals', weightage: '8 Marks' },
      { id: 'ch-math-2', subjectId: 'sub-math', chapterNumber: 2, title: 'Matrices', description: 'Inverses by adjoint and elementary transformations, System of linear equations', weightage: '6 Marks' },
      { id: 'ch-math-3', subjectId: 'sub-math', chapterNumber: 3, title: 'Trigonometric Functions', description: 'Principal & general solutions, Polar coordinates, Sine and Cosine rules', weightage: '10 Marks' },
      { id: 'ch-math-4', subjectId: 'sub-math', chapterNumber: 4, title: 'Pair of Straight Lines & Vectors', description: 'Homogeneous equations, Angle between lines, Dot and Cross products', weightage: '12 Marks' },
      { id: 'ch-math-5', subjectId: 'sub-math', chapterNumber: 5, title: 'Differentiation', description: 'Derivatives of composite, inverse, logarithmic and parametric functions', weightage: '9 Marks' },
      { id: 'ch-math-6', subjectId: 'sub-math', chapterNumber: 6, title: 'Applications of Derivatives', description: 'Tangents and normals, Rate of change, Maxima and Minima', weightage: '9 Marks' },
      { id: 'ch-math-7', subjectId: 'sub-math', chapterNumber: 7, title: 'Indefinite & Definite Integration', description: 'Standard integrals, Integration by parts, Properties of definite integrals', weightage: '10 Marks' },
      { id: 'ch-math-8', subjectId: 'sub-math', chapterNumber: 8, title: 'Differential Equations & Probability', description: 'Order, degree, Variable separable, Linear differential equations, Binomial', weightage: '10 Marks' },

      // Biology
      { id: 'ch-bio-1', subjectId: 'sub-bio', chapterNumber: 1, title: 'Reproduction in Lower and Higher Plants', description: 'Microsporogenesis, Megasporogenesis, Double fertilization, Endosperm', weightage: '8 Marks' },
      { id: 'ch-bio-2', subjectId: 'sub-bio', chapterNumber: 2, title: 'Reproduction in Lower and Higher Animals', description: 'Male & female reproductive systems, Gametogenesis, Menstrual cycle', weightage: '8 Marks' },
      { id: 'ch-bio-3', subjectId: 'sub-bio', chapterNumber: 3, title: 'Inheritance and Variation', description: 'Mendelian genetics, Incomplete dominance, Linkage and crossing over', weightage: '6 Marks' },
      { id: 'ch-bio-4', subjectId: 'sub-bio', chapterNumber: 4, title: 'Molecular Basis of Inheritance', description: 'DNA replication, Transcription, Genetic code, Translation, Lac operon', weightage: '8 Marks' },
      { id: 'ch-bio-5', subjectId: 'sub-bio', chapterNumber: 5, title: 'Origin and Evolution of Life', description: 'Urey-Miller experiment, Theories of evolution, Modern synthetic theory', weightage: '6 Marks' },
      { id: 'ch-bio-6', subjectId: 'sub-bio', chapterNumber: 6, title: 'Plant Water Relation & Growth', description: 'Osmosis, Water potential, Transpiration pull, Auxins and Gibberellins', weightage: '7 Marks' },
      { id: 'ch-bio-7', subjectId: 'sub-bio', chapterNumber: 7, title: 'Respiration and Circulation', description: 'Glycolysis, Krebs cycle, Human heart structure, Cardiac cycle, ECG', weightage: '10 Marks' },
      { id: 'ch-bio-8', subjectId: 'sub-bio', chapterNumber: 8, title: 'Control and Coordination', description: 'Human brain, Synaptic transmission, Reflex arc, Endocrine glands', weightage: '10 Marks' },
    ];
    this.db.chapters = chapters;

    // 4. Textbook Content
    this.db.textbookContents = [
      {
        id: 'tb-phy-1',
        chapterId: 'ch-phy-1',
        subjectId: 'sub-phy',
        title: 'Rotational Dynamics — Chapter 1',
        sections: [
          {
            heading: '1.1 Uniform Circular Motion & Centripetal Acceleration',
            content: 'Uniform Circular Motion (UCM) is the motion of a particle along the circumference of a circle with constant speed. The acceleration directed towards the center along the radius is centripetal acceleration ac = v²/r = ω²r.',
            keyPoints: [
              'Linear velocity is always tangential: v = r · ω',
              'Centripetal force is real: F = m · v² / r = m · ω² · r',
              'Centrifugal force is a pseudo force experienced in a rotating non-inertial frame',
            ],
            formula: 'v_max = √(μ_s · r · g) (on unbanked circular road)',
          },
          {
            heading: '1.2 Banking of Roads',
            content: 'To avoid reliance on friction alone, curved roads are banked at an angle θ with the horizontal. At the optimum speed, neither wear nor tear occurs.',
            keyPoints: [
              'Optimum speed without friction: v = √(r · g · tan θ)',
              'Maximum safe speed with friction: v_max = √[r · g · (μ + tan θ) / (1 - μ · tan θ)]',
              'Minimum safe speed: v_min = √[r · g · (tan θ - μ) / (1 + μ · tan θ)]',
            ],
            formula: 'tan θ = v² / (r · g)',
          },
          {
            heading: '1.3 Moment of Inertia (M.I.) & Radius of Gyration',
            content: 'Moment of inertia is the rotational analogue of mass. It depends on the mass distribution about the given axis of rotation: I = ∑ m_i · r_i².',
            keyPoints: [
              'Radius of gyration K: I = M · K²',
              'Theorem of Parallel Axes: I_O = I_C + M · h²',
              'Theorem of Perpendicular Axes: I_Z = I_X + I_Y (for planar lamina)',
              'M.I. of Ring: I = M · R²',
              'M.I. of Uniform Disc: I = ½ · M · R²',
              'M.I. of Solid Sphere: I = (2/5) · M · R²',
            ],
            formula: 'I = M · K² ; I_O = I_C + M · h²',
          },
          {
            heading: '1.4 Rolling Motion on an Inclined Plane',
            content: 'A body rolling without slipping possesses both translational and rotational kinetic energy: E_total = ½ M v² + ½ I ω² = ½ M v² (1 + K² / R²).',
            keyPoints: [
              'Acceleration down incline: a = (g · sin θ) / (1 + K² / R²)',
              'Velocity at bottom: v = √[ (2 · g · h) / (1 + K² / R²) ]',
              'Solid cylinder / disc: K²/R² = 1/2',
              'Solid sphere: K²/R² = 2/5 (reaches bottom fastest)',
            ],
            formula: 'v = √[2gh / (1 + K²/R²)]',
          },
        ],
      },
      {
        id: 'tb-chem-4',
        chapterId: 'ch-chem-4',
        subjectId: 'sub-chem',
        title: 'Chemical Thermodynamics — Chapter 4',
        sections: [
          {
            heading: '4.1 First Law of Thermodynamics',
            content: 'Energy can neither be created nor destroyed, although it may be converted from one form to another: ΔU = q + w. For pressure-volume work: w = -P_ext · ΔV.',
            keyPoints: [
              'Work done in isothermal reversible expansion: W_max = -2.303 · n · R · T · log₁₀(V₂ / V₁)',
              'Isochoric process (ΔV = 0): q_v = ΔU',
              'Isobaric process (constant P): q_p = ΔH = ΔU + P · ΔV',
            ],
            formula: 'W_max = -2.303 n R T log₁₀(P₁ / P₂)',
          },
          {
            heading: '4.2 Enthalpy & Hess Law of Constant Heat Summation',
            content: 'Enthalpy H is the sum of internal energy and PV energy. Hess Law states that the overall enthalpy change for a chemical reaction is independent of the pathway taken.',
            keyPoints: [
              'ΔH = ΔU + Δn_g · R · T (where Δn_g = moles of gaseous products - moles of gaseous reactants)',
              'If Δn_g = 0, then ΔH = ΔU',
            ],
            formula: 'ΔH = ΔU + Δn_g · R · T',
          },
          {
            heading: '4.3 Second Law, Entropy & Gibbs Free Energy',
            content: 'Total entropy of universe always increases in a spontaneous process. Gibbs free energy G = H - TS determines spontaneity under constant T and P.',
            keyPoints: [
              'ΔG = ΔH - T · ΔS',
              'If ΔG < 0: Process is spontaneous',
              'If ΔG = 0: System is at equilibrium (ΔG° = -2.303 · R · T · log₁₀ K)',
              'If ΔG > 0: Process is non-spontaneous',
            ],
            formula: 'ΔG = ΔH - TΔS ; ΔG° = -RT ln K',
          },
        ],
      },
      {
        id: 'tb-math-5',
        chapterId: 'ch-math-5',
        subjectId: 'sub-math',
        title: 'Differentiation — Chapter 5',
        sections: [
          {
            heading: '5.1 Derivative of Composite Functions (Chain Rule)',
            content: 'If y = f(u) is a differentiable function of u and u = g(x) is a differentiable function of x, then dy/dx = (dy/du) · (du/dx).',
            keyPoints: [
              'd/dx [f(x)]ⁿ = n · [f(x)]ⁿ⁻¹ · f\'(x)',
              'd/dx [sin(f(x))] = cos(f(x)) · f\'(x)',
              'd/dx [e^(f(x))] = e^(f(x)) · f\'(x)',
            ],
            formula: 'dy/dx = (dy/du) · (du/dx)',
          },
          {
            heading: '5.2 Logarithmic & Parametric Differentiation',
            content: 'When functions are of the form [f(x)]^(g(x)) or involve complex products and quotients, taking natural logarithms simplifies differentiation. For x = f(t) and y = g(t), dy/dx = (dy/dt) / (dx/dt).',
            keyPoints: [
              'y = x^x ⇒ ln y = x ln x ⇒ dy/dx = x^x (1 + ln x)',
              'd²y/dx² = d/dt(dy/dx) · (dt/dx)',
            ],
            formula: 'dy/dx = (g\'(t)) / (f\'(t))',
          },
        ],
      },
      {
        id: 'tb-bio-1',
        chapterId: 'ch-bio-1',
        subjectId: 'sub-bio',
        title: 'Reproduction in Plants — Chapter 1',
        sections: [
          {
            heading: '1.1 Microsporogenesis & Pollen Grain Structure',
            content: 'Microsporangium contains sporogenous tissue that undergoes meiosis to produce haploid microspores (pollen grains). Anther consists of four wall layers: Epidermis, Endothecium, Middle layers, and Tapetum (nutritive).',
            keyPoints: [
              'Tapetum nourishes developing microspores and secretes callase and sporopollenin',
              'Exine made of Sporopollenin (most resistant organic material known)',
              'Intine is thin, pectin-cellulose layer',
            ],
            formula: '1 Microspore Mother Cell (2n) → 4 functional pollen grains (n)',
          },
          {
            heading: '1.2 Double Fertilization & Endosperm Formation',
            content: 'Unique to angiosperms: One male gamete fuses with egg cell (Syngamy → 2n Zygote), second male gamete fuses with diploid secondary nucleus (Triple fusion → 3n Primary Endosperm Nucleus - PEN).',
            keyPoints: [
              'Syngamy: n + n → 2n Embryo',
              'Triple Fusion: n + 2n → 3n Endosperm',
              'Types of endosperm: Nuclear (coconut water), Cellular, and Helobial',
            ],
            formula: 'Angiosperm Endosperm Ploidy = 3n',
          },
        ],
      },
    ];

    // 5. Short Notes
    this.db.shortNotes = [
      {
        id: 'sn-phy-1',
        chapterId: 'ch-phy-1',
        subjectId: 'sub-phy',
        title: 'Rotational Dynamics — Formula & Revision Sheet',
        summary: 'Essential formulas, theorems, and shortcut relations for Maharashtra Board and MHT-CET examinations.',
        formulas: [
          { name: 'Angular Velocity relation', formula: 'v = r · ω', note: 'Tangential velocity' },
          { name: 'Centripetal Acceleration', formula: 'a_c = v² / r = r · ω²', note: 'Always towards center' },
          { name: 'Conical Pendulum Period', formula: 'T = 2π · √(L · cos θ / g)', note: 'Frequency n = 1/T' },
          { name: 'Parallel Axes Theorem', formula: 'I_O = I_C + M · h²', note: 'h is distance between axes' },
          { name: 'Perpendicular Axes Theorem', formula: 'I_Z = I_X + I_Y', note: 'Valid strictly for planar 2D laminar bodies' },
          { name: 'Torque & Angular Momentum', formula: 'τ = I · α ; L = I · ω', note: 'Conservation of angular momentum if τ_ext = 0' },
          { name: 'Total Kinetic Energy in Rolling', formula: 'E_k = ½ M v² (1 + K² / R²)', note: 'Translational + Rotational' },
        ],
        keyReactionsOrLaws: [
          'Law of Conservation of Angular Momentum: If external torque τ_ext = 0, then L = I · ω = Constant.',
          'Theorem of Parallel Axes applies to any rigid 3D body of mass M.',
          'Theorem of Perpendicular Axes applies only to 2D laminar objects (discs, rings, plates).',
        ],
        tips: [
          'In vertical circular motion: Velocity at top = √(rg), Velocity at bottom = √(5rg), Tension difference = 6mg.',
          'For rolling without slipping, solid sphere has least (1 + K²/R²) = 1.4, so it accelerates fastest down an incline.',
        ],
      },
      {
        id: 'sn-chem-4',
        chapterId: 'ch-chem-4',
        subjectId: 'sub-chem',
        title: 'Chemical Thermodynamics — Rapid Revision',
        summary: 'Signs, conventions, state functions, work calculations, and spontaneity criteria.',
        formulas: [
          { name: 'Isothermal Reversible Work', formula: 'W_max = -2.303 · n · R · T · log₁₀(V₂ / V₁)', note: 'Maximum work' },
          { name: 'Enthalpy - Internal Energy Relation', formula: 'ΔH = ΔU + Δn_g · R · T', note: 'Δn_g = n_p(g) - n_r(g)' },
          { name: 'Gibbs Free Energy', formula: 'ΔG = ΔH - T · ΔS', note: 'ΔG < 0 for spontaneity' },
          { name: 'Equilibrium Constant Relation', formula: 'ΔG° = -2.303 · R · T · log₁₀ K_eq', note: 'At standard state' },
        ],
        keyReactionsOrLaws: [
          'First Law of Thermodynamics: ΔU = q + w (IUPAC: work done ON system is positive).',
          'Hess Law of Constant Heat Summation: Heat change is independent of the intermediate steps.',
          'Spontaneity: If ΔH < 0 and ΔS > 0, reaction is spontaneous at ALL temperatures.',
        ],
        tips: [
          'Remember R = 8.314 J/K·mol when calculating ΔG in Joules.',
          'For combustion reactions, Δn_g is usually negative, hence ΔH < ΔU.',
        ],
      },
      {
        id: 'sn-math-5',
        chapterId: 'ch-math-5',
        subjectId: 'sub-math',
        title: 'Differentiation — Key Rules & Standard Derivatives',
        summary: 'Standard derivatives table, chain rule, and logarithmic shortcuts for MHT-CET.',
        formulas: [
          { name: 'Power Rule', formula: 'd/dx (xⁿ) = n · xⁿ⁻¹' },
          { name: 'Product Rule (Leibnitz)', formula: 'd/dx (u · v) = u · v\' + v · u\'' },
          { name: 'Quotient Rule', formula: 'd/dx (u / v) = (v · u\' - u · v\') / v²' },
          { name: 'Inverse Trigonometric', formula: 'd/dx [sin⁻¹ x] = 1 / √(1 - x²)' },
          { name: 'Inverse Trigonometric', formula: 'd/dx [tan⁻¹ x] = 1 / (1 + x²)' },
        ],
        keyReactionsOrLaws: [
          'If y = [f(x)]^[g(x)], dy/dx = [f(x)]^[g(x)] · [ (g(x)/f(x)) · f\'(x) + ln(f(x)) · g\'(x) ]',
          'Parametric derivative: dy/dx = (dy/dt) / (dx/dt) and d²y/dx² = [ d/dt(dy/dx) ] / (dx/dt).',
        ],
        tips: [
          'Always simplify expressions using trigonometric identities (e.g. 1 - cos 2θ = 2 sin² θ) before differentiating.',
        ],
      },
      {
        id: 'sn-bio-1',
        chapterId: 'ch-bio-1',
        subjectId: 'sub-bio',
        title: 'Reproduction in Plants — High-Yield Points',
        summary: 'Summary of anther development, ovule structures, pollination modes, and seed development.',
        formulas: [
          { name: 'Pollen grains produced', formula: 'P = 4 × Number of Microspore Mother Cells' },
          { name: 'Functional Megaspores', formula: '1 Functional Megaspore per MMC (3 degenerate)' },
        ],
        keyReactionsOrLaws: [
          'Anatropous ovule is the most common type in angiosperms (inverted ovule with micropyle facing down).',
          '7-celled, 8-nucleate female gametophyte: 3 Antipodals, 2 Synergids, 1 Egg cell, 1 Central cell (2 polar nuclei).',
          'Entomophily (insect pollination): Sticky, spiny, scented pollen grains.',
          'Anemophily (wind pollination): Dry, light, non-sticky pollen produced in vast quantities.',
        ],
        tips: [
          'Double fertilization was discovered by S.G. Nawaschin in Lilium and Fritillaria.',
        ],
      },
    ];

    // 6. Realistic Questions Bank (for Practice & Tests)
    const questions: Question[] = [
      // Physics (Rotational Dynamics & General)
      {
        id: 'q-phy-101',
        subjectId: 'sub-phy',
        chapterId: 'ch-phy-1',
        type: 'MCQ',
        difficulty: 'EASY',
        examTag: 'MHT-CET 2023',
        marks: 1,
        questionText: 'A car is negotiating a curved unbanked road of radius 40 m. If the coefficient of static friction between the tires and road is 0.4, the maximum speed with which the car can take the turn safely is (take g = 9.8 m/s²):',
        options: [
          { id: 'opt-a', text: '9.8 m/s' },
          { id: 'opt-b', text: '12.5 m/s' },
          { id: 'opt-c', text: '15.6 m/s' },
          { id: 'opt-d', text: '18.2 m/s' },
        ],
        correctOptionId: 'opt-b',
        solution: 'For an unbanked circular road, maximum safe speed v_max = √(μ_s · r · g). Here μ_s = 0.4, r = 40 m, g = 9.8 m/s². v_max = √(0.4 × 40 × 9.8) = √(156.8) ≈ 12.52 m/s. Hence Option B is correct.',
      },
      {
        id: 'q-phy-102',
        subjectId: 'sub-phy',
        chapterId: 'ch-phy-1',
        type: 'MCQ',
        difficulty: 'MEDIUM',
        examTag: '12th Board 2024',
        marks: 1,
        questionText: 'The ratio of the radius of gyration of a uniform circular disc about its diameter to that about an axis perpendicular to its plane passing through its center is:',
        options: [
          { id: 'opt-a', text: '1 : √2' },
          { id: 'opt-b', text: '√2 : 1' },
          { id: 'opt-c', text: '1 : 2' },
          { id: 'opt-d', text: '2 : 1' },
        ],
        correctOptionId: 'opt-a',
        solution: 'M.I. of disc about perpendicular axis passing through center is I_z = ½ M R², so K_z = R / √2. M.I. of disc about diameter (by perpendicular axis theorem I_z = 2 I_d) is I_d = ¼ M R², so K_d = R / 2. Therefore, K_d / K_z = (R / 2) / (R / √2) = √2 / 2 = 1 / √2. Hence Option A is correct.',
      },
      {
        id: 'q-phy-103',
        subjectId: 'sub-phy',
        chapterId: 'ch-phy-1',
        type: 'MCQ',
        difficulty: 'MEDIUM',
        examTag: 'MHT-CET 2022',
        marks: 1,
        questionText: 'A body rolls down an inclined plane without slipping. If the ratio of rotational kinetic energy to translational kinetic energy is 2/5, the body is a:',
        options: [
          { id: 'opt-a', text: 'Solid cylinder' },
          { id: 'opt-b', text: 'Ring' },
          { id: 'opt-c', text: 'Solid sphere' },
          { id: 'opt-d', text: 'Hollow sphere' },
        ],
        correctOptionId: 'opt-c',
        solution: 'Rotational K.E. = ½ I ω² = ½ (M K²) (v/R)² = ½ M v² (K²/R²). Translational K.E. = ½ M v². The ratio is (Rotational K.E. / Translational K.E.) = K² / R². Since K² / R² = 2/5, the body is a Solid Sphere. Hence Option C is correct.',
      },
      {
        id: 'q-phy-104',
        subjectId: 'sub-phy',
        chapterId: 'ch-phy-1',
        type: 'MCQ',
        difficulty: 'HARD',
        examTag: 'MHT-CET 2024',
        marks: 1,
        questionText: 'A small body of mass m is tied to a string of length L and rotated in a vertical circle. The minimum tension in the string during complete circular motion is zero. The tension at the lowest point of the trajectory will be:',
        options: [
          { id: 'opt-a', text: '3 mg' },
          { id: 'opt-b', text: '4 mg' },
          { id: 'opt-c', text: '5 mg' },
          { id: 'opt-d', text: '6 mg' },
        ],
        correctOptionId: 'opt-d',
        solution: 'For complete vertical circular motion, tension at highest point T_top = m v_top² / L - mg. Setting T_top = 0 gives v_top = √(gL). By conservation of energy, v_bottom² = v_top² + 2g(2L) = 5gL. At the lowest point, tension T_bottom = m v_bottom² / L + mg = 5mg + mg = 6mg. Tension difference T_bottom - T_top = 6mg. Hence Option D is correct.',
      },
      {
        id: 'q-phy-105',
        subjectId: 'sub-phy',
        chapterId: 'ch-phy-2',
        type: 'MCQ',
        difficulty: 'EASY',
        examTag: '12th Board 2023',
        marks: 1,
        questionText: 'When a detergent is dissolved in water, the surface tension of the liquid:',
        options: [
          { id: 'opt-a', text: 'Increases' },
          { id: 'opt-b', text: 'Decreases' },
          { id: 'opt-c', text: 'Remains unchanged' },
          { id: 'opt-d', text: 'First increases then decreases' },
        ],
        correctOptionId: 'opt-b',
        solution: 'Detergents and surfactants weaken the cohesive intermolecular forces between water molecules at the surface, thereby significantly decreasing the surface tension. Hence Option B is correct.',
      },

      // Chemistry Questions
      {
        id: 'q-chem-201',
        subjectId: 'sub-chem',
        chapterId: 'ch-chem-4',
        type: 'MCQ',
        difficulty: 'MEDIUM',
        examTag: 'MHT-CET 2023',
        marks: 1,
        questionText: 'For the reaction: N₂(g) + 3 H₂(g) → 2 NH₃(g) at 298 K, which of the following statements is correct regarding ΔH and ΔU?',
        options: [
          { id: 'opt-a', text: 'ΔH = ΔU' },
          { id: 'opt-b', text: 'ΔH > ΔU' },
          { id: 'opt-c', text: 'ΔH < ΔU' },
          { id: 'opt-d', text: 'ΔH = ΔU + 2RT' },
        ],
        correctOptionId: 'opt-c',
        solution: 'Formula: ΔH = ΔU + Δn_g · R · T. Here Δn_g = moles of gaseous products - moles of gaseous reactants = 2 - (1 + 3) = -2. Thus ΔH = ΔU - 2RT. Since 2RT > 0, ΔH is less than ΔU (ΔH < ΔU). Hence Option C is correct.',
      },
      {
        id: 'q-chem-202',
        subjectId: 'sub-chem',
        chapterId: 'ch-chem-4',
        type: 'MCQ',
        difficulty: 'EASY',
        examTag: '12th Board 2024',
        marks: 1,
        questionText: 'Which of the following is an intensive property?',
        options: [
          { id: 'opt-a', text: 'Mass' },
          { id: 'opt-b', text: 'Volume' },
          { id: 'opt-c', text: 'Refractive index' },
          { id: 'opt-d', text: 'Internal energy' },
        ],
        correctOptionId: 'opt-c',
        solution: 'An intensive property is independent of the amount of substance present in the system. Refractive index, density, and temperature are intensive properties. Mass, volume, and internal energy depend on the quantity of matter and are extensive properties. Hence Option C is correct.',
      },
      {
        id: 'q-chem-203',
        subjectId: 'sub-chem',
        chapterId: 'ch-chem-1',
        type: 'MCQ',
        difficulty: 'MEDIUM',
        examTag: 'MHT-CET 2022',
        marks: 1,
        questionText: 'A metal crystallizes in a body-centered cubic (BCC) lattice with edge length 300 pm. The radius of the metal atom is:',
        options: [
          { id: 'opt-a', text: '129.9 pm' },
          { id: 'opt-b', text: '106.1 pm' },
          { id: 'opt-c', text: '150.0 pm' },
          { id: 'opt-d', text: '212.1 pm' },
        ],
        correctOptionId: 'opt-a',
        solution: 'In BCC lattice: 4r = √3 · a ⇒ r = (√3 / 4) · a. Given a = 300 pm: r = (1.732 / 4) × 300 = 0.433 × 300 = 129.9 pm. Hence Option A is correct.',
      },
      {
        id: 'q-chem-204',
        subjectId: 'sub-chem',
        chapterId: 'ch-chem-2',
        type: 'MCQ',
        difficulty: 'HARD',
        examTag: 'MHT-CET 2024',
        marks: 1,
        questionText: 'Which of the following 0.1 M aqueous solutions will exhibit the highest boiling point elevation?',
        options: [
          { id: 'opt-a', text: '0.1 M Glucose (C₆H₁₂O₆)' },
          { id: 'opt-b', text: '0.1 M Sodium chloride (NaCl)' },
          { id: 'opt-c', text: '0.1 M Calcium chloride (CaCl₂)' },
          { id: 'opt-d', text: '0.1 M Aluminum sulfate [Al₂(SO₄)₃]' },
        ],
        correctOptionId: 'opt-d',
        solution: 'ΔT_b = i · K_b · m. The solution with highest vant Hoff factor i has the highest boiling point elevation. For Glucose i = 1; for NaCl i = 2; for CaCl₂ i = 3; for Al₂(SO₄)₃ i = 2 + 3 = 5. Therefore, Al₂(SO₄)₃ has highest ΔT_b. Hence Option D is correct.',
      },

      // Mathematics Questions
      {
        id: 'q-math-301',
        subjectId: 'sub-math',
        chapterId: 'ch-math-1',
        type: 'MCQ',
        difficulty: 'EASY',
        examTag: '12th Board 2024',
        marks: 2,
        questionText: 'The contrapositive of the statement "If a number is divisible by 9, then it is divisible by 3" is:',
        options: [
          { id: 'opt-a', text: 'If a number is divisible by 3, then it is divisible by 9.' },
          { id: 'opt-b', text: 'If a number is not divisible by 9, then it is not divisible by 3.' },
          { id: 'opt-c', text: 'If a number is not divisible by 3, then it is not divisible by 9.' },
          { id: 'opt-d', text: 'A number is divisible by 9 if and only if it is divisible by 3.' },
        ],
        correctOptionId: 'opt-c',
        solution: 'The contrapositive of conditional proposition p → q is ~q → ~p. Here p: "a number is divisible by 9", q: "it is divisible by 3". Thus ~q → ~p: "If a number is not divisible by 3, then it is not divisible by 9". Hence Option C is correct.',
      },
      {
        id: 'q-math-302',
        subjectId: 'sub-math',
        chapterId: 'ch-math-5',
        type: 'MCQ',
        difficulty: 'MEDIUM',
        examTag: 'MHT-CET 2023',
        marks: 2,
        questionText: 'If y = tan⁻¹ [ (cos x - sin x) / (cos x + sin x) ], then dy/dx is equal to:',
        options: [
          { id: 'opt-a', text: '1' },
          { id: 'opt-b', text: '-1' },
          { id: 'opt-c', text: '1/2' },
          { id: 'opt-d', text: '-1/2' },
        ],
        correctOptionId: 'opt-b',
        solution: 'Dividing numerator and denominator inside bracket by cos x: (1 - tan x) / (1 + tan x) = tan(π/4 - x). Hence y = tan⁻¹[tan(π/4 - x)] = π/4 - x. Differentiating with respect to x: dy/dx = 0 - 1 = -1. Hence Option B is correct.',
      },
      {
        id: 'q-math-303',
        subjectId: 'sub-math',
        chapterId: 'ch-math-2',
        type: 'MCQ',
        difficulty: 'MEDIUM',
        examTag: '12th Board 2023',
        marks: 2,
        questionText: 'If A is a 3 × 3 non-singular matrix such that |A| = 4, then the value of |adj(A)| is:',
        options: [
          { id: 'opt-a', text: '4' },
          { id: 'opt-b', text: '16' },
          { id: 'opt-c', text: '64' },
          { id: 'opt-d', text: '12' },
        ],
        correctOptionId: 'opt-b',
        solution: 'Property of adjoint: |adj(A)| = |A|ⁿ⁻¹, where n is the order of square matrix A. Here n = 3 and |A| = 4. Therefore |adj(A)| = 4^(3 - 1) = 4² = 16. Hence Option B is correct.',
      },
      {
        id: 'q-math-304',
        subjectId: 'sub-math',
        chapterId: 'ch-math-7',
        type: 'MCQ',
        difficulty: 'HARD',
        examTag: 'MHT-CET 2024',
        marks: 2,
        questionText: 'The value of the definite integral ∫₀^(π/2) [ sin³ x / (sin³ x + cos³ x) ] dx is:',
        options: [
          { id: 'opt-a', text: 'π' },
          { id: 'opt-b', text: 'π/2' },
          { id: 'opt-c', text: 'π/4' },
          { id: 'opt-d', text: '0' },
        ],
        correctOptionId: 'opt-c',
        solution: 'Let I = ∫₀^(π/2) [sin³ x / (sin³ x + cos³ x)] dx ...(1). By property ∫₀^a f(x) dx = ∫₀^a f(a - x) dx, replacing x by (π/2 - x) gives: I = ∫₀^(π/2) [cos³ x / (cos³ x + sin³ x)] dx ...(2). Adding (1) and (2): 2I = ∫₀^(π/2) 1 dx = [x]₀^(π/2) = π/2 ⇒ I = π/4. Hence Option C is correct.',
      },

      // Biology Questions
      {
        id: 'q-bio-401',
        subjectId: 'sub-bio',
        chapterId: 'ch-bio-1',
        type: 'MCQ',
        difficulty: 'EASY',
        examTag: '12th Board 2024',
        marks: 1,
        questionText: 'In angiosperms, the ploidy level of the Primary Endosperm Nucleus (PEN) after double fertilization is:',
        options: [
          { id: 'opt-a', text: 'Haploid (n)' },
          { id: 'opt-b', text: 'Diploid (2n)' },
          { id: 'opt-c', text: 'Triploid (3n)' },
          { id: 'opt-d', text: 'Tetraploid (4n)' },
        ],
        correctOptionId: 'opt-c',
        solution: 'In double fertilization, triple fusion occurs when one haploid male gamete (n) fuses with the diploid secondary nucleus (2n), giving rise to a triploid (3n) Primary Endosperm Nucleus (PEN). Hence Option C is correct.',
      },
      {
        id: 'q-bio-402',
        subjectId: 'sub-bio',
        chapterId: 'ch-bio-4',
        type: 'MCQ',
        difficulty: 'MEDIUM',
        examTag: 'MHT-CET 2023',
        marks: 1,
        questionText: 'During transcription in prokaryotes, which enzyme subunit is responsible for the specific recognition of the promoter sequence?',
        options: [
          { id: 'opt-a', text: 'Rho factor (ρ)' },
          { id: 'opt-b', text: 'Sigma factor (σ)' },
          { id: 'opt-c', text: 'Beta prime subunit (β\')' },
          { id: 'opt-d', text: 'Alpha subunit (α)' },
        ],
        correctOptionId: 'opt-b',
        solution: 'The RNA polymerase holoenzyme in prokaryotes consists of the core enzyme (α₂ββ\'ω) and the sigma (σ) initiation factor. Sigma factor specifically recognizes the promoter sequence (-10 Pribnow box and -35 region) to initiate transcription. Hence Option B is correct.',
      },
      {
        id: 'q-bio-403',
        subjectId: 'sub-bio',
        chapterId: 'ch-bio-7',
        type: 'MCQ',
        difficulty: 'EASY',
        examTag: '12th Board 2023',
        marks: 1,
        questionText: 'The pacemaker of the human heart which generates rhythmic action potentials is:',
        options: [
          { id: 'opt-a', text: 'Atrioventricular Node (AV Node)' },
          { id: 'opt-b', text: 'Bundle of His' },
          { id: 'opt-c', text: 'Sinoatrial Node (SA Node)' },
          { id: 'opt-d', text: 'Purkinje fibers' },
        ],
        correctOptionId: 'opt-c',
        solution: 'The Sinoatrial Node (SA Node) located in the upper right wall of the right atrium generates action potentials at the highest rate (approx. 72 beats/min) and acts as the natural pacemaker of the heart. Hence Option C is correct.',
      },
      {
        id: 'q-bio-404',
        subjectId: 'sub-bio',
        chapterId: 'ch-bio-3',
        type: 'MCQ',
        difficulty: 'MEDIUM',
        examTag: 'MHT-CET 2024',
        marks: 1,
        questionText: 'When a red-flowered Mirabilis jalapa plant is crossed with a white-flowered plant, the F1 offspring produce pink flowers. This phenomenon demonstrates:',
        options: [
          { id: 'opt-a', text: 'Complete dominance' },
          { id: 'opt-b', text: 'Incomplete dominance' },
          { id: 'opt-c', text: 'Co-dominance' },
          { id: 'opt-d', text: 'Polygenic inheritance' },
        ],
        correctOptionId: 'opt-b',
        solution: 'In 4 O\'clock plant (Mirabilis jalapa), neither allele is completely dominant over the other. The heterozygous condition (Rr) displays an intermediate phenotype (pink), which is classic Incomplete Dominance with a phenotypic and genotypic ratio of 1:2:1. Hence Option B is correct.',
      },
    ];
    this.db.questions = questions;

    // 7. Previous Year Question Papers (PYQs)
    const pyqPapers: PYQPaper[] = [
      {
        id: 'pyq-hsc-2024-phy',
        exam: '12th Maharashtra State Board',
        year: 2024,
        subject: 'Physics',
        title: 'HSC Maharashtra State Board Physics Question Paper (February 2024)',
        totalMarks: 70,
        durationMinutes: 180,
        questions: [
          {
            questionNumber: 1,
            section: 'Section A - Select and write the correct answer (MCQs)',
            marks: 1,
            questionText: 'A circular coil of radius 10 cm and 50 turns carries a current of 2 A. The magnetic field at its center is:',
            options: ['6.28 × 10⁻⁴ T', '3.14 × 10⁻⁴ T', '1.25 × 10⁻³ T', '6.28 × 10⁻³ T'],
            correctAnswer: 'Option A: 6.28 × 10⁻⁴ T',
            modelSolution: 'Formula: B = (μ₀ · N · I) / (2 · R). Here μ₀ = 4π × 10⁻⁷ T·m/A, N = 50, I = 2 A, R = 0.10 m. B = (4π × 10⁻⁷ × 50 × 2) / (2 × 0.10) = (4π × 10⁻⁵) / 0.2 = 20π × 10⁻⁵ = 6.28 × 10⁻⁴ T.',
          },
          {
            questionNumber: 2,
            section: 'Section A - Select and write the correct answer (MCQs)',
            marks: 1,
            questionText: 'The dimensional formula of surface tension is:',
            options: ['[M¹ L¹ T⁻²]', '[M¹ L⁰ T⁻²]', '[M¹ L⁻¹ T⁻²]', '[M¹ L⁰ T⁻¹]'],
            correctAnswer: 'Option B: [M¹ L⁰ T⁻²]',
            modelSolution: 'Surface tension T = Force / Length. Dimensions of Force = [M¹ L¹ T⁻²]. Dimensions of Length = [L¹]. Thus [T] = [M¹ L¹ T⁻²] / [L¹] = [M¹ L⁰ T⁻²].',
          },
          {
            questionNumber: 3,
            section: 'Section B - Very Short Answer Type',
            marks: 2,
            questionText: 'State any two conditions for steady interference pattern.',
            correctAnswer: 'Coherent sources and monochromatic light',
            modelSolution: 'Conditions: (1) The two sources of light must be coherent (constant phase difference). (2) The two interfering waves must be monochromatic (single wavelength). (3) The two sources should be narrow and close to each other.',
          },
          {
            questionNumber: 4,
            section: 'Section C - Short Answer Type II',
            marks: 3,
            questionText: 'Derive an expression for the maximum safe speed of a vehicle on a banked circular road without considering friction.',
            correctAnswer: 'v = √(r · g · tan θ)',
            modelSolution: 'Let m be mass of vehicle, r be radius of curved road, θ be angle of banking. The normal reaction N resolves into two components: N cos θ = mg (balances weight) and N sin θ = m v² / r (provides centripetal force). Dividing: (N sin θ) / (N cos θ) = (m v² / r) / (mg) ⇒ tan θ = v² / (rg) ⇒ v = √(rg tan θ).',
          },
        ],
      },
      {
        id: 'pyq-hsc-2024-chem',
        exam: '12th Maharashtra State Board',
        year: 2024,
        subject: 'Chemistry',
        title: 'HSC Maharashtra State Board Chemistry Question Paper (March 2024)',
        totalMarks: 70,
        durationMinutes: 180,
        questions: [
          {
            questionNumber: 1,
            section: 'Section A - MCQs',
            marks: 1,
            questionText: 'The coordination number of atoms in a face-centered cubic (FCC) unit cell is:',
            options: ['4', '6', '8', '12'],
            correctAnswer: 'Option D: 12',
            modelSolution: 'In an FCC (cubic close-packed) lattice, each sphere touches 12 neighboring spheres (6 in its own plane, 3 in plane above, 3 in plane below). Coordination number = 12.',
          },
          {
            questionNumber: 2,
            section: 'Section B - Short Answer',
            marks: 2,
            questionText: 'Define buffer solution. State one biological example of buffer system.',
            correctAnswer: 'Resists change in pH on addition of small amounts of acid/base',
            modelSolution: 'A buffer solution is defined as a solution which resists drastic changes in its pH value upon the addition of small amounts of strong acid or strong base. Biological example: Carbonic acid-bicarbonate buffer system (H₂CO₃ / HCO₃⁻) in human blood maintaining pH around 7.4.',
          },
          {
            questionNumber: 3,
            section: 'Section C - Long Answer',
            marks: 3,
            questionText: 'Distinguish between SN1 and SN2 reaction mechanisms with respect to kinetics and stereochemistry.',
            correctAnswer: 'First order vs Second order; Racemization vs Inversion',
            modelSolution: 'SN1: Unimolecular (Rate = k[R-X]), two-step mechanism via carbocation intermediate, leads to partial racemization. SN2: Bimolecular (Rate = k[R-X][Nu⁻]), single-step concerted mechanism via transition state, leads to 100% Walden inversion of configuration.',
          },
        ],
      },
      {
        id: 'pyq-cet-2023-pcm',
        exam: 'MHT-CET',
        year: 2023,
        subject: 'Physics & Chemistry & Mathematics',
        title: 'MHT-CET 2023 Official Shift 1 Question Paper with Step-by-Step Solutions',
        totalMarks: 200,
        durationMinutes: 180,
        questions: [
          {
            questionNumber: 1,
            section: 'Physics (MHT-CET)',
            marks: 1,
            questionText: 'The work done in blowing a soap bubble from radius R to 2R having surface tension T is:',
            options: ['12 π R² T', '24 π R² T', '6 π R² T', '8 π R² T'],
            correctAnswer: 'Option B: 24 π R² T',
            modelSolution: 'Soap bubble has two free surfaces. Initial area A₁ = 2 × 4π R² = 8π R². Final area A₂ = 2 × 4π (2R)² = 32π R². Increase in surface area ΔA = A₂ - A₁ = 32π R² - 8π R² = 24π R². Work done W = T × ΔA = 24 π R² T.',
          },
          {
            questionNumber: 2,
            section: 'Mathematics (MHT-CET)',
            marks: 2,
            questionText: 'The general solution of differential equation dy/dx + y tan x = sec x is:',
            options: ['y sec x = tan x + c', 'y tan x = sec x + c', 'y cos x = sin x + c', 'y sin x = cos x + c'],
            correctAnswer: 'Option A: y sec x = tan x + c',
            modelSolution: 'This is a linear differential equation: P = tan x, Q = sec x. Integrating Factor IF = e^(∫ tan x dx) = e^(ln sec x) = sec x. General solution: y · (IF) = ∫ Q · (IF) dx + c ⇒ y · sec x = ∫ sec² x dx + c ⇒ y sec x = tan x + c.',
          },
        ],
      },
    ];
    this.db.pyqPapers = pyqPapers;

    // 8. Initial Notifications
    this.db.notifications = [
      {
        id: 'notif-1',
        userId: demoUser.id,
        title: 'Welcome to AIR Practice Institute 🇮🇳',
        message: 'Your student dashboard is now active. Follow the 6-step PCMB journey: Learn → Practice → Improve!',
        type: 'WELCOME',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'notif-2',
        userId: demoUser.id,
        title: '12th State Board PYQs Updated',
        message: 'February 2024 Maharashtra State Board Question Papers with verified model answers are now online.',
        type: 'EXAM_UPDATE',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'notif-3',
        userId: demoUser.id,
        title: 'MHT-CET Timed Practice Ready',
        message: 'Attempt 20 timed questions in Rotational Dynamics and Chemical Thermodynamics to boost your speed.',
        type: 'PRACTICE',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }

  // --- User Operations ---
  public findUserByLoginIdOrEmailOrMobile(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.db.users.find(
      u => u.loginId.toLowerCase() === clean || u.email.toLowerCase() === clean || u.mobile.toLowerCase() === clean
    );
  }

  public findUserById(id: string): User | undefined {
    return this.db.users.find(u => u.id === id);
  }

  public updateUserSession(userId: string, sessionId: string, deviceInfo?: string): User | undefined {
    const user = this.db.users.find(u => u.id === userId);
    if (user) {
      user.currentSessionId = sessionId;
      user.lastLoginDevice = deviceInfo || 'Active Device';
      user.lastLoginAt = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
      this.save();
      return user;
    }
    return undefined;
  }

  public createUser(userData: {
    name: string;
    email: string;
    mobile: string;
    passwordPlain: string;
    targetExam?: string;
  }): User {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.passwordPlain, salt);
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const loginId = `AIR${randomSuffix}`;

    const newUser: User = {
      id: `usr-${Date.now()}-${randomSuffix}`,
      loginId,
      name: userData.name.trim(),
      email: userData.email.trim(),
      mobile: userData.mobile.trim(),
      passwordHash,
      targetExam: userData.targetExam || '12th Maharashtra State Board & MHT-CET',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.users.push(newUser);

    // Create a welcome notification for this student
    this.createNotification(
      newUser.id,
      'Welcome to AIR Practice Institute 🇮🇳',
      `Hello ${newUser.name}! Your student ID is ${newUser.loginId}. Start your preparation with Textbook & Chapter Practice.`,
      'WELCOME'
    );

    this.save();
    return newUser;
  }

  public deleteUser(id: string): boolean {
    const index = (this.db.users || []).findIndex(u => u.id === id);
    if (index !== -1) {
      // Prevent deleting the root administrator account
      if (this.db.users[index].role === 'ADMIN' && this.db.users[index].loginId === 'ADMIN001') {
        return false;
      }
      this.db.users.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  public updateUserPassword(id: string, newPasswordPlain: string): boolean {
    const user = (this.db.users || []).find(u => u.id === id);
    if (user) {
      const salt = bcrypt.genSaltSync(10);
      user.passwordHash = bcrypt.hashSync(newPasswordPlain, salt);
      user.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  // --- Content & Practice Queries ---
  public getSubjects(): Subject[] {
    return this.db.subjects;
  }

  public getChapters(subjectId?: string): Chapter[] {
    if (subjectId) {
      return this.db.chapters.filter(c => c.subjectId === subjectId);
    }
    return this.db.chapters;
  }

  public getTextbookContent(chapterId?: string, subjectId?: string): TextbookContent[] {
    return this.db.textbookContents.filter(t => {
      if (chapterId && t.chapterId !== chapterId) return false;
      if (subjectId && t.subjectId !== subjectId) return false;
      return true;
    });
  }

  public getShortNotes(chapterId?: string, subjectId?: string): ShortNote[] {
    return this.db.shortNotes.filter(s => {
      if (chapterId && s.chapterId !== chapterId) return false;
      if (subjectId && s.subjectId !== subjectId) return false;
      return true;
    });
  }

  public getQuestions(params: {
    subjectId?: string;
    chapterId?: string;
    limit?: number;
  }): Question[] {
    let result = this.db.questions.filter(q => {
      if (params.subjectId && q.subjectId !== params.subjectId) return false;
      if (params.chapterId && q.chapterId !== params.chapterId) return false;
      return true;
    });

    if (params.limit && params.limit > 0) {
      result = result.slice(0, params.limit);
    }
    return result;
  }

  public getPYQPapers(exam?: string, year?: number, subject?: string): PYQPaper[] {
    return this.db.pyqPapers.filter(p => {
      if (exam && p.exam !== exam) return false;
      if (year && p.year !== year) return false;
      if (subject && p.subject.toLowerCase() !== subject.toLowerCase()) return false;
      return true;
    });
  }

  public getPYQPaperById(id: string): PYQPaper | undefined {
    return this.db.pyqPapers.find(p => p.id === id);
  }

  // --- Submissions ---
  public recordSubmission(submissionData: Omit<PracticeSubmission, 'id' | 'submittedAt'>): PracticeSubmission {
    const submission: PracticeSubmission = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      submittedAt: new Date().toISOString(),
      ...submissionData,
    };

    this.db.submissions.unshift(submission);

    // Create a completion notification
    this.createNotification(
      submission.userId,
      `Practice Complete: ${submission.subject}`,
      `You scored ${submission.score}/${submission.totalPossibleScore} (${submission.accuracyPercentage}%) in ${submission.section}.`,
      'PRACTICE'
    );

    this.save();
    return submission;
  }

  public getUserSubmissions(userId: string): PracticeSubmission[] {
    return this.db.submissions.filter(s => s.userId === userId);
  }

  // --- Notifications ---
  public getNotifications(userId: string): NotificationItem[] {
    return this.db.notifications
      .filter(n => n.userId === userId || n.userId === 'ALL')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationItem['type'] = 'SYSTEM'
  ): NotificationItem {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.db.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.db.notifications.find(n => n.id === id && (n.userId === userId || n.userId === 'ALL'));
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): number {
    let count = 0;
    this.db.notifications.forEach(n => {
      if ((n.userId === userId || n.userId === 'ALL') && !n.read) {
        n.read = true;
        count++;
      }
    });
    if (count > 0) this.save();
    return count;
  }

  // --- PDF Materials Management (Admin & Students) ---
  public getPdfMaterials(filter?: { section?: string; subject?: string }): PdfMaterial[] {
    let list = this.db.pdfMaterials || [];
    if (filter?.section) {
      list = list.filter(m => m.section.toLowerCase() === filter.section!.toLowerCase());
    }
    if (filter?.subject && filter.subject !== 'All') {
      list = list.filter(m => m.subject === filter.subject || m.subject === 'All');
    }
    return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  public getPdfMaterialById(id: string): PdfMaterial | undefined {
    return (this.db.pdfMaterials || []).find(m => m.id === id);
  }

  public addPdfMaterial(data: Omit<PdfMaterial, 'id' | 'uploadedAt'>): PdfMaterial {
    this.db.pdfMaterials = this.db.pdfMaterials || [];
    const newMaterial: PdfMaterial = {
      ...data,
      id: `pdf-mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      uploadedAt: new Date().toISOString(),
    };
    this.db.pdfMaterials.unshift(newMaterial);
    this.save();
    return newMaterial;
  }

  public deletePdfMaterial(id: string): boolean {
    this.db.pdfMaterials = this.db.pdfMaterials || [];
    const index = this.db.pdfMaterials.findIndex(m => m.id === id);
    if (index !== -1) {
      this.db.pdfMaterials.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Admin Console Methods ---
  public getAllUsers(): Omit<User, 'passwordHash'>[] {
    return (this.db.users || [])
      .map(({ passwordHash, ...rest }) => rest)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllSubmissions(): PracticeSubmission[] {
    return (this.db.submissions || []).slice(0, 50);
  }

  public getAdminMetrics() {
    const users = this.db.users || [];
    const students = users.filter(u => u.role === 'STUDENT');
    const materials = this.db.pdfMaterials || [];
    const submissions = this.db.submissions || [];
    const questions = this.db.questions || [];

    const totalScore = submissions.reduce((sum, s) => sum + (s.accuracyPercentage || 0), 0);
    const avgAccuracy = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;

    return {
      totalUsers: users.length,
      totalStudents: students.length,
      totalAdmins: users.length - students.length,
      totalMaterials: materials.length,
      totalQuestions: questions.length,
      totalSubmissions: submissions.length,
      avgAccuracy,
    };
  }
}

export const dbService = new DatabaseService();
