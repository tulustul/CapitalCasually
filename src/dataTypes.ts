export type JsonType = {
  $schema: string;
};

export type CapitalType =
  | "company"
  | "countryBudget"
  | "countryIncome"
  | "countryDebt";

export type DataIndex = JsonType & {
  sections: DataIndexSection[];
};

export type DataIndexSection = {
  name: string;
  sections?: DataIndexSection[];
  description?: string;
  path?: string;
};

export type CapitalMetadata = JsonType & {
  name: string;
  type: CapitalType;
  description?: string;
  datasets: string[];
};

export type CapitalData = JsonType & {
  name: string;
};
