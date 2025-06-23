# Steps to Publish Clean Version Without .env Files

## 1. Verify Current Setup
```bash
# Test that .env files are excluded
npm pack --dry-run | grep -E "\.env" || echo "✅ No .env files in package"

# Verify package contents
npm pack --dry-run
```

## 2. Bump Version (if needed)
```bash
# Option A: Patch version (2.0.24 → 2.0.25)
npm version patch

# Option B: Minor version (2.0.24 → 2.1.0) 
npm version minor

# Option C: Manual version update in package.json
```

## 3. Build and Publish
```bash
# Clean build
npm run build:npm

# Compile Deno CLI
deno compile --allow-read --allow-write --allow-env --allow-net --allow-run --no-check src/cli/cli.ts -o cli

# Publish to npm
npm publish

# Or for beta testing first
npm publish --tag beta
```

## 4. Deprecate Problematic Versions

### Check Current Versions
```bash
npm view @agentics.org/sparc2 versions --json
```

### Deprecate Specific Versions with .env Files
```bash
# Replace X.X.X with actual version numbers that contain .env files
npm deprecate @agentics.org/sparc2@X.X.X "Contains environment files - use latest version"

# Example if versions 2.0.20-2.0.23 have .env files:
npm deprecate @agentics.org/sparc2@2.0.20 "Contains environment files - use latest version"
npm deprecate @agentics.org/sparc2@2.0.21 "Contains environment files - use latest version" 
npm deprecate @agentics.org/sparc2@2.0.22 "Contains environment files - use latest version"
npm deprecate @agentics.org/sparc2@2.0.23 "Contains environment files - use latest version"
```

### Bulk Deprecate Range (if needed)
```bash
# For deprecating multiple versions at once
npm deprecate "@agentics.org/sparc2@>=2.0.20 <2.0.24" "Contains environment files - use v2.0.24 or later"
```

## 5. Verify Clean Publication
```bash
# Download and inspect the published package
npm pack @agentics.org/sparc2@latest
tar -tzf agentics.org-sparc2-*.tgz | grep -E "\.env" || echo "✅ Clean package confirmed"
```

## 6. Update Documentation
- Update README.md if needed
- Add security note about not including .env files
- Update CHANGELOG.md with the fix

## Important Notes
- **Never use `npm unpublish`** for published versions (only works within 72 hours and breaks dependencies)
- **Use `npm deprecate`** instead to warn users about problematic versions
- **Test with `--tag beta`** first if you want to verify before making it the latest
- **The .npmignore and package.json changes** ensure future publications won't include .env files

## Emergency: If Current Version Has .env Files
```bash
# If 2.0.24 also has .env files, deprecate it immediately
npm deprecate @agentics.org/sparc2@2.0.24 "Contains environment files - use latest version"

# Then publish fixed version
npm version patch  # Will become 2.0.25
npm publish
```