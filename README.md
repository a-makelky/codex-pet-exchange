# Codex Pet Exchange

Public registry for custom Codex desktop pets.

Live gallery:

```text
https://aaronmakelky.com/tools/codex-pets
```

Each pet is a small folder that can be installed into:

```text
~/.codex/pets/<pet-id>/
```

The required files are:

```text
<pet-id>/
├── pet.json
└── spritesheet.webp
```

## Install A Pet

Download a `*-codex-pet.zip` file, leave it in Downloads, then run:

```bash
mkdir -p ~/.codex/pets
ditto -x -k ~/Downloads/mongol-command-codex-pet.zip ~/.codex/pets
test -f ~/.codex/pets/mongol-command/pet.json && echo "Installed custom:mongol-command"
```

Restart Codex after installing. The pet ID will be:

```text
custom:mongol-command
```

## Pet Contract

`pet.json`:

```json
{
  "id": "mongol-command",
  "displayName": "Mongol Command",
  "description": "A short description.",
  "spritesheetPath": "spritesheet.webp"
}
```

Spritesheet:

- Format: PNG or WebP.
- Dimensions: `1536x1872`.
- Grid: `8` columns x `9` rows.
- Cell size: `192x208`.
- Transparent background.
- Unused cells fully transparent.

## Add A Pet

1. Create a folder under `pets/<pet-id>/`.
2. Add `pet.json`.
3. Add `spritesheet.webp` or `spritesheet.png`.
4. Add a clean zip named `<pet-id>-codex-pet.zip`.
5. Add an entry to `registry.json`.
6. Run validation:

```bash
npm install
npm run validate
```

Open a pull request when validation passes.
