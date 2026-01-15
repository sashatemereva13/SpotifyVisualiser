# Production Architecture – Visualiser

This document describes how the Visualiser project runs in production,
including services, ports, process managers, and how to operate the system.

---

## Overview

The Visualiser is a multi-service application composed of:

- A frontend (Vite / React)
- A Node.js backend (Express + SQLite)
- A Python analysis microservice (Flask, served with Gunicorn)
- Nginx as a reverse proxy
- PM2 and systemd for process supervision

All services run on a single VPS.

---

## Services & Responsibilities

### 1. Frontend

- Technology: Vite + React
- Served by: **Nginx**
- Location: `/var/www/visualiser/frontend/dist`
- Public URL: `https://visualiser.cloud`

The frontend communicates with the backend via `/api`.

---

### 2. Backend API

- Technology: Node.js + Express
- Database: SQLite
- Process manager: **PM2**
- Port: `3001` (internal only)

Responsibilities:

- File uploads
- Track persistence
- Orchestration of audio analysis
- Communication with Python analysis service

PM2 process name: visualiser-backend

---

### 3. Analysis Service

- Technology: Python + Flask
- WSGI server: **Gunicorn**
- Process manager: **systemd**
- Port: `5000` (internal only)
- Service name: visualiser-analysis.service

Responsibilities:

- Receive absolute file paths
- Perform audio analysis
- Return structured JSON to backend

---

### 4. Reverse Proxy

- Technology: **Nginx**
- Responsibilities:
  - Serve frontend assets
  - Proxy `/api` requests to Node backend
- Configuration location: /etc/nginx/sites-available/visualiser

---

## Ports Summary

| Service           | Port   | Exposure |
| ----------------- | ------ | -------- |
| Frontend (Nginx)  | 80/443 | Public   |
| Backend (Node)    | 3001   | Internal |
| Analysis (Python) | 5000   | Internal |

---

## Environment Variables

### Backend

ANALYSIS_SERVICE_URL=http://127.0.0.1:5000

---

## Process Management

### Backend (Node)

Managed by PM2.

Commands:

````bash
pm2 list
pm2 restart visualiser-backend
pm2 logs visualiser-backend

---

## Debugging Checklist

If the application is not behaving as expected:

1. Check Nginx
```bash
systemctl status nginx

2. Check Node backend
pm2 list
pm2 logs visualiser-backend

3. Check Python analysis service
systemctl status visualiser-analysis
journalctl -u visualiser-analysis -f

4. Test backend API directly
curl -X POST http://localhost:3001/api/analysis/<trackId>/run



---

## Startup & Reboot Behavior

- Nginx is managed by systemd and starts automatically on boot.
- The Node.js backend is managed by PM2 and is restored on reboot via `pm2 startup`.
- The Python analysis service is managed by systemd and restarts automatically on failure or reboot.

No manual intervention is required after a server restart.

---

## Notes & Assumptions

- All services share the same filesystem on the VPS.
- Uploaded audio files are stored in:
  `/var/www/visualiser/backend/uploads`
- The analysis service expects absolute file paths.
- The system is designed for a single-server deployment.
````
