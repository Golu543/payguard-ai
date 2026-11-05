# 🛡️ PayGuard AI
> **Autonomous Agentic Escrow & Milestone Verification Platform powered by PayPal & AI**

PayGuard AI is an autonomous, agent-driven escrow system designed to bridge the trust deficit in remote freelancing and software development milestones. It combines conversational intent handling, native PayPal escrow payments, automated codebase auditing, and live execution logging into a unified enterprise command center.

---

## ⚡ Key Highlights & Architecture

- **Voice & NLP Smart Contract Drafting:** Clients initiate contracts naturally via typed prompts or browser speech recognition (e.g., *"Hire developer for $200"*).
- **PayPal Escrow Vault:** Pre-authorizes and locks funds securely using the `@paypal/react-paypal-js` SDK with an integrated instant sandbox fallback flow for uninterrupted judging reviews.
- **Autonomous Code Auditor:** Evaluates incoming milestone submissions against scope requirements, running AST syntax verification, mock security vulnerability checks, and dynamic match scoring.
- **Dispute & Happy Path Automation:** 
  - **Happy Path:** Code matching >90% criteria triggers instant autonomous payout execution to the developer's wallet.
  - **Dispute Edge Case:** Code containing syntax flaws or missing security validation is flagged (<50% score), holding escrow securely while notifying the parties.
- **Chain-of-Thought (CoT) Terminal:** Real-time hacker-style command terminal printing step-by-step agentic execution reasoning logs.
- **Enterprise Command Center:** Dark-mode AG Grid ledger tracking contract lifecycles alongside real-time platform transaction metrics.
- **Legal Artifact Export:** Instant one-click plaintext/receipt contract generation for offline escrow auditing.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Data Grid:** AG Grid Community (Dark Quartz Engine)
- **Payments:** PayPal JavaScript SDK (`@paypal/react-paypal-js`)
- **Agent Intelligence:** Web Speech API, Native Intent Regex Engine, Async Chain-of-Thought State Machine

---

## 🚀 Getting Started

### 1. Installation & Setup

Clone the repository:
```bash
git clone [https://github.com/Golu543/payguard-ai.git](https://github.com/Golu543/payguard-ai.git)
cd payguard-ai
npm install
npm run dev
