# Phase 09: Indexer Events

## Goal

Corroborate and stale manual intel with event data.

## Status

Not closed as originally written. The repo implements staleness, contradiction detection, World API enrichment, and remote audit/event records for writes, but it does not ingest an external indexer event stream or build an event timeline per entity. Treat this as deferred unless a reliable EVE Frontier event/indexer source is selected.

## Build

- event ingestion adapter
- gate traversal event mapping
- deployment/config change mapping
- inventory/update event mapping where available
- event timeline per entity
- automatic recheck prompts

## Acceptance Criteria

- Event data can corroborate manual gate reports.
- Assembly config/deployment changes flag dossiers for recheck.
- Storage events can mark manifest possibly stale.
- Event source is clearly labeled.

## Evidence

- Implemented adjacent pieces: `apps/web/src/features/staleness/`, `apps/web/src/features/contradictions/`, `apps/api/src/audit/`
- Missing external event ingestion adapter and event timeline modules.
