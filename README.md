# India Trend Radar

**India Trend Radar** is an end-to-end trend intelligence platform that collects real-time data from multiple Indian digital sources (Google Trends, YouTube, and News), processes it through an NLP and machine learning pipeline, and surfaces the results through an interactive web dashboard, REST API, and automated Telegram reporting.

The system identifies what is trending across India, forecasts how trends will evolve, flags unusual or anomalous spikes in activity, scores each trend for overall significance, and classifies which topics are likely to go viral — all fully automated end-to-end.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Team](#team)
4. [Project Phases](#project-phases)
5. [Folder Structure](#folder-structure)
6. [Tech Stack](#tech-stack)
7. [Data Pipeline](#data-pipeline)
8. [Setup & Installation](#setup--installation)
9. [Automation](#automation)
10. [Contributing](#contributing)

---

## Project Overview

India Trend Radar continuously monitors what people across India are talking about, watching, and searching for — then turns that raw signal into structured, actionable intelligence.

**Core capabilities:**
- **Multi-source data collection**: Google Trends, YouTube trending videos, and news headlines
- **NLP-based topic extraction & unification**: named entity recognition, topic modeling, and keyword extraction unified into a single topic taxonomy across sources
- **Forecasting**: predicts how a trend's popularity will evolve over time
- **Anomaly detection**: flags sudden, statistically unusual spikes in trend activity
- **Virality prediction**: classifies whether a topic is likely to go viral
- **India Trend Score**: a single composite score fusing all signals to rank overall trend importance
- **Live dashboard**: React-based frontend with charts, filters, and model evaluation views
- **Automated reporting**: a Telegram bot delivering daily trend updates and weekly PDF reports

---

## Architecture

```
                ┌─────────────────────────────────────────┐
                │              DATA SOURCES                │
                │      Google Trends │ YouTube │ News       │
                └───────────────────────┬───────────────────┘
                                         │
                                 (Phase 1 - Collection)
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │   Raw Data Storage    │
                              │   (CSV / SQLite)       │
                              └──────────┬───────────┘
                                         │
                                (Phase 1 - Cleaning)
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │  Cleaned & Merged Data │
                              │      (PostgreSQL)      │
                              └──────────┬───────────┘
                                         │
                             (Phase 2 - NLP & Feature Engg)
                                         │
                                         ▼
                              ┌─────────────────────────────┐
                              │  master_trend_features.csv    │
                              │  (unified topics + features)  │
                              └──────────┬───────────────────┘
                                         │
                                (Phase 3 - ML Models)
                                         │
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼               ▼
   Prophet         XGBoost        Isolation Forest   Signal Fusion   Model
   Forecasting     Virality       + Z-Score           (India Trend   Evaluation
                   Classifier     Anomaly Detection    Score)
        │               │               │               │               │
        └───────────────┴───────────────┴───────────────┴───────────────┘
                                         │
                                (Phase 4 - Deployment)
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
              FastAPI Backend    React Dashboard      Telegram Bot +
              (REST APIs)        (Live charts/tables)  Weekly PDF Reports
```

---

## Team

| Member | Role Across Phases |
|---|---|
| **Ankita** (Team Lead) | Google Trends collection, GitHub coordination, spaCy NER, final review & testing |
| **Disha** | YouTube data collection, Unified Topic IDs, Isolation Forest + Z-Score Anomaly Detection, Documentation |
| **Atharva** | Trend Feature Engineering, India Trend Score (Signal Fusion), Backend Data Integration |
| **Trupti** | News collection |
| **Shubham** | Data Cleaning (Trends & YouTube), PostgreSQL Migration, Weekly Model Retraining, FastAPI Backend Development |
| **Khushi** | Data Cleaning (News), BERTopic modeling, Prophet Forecasting |
| **Pratik** | Data Management (SQLite integration), Testing & Validation, React Dashboard & API Integration |
| **Anushka** | KeyBERT extraction, XGBoost Virality Classifier, Telegram Bot & Weekly PDF Report |
| **Rohan** | YAKE keyword extraction, Model Evaluation & Validation, Model Evaluation Dashboard |

---

## Project Phases

### Phase 1 — Data Collection & Cleaning

| Member | Task | Details |
|---|---|---|
| Ankita | Google Trends Collection + Team Lead | Collect Google Trends data, manage team, documentation, GitHub coordination |
| Disha | YouTube Data Collection | YouTube Data API v3, trending videos |
| Trupti | News Collection | NewsAPI + RSS + Inshorts/Dailyhunt |
| Shubham | Data Cleaning 1 | Clean Google Trends & YouTube data |
| Khushi | Data Cleaning 2 | Clean News data |
| Pratik | Data Management | SQLite + integration, merging cleaned data |

### Phase 2 — NLP & Feature Engineering

| Member | Task | Required Skills | Input |
|---|---|---|---|
| Ankita | spaCy NER + GitHub + Integration + PR Review | Python, Pandas, spaCy, Git, GitHub | News |
| Khushi | BERTopic | Python, BERTopic, Sentence Transformers, NLP | News |
| Anushka | KeyBERT | Python, KeyBERT, Pandas | News Headlines |
| Rohan | YAKE | Python, YAKE, Pandas | News Headlines |
| Atharva | Trend Feature Engineering | Python, Pandas, NumPy, Statistics | Google Trends + YouTube + News |
| Shubham | PostgreSQL Migration | SQL, PostgreSQL, SQLAlchemy/psycopg2 | Processed CSVs |
| Disha | Unified Topic IDs | Python, Pandas, RapidFuzz (string matching) | Google Trends + YouTube + News |
| Pratik | Testing & Validation | Python, Pandas, Debugging | All outputs |

### Phase 3 — ML Modeling

| Member | Task | Working File | Input | Output |
|---|---|---|---|---|
| Khushi | Prophet Forecasting | `scripts/Phase_3/prophet_model.py` | `master_trend_features.csv` | `prophet_predictions.csv`, `models/prophet_model.pkl` |
| Anushka | XGBoost Virality Classifier | `scripts/Phase_3/xgboost_classifier.py` | `master_trend_features.csv` | `virality_predictions.csv`, `models/xgboost_model.pkl` |
| Disha | Isolation Forest + Z-Score Anomaly Detection | `scripts/Phase_3/anomaly_detection.py` | `master_trend_features.csv` | `anomaly_detection.csv` |
| Atharva | India Trend Score (Signal Fusion) | `scripts/Phase_3/trend_score.py` | features + all Phase 3 prediction CSVs | `india_trend_score.csv` |
| Shubham | Weekly Model Retraining | `scripts/Phase_3/retraining.py` | features + existing `.pkl` models | Updated `.pkl` models |
| Rohan | Model Evaluation & Validation | `scripts/Phase_3/evaluation.py` | All prediction outputs | `model_metrics.csv` |

**Model task details:**
- **Prophet Forecasting**: time-series model predicting future trend values from historical feature data.
- **XGBoost Virality Classifier**: predicts whether a topic is likely to go viral.
- **Isolation Forest + Z-Score Anomaly Detection**: detects unusual spikes or abnormal trend behavior using an unsupervised isolation forest model combined with statistical Z-score checks.
- **India Trend Score (Signal Fusion)**: combines all model outputs into a single ranked score representing a trend's overall popularity and importance.
- **Weekly Model Retraining**: reloads and retrains the Prophet and XGBoost models on new data to keep predictions current.
- **Model Evaluation & Validation**: evaluates all models using standard metrics (accuracy, precision, recall, F1, confusion matrix, ROC curve) and produces a final evaluation report.

### Phase 4 — Deployment & Delivery

| Order | Member | Task | Working Module | Dependency |
|---|---|---|---|---|
| 1 | Shubham | FastAPI Backend Development | `backend/main.py`, `routes/`, `api/` | Phase 3 CSV outputs |
| 2 | Atharva | Backend Data Integration | `services/`, `utils/` | Shubham's APIs + prediction CSVs |
| 3 | Pratik | React Dashboard & API Integration | `frontend/src/`, `components/`, `pages/` | Atharva's APIs |
| 4 | Rohan | Model Evaluation Dashboard | `frontend/src/pages/ModelEvaluation` | Evaluation API (`model_metrics.csv`) |
| 5 | Anushka | Telegram Bot & Weekly PDF Report | `telegram_bot.py`, `weekly_report.py`, `scheduler.py` | Backend APIs |
| 6 | **Disha** | **Documentation** | `README.md`, `docs/`, PPT | Completed project |
| 7 | Ankita (Team Lead) | Review & Final Testing | Entire project | All completed modules |

---

## Folder Structure

```
India-Trend-Radar/
├── .github/workflows/     # GitHub Actions automation (scheduler.yml)
├── config/                 # Configuration files
├── data/                   # Raw and processed data, features, predictions
│   └── features/
│       └── master_trend_features.csv
│   └── predictions/
│       ├── prophet_predictions.csv
│       ├── virality_predictions.csv
│       ├── anomaly_detection.csv
│       └── india_trend_score.csv
├── database/                # Database files / migration scripts
├── docs/                    # Documentation, API docs, deployment guide
├── frontend/                 # React dashboard (Phase 4)
├── logs/                     # Pipeline run logs
├── models/                   # Trained model files (.pkl)
├── notebooks/                 # Jupyter notebooks (EDA, prototyping)
├── scripts/
│   └── Phase_3/               # Model training/scoring scripts
├── utils/                     # Shared utility functions
├── .gitignore
├── README.md
└── requirements.txt
```

---

## Tech Stack

**Data Collection**
- Google Trends: `pytrends`
- YouTube: `google-api-python-client`, `google-auth`
- News: `newsapi-python`, `gnews`, `feedparser`, `beautifulsoup4`

**NLP & Feature Engineering**
- `spacy` — Named Entity Recognition
- `bertopic`, `sentence-transformers`, `umap-learn`, `hdbscan` — topic modeling
- `keybert` — keyword extraction
- `yake` — keyword extraction
- `rapidfuzz` — fuzzy string matching for topic unification
- `textblob`, `langdetect` — text processing

**Machine Learning**
- `scikit-learn` — Isolation Forest, evaluation metrics
- `prophet` — time-series forecasting
- `xgboost` — virality classification

**Backend**
- `FastAPI` — REST API layer
- `pandas` — data processing and integration

**Database**
- PostgreSQL (migrated from SQLite)
- SQLAlchemy / psycopg2

**Frontend**
- React.js, JavaScript
- Axios (API calls)
- ECharts (visualizations)

**Automation & Reporting**
- `APScheduler` — task scheduling
- GitHub Actions — daily/weekly automated pipeline runs
- Telegram Bot API — daily trend updates
- PDF generation — weekly reports

---

## Data Pipeline

1. **Collection** — Google Trends, YouTube, and News data collected on a schedule and stored as raw CSVs.
2. **Cleaning** — Source-specific cleaning scripts standardize formats, dates, and remove noise.
3. **Integration** — Cleaned data merged and migrated into PostgreSQL.
4. **NLP Processing** — Entity extraction (spaCy), topic modeling (BERTopic), and keyword extraction (KeyBERT, YAKE) applied to text content.
5. **Topic Unification** — Fuzzy matching (RapidFuzz) links related topics across all four sources into a single topic ID.
6. **Feature Engineering** — Combined dataset exported as `master_trend_features.csv`.
7. **Modeling** — Prophet, XGBoost, and Isolation Forest models run on the feature set to produce forecasts, virality predictions, and anomaly flags.
8. **Signal Fusion** — All model outputs combined into a single ranked `india_trend_score.csv`.
9. **Evaluation** — Model outputs assessed and summarized in `model_metrics.csv`.
10. **Serving** — FastAPI exposes all outputs as REST endpoints, consumed by the React dashboard and Telegram bot.

---

## Setup & Installation

```bash
# Clone the repository
git clone https://github.com/ank17a-5/India-Trend-Radar.git
cd India-Trend-Radar

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (API keys)
# YOUTUBE_API_KEY, NEWSAPI_KEY, TELEGRAM_BOT_TOKEN, etc.

# Run the backend
# (see docs/deployment-guide.md for full instructions)
```

> Full setup, environment variable list, and deployment steps are documented separately in `docs/deployment-guide.md`.

---

## Automation

The pipeline runs automatically via **GitHub Actions**:
- Daily data collection workflow
- Weekly model retraining workflow (`scheduler.yml`)

This keeps the dataset current on a rolling window and ensures models stay up to date without manual intervention.

---

## Contributing

This is a team academic/portfolio project built collaboratively across 9 members. Each phase's work lives on its own feature branch before merging into `main`. See `docs/` for the API reference, deployment guide, and user guide.
