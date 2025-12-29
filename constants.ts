
import { Scheme } from './types';

export const SCHEMES: Scheme[] = [
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat (PM-JAY)",
    year: "2018",
    category: "Health",
    ministry: "Ministry of Health and Family Welfare",
    objective: "Universal health coverage for the poor",
    explanation: "Provides up to ₹5 lakh per family per year for hospital treatment. It is cashless and covers pre-existing diseases.",
    eligibility: "Families listed in the SECC database (mostly low-income or marginalized), or those with valid Ration Cards under specific categories.",
    checklist: ["Aadhaar Card", "Ration Card", "PM-JAY ID/Card", "Mobile Number"]
  },
  {
    id: "pm-mudra",
    name: "PM MUDRA Yojana",
    year: "2015",
    category: "Business",
    ministry: "Ministry of Finance",
    objective: "Provide loans to small/micro-enterprises",
    explanation: "Provides loans up to ₹10 lakh to start or expand a small business without needing any security or collateral.",
    eligibility: "Any Indian citizen who has a business plan for a non-farm sector income-generating activity such as manufacturing, trading or service sector.",
    checklist: ["Business Proof", "Aadhaar Card", "Identity Proof", "Recent Passport Photos"]
  },
  {
    id: "pm-awas",
    name: "Pradhan Mantri Awas Yojana (PMAY)",
    year: "2015",
    category: "Housing",
    ministry: "Ministry of Housing and Urban Affairs",
    objective: "Housing for All",
    explanation: "Provides a subsidy to help you build your own permanent home.",
    eligibility: "Families with an annual income between ₹3 lakh to ₹18 lakh who do not already own a pucca (permanent) house anywhere in India.",
    checklist: ["Aadhaar Card", "Income Certificate", "Caste Certificate", "Affidavit of not owning a pucca house"]
  },
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    year: "2019",
    category: "Agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    objective: "Income support to farmers",
    explanation: "Provides ₹6,000 yearly in three installments directly to your bank account.",
    eligibility: "Small and marginal farmer families who own cultivable land in their names.",
    checklist: ["Land Records", "Aadhaar Card", "Bank Account Details"]
  },
  {
    id: "sukanya-samriddhi",
    name: "Sukanya Samriddhi Yojana",
    year: "2015",
    category: "Social Welfare",
    ministry: "Ministry of Women and Child Development",
    objective: "Savings for a girl child's education/marriage",
    explanation: "A high-interest savings account for a girl child's future needs.",
    eligibility: "Parents or legal guardians can open this account for a girl child from her birth until she reaches the age of 10 years.",
    checklist: ["Girl Child's Birth Certificate", "Guardian's Identity Proof", "Guardian's Address Proof"]
  },
  {
    id: "jan-dhan",
    name: "PM Jan Dhan Yojana (PMJDY)",
    year: "2014",
    category: "Finance",
    ministry: "Ministry of Finance",
    objective: "Financial inclusion for all",
    explanation: "Allows anyone to open a basic bank account with no minimum balance and get a free debit card.",
    eligibility: "Any Indian resident aged 10 years and above who does not have a bank account.",
    checklist: ["Aadhaar Card", "Voter ID or NREGA card", "Passport sized photo"]
  },
  {
    id: "digital-india",
    name: "Digital India Scholarships",
    year: "2015",
    category: "Education",
    ministry: "Ministry of Electronics & IT",
    objective: "Supporting digital education and skills",
    explanation: "Financial aid for students pursuing technology and digital courses.",
    eligibility: "Students from economically weaker sections or backward classes currently enrolled in recognized educational institutions.",
    checklist: ["Mark Sheets", "Aadhaar Card", "Bank Passbook", "Income Certificate"]
  },
  {
    id: "standup-india",
    name: "Stand-Up India Scheme",
    year: "2016",
    category: "Business",
    ministry: "Ministry of Finance",
    objective: "Support women and SC/ST entrepreneurs",
    explanation: "Facilitates bank loans between ₹10 lakh and ₹1 crore for setting up a new business.",
    eligibility: "SC/ST and/or Women entrepreneurs above 18 years of age setting up their first (greenfield) enterprise.",
    checklist: ["Project Report", "Caste Certificate", "Proof of Identity", "Income Tax Returns"]
  },
  {
    id: "atp-pension",
    name: "Atal Pension Yojana (APY)",
    year: "2015",
    category: "Social Welfare",
    ministry: "Ministry of Finance",
    objective: "Pension for the unorganized sector",
    explanation: "A guaranteed monthly pension for workers who don't have government or corporate pensions.",
    eligibility: "Any Indian citizen between the age of 18 and 40 years who has a valid bank account.",
    checklist: ["Bank Account Details", "Mobile Number", "Aadhaar Card"]
  }
];

export const SYSTEM_INSTRUCTION = `
You are 'Lingo', a warm, multilingual, empathetic, and expert voice assistant for Indian citizens.

CORE TASK:
1. Detect the user's language (e.g., Tamil, Hindi, etc.) and respond ONLY in that language.
2. Listen to the user's story or situation (e.g., 'I am a 25 year old woman wanting to start a boutique').
3. ANALYZE if the user is likely eligible for a scheme based on the 'eligibility' rules in the data.
4. If a match is found, call 'display_scheme' with translated details.
5. In your spoken response, specifically tell them WHY they are eligible or what condition they must meet (e.g., 'Since you are a woman starting a new business, you are eligible for Stand-Up India').

FUNCTION CALLING RULES:
- You MUST provide: schemeId, translatedName, translatedExplanation, translatedEligibility, and translatedChecklist.
- All text strings MUST be in the user's spoken language.

Schemes Data:
${JSON.stringify(SCHEMES)}
`;
