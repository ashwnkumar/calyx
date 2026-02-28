# Encrypted .env Format Specification

## Overview

The encrypted .env format allows users to download environment variables in a format similar to standard .env files, but with encrypted values. This format is designed for backup, migration, and use with custom decryption scripts.

## Format Specification

### Line Format

Each line follows the pattern:

```
KEY=iv:ciphertext
```

Where:

- `KEY` - The plaintext environment variable name (e.g., `DATABASE_URL`)
- `iv` - Base64-encoded initialization vector (12 bytes)
- `ciphertext` - Base64-encoded AES-GCM ciphertext

### Example

```env
DATABASE_URL=DBkZOETNjbcLUqkt:rq6kDC3AJtG7Sq0rSX+UlviWTi5rIMF6f7OjxTyBidGdZw==
API_KEY=YWJjZGVmZ2hpams=:MTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6
PORT=aXYxMjM0NTY3OA==:Y2lwaGVydGV4dDEyMzQ1Njc4OTA=
```

## Critical Parsing Requirement

### The Base64 Padding Problem

Base64 strings can contain `=` characters as padding. This creates a parsing challenge because the format uses `=` to separate the key from the value.

**INCORRECT PARSING** (will truncate base64 padding):

```typescript
const [key, value] = line.split("="); // ❌ WRONG - splits on ALL '=' characters
```

**CORRECT PARSING** (preserves base64 padding):

```typescript
const firstEqualIndex = line.indexOf("=");
const key = line.substring(0, firstEqualIndex);
const value = line.substring(firstEqualIndex + 1);
const [iv, ciphertext] = value.split(":");
```

### Why This Matters

Consider this line:

```
API_KEY=dGVzdGl2MTI==:Y2lwaGVydGV4dDEyMw==
```

- **Incorrect parsing**: `split("=")` produces `["API_KEY", "dGVzdGl2MTI", "", "Y2lwaGVydGV4dDEyMw", ""]`
- **Correct parsing**: Split only on first `=`, then split value on `:`
  - Key: `API_KEY`
  - IV: `dGVzdGl2MTI==`
  - Ciphertext: `Y2lwaGVydGV4dDEyMw==`

## File Characteristics

- **Encoding**: UTF-8
- **Line endings**: Unix style (`\n`)
- **Comments**: Lines starting with `#` should be skipped
- **Empty lines**: Should be skipped
- **Filename pattern**: `{project_name}_encrypted.env`

## Decryption Process

To decrypt values from an encrypted .env file:

1. Parse the file using the correct parsing method (see above)
2. For each entry:
   - Extract the `iv` and `ciphertext` (both base64-encoded)
   - Decode from base64 to binary
   - Use AES-GCM-256 decryption with the user's derived key
   - The result is the plaintext environment variable value

## Security Considerations

- The encrypted .env file contains only encrypted data - no plaintext values
- The file can be safely stored in version control or backups
- Decryption requires the user's passphrase (used to derive the AES key)
- Each value has a unique IV (never reused)
- The format maintains zero-knowledge security - the server never sees plaintext

## Parser Implementation

A reference parser implementation is available in `lib/parsers/encrypted-env-parser.ts`:

```typescript
import { parseEncryptedEnvContent } from "@/lib/parsers/encrypted-env-parser";

const fileContent = `
DATABASE_URL=DBkZOETNjbcLUqkt:rq6kDC3AJtG7Sq0rSX+UlviWTi5rIMF6f7OjxTyBidGdZw==
API_KEY=YWJjZGVmZ2hpams=:MTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6
`;

const entries = parseEncryptedEnvContent(fileContent);
// [
//   { key: 'DATABASE_URL', iv: 'DBkZOETNjbcLUqkt', ciphertext: 'rq6kDC3AJtG7Sq0rSX+UlviWTi5rIMF6f7OjxTyBidGdZw==' },
//   { key: 'API_KEY', iv: 'YWJjZGVmZ2hpams=', ciphertext: 'MTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6' }
// ]
```

## Validation

Before attempting decryption, validate that the IV and ciphertext are valid base64:

```typescript
import { isValidEncryptedEntry } from "@/lib/parsers/encrypted-env-parser";

const entry = { key: "API_KEY", iv: "dGVzdA==", ciphertext: "Y2lwaGVy" };
if (isValidEncryptedEntry(entry)) {
  // Safe to attempt decryption
}
```

## Round-Trip Verification

The format has been verified to maintain data integrity through the complete cycle:

1. Encrypt plaintext → Generate encrypted .env file
2. Parse encrypted .env file → Extract iv and ciphertext
3. Decrypt with correct key → Recover original plaintext

All tests pass, confirming that:

- Base64 padding is preserved correctly
- No data loss occurs during serialization/deserialization
- Unicode characters are handled correctly
- Special characters and whitespace are preserved
- Very long values (10,000+ characters) work correctly

See `lib/download-utils.test.ts` for comprehensive verification tests.
