"use client";

import { useEffect, useMemo, useState } from "react";

type ThemeVars = {
  primary: string;
  secondary: string;
  bgStart: string;
  bgMid: string;
  bgEnd: string;
  paperOpacity: number;
  shelfOpacity: number;
  shelfAccentOpacity: number;
};

const STORAGE_KEY = "library-theme-v1";

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export default function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const [vars, setVars] = useState<ThemeVars>({
    primary: "#f59e0b",
    secondary: "#ea580c",
    bgStart: "#fffbeb",
    bgMid: "#fff7ed",
    bgEnd: "#fff1f2",
    paperOpacity: 0.35,
    shelfOpacity: 0.15,
    shelfAccentOpacity: 0.08,
  });

  const applyVars = (v: ThemeVars) => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", v.primary);
    root.style.setProperty("--color-secondary", v.secondary);
    root.style.setProperty("--color-background-gradient-start", v.bgStart);
    root.style.setProperty("--color-background-gradient-mid", v.bgMid);
    root.style.setProperty("--color-background-gradient-end", v.bgEnd);
    root.style.setProperty("--library-paper-opacity", String(clamp01(v.paperOpacity)));
    root.style.setProperty("--library-shelf-opacity", String(clamp01(v.shelfOpacity)));
    root.style.setProperty("--library-shelf-accent-opacity", String(clamp01(v.shelfAccentOpacity)));
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ThemeVars;
        setVars(parsed);
        applyVars(parsed);
      } else {
        applyVars(vars);
      }
    } catch {
      applyVars(vars);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    applyVars(vars);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vars));
    } catch {}
  }, [vars]);

  const Panel = useMemo(() => {
    if (!open) return null;
    return (
      <div className="fixed bottom-20 right-4 z-50 w-[320px] bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-amber-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-gray-800">🎨 테마 커스터마이저</div>
          <button
            onClick={() => setOpen(false)}
            className="px-2 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100"
          >
            닫기
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Primary Color</label>
            <input
              type="color"
              value={vars.primary}
              onChange={(e) => setVars({ ...vars, primary: e.target.value })}
              className="w-full h-10 cursor-pointer rounded-md border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Secondary Color</label>
            <input
              type="color"
              value={vars.secondary}
              onChange={(e) => setVars({ ...vars, secondary: e.target.value })}
              className="w-full h-10 cursor-pointer rounded-md border border-gray-200"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">BG Start</label>
              <input
                type="color"
                value={vars.bgStart}
                onChange={(e) => setVars({ ...vars, bgStart: e.target.value })}
                className="w-full h-10 cursor-pointer rounded-md border border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">BG Mid</label>
              <input
                type="color"
                value={vars.bgMid}
                onChange={(e) => setVars({ ...vars, bgMid: e.target.value })}
                className="w-full h-10 cursor-pointer rounded-md border border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">BG End</label>
              <input
                type="color"
                value={vars.bgEnd}
                onChange={(e) => setVars({ ...vars, bgEnd: e.target.value })}
                className="w-full h-10 cursor-pointer rounded-md border border-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">종이 질감 강도</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={vars.paperOpacity}
              onChange={(e) => setVars({ ...vars, paperOpacity: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">책장(우드) 강도</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={vars.shelfOpacity}
              onChange={(e) => setVars({ ...vars, shelfOpacity: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">책장 강조선 강도</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={vars.shelfAccentOpacity}
              onChange={(e) => setVars({ ...vars, shelfAccentOpacity: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                const defaults: ThemeVars = {
                  primary: "#f59e0b",
                  secondary: "#ea580c",
                  bgStart: "#fffbeb",
                  bgMid: "#fff7ed",
                  bgEnd: "#fff1f2",
                  paperOpacity: 0.35,
                  shelfOpacity: 0.15,
                  shelfAccentOpacity: 0.08,
                };
                setVars(defaults);
              }}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              초기화
            </button>
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                window.location.reload();
              }}
              className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium text-center"
            >
              새로고침
            </a>
          </div>
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vars]);

  return (
    <>
      {Panel}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-full shadow-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
        title="테마 커스터마이즈"
      >
        🎨 테마
      </button>
    </>
  );
}


