#!/usr/bin/env node

/**
 * Changelog Management Script
 *
 * This script helps generate and manage CHANGELOG.md entries following
 * the Keep a Changelog format.
 *
 * Usage:
 *   node scripts/changelog.js generate    - Generate new changelog entry
 *   node scripts/changelog.js view        - View recent changes
 *   node scripts/changelog.js validate    - Validate changelog format
 *   node scripts/changelog.js release     - Prepare changelog for release
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md')
const PACKAGE_PATH = path.join(__dirname, '..', 'package.json')

const CHANGE_TYPES = {
  1: 'Added',
  2: 'Changed',
  3: 'Deprecated',
  4: 'Removed',
  5: 'Fixed',
  6: 'Security',
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

/**
 * Prompt user for input
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

/**
 * Read the current changelog
 */
function readChangelog() {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    console.error('❌ CHANGELOG.md not found!')
    process.exit(1)
  }
  return fs.readFileSync(CHANGELOG_PATH, 'utf8')
}

/**
 * Read package.json
 */
function readPackageJson() {
  if (!fs.existsSync(PACKAGE_PATH)) {
    console.error('❌ package.json not found!')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'))
}

/**
 * Write updated changelog
 */
function writeChangelog(content) {
  fs.writeFileSync(CHANGELOG_PATH, content, 'utf8')
  console.log('✅ CHANGELOG.md updated successfully!')
}

/**
 * Generate a new changelog entry
 */
async function generateEntry() {
  console.log('\n📝 Changelog Entry Generator\n')
  console.log('Select change type:')
  Object.entries(CHANGE_TYPES).forEach(([key, value]) => {
    console.log(`  ${key}. ${value}`)
  })
  console.log()

  const typeChoice = await prompt('Enter type number (1-6): ')
  const changeType = CHANGE_TYPES[typeChoice]

  if (!changeType) {
    console.error('❌ Invalid change type!')
    rl.close()
    return
  }

  const description = await prompt('Enter change description: ')

  if (!description) {
    console.error('❌ Description cannot be empty!')
    rl.close()
    return
  }

  // Read current changelog
  let changelog = readChangelog()

  // Find the [Unreleased] section
  const unreleasedRegex = /## \[Unreleased\]([\s\S]*?)(?=\n## |$)/
  const match = changelog.match(unreleasedRegex)

  if (!match) {
    console.error('❌ Could not find [Unreleased] section in CHANGELOG.md')
    rl.close()
    return
  }

  let unreleasedSection = match[0]

  // Check if the change type section exists
  const typeRegex = new RegExp(`### ${changeType}\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`)
  const typeMatch = unreleasedSection.match(typeRegex)

  if (typeMatch) {
    // Section exists, add entry
    const sectionContent = typeMatch[1]
    const newEntry = `- ${description}\n`
    const updatedSection = typeMatch[0] + newEntry
    unreleasedSection = unreleasedSection.replace(typeRegex, updatedSection)
  } else {
    // Section doesn't exist, create it
    // Insert after the [Unreleased] header
    const headerRegex = /## \[Unreleased\]\n/
    const newSection = `\n### ${changeType}\n- ${description}\n`
    unreleasedSection = unreleasedSection.replace(headerRegex, `## [Unreleased]\n${newSection}`)
  }

  // Replace in full changelog
  changelog = changelog.replace(unreleasedRegex, unreleasedSection)

  // Write updated changelog
  writeChangelog(changelog)

  console.log(`\n✅ Added to ${changeType}: ${description}`)
  rl.close()
}

/**
 * View recent changes from [Unreleased] section
 */
function viewRecent() {
  const changelog = readChangelog()

  const unreleasedRegex = /## \[Unreleased\]([\s\S]*?)(?=\n## |$)/
  const match = changelog.match(unreleasedRegex)

  if (!match) {
    console.log('❌ No unreleased changes found')
    return
  }

  console.log('\n📋 Recent Changes (Unreleased):\n')
  console.log(match[0].trim())
  console.log()
}

/**
 * Validate changelog format
 */
function validate() {
  console.log('🔍 Validating CHANGELOG.md format...\n')

  const changelog = readChangelog()
  let isValid = true
  const errors = []

  // Check for required sections
  if (!changelog.includes('# Changelog')) {
    errors.push('❌ Missing main "# Changelog" header')
    isValid = false
  }

  if (!changelog.includes('## [Unreleased]')) {
    errors.push('❌ Missing "## [Unreleased]" section')
    isValid = false
  }

  // Check for Keep a Changelog link
  if (!changelog.includes('Keep a Changelog')) {
    errors.push('⚠️  Missing reference to Keep a Changelog')
  }

  // Check for Semantic Versioning link
  if (!changelog.includes('Semantic Versioning')) {
    errors.push('⚠️  Missing reference to Semantic Versioning')
  }

  if (isValid && errors.length === 0) {
    console.log('✅ Changelog format is valid!\n')
  } else {
    console.log('⚠️  Validation completed with issues:\n')
    errors.forEach(error => console.log(error))
    console.log()
  }

  return isValid
}

/**
 * Prepare changelog for release
 */
async function prepareRelease() {
  console.log('\n🚀 Prepare Changelog for Release\n')

  // Read package.json to get current version
  const pkg = readPackageJson()
  const currentVersion = pkg.version

  console.log(`Current version: ${currentVersion}`)
  const newVersion = await prompt('Enter new version (or press Enter to use current): ')
  const versionToUse = newVersion || currentVersion

  // Validate version format
  if (!/^\d+\.\d+\.\d+$/.test(versionToUse)) {
    console.error('❌ Invalid version format! Use X.Y.Z (e.g., 1.2.3)')
    rl.close()
    return
  }

  // Get current date
  const today = new Date().toISOString().split('T')[0]

  // Read changelog
  let changelog = readChangelog()

  // Check if there are unreleased changes
  const unreleasedRegex = /## \[Unreleased\]([\s\S]*?)(?=\n## |$)/
  const match = changelog.match(unreleasedRegex)

  if (!match || match[1].trim().length === 0) {
    console.log('⚠️  No unreleased changes found. Nothing to release.')
    rl.close()
    return
  }

  // Replace [Unreleased] with version and date
  const releasedSection = match[0].replace(
    '## [Unreleased]',
    `## [${versionToUse}] - ${today}`
  )

  // Add new [Unreleased] section
  const newUnreleased = `## [Unreleased]

### Added
-

### Changed
-

### Fixed
-

`

  changelog = changelog.replace(
    unreleasedRegex,
    newUnreleased + '\n' + releasedSection
  )

  // Update version history if it exists
  const historyRegex = /## Version History[\s\S]*?(?=\n## |$)/
  if (historyRegex.test(changelog)) {
    const historyMatch = changelog.match(historyRegex)
    const newHistoryEntry = `- **[${versionToUse}]** - ${today} - Release notes\n`
    const updatedHistory = historyMatch[0].replace(
      /(## Version History\n)/,
      `$1\n${newHistoryEntry}`
    )
    changelog = changelog.replace(historyRegex, updatedHistory)
  }

  // Write updated changelog
  writeChangelog(changelog)

  console.log(`\n✅ Changelog prepared for version ${versionToUse}`)
  console.log('Next steps:')
  console.log(`  1. Update package.json version to ${versionToUse}`)
  console.log(`  2. Commit: git commit -m "Release version ${versionToUse}"`)
  console.log(`  3. Tag: git tag -a v${versionToUse} -m "Version ${versionToUse}"`)
  console.log(`  4. Push: git push && git push --tags`)

  rl.close()
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
📝 Changelog Management Tool

Usage:
  node scripts/changelog.js <command>

Commands:
  generate    Generate a new changelog entry interactively
  view        View recent unreleased changes
  validate    Validate changelog format
  release     Prepare changelog for release (version bump)
  help        Show this help message

Examples:
  node scripts/changelog.js generate
  node scripts/changelog.js view
  node scripts/changelog.js validate
  node scripts/changelog.js release
`)
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'generate':
      await generateEntry()
      break
    case 'view':
      viewRecent()
      break
    case 'validate':
      validate()
      break
    case 'release':
      await prepareRelease()
      break
    case 'help':
    case undefined:
      showHelp()
      break
    default:
      console.error(`❌ Unknown command: ${command}`)
      showHelp()
      process.exit(1)
  }
}

// Run main function
main().catch((error) => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
