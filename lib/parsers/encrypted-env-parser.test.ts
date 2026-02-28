import { describe, it, expect } from "vitest";
import {
  parseEncryptedEnvContent,
  isValidEncryptedEntry,
} from "./encrypted-env-parser";

describe("parseEncryptedEnvContent", () => {
  it("should parse simple KEY=iv:ciphertext format", () => {
    const content = "DATABASE_URL=dGVzdGl2:Y2lwaGVydGV4dA==";
    const result = parseEncryptedEnvContent(content);

    expect(result).toEqual([
      {
        key: "DATABASE_URL",
        iv: "dGVzdGl2",
        ciphertext: "Y2lwaGVydGV4dA==",
      },
    ]);
  });

  it("should handle base64 padding in IV", () => {
    const content = "API_KEY=dGVzdGl2MTI==:Y2lwaGVydGV4dA==";
    const result = parseEncryptedEnvContent(content);

    expect(result).toEqual([
      {
        key: "API_KEY",
        iv: "dGVzdGl2MTI==",
        ciphertext: "Y2lwaGVydGV4dA==",
      },
    ]);
  });

  it("should handle base64 padding in ciphertext", () => {
    const content = "SECRET=dGVzdGl2:Y2lwaGVydGV4dDEyMzQ1Ng==";
    const result = parseEncryptedEnvContent(content);

    expect(result).toEqual([
      {
        key: "SECRET",
        iv: "dGVzdGl2",
        ciphertext: "Y2lwaGVydGV4dDEyMzQ1Ng==",
      },
    ]);
  });

  it("should handle base64 padding in both IV and ciphertext", () => {
    const content = "TOKEN=aXYxMjM0NTY3OA==:Y2lwaGVydGV4dDEyMzQ1Njc4OTA=";
    const result = parseEncryptedEnvContent(content);

    expect(result).toEqual([
      {
        key: "TOKEN",
        iv: "aXYxMjM0NTY3OA==",
        ciphertext: "Y2lwaGVydGV4dDEyMzQ1Njc4OTA=",
      },
    ]);
  });

  it("should parse multiple entries", () => {
    const content = `DATABASE_URL=dGVzdGl2MTI==:Y2lwaGVydGV4dA==
API_KEY=aXYxMjM=:Y2lwaGVy
PORT=aXY=:Y2lwaGVydGV4dDEyMw==`;
    const result = parseEncryptedEnvContent(content);

    expect(result).toHaveLength(3);
    expect(result[0].key).toBe("DATABASE_URL");
    expect(result[1].key).toBe("API_KEY");
    expect(result[2].key).toBe("PORT");
  });

  it("should skip comment lines", () => {
    const content = `# This is a comment
DATABASE_URL=dGVzdGl2:Y2lwaGVydGV4dA==
# Another comment
API_KEY=aXY=:Y2lwaGVy`;
    const result = parseEncryptedEnvContent(content);

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("DATABASE_URL");
    expect(result[1].key).toBe("API_KEY");
  });

  it("should skip empty lines", () => {
    const content = `DATABASE_URL=dGVzdGl2:Y2lwaGVydGV4dA==

API_KEY=aXY=:Y2lwaGVy

`;
    const result = parseEncryptedEnvContent(content);

    expect(result).toHaveLength(2);
  });

  it("should skip lines without equals sign", () => {
    const content = `DATABASE_URL=dGVzdGl2:Y2lwaGVydGV4dA==
INVALID_LINE
API_KEY=aXY=:Y2lwaGVy`;
    const result = parseEncryptedEnvContent(content);

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("DATABASE_URL");
    expect(result[1].key).toBe("API_KEY");
  });

  it("should skip lines without colon separator", () => {
    const content = `DATABASE_URL=dGVzdGl2:Y2lwaGVydGV4dA==
INVALID=no_colon_here
API_KEY=aXY=:Y2lwaGVy`;
    const result = parseEncryptedEnvContent(content);

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("DATABASE_URL");
    expect(result[1].key).toBe("API_KEY");
  });

  it("should trim whitespace from keys", () => {
    const content = "  DATABASE_URL  =dGVzdGl2:Y2lwaGVydGV4dA==";
    const result = parseEncryptedEnvContent(content);

    expect(result[0].key).toBe("DATABASE_URL");
  });

  it("should handle keys with underscores and numbers", () => {
    const content = "DATABASE_URL_2=dGVzdGl2:Y2lwaGVydGV4dA==";
    const result = parseEncryptedEnvContent(content);

    expect(result[0].key).toBe("DATABASE_URL_2");
  });

  it("should return empty array for empty content", () => {
    const content = "";
    const result = parseEncryptedEnvContent(content);

    expect(result).toEqual([]);
  });

  it("should return empty array for content with only comments", () => {
    const content = `# Comment 1
# Comment 2`;
    const result = parseEncryptedEnvContent(content);

    expect(result).toEqual([]);
  });

  it("should handle real base64 strings from crypto operations", () => {
    // These are realistic base64 strings that might come from actual encryption
    const content = `DATABASE_URL=DBkZOETNjbcLUqkt:rq6kDC3AJtG7Sq0rSX+UlviWTi5rIMF6f7OjxTyBidGdZw==
API_KEY=YWJjZGVmZ2hpams=:MTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6`;
    const result = parseEncryptedEnvContent(content);

    expect(result).toHaveLength(2);
    expect(result[0].iv).toBe("DBkZOETNjbcLUqkt");
    expect(result[0].ciphertext).toBe(
      "rq6kDC3AJtG7Sq0rSX+UlviWTi5rIMF6f7OjxTyBidGdZw==",
    );
    expect(result[1].iv).toBe("YWJjZGVmZ2hpams=");
    expect(result[1].ciphertext).toBe(
      "MTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6",
    );
  });
});

describe("isValidEncryptedEntry", () => {
  it("should validate correct base64 entries", () => {
    const entry = {
      key: "DATABASE_URL",
      iv: "dGVzdGl2MTI=",
      ciphertext: "Y2lwaGVydGV4dA==",
    };

    expect(isValidEncryptedEntry(entry)).toBe(true);
  });

  it("should reject invalid base64 in IV", () => {
    const entry = {
      key: "DATABASE_URL",
      iv: "not-base64!",
      ciphertext: "Y2lwaGVydGV4dA==",
    };

    expect(isValidEncryptedEntry(entry)).toBe(false);
  });

  it("should reject invalid base64 in ciphertext", () => {
    const entry = {
      key: "DATABASE_URL",
      iv: "dGVzdGl2MTI=",
      ciphertext: "invalid@#$",
    };

    expect(isValidEncryptedEntry(entry)).toBe(false);
  });

  it("should reject invalid base64 in both fields", () => {
    const entry = {
      key: "DATABASE_URL",
      iv: "invalid!",
      ciphertext: "also-invalid!",
    };

    expect(isValidEncryptedEntry(entry)).toBe(false);
  });
});
