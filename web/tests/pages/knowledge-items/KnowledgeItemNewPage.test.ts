import { describe, expect, it } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import { defineComponent } from "vue"

import { mockHttpClient, mockRouter, mockVuetify } from "@/tests/support"

import KnowledgeItemNewPage from "@/pages/knowledge-items/KnowledgeItemNewPage.vue"
import InformationSharingAgreementSearchableAutocomplete from "@/components/information-sharing-agreements/InformationSharingAgreementSearchableAutocomplete.vue"

const InformationSharingAgreementKnowledgeItemPageStub = defineComponent({ template: "<div />" })

describe("KnowledgeItemNewPage.vue", () => {
  describe("when the user selects an ISA and creates TK", () => {
    it("creates the TK under the selected ISA and opens it", async () => {
      const httpClient = mockHttpClient()
      httpClient.get.mockImplementation(async (url: string) => {
        if (url === "/api/information-sharing-agreements") {
          return { data: { informationSharingAgreements: [], totalCount: 0 } }
        }
        if (url === "/api/information-sharing-agreements/7") {
          return {
            data: { informationSharingAgreement: { id: 7, title: "KDFN-HPW-Bridge-2026-2029" } },
          }
        }
        if (url === "/api/information-sharing-agreement-knowledge-items") {
          return {
            data: { informationSharingAgreementKnowledgeItems: [{ id: 42 }], totalCount: 1 },
          }
        }
        return { data: {} }
      })
      httpClient.post.mockResolvedValue({ data: { knowledgeItem: { id: 99 } } })

      const router = mockRouter([
        { path: "/", component: KnowledgeItemNewPage },
        { path: "/dashboard", name: "DashboardPage", component: KnowledgeItemNewPage },
        {
          path: "/sharing-agreements/:informationSharingAgreementId/knowledge-items/:informationSharingAgreementKnowledgeItemId",
          name: "information-sharing-agreements/InformationSharingAgreementKnowledgeItemPage",
          component: InformationSharingAgreementKnowledgeItemPageStub,
        },
      ])
      await router.push("/")

      const wrapper = mount(KnowledgeItemNewPage, {
        attachTo: document.body,
        global: { plugins: [mockVuetify(), router] },
      })
      await flushPromises()

      expect(httpClient.get).toHaveBeenCalledWith("/api/information-sharing-agreements", {
        params: expect.objectContaining({
          where: { status: "signed" },
          filters: { notLinkedToAnyKnowledgeItem: true },
        }),
      })

      const nextButton = wrapper.findAll("button").find((button) => button.text() === "Next")
      expect(nextButton?.attributes("disabled")).toBeDefined()

      wrapper
        .findComponent(InformationSharingAgreementSearchableAutocomplete)
        .vm.$emit("update:modelValue", 7)
      await flushPromises()
      await nextButton?.trigger("click")
      await flushPromises()

      expect(wrapper.text()).toContain("Adding TK to KDFN-HPW-Bridge-2026-2029")

      await wrapper.find("input[type='checkbox']").setValue(true)
      await wrapper.find("form").trigger("submit")
      await flushPromises()

      expect(httpClient.post).toHaveBeenCalledWith(
        "/api/information-sharing-agreements/7/knowledge-items",
        expect.objectContaining({ confidentialityReceipt: true }),
        expect.anything()
      )
      await vi.waitFor(() =>
        expect(router.currentRoute.value.path).toBe("/sharing-agreements/7/knowledge-items/42")
      )

      wrapper.unmount()
    })
  })
})
