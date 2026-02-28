import { describe, it, expect } from "vitest";
import { parseEnvContent } from "./env-parser";

describe("parseEnvContent", () => {
  it("should parse simple KEY=value format", () => {
    const content = "DATABASE_URL=postgresql://localhost:5432/db";
    const result = parseEnvContent(content);

    expect(result).toEqual([
      { key: "DATABASE_URL", value: "postgresql://localhost:5432/db" },
    ]);
  });

  it("should parse multiple key-value pairs", () => {
    const content = `DATABASE_URL=postgresql://localhost:5432/db
API_KEY=secret-key-123
PORT=3000`;
    const result = parseEnvContent(content);

    expect(result).toEqual([
      { key: "DATABASE_URL", value: "postgresql://localhost:5432/db" },
      { key: "API_KEY", value: "secret-key-123" },
      { key: "PORT", value: "3000" },
    ]);
  });

  it("should handle double-quoted values", () => {
    const content = 'API_KEY="value with spaces"';
    const result = parseEnvContent(content);

    expect(result).toEqual([{ key: "API_KEY", value: "value with spaces" }]);
  });

  it("should handle single-quoted values", () => {
    const content = "API_KEY='single quotes'";
    const result = parseEnvContent(content);

    expect(result).toEqual([{ key: "API_KEY", value: "single quotes" }]);
  });

  it("should skip comment lines starting with #", () => {
    const content = `# This is a comment
DATABASE_URL=postgresql://localhost:5432/db
# Another comment
API_KEY=secret-key-123`;
    const result = parseEnvContent(content);

    expect(result).toEqual([
      { key: "DATABASE_URL", value: "postgresql://localhost:5432/db" },
      { key: "API_KEY", value: "secret-key-123" },
    ]);
  });

  it("should skip empty lines", () => {
    const content = `DATABASE_URL=postgresql://localhost:5432/db

API_KEY=secret-key-123

`;
    const result = parseEnvContent(content);

    expect(result).toEqual([
      { key: "DATABASE_URL", value: "postgresql://localhost:5432/db" },
      { key: "API_KEY", value: "secret-key-123" },
    ]);
  });

  it("should handle empty value (KEY=)", () => {
    const content = "EMPTY_KEY=";
    const result = parseEnvContent(content);

    expect(result).toEqual([{ key: "EMPTY_KEY", value: "" }]);
  });

  it("should skip lines without equals sign", () => {
    const content = `DATABASE_URL=postgresql://localhost:5432/db
INVALID_LINE
API_KEY=secret-key-123`;
    const result = parseEnvContent(content);

    expect(result).toEqual([
      { key: "DATABASE_URL", value: "postgresql://localhost:5432/db" },
      { key: "API_KEY", value: "secret-key-123" },
    ]);
  });

  it("should trim whitespace from keys and values", () => {
    const content = "  DATABASE_URL  =  postgresql://localhost:5432/db  ";
    const result = parseEnvContent(content);

    expect(result).toEqual([
      { key: "DATABASE_URL", value: "postgresql://localhost:5432/db" },
    ]);
  });

  it("should handle values with equals signs", () => {
    const content =
      "CONNECTION_STRING=Server=localhost;Database=test;User=admin";
    const result = parseEnvContent(content);

    expect(result).toEqual([
      {
        key: "CONNECTION_STRING",
        value: "Server=localhost;Database=test;User=admin",
      },
    ]);
  });

  it("should handle mixed valid and invalid lines", () => {
    const content = `# Comment
DATABASE_URL=postgresql://localhost:5432/db

INVALID_LINE
API_KEY="secret-key-123"
# Another comment
PORT=3000`;
    const result = parseEnvContent(content);

    expect(result).toEqual([
      { key: "DATABASE_URL", value: "postgresql://localhost:5432/db" },
      { key: "API_KEY", value: "secret-key-123" },
      { key: "PORT", value: "3000" },
    ]);
  });

  it("should return empty array for content with only comments", () => {
    const content = `# Comment 1
# Comment 2
# Comment 3`;
    const result = parseEnvContent(content);

    expect(result).toEqual([]);
  });

  it("should return empty array for content with only empty lines", () => {
    const content = `

  
`;
    const result = parseEnvContent(content);

    expect(result).toEqual([]);
  });

  it("should return empty array for empty string", () => {
    const content = "";
    const result = parseEnvContent(content);

    expect(result).toEqual([]);
  });

  it("should handle keys with underscores and numbers", () => {
    const content = "DATABASE_URL_2=postgresql://localhost:5432/db";
    const result = parseEnvContent(content);

    expect(result).toEqual([
      { key: "DATABASE_URL_2", value: "postgresql://localhost:5432/db" },
    ]);
  });

  it("should preserve quotes inside quoted values", () => {
    const content = 'MESSAGE="He said \\"hello\\" to me"';
    const result = parseEnvContent(content);

    expect(result).toEqual([
      { key: "MESSAGE", value: 'He said \\"hello\\" to me' },
    ]);
  });
});
