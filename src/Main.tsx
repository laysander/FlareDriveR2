// Main.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";
import { Home as HomeIcon, NoteAdd as NoteAddIcon } from "@mui/icons-material";

import FileGrid, { encodeKey, FileItem, isDirectory } from "./FileGrid";
import MultiSelectToolbar from "./MultiSelectToolbar";
import UploadDrawer, { UploadFab } from "./UploadDrawer";
import TextPadDrawer from "./TextPadDrawer";
import { copyPaste, fetchPath } from "./app/transfer";
import { useTransferQueue, useUploadEnqueue } from "./app/transferQueue";

// ✅ NEW: authFetch for DELETE
import { authFetch } from "./auth";

// Centered helper
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      {children}
    </Box>
  );
}

// (kode lain TIDAK berubah)

// Main Component
function Main({
  search,
  onError,
}: {
  search: string;
  onError: (error: Error) => void;
}) {
  const [cwd, setCwd] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [multiSelected, setMultiSelected] = useState<string[] | null>(null);
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);
  const [showTextPadDrawer, setShowTextPadDrawer] = useState(false);
  const [lastUploadKey, setLastUploadKey] = useState<string | null>(null);

  const transferQueue = useTransferQueue();
  const uploadEnqueue = useUploadEnqueue();

  const fetchFiles = useCallback(() => {
    fetchPath(cwd)
      .then((files) => {
        setFiles(files);
        setMultiSelected(null);
      })
      .catch(onError)
      .finally(() => setLoading(false));
  }, [cwd, onError]);

  useEffect(() => setLoading(true), [cwd]);
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // (bagian lain TIDAK berubah)

  return (
    <>
      {/* UI TIDAK berubah */}

      <MultiSelectToolbar
        multiSelected={multiSelected}
        onClose={() => setMultiSelected(null)}
        onDownload={() => {
          if (multiSelected?.length !== 1) return;
          const a = document.createElement("a");
          a.href = `/webdav/${encodeKey(multiSelected[0])}`;
          a.download = multiSelected[0].split("/").pop()!;
          a.click();
        }}
        onRename={async () => {
          if (multiSelected?.length !== 1) return;
          const newName = window.prompt("Rename to:");
          if (!newName) return;
          await copyPaste(multiSelected[0], cwd + newName, true);
          fetchFiles();
        }}
        onDelete={async () => {
          if (!multiSelected?.length) return;
          const filenames = multiSelected
            .map((key) => key.replace(/\/$/, "").split("/").pop())
            .join("\n");
          const confirmMessage = "Delete the following file(s) permanently?";
          if (!window.confirm(`${confirmMessage}\n${filenames}`)) return;

          // ✅ FIXED: pakai authFetch
          for (const key of multiSelected)
            await authFetch(`/webdav/${encodeKey(key)}`, {
              method: "DELETE",
            });

          fetchFiles();
        }}
        onShare={() => {
          if (multiSelected?.length !== 1) return;
          const url = new URL(
            `/webdav/${encodeKey(multiSelected[0])}`,
            window.location.href
          );
          navigator.share({ url: url.toString() });
        }}
      />
    </>
  );
}

export default Main;
