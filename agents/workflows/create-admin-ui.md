# Create Admin UI Workflow

Add complete CRUD admin interface for any model in the Traditional Knowledge system.

## Intent

**WHY this workflow exists:** Ensure consistent, high-quality admin interfaces that follow established patterns. Reduces time spent on boilerplate and prevents common mistakes.

**WHAT this workflow produces:** Full-stack CRUD implementation with:
- Backend: Model, Controller, Policy, Services, Serializers, Routes
- Frontend: API Client, Composables, Components, Pages

**Decision Rules:**
- **Separate Create vs Edit forms:** Create forms are embedded in NewPage. Edit forms are separate components.
- **Unique field validation:** Use `excludeById` filter with model scope for edit, no filter for create.
- **Route params are strings:** Convert with `parseInt()` in page components before passing to child components.
- **Default to restrictive:** All policy methods return `false` by default, only explicitly grant permissions.

---

## Prerequisites

Before starting, ensure:

- [ ] Database migration is complete
- [ ] Model exists with proper validation
- [ ] You understand the model's relationships and business logic
- [ ] You have admin access to test the implementation

---

## Templates

Templates are located in `agents/templates/` for reuse across workflows.

### Backend (11 files)

| Template | Location | Description |
|----------|----------|-------------|
| [Model](../templates/backend/model.md) | `api/src/models/` | Sequelize model with scopes |
| [Controller](../templates/backend/controller.md) | `api/src/controllers/` | CRUD endpoints |
| [Policy](../templates/backend/policy.md) | `api/src/policies/` | Authorization rules |
| [Services](../templates/backend/services.md) | `api/src/services/{resources}/` | Create, Update, Destroy |
| [Serializers](../templates/backend/serializers.md) | `api/src/serializers/{resources}/` | Index, Show, Reference |

**Integration Points:**
- `api/src/controllers/index.ts` - Export controller
- `api/src/policies/index.ts` - Export policy
- `api/src/router.ts` - Add routes

### Frontend (10-11 files)

| Template | Location | Description |
|----------|----------|-------------|
| [API Client](../templates/frontend/api-client.md) | `web/src/api/` | Type-safe HTTP client |
| [Composables](../templates/frontend/composables.md) | `web/src/use/` | Reactive data fetching |
| [Components](../templates/frontend/components.md) | `web/src/components/{resources}/` | DataTable, Forms, UniqueTextField |
| [Pages](../templates/frontend/pages.md) | `web/src/pages/admin/{resources}/` | List, New, Edit pages |

**Integration Points:**
- `web/src/routes.ts` - Add routes
- Navigation component - Add sidebar link

---

## Quick Reference

### Naming Conventions

| Concept | Backend | Frontend |
|---------|---------|----------|
| Model | `ExternalOrganization` | `ExternalOrganization` (type) |
| Controller | `ExternalOrganizationsController` | - |
| Policy | `ExternalOrganizationPolicy` | `ExternalOrganizationPolicy` (type) |
| Service folder | `external-organizations/` | - |
| Serializer folder | `external-organizations/` | - |
| API client | - | `externalOrganizationsApi` |
| Composable (list) | - | `useExternalOrganizations` |
| Composable (single) | - | `useExternalOrganization` |
| Component folder | - | `external-organizations/` |
| Page folder | - | `external-organizations/` |

### HTTP Status Codes

| Operation | Success | Client Error | Server Error |
|-----------|---------|--------------|--------------|
| Index | 200 | 400 | - |
| Show | 200 | 404, 403 | 400 |
| Create | 201 | 403 | 422 |
| Update | 200 | 404, 403 | 422 |
| Destroy | 204 | 404, 403 | 422 |

### Required Model Scopes

```typescript
static establishScopes(): void {
  this.addSearchScope(["name"])

  this.addScope("excludeById", (idOrIds: number) => {
    const ids = arrayWrap(idOrIds)
    return {
      where: {
        id: { [Op.notIn]: ids },
      },
    }
  })
}
```

---

## Implementation Order

1. **Backend first** - Model → Services → Serializers → Policy → Controller → Routes
2. **Frontend second** - API Client → Composables → Components → Pages → Routes

This ensures you can test each layer before building the next.

---

## Testing Checklist

### Backend
- [ ] Model scopes work (search, excludeById)
- [ ] All 5 controller actions return correct responses
- [ ] Policy authorization enforced
- [ ] Services handle errors gracefully

### Frontend
- [ ] List page loads with data
- [ ] Search works with debouncing
- [ ] Pagination works
- [ ] Can create new record
- [ ] Can view record details
- [ ] Can edit record
- [ ] Can delete record
- [ ] Form validation works
- [ ] Unique field validation works (create and edit)

---

## Common Pitfalls

1. Forgetting `establishScopes()` - breaks search and uniqueness validation
2. Not using `excludeById` filter in edit form - current record fails unique check
3. Not converting route params to numbers - API calls fail
4. Forgetting to export controller/policy from index files
5. Missing breadcrumbs in pages

---

**Reference Implementation:** External Organizations (`d4a9366`, `1f1dac8`)

**Last Updated:** 2026-01-27
