---
"effect": minor
---

SQL adapters can declare their own `Statement.Dialect`, and callers can read `sql.dialect` to select dialect-specific queries.

### Breaking changes

- Add a fallback to exhaustive switches on `Statement.Dialect`. Use `onDialectOrElse` when a client may use a third-party dialect.
- Hand-written implementations of `Statement.Constructor` must expose their compiler's `dialect`.
