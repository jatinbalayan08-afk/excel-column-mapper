"use client";
import { useEffect, useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import FlowCanvas from "../components/FlowCanvas";
import MappingModal from "../components/MappingModal";
import type { Mapping, MappingResult } from "../types/mapping";
import SaveFileModal from "../components/SaveFileModal";

export default function HomePage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [pendingMappings, setPendingMappings] = useState<Mapping[]>([]);
  const [fileName, setFileName] = useState("Input_output_mapped");

  const [savedFiles, setSavedFiles] = useState<any[]>([]);
  async function loadFiles() {
    try {
      const response = await fetch("/api/files");

      if (response.status === 401) {
        setSavedFiles([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load files");
      }

      const data = await response.json();
      setSavedFiles(data);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    loadFiles();
  }, []);

  async function getErrorMessage(response: Response) {
    const data = await response.json();
    return data.error || "Something went wrong.";
  }

  async function uploadFiles() {
    if (!sourceFile || !targetFile) {
      setError("Choose both Excel files.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("sourceFile", sourceFile);
      formData.append("targetFile", targetFile);

      const response = await fetch("/api/suggest-mappings", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const result = (await response.json()) as MappingResult;
      setMappingResult(result);
      setModalOpen(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadWorkbook(mappings: Mapping[]) {

    if (!sourceFile || !mappingResult) {
      return;
    }

    setSaving(true);
    setError("");

    const saveResponse = await fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mappings,
      }),
    });

    if (!saveResponse.ok) {
      throw new Error(await getErrorMessage(saveResponse));
    }

    try {
      const formData = new FormData();
      formData.append("sourceFile", sourceFile);
      formData.append(
        "sourceColumns",
        JSON.stringify(mappingResult.sourceColumns),
      );
      formData.append(
        "targetColumns",
        JSON.stringify(mappingResult.targetColumns),
      );
      formData.append("mappings", JSON.stringify(mappings));
      formData.append("fileName", fileName);
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const fileBlob = await response.blob();
      const fileUrl = URL.createObjectURL(fileBlob);
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = fileName.endsWith(".xlsx")
        ? fileName
        : `${fileName}.xlsx`;
      link.click();

      URL.revokeObjectURL(fileUrl);
      setModalOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Download failed.");
    } finally {
      setSaving(false);
    }
  }

  function resetMappings() {
    setMappingResult(null);
    setError("");
  }

  return (
    <>
      <Show when="signed-out">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: 700 }}>Excel Mapper</h1>
          <p style={{ color: "#666" }}>Please sign in to continue.</p>
          <Link href="/sign-in">
            <button className="primaryButton">Sign in</button>
          </Link>
        </div>
      </Show>

      <Show when="signed-in">
        <main className="pageShell">
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 24px" }}>
            <UserButton />
          </div>

          <section className="uploadCard">
            <div className="eyebrow">Excel mapper</div>
            <h1>Map source headers to target headers</h1>
            <p className="lead">
              Upload two Excel files, review the suggested mappings, and download a
              copy of the source file with its mapped headers renamed.
            </p>

            <div className="fileGrid">
              <label className="fileField">
                <span>Source workbook</span>
                <small>The workbook containing the data.</small>
                <input
                  type="file"
                  accept=".xlsx,.xls,.xlsm,.xlsb"
                  onChange={(event) => {
                    setSourceFile(event.target.files?.[0] || null);
                    resetMappings();
                  }}
                />
                <strong>{sourceFile?.name || "No file selected"}</strong>
              </label>

              <label className="fileField">
                <span>Target-header workbook</span>
                <small>The workbook containing the replacement headers.</small>
                <input
                  type="file"
                  accept=".xlsx,.xls,.xlsm,.xlsb"
                  onChange={(event) => {
                    setTargetFile(event.target.files?.[0] || null);
                    resetMappings();
                  }}
                />
                <strong>{targetFile?.name || "No file selected"}</strong>
              </label>
            </div>

            {error && <div className="errorMessage">{error}</div>}

            <button
              className="primaryButton uploadButton"
              disabled={!sourceFile || !targetFile || loading}
              onClick={uploadFiles}
            >
              {loading ? "Finding mappings..." : "Upload and review mappings"}
            </button>

            <hr />

            <h2>Saved Files</h2>

            {savedFiles.length === 0 ? (
              <p>No saved files found.</p>
            ) : (
              <ul>
                {savedFiles.map((file: any) => (
                  <li key={file.id}>
                    <strong>{file.fileName}</strong>

                    <br />

                    <small>
                      {new Date(file.createdAt).toLocaleString()}
                    </small>

                    <br />

                    <button
                      onClick={() => {
                        window.open(`/api/files/${file.id}`, "_blank");
                      }}
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            )}

          </section>

          {mappingResult && (
            <>
              <MappingModal open={modalOpen}>
                <FlowCanvas
                  sourceColumns={mappingResult.sourceColumns}
                  targetColumns={mappingResult.targetColumns}
                  initialMappings={mappingResult.mappings}
                  saving={saving}
                  onCancel={() => setModalOpen(false)}
                  onSave={(mappings) => {
                    setPendingMappings(mappings);
                    setSaveModalOpen(true);
                  }}
                />
              </MappingModal>

              <SaveFileModal
                open={saveModalOpen}
                fileName={fileName}
                setFileName={setFileName}
                onCancel={() => setSaveModalOpen(false)}
                onSave={() => {
                  setSaveModalOpen(false);
                  downloadWorkbook(pendingMappings);
                }}
              />
            </>
          )}

        </main>
      </Show>
    </>
  );
}