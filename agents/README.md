# AI Agents & Workflows

This directory contains AI workflows and agent-specific configurations for the Traditional Knowledge system.

## Directory Structure

```
agents/
├── README.md              (this file)
├── templates/             (reusable code templates)
│   ├── backend/           (model, controller, policy, services, serializers)
│   └── frontend/          (api-client, composables, components, pages, searchable-autocomplete)
├── workflows/             (multi-step task guides)
│   ├── create-admin-ui.md
│   ├── jira-issue-management.md
│   ├── code-review.md
│   ├── testing-instructions.md
│   └── pull-request-management.md
├── plans/                 (implementation plans for complex refactoring work)
│   ├── README.md          (planning guidelines and structure)
│   └── Plan, Vue Component Expansion Panels Refactor, 2026-02-03.md
├── claude/               (optional - Claude-specific hardlinks)
│   └── workflows/
├── windsurf/             (optional - Windsurf-specific hardlinks)
│   └── workflows/
└── cursor/               (optional - Cursor-specific hardlinks)
    └── workflows/
```

---

## Templates vs Workflows vs Plans

**Templates** are copy-paste-ready code snippets for specific file types. Use when you know exactly what you need.

**Workflows** are multi-step guides that orchestrate multiple templates. Use when building complete features.

**Plans** are implementation planning documents for complex refactoring work, architectural decisions, and cross-team analysis. Use when implementation requires analysis, multiple options, or detailed planning.

### Templates (`agents/templates/`)

Reusable code patterns organized by layer:

**Backend:**
- [model.md](templates/backend/model.md) - Sequelize model with scopes
- [controller.md](templates/backend/controller.md) - CRUD controller
- [policy.md](templates/backend/policy.md) - Authorization rules
- [services.md](templates/backend/services.md) - Create, Update, Destroy
- [serializers.md](templates/backend/serializers.md) - Index, Show, Reference

**Frontend:**
- [api-client.md](templates/frontend/api-client.md) - Type-safe HTTP client
- [composables.md](templates/frontend/composables.md) - Reactive data fetching
- [components.md](templates/frontend/components.md) - DataTable, Forms, UniqueTextField
- [pages.md](templates/frontend/pages.md) - List, New, Edit pages
- [searchable-autocomplete.md](templates/frontend/searchable-autocomplete.md) - Debounced search component

### Workflows (`agents/workflows/`)

Multi-step task guides:

- [create-admin-ui.md](workflows/create-admin-ui.md) - Full CRUD admin UI (references templates)
- [jira-issue-management.md](workflows/jira-issue-management.md) - Create, enhance, and manage Jira issues
- [code-review.md](workflows/code-review.md) - Code review quality control
- [testing-instructions.md](workflows/testing-instructions.md) - Comprehensive testing instructions for PRs
- [pull-request-management.md](workflows/pull-request-management.md) - Create and manage PRs

### Plans (`agents/plans/`)

Implementation planning documents:

- [README.md](plans/README.md) - Planning guidelines, structure, and TK-specific patterns
- [Plan, Vue Component Expansion Panels Refactor, 2026-02-03.md](plans/Plan, Vue Component Expansion Panels Refactor, 2026-02-03.md) - Vue component refactoring from layout to named slots

**When to use Plans:**
- Complex architectural refactoring
- Multiple implementation options to analyze
- Cross-team coordination requirements
- Cultural protocol considerations for Traditional Knowledge
- Performance or security implications

---

## Using Templates, Workflows, and Plans with AI Assistants

### Method 1: Direct Reference (Simplest)

Reference templates, workflows, or plans directly:

```
# For a complete feature (workflow)
Follow agents/workflows/create-admin-ui.md to create admin UI for Categories.

# For a specific file type (template)
Follow agents/templates/frontend/searchable-autocomplete.md to create CategorySearchableAutocomplete.

# For backend only (templates)
Follow agents/templates/backend/ to create the API for Categories.

# For complex refactoring (plan)
Follow agents/plans/Plan, Vue Component Expansion Panels Refactor, 2026-02-03.md to refactor the expansion panels.

# For planning guidelines (plan)
Reference agents/plans/README.md for planning structure and TK-specific patterns.
```

### Method 2: Hardlinks (Recommended for Multiple Agents)

Hardlinks allow you to maintain a single source of truth while placing workflows in agent-specific locations.

#### What are Hardlinks?

A hardlink is a directory entry that points to the same file data on disk. Multiple hardlinks to the same file:
- Share the same content (edit one, all are updated)
- Don't take extra disk space
- Work across the filesystem (same partition)

**Benefits:**
- ✅ Single source of truth in `agents/workflows/`
- ✅ Each AI tool finds workflows in its expected location
- ✅ Updates to one link update all
- ✅ No file duplication
- ✅ No risk of files getting out of sync

---

## Setup Instructions

### For Claude Code (CLI)

Claude Code looks for workflows in `.claude/workflows/`:

```bash
# Create directory
mkdir -p .claude/workflows

# Create hardlinks
ln agents/workflows/create-admin-ui.md .claude/workflows/create-admin-ui.md
ln agents/workflows/github-issue-creation.md .claude/workflows/github-issue-creation.md
ln agents/workflows/pull-request-management.md .claude/workflows/pull-request-management.md

# Verify
ls -li .claude/workflows/
# Should show same inode number as agents/workflows/
```

### For Windsurf

Windsurf looks for workflows in `.windsurf/workflows/`:

```bash
# Create directory
mkdir -p .windsurf/workflows

# Create hardlinks
ln agents/workflows/create-admin-ui.md .windsurf/workflows/create-admin-ui.md
ln agents/workflows/github-issue-creation.md .windsurf/workflows/github-issue-creation.md
ln agents/workflows/pull-request-management.md .windsurf/workflows/pull-request-management.md

# Verify
ls -li .windsurf/workflows/
```

### For Cursor

Cursor looks for workflows in `.cursor/workflows/`:

```bash
# Create directory
mkdir -p .cursor/workflows

# Create hardlinks
ln agents/workflows/create-admin-ui.md .cursor/workflows/create-admin-ui.md
ln agents/workflows/github-issue-creation.md .cursor/workflows/github-issue-creation.md
ln agents/workflows/pull-request-management.md .cursor/workflows/pull-request-management.md

# Verify
ls -li .cursor/workflows/
```

### For Agent-Specific Customizations (Optional)

If you need agent-specific versions, you can:

1. **Keep in a dedicated `agents/` subdirectory for that agent** instead of hardlinking:
   ```bash
   mkdir -p agents/claude/workflows
   cp agents/workflows/create-admin-ui.md agents/claude/workflows/
   # Edit agents/claude/workflows/create-admin-ui.md as needed
   ```

2. **Then hardlink the customized version:**
   ```bash
   ln agents/claude/workflows/create-admin-ui.md .claude/workflows/create-admin-ui.md
   ```

---

## Quick Setup Script

Create all hardlinks at once:

```bash
#!/bin/bash
# setup-workflows.sh

# Define agents and their workflow directories
declare -A AGENT_DIRS=(
    [".claude"]="workflows"
    [".windsurf"]="workflows"
    [".cursor"]="workflows"
)

# Source workflows directory
SOURCE_DIR="agents/workflows"

# Create hardlinks for each agent
for agent_dir in "${!AGENT_DIRS[@]}"; do
    workflow_dir="${agent_dir}/${AGENT_DIRS[$agent_dir]}"

    # Create directory if it doesn't exist
    mkdir -p "$workflow_dir"

    # Hardlink all workflows
    for workflow in "$SOURCE_DIR"/*.md; do
        if [ -f "$workflow" ] && [ "$(basename "$workflow")" != "README.md" ]; then
            target="$workflow_dir/$(basename "$workflow")"

            # Remove existing file/link if present
            [ -e "$target" ] && rm "$target"

            # Create hardlink
            ln "$workflow" "$target"
            echo "✓ Linked $(basename "$workflow") to $workflow_dir/"
        fi
    done
done

echo ""
echo "✅ All workflows linked successfully!"
echo ""
echo "Verify with: ls -li .claude/workflows/ .windsurf/workflows/ .cursor/workflows/"
```

**Usage:**
```bash
chmod +x setup-workflows.sh
./setup-workflows.sh
```

---

## Verifying Hardlinks

Check that files share the same inode (same file on disk):

```bash
# List with inode numbers
ls -li agents/workflows/create-admin-ui.md .claude/workflows/create-admin-ui.md

# Should show same inode number (first column), like:
# 1234567 -rw-r--r-- 2 user user 50000 Dec 9 10:00 agents/workflows/create-admin-ui.md
# 1234567 -rw-r--r-- 2 user user 50000 Dec 9 10:00 .claude/workflows/create-admin-ui.md
#         ^-- Same inode = same file
```

The link count (third number) shows how many hardlinks exist to the file.

---

## Adding New Workflows

1. **Create in `agents/workflows/`**:
   ```bash
   cat > agents/workflows/my-new-workflow.md << 'WORKFLOW'
   ---
   description: Description of what this workflow does
   auto_execution_mode: 1
   ---

   # My New Workflow

   [Content here...]
   WORKFLOW
   ```

2. **Run setup script** or manually hardlink:
   ```bash
   ./setup-workflows.sh
   # or
   ln agents/workflows/my-new-workflow.md .claude/workflows/my-new-workflow.md
   ```

3. **Update READMEs**:
   - Add to `agents/workflows/README.md`
   - Optionally add to this file

---

## Workflow Frontmatter

All workflows should include frontmatter:

```yaml
---
description: Brief description of workflow purpose and scope
auto_execution_mode: 1
---
```

- `description`: Helps AI understand when to use this workflow
- `auto_execution_mode: 1`: Enables automatic execution in supported tools

---

## Git Configuration

**Recommended `.gitignore` entries:**

```gitignore
# Agent-specific directories (if using hardlinks to them)
.claude/workflows/
.windsurf/workflows/
.cursor/workflows/

# Keep the source workflows
!agents/workflows/
```

This approach:
- ✅ Tracks the source workflows in `agents/workflows/`
- ✅ Ignores agent-specific hardlinks (they're duplicates)
- ✅ Each developer runs setup script to create their hardlinks
- ✅ Prevents merge conflicts

**Alternative (track everything):**
```gitignore
# Track all workflows
!agents/workflows/
!.claude/workflows/
!.windsurf/workflows/
!.cursor/workflows/
```

---

## Best Practices

1. **Single Source of Truth**
   - Always edit workflows in `agents/workflows/`
   - Hardlinks ensure changes propagate everywhere

2. **Descriptive Names**
   - Use `verb-noun.md` format: `create-admin-ui.md`, `setup-database.md`
   - Keep names short but clear

3. **Include Frontmatter**
   - Always add description and auto_execution_mode
   - Helps AI assistants understand purpose

4. **Reference Implementations**
   - Include commit hashes for reference implementations
   - Example: `Reference: TraditionalKnowledge (commit: <commit-hash>)`

5. **Keep Workflows Focused**
   - One workflow = one major task
   - Break complex tasks into multiple workflows if needed

6. **Update READMEs**
   - Document new workflows
   - Keep examples up to date

---

## Plans

The `plans/` directory contains implementation documents that outline the steps to implement a feature or fix. They include:

- Problem statements
- Implementation steps
- Database schema changes
- Testing plans
- Changelog entries

Plans are more detailed than workflows and are used for complex feature planning.

---

## Troubleshooting

### Hardlink Not Working?

**Problem:** `ln: failed to create hard link: Invalid cross-device link`

**Solution:** Source and destination must be on same filesystem. Use symlinks instead:
```bash
ln -s ../../agents/workflows/create-admin-ui.md .claude/workflows/create-admin-ui.md
```

Note: Symlinks don't share inodes but still work for most purposes.

### Changes Not Appearing?

**Check inode:**
```bash
ls -li agents/workflows/create-admin-ui.md .claude/workflows/create-admin-ui.md
```

If inode numbers differ, it's not a hardlink. Recreate:
```bash
rm .claude/workflows/create-admin-ui.md
ln agents/workflows/create-admin-ui.md .claude/workflows/create-admin-ui.md
```

### File Accidentally Deleted?

Hardlinks protect against accidental deletion! As long as one hardlink exists, the file data remains. Simply recreate the hardlink:
```bash
ln agents/workflows/create-admin-ui.md .claude/workflows/create-admin-ui.md
```

---

## Examples

### Using Templates

```bash
# Single template
"Follow agents/templates/frontend/searchable-autocomplete.md to create UserSearchableAutocomplete"

# Backend templates only
"Follow agents/templates/backend/ to create the Retention model, controller, and services"

# Specific component type
"Follow agents/templates/frontend/components.md to create RetentionsDataTable"
```

### Using Workflows

```bash
# Full admin UI
"Follow agents/workflows/create-admin-ui.md to create admin UI for Retentions"

# PR management
"Follow agents/workflows/pull-request-management.md to create a PR for this branch"
```

### Using with Claude Code

```bash
# Reference workflow directly
claude "Follow agents/workflows/create-admin-ui.md to create admin UI for TraditionalKnowledge model"

# Or reference a template
claude "Follow agents/templates/frontend/searchable-autocomplete.md for Groups"
```

### Using with Windsurf

Open command palette and reference:
```
@workflow create-admin-ui
Create admin UI for TraditionalKnowledge model
```

### Using with Cursor

```
Use agents/templates/backend/model.md to create the Retention model
```

---

## Contributing

When adding workflows:

1. Create in `agents/workflows/`
2. Include proper frontmatter
3. Follow existing format and structure
4. Test with at least one AI assistant
5. Update READMEs
6. Commit to git

---

## Resources

- [Claude Code Documentation](https://github.com/anthropics/claude-code)
- [Windsurf Documentation](https://docs.windsurf.ai/)
- [Cursor Documentation](https://cursor.sh/docs)

---

**Last Updated:** 2026-01-27
**Maintained By:** Development Team
