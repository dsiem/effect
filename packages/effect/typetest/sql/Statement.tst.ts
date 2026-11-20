import * as Statement from "effect/sql/Statement"
import { describe, expect, it } from "tstyche"

declare const sql: Statement.Constructor
declare const plainLiteral: { readonly _tag: "Literal"; readonly value: string }
declare const plainFragment: {
  readonly "~effect/sql/Statement/Fragment": "~effect/sql/Statement/Fragment"
  readonly segments: ReadonlyArray<Statement.Segment>
}

describe("Statement", () => {
  it("matchDialect preserves contextual callback types and generic results", () => {
    const size: (text: string) => number = sql.matchDialect(
      [["pg", () => (text) => text.length]],
      () => (text) => text.length
    )
    expect(size).type.toBe<(text: string) => number>()
    const select = <A>(branch: () => A): A => sql.matchDialect([["pg", branch]], branch)
    expect(select(() => 1)).type.toBe<number>()
  })

  it("infers built-in, custom and fallback results", () => {
    const result = sql.matchDialect([
      ["pg", () => true],
      ["spark", () => "warehouse"]
    ], (dialect) => {
      expect(dialect).type.toBe<Statement.Dialect>()
      return 0
    })
    expect(result).type.toBe<boolean | string | number>()
    expect(sql.dialect).type.toBe<Statement.Dialect>()
    expect(sql.matchDialect).type.not.toBeCallableWith([["pg", () => true]] as const)
  })

  it("cannot hide cases from the inferred result", () => {
    const cases = [["pg", () => "postgres"]] as const
    const widened: ReadonlyArray<readonly [Statement.Dialect, () => string]> = cases
    const result = sql.matchDialect(widened, () => 0)
    expect(result).type.toBe<string | number>()
    expect(cases).type.not.toBeAssignableTo<readonly []>()
    const options = { pg: () => "postgres", orElse: () => 0 }
    const narrowed: { orElse: () => number } = options
    expect(sql.matchDialect).type.not.toBeCallableWith(narrowed, narrowed.orElse)
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
