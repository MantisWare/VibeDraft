# 🚀 Release Guide

This document outlines the release process for VibeDraft CLI.

## Quick Release (Recommended)

For most releases (bug fixes, small improvements):

```bash
npm run release
```

This will:
1. Run linting and tests
2. Bump patch version (e.g., 1.0.0 → 1.0.1)
3. Create a git commit and tag
4. Push to remote repository
5. Publish to npm

## Version Types

### Patch Release (1.0.0 → 1.0.1)
Use for bug fixes and minor improvements:
```bash
npm run release:patch
npm run publish:npm
```

### Minor Release (1.0.0 → 1.1.0)
Use for new features (backward compatible):
```bash
npm run release:minor
npm run publish:npm
```

### Major Release (1.0.0 → 2.0.0)
Use for breaking changes:
```bash
npm run release:major
npm run publish:npm
```

## Pre-Release Checklist

Before running any release command:

- [ ] All tests passing (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] CHANGELOG.md is updated
- [ ] README.md reflects latest changes
- [ ] All changes are committed
- [ ] Working on the correct branch (usually `main`)

## Release Workflow Details

### What Happens

1. **`preversion` hook**
   - Runs `npm run lint:check` (linting without autofix)
   - Runs `npm test` (all test suites)
   - If either fails, version bump is aborted

2. **`version` hook**
   - Runs `npm run lint` (autofix any style issues)
   - Stages all changes with `git add -A`

3. **Version bump**
   - Updates version in `package.json`
   - Creates git commit: "Release vX.X.X"
   - Creates git tag: "vX.X.X"

4. **`postversion` hook**
   - Pushes commit: `git push`
   - Pushes tags: `git push --tags`

5. **Publishing** (when running `npm run publish:npm`)
   - Runs `prepublishOnly` hook (final lint and test)
   - Publishes to npm registry

## Manual Process

If you prefer more control:

```bash
# 1. Test everything
npm run lint:check
npm test

# 2. Bump version manually
npm version patch  # or minor, or major

# 3. Publish
npm publish
```

## Troubleshooting

### Tests fail during pre-version
```bash
# Fix the tests first
npm test

# Then try release again
npm run release
```

### Linting fails
```bash
# Auto-fix linting issues
npm run lint

# Check for remaining issues
npm run lint:check

# Then try release again
npm run release
```

### Git push fails
```bash
# Ensure you're on the right branch
git status

# Ensure you have remote set up
git remote -v

# Try pushing manually
git push origin main
git push --tags
```

### NPM publish fails
```bash
# Ensure you're logged in
npm whoami

# If not logged in
npm login

# Try publishing manually
npm publish
```

### Need to undo a version bump
```bash
# If you haven't pushed yet
git reset --hard HEAD~1
git tag -d vX.X.X  # Replace with actual tag

# If you have pushed
# Create a new patch version with the fix
npm run release:patch
```

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): New features, backward compatible
- **PATCH** version (0.0.X): Bug fixes, backward compatible

### Examples

- Bug fix: `1.2.3` → `1.2.4` (patch)
- New command: `1.2.4` → `1.3.0` (minor)
- Breaking change: `1.3.0` → `2.0.0` (major)

## Best Practices

1. **Always update CHANGELOG.md** before releasing
2. **Test in a real project** before releasing
3. **Use patch for most releases** (bug fixes, docs, minor improvements)
4. **Save minor for feature additions** that users will notice
5. **Reserve major for breaking changes** that require user action
6. **Tag releases with meaningful names** (automatic via scripts)
7. **Push immediately after versioning** to avoid conflicts

## CI/CD Integration

If you have GitHub Actions or other CI/CD:

```yaml
# .github/workflows/publish.yml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run lint:check
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Release Schedule

- **Patch releases**: As needed for bug fixes
- **Minor releases**: Monthly or when significant features are ready
- **Major releases**: Quarterly or when breaking changes are necessary

## Questions?

See the [Contributing Guide](./CONTRIBUTING.md) or open an issue on GitHub.

---

**Remember**: A good release is a tested release! 🎉

