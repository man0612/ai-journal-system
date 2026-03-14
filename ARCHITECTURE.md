# AI-Assisted Journal System Architecture

## Overview

The system consists of three main components:

Frontend  
React application that allows users to write journal entries, analyze emotions, and view insights.

Backend  
Node.js + Express REST API that handles journal storage, emotion analysis, and insights generation.

Database  
SQLite database used to store journal entries and analysis results.

Flow:

User writes journal → Backend stores entry → Emotion analysis runs → Results stored in database → Insights API aggregates data for trends.

---

# 1. How would you scale this system to 100k users?

For scaling beyond a small prototype, several architectural improvements would be made:

### Replace SQLite with PostgreSQL
SQLite works well for local development but does not scale well with concurrent users.  
A production system would use PostgreSQL or a managed cloud database.

### Deploy Backend on Multiple Instances
The backend would run behind a load balancer using services such as:

- AWS Elastic Load Balancer
- Nginx
- Kubernetes

This allows multiple backend instances to handle requests concurrently.

### Introduce a Caching Layer
Redis would be used to cache frequent queries such as insights and emotion analysis results.

### Use Message Queues for Analysis
Emotion analysis could be processed asynchronously using queues like:

- RabbitMQ
- Kafka
- AWS SQS

This prevents long-running analysis tasks from blocking API responses.

---

# 2. How would you reduce LLM cost?

LLM costs can increase quickly if every request triggers analysis. Several strategies can reduce cost:

### Cache Analysis Results
If the same journal text has already been analyzed, return the stored result instead of running analysis again.

### Use Smaller Models
Instead of large expensive models, use smaller or open-source models such as:

- HuggingFace sentiment models
- DistilBERT
- local inference models

### Batch Processing
Multiple journal entries could be analyzed in batches instead of individual requests.

### Trigger Analysis Only Once
Emotion analysis should run only when the journal entry is first created, not every time the user views it.

---

# 3. How would you cache repeated analysis?

Caching is implemented in two layers:

### Database-Level Caching
Emotion, summary, and keywords are stored directly in the journal table.

Before performing analysis, the system checks:

SELECT emotion FROM journal WHERE text = ?

If analysis exists, it returns the stored result instead of recalculating.

### Redis Cache (Future Improvement)
For large-scale systems, Redis can cache analysis responses for quick retrieval.

Example cache key:

analysis:{journal_text_hash}

This avoids unnecessary LLM calls.

---

# 4. How would you protect sensitive journal data?

Journal entries contain sensitive personal information, so security is important.

### Encryption
All API communication should use HTTPS.

Sensitive database fields can be encrypted at rest.

### Authentication
Users should authenticate using secure methods such as:

- JWT authentication
- OAuth login

This ensures users only access their own journal entries.

### API Rate Limiting
Rate limiting prevents abuse of APIs and protects backend resources.

### Secure API Keys
If external LLM APIs are used, API keys should be stored in environment variables and never exposed in the frontend.

---

# Conclusion

This architecture separates concerns between frontend, backend, and database layers while allowing the system to scale efficiently.

Key architectural decisions include:

- caching emotion analysis results
- using rate limiting to protect APIs
- storing analysis data in the database
- designing scalable backend services

These design choices allow the system to grow from a prototype into a production-ready journaling platform.