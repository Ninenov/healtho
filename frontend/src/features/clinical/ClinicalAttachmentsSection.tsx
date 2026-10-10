
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
    getClinicalAttachments,
    uploadClinicalAttachment,
    downloadClinicalAttachment,
    type ClinicalAttachment,
} from "@/features/clinical/api";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = [".pdf", ".jpg", ".jpeg", ".png"];

const CATEGORIES = [
    ["LAB_REPORT", "Lab report"],
    ["IMAGING", "Imaging"],
    ["PRESCRIPTION", "Prescription"],
    ["REFERRAL", "Referral letter"],
    ["DISCHARGE_SUMMARY", "Discharge summary"],
    ["OTHER", "Other"],
] as const;

function getErrorMessage(error: unknown): string {
    const err = error as {
        response?: {
            data?: {
                detail?: string;
                file?: string[];
                title?: string[];
            };
        };
        message?: string;
    };

    const data = err?.response?.data;

    if (data?.detail) return data.detail;
    if (data?.file?.[0]) return data.file[0];
    if (data?.title?.[0]) return data.title[0];

    return err?.message || "The request failed. Please try again.";
}

function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ClinicalAttachmentsSection({
    encounterId,
    disabled = false,
}: {
    encounterId: string;
    disabled?: boolean;
}) {
    const [attachments, setAttachments] = useState<ClinicalAttachment[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("OTHER");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const refresh = useCallback(async () => {
        setLoading(true);

        try {
            const data = await getClinicalAttachments(encounterId);
            setAttachments(data);
            setError("");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [encounterId]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    async function handleUpload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (!file) {
            setError("Choose a PDF, JPG, or PNG file first.");
            return;
        }

        const extension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;

        if (!ALLOWED_TYPES.includes(extension)) {
            setError("Only PDF, JPG, JPEG, and PNG files are supported.");
            return;
        }

        if (file.size > MAX_FILE_BYTES) {
            setError("The file must be 10 MB or smaller.");
            return;
        }

        if (!title.trim()) {
            setError("Enter a title for this file.");
            return;
        }

        setUploading(true);

        try {
            await uploadClinicalAttachment(encounterId, {
                file,
                title: title.trim(),
                description: description.trim(),
                category,
            });

            setTitle("");
            setDescription("");
            setCategory("OTHER");
            setFile(null);

            const input = document.getElementById(
                `clinical-file-${encounterId}`,
            ) as HTMLInputElement | null;

            if (input) input.value = "";

            setNotice("File uploaded successfully.");
            await refresh();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setUploading(false);
        }
    }

    async function handleDownload(item: ClinicalAttachment) {
        setError("");
        setDownloadingId(item.id);

        try {
            const blob = await downloadClinicalAttachment(item.id);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = item.original_filename || item.title || "clinical-file";

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDownloadingId(null);
        }
    }

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-semibold text-gray-950">
                        Clinical files &amp; reports
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Attach lab reports, scans, prescriptions, referral letters, or
                        discharge summaries.
                    </p>
                </div>

                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    {attachments.length}{" "}
                    {attachments.length === 1 ? "file" : "files"}
                </span>
            </div>

            {error && (
                <p
                    role="alert"
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                    {error}
                </p>
            )}

            {notice && (
                <p
                    role="status"
                    className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                >
                    {notice}
                </p>
            )}

            {!disabled && (
                <form
                    onSubmit={handleUpload}
                    className="mt-5 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor={`clinical-title-${encounterId}`}
                                className="mb-1.5 block text-xs font-semibold text-gray-700"
                            >
                                File title *
                            </label>

                            <input
                                id={`clinical-title-${encounterId}`}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                maxLength={150}
                                required
                                placeholder="e.g. Complete blood count"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor={`clinical-category-${encounterId}`}
                                className="mb-1.5 block text-xs font-semibold text-gray-700"
                            >
                                Category
                            </label>

                            <select
                                id={`clinical-category-${encounterId}`}
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                            >
                                {CATEGORIES.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor={`clinical-description-${encounterId}`}
                            className="mb-1.5 block text-xs font-semibold text-gray-700"
                        >
                            Description (optional)
                        </label>

                        <textarea
                            id={`clinical-description-${encounterId}`}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={2}
                            placeholder="Short note about this file"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor={`clinical-file-${encounterId}`}
                            className="mb-1.5 block text-xs font-semibold text-gray-700"
                        >
                            Choose file * (PDF/JPG/PNG, max 10 MB)
                        </label>

                        <input
                            id={`clinical-file-${encounterId}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                            required
                            onChange={(event) =>
                                setFile(event.target.files?.[0] || null)
                            }
                            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-gray-700"
                        />

                        {file && (
                            <p className="mt-1 text-xs text-gray-500">
                                Selected: {file.name} ({formatSize(file.size)})
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={uploading || !file || !title.trim()}
                        className="rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {uploading ? "Uploading…" : "Upload file"}
                    </button>
                </form>
            )}

            {disabled && (
                <p className="mt-4 text-sm text-gray-500">
                    This consultation is complete. Uploading additional files is
                    disabled.
                </p>
            )}

            <div className="mt-5 space-y-3">
                {loading ? (
                    <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                        Loading files…
                    </p>
                ) : attachments.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500">
                        No files attached to this consultation yet.
                    </p>
                ) : (
                    attachments.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <p className="break-words font-semibold text-gray-900">
                                    {item.title}
                                </p>

                                <p className="mt-1 break-words text-xs text-gray-500">
                                    {item.original_filename} · {formatSize(item.size_bytes)} ·{" "}
                                    {item.category_display || item.category}
                                </p>

                                {item.description && (
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                                        {item.description}
                                    </p>
                                )}

                                {item.created_at && (
                                    <p className="mt-1 text-xs text-gray-400">
                                        Uploaded{" "}
                                        {new Date(item.created_at).toLocaleString("en-IN")}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => void handleDownload(item)}
                                disabled={downloadingId === item.id}
                                className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {downloadingId === item.id ? "Downloading…" : "Download"}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
