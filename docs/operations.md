# Operations

## Expected runtime

- Ubuntu VM
- standalone MongoDB
- FastAPI service managed by `systemd`
- React frontend served separately or as static assets in a later phase

## Phase 1 observability

- every request is logged
- health endpoints expose MongoDB reachability
- dashboard surfaces uptime and timestamps
- logs page exists so failures are visible

