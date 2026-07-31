# Architecture

Request flow:

`Browser -> React frontend -> FastAPI -> PyMongo -> MongoDB`

The application is intentionally small, but the structure is meant to resemble a
production service that can later grow into:

- replica set awareness
- primary/secondary visualization
- replication lag tracking
- DNS inspection
- Prometheus metrics
- Grafana dashboards
- chaos experiments
- backup workflows
- security hardening

Design rule:

If a feature does not improve understanding of infrastructure behavior, it does
not belong in Phase 1.

