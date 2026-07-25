import * as XLSX from "xlsx";

export class XLReader {
  private sheet: XLSX.WorkSheet;
  
  constructor(fileBuffer: ArrayBuffer) {
    const workbook = XLSX.read(fileBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error("The workbook has no worksheets.");
    }

    const firstSheet = workbook.Sheets[sheetName];

    if (!firstSheet) {
      throw new Error("The first worksheet could not be read.");
    }

    this.sheet = firstSheet;
  }

  getSheet() {
    return this.sheet;
  }

  getColumns(): string[] {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(this.sheet, {
      header: 1,
      defval: "",
    });

    if (rows.length === 0) {
      return [];
    }

    return rows[0].map((value) => String(value).trim());
  }
}
