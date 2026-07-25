export type Column = {
  id: string;
  name: string;
  index: number;
};

export type Mapping = {
  sourceId: string;
  targetId: string;
  confidence?: number;
};

export type MappingResult = {
  sourceColumns: Column[];
  targetColumns: Column[];
  mappings: Mapping[];
};
