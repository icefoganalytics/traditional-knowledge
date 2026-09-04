---
description: Create and edit well-structured pull requests following Traditional Knowledge project patterns and conventions
auto_execution_mode: 1
---

# Pull Request Management Workflow

## Intent

**WHY this workflow exists:** Pull requests communicate intent to reviewers and future maintainers. A well-structured PR explains the problem, the solution approach, and how to verify correctness. This reduces review friction and creates valuable documentation.

**WHAT this workflow produces:** A draft PR with:
- Clear title following naming conventions
- Context explaining WHY the change is needed
- Implementation summarizing WHAT was changed (purpose, not files)
- Testing instructions that verify correctness

**Decision Rules:**
- **Title format:** Use `Issue-<number>: Description` for GitHub issues, `TICKET-ID: Description` for Jira tickets, `Fix: Description` for bug fixes, or `Action Verb + Noun` for features. Always use AP style title case.
- **Ticket prefix rule:** Only use ticket prefixes (`TK-123:`, `Issue-123:`) when referencing actual external ticket entities. For internal work without external tracking, use descriptive titles without prefixes.
- **Implementation section:** Describe what the user or system can now do — not how it was built. Never name specific methods, services, controllers, or files unless the file itself is the subject of the change. A reviewer can see the diff; they don't need a guided tour of it.
- **Screenshots:** Check the diff for `web/src/components/` or `web/src/pages/` changes. If present, write "TODO" and let user add screenshots. Only write "N/A - backend changes only" if there are truly no frontend changes.
- **Draft mode:** Always create PRs as drafts first
- **QA Testing:** Write testing instructions for someone with zero project knowledge, focusing on user interactions rather than technical implementation. Follow the `testing-instructions` workflow for comprehensive guidance on creating detailed, accurate testing instructions with exact UI element names and proper test case structure.
- **Complete workflow sequence:** This is step 3 of 4 in the complete PR creation process. Always use after jira-issue-management and code-review workflows, then follow with testing-instructions workflow for comprehensive test coverage.

This workflow covers the process of creating and editing well-structured pull requests that follow the established patterns in the Traditional Knowledge project.

## Quick Reference

```bash
# Create draft PR via gh api (preferred)
cat <<'EOF' | gh api repos/{owner}/{repo}/pulls -X POST \
  -F title="Title here" \
  -F head="branch-name" \
  -F base="main" \
  -F draft=true \
  -F body=@-
Fixes <url>

Relates to:

- <related-pr-or-issue-url>

# Context

<context>

# Implementation

1. <change>

# Screenshots

TODO - check diff for web/src/components/ or web/src/pages/ changes

# Testing Instructions

1. Run the test suite via `dev test`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:3000.
4. <specific step>
EOF
)"
```

## Process Steps

### 1. Gather Context

Before creating a PR, gather all the information you need:

```bash
# Check current branch status
git status

# View commits on this branch
git log main..HEAD --oneline

# View full diff from main
git diff main...HEAD

# Check if branch is pushed
git branch -vv
```

### 2. Determine PR Title

Use one of these patterns:

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `Issue-<number>: Description` | Linked to GitHub issue | `Issue-314: Normalize Knowledge Entry Components to Modern Patterns` |
| `TICKET-ID: Description` | Linked to Jira ticket | `TK-123: Add Traditional Knowledge Export Feature` |
| `Fix: Description` | Bug fixes without ticket | `Fix: Knowledge Record Search Not Returning Results` |
| `Action Verb + Noun` | Features/improvements | `Add Knowledge Category Management` |

**Title Guidelines:**
- Use **AP style title case** (validate at https://titlecaseconverter.com/?style=AP)
- Be specific but concise
- Start with action verb when no ticket ID
- **Important:** Only use ticket prefixes (`TK-123:`, `Issue-123:`) when referencing actual external ticket entities. For internal work without external tracking, use descriptive titles without prefixes.

### 3. Write PR Body

Follow this template structure:

```markdown
Fixes <issue-tracker-url>

Relates to:

- <related-pr-or-issue-url>

# Context

<Problem explanation, user reports, motivation>

# Implementation

1. <Implementation detail>
2. <Additional change>

# Screenshots

<Screenshots or "N/A">

# Testing Instructions

1. Run the test suite via `dev test`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:3000.
4. <Specific testing step>
```

**PR Template Usage:**

The GitHub PR template provides the basic structure. Fill in each section following these guidelines:

- **Fixes:** Add issue URL or "N/A" if no specific issue
- **Relates to:** Add related PRs/issues or remove this section entirely
- **Context:** Explain the problem, user reports, or motivation for the change
- **Implementation:** List all changes made in numbered format
- **Screenshots:** Check diff for frontend changes; write "TODO" and let user add screenshots if UI changed, "N/A" only if no frontend files changed
- **Testing Instructions:** Always start with the standard 3 steps, then add specific steps

### 4. Section Guidelines

#### Context Section

- Explain **why** the change is needed
- Include user reports using blockquotes (`>`)
- For bugs, describe root cause if known
- Include "Steps to Reproduce" for bugs
- **Use concise, direct language**: "Implements automatic group creation when agreements are signed" not "Implements automatic group creation when information sharing agreements is marked as signed"
- **Focus on problem and solution**: Remove redundant words and unnecessary context

**Example:**
```markdown
# Context

User Report
> Traditional knowledge records are not displaying properly in the search results.

Investigation revealed that the search indexing was not considering Indigenous language metadata.
```

#### Implementation Section

- Use numbered list
- Focus on **what the user or system can now do**, not how it was built
- Extract meaning from commits — what was the goal of each change?
- A reviewer can see file diffs — tell them WHY, not WHERE
- **Avoid naming specific methods, services, controllers, or files** unless the file/method itself is the subject (e.g. a renamed component)
- Keep it concise: 5-10 items maximum
- **Use direct, active voice**: "Require signed receipt upload before signing" not "Add validation in SignService"
- **Avoid redundant qualifiers**: Remove words like "entire", "proper", "fully", "completely"

**Good Example (user/outcome-focused):**
```markdown
# Implementation

1. Generate a filled Section 68 Receipt for ISAs set to "Accepted in Confidence" — downloadable from the draft card and actions menu.
2. Require the signed receipt to be uploaded before the ISA can be marked as signed.
3. Make the signed receipt available for download after signing.
4. Rename "Download Draft" to "Download Confidentiality Acknowledgement" to distinguish it from the new receipt document.
```

**Bad Example (technical-detail-focused — avoid this):**
```markdown
# Implementation

1. Add `confidentialityAgreement` and `signedConfidentialityReceipt` HasOne associations to the ISA model, plus a `requiresConfidentialityAgreement()` helper.
2. Add a generate service and serializer for the Section 68 Receipt DOCX template, mirroring the existing acknowledgement generation pattern.
3. Add a download controller for the system-generated receipt and a separate controller for the uploaded signed receipt.
```

**Bad Example (file-focused — avoid this):**
```markdown
# Implementation

1. Delete KnowledgeEntryCreateDialog.vue
2. Delete KnowledgeEntryEditDialog.vue
3. Add KnowledgeEntryNewPage.vue
4. Add KnowledgeEntryEditPage.vue
5. Update KnowledgeEntriesEditCard.vue
6. Update router.ts
```

#### Screenshots Section

**Before writing this section, check the diff:**
```bash
git diff main...HEAD --name-only | grep -E "^web/src/(components|pages)/"
```

- **If files are returned:** UI changes exist - write "TODO" and let user add screenshots
- **If no files returned:** Write "N/A - backend changes only"

**For humans adding screenshots:**
- Use `<img>` tags with width/height
- Include before/after comparisons for visual changes
- Capture the relevant UI state after the change

**Example:**
```markdown
# Screenshots

<img width="726" height="604" alt="Updated search results with proper display" src="https://github.com/user-attachments/assets/..." />
```

#### Testing Instructions Section

**Always start with these three steps:**
```markdown
1. Run the test suite via `dev test`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:3000.
```

**Then add specific steps:**
- Use **bold** for UI elements: **Create Entry**, **Save**
- Use arrows for navigation: **Knowledge Base** → **Create New**
- Include verification: "Verify that..." or "Check that..."
- Number steps sequentially

**QA Testing Principles:**

Write testing instructions as if a real person is sitting at the app doing QA. Reference actual UI labels, button text, menu items, and page headings — not code identifiers or route names. The tester should never have to look at code to follow the instructions.

- **Use actual UI labels**: Reference the exact text the tester will see — button labels, menu items, page titles, field labels. Read the Vue templates to get these right.
- **Describe real actions**: "Click the **Add User** button", not "trigger the create user flow"
- **Sequential steps**: Clear, numbered steps with specific verification points
- **Complete workflows**: Test creation, editing, saving, and navigation
- **Browser behavior**: Include back button, refresh, and direct URL testing
- **Verify with visible outcomes**: "Verify a success message appears", "Verify the new entry appears in the table", not "verify the record was created"

**Example:**
```markdown
4. Click **Information Sharing Agreements** in the left sidebar.
5. Click the **New Agreement** button.
6. Fill in the **Title** field with "Test Agreement".
7. Select a contact from the **Yukon First Nation or Indigenous Government Contact Name** dropdown.
8. Click **Save**.
9. Verify the agreement appears in the list with status "Draft".
```

### 5. Create the PR

**All PRs should be created in draft mode** to allow for review and iteration before marking ready.

```bash
# Ensure branch is pushed
git push -u origin HEAD

# Create draft PR via gh api
cat <<'EOF' | gh api repos/{owner}/{repo}/pulls -X POST \
  -F title="Title" \
  -F head="$(git branch --show-current)" \
  -F base="main" \
  -F draft=true \
  -F body=@-
[Body content]
EOF
```

To mark a draft PR as ready for review:
```bash
gh api repos/{owner}/{repo}/pulls/NUMBER -X PATCH -F draft=false
```

### 6. Edit Existing Pull Requests

When you need to update an existing PR (add context, fix title, update testing instructions):

```bash
# View current PR details
gh api repos/{owner}/{repo}/pulls/NUMBER

# Edit PR title
cat <<'EOF' | gh api repos/{owner}/{repo}/pulls/NUMBER -X PATCH -F title=@-
New Title
EOF

# Edit PR body
cat <<'EOF' | gh api repos/{owner}/{repo}/pulls/NUMBER -X PATCH -F body=@-
Updated PR body content
EOF

# Or edit interactively (use gh api for consistency)
gh api repos/{owner}/{repo}/pulls/NUMBER
```

**Common Scenarios for Editing:**

| Scenario | What to Update |
|----------|----------------|
| **Missing context** | Add detailed problem explanation to Context section |
| **Unclear implementation** | Expand Implementation section with numbered list |
| **Missing screenshots** | Add Screenshots section with images or "N/A - backend changes only" |
| **Incomplete testing** | Add specific testing steps after the standard 3 steps |
| **Wrong title format** | Update title to follow naming patterns |
| **Add related issues** | Add "Relates to:" section with links |

**Editing Workflow:**

1. **Assess what's missing** - Compare current PR against the quality checklist
2. **Gather missing information** - Get screenshots, testing steps, or context
3. **Update systematically** - Edit one section at a time if needed
4. **Verify completeness** - Run through the quality checklist again

**Example Edit:**
```bash
# Add missing testing instructions to PR #123
cat <<'EOF' | gh api repos/icefoganalytics/traditional-knowledge/pulls/123 -X PATCH -F body=@-
Fixes https://github.com/icefoganalytics/traditional-knowledge/issues/123

# Context

User Report
> Traditional knowledge records are not displaying properly in the search results.

Investigation revealed that the search indexing was not considering Indigenous language metadata.

# Implementation

1. Update search indexing logic in KnowledgeEntry model.
2. Add Indigenous language handling to search service.
3. Fix search results display in knowledge base component.

# Screenshots

<img width="1024" height="768" alt="Search results with proper display" src="https://github.com/user-attachments/assets/..." />

# Testing Instructions

1. Run the test suite via `dev test`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:3000.
4. Navigate to **Knowledge Base**.
5. Search for a traditional knowledge entry using Indigenous language terms.
6. Verify the search results display correctly with proper metadata.
EOF
```

### 7. Quality Checklist

Before submitting:

- [ ] PR created as draft
- [ ] Title follows naming pattern
- [ ] Context explains the "why"
- [ ] Implementation lists all changes
- [ ] Screenshots included for UI changes
- [ ] Testing instructions start with standard steps
- [ ] All tests pass locally
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] No `@ts-ignore`, `@ts-expect-error`, or `any` types

## Traditional Knowledge-Specific Patterns

### Testing Commands

Always use these exact commands in testing instructions:

- **Tests:** `npm run test`
- **Type checking:** `npm run type-check`
- **App startup:** `npm run dev`
- **Login URL:** http://localhost:3000

### Code Quality Standards

- TypeScript only - no `any`, `@ts-expect-error`, `@ts-ignore`, or `!`
- Use full descriptive names (no abbreviations)
- Follow expanded code style with guard clauses
- Use `@/` import alias for src directory

### Common UI Navigation Patterns

- **Knowledge Base** → **Create New**
- **Administration** → **Users** → **Add User**
- **Reports** → **Knowledge Reports** → **Generate Report**

## Pattern Examples from Traditional Knowledge

### Bug Fix Example

```markdown
# Fix: Knowledge Entry Search Results Display

Fixes https://github.com/icefoganalytics/traditional-knowledge/issues/123

# Context

User Report
> Traditional knowledge records are not displaying properly in the search results.

Investigation revealed that the search indexing was not considering Indigenous language metadata, causing entries to not appear in relevant searches.

# Implementation

1. Update search indexing to include Indigenous language metadata
2. Modify search results display to show language information
3. Add test coverage for Indigenous language search scenarios

# Screenshots

<img width="1024" height="768" alt="Search results with proper display" src="https://github.com/user-attachments/assets/..." />

# Testing Instructions

1. Run the test suite via `dev test`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:3000.
4. Navigate to **Knowledge Base**.
5. Search for a traditional knowledge entry using Indigenous language terms.
6. Verify the search results display correctly with proper metadata.
```

### Feature Example

```markdown
# TK-456: Add Traditional Knowledge Export to PDF

Fixes https://yukon-government.atlassian.net/browse/TK-456

# Context

Business Requirement
> Knowledge keepers need the ability to export traditional knowledge entries to PDF for cultural preservation and external sharing.

The current system only supports screen viewing and printing, making it difficult to share official traditional knowledge documents while maintaining cultural protocols.

# Implementation

1. Implement PDF generation service for traditional knowledge entries
2. Add export action to knowledge entry detail view
3. Restrict PDF export to authorized users with proper permissions
4. Include cultural protocol headers in generated PDFs

# Screenshots

<img width="726" height="604" alt="Export button in knowledge entry" src="https://github.com/user-attachments/assets/..." />
<img width="726" height="604" alt="Generated PDF with cultural protocols" src="https://github.com/user-attachments/assets/..." />

# Testing Instructions

1. Run the test suite via `dev test`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:3000.
4. Navigate to an existing traditional knowledge entry.
5. Click the **Export to PDF** button.
6. Verify the PDF downloads correctly with all knowledge details and cultural protocols.
```

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| PR not in draft mode | Always create PRs as drafts using `draft=true` |
| Vague context | Be specific about the problem and user impact |
| Missing testing steps | Start with standard 3 steps for Traditional Knowledge |
| No screenshots for UI | Always include for visual changes |
| Marking screenshots N/A when UI changed | Check diff for `web/src/components/` or `web/src/pages/` before writing N/A |
| Unclear scope | Separate core changes from side fixes |
| Missing links | Include Fixes/Relates to URLs |
| Wrong test commands | Use `dev test` not generic test commands |
| Type checking ignored | Always run `npm run type-check` |

---

## Related Workflows

- [`./jira-issue-management.md`](./jira-issue-management.md) - Creating well-structured Jira issues
- [`./testing-instructions.md`](./testing-instructions.md) - Generate comprehensive testing instructions
- [`./code-review.md`](./code-review.md) - Code review quality control

---

**Last Updated:** 2026-03-12

*Update this workflow when you discover better patterns or Traditional Knowledge project conventions evolve.*
