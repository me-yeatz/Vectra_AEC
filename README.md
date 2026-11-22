# VECTRA — Built for Project Excellence

VECTRA is a professional project-tracking platform built for architecture and engineering firms. It centralizes projects, regulatory submissions, communications, finances, site photos, and invoicing in one streamlined workspace.

## 🖥 Preview

![VECTRA Desktop Preview](public/screenshot-desktop.png)

## ✨ Features

- **Project Management** — Create, edit, and track architecture projects with rich client/contact details, budgets, timelines, and notes.
- **Regulatory Submissions** — Monitor planning permissions, building permits, structural/fire/environmental approvals with statuses and fees.
- **Project Timeline (Gantt)** — Visual overview of project schedules with progress and status indicators.
- **Site Photos** — Upload and manage on-site photos per project.
- **Invoicing** — Generate, save, export (print/PDF), and email invoices directly to clients.
- **AI Communication Manager** — Intelligent client message handling with auto-response settings.
- **Notifications** — Unread-aware notifications that clear once read.
- **Profile Management** — Personal/company details with profile photo upload.
- **Database Manager** — Tasks, clients, documents, and notes per project.
- **Financial Overview** — Consultant fees, budgets, and submission analytics.

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite
- **Desktop:** Electron
- **Backend/Edge:** Cloudflare Workers (Hono)
- **Storage:** localStorage (demo) / D1 (production-ready hooks)
- **UI Icons:** lucide-react

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run (Web)

```bash
npm run dev
```

Open http://localhost:5173

### Run (Desktop)

```bash
npm run electron:dev
```

### Build

```bash
npm run build
```

### Desktop Build

```bash
npm run electron:build
```

## 📦 Deployment

The app is deployed via **Vercel**. Pushing to `main` triggers an automatic deployment.

## 📁 Project Structure

```
src/
  react-app/        # React frontend
    components/     # UI components
    services/       # Data services
    data/           # Mock data
  worker/           # Cloudflare Worker (Hono)
public/             # Static assets (logo, manifest)
```

## 📄 License

© VECTRA. All rights reserved.
