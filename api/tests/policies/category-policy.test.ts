import { describe, test, expect } from "vitest"

import { Category, User } from "@/models"
import { externalOrganizationFactory, userFactory } from "@/tests/factories"

import CategoryPolicy from "@/policies/category-policy"

describe("api/src/policies/category-policy.ts", () => {
  describe("CategoryPolicy", () => {
    describe("#show", () => {
      test("when actor is internal, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const category = Category.build({ name: "Test Category" })

        // Act, Assert
        expect(new CategoryPolicy(actor, category).show()).toBe(true)
      })

      // Everything from the Administration Dashboard is blocked for External Users
      // except Users and Groups.
      test("when actor is external, returns false", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const category = Category.build({ name: "Test Category" })

        // Act, Assert
        expect(new CategoryPolicy(actor, category).show()).toBe(false)
      })
    })

    describe("#create", () => {
      test("when actor is a system admin, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ roles: [User.Roles.SYSTEM_ADMIN] })
        const category = Category.build({ name: "Test Category" })

        // Act, Assert
        expect(new CategoryPolicy(actor, category).create()).toBe(true)
      })

      test("when actor is not a system admin, returns false", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const category = Category.build({ name: "Test Category" })

        // Act, Assert
        expect(new CategoryPolicy(actor, category).create()).toBe(false)
      })
    })

    describe(".policyScope", () => {
      test("when actor is internal, returns every category", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const category = await Category.create({ name: "Test Category" })

        // Act
        const scoped = CategoryPolicy.applyScope([], actor)

        // Assert
        const ids = (await scoped.findAll()).map((record) => record.id)
        expect(ids).toContain(category.id)
      })

      test("when actor is external, returns no categories", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        await Category.create({ name: "Test Category" })

        // Act
        const scoped = CategoryPolicy.applyScope([], actor)

        // Assert
        const records = await scoped.findAll()
        expect(records).toEqual([])
      })
    })
  })
})
