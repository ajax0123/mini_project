import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import type { ScanResult } from "@/lib/types";
import { formatINR } from "@/lib/utils";

interface Props {
  onScanComplete: (result: ScanResult) => void;
}

const DOCUMENT_TYPES = [
  "Bank Statement",
  "Pay Slip",
  "Electricity Bill",
  "Rent Agreement",
  "Insurance Policy",
  "Netflix/OTT Receipt",
  "UPI Statement",
  "ITR Document",
];

interface UploadedFile {
  file: File;
  scanResult?: ScanResult;
  error?: string;
  scanning?: boolean;
}

export default function DocumentUploader({ onScanComplete }: Props) {
  const [selectedDocType, setSelectedDocType] = useState(DOCUMENT_TYPES[0]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [scanning, setScanning] = useState(false);

  const scanFile = async (file: File): Promise<ScanResult | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", selectedDocType);

    try {
      const res = await fetch("/api/creditalt/scan-document", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Scan failed");
      const result = await res.json() as ScanResult;
      return result;
    } catch {
      return null;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      const newEntry: UploadedFile = { file, scanning: true };
      setUploadedFiles((prev) => [...prev, newEntry]);
      setScanning(true);

      const result = await scanFile(file);

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                scanning: false,
                scanResult: result ?? undefined,
                error: result ? undefined : "Scan failed",
              }
            : f
        )
      );
      setScanning(false);

      if (result) onScanComplete(result);
    },
    [selectedDocType, onScanComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const removeFile = (file: File) => {
    setUploadedFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const latestScan = uploadedFiles.findLast((f) => f.scanResult)?.scanResult;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-slate-600 mb-3">Select Document Type</p>
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedDocType(type)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                selectedDocType === type
                  ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]"
                  : "border-slate-200 text-slate-500 hover:border-[#10B981]/50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {scanning && uploadedFiles.some((f) => f.scanning) ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#10B981]/30 bg-slate-900 min-h-[160px]">
          <div className="absolute inset-0 bg-[#0A1628]/60 flex flex-col items-center justify-center z-10">
            <div className="w-8 h-8 border-[3px] border-[#10B981] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-medium">Scanning document...</p>
            <div className="absolute left-0 right-0 h-0.5 bg-[#10B981]/70 animate-scan-line" />
          </div>
          <div className="h-40" />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors duration-300 ${
            isDragActive
              ? "border-[#10B981] bg-[#10B981]/10"
              : "border-slate-300 hover:border-[#10B981] bg-slate-50 hover:bg-[#10B981]/5"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">
            {isDragActive ? "Drop your document here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-sm text-slate-400 mt-1">Supports PDF, JPG, PNG — up to 15MB</p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="flex gap-3 flex-wrap mt-4">
          {uploadedFiles.map((uf, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                uf.error ? "bg-red-50 border border-red-200" : "bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4 text-[#10B981]" />
              <span className="text-slate-700 max-w-[120px] truncate">{uf.file.name}</span>
              {uf.scanning && (
                <div className="w-3 h-3 border border-[#10B981] border-t-transparent rounded-full animate-spin" />
              )}
              {uf.scanResult && <CheckCircle className="w-3 h-3 text-[#10B981]" />}
              {uf.error && <AlertCircle className="w-3 h-3 text-red-500" />}
              <button onClick={() => removeFile(uf.file)}>
                <X className="w-3 h-3 text-slate-400 hover:text-red-500 transition-colors" />
              </button>
            </div>
          ))}
        </div>
      )}

      {latestScan && (
        <div className="bg-[#10B981]/5 border border-[#10B981]/30 rounded-2xl p-5 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-[#10B981] w-5 h-5" />
            <span className="font-semibold text-[#10B981]">Document Scanned Successfully</span>
            <span className="ml-auto text-xs bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded-full">
              {Math.round(latestScan.confidence * 100)}% Confidence
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {latestScan.extractedData.monthlyIncome && (
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-400">Monthly Income</p>
                <p className="font-bold text-[#0A1628]">₹{formatINR(latestScan.extractedData.monthlyIncome)}</p>
              </div>
            )}
            {latestScan.extractedData.avgBalance && (
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-400">Avg Balance</p>
                <p className="font-bold text-[#0A1628]">₹{formatINR(latestScan.extractedData.avgBalance)}</p>
              </div>
            )}
            {latestScan.extractedData.employerName && (
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-400">Employer</p>
                <p className="font-bold text-[#0A1628] text-sm">{latestScan.extractedData.employerName}</p>
              </div>
            )}
            {latestScan.extractedData.employmentType && (
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-400">Employment</p>
                <p className="font-bold text-[#0A1628] text-sm">{latestScan.extractedData.employmentType}</p>
              </div>
            )}
            {latestScan.extractedData.missedPayments !== null &&
              latestScan.extractedData.missedPayments !== undefined && (
                <div className="bg-white rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-slate-400">Missed Payments</p>
                  <p className={`font-bold text-sm ${latestScan.extractedData.missedPayments > 0 ? "text-red-500" : "text-[#10B981]"}`}>
                    {latestScan.extractedData.missedPayments}
                  </p>
                </div>
              )}
            {latestScan.extractedData.upiTransactionCount && (
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-400">UPI Transactions</p>
                <p className="font-bold text-[#0A1628]">{latestScan.extractedData.upiTransactionCount}</p>
              </div>
            )}
          </div>

          {latestScan.warnings.length > 0 && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700 font-medium">Warnings:</p>
              {latestScan.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-600 mt-1">• {w}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
