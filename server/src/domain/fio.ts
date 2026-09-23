import petrovich from "petrovich";

export type Gender = "male" | "female";

export function genderByMiddleName(middleName?: string): Gender | undefined {
  const m = middleName?.trim().toLowerCase();
  if (!m) return undefined;
  if (/(вна|чна|инична)$/.test(m)) return "female";
  if (/(вич|ич)$/.test(m)) return "male";
  return undefined;
}

export function normalizeGender(value?: string): Gender | undefined {
  const v = value?.trim().toLowerCase();
  if (v === "м" || v === "male") return "male";
  if (v === "ж" || v === "female") return "female";
  return undefined;
}

export interface FioInput {
  lastName: string;
  firstName: string;
  middleName?: string;
  gender?: string;
}

export function genitiveFullName(input: FioInput): { text: string; genderAssumed: boolean } {
  const detected = normalizeGender(input.gender) ?? genderByMiddleName(input.middleName);
  const gender = detected ?? "male";

  const result = petrovich(
    { gender, last: input.lastName, first: input.firstName, middle: input.middleName ?? "" },
    "genitive"
  );

  return {
    text: [result.last, result.first, result.middle].filter(Boolean).join(" "),
    genderAssumed: !detected,
  };
}