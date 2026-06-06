"use client";

import { useState } from "react";
import { Flame, Copy, RotateCcw, Sparkles } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [resume, setResume] = useState("");
  const [roast, setRoast] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [fixes, setFixes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoast = async () => {
    if (!resume.trim()) {
      toast.error("Paste your resume first.");
      return;
    }
    if (resume.trim().length < 50) {
      toast.error("Resume too short. Minimum 50 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setRoast("");
    setScore(null);
    setFixes([]);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something broke");
      }

      setRoast(data.roast);
      setScore(data.score);
      setFixes(data.fixes || []);
    } catch (err: any) {
      setError(err.message || "Failed to roast. Try again.");
      toast.error("Roast failed. Your resume broke the AI.");
    } finally {
      setLoading(false);
    }
  };

  const copyRoast = () => {
    navigator.clipboard.writeText(roast);
    toast.success("Copied! Share your roast.");
  };

  const reset = () => {
    setResume("");
    setRoast("");
    setScore(null);
    setFixes([]);
    setError("");
  };

  const getScoreColor = (s: number) => {
    if (s <= 3) return "text-red-500";
    if (s <= 5) return "text-orange-400";
    if (s <= 7) return "text-yellow-400";
    return "text-green-400";
  };

  const getScoreBg = (s: number) => {
    if (s <= 3) return "bg-red-500/10 border-red-500/30";
    if (s <= 5) return "bg-orange-500/10 border-orange-500/30";
    if (s <= 7) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-green-500/10 border-green-500/30";
  };

  const getScoreEmoji = (s: number) => {
    if (s <= 2) return "💀💀💀";
    if (s <= 4) return "💀";
    if (s <= 6) return "😬";
    if (s <= 8) return "😅";
    return "😎";
  };

  const getScoreLabel = (s: number) => {
    if (s <= 2) return "Unhireable";
    if (s <= 4) return "Needs a miracle";
    if (s <= 6) return "Salvageable";
    if (s <= 8) return "Almost decent";
    return "Rare W";
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid #333",
          },
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-sm mb-6">
            <Sparkles size={16} />
            AI that won't lie to protect your feelings
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            Get Your Resume{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              Destroyed
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Paste your resume. AI roasts it brutally. You get a Burn Score and
            fixes. Your friends are too nice. We're not.
          </p>
        </div>

        {/* Input */}
        {!roast && !loading && (
          <div className="max-w-2xl mx-auto">
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume here...&#10;&#10;Example:&#10;Education: B.Tech Computer Science&#10;Experience: Intern at XYZ Corp - did various tasks&#10;Skills: Team player, hardworking, Microsoft Office, quick learner"
              className="w-full h-64 bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-orange-500 transition-colors text-sm"
            />
            <button
              onClick={handleRoast}
              disabled={loading || !resume.trim()}
              className={`w-full mt-4 font-bold py-4 px-8 rounded-2xl text-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${loading || !resume.trim()
                ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              }`}
            >
              <Flame size={24} />
              Roast Me 🔥
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl animate-bounce mb-4">🔥</div>
            <p className="text-xl text-gray-400">Roasting your resume...</p>
            <p className="text-sm text-gray-600 mt-2">This might hurt a little.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-400 text-center">
            <p className="text-lg font-bold mb-1">Oops</p>
            <p>{error}</p>
            <button
              onClick={reset}
              className="mt-3 text-sm underline hover:text-red-300"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {roast && score !== null && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            {/* Score */}
            <div
              className={`rounded-2xl p-8 text-center border ${getScoreBg(score)}`}
            >
              <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                Burn Score
              </p>
              <div className={`text-8xl font-black ${getScoreColor(score)}`}>
                {score}
                <span className="text-2xl text-gray-500">/10</span>
              </div>
              <p className="text-3xl mt-2">{getScoreEmoji(score)}</p>
              <p className={`text-lg font-bold mt-2 ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </p>
            </div>

            {/* Roast */}
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Flame className="text-orange-500" size={24} />
                The Roast
              </h2>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {roast}
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={copyRoast}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors text-sm"
                >
                  <Copy size={16} />
                  Copy Roast
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors text-sm"
                >
                  <RotateCcw size={16} />
                  Roast Another
                </button>
              </div>
            </div>

            {/* Fixes */}
            {fixes.length > 0 && (
              <div className="bg-green-500/5 border border-green-500/30 rounded-2xl p-8">
                <h2 className="text-xl font-bold mb-4 text-green-400">
                  🛠️ How to Fix This
                </h2>
                <ol className="space-y-3">
                  {fixes.map((fix, i) => (
                    <li key={i} className="flex gap-3 text-gray-300">
                      <span className="text-green-400 font-bold min-w-[28px] text-lg">
                        {i + 1}.
                      </span>
                      <span>{fix}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-20 text-gray-600 text-sm space-y-1">
          <p>Built for HackIndia Vibe Coding Hackathon 2026</p>
          <p>Your resume data is never stored • Roast responsibly</p>
        </div>
      </div>
    </main>
  );
}