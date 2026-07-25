# Excel Column Mapper

Upload a source Excel workbook and a target-header workbook. Gemini suggests one-to-one header mappings, and React Flow lets the user review or change them before downloading a renamed copy of the source workbook.

## Mapping lines

- Faded lines are Gemini's original suggestions.
- Their thickness is based on Gemini's confidence from 0 to 100.
- Original lines cannot be selected, deleted, or reconnected.
- Solid lines are the current user mappings.
- Each source can have only one solid outgoing line.
- Each target can have only one solid incoming line.
- The permanent faded lines do not count toward those limits.
- Solid lines initially copy the AI suggestions. Delete a solid line to reveal the original underneath, then draw a replacement.

Only the solid mappings are used when generating the workbook.

## Run

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

The Gemini API key is currently stored in `lib/Chat.ts`, as requested. Do not commit this project to a public repository.

You may override the default Gemini model for the current command:

```bash
GEMINI_MODEL=your-model-name npm run dev
```

## Output behavior

The generated workbook keeps the source workbook's column order and data. It only replaces mapped cells in the first header row with the selected target-header names. Other worksheets are preserved.
