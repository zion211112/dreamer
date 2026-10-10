# RAGFlow Integration Reference

## What is RAGFlow?

**RAGFlow** (https://github.com/infiniflow/ragflow) is an open-source Retrieval-Augmented Generation (RAG) engine designed for production use with complex unstructured data. It provides:

### Core Capabilities
- **Document Processing**: Multi-modal document parsing (PDF, DOCX, images, tables, code)
- **Chunking Strategies**: Intelligent semantic chunking with overlap control
- **Embedding & Retrieval**: Dense + sparse vector search with reranking
- **Agentic RAG**: Multi-hop reasoning with tool use and self-correction
- **Knowledge Graph**: Entity extraction and relationship mapping
- **API-First**: RESTful API for integration with external systems

### Architecture Highlights
- **DeepDoc**: Advanced document understanding engine (layout analysis, table extraction, formula recognition)
- **Infinity**: Embedding model serving with GPU optimization
- **Vector DB**: Built on Milvus for scalable similarity search
- **Graph DB**: Neo4j for knowledge graph construction
- **MinIO**: Object storage for document assets

### Use Cases Relevant to APT-LABS
1. **Institutional Knowledge Base**: Ingest policy docs, regulations, curriculum materials
2. **Evidence Retrieval**: Semantic search over evidence ledger entries
3. **Compliance Q&A**: Natural language queries against regulatory documents
4. **Report Generation**: RAG-assisted drafting of compliance reports
5. **Cross-Domain Synthesis**: Link evidence across Record, Allocate, Coordinate, Measure, Govern layers

---

## Integration Points for APT-LABS

### 1. Evidence Layer (`/evidence`, `lib/epistemic/`)
RAGFlow could power semantic search over the evidence ledger:
- Query: "Find all VERIFIED claims about budget allocation in Q1 2025"
- Returns: Ranked evidence entries with provenance chains
- Guard integration: RAG results tagged with evidence states (VERIFIED, PROTOTYPE, etc.)

### 2. Console Knowledge Assistant (`/console`)
Agentic RAG for operational queries:
- "What's the current timetable conflict status for Grade 5?"
- "Generate a compliance summary for the term audit"
- "Find similar scheduling patterns from last year"

### 3. Policy Engine (`/govern` layer)
- Ingest regulatory PDFs → extract rules → encode as policy constraints
- Monitor for regulatory changes via scheduled re-ingestion
- Alert when evidence states contradict policy requirements

### 4. Intelligence Layer (`/intelligence`)
- Cross-reference evidence across all five layers
- Build knowledge graph of institutional entities (people, roles, resources, policies)
- Support "what-if" queries for the Control layer

---

## Deployment Options

### Option A: Sidecar Service (Recommended for Prototype)
```yaml
# docker-compose.yml addition
services:
  ragflow:
    image: infiniflow/ragflow:latest
    ports:
      - "9380:80"
    environment:
      - ELASTICSEARCH_HOST=elasticsearch
      - MINIO_ENDPOINT=minio:9000
      - MILVUS_HOST=milvus
    volumes:
      - ragflow_data:/ragflow/data
    depends_on:
      - elasticsearch
      - minio
      - milvus
```

### Option B: Embedded via API
- Deploy RAGFlow separately (Kubernetes, VM, or managed)
- APT-LABS calls REST API for ingestion/query
- Lower operational complexity, higher latency

### Option C: Library Integration (Future)
- Use DeepDoc as a library for document processing
- Use Infinity for embeddings
- More control, more maintenance

---

## Session Continuity with RAGFlow

### Why RAGFlow Enables Continuous Sessions
1. **Persistent Knowledge Base**: Documents stay indexed across sessions
2. **Conversation Memory**: RAGFlow tracks query history and context
3. **Incremental Ingestion**: New evidence/documents added without full reindex
4. **Agent State**: Multi-hop reasoning agents maintain working memory

### Integration Pattern for Session Continuity
```
User Session → APT-LABS Frontend → RAGFlow API → Vector/Graph DB
                    ↓                      ↓
             Session Context         Conversation History
             (epistemic state)        (multi-turn context)
```

### Key Configuration for Institutional Use
- **Data Sovereignty**: Self-hosted, no external API calls required
- **Access Control**: Integrate with APT-LABS identity/roles
- **Audit Trail**: All queries and retrievals logged
- **Evidence Tagging**: RAG results carry APT-LABS evidence states

---

## Next Steps

### Phase 1: Prototype Integration (PROTOTYPE)
- [ ] Deploy RAGFlow in development (docker-compose)
- [ ] Ingest sample institutional documents (policies, regulations)
- [ ] Build `/evidence/search` endpoint using RAGFlow API
- [ ] Add evidence state tags to RAG results

### Phase 2: Console Assistant (TARGET)
- [ ] Add "Ask the Console" chat interface
- [ ] Connect to evidence ledger and policy documents
- [ ] Implement multi-turn conversation with guard integration
- [ ] Add citation display with evidence state badges

### Phase 3: Production Hardening (PLANNED)
- [ ] Kubernetes deployment with autoscaling
- [ ] RBAC integration with APT-LABS identity
- [ ] Automated document ingestion pipelines
- [ ] Monitoring and alerting for retrieval quality

---

## References
- GitHub: https://github.com/infiniflow/ragflow
- Documentation: https://ragflow.io/docs/
- DeepWiki: https://deepwiki.com/infiniflow/ragflow
- Project Guide: https://knightli.com/en/2026/04/15/ragflow-rag-engine-guide/

---

*This document is a PLANNED reference for future integration. RAGFlow is not currently deployed in the APT-LABS prototype.*