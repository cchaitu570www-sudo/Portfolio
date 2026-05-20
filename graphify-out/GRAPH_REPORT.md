# Graph Report - .  (2026-05-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 5 nodes · 4 edges · 1 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cb339d06`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]

## God Nodes (most connected - your core abstractions)
1. `nodes` - 1 edges
2. `io` - 1 edges
3. `blocks` - 1 edges
4. `observer` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (1 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.40
Nodes (4): blocks, io, nodes, observer

## Knowledge Gaps
- **4 isolated node(s):** `nodes`, `io`, `blocks`, `observer`
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `nodes`, `io`, `blocks` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._