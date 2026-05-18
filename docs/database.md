# Database

Run these in the Supabase SQL editor to set up the required tables.

## scrape_cache

Caches Firecrawl scrape responses, keyed by hostname.

```sql
create table scrape_cache (
  id         uuid        primary key default gen_random_uuid(),
  cache_key  text        not null unique,
  data       jsonb       not null,
  created_at timestamptz not null default now()
);
```

## ai_response_cache

Caches LLM stream responses, keyed by a hash of the model params (prompt + settings).

```sql
create table ai_response_cache (
  id         uuid        primary key default gen_random_uuid(),
  cache_key  text        not null unique,
  data       jsonb       not null,
  created_at timestamptz not null default now()
);
```
