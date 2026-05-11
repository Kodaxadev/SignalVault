# Phase 09: Indexer Events

## Goal

Corroborate and stale manual intel with event data.

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
