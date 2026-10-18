import type { FieldKey, Mentor, WeeklySlot } from "@/lib/types";

/*
  The mentors used to seed a fresh database: real mentors' first names and photos (public/mentors).
  Their surnames, roles, bios and other details are still placeholders.
*/

const P = (file: string) => `/mentors/${file}`;

type Seed = Omit<
  Mentor,
  "id" | "slug" | "userId" | "sessionLength" | "verified" | "joined" | "status" | "availability" | "replies"
> & {
  slots: string; // "Tue 18:30, Thu 19:00, Sat 10:00"
  replies?: string;
  sessionLength?: number;
};

const DAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function parseSlots(s: string): WeeklySlot[] {
  return s.split(",").map((part) => {
    const [d, t] = part.trim().split(" ");
    return { day: DAYS[d], time: t };
  });
}

function slugify(first: string, last: string) {
  return `${first}-${last}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
}

function make(seed: Seed, i: number): Mentor {
  const { slots, replies, sessionLength, ...rest } = seed;
  const slug = slugify(seed.firstName, seed.lastName);
  return {
    ...rest,
    id: `m_${slug}`,
    slug,
    userId: `u_${slug}`,
    sessionLength: sessionLength ?? 45,
    availability: parseSlots(slots),
    replies: replies ?? "Usually replies within a day",
    verified: { dbs: true, id: true, references: true },
    joined: new Date(Date.UTC(2025, 8 + (i % 10), 3 + i)).toISOString(),
    status: "active",
  };
}

const field = (k: FieldKey) => k;

const SEEDS: Seed[] = [
  {
    honorific: "Dr.",
    firstName: "Bakari",
    lastName: "Sani",
    role: "Consultant Cardiologist",
    org: "NHS · Leicester",
    field: field("medicine"),
    city: "Leicester",
    region: "East Midlands",
    heritage: "Hausa · Kaduna roots",
    languages: ["English", "Hausa", "Arabic"],
    years: 31,
    education: [
      { title: "MBBS", place: "Ahmadu Bello University, Zaria" },
      { title: "FRCP, Cardiology", place: "Royal College of Physicians" },
    ],
    specialities: ["Medicine as a long career", "Perseverance", "Faith & ambition"],
    askMeAbout: [
      "The long road from medical student to consultant",
      "Balancing faith, family and a demanding career",
      "Studying medicine abroad vs. in the UK",
      "What the heart teaches you about patience",
      "Staying kind under pressure",
    ],
    headline: "Thirty years of caring for hearts. Now I want to help grow a few.",
    bio: "I trained in Zaria, came to the UK as a junior doctor and became a consultant cardiologist. I offer the long view — the patience, discipline and humility that a lifetime in medicine requires.",
    story: [
      "When I arrived in Britain in 1995, I had two suitcases and a letter of recommendation. I studied for my exams in hospital doctors' messes at three in the morning.",
      "I mentor because young people today are under enormous pressure to have everything figured out at sixteen. I want them to know that a good life is built slowly.",
    ],
    quote: "Haƙuri maganin duniya — patience is the cure for the world.",
    photo: P("bakari.webp"),
    ageGroups: ["14–16", "17–18", "19–24"],
    slots: "Sat 10:00, Sat 11:00, Sun 14:00",
    replies: "Usually replies within two days",
  },
  {
    firstName: "Mujahid",
    lastName: "Okafor",
    role: "Chartered Civil Engineer (CEng)",
    org: "Major rail infrastructure programme",
    field: field("engineering"),
    city: "Birmingham",
    region: "West Midlands",
    heritage: "Igbo · Onitsha roots",
    languages: ["English", "Igbo", "Pidgin"],
    years: 14,
    education: [
      { title: "MEng Civil Engineering", place: "University of Birmingham" },
      { title: "Chartered Engineer", place: "Institution of Civil Engineers" },
    ],
    specialities: ["Degree apprenticeships", "Physics & maths", "Building things"],
    askMeAbout: [
      "Degree apprenticeships — earn while you learn",
      "Which A-levels you need for engineering",
      "What it's like to build a railway",
      "Getting chartered and why it matters",
      "Hands-on projects you can try at home",
    ],
    headline: "I build bridges and tunnels for a living. Engineering changed my life — it can change yours too.",
    bio: "I lead a team delivering bridges and viaducts on one of Britain's biggest infrastructure projects. I help young people who love building, fixing and figuring things out find their way into engineering.",
    story: [
      "My grandfather was a carpenter in Onitsha. I grew up watching him build without a single drawing, and I was hooked.",
      "Engineering is one of the most secure, well-paid and meaningful careers in Britain, and the apprenticeship routes are criminally under-explained. I fix that.",
    ],
    quote: "If you can take something apart, you can learn to build it better.",
    photo: P("mujahid.webp"),
    ageGroups: ["11–13", "14–16", "17–18", "19–24"],
    slots: "Mon 18:30, Wed 18:30, Sat 12:00",
  },
  {
    firstName: "Babagana",
    lastName: "Bakare",
    role: "Finance Director, Chartered Accountant (ACA)",
    org: "Logistics group · Milton Keynes",
    field: field("finance"),
    city: "Milton Keynes",
    region: "South East",
    heritage: "Yoruba · Ijebu roots",
    languages: ["English", "Yoruba"],
    years: 19,
    education: [
      { title: "BSc Accounting & Finance", place: "University of Kent" },
      { title: "ACA Chartered Accountant", place: "ICAEW" },
    ],
    specialities: ["Accounting", "School-leaver programmes", "Discipline & goals"],
    askMeAbout: [
      "Accounting apprenticeships straight after A-levels",
      "Becoming a chartered accountant",
      "Budgeting your first pay cheque",
      "Setting goals and actually keeping them",
      "Leadership when you're the youngest in the room",
    ],
    headline: "Every business runs on numbers. I help young people learn to read them — and their own potential.",
    bio: "I run the finance function of a large logistics group. I care about practical ambition: clear goals, good habits and understanding money long before your first payslip.",
    story: [
      "I started as an audit trainee carrying files up and down stairs. Nineteen years later I sit on the board.",
      "I mentor because I wish someone had told me at fifteen that the boring-sounding jobs are often the ones with the most freedom.",
    ],
    quote: "Small habits, compounded, beat big talent left alone.",
    photo: P("babagana.webp"),
    ageGroups: ["17–18", "19–24", "25–30"],
    slots: "Tue 19:30, Sat 09:00",
  },
  {
    firstName: "Ibrahim",
    lastName: "Danjuma",
    role: "Founder & Managing Director",
    org: "Freight & logistics company",
    field: field("enterprise"),
    city: "Nottingham",
    region: "East Midlands",
    heritage: "Nupe · Niger State roots",
    languages: ["English", "Hausa", "Nupe"],
    years: 15,
    education: [
      { title: "BA Business Management", place: "Nottingham Trent University" },
      { title: "MBA", place: "Warwick Business School" },
    ],
    specialities: ["Running a business", "Leadership", "Trade & logistics"],
    askMeAbout: [
      "How goods actually move around the world",
      "Starting a company with very little money",
      "Leading people older than you",
      "Business studies and economics at school",
      "Keeping your values when business gets tough",
    ],
    headline: "I started with one van. Today we employ eighty people. Ask me anything about building a business.",
    bio: "I run a freight company that moves goods between the UK, Europe and West Africa. I help practical, driven young people understand how business works in the real world.",
    story: [
      "My first van was second-hand and broke down on the M1 on day two. I sat on the hard shoulder and decided I'd never quit.",
      "Young people hear plenty about influencers and very little about the people who quietly build real businesses. I'd like to change that.",
    ],
    quote: "Reputation is the only asset you can't buy back.",
    photo: P("ibrahim.webp"),
    ageGroups: ["17–18", "19–24", "25–30"],
    slots: "Mon 20:00, Sat 13:00",
  },
  {
    honorific: "Dr.",
    firstName: "Terry",
    lastName: "Agber",
    role: "Lecturer in Economics",
    org: "University of Manchester",
    field: field("education"),
    city: "Manchester",
    region: "North West",
    heritage: "Tiv · Benue roots",
    languages: ["English", "Tiv"],
    years: 10,
    education: [
      { title: "PhD Economics", place: "University of Manchester" },
      { title: "BSc Economics", place: "University of Bristol" },
    ],
    specialities: ["Economics", "University applications", "Thinking critically"],
    askMeAbout: [
      "What economics is really about",
      "Choosing a university course you'll love",
      "Reading beyond the syllabus",
      "Student finance without the panic",
      "Arguing well — with evidence",
    ],
    headline: "I teach economics to 400 students a year. I'd much rather help one student love learning.",
    bio: "I research inequality and development, and teach first-year economics. I help students choose courses, universities and first jobs with clear heads and big ambitions.",
    story: [
      "I came to the UK at seventeen for university and had to learn everything at once — the slang, the cold, the student loan system.",
      "I mentor because choosing a university is one of the biggest financial decisions a young person makes, and most do it on vibes.",
    ],
    quote: "Ask 'why' one more time than feels polite.",
    photo: P("terry.webp"),
    ageGroups: ["17–18", "19–24"],
    slots: "Mon 17:00, Thu 17:00",
  },
  {
    firstName: "Alamin",
    lastName: "Ajayi",
    role: "Senior Policy Adviser",
    org: "UK Civil Service · Westminster",
    field: field("public"),
    city: "London",
    region: "London",
    heritage: "Yoruba · Ekiti roots",
    languages: ["English", "Yoruba"],
    years: 11,
    education: [
      { title: "BA Politics, Philosophy & Economics", place: "University of York" },
      { title: "Civil Service Fast Stream", place: "HM Government" },
    ],
    specialities: ["Politics & policy", "Civil Service Fast Stream", "Making change"],
    askMeAbout: [
      "How laws and policies actually get made",
      "The Civil Service Fast Stream",
      "Getting involved in your community now",
      "Politics, PPE and related degrees",
      "Writing to persuade decision-makers",
    ],
    headline: "I help shape national policy. I believe our young people should be in the rooms where decisions are made.",
    bio: "I've worked across several government departments on education and economic policy. I help young people who care about fairness turn that energy into a career in public service.",
    story: [
      "At sixteen I wrote a furious letter to my MP about youth clubs closing. He wrote back. That reply got me hooked on how change happens.",
      "Public service is one of the most powerful ways to help our communities, and too few of us know the way in.",
    ],
    quote: "If you're not at the table, you're on the menu.",
    photo: P("alamin.webp"),
    ageGroups: ["17–18", "19–24", "25–30"],
    slots: "Thu 19:30, Sun 15:30",
  },
  {
    firstName: "Umar",
    lastName: "Uzor",
    role: "Head of Cyber Security",
    org: "Retail group · Reading",
    field: field("tech"),
    city: "Reading",
    region: "South East",
    heritage: "Igbo · Abia roots",
    languages: ["English", "Igbo"],
    years: 13,
    education: [
      { title: "BSc Computer Security", place: "University of Reading" },
      { title: "CISSP", place: "(ISC)²" },
    ],
    specialities: ["Cyber security", "Ethical hacking", "Staying safe online"],
    askMeAbout: [
      "How to become an ethical hacker (legally!)",
      "Cyber security apprenticeships and degrees",
      "Capture-the-flag competitions for teens",
      "Protecting yourself and your family online",
      "Certifications that actually matter",
    ],
    headline: "I protect millions of customers from hackers. I'll teach you to think like a defender.",
    bio: "I lead a team defending a major retailer from cyber attacks. I help curious, puzzle-loving young people discover one of the fastest-growing careers in the UK.",
    story: [
      "I got into trouble at school for getting around the IT department's website blocks. A wise teacher signed me up for a cyber competition instead of a detention.",
      "Cyber security needs people who think differently. Our community is full of them.",
    ],
    quote: "Curiosity plus ethics equals a career.",
    photo: P("umar.webp"),
    ageGroups: ["14–16", "17–18", "19–24", "25–30"],
    slots: "Tue 20:00, Thu 20:00",
  },
];

export const SEED_MENTORS: Mentor[] = SEEDS.map(make);
