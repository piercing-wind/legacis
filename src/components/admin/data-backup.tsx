'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DataBackup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async (type: "data" | "full") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) {
        const errText = await res.text();
        setError(errText || "Failed to download backup.");
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `legacis_${type}_backup_${new Date().toISOString().split("T")[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 mt-auto mb-4">
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => handleDownload("data")}
          disabled={loading}
          size={'sm'}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Data-only Backup
        </Button>
        <Button
          onClick={() => handleDownload("full")}
          disabled={loading}
          size={'sm'}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Full Backup
        </Button>
      </div>
      {loading && <span className="text-sm text-muted-foreground">Preparing backup...</span>}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
