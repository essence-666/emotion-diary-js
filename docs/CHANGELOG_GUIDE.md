# Changelog Tools - Quick Reference

This project includes automated tools for managing the CHANGELOG.md file following the [Keep a Changelog](https://keepachangelog.com/) format and [Semantic Versioning](https://semver.org/) principles.

## Available Commands

### 1. Generate New Entry

Interactively add a new changelog entry:

```bash
npm run changelog:generate
```

**What it does:**
- Prompts you to select change type (Added, Changed, Fixed, etc.)
- Asks for a description
- Automatically adds the entry to the [Unreleased] section in CHANGELOG.md

**Example workflow:**
```
$ npm run changelog:generate

📝 Changelog Entry Generator

Select change type:
  1. Added
  2. Changed
  3. Deprecated
  4. Removed
  5. Fixed
  6. Security

Enter type number (1-6): 1
Enter change description: Virtual pet animation system
✅ Added to Added: Virtual pet animation system
```

### 2. View Recent Changes

View all unreleased changes:

```bash
npm run changelog:view
```

**What it does:**
- Displays the [Unreleased] section from CHANGELOG.md
- Useful before committing or cutting a release

### 3. Validate Format

Check if CHANGELOG.md follows the correct format:

```bash
npm run changelog:validate
```

**What it does:**
- Verifies required sections exist
- Checks for proper headers and structure
- Reports any format issues

### 4. Prepare Release

Prepare changelog for a new version release:

```bash
npm run changelog:release
```

**What it does:**
- Reads current version from package.json
- Prompts for new version number
- Converts [Unreleased] section to a versioned release
- Adds new empty [Unreleased] section
- Provides git commands for tagging

**Example workflow:**
```
$ npm run changelog:release

🚀 Prepare Changelog for Release

Current version: 1.1.4
Enter new version (or press Enter to use current): 1.2.0
✅ Changelog prepared for version 1.2.0

Next steps:
  1. Update package.json version to 1.2.0
  2. Commit: git commit -m "Release version 1.2.0"
  3. Tag: git tag -a v1.2.0 -m "Version 1.2.0"
  4. Push: git push && git push --tags
```

### 5. Help

Show all available commands:

```bash
npm run changelog:help
```

---

## Change Type Categories

When adding entries, use these standard categories:

| Category | Usage | Examples |
|----------|-------|----------|
| **Added** | New features, functionality | "Dark mode toggle", "Export to PDF" |
| **Changed** | Changes to existing features | "Updated button styling", "Improved error messages" |
| **Deprecated** | Features marked for removal | "Deprecated legacy auth API" |
| **Removed** | Removed features | "Removed support for IE11" |
| **Fixed** | Bug fixes | "Fixed login redirect loop", "Resolved memory leak" |
| **Security** | Security improvements | "Updated dependencies for CVE-2024-1234" |

---

## Semantic Versioning Guide

Use this guide when deciding version numbers:

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR** (X.0.0) - Breaking changes, incompatible API changes
  - Example: `1.5.2` → `2.0.0` (removed deprecated API)

- **MINOR** (x.X.0) - New features, backwards-compatible
  - Example: `1.5.2` → `1.6.0` (added pet customization)

- **PATCH** (x.x.X) - Bug fixes, backwards-compatible
  - Example: `1.5.2` → `1.5.3` (fixed login bug)

### When to Bump

```
Bug fix only → PATCH
New feature → MINOR
Breaking change → MAJOR
Security fix → PATCH (or MINOR if adds new security feature)
```

---

## Manual Editing

You can also manually edit CHANGELOG.md. The format is:

```markdown
## [Unreleased]

### Added
- New feature description
- Another feature

### Fixed
- Bug fix description

## [1.2.0] - 2025-11-22

### Added
- Previous release features
```

---

## Workflow Examples

### Daily Development

1. Make code changes
2. Run `npm run changelog:generate` to document changes
3. Commit code + changelog together

```bash
# Work on feature
git add src/components/NewFeature.tsx

# Add changelog entry
npm run changelog:generate
# Select "1. Added" → "NewFeature component with animations"

# Commit together
git add CHANGELOG.md
git commit -m "Add NewFeature component with animations"
```

### Before Release

1. Review unreleased changes: `npm run changelog:view`
2. Prepare release: `npm run changelog:release`
3. Update package.json version
4. Commit and tag

```bash
# Review changes
npm run changelog:view

# Prepare changelog for 1.2.0
npm run changelog:release
# Enter version: 1.2.0

# Update package.json (manually or with npm version)
npm version 1.2.0 --no-git-tag-version

# Commit and tag
git add CHANGELOG.md package.json
git commit -m "Release version 1.2.0"
git tag -a v1.2.0 -m "Version 1.2.0"
git push && git push --tags
```

---

## Best Practices

1. **Document as you go** - Add changelog entries with each commit
2. **Be descriptive** - Write clear, user-focused descriptions
3. **Group related changes** - Multiple commits can share a changelog entry
4. **Keep it sorted** - Within each category, newest entries go first
5. **Reference issues** - Link to GitHub issues when relevant: "Fixed login bug (#123)"

---

## Troubleshooting

**Q: The script says "CHANGELOG.md not found"**
A: Make sure you're running the command from the project root directory.

**Q: How do I undo a changelog entry?**
A: Manually edit CHANGELOG.md to remove or modify the entry.

**Q: Can I add multiple entries at once?**
A: Run `npm run changelog:generate` multiple times, or manually edit CHANGELOG.md.

**Q: What if I forget to add a changelog entry before committing?**
A: You can add it in a follow-up commit, or amend your previous commit:
```bash
npm run changelog:generate
git add CHANGELOG.md
git commit --amend --no-edit
```

---

## Additional Resources

- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) - Changelog format guide
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html) - Version numbering guide
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message format (optional)

---

**For more information, see [CHANGELOG.md](../CHANGELOG.md)**
