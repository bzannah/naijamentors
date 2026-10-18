import type { FieldKey } from "./types";

export type Field = {
  key: FieldKey;
  label: string;
  short: string;
  blurb: string;
};

export const FIELDS: Field[] = [
  { key: "medicine", label: "Medicine & Health", short: "Medicine", blurb: "Doctors, pharmacists, nurses and clinicians" },
  { key: "law", label: "Law", short: "Law", blurb: "Barristers, solicitors and legal minds" },
  { key: "tech", label: "Technology", short: "Tech", blurb: "Engineers, data scientists and security experts" },
  { key: "engineering", label: "Engineering", short: "Engineering", blurb: "Civil, rail and infrastructure builders" },
  { key: "finance", label: "Finance & Business", short: "Finance", blurb: "Bankers, accountants and strategists" },
  { key: "enterprise", label: "Entrepreneurship", short: "Founders", blurb: "Founders who built something from nothing" },
  { key: "creative", label: "Creative & Media", short: "Creative", blurb: "Producers, designers, writers and architects" },
  { key: "education", label: "Education & Academia", short: "Academia", blurb: "Teachers, lecturers and admissions experts" },
  { key: "public", label: "Public Service", short: "Public service", blurb: "Policy makers and civil servants" },
  { key: "sport", label: "Sport", short: "Sport", blurb: "Coaches and sports scientists" },
];

export const FIELD_MAP = Object.fromEntries(FIELDS.map((f) => [f.key, f])) as Record<FieldKey, Field>;

export const AGE_GROUPS = ["11–13", "14–16", "17–18", "19–24", "25–30"];

/** Where a mentor is based, for the directory's region filter. */
export const REGIONS = [
  "London",
  "South East",
  "South West",
  "East of England",
  "East Midlands",
  "West Midlands",
  "Yorkshire and the Humber",
  "North West",
  "North East",
  "Wales",
  "Scotland",
  "Northern Ireland",
  "Outside the UK",
];

export const HONORIFICS = ["Dr.", "Prof.", "Engr.", "Barr."];
