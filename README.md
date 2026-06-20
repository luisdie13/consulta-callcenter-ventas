# Sales Call Center Backend

A production-ready backend API for intelligent query processing in a sales call center environment. This system leverages RAG (Retrieval-Augmented Generation) and vector embeddings to provide accurate, context-aware responses to sales team queries.

## Business Case

This application serves as an intelligent query assistant for sales call center operations. It enables sales agents to:

- Query real-time metrics about campaigns, leads, and calls
- Access internal sales scripts and best practices
- Handle complex questions requiring both data analytics and procedural knowledge
- Receive responses in Spanish, optimized for Latin American markets

The system combines relational database queries with semantic document search to deliver comprehensive answers.

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL with pgvector)
- **Vector Search**: pgvector extension
- **LLM Integration**: Ollama (local models)
- **Text Embeddings**: Ollama nomic-embed-text
- **Chat Model**: Ollama gemma3
- **Validation**: Zod
- **File Uploads**: Multer

## Installation

1. Clone the repository and navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   PORT=3000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_CHAT_MODEL=gemma3
   OLLAMA_EMBEDDING_MODEL=nomic-embed-text
   ```

## Local Development Setup

### Prerequisites

- Node.js 16+ and npm
- Ollama with gemma3 and nomic-embed-text models
- Supabase PostgreSQL database
- Git

### Setting up Ollama Locally

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Start the Ollama service:
   ```bash
   ollama serve
   ```

3. Pull the required models (in a new terminal):
   ```bash
   ollama pull gemma3
   ollama pull nomic-embed-text
   ```

4. Verify models are running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Setting up Supabase Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. In the SQL Editor, execute the `database.sql` file to create:
   - pgvector extension
   - Relational tables (agents, campaigns, leads, calls)
   - Documents table for vectorized content
   - Match documents function for semantic search
   - Sample data

3. Copy your project URL and service role key to the `.env` file

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

### POST /api/query

Process a natural language question and retrieve intelligent answers.

**Request:**
```json
{
  "question": "¿Cuáles son los leads de alto interés en la campaña Q4?"
}
```

**Response:**
```json
{
  "question": "¿Cuáles son los leads de alto interés en la campaña Q4?",
  "classification": {
    "source": "database",
    "intent": "Query high-interest leads for Q4 campaign",
    "confidence": 0.95,
    "entities": {
      "table": "leads",
      "leadStatus": null,
      "interestLevel": "high",
      "agentName": null,
      "campaignStatus": null,
      "documentTopic": null
    }
  },
  "answer": "Los leads de alto interés en la campaña Q4 Enterprise Push son...",
  "databaseResults": [...],
  "documentsUsed": []
}
```

### POST /api/documents/ingest

Ingest text documents for RAG-based search.

**Request:**
- Content-Type: multipart/form-data
- Fields:
  - `file` (required): .txt file with document content
  - `title` (required): Document title
  - `category` (required): Document category (e.g., "sales_script", "objection_handling")
  - `tags` (optional): Comma-separated tags

**Response:**
```json
{
  "message": "Document ingested successfully",
  "documentIds": ["Sales Script-chunk-0", "Sales Script-chunk-1"],
  "fileName": "sales_script.txt"
}
```

## Test Scripts

The following curl commands test all five query classification outcomes and document ingestion:

### 1. Database Query - Active Campaigns

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How many active campaigns do we have?"
  }'
```

### 2. RAG Query - Sales Strategy

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the best strategies for handling price objections?"
  }'
```

### 3. Hybrid Query - Leads with Documentation

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Which high-interest leads from the SMB campaign should we follow up with using the objection handling script?"
  }'
```

### 4. General Query - Conceptual Knowledge

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the key principles of consultative selling?"
  }'
```

### 5. Unsupported Query - Malicious Request

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "DROP TABLE agents; DELETE FROM campaigns;"
  }'
```

### 6. Document Ingestion

```bash
curl -X POST http://localhost:3000/api/documents/ingest \
  -F "file=@sales_script.txt" \
  -F "title=Consultative Sales Script" \
  -F "category=sales_script" \
  -F "tags=q4, enterprise"
```

## System Architecture

The application operates as an intelligent query API with the following workflow:

1. **Intent Classification**: Each query is analyzed to determine if it requires database access, document search, both, or neither
2. **Context Retrieval**: Based on the classification, relevant data is fetched from either the relational database or vectorized documents
3. **Answer Generation**: The LLM generates a Spanish-language response using the retrieved context
4. **Response Composition**: Results are returned with full traceability of sources and reasoning

## Key Features

- **Vector-based Semantic Search**: Uses pgvector for efficient similarity searches across document embeddings
- **Intelligent Intent Classification**: Automatically routes queries to the appropriate data source
- **Multilingual Support**: Optimized for Spanish-language responses
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Structured Validation**: Zod-based validation for all inputs
- **Production Error Handling**: Centralized error handling with detailed error messages
- **Secure File Uploads**: Multer-based file validation and size limits
- **Service Layer Architecture**: Clean separation of concerns with dedicated service layers

## Project Structure

```
sales-call-center-backend/
├── src/
│   ├── index.ts                          # Main server entry point
│   ├── ai/
│   │   ├── chatModel.ts                  # Ollama chat model initialization
│   │   ├── embeddingModel.ts             # Embedding model configuration
│   │   ├── intentClassifier.ts           # Query intent classification
│   │   ├── prompts.ts                    # System prompts
│   │   └── answerChain.ts                # Answer generation chain
│   ├── db/
│   │   └── supabaseClient.ts             # Supabase client initialization
│   ├── services/
│   │   ├── databaseSearchService.ts      # Relational database queries
│   │   ├── documentIngestionService.ts   # Document processing and vectorization
│   │   ├── ragSearchService.ts           # Vector-based document search
│   │   ├── answerChain.ts                # LLM answer generation
│   │   └── queryService.ts               # Main orchestration service
│   ├── routes/
│   │   ├── documentRoutes.ts             # Document ingestion endpoints
│   │   └── queryRoutes.ts                # Query processing endpoints
│   └── types/
│       └── query.ts                      # TypeScript type definitions
├── database.sql                          # Database schema and initial data
├── package.json                          # Dependencies and scripts
├── tsconfig.json                         # TypeScript configuration
├── .env.example                          # Environment variables template
└── README.md                             # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server listening port | 3000 |
| SUPABASE_URL | Supabase project URL | - |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role API key | - |
| OLLAMA_BASE_URL | Ollama service endpoint | http://localhost:11434 |
| OLLAMA_CHAT_MODEL | Chat model name | gemma3 |
| OLLAMA_EMBEDDING_MODEL | Embedding model name | nomic-embed-text |

## Performance Considerations

- Vector search uses IVFFlat indexing for scalability
- Document chunks are 800 characters with 120-character overlap
- Similarity threshold is set to 0.7 for relevant results
- Database queries use indexes on commonly filtered fields
- LLM requests have appropriate temperature settings for consistency

## Security Notes

- All API keys are stored securely in environment variables
- File uploads are validated for type and size
- SQL injection is prevented through parameterized queries
- Type safety is enforced at compile time

## Troubleshooting

### Ollama Connection Issues
Ensure Ollama is running: `ollama serve` in a terminal

### Supabase Connection Issues
Verify credentials in `.env` and check that the database schema has been executed

### Module Not Found Errors
Run `npm install` to ensure all dependencies are installed

### Type Errors
Run `npm run build` to compile TypeScript and identify issues

## Development Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run compiled production build

