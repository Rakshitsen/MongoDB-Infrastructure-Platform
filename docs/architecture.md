# Architecture: Distributed Database Learning Platform

This document outlines the architecture and key components of the MongoDB Distributed Database Learning Platform, focusing on its transformation into an observability console for replica sets.

## Core Request Flow

The fundamental request flow remains:

`Client (Browser) -> React Frontend -> FastAPI Backend -> PyMongo Driver -> MongoDB Replica Set`

However, each layer has been enhanced to provide deeper insights into distributed database behavior.

## Backend (FastAPI + PyMongo)

The FastAPI backend is the central hub for interacting with the MongoDB replica set and exposing observability data. It has been significantly extended with new endpoints:

### 1. Product APIs (`/products`)
These endpoints are designed to simulate real-world read and write workloads against the MongoDB replica set. They use product SKUs for identification and perform standard CRUD operations.

-   **`GET /products`**: Retrieves all products. Generates a read operation.
-   **`GET /products/{sku}`**: Retrieves a single product by SKU. Generates a read operation.
-   **`POST /products`**: Inserts a new product. Generates a write operation.
-   **`PUT /products/{sku}`**: Updates an existing product (e.g., stock or price). Generates a write operation.
-   **`DELETE /products/{sku}`**: Deletes a product. Generates a write operation.

### 2. Replica Set Endpoint (`GET /replicaset/status`)
Provides a summarized view of the MongoDB replica set's current status.

-   **Purpose**: To visualize the health and state of each member (PRIMARY, SECONDARY) in the replica set.
-   **Implementation**: Utilizes `mongo_service.get_replica_set_status()`, which in turn calls the `replSetGetStatus` admin command via PyMongo.
-   **Output**: Includes `replicaSet` name, `current_primary` hostname, and a list of `members` with their `host`, `state`, and `health` status.

### 3. Driver Topology Endpoint (`GET /driver/topology`)
Reveals PyMongo's internal understanding of the MongoDB cluster.

-   **Purpose**: To understand how the PyMongo driver perceives the replica set, including its configured read preference, write concern, and which nodes it considers connected and writable.
-   **Implementation**: Calls `mongo_service.get_driver_topology()`, which inspects the `MongoClient.topology_description`.
-   **Output**: Includes `read_preference`, `write_concern`, `replica_set_name`, a list of `connected_nodes` (address, type, state), and the `current_writable_server`.

### 4. Read Test Endpoint (`GET /products/test-read`)
Simulates a read operation and provides detailed metadata.

-   **Purpose**: To observe the effects of read preference and identify which MongoDB node services read queries.
-   **Implementation**: Performs a simple `find_one()` operation and captures information like the `hostname_executing` the query, the `mongodb_server` that handled it, its `replica_state`, and `latency_ms`.

### 5. Write Test Endpoint (`POST /products/test-write`)
Simulates a write operation with a configurable write concern.

-   **Purpose**: To demonstrate and observe the impact of different `writeConcern` settings on write operations, including acknowledgment and latency.
-   **Implementation**: Accepts a `writeConcern` parameter (e.g., `{"w": "majority"}` or `{"w": 1}`), performs an `insert_one()` operation, and returns `acknowledged`, `write_concern` used, `execution_time_ms`, and the `primary_hostname`.

### 6. Connection Pool Endpoint (`GET /driver/pool`)
Exposes basic information about the PyMongo driver's connection pool.

-   **Purpose**: To provide visibility into the driver's connection management.
-   **Implementation**: Utilizes `mongo_service.get_pool_stats()` to return available information, such as `replica_set_members` and `pool_size`.

### Command Monitoring

-   **Integration**: PyMongo's `monitoring.CommandListener` is used to hook into MongoDB command events (`started`, `succeeded`, `failed`).
-   **Logging**: A `MongoCommandLogger` class (in `app/core/logging.py`) captures these events and appends detailed information about each MongoDB operation (timestamp, type, endpoint, node, operation, duration, success/failure, database) to a `recent_logs` deque. This provides granular insight into database activity.

## Frontend (React + Vite)

The React frontend has been transformed into a comprehensive observability dashboard with several new views:

### 1. Navigation
New navigation items (`Replica Set`, `Distributed Systems`, `Products`, `Logs`) have been added to allow users to switch between different observability views.

### 2. Replica Set View

-   **Purpose**: Visually displays the state and health of each MongoDB replica set member.
-   **Display**: Uses cards to show each member's hostname, state (PRIMARY/SECONDARY), and health status, refreshing every few seconds.

### 3. Products Page

-   **Purpose**: Provides an interactive interface to generate MongoDB workload through CRUD operations.
-   **Features**: Allows users to insert new products and trigger read/write test operations. Results from these tests (e.g., latency, node used) are displayed directly on the page.
-   **Note**: This page is solely for workload generation and observability; no complex UI or business logic is implemented.

### 4. Distributed Systems Page

-   **Purpose**: Visualizes the entire data flow from client to MongoDB replica set and displays key driver/replica set configuration.
-   **Display**: Shows a simplified topology diagram (`Client -> FastAPI -> PyMongo Driver -> Replica Set (Primary/Secondaries)`).
-   **Key Metrics**: Displays the `Current Read Preference`, `Current Write Concern`, `Current Primary`, and `Current Replica Set` name, pulled from the driver topology and replica set status endpoints.

### 5. Logs Page

-   **Purpose**: Presents a live, detailed stream of all recorded HTTP requests and MongoDB operations.
-   **Display**: Each log entry includes `Timestamp`, `Endpoint`, `MongoDB Node Used`, `Read/Write` (or HTTP method), `Execution Time`, and `Success/Failure` status. MongoDB-specific logs are distinguished from HTTP request logs.