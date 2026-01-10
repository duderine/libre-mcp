#!/usr/bin/env -S node --experimental-specifier-resolution=node --experimental-strip-types --experimental-transform-types --no-warnings
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { setupPermissions } from './setup-permissions.ts';
import { initializeRoles } from './init-roles.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_SOURCE = join(__dirname, '../config/librechat.yaml');
const CONFIG_TARGET = '/app/config/librechat.yaml';
const CONFIG_DIR = '/app/config';

/**
 * Convert $${VAR} placeholders to ${VAR} so LibreChat can resolve them at runtime.
 * Docker Compose escapes ${VAR} to $${VAR} in YAML files, so we need to convert them back.
 */
function resolveConfigPlaceholders(content: string): string {
  // Convert all $${VAR} to ${VAR} - LibreChat will resolve them at runtime
  return content.replace(/\$\$\{([^}]+)\}/g, '${$1}');
}

async function main() {
  console.log('=========================================');
  console.log('LibreChat Initialization Started');
  console.log('=========================================\n');

  try {
    // Task 1: Copy LibreChat config and resolve placeholders
    console.log('[1/3] Setting up LibreChat configuration...');
    if (existsSync(CONFIG_SOURCE)) {
      // Ensure target directory exists (named volumes are empty by default)
      if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
        console.log('✓ Created config directory');
      }

      // Read source config
      const sourceContent = readFileSync(CONFIG_SOURCE, 'utf-8');
      
      // Resolve environment variable placeholders
      const resolvedContent = resolveConfigPlaceholders(sourceContent);
      
      // Write resolved config to target
      writeFileSync(CONFIG_TARGET, resolvedContent, 'utf-8');
      console.log('✓ Config copied and placeholders resolved successfully');
    } else {
      throw new Error(`Config file not found: ${CONFIG_SOURCE}`);
    }

    // Task 2: Setup file permissions
    console.log('\n[2/3] Setting up file permissions...');
    await setupPermissions();

    // Task 3: Initialize MongoDB roles
    console.log('\n[3/3] Initializing MongoDB roles...');
    await initializeRoles();

    console.log('\n=========================================');
    console.log('✓ LibreChat Initialization Completed');
    console.log('=========================================');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Initialization failed:', error);
    process.exit(1);
  }
}

main();
