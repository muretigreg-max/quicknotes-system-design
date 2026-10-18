
# QuickNotes System Architecture

## 1. Overview

QuickNotes is a web application that allows users to create, retrieve, update, and delete personal notes.

The proposed architecture separates the frontend, backend API, data storage, caching, and background processing. This separation makes the application easier to maintain and scale as usage increases.

This document describes a proposed production architecture. The current project is a frontend prototype using JSONPlaceholder and does not yet implement these production components.

## 2. Functional Requirements

The system should allow users to:

1. Register and authenticate securely.
2. Create notes with a title and optional body.
3. View and search their notes.
4. Update existing notes.
5. Delete notes.
6. Organize notes using tags.
7. Access their notes from different devices.
8. Recover from temporary network or server errors.

## 3. Non-Functional Requirements

- **Availability:** The service should remain accessible during individual component failures.
- **Performance:** Common note operations should respond quickly under normal load.
- **Scalability:** The architecture should support increasing numbers of users and requests.
- **Security:** Authentication, authorization, HTTPS, input validation, and secure password storage are required.
- **Reliability:** Backups and database recovery procedures should protect user data.
- **Maintainability:** Separate application layers should make testing and updates easier.
- **Observability:** Logs, metrics, alerts, and health checks should help identify failures.

## 4. High-Level Architecture

```text
                         USERS
                           |
                           v
                    DNS / HTTPS
                           |
                           v
                  CDN / STATIC FILES
                           |
                           v
                    LOAD BALANCER
                           |
                +----------+----------+
                |                     |
                v                     v
          APP SERVER A          APP SERVER B
                |                     |
                +----------+----------+
                           |
                +----------+----------+
                |                     |
                v                     v
             API CACHE          PRIMARY DATABASE
                                      |
                                      v
                                READ REPLICA

          APP SERVERS
               |
               v
          MESSAGE QUEUE
               |
               v
        BACKGROUND WORKERS
```

The diagram is conceptual. Actual routing, cache placement, database replication, and queue usage depend on deployment requirements.

## 5. Component Responsibilities

### 5.1 Client / Frontend

The browser presents forms, displays notes, and sends HTTP requests to the backend API.

### 5.2 DNS and HTTPS

DNS resolves the application domain to the appropriate infrastructure. HTTPS encrypts traffic between clients and the service.

### 5.3 Content Delivery Network (CDN)

The CDN serves static frontend files such as HTML, CSS, JavaScript, and images from distributed locations. It reduces latency and offloads static traffic from the application servers.

### 5.4 Load Balancer

The load balancer distributes incoming requests across healthy application servers. Health checks help prevent traffic from being sent to an unavailable server.

### 5.5 Application Servers

Multiple application server instances execute business logic, validate input, enforce access permissions, and communicate with storage services.

Application servers should be stateless where practical so additional instances can be added without moving user sessions between servers.

### 5.6 API Cache

A cache such as Redis can store frequently requested data and reduce repeated database reads.

The application must invalidate or update cached data when notes change. Private note data must never be served across users because of incorrect cache keys or permissions.

### 5.7 Primary Database

The primary relational database stores users, notes, tags, and their relationships. Writes go to the primary database to maintain a consistent source of truth.

### 5.8 Read Replica

A read replica can handle suitable read queries and reduce the workload on the primary database. Replication may lag, so requests that require the latest write should read from the primary database.

### 5.9 Message Queue and Background Workers

A message queue accepts tasks that do not need to finish during the main API request. Background workers can process notifications, exports, cleanup tasks, or other asynchronous work.

The queue and workers should support retries and safe handling of duplicate messages.

## 6. Request Flows

### 6.1 Reading Notes

1. The user opens the QuickNotes application.
2. The browser sends `GET /api/notes`.
3. The load balancer routes the request to a healthy application server.
4. The server authenticates the user and checks access permissions.
5. The server checks the cache where appropriate.
6. If necessary, the server queries the database.
7. The server returns a JSON response.
8. The browser renders the notes.

### 6.2 Creating a Note

1. The user submits a note title and optional body.
2. The browser sends `POST /api/notes` over HTTPS.
3. The load balancer routes the request to an application server.
4. The server validates the input and authenticates the user.
5. The server saves the note in the primary database.
6. The server invalidates relevant cached note lists.
7. The server returns `201 Created` with the created note.
8. The browser updates the displayed list.

A successful response should only be sent after the database confirms the write.

## 7. Capacity Planning: One Million Registered Users

Registered users are not necessarily active at the same time. Capacity estimates therefore need explicit assumptions.

### Assumptions

- Registered users: 1,000,000.
- Daily active users: 10% of registered users, or 100,000.
- Each daily active user performs 50 note-read operations per day.
- Each daily active user creates one note per day.
- Peak traffic is estimated at five times average traffic.
- Each stored note averages 2 KB, including basic record metadata but excluding indexes and replication overhead.

These figures are planning assumptions, not measured production traffic.

### Estimated Daily and Average Traffic

**Read operations per day**

100,000 active users × 50 reads = 5,000,000 reads/day.

**Average read requests per second**

5,000,000 ÷ 86,400 ≈ 58 reads/second.

**Average peak read estimate**

58 × 5 ≈ 290 reads/second.

**Write operations per day**

100,000 active users × 1 note = 100,000 writes/day.

**Average write requests per second**

100,000 ÷ 86,400 ≈ 1.2 writes/second.

**Average peak write estimate**

1.2 × 5 ≈ 6 writes/second.

These calculations estimate note reads and note creation only. Authentication, searches, updates, deletes, retries, and other requests would add traffic.

### Estimated Note Storage

100,000 notes/day × 2 KB = approximately 200 MB/day.

Over 365 days:

200 MB × 365 ≈ 73 GB/year of raw note data.

Actual storage will be higher because of indexes, database overhead, backups, replicas, and other records. If notes contain large attachments, those should generally be stored in object storage rather than directly in the notes table.

## 8. Scaling Strategy

### Application Layer

- Run multiple application server instances.
- Scale horizontally by adding instances when CPU, memory, or request latency increases.
- Use health checks and automated replacement of unhealthy instances.
- Keep sessions and shared state outside individual application servers.

### Database Layer

- Add appropriate indexes for common queries.
- Use connection pooling to control database connections.
- Optimize slow queries using query plans and monitoring.
- Add read replicas for suitable read-heavy workloads.
- Consider partitioning or sharding only when simpler approaches are insufficient.
- Use automated backups and test restoration procedures.

### Caching

- Cache suitable frequently accessed data.
- Use cache expiration and invalidation policies.
- Monitor hit rate, memory usage, and stale-data incidents.
- Do not treat the cache as the authoritative copy of notes.

### Static Content

- Serve static files through a CDN.
- Compress assets and enable appropriate browser caching.
- Version assets when deploying frontend changes.

### Background Processing

- Move non-critical work to a queue and worker system.
- Scale workers based on queue depth and processing delay.
- Implement retries, dead-letter handling, and idempotent processing.

## 9. Avoiding Single Points of Failure

A single point of failure is a component whose failure can make the entire service unavailable.

| Component | Risk | Mitigation |
|---|---|---|
| Application server | A server failure interrupts requests | Multiple instances and health checks |
| Load balancer | Traffic cannot reach healthy servers | Redundant or managed highly available load balancing |
| Database primary | Writes may stop if it fails | Automated failover, backups, and tested recovery |
| Read replica | Read capacity is reduced | Monitoring and replacement or additional replicas |
| Cache | Cached requests fail or slow down | Timeouts, fallback to the database where safe, and redundant deployment |
| Message queue | Background tasks are delayed | Durable queue, replication, and monitoring |
| DNS / CDN | Clients may be unable to reach the service or static assets | Reliable managed services, monitoring, and appropriate failover configuration |

A read replica alone does not guarantee high availability. Database failover, replica health, recovery procedures, and data consistency must also be addressed.

## 10. Security Considerations

- Require HTTPS for all application traffic.
- Use secure authentication and password hashing.
- Check authorization on every request involving a note.
- Validate and constrain incoming data.
- Use parameterized database queries.
- Apply rate limits and abuse protection.
- Keep secrets out of source control.
- Encrypt and restrict access to backups.
- Monitor suspicious activity without logging passwords or authentication tokens.

## 11. Trade-Offs

### SQL vs. NoSQL

A relational database offers structured relationships, transactions, constraints, and flexible joins. A NoSQL database may offer different scaling and data-modeling benefits, but relationships and consistency may require additional application logic.

For QuickNotes, a relational database is a suitable starting point.

### Cache Performance vs. Consistency

Caching reduces database load and can improve response times. However, stale data can appear if invalidation is incorrect. The design must balance performance with the need for fresh note data.

### Read Replicas vs. Immediate Consistency

Read replicas can improve read capacity but may lag behind the primary database. Reading recently changed data from the primary database may be necessary where immediate consistency is important.

### More Infrastructure vs. Operational Complexity

Multiple servers, replicas, queues, and caches improve resilience and scaling options but increase cost and operational complexity. A small initial deployment should introduce components when measured requirements justify them.

## 12. Deployment Approach

1. Begin with a frontend, API server, and managed relational database.
2. Add automated tests, monitoring, and backups.
3. Deploy multiple application instances when traffic requires them.
4. Add caching and read replicas based on measured bottlenecks.
5. Introduce background workers for asynchronous tasks.
6. Test failure recovery and capacity under realistic load.

## 13. Conclusion

QuickNotes can start with a relatively simple architecture and evolve as usage grows. Stateless application servers, a reliable relational database, careful caching, observability, and tested recovery procedures provide a foundation for scaling toward one million registered users.

The traffic and storage figures in this document are estimates based on the stated assumptions. Production capacity should be validated with load testing and actual usage metrics.
