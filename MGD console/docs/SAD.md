📘 SYSTEM ARCHITECTURE DOCUMENT
Project: MGD Console

Trainer Analytics Dashboard

1️⃣ Architecture Overview

MGD Console follows a 3-layer architecture:

Presentation Layer (Frontend)

Application Layer (Processing Logic)

Data Layer (CSV File Input)

It is a stateless, single-session, in-memory analytics system.

No database required.

2️⃣ High-Level Architecture
User (Trainer)
      │
      ▼
Frontend UI (Dashboard / Upload / Client View)
      │
      ▼
Application Layer (Processing Engine)
      │
      ▼
CSV File (Structured Data Source)
3️⃣ Layer Breakdown
🟢 A. Presentation Layer

Responsible for:

UI rendering

Displaying metrics

Showing charts

Handling file upload

Navigating between pages

Components:

Dashboard Page

Upload Page

Client List Page

Client Detail Page

This layer does NOT perform analytics.
It only displays processed data.

🟢 B. Application Layer (Core Engine)

This is the heart of the system.

Responsible for:

CSV Validation

Data Cleaning

Feature Engineering (BMI)

Aggregation (mean, count)

Categorization

Insight Generation

Data Formatting for charts

All analytics logic lives here.

🟢 C. Data Layer

Input Source:

Structured CSV file

Properties:

Static dataset

No real-time updates

No persistent storage

Loaded into memory during session

4️⃣ Data Flow Pipeline

This is VERY important for explanation.

CSV Upload
   ↓
Schema Validation
   ↓
Data Cleaning
   ↓
Feature Engineering (BMI Calculation)
   ↓
Classification (BMI Category)
   ↓
Aggregation & Metrics Calculation
   ↓
Insight Evaluation
   ↓
Visualization Rendering

This is your Data Processing Pipeline.

Say this in viva:

“The system follows a structured data analytics pipeline from ingestion to visualization.”

That sounds powerful.

5️⃣ Module Interaction Diagram
Upload Module
      │
      ▼
Validation Module
      │
      ▼
Processing Module
      │
      ├── Metric Calculator
      ├── BMI Engine
      ├── Category Classifier
      └── Insight Engine
      │
      ▼
Visualization Module
      │
      ▼
Client View Module

Everything is modular.

This makes your project look engineered — not randomly coded.

6️⃣ Processing Model

MGD Console uses:

Descriptive Analytics

Rule-Based Logic

In-Memory Computation

Single Dataset Snapshot Model

It does NOT use:

Machine Learning

Predictive Models

Databases

External APIs

7️⃣ Deployment Model

Deployment Type:

Localhost-based web application

Single-user execution

No cloud dependency

Environment:

Runs on local machine

Requires only runtime environment

8️⃣ Scalability Considerations

Currently:

Designed for small to medium datasets (10–1000 clients)

Not optimized for large-scale enterprise data

Future scalability could include:

Database integration

Multi-user authentication

Cloud hosting

Historical tracking

This shows future vision.

9️⃣ Design Principles

MGD Console architecture is built on:

Simplicity

Modularity

Explainability

Deterministic logic

Clear separation of concerns

That last phrase is gold in viva.