import { UserRoles } from "@/api/users-api"

import { mockCurrentUserApi } from "@/tests/support"

import useCurrentUser from "@/use/use-current-user"

describe("web/src/use/use-current-user.ts", () => {
  describe("useCurrentUser", () => {
    beforeEach(() => {
      useCurrentUser().reset()
    })

    // System Admin manages everyone; Admin manages internal only; External Admin
    // manages external only; plain User manages nobody. Mirrors
    // api/src/models/user.ts#canManageUser, so the button gating on UsersPage cannot
    // drift from the back-end policy. See TK-36.
    const MATRIX = [
      { role: UserRoles.SYSTEM_ADMIN, canManageInternal: true, canManageExternal: true },
      { role: UserRoles.ADMIN, canManageInternal: true, canManageExternal: false },
      { role: UserRoles.EXTERNAL_ADMIN, canManageInternal: false, canManageExternal: true },
      { role: UserRoles.USER, canManageInternal: false, canManageExternal: false },
    ]

    describe.each(MATRIX)(
      "when current user has the $role role",
      ({ role, canManageInternal, canManageExternal }) => {
        test(`canManageInternalUsers is ${canManageInternal}`, async () => {
          // Arrange
          mockCurrentUserApi({ user: { roles: [role] } })
          const { fetch, canManageInternalUsers } = useCurrentUser()

          // Act
          await fetch()

          // Assert
          expect(canManageInternalUsers.value).toBe(canManageInternal)
        })

        test(`canManageExternalUsers is ${canManageExternal}`, async () => {
          // Arrange
          mockCurrentUserApi({ user: { roles: [role] } })
          const { fetch, canManageExternalUsers } = useCurrentUser()

          // Act
          await fetch()

          // Assert
          expect(canManageExternalUsers.value).toBe(canManageExternal)
        })
      }
    )

    test("when current user holds both admin roles, can manage both user types", async () => {
      // Arrange
      mockCurrentUserApi({
        user: { roles: [UserRoles.ADMIN, UserRoles.EXTERNAL_ADMIN] },
      })
      const { fetch, canManageInternalUsers, canManageExternalUsers } = useCurrentUser()

      // Act
      await fetch()

      // Assert
      expect(canManageInternalUsers.value).toBe(true)
      expect(canManageExternalUsers.value).toBe(true)
    })

    test("before the current user has loaded, can manage neither user type", () => {
      // Arrange
      const { canManageInternalUsers, canManageExternalUsers } = useCurrentUser()

      // Act, Assert
      expect(canManageInternalUsers.value).toBe(false)
      expect(canManageExternalUsers.value).toBe(false)
    })
  })
})
