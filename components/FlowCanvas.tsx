"use client";

import {
  addEdge,
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  type Connection,
  type Edge,
} from "@xyflow/react";
import { useState } from "react";
import type { Column, Mapping } from "../types/mapping";

function SourceNode({ data }: { data: { label: string } }) {
  return (
    <div className="mappingNode mappingNodeSource">
      <span>{data.label}</span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function TargetNode({ data }: { data: { label: string } }) {
  return (
    <div className="mappingNode mappingNodeTarget">
      <Handle type="target" position={Position.Left} />
      <span>{data.label}</span>
    </div>
  );
}

const nodeTypes = {
  sourceNode: SourceNode,
  targetNode: TargetNode,
};

type Props = {
  sourceColumns: Column[];
  targetColumns: Column[];
  initialMappings: Mapping[];
  saving: boolean;

  

  onCancel: () => void;
  onSave: (mappings: Mapping[]) => void;
};

export default function FlowCanvas({
  sourceColumns,
  targetColumns,
  initialMappings,
  saving,


  onCancel,
  onSave,
}: Props) {
  const sourceNodes = sourceColumns.map((column, index) => ({
    id: column.id,
    type: "sourceNode",
    position: { x: 80, y: index * 90 },
    data: { label: column.name },
    draggable: false,
  }));

  const targetNodes = targetColumns.map((column, index) => ({
    id: column.id,
    type: "targetNode",
    position: { x: 560, y: index * 90 },
    data: { label: column.name },
    draggable: false,
  }));

  const originalEdges: Edge[] = initialMappings.map((mapping) => {
    const confidence = mapping.confidence ?? 50;
    const width = 1 + (confidence / 100) * 5;

    return {
      id: `original-${mapping.sourceId}-${mapping.targetId}`,
      source: mapping.sourceId,
      target: mapping.targetId,
      className: "originalMappingEdge",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "rgba(71, 85, 105, 0.28)",
      },
      style: {
        stroke: "rgba(71, 85, 105, 0.28)",
        strokeWidth: width,
        pointerEvents: "none",
      },
      selectable: false,
      deletable: false,
      reconnectable: false,
      focusable: false,
      zIndex: 0,
      data: {
        original: true,
        confidence,
      },
    };
  });

  const startingEditableEdges: Edge[] = initialMappings.map((mapping) => ({
    id: `editable-${mapping.sourceId}-${mapping.targetId}`,
    source: mapping.sourceId,
    target: mapping.targetId,
    markerEnd: { type: MarkerType.ArrowClosed },
    zIndex: 1,
  }));

  const [editableEdges, setEditableEdges, onEditableEdgesChange] = //editable edges ko store aur update karne ke liye use hota hai.
    useEdgesState(startingEditableEdges);
    const [contextMenu, setContextMenu] = useState<{
  x: number;  //Right click karne pe menu khulni chahiye
  y: number;
  edgeId: string; // Jis edge pr right click hua hai uski id store karta hai.
} | null>(null);

  function isValidConnection(connection: Edge | Connection) {
    return !editableEdges.some(
      (edge) =>
        edge.source === connection.source ||
        edge.target === connection.target,
    );
  }

  function connectColumns(connection: Connection) {
    if (!isValidConnection(connection)) {
      return;
    }

    setEditableEdges((currentEdges) =>
      addEdge(
        {
          ...connection,
          id: `editable-${connection.source}-${connection.target}`,
          markerEnd: { type: MarkerType.ArrowClosed },
          zIndex: 1,
        },
        currentEdges,
      ),
    );
  }
  function onEdgeContextMenu(  // User jab right click karta hai toh delete menu khulta hai naki browser ka default menu
  event: React.MouseEvent,
  edge: Edge,
) {
  event.preventDefault();

  setContextMenu({
    x: event.clientX,
    y: event.clientY,
    edgeId: edge.id,
  });
}
function deleteEdge() {  // For removing clicked editable edge and close the menu
  if (!contextMenu) return;

  setEditableEdges((edges) =>
    edges.filter((edge) => edge.id !== contextMenu.edgeId)
  );

  setContextMenu(null);
}


  function save() {
    const mappings = editableEdges.map((edge) => ({
      sourceId: edge.source,
      targetId: edge.target,
    }));

    onSave(mappings);
  }

  return (
    <div className="flowEditor">
      <header className="flowToolbar">
        <div>
          <h2>Review column mappings</h2>
          <p>
            Faded lines show the original AI suggestions. Solid lines are your
            saved mappings and can be deleted and redrawn.
          </p>
        </div>

        <div className="flowActions">
          <span className="mappingCount">
            {editableEdges.length} current mappings
          </span>
          <button className="secondaryButton" disabled={saving} onClick={onCancel}>
            Cancel
          </button>
          <button className="primaryButton" disabled={saving} onClick={save}>
            {saving ? "Generating..." : "Save and download"}
          </button>
        </div>
      </header>
      

      <div className="columnHeadings">
        <strong>Source workbook</strong>
        <strong>Target headers</strong>
      </div>

      <div className="flowSurface">
        <ReactFlow
          nodes={[...sourceNodes, ...targetNodes]}
          edges={[...originalEdges, ...editableEdges]}
          nodeTypes={nodeTypes}
          onConnect={connectColumns}
          onEdgesChange={onEditableEdgesChange}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneClick={() => setContextMenu(null)}
          isValidConnection={isValidConnection}
          nodesDraggable={false}
          edgesReconnectable={false}
          deleteKeyCode={["Backspace", "Delete"]}
          fitView
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
        {contextMenu && (
  <div
    style={{
      position: "fixed",
      left: contextMenu.x,
      top: contextMenu.y,
      background: "white",
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "8px",
      zIndex: 1000,
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    }}
  >
    <button onClick={deleteEdge}>  
  Delete
</button>
  </div>
)}
      </div>
      
    </div>
  );
}
