# Architecture

## Overview

Dream College Finder uses a full-stack architecture:

- Next.js frontend
- FastAPI backend
- PostgreSQL database
- pgvector for embeddings
- OpenAI for AI features

## Flow

Browser → API → Services → Database

## Backend Layers

### API Layer
Handles requests and responses.

### Service Layer
Contains business logic:
- recommendation engine
- resume parsing
- advice generation
- RAG system

### Repository Layer
Handles database queries.

### Models
Defines database schema.

## Recommendation System

Inputs:
- GPA
- SAT/ACT
- Major
- State

Outputs:
- Reach / Target / Safety schools

## RAG System

1. Embed school data
2. Store in pgvector
3. Retrieve relevant documents
4. Generate answer with LLM