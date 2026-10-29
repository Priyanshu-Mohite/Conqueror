# CampusVault 🏛️⚡
> **"Unlock Underused Equipment and Spaces"** — Production-ready MERN platform for campus-wide shared resources, makerspaces, specialized labs, and high-value gear.

---

## 🌟 Live Status
- **Frontend App:** [http://localhost:5173/](http://localhost:5173/)
- **Backend API Health:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Bootstrap Endpoint:** [http://localhost:5000/api/bootstrap](http://localhost:5000/api/bootstrap)
- **Official Submission Report:** [PROJECT_SUBMISSION_REPORT.md](file:///c:/Users/Hp/Desktop/Conqueror%202.0/PROJECT_SUBMISSION_REPORT.md)

---

## 🚀 Quick Startup Commands

```bash
# Run both servers concurrently:
npm run dev

# Or separately:
# Terminal 1: Backend
npm run start:server

# Terminal 2: Frontend
npm run start:client

# Run End-to-End Automated Verification:
npm run test:e2e
```

---

## 🎯 2-Minute Judge Testing Guide

1. Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.
2. Notice the sticky **JudgeTopBar** with 4 pre-seeded personas:
   - **Aarav** (Student, 2h used, Score: 90)
   - **Priya** (Heavy User, 7h used, Score: 15 — Anti-monopolisation active)
   - **Dr. Mehta** (Lab Manager)
   - **Ananya** (Admin)
3. **Step 2 (AI Discovery):** In **Tab 1 (Explore)**, click a sample chip like *"Fabricate carbon-fiber drone frame..."* to see AI-ranked equipment and the mandatory Rule 12 badge.
4. **Step 5 & 6 (Manager Decision):** Switch to **Tab 3 (Manager Queue)** to see competing requests on the Epilog Laser Cutter. Click **Approve** on Aarav; notice Priya is auto-waitlisted with explainable reasons.
5. **Step 7 (Check-In):** Switch to **Tab 2 (My Bookings)**. Click **Check In (Step 7)** on the Prusa SLS 3D Printer using PIN `4829`.
6. **Step 8 & 9 (Return & Damage Diff):** On the Tektronix Oscilloscope, click **Return & Inspect (Step 8)** and select **Report Damage**. Notice it places the resource on `MAINTENANCE_HOLD` and generates an AI condition diff summary!
7. **Step 9 (Incident Resolution):** In **Tab 4 (Incident Center)**, click **Clear Hold & Restore Resource**.
8. **Step 10 (Audit Ledger):** In **Tab 5 (Audit Trail)**, view every single action recorded in the tamper-evident ledger.
9. **Reset Demo:** Click **Reset Demo** in the top bar anytime to restore clean initial seed data!
