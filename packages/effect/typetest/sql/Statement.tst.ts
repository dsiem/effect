import * as Statement from "effect/sql/Statement"
import { describe, expect, it } from "tstyche"

declare const sql: Statement.Constructor
declare const plainLiteral: { readonly _tag: "Literal"; readonly value: string }
declare const plainFragment: {
  readonly "~effect/sql/Statement/Fragment": "~effect/sql/Statement/Fragment"
  readonly segments: ReadonlyArray<Statement.Segment>
}

describe("Statement", () => {
  it("onDialectOrElse preserves contextual callback types and explicit result types", () => {
    const size: (text: string) => number = sql.onDialectOrElse({
      orElse: () => (text) => text.length
    })
    expect(size).type.toBe<(text: string) => number>()
    expect(sql.onDialectOrElse<number>({ orElse: () => 0 })).type.toBe<number>()
    const result = sql.onDialectOrElse({ orElse: () => 0, sqlite: () => "" })
    expect(result).type.toBe<number | string>()
    const select = <A>(branch: () => A): A => sql.onDialectOrElse({ orElse: branch, pg: branch })
    expect(select(() => 1)).type.toBe<number>()
  })

  it("infers custom results from the fallback and built-in results from named branches", () => {
    const result = sql.onDialectOrElse({
      pg: () => true,
      orElse: () => sql.dialect === "spark" ? 1 : "fallback"
    })
    expect(result).type.toBe<boolean | 1 | "fallback">()
    expect(sql.dialect).type.toBe<Statement.Dialect>()
    expect(sql.onDialectOrElse).type.not.toBeCallableWith({ orElse: (dialect: Statement.Dialect) => dialect })
    const extra = { spark: () => "warehouse", orElse: () => 0 }
    const narrowed: { orElse: () => number } = extra
    const fallback = sql.onDialectOrElse(narrowed)
    expect(fallback).type.toBe<number>()
    expect(sql.onDialectOrElse).type.not.toBeCallableWith({ pg: () => "postgres" })
  })

  it("insert requires non-empty rows or a single record", () => {
    expect(sql.insert).type.not.toBeCallableWith([])
    expect(sql.insert).type.toBeCallableWith([{ name: "Ada" }])
    expect(sql.insert).type.toBeCallableWith({ name: "Ada" })
  })

  it("updateValues requires non-empty rows", () => {
    expect(sql.updateValues).type.not.toBeCallableWith([], "data")
    expect(sql.updateValues).type.toBeCallableWith([{ name: "Ada" }], "data")
  })

  it("requires symbol-branded fragments and segments", () => {
    expect(Statement.fragment).type.toBeCallableWith([Statement.literal("SELECT 1")])
    expect(Statement.fragment).type.not.toBeCallableWith([plainLiteral])
    expect(sql.csv).type.toBeCallableWith([Statement.fragment([])])
    expect(sql.csv).type.not.toBeCallableWith([plainFragment])
  })
})
