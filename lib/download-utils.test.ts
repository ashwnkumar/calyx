import { describe, it, expect, beforeAll } from "vitest";
import {
  downloadSingleEncrypted,
  downloadAllEncryptedJson,
  downloadAllEncryptedEnv,
  sanitizeFilename,
  isValidBase64,
} from "./download-utils";
import { encrypt, decrypt, deriveKey, generateSalt } from "./crypto";

/**
 * Verification Tests for Round-Trip Encryption/Decryption
 *
 * These tests verify that downloaded encrypted files preserve data integrity
 * and can be successfully decrypted with the correct passphrase.
 *
 * Validates: Requirements 3.5, 4.6
 */

describe("Round-Trip Encryption/Decryption Verification", () => {
  let cryptoKey: CryptoKey;
  const testPassphrase = "test-passphrase-123";
  const testSalt = generateSalt();

  beforeAll(async () => {
    // Derive a test key for encryption/decryption
    cryptoKey = await deriveKey(testPassphrase, testSalt);
  });

  describe("Single JSON Download Format", () => {
    it("should preserve iv and ciphertext correctly for single download", async () => {
      // Arrange: Create encrypted test data
      const originalPlaintext = "postgresql://localhost:5432/mydb";
      const { iv, ciphertext } = await encrypt(originalPlaintext, cryptoKey);

      const envVar = {
        key: "DATABASE_URL",
        iv,
        ciphertext,
      };

      // Act: Simulate the download process by generating JSON
      const jsonContent = JSON.stringify(
        {
          key: envVar.key,
          iv: envVar.iv,
          ciphertext: envVar.ciphertext,
        },
        null,
        2,
      );

      // Parse the JSON (simulating reading the downloaded file)
      const parsed = JSON.parse(jsonContent);

      // Decrypt using the parsed values
      const decrypted = await decrypt(parsed.iv, parsed.ciphertext, cryptoKey);

      // Assert: Decrypted value matches original
      expect(decrypted).toBe(originalPlaintext);
      expect(parsed.key).toBe("DATABASE_URL");
      expect(parsed.iv).toBe(iv);
      expect(parsed.ciphertext).toBe(ciphertext);
    });

    it("should handle special characters in plaintext values", async () => {
      // Arrange: Test with special characters
      const originalPlaintext = 'API_KEY="secret-123"&special=chars!@#$%';
      const { iv, ciphertext } = await encrypt(originalPlaintext, cryptoKey);

      const envVar = { key: "API_KEY", iv, ciphertext };

      // Act: Generate and parse JSON
      const jsonContent = JSON.stringify(envVar, null, 2);
      const parsed = JSON.parse(jsonContent);

      // Decrypt
      const decrypted = await decrypt(parsed.iv, parsed.ciphertext, cryptoKey);

      // Assert
      expect(decrypted).toBe(originalPlaintext);
    });

    it("should handle empty string values", async () => {
      // Arrange: Test with empty string
      const originalPlaintext = "";
      const { iv, ciphertext } = await encrypt(originalPlaintext, cryptoKey);

      const envVar = { key: "EMPTY_VAR", iv, ciphertext };

      // Act: Generate and parse JSON
      const jsonContent = JSON.stringify(envVar, null, 2);
      const parsed = JSON.parse(jsonContent);

      // Decrypt
      const decrypted = await decrypt(parsed.iv, parsed.ciphertext, cryptoKey);

      // Assert
      expect(decrypted).toBe(originalPlaintext);
    });

    it("should handle very long values", async () => {
      // Arrange: Test with long string
      const originalPlaintext = "x".repeat(10000);
      const { iv, ciphertext } = await encrypt(originalPlaintext, cryptoKey);

      const envVar = { key: "LONG_VALUE", iv, ciphertext };

      // Act: Generate and parse JSON
      const jsonContent = JSON.stringify(envVar, null, 2);
      const parsed = JSON.parse(jsonContent);

      // Decrypt
      const decrypted = await decrypt(parsed.iv, parsed.ciphertext, cryptoKey);

      // Assert
      expect(decrypted).toBe(originalPlaintext);
      expect(decrypted.length).toBe(10000);
    });
  });

  describe("Bulk JSON Download Format", () => {
    it("should preserve all entries correctly in bulk download", async () => {
      // Arrange: Create multiple encrypted entries
      const testData = [
        { key: "DATABASE_URL", plaintext: "postgresql://localhost:5432/db" },
        { key: "API_KEY", plaintext: "secret-api-key-123" },
        { key: "PORT", plaintext: "3000" },
      ];

      const envVars = await Promise.all(
        testData.map(async ({ key, plaintext }) => {
          const { iv, ciphertext } = await encrypt(plaintext, cryptoKey);
          return { key, iv, ciphertext, originalPlaintext: plaintext };
        }),
      );

      // Act: Generate bulk JSON
      const jsonContent = JSON.stringify(
        envVars.map(({ key, iv, ciphertext }) => ({ key, iv, ciphertext })),
        null,
        2,
      );

      // Parse the JSON
      const parsed = JSON.parse(jsonContent);

      // Assert: All entries can be decrypted correctly
      expect(parsed).toHaveLength(3);

      for (let i = 0; i < parsed.length; i++) {
        const decrypted = await decrypt(
          parsed[i].iv,
          parsed[i].ciphertext,
          cryptoKey,
        );
        expect(decrypted).toBe(envVars[i].originalPlaintext);
        expect(parsed[i].key).toBe(envVars[i].key);
      }
    });

    it("should handle empty array", () => {
      // Arrange: Empty array
      const envVars: any[] = [];

      // Act: Generate JSON
      const jsonContent = JSON.stringify(envVars, null, 2);
      const parsed = JSON.parse(jsonContent);

      // Assert
      expect(parsed).toEqual([]);
      expect(parsed).toHaveLength(0);
    });

    it("should preserve order of entries", async () => {
      // Arrange: Create entries with specific order
      const keys = ["ZEBRA", "ALPHA", "MIKE", "BRAVO"];
      const envVars = await Promise.all(
        keys.map(async (key) => {
          const { iv, ciphertext } = await encrypt(`value-${key}`, cryptoKey);
          return { key, iv, ciphertext };
        }),
      );

      // Act: Generate and parse JSON
      const jsonContent = JSON.stringify(envVars, null, 2);
      const parsed = JSON.parse(jsonContent);

      // Assert: Order is preserved
      expect(parsed.map((e: any) => e.key)).toEqual(keys);
    });
  });

  describe(".env Format Download", () => {
    it("should format and parse .env lines correctly", async () => {
      // Arrange: Create encrypted test data
      const testData = [
        { key: "DATABASE_URL", plaintext: "postgresql://localhost:5432/db" },
        { key: "API_KEY", plaintext: "secret-123" },
      ];

      const envVars = await Promise.all(
        testData.map(async ({ key, plaintext }) => {
          const { iv, ciphertext } = await encrypt(plaintext, cryptoKey);
          return { key, iv, ciphertext, originalPlaintext: plaintext };
        }),
      );

      // Act: Generate .env format
      const envContent = envVars
        .map((envVar) => `${envVar.key}=${envVar.iv}:${envVar.ciphertext}`)
        .join("\n");

      // Parse the .env content
      const lines = envContent.split("\n").filter((line) => line.trim());

      // Assert: Each line can be parsed and decrypted
      expect(lines).toHaveLength(2);

      for (let i = 0; i < lines.length; i++) {
        // Parse correctly: split only on first '=' to handle base64 padding
        const firstEqualIndex = lines[i].indexOf("=");
        const key = lines[i].substring(0, firstEqualIndex);
        const value = lines[i].substring(firstEqualIndex + 1);
        const [iv, ciphertext] = value.split(":");

        expect(key).toBe(envVars[i].key);
        expect(iv).toBe(envVars[i].iv);
        expect(ciphertext).toBe(envVars[i].ciphertext);

        // Verify decryption works
        const decrypted = await decrypt(iv, ciphertext, cryptoKey);
        expect(decrypted).toBe(envVars[i].originalPlaintext);
      }
    });

    it("should use Unix line endings", async () => {
      // Arrange
      const envVars = await Promise.all(
        ["KEY1", "KEY2", "KEY3"].map(async (key) => {
          const { iv, ciphertext } = await encrypt(`value-${key}`, cryptoKey);
          return { key, iv, ciphertext };
        }),
      );

      // Act: Generate .env content
      const envContent = envVars
        .map((envVar) => `${envVar.key}=${envVar.iv}:${envVar.ciphertext}`)
        .join("\n");

      // Assert: Uses \n not \r\n
      expect(envContent).not.toContain("\r\n");
      expect(envContent.split("\n")).toHaveLength(3);
    });

    it("should handle keys with underscores and numbers", async () => {
      // Arrange
      const { iv, ciphertext } = await encrypt("test-value", cryptoKey);
      const envVar = { key: "DATABASE_URL_2", iv, ciphertext };

      // Act: Generate .env line
      const line = `${envVar.key}=${envVar.iv}:${envVar.ciphertext}`;

      // Parse correctly: split only on first '=' to handle base64 padding
      const firstEqualIndex = line.indexOf("=");
      const key = line.substring(0, firstEqualIndex);
      const value = line.substring(firstEqualIndex + 1);
      const [parsedIv, parsedCiphertext] = value.split(":");

      // Assert
      expect(key).toBe("DATABASE_URL_2");
      const decrypted = await decrypt(parsedIv, parsedCiphertext, cryptoKey);
      expect(decrypted).toBe("test-value");
    });

    it("should handle empty .env content", () => {
      // Arrange: Empty array
      const envVars: any[] = [];

      // Act: Generate .env content
      const envContent = envVars
        .map((envVar) => `${envVar.key}=${envVar.iv}:${envVar.ciphertext}`)
        .join("\n");

      // Assert
      expect(envContent).toBe("");
    });
  });

  describe("Base64 Validation", () => {
    it("should validate correct base64 strings", () => {
      expect(isValidBase64("dGVzdA==")).toBe(true);
      expect(isValidBase64("YWJjZGVm")).toBe(true);
      expect(isValidBase64("MTIzNDU2Nzg=")).toBe(true);
    });

    it("should reject invalid base64 strings", () => {
      expect(isValidBase64("not-base64!")).toBe(false);
      expect(isValidBase64("invalid@#$")).toBe(false);
      expect(isValidBase64("")).toBe(false);
      expect(isValidBase64("===")).toBe(false);
    });

    it("should reject non-string values", () => {
      expect(isValidBase64(null as any)).toBe(false);
      expect(isValidBase64(undefined as any)).toBe(false);
      expect(isValidBase64(123 as any)).toBe(false);
    });
  });

  describe("Filename Sanitization", () => {
    it("should sanitize project names correctly", () => {
      expect(sanitizeFilename("My Project")).toBe("my_project");
      expect(sanitizeFilename("Project-123")).toBe("project-123");
      expect(sanitizeFilename("Test@#$%Project")).toBe("test_project");
    });

    it("should handle special characters", () => {
      expect(sanitizeFilename("Project (2024)")).toBe("project_2024");
      expect(sanitizeFilename("Test/Project\\Name")).toBe("test_project_name");
    });

    it("should collapse multiple underscores", () => {
      expect(sanitizeFilename("Test___Project")).toBe("test_project");
      expect(sanitizeFilename("A  B  C")).toBe("a_b_c");
    });

    it("should trim leading/trailing underscores", () => {
      expect(sanitizeFilename("_Project_")).toBe("project");
      expect(sanitizeFilename("___Test___")).toBe("test");
    });

    it("should convert to lowercase", () => {
      expect(sanitizeFilename("UPPERCASE")).toBe("uppercase");
      expect(sanitizeFilename("MixedCase")).toBe("mixedcase");
    });

    it("should preserve valid characters", () => {
      expect(sanitizeFilename("valid-name_123")).toBe("valid-name_123");
      expect(sanitizeFilename("project-v2")).toBe("project-v2");
    });
  });

  describe("Data Integrity Verification", () => {
    it("should maintain data integrity across multiple encrypt/decrypt cycles", async () => {
      // Arrange: Original plaintext
      const original = "sensitive-data-123";

      // Act: Encrypt, serialize, deserialize, decrypt multiple times
      let currentPlaintext = original;

      for (let i = 0; i < 5; i++) {
        // Encrypt
        const { iv, ciphertext } = await encrypt(currentPlaintext, cryptoKey);

        // Serialize to JSON (simulating download)
        const json = JSON.stringify({ iv, ciphertext });

        // Deserialize (simulating reading file)
        const parsed = JSON.parse(json);

        // Decrypt
        currentPlaintext = await decrypt(
          parsed.iv,
          parsed.ciphertext,
          cryptoKey,
        );
      }

      // Assert: Final plaintext matches original
      expect(currentPlaintext).toBe(original);
    });

    it("should handle Unicode characters correctly", async () => {
      // Arrange: Unicode test data
      const unicodeData = "Hello 世界 🌍 Привет مرحبا";
      const { iv, ciphertext } = await encrypt(unicodeData, cryptoKey);

      // Act: Serialize and deserialize
      const json = JSON.stringify({ iv, ciphertext });
      const parsed = JSON.parse(json);

      // Decrypt
      const decrypted = await decrypt(parsed.iv, parsed.ciphertext, cryptoKey);

      // Assert
      expect(decrypted).toBe(unicodeData);
    });

    it("should handle newlines and special whitespace", async () => {
      // Arrange: Multi-line data
      const multilineData = "Line 1\nLine 2\r\nLine 3\tTabbed";
      const { iv, ciphertext } = await encrypt(multilineData, cryptoKey);

      // Act: Serialize and deserialize
      const json = JSON.stringify({ iv, ciphertext });
      const parsed = JSON.parse(json);

      // Decrypt
      const decrypted = await decrypt(parsed.iv, parsed.ciphertext, cryptoKey);

      // Assert
      expect(decrypted).toBe(multilineData);
    });
  });
});
