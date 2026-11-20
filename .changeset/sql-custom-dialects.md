---
"effect": minor
---

SQL adapters can declare their own `Statement.Dialect`, and callers can select built-in or custom dialects with `sql.matchDialect`.

### Breaking changes

- Replace `sql.onDialect` and `sql.onDialectOrElse` with `sql.matchDialect`. Pass a list of `[dialect, callback]` pairs and a fallback that receives the unmatched dialect. Wrap existing callbacks that expect the case object as `this` or a fallback invocation with zero arguments.
- Add a fallback to exhaustive switches on `Statement.Dialect`.
- Hand-written implementations of `Statement.Constructor` must expose their compiler's `dialect`.
