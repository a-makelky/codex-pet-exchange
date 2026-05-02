import AdmZip from 'adm-zip';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const registryPath = path.join(root, 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const requiredManifestFields = ['id', 'displayName', 'description', 'spritesheetPath'];
const errors = [];

const fail = (message) => errors.push(message);

const assertFile = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${label}: ${path.relative(root, filePath)}`);
    return false;
  }

  return true;
};

if (!Array.isArray(registry.pets)) {
  fail('registry.json must include a pets array');
}

for (const pet of registry.pets || []) {
  const petDir = path.join(root, pet.repoPath || `pets/${pet.id}`);
  const manifestPath = path.join(petDir, 'pet.json');

  if (!pet.id) {
    fail('Registry pet is missing id');
    continue;
  }

  if (!assertFile(manifestPath, `${pet.id} manifest`)) {
    continue;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const field of requiredManifestFields) {
    if (!manifest[field]) {
      fail(`${pet.id} pet.json missing ${field}`);
    }
  }

  if (manifest.id !== pet.id) {
    fail(`${pet.id} registry id does not match pet.json id ${manifest.id}`);
  }

  if (path.basename(petDir) !== pet.id) {
    fail(`${pet.id} folder name must match id`);
  }

  const spritesheetPath = path.join(petDir, manifest.spritesheetPath || '');
  if (assertFile(spritesheetPath, `${pet.id} spritesheet`)) {
    const metadata = await sharp(spritesheetPath).metadata();
    if (!['webp', 'png'].includes(metadata.format)) {
      fail(`${pet.id} spritesheet must be PNG or WebP`);
    }

    if (metadata.width !== 1536 || metadata.height !== 1872) {
      fail(`${pet.id} spritesheet must be 1536x1872, got ${metadata.width}x${metadata.height}`);
    }

    if (!metadata.hasAlpha) {
      fail(`${pet.id} spritesheet must include an alpha channel`);
    }
  }

  if (pet.contactSheetUrl) {
    assertFile(path.join(petDir, 'contact-sheet.png'), `${pet.id} contact sheet`);
  }

  const zipPath = path.join(petDir, `${pet.id}-codex-pet.zip`);
  if (assertFile(zipPath, `${pet.id} zip`)) {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries().map((entry) => entry.entryName);
    const expectedManifest = `${pet.id}/pet.json`;
    const expectedSpritesheet = `${pet.id}/${manifest.spritesheetPath}`;

    if (!entries.includes(expectedManifest)) {
      fail(`${pet.id} zip missing ${expectedManifest}`);
    }

    if (!entries.includes(expectedSpritesheet)) {
      fail(`${pet.id} zip missing ${expectedSpritesheet}`);
    }

    for (const entry of entries) {
      if (entry.startsWith('__MACOSX/') || entry.includes('/._')) {
        fail(`${pet.id} zip contains macOS resource fork noise: ${entry}`);
      }

      if (!entry.startsWith(`${pet.id}/`)) {
        fail(`${pet.id} zip entry must stay under top-level folder: ${entry}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Validated ${registry.pets.length} Codex pet package(s).`);
