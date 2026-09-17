import * as XLSX from "xlsx";
import { auth } from "@clerk/nextjs/server";
import type { Column, Mapping } from "../../../types/mapping";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs"; //Next.js ko bol rahe hain Ye API Node.js Runtime me chalni chahiye.

export async function POST(request: Request) { //GET SENDER OR POST RECEIVER
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const sourceFile = formData.get("sourceFile"); //Jo source Excel upload hui thi use nikal lo.

    if (!(sourceFile instanceof File)) {
      throw new Error("Source file is missing.");
    }

    const sourceColumns = JSON.parse(
      String(formData.get("sourceColumns")),
    ) as Column[];
    const targetColumns = JSON.parse(
      String(formData.get("targetColumns")),
    ) as Column[];
    const mappings = JSON.parse(  // JSON.parse JSON string ko wapas JavaScript Array/Object me convert karo.
      String(formData.get("mappings")),

    ) as Mapping[];

    const fileName = String(formData.get("fileName"));

    const workbook = XLSX.read(await sourceFile.arrayBuffer(), {
      type: "array",
    });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error("The source workbook has no worksheets.");
    }

    const sheet = workbook.Sheets[sheetName];
    const usedSources = new Set<string>();
    const usedTargets = new Set<string>();

    for (const mapping of mappings) {
      if (usedSources.has(mapping.sourceId) || usedTargets.has(mapping.targetId)) {
        throw new Error("Each column can only be mapped once.");
      }

      const source = sourceColumns.find(
        (column) => column.id === mapping.sourceId,
      );
      const target = targetColumns.find(
        (column) => column.id === mapping.targetId,
      );

      if (!source || !target) {
        throw new Error("One of the saved mappings is invalid.");
      }

      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: source.index });
      sheet[cellAddress] = {
        ...sheet[cellAddress],
        t: "s",
        v: target.name,
      };

      usedSources.add(mapping.sourceId);
      usedTargets.add(mapping.targetId);
    }

    const output = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileBuffer = Buffer.from(output);

    await prisma.savedFile.create({
      data: {
        userId: userId,
        fileName: fileName.endsWith(".xlsx")
          ? fileName
          : `${fileName}.xlsx`,
        fileData: fileBuffer,
      },
    });

    return new Response(output, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": // Ye browser ko btata hai dowload ke time file ka kya name rakhna hai
`attachment; filename="${
  fileName.endsWith(".xlsx")
    ? fileName   // file ko kisi bhi name se save karne ke liye
    : `${fileName}.xlsx`
}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate workbook.";
    return Response.json({ error: message }, { status: 400 });
  }
}