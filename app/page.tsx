"use client";

import { useState } from "react";

type Recommendation = {
  title: string;
  description: string;
  reason: string;
};

type AIResult = {
  item_type: string;
  material: string;
  colors: string[];
  visible_features: string[];
  recommendations: Recommendation[];
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const imageBase64 = await fileToBase64(file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageBase64,
          mimeType: file.type,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Analysis failed.");
      }

      let parsedResult: AIResult;

      try {
        parsedResult =
          typeof data.result === "string"
            ? JSON.parse(data.result)
            : data.result;
      } catch {
        throw new Error("The AI returned an invalid response.");
      }

      setResult(parsedResult);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setPreview("");
    setNote("");
    setResult(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-400">
            Vintage Magic
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Reimagine Your Piece
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
            Upload a textile, garment, or fabric and let our AI suggest
            creative ways it could be transformed.
          </p>
        </div>

        {/* Upload Card */}
        {!result && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:p-8">
            <label
              htmlFor="image-upload"
              className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-950 p-8 text-center transition hover:border-neutral-500"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Selected item"
                  className="max-h-80 max-w-full rounded-lg object-contain"
                />
              ) : (
                <>
                  <div className="mb-4 text-5xl">＋</div>

                  <h2 className="text-xl font-semibold">
                    Upload your piece
                  </h2>

                  <p className="mt-2 text-sm text-neutral-500">
                    JPG, PNG, WEBP
                  </p>
                </>
              )}

              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* File name */}
            {file && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-neutral-800 px-4 py-3">
                <span className="truncate text-sm text-neutral-300">
                  {file.name}
                </span>

                <button
                  onClick={reset}
                  className="ml-4 text-sm text-neutral-400 hover:text-white"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Customer note */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Tell us anything about the piece
                <span className="ml-2 text-neutral-500">(optional)</span>
              </label>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Example: I want to turn this into something I can wear..."
                rows={4}
                className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-950 p-4 text-sm outline-none placeholder:text-neutral-600 focus:border-neutral-400"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Analyze */}
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="mt-6 w-full rounded-lg bg-white px-6 py-4 font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Analyzing your piece..." : "Analyze My Piece"}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Item information */}
            <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row">
                {preview && (
                  <img
                    src={preview}
                    alt="Uploaded piece"
                    className="h-64 w-full rounded-xl object-cover md:w-64"
                  />
                )}

                <div>
                  <p className="text-sm uppercase tracking-widest text-neutral-500">
                    AI Analysis
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {result.item_type}
                  </h2>

                  <div className="mt-6 space-y-3 text-sm">
                    <p>
                      <span className="text-neutral-500">Material:</span>{" "}
                      {result.material}
                    </p>

                    <p>
                      <span className="text-neutral-500">Colors:</span>{" "}
                      {result.colors?.join(", ") || "Unknown"}
                    </p>
                  </div>

                  {result.visible_features?.length > 0 && (
                    <div className="mt-6">
                      <p className="mb-2 text-sm text-neutral-500">
                        Visible features
                      </p>

                      <ul className="list-inside list-disc space-y-1 text-sm text-neutral-300">
                        {result.visible_features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Recommendations */}
            <section>
              <div className="mb-6">
                <p className="text-sm uppercase tracking-widest text-neutral-500">
                  Possibilities
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  What could this become?
                </h2>
              </div>

              {result.recommendations?.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-3">
                  {result.recommendations.map((recommendation, index) => (
                    <article
                      key={index}
                      className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
                    >
                      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                        {index + 1}
                      </div>

                      <h3 className="text-xl font-semibold">
                        {recommendation.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-neutral-400">
                        {recommendation.description}
                      </p>

                      <div className="mt-5 border-t border-neutral-800 pt-4">
                        <p className="text-xs uppercase tracking-wider text-neutral-500">
                          Why it works
                        </p>

                        <p className="mt-2 text-sm text-neutral-300">
                          {recommendation.reason}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center">
                  <h3 className="text-xl font-semibold">
                    No suitable ideas found
                  </h3>

                  <p className="mt-2 text-neutral-400">
                    The AI could not confidently suggest an upcycling idea
                    from this image.
                  </p>
                </div>
              )}
            </section>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={reset}
                className="flex-1 rounded-lg border border-neutral-700 px-6 py-4 font-semibold transition hover:bg-neutral-900"
              >
                Analyze Another Piece
              </button>

              <button
                className="flex-1 rounded-lg bg-white px-6 py-4 font-semibold text-black transition hover:bg-neutral-200"
              >
                Continue With This Idea
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Failed to read image."));
        return;
      }

      // Remove "data:image/...;base64," from the beginning
      const base64 = result.split(",")[1];

      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image."));
    };

    reader.readAsDataURL(file);
  });
}