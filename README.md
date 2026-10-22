# ORBITGUARD
### Uncertainty-Aware Satellite Collision Avoidance Sandbox

**Test the decision. Understand the risk. Compare the maneuver.**

OrbitGuard is an experimental, browser-based simulation sandbox that explores how uncertainty in satellite conjunction scenarios can affect collision-avoidance maneuver decisions.

It compares a baseline maneuver-selection approach with an uncertainty-aware candidate search using repeatable, seeded simulation trials.

> **Research prototype:** OrbitGuard is an educational demonstration built around a simplified model. It is not flight-ready software and does not calculate validated real-world collision probabilities.

## 🚀 Project Overview

Satellite conjunction assessments involve uncertainty in estimated positions and future trajectories. A maneuver that appears safe under nominal estimates may produce different outcomes when position uncertainty is considered.

OrbitGuard provides an interactive environment to explore this challenge, compare candidate maneuvers, and observe how uncertainty affects simulated safety outcomes.

## ✨ Key Features

- **Interactive scenario controls:** Adjust nominal miss distance, position uncertainty, safety threshold, maneuver budget, and response horizon.
- **Candidate maneuver search:** Evaluate 21 candidate maneuver values within the configured budget.
- **Repeatable simulation trials:** Run 1,000 simulated trials using seeded Gaussian position-error samples.
- **Baseline comparison:** Compare a nominal-threshold-based baseline with an uncertainty-aware candidate-selection approach.
- **Risk-oriented evaluation:** Measure the fraction of simulated trials that fall below the configured safety threshold.
- **Constraint awareness:** Identify whether a candidate meets the configured simulated unsafe-trial target.
- **Transparent results:** Inspect candidate maneuver values, nominal separations, simulated unsafe-trial rates, and selections.
- **Browser-based dashboard:** Explore scenarios without installing specialized aerospace software.

## ⚙️ How It Works

1. **Configure a scenario:** Set the nominal miss distance, uncertainty scale, safety threshold, maneuver budget, and response horizon.
2. **Generate candidates:** Create 21 candidate maneuver values across the configured maneuver budget.
3. **Simulate uncertainty:** Apply seeded Gaussian position-error samples to evaluate simulated separations.
4. **Measure outcomes:** Count trials in which the simulated separation falls below the safety threshold.
5. **Compare approaches:** Evaluate the baseline selection against the uncertainty-aware candidate search.
6. **Inspect the result:** Review nominal separation, simulated unsafe-trial rate, and whether the configured target is met.

### Candidate Selection

The experimental candidate search prefers the lowest-magnitude candidate that meets the configured simulated unsafe-trial target. If no candidate meets the target, it selects the candidate with the lowest observed unsafe-trial rate, using maneuver magnitude to break ties.

The selected result is based on the current simplified simulation, not on a validated orbital dynamics or operational collision-risk model.

## 🧪 Simulation Assumptions and Limitations

OrbitGuard currently uses a simplified one-dimensional separation model in which the maneuver changes nominal separation according to:

`nominal separation = |miss distance + Δv × response horizon|`

Position errors are generated from a seeded Gaussian distribution, and the simulated unsafe-trial rate is the fraction of trials whose separation falls below the configured safety threshold.

The current prototype does **not** include:

- Full orbital dynamics or high-fidelity orbit propagation
- Real satellite conjunction or tracking data
- Maneuver execution errors
- Correlated position uncertainty
- Validated operational collision-probability calculations
- Flight-qualified guidance, navigation, or control systems

A simulated unsafe-trial rate should not be interpreted as a real-world collision probability.

## 🛠️ Technology Stack

- **Next.js** — Application framework
- **React** — Interactive user interface
- **TypeScript** — Application logic and type safety
- **Tailwind CSS** — Dashboard styling
- **JavaScript simulation logic** — Candidate generation, seeded uncertainty sampling, and evaluation

## 💻 Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/nithin-dev-ui/orbitguard.git
```

Navigate to the project directory:

```bash
cd orbitguard
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

To verify the production build:

```bash
npm run build
```

## 🎯 Project Goals

OrbitGuard aims to make uncertainty-aware decision comparison easier to understand through an interactive, transparent simulation.

The prototype demonstrates how candidate evaluation, repeatable experiments, safety constraints, and maneuver magnitude can be explored together in a single dashboard.

## 🔭 Future Improvements

Potential future development includes:

- More realistic orbital dynamics and relative-motion models
- Publicly available conjunction datasets for research and testing
- Additional uncertainty models and maneuver constraints
- Expanded scenario comparisons and experiment summaries
- Automated tests for simulation behavior and edge cases
- Clearer visualizations of uncertainty and simulated outcomes

These are proposed improvements, not features claimed to be implemented.

## 👥 Team

**Team NeuralForge**

Developed for **CodeX MIN-360** at SJC Institute of Technology.

## 📌 Disclaimer

OrbitGuard is an experimental educational and research prototype. Its simplified assumptions and simulation outputs are intended for exploration and demonstration only. They must not be used to make operational satellite maneuver decisions or to assess actual collision risk.

---

**ORBITGUARD — Better decisions begin with testing uncertainty.**
