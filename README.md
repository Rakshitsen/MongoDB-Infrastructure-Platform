# MongoDB Distributed Database Learning Platform

This repository has been upgraded from a "Standalone MongoDB Learning Platform" to a **"Distributed Database Learning Platform"**.

The primary goal of this platform is to provide an observability console and learning environment for MongoDB Replica Sets.
It allows engineers to visualize and understand the behavior of distributed database systems, focusing on:

- Linux and Networking interactions
- MongoDB Replica Sets and their operational states
- Distributed Systems concepts
- Operational troubleshooting scenarios

The application is structured as a full-stack service:

- `frontend/`: A React dashboard serving as an operations console for real-time observability.
- `backend/`: A FastAPI service that interacts with MongoDB, exposing various data and observability endpoints.
- `docs/`: Comprehensive documentation covering architecture and operational guides.
- `scripts/`: Helper scripts for local development and server-side operations.
- `systemd/`: Linux service unit configurations for deployment.
- `configs/`: Example environment and runtime configurations.

### New Features and Observability Capabilities:

- **Replica Set Status**: Real-time monitoring of replica set members, their states (PRIMARY, SECONDARY), and health.
- **Driver Topology**: Insights into PyMongo's understanding of the replica set, including read preference, write concern, connected nodes, and the current writable server.
- **Product Workload APIs**: CRUD endpoints for 'products' that generate realistic read/write operations against the MongoDB cluster, crucial for observing system behavior under load.
- **Read/Write Test Endpoints**: Dedicated endpoints to test read and write operations, returning detailed metadata like execution hostname, MongoDB node used, replica state, and latency. This helps in understanding read preference and write concern effects.
- **Connection Pool Information**: Displays details about PyMongo's connection pool to the replica set members.
- **Enhanced Logging**: Comprehensive logging for all MongoDB operations, capturing timestamps, endpoints, MongoDB node used, operation type (read/write), execution time, and success/failure status.

The focus remains on **infrastructure observability and distributed systems visualization**, not on business functionality or e-commerce features.

