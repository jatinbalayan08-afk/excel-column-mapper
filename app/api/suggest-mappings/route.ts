import { Chat } from "../../../lib/Chat";
import { XLReader } from "../../../lib/XLReader";
import type { Column, Mapping } from "../../../types/mapping";

export const runtime = "nodejs";

function makeColumns(headers: string[], type: "source" | "target"): Column[] {
  return headers.map((name, index) => ({
    id: `${type}-${index}`,
    name: name || `Unnamed column ${index + 1}`,
    index,
  }));
}

function parseMappings(
  text: string,
  sourceColumns: Column[],
  targetColumns: Column[],
): Mapping[] {
  // Gemini may put the JSON inside a markdown code block.
  const jsonText = text.replace(/```json|```/gi, "").trim();
  const aiMappings = JSON.parse(jsonText) as Mapping[];

  const sourceIds = new Set(sourceColumns.map((column) => column.id));
  const targetIds = new Set(targetColumns.map((column) => column.id));
  const usedSources = new Set<string>();
  const usedTargets = new Set<string>();
  const validMappings: Mapping[] = [];

  for (const mapping of aiMappings) {
    const isValid =
      sourceIds.has(mapping.sourceId) &&
      targetIds.has(mapping.targetId) &&
      !usedSources.has(mapping.sourceId) &&
      !usedTargets.has(mapping.targetId);

    if (isValid) {
      validMappings.push({
        sourceId: mapping.sourceId,
        targetId: mapping.targetId,
        confidence:
          typeof mapping.confidence === "number"
            ? Math.max(0, Math.min(100, mapping.confidence))
            : 50,
      });
      usedSources.add(mapping.sourceId);
      usedTargets.add(mapping.targetId);
    }
  }

  return validMappings;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sourceFile = formData.get("sourceFile");
    const targetFile = formData.get("targetFile");

    if (!(sourceFile instanceof File) || !(targetFile instanceof File)) {
      throw new Error("Please upload both Excel files.");
    }

    const sourceReader = new XLReader(await sourceFile.arrayBuffer());
    const targetReader = new XLReader(await targetFile.arrayBuffer());

    const sourceColumns = makeColumns(sourceReader.getColumns(), "source");
    const targetColumns = makeColumns(targetReader.getColumns(), "target");

    if (sourceColumns.length === 0 || targetColumns.length === 0) {
      throw new Error("Both workbooks need a header row.");
    }

    const prompt = `
Match the source Excel columns to the target Excel columns by meaning.
Each source and target can be used only once.
Return only a JSON array with sourceId, targetId, and confidence.
Confidence must be a number from 0 to 100.

Source columns:
${JSON.stringify(sourceColumns)}

Target columns:
${JSON.stringify(targetColumns)}

Example response:
[
  { "sourceId": "source-0", "targetId": "target-2", "confidence": 92 }
]
`;

    const chat = new Chat();
    const answer = await chat.ask(prompt);
    const mappings = parseMappings(answer, sourceColumns, targetColumns);

    return Response.json({ sourceColumns, targetColumns, mappings });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create mappings.";

    return Response.json({ error: message }, { status: 400 });
  }
}
