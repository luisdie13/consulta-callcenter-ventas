CREATE EXTENSION IF NOT EXISTS vector;

-- RELATIONAL STRUCTURES

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id bigserial primary key,
  name text not null,
  email text not null unique,
  phone text,
  status text default 'active',
  hire_date timestamp default now(),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp default now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id bigserial primary key,
  name text not null,
  description text,
  status text default 'active',
  start_date timestamp,
  end_date timestamp,
  target_leads integer,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp default now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id bigserial primary key,
  name text not null,
  email text,
  phone text not null,
  company text,
  status text default 'new',
  interest_level text default 'cold',
  campaign_id bigint references campaigns(id),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
  id bigserial primary key,
  lead_id bigint references leads(id),
  agent_id bigint references agents(id),
  campaign_id bigint references campaigns(id),
  duration_seconds integer,
  status text default 'completed',
  notes text,
  outcome text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp default now()
);

-- VECTOR KNOWLEDGE STRUCTURE

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id bigserial primary key,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(768)
);

-- INDEX OPTIMIZATION LAYER
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_interest_level ON leads(interest_level);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);

-- Vector similarity search index (IVFFlat with Cosine distance operator)
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- SEMANTIC RETRIEVAL PL/pgSQL FUNCTION

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 4,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(id bigint, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    (1 - (documents.embedding <=> query_embedding)) as similarity
  FROM documents
  WHERE (filter = '{}'::jsonb OR documents.metadata @> filter)
    AND (1 - (documents.embedding <=> query_embedding)) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- INITIAL RECORD INSERTS
INSERT INTO agents (name, email, phone, status) VALUES
  ('Carlos Rodriguez', 'carlos.rodriguez@company.com', '555-0101', 'active'),
  ('Maria Garcia', 'maria.garcia@company.com', '555-0102', 'active'),
  ('Juan Martinez', 'juan.martinez@company.com', '555-0103', 'inactive');

-- Insert campaigns
INSERT INTO campaigns (name, description, status, start_date, end_date, target_leads) VALUES
  ('Q4 Enterprise Push', 'Target enterprise clients for Q4 revenue targets', 'active', NOW(), NOW() + INTERVAL '90 days', 150),
  ('SMB Outreach', 'Small and medium business acquisition campaign', 'active', NOW(), NOW() + INTERVAL '60 days', 200),
  ('Partner Expansion', 'Expand partnerships with existing clients', 'completed', NOW() - INTERVAL '30 days', NOW(), 75);

-- Insert leads
INSERT INTO leads (name, email, phone, company, status, interest_level, campaign_id) VALUES
  ('Alex Johnson', 'alex.johnson@techcorp.com', '555-1001', 'TechCorp Inc', 'contacted', 'high', 1),
  ('Sarah Williams', 'sarah@startup.io', '555-1002', 'StartupIO', 'new', 'cold', 2),
  ('Michael Chen', 'm.chen@established.co', '555-1003', 'Established Co', 'qualified', 'medium', 1),
  ('Emma Davis', 'emma.davis@growth.com', '555-1004', 'Growth Ventures', 'proposal_sent', 'high', 2),
  ('Robert Taylor', 'r.taylor@innovations.net', '555-1005', 'Innovations Ltd', 'new', 'warm', 2);

-- Insert calls
INSERT INTO calls (lead_id, agent_id, campaign_id, duration_seconds, status, outcome) VALUES
  (1, 1, 1, 1200, 'completed', 'interested'),
  (2, 2, 2, 900, 'completed', 'not_interested'),
  (3, 1, 1, 1500, 'scheduled_follow_up', 'needs_follow_up'),
  (4, 2, 2, 1800, 'completed', 'sale'),
  (5, 1, 2, 600, 'completed', 'voicemail_left');