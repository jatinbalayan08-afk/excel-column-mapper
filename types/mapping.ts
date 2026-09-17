export interface Column {
  id: string;
  name: string;
  index: number;
}
export interface Mapping {
  sourceId: string;
  targetId: string;
  confidence?: number;
}

export interface MappingResult {
  sourceColumns: Column[];
  targetColumns: Column[];
  mappings: Mapping[];
}