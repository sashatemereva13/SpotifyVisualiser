# 🎧 Spotify Visualiser

Interactive 3D Music Visualisation using Audio Analysis + ThreeJS

Upload a song → Extract tempo & frequency → Render visual effects.  
A team project built for learning, collaboration, and portfolio quality.

---

## 🧠 Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Frontend         | React + ThreeJS / React-Three-Fiber |
| Backend          | Node.js + Express                   |
| Microservice     | Python or Java                      |
| Audio Processing | Python + librosa                    |
| Database         | SQLite or PostgreSQL                |
| Version Control  | Git + GitHub                        |

---

## 👥 Team Responsibility Matrix

| Name       | Role                     | Folder                         | Branch                       |
| ---------- | ------------------------ | ------------------------------ | ---------------------------- |
| **Sasha**  | 3D Visualiser & Frontend | `frontend/src/visualizer`      | `feature/frontend-sasha`     |
| **Irina**  | Backend API              | `backend/`                     | `feature/backend-irina`      |
| **Kylian** | Database                 | `database/`                    | `feature/db-kylian`          |
| **Willy**  | Microservice Developer   | `analysis_service/server`      | `feature/microservice-willy` |
| **Paolo**  | Audio Analysis           | `analysis_service/analysis.py` | `feature/analysis-paolo`     |

Everyone has **Level 1 (required)** + optional **Level 2 & 3 upgrades** depending on motivation and time.

---

## 🔥 Difficulty Levels

### 🟣 Sasha — Visualiser (Frontend)

**L1 (MVP):** Basic bars reacting to low/mid/high freq  
**L2:** Particle/wave visuals, easing, camera motion  
**L3:** Shader FX — bloom, instancing, beat flashes

---

### 🔵 Irina — Backend API

**L1 (MVP):** `/upload`, `/tracks`, `/analysis/:id`  
**L2:** Error handling, logging, file validation  
**L3:** Pagination, cleanup jobs, advanced endpoints

---

### 🟢 Kylian — Database

**L1 (MVP):** schema.sql + CRUD helpers  
**L2:** JSON storage, FK restrictions, timestamps  
**L3:** Indexing, caching, auto cleanup

---

### 🟡 Willy — Microservice

**L1 (MVP):** Run analysis.py and return JSON  
**L2:** Error handling, logs, response codes  
**L3:** Async execution, retry logic

---

### 🟠 Paolo — Audio Analysis (Python)

**L1 (MVP):** Tempo + low/mid/high freq → JSON  
**L2:** Beat detection + RMS energy curve  
**L3:** Spectral features (centroid/rolloff/ZCR)

---

## 📁 Project Structure

```
spotify-visualizer/
│
├── frontend/ # Sasha
│ ├── src/
│ │ ├── visualizer/ # 3D rendering
│ │ ├── components/ # UI elements
│ │ ├── pages/ # UI routing
│ │ └── api/ # backend requests
│
├── backend/ # Irina
│ ├── routes/ controllers/ db/ uploads/ analysis/
│ └── server.js
│
├── database/ # Kylian
│ ├── schema.sql
│ ├── db.js
│ └── migrations/
│
├── analysis_service/ # Paolo + Willy
│ ├── analysis.py # audio processing
│ └── server/ # microservice
│ └── app.py / Application.java
│
└── docs/
```

---

## 🚀 Getting Started

### Clone repo

``` bash
git clone https://github.com/YOUR_USERNAME/spotify-visualizer.git
cd spotify-visualizer
```
---

## 🚀 Running the Project

### 🟣 Frontend

```bash
cd frontend
npm install
npm run dev
```

### 🔵 Backend

```bash
cd backend
npm install
node server.js
```

### 🟢 Analysis Service

```bash
cd analysis_service
pip install -r requirements.txt
python server/app.py
```
---

## 🧪 How the App Works (MVP Flow)

1. Upload MP3
2. Backend stores file
3. Backend calls microservice
4. Microservice runs `analysis.py`
5. Database stores result
6. Visualiser renders 3D scene

---

## 🌱 Future Ideas

- Multiple visualisation modes
- Genre or mood recognition
- Drag & drop player
- Dark/light skins
- WebSocket live streaming

---

## 🔥 Contribution Workflow

- **No direct pushes to `main`**
- Work only on **feature branches**
- Open Pull Request → Review → Merge
- One task = one commit group

**Commit examples:**

```bash
feat(visualizer): add bass-reactive particles
fix(api): handle missing analysis data
docs(readme): add setup instructions
````
