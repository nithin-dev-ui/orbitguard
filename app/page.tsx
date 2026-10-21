
"use client";

import { useState } from "react";

type Candidate = {
  dv: number;
  nominalDistance: number;
  unsafeRate: number;
};

type Result = {
  baseline: Candidate;
  robust: Candidate;
  candidates: Candidate[];
  robustFeasible: boolean;
  baselineFeasible: boolean;
};

const TRIALS = 1000;
const RISK_TARGET = 0.05;

function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoiseSamples(count: number, sigma: number) {
  const random = seededRandom(20261021);
  const samples: number[] = [];

  while (samples.length < count) {
    const u1 = Math.max(random(), 1e-10);
    const u2 = random();
    const radius = Math.sqrt(-2 * Math.log(u1));
    const angle = 2 * Math.PI * u2;

    samples.push(radius * Math.cos(angle) * sigma);

    if (samples.length < count) {
      samples.push(radius * Math.sin(angle) * sigma);
    }
  }

  return samples;
}

function simulate(
  missDistance: number,
  uncertainty: number,
  safetyLimit: number,
  dvBudget: number,
  horizon: number
): Result {
  const noise = makeNoiseSamples(TRIALS, uncertainty);
  const steps = 20;
  const candidates: Candidate[] = [];

  for (let i = 0; i <= steps; i++) {
    const dv = (dvBudget * i) / steps;
    const nominalDistance = Math.abs(missDistance + dv * horizon);

    let unsafeCount = 0;

    for (const error of noise) {
      const simulatedDistance = Math.abs(
        missDistance + dv * horizon + error
      );

      if (simulatedDistance < safetyLimit) {
        unsafeCount++;
      }
    }

    candidates.push({
      dv,
      nominalDistance,
      unsafeRate: unsafeCount / TRIALS,
    });
  }

  const baselineFeasible = candidates.some(
    (candidate) => candidate.nominalDistance >= safetyLimit
  );

  const baseline =
    candidates.find(
      (candidate) => candidate.nominalDistance >= safetyLimit
    ) ??
    candidates.reduce((best, candidate) =>
      candidate.nominalDistance > best.nominalDistance
        ? candidate
        : best
    );

  const robustCandidates = candidates.filter(
    (candidate) => candidate.unsafeRate <= RISK_TARGET
  );

  const robustFeasible = robustCandidates.length > 0;

  const robust = robustFeasible
    ? robustCandidates.reduce((best, candidate) =>
        candidate.dv < best.dv ? candidate : best
      )
    : candidates.reduce((best, candidate) =>
        candidate.unsafeRate < best.unsafeRate ||
        (candidate.unsafeRate === best.unsafeRate &&
          candidate.dv < best.dv)
          ? candidate
          : best
      );

  return {
    baseline,
    robust,
    candidates,
    robustFeasible,
    baselineFeasible,
  };
}

function percent(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}

export default function Home() {
  const [missDistance, setMissDistance] = useState(40);
  const [uncertainty, setUncertainty] = useState(20);
  const [safetyLimit, setSafetyLimit] = useState(50);
  const [dvBudget, setDvBudget] = useState(0.2);
  const [horizon, setHorizon] = useState(300);
  const [result, setResult] = useState<Result | null>(null);
  const [runCount, setRunCount] = useState(0);

  function runAnalysis() {
    setResult(
      simulate(
        missDistance,
        uncertainty,
        safetyLimit,
        dvBudget,
        horizon
      )
    );
    setRunCount((count) => count + 1);
  }

  const displayedResult =
    result ??
    simulate(missDistance, uncertainty, safetyLimit, dvBudget, horizon);

  const baseline = displayedResult.baseline;
  const robust = displayedResult.robust;

  function Field({
    label,
    value,
    min,
    max,
    step,
    unit,
    onChange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    onChange: (value: number) => void;
  }) {
    return (
      <div>
        <div className="mb-2 flex justify-between gap-3 text-sm">
          <label className="text-slate-300">{label}</label>
          <span className="whitespace-nowrap font-semibold text-cyan-200">
            {value} {unit}
          </span>
        </div>
        <input
          aria-label={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full accent-cyan-300"
        />
        <div className="flex justify-between text-xs text-slate-600">
          <span>{min}</span>
          <span>{max} {unit}</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050914] text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 lg:px-10">
        <div>
          <h1 className="text-xl font-bold tracking-[0.2em]">
            ORBITGUARD
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            UNCERTAINTY-AWARE COLLISION SANDBOX
          </p>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-200">
          EXPERIMENTAL · NEURALFORGE
        </span>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_75%_40%,rgba(8,145,178,0.17),transparent_45%),linear-gradient(120deg,#050914,#0a1425)] px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-cyan-300">
              CONJUNCTION ANALYSIS / RESEARCH MODE
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              Test the decision.
              <span className="block text-cyan-300">
                Understand the risk.
              </span>
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              Compare a nominal-only maneuver choice with an
              uncertainty-aware candidate search using repeatable
              simulated encounter errors.
            </p>
            <button
              onClick={runAnalysis}
              className="mt-7 rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-200"
            >
              Run 1,000 trials →
            </button>
            <p className="mt-4 text-xs text-slate-500">
              Seed: 20261021 · Simplified 1D model · Not flight-ready
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-[#071322]/80 p-6">
            <svg
              viewBox="0 0 500 240"
              className="w-full"
              role="img"
              aria-label="Conceptual satellite and debris trajectories around Earth"
            >
              <defs>
                <radialGradient id="earth">
                  <stop offset="0%" stopColor="#155e75" />
                  <stop offset="100%" stopColor="#082032" />
                </radialGradient>
              </defs>
              <circle cx="250" cy="120" r="75" fill="url(#earth)" />
              <circle cx="250" cy="120" r="84" fill="none" stroke="#67e8f9" strokeOpacity=".25" />
              <ellipse cx="250" cy="120" rx="215" ry="75" fill="none" stroke="#38bdf8" strokeDasharray="5 8" strokeOpacity=".5" transform="rotate(-20 250 120)" />
              <path d="M20 180 Q220 5 460 70" fill="none" stroke="#67e8f9" strokeWidth="2.5" />
              <path d="M35 35 Q250 235 470 195" fill="none" stroke="#fb7185" strokeWidth="2" strokeDasharray="6 7" />
              <circle cx="322" cy="77" r="7" fill="#a5f3fc" />
              <circle cx="322" cy="77" r="15" fill="none" stroke="#67e8f9" strokeOpacity=".6" />
              <path d="M313 74 l-15 -8 v20 z M331 74 l15 -8 v20 z" fill="#67e8f9" />
              <path d="M35 35 l9 -4 -3 10 -7 3 z" fill="#fda4af" />
              <text x="250" y="118" fill="#a5f3fc" fontSize="12" textAnchor="middle">EARTH</text>
              <text x="250" y="135" fill="#a5f3fc" fontSize="8" textAnchor="middle">ILLUSTRATION</text>
              <text x="350" y="62" fill="#a5f3fc" fontSize="11">SATELLITE</text>
              <text x="55" y="25" fill="#fda4af" fontSize="11">DEBRIS</text>
            </svg>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
              <span>● <span className="text-cyan-200">Satellite path</span></span>
              <span>● <span className="text-rose-300">Debris path</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[330px_1fr] lg:px-10">
        <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
            01 / SCENARIO
          </p>
          <h3 className="mt-2 text-xl font-semibold">Simulation inputs</h3>
          <p className="mb-6 mt-2 text-sm leading-6 text-slate-400">
            Adjust the scenario, then run the analysis to refresh the results.
          </p>

          <div className="space-y-6">
            <Field label="Nominal miss distance" value={missDistance} min={10} max={200} step={5} unit="m" onChange={setMissDistance} />
            <Field label="Position-error scale (σ)" value={uncertainty} min={0} max={60} step={1} unit="m" onChange={setUncertainty} />
            <Field label="Safety threshold" value={safetyLimit} min={10} max={100} step={5} unit="m" onChange={setSafetyLimit} />
            <Field label="Δv budget" value={dvBudget} min={0.01} max={0.5} step={0.01} unit="m/s" onChange={setDvBudget} />
            <Field label="Response horizon" value={horizon} min={30} max={600} step={30} unit="s" onChange={setHorizon} />
          </div>

          <button
            onClick={runAnalysis}
            className="mt-8 w-full rounded-lg bg-cyan-300 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-200"
          >
            {runCount ? "Re-run simulation ↻" : "Analyze encounter →"}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">
            1,000 trials · 21 candidate Δv values
          </p>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Metric label="Baseline unsafe-trial rate" value={percent(baseline.unsafeRate)} note={`Nominal choice · Δv ${baseline.dv.toFixed(3)} m/s`} />
            <Metric label="OrbitGuard unsafe-trial rate" value={percent(robust.unsafeRate)} note={`Selected candidate · Δv ${robust.dv.toFixed(3)} m/s`} />
            <Metric label="Robustness target" value="≤ 5.0%" note="User-independent illustrative constraint" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
              02 / STRATEGY COMPARISON
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              Nominal vs uncertainty-aware
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Both strategies use the same seeded set of simulated errors.
              The baseline checks nominal separation; OrbitGuard searches
              for the least-cost candidate meeting the trial-rate target.
            </p>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Metric</th>
                    <th className="pb-3 pr-4 font-medium">Baseline</th>
                    <th className="pb-3 font-medium">OrbitGuard</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-4 pr-4 text-slate-400">Selected Δv</td>
                    <td className="py-4 pr-4">{baseline.dv.toFixed(3)} m/s</td>
                    <td className="py-4">{robust.dv.toFixed(3)} m/s</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 pr-4 text-slate-400">Nominal separation</td>
                    <td className="py-4 pr-4">{baseline.nominalDistance.toFixed(1)} m</td>
                    <td className="py-4">{robust.nominalDistance.toFixed(1)} m</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 pr-4 text-slate-400">Unsafe-trial rate</td>
                    <td className="py-4 pr-4">{percent(baseline.unsafeRate)}</td>
                    <td className="py-4">{percent(robust.unsafeRate)}</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-slate-400">Constraint status</td>
                    <td className="py-4 pr-4">
                      {displayedResult.baselineFeasible ? "Nominal threshold met" : "Nominal threshold unmet"}
                    </td>
                    <td className="py-4">
                      {displayedResult.robustFeasible ? (
                        <span className="text-emerald-300">Target met</span>
                      ) : (
                        <span className="text-rose-300">Target not met</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={`mt-6 rounded-xl border p-5 ${displayedResult.robustFeasible ? "border-emerald-300/20 bg-emerald-300/5" : "border-rose-300/20 bg-rose-300/5"}`}>
              <h4 className="font-semibold">
                {displayedResult.robustFeasible
                  ? "A candidate meets the simulated target"
                  : "No candidate meets the simulated target"}
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {displayedResult.robustFeasible
                  ? `The selected candidate has an observed unsafe-trial rate of ${percent(robust.unsafeRate)} in ${TRIALS.toLocaleString()} trials. This does not establish real-world safety.`
                  : `The best observed candidate has an unsafe-trial rate of ${percent(robust.unsafeRate)}. The 5% target was not achieved within the configured Δv budget; the interface does not claim the maneuver is safe.`}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
              03 / CANDIDATE SEARCH
            </p>
            <h3 className="mt-2 text-xl font-semibold">Maneuver candidates</h3>
            <p className="mb-5 mt-2 text-sm text-slate-400">
              All 21 candidates, ranked by increasing Δv. Trial rates are empirical outputs of this fixed simulation seed.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[440px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4">Δv (m/s)</th>
                    <th className="pb-3 pr-4">Nominal distance</th>
                    <th className="pb-3 pr-4">Unsafe trials</th>
                    <th className="pb-3">Selection</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedResult.candidates.map((candidate, index) => (
                    <tr key={index} className="border-b border-white/5 last:border-0">
                      <td className="py-3 pr-4">{candidate.dv.toFixed(3)}</td>
                      <td className="py-3 pr-4">{candidate.nominalDistance.toFixed(1)} m</td>
                      <td className="py-3 pr-4">{percent(candidate.unsafeRate)}</td>
                      <td className="py-3">
                        {Math.abs(candidate.dv - baseline.dv) < 1e-9 && (
                          <span className="mr-2 text-xs text-slate-300">BASE</span>
                        )}
                        {Math.abs(candidate.dv - robust.dv) < 1e-9 && (
                          <span className="text-xs font-semibold text-cyan-300">ORBITGUARD</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100/80">
            <strong className="text-amber-200">Model limitations:</strong>{" "}
            This prototype uses a one-dimensional cross-track approximation
            where Δv changes separation by Δv × response horizon. Position
            errors are generated from a seeded Gaussian distribution. It
            omits orbital dynamics, maneuver execution errors, correlated
            uncertainty, real conjunction data, and validated collision
            probability calculations.
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs leading-6 text-slate-500">
        ORBITGUARD · NEURALFORGE · CODEX MIN-360
        <br />
        Educational simulation only. Not for operational collision avoidance.
      </footer>
    </main>
  );
}
