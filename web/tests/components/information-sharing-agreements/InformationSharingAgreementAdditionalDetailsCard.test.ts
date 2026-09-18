import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"

import { mockVuetify } from "@/tests/support"
import i18n from "@/plugins/vue-i18n-plugin"

import InformationSharingAgreementAdditionalDetailsCard from "@/components/information-sharing-agreements/InformationSharingAgreementAdditionalDetailsCard.vue"

function mountCard(
  props: Partial<
    InstanceType<typeof InformationSharingAgreementAdditionalDetailsCard>["$props"]
  > = {}
) {
  return mount(InformationSharingAgreementAdditionalDetailsCard, {
    props: {
      detailLevel: null,
      detailNotes: null,
      formats: null,
      creditLines: null,
      creditNotes: null,
      expirationActions: null,
      expirationNotes: null,
      breachActions: null,
      breachNotes: null,
      disclosureNotes: null,
      ...props,
    },
    global: {
      plugins: [mockVuetify(), i18n],
    },
  })
}

describe("InformationSharingAgreementAdditionalDetailsCard.vue", () => {
  it("renders the translated labels for selected comma-joined options", () => {
    const wrapper = mountCard({
      detailLevel: "original,summary",
      formats: "word_documents,photos",
      creditLines: "external_organization",
    })

    const text = wrapper.text()
    expect(text).toContain("Original: No alterations or summary")
    expect(text).toContain("Summary: Notes, high-level summary, redacted portions")
    expect(text).toContain("Word documents")
    expect(text).toContain("Photos")
    expect(text).toContain("Yukon First Nation or Indigenous Government")
  })

  it("renders the free-text notes for completed sections", () => {
    const wrapper = mountCard({
      detailNotes: "Review required before summarizing.",
      disclosureNotes: "Notify the community before any compelled disclosure.",
    })

    const text = wrapper.text()
    expect(text).toContain("Review required before summarizing.")
    expect(text).toContain("Notify the community before any compelled disclosure.")
  })

  it("shows a placeholder for every optional section when nothing is filled in", () => {
    const wrapper = mountCard()

    const placeholders = wrapper.text().match(/Not specified/g) ?? []
    // Sections 2, 3, 7, 8, 9 and 10 each fall back to the placeholder.
    expect(placeholders).toHaveLength(6)
  })

  it("ignores values that are not valid options", () => {
    const wrapper = mountCard({ formats: "word_documents,not_a_real_format" })

    const text = wrapper.text()
    expect(text).toContain("Word documents")
    expect(text).not.toContain("not_a_real_format")
  })
})
