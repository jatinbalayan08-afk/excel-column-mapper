"use client";

type Props = {
  open: boolean;
  fileName: string;
  setFileName: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function SaveFileModal({
  open,
  fileName,
  setFileName,
  onCancel,
  onSave,
}: Props) {
  if (!open) {
    return null;
  }

  return (<div className="modalOverlay">
  <div className="saveModal">
    <h2>Save File</h2>

    <p className="saveSubtitle">
      Enter a file name before downloading.
    </p>

    <div className="saveField">
      <label>File Name</label>

      <input
        type="text"
        value={fileName} //ki wajah se input box me wahi value dikhai deti hai jo state me hai.
        onChange={(e) => setFileName(e.target.value)}
        placeholder="Input_output_mapped"
      />
    </div>

    <div className="saveActions">
      <button className="secondaryButton" onClick={onCancel}>
        Cancel
      </button>

      <button className="primaryButton" onClick={onSave}>
        Save
      </button>
    </div>
  </div>
</div>
  );
}