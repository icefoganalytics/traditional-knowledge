# Templates

Reusable code templates for the Traditional Knowledge system.

## Intent

Templates provide copy-paste-ready code patterns that multiple workflows can reference. They are not standalone workflows but building blocks.

## Structure

```
templates/
  backend/
    model.md                    # Sequelize model with scopes
    controller.md               # CRUD controller with error handling
    policy.md                   # Authorization with PolicyFactory
    services.md                 # Create, Update, Destroy services
    serializers.md              # Index, Show, Reference serializers
  frontend/
    api-client.md               # Type-safe HTTP client
    composables.md              # Reactive data fetching (list/single)
    components.md               # DataTable, Forms, UniqueTextField
    pages.md                    # List, New, Edit pages
    searchable-autocomplete.md  # Debounced search with pagination
```

## Usage

Templates are referenced by workflows. See:
- [create-admin-ui](../workflows/create-admin-ui.md) - Full CRUD admin interface

Each template file contains:
1. Location path for the new file
2. Complete, copy-paste-ready code
3. Integration instructions (exports, routes, etc.)
4. Checklist for verification

## Naming Conventions

Replace these placeholders in templates:

| Placeholder | Example | Notes |
|-------------|---------|-------|
| `ResourceName` | `ExternalOrganization` | PascalCase singular |
| `resourceName` | `externalOrganization` | camelCase singular |
| `ResourceNames` | `ExternalOrganizations` | PascalCase plural |
| `resourceNames` | `externalOrganizations` | camelCase plural |
| `resource-name` | `external-organization` | kebab-case singular |
| `resource-names` | `external-organizations` | kebab-case plural |

---

**Reference Implementation:** External Organizations

**Last Updated:** 2026-01-27
