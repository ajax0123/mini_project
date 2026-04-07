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
  "Mobile Payment Screenshot",
  "Electricity/Utility Bill",
  "Rent Receipt",
  "Salary Slip",
  "OTT Subscription Invoice",
  "Insurance Premium Receipt",
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
      "image/webp": [".webp"],
    },
  });

  const removeFile = (file: File) => {
    setUploadedFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const latestScan = uploadedFiles.findLast((f) => f.scanResult)?.scanResult;

  return (
    <div className="space-y-6">
      {/* Document Type Selection */}
      <div>
        <p className="text-sm font-medium text-slate-500 mb-3">What are you uploading?</p>
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedDocType(type)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                selectedDocType === type
                  ? "border-[#0A1628] bg-[#0A1628] text-white shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      {scanning && uploadedFiles.some((f) => f.scanning) ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-[#10B981]/40 bg-slate-50 min-h-[200px]">
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="w-10 h-10 border-[3px] border-[#10B981] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-700 font-medium">Scanning document...</p>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl py-14 px-6 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-[#10B981] bg-[#10B981]/5"
              : "border-slate-300 hover:border-slate-400 bg-white"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragActive ? "text-[#10B981]" : "text-slate-400"}`} />
          <p className="text-slate-700 font-semibold text-base">
            {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
          </p>
          <p className="text-sm text-slate-400 mt-2">PDF, JPG, PNG, WEBP up to 10MB</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {uploadedFiles.map((uf, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border ${
                uf.error ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
              }`}
            >
              <FileText className="w-4 h-4 text-[#10B981]" />
              <span className="text-slate-700 max-w-[140px] truncate">{uf.file.name}</span>
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

      {/* Scan Results */}
      {latestScan && (
        <div className="bg-[#10B981]/5 border border-[#10B981]/30 rounded-xl p-5 animate-fade-up">
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
