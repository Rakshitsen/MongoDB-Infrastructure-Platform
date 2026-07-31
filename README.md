# MongoDB Infrastructure Learning Platform

This repository is a Phase 1 engineering learning platform for observing how a
FastAPI application behaves when it talks to a standalone MongoDB server on an
Ubuntu VM.

The application is treated as a first-class production service:

- `frontend/` for the React dashboard
- `backend/` for the FastAPI service
- `docs/` for architecture and operating notes
- `scripts/` for local and server-side helpers
- `systemd/` for the Linux service unit
- `configs/` for environment and runtime configuration examples

The goal is not business functionality. The goal is visibility into request
flow, database reachability, and operational health.

