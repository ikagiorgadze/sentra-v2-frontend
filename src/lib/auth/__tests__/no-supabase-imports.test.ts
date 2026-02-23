import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function collectSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('supabase removal', () => {
  it('has no supabase imports or auth calls in src', () => {
    const srcRoot = path.resolve(process.cwd(), 'src');
    const files = collectSourceFiles(srcRoot);
    const disallowedPatterns = ['@supabase/supabase-js', '@/integrations/supabase/client', 'supabase.auth'];
    const violations: string[] = [];

    for (const filePath of files) {
      if (filePath.endsWith('no-supabase-imports.test.ts')) {
        continue;
      }
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of disallowedPatterns) {
        if (content.includes(pattern)) {
          violations.push(`${path.relative(srcRoot, filePath)} -> ${pattern}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
