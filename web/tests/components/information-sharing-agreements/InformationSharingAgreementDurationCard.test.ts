import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"

import { mockVuetify } from "@/tests/support"

import { InformationSharingAgreementExpirationConditions } from "@/api/information-sharing-agreements-api"

import InformationSharingAgreementDurationCard from "@/components/information-sharing-agreements/InformationSharingAgreementDurationCard.vue"

function mountCard(
  expirationCondition: InformationSharingAgreementExpirationConditions | null,
  endDate: string | null
) {
  return mount(InformationSharingAgreementDurationCard, {
    props: { expirationCondition, endDate },
    global: {
      plugins: [mockVuetify()],
    },
  })
}

describe("InformationSharingAgreementDurationCard.vue", () => {
  it("describes completion of purpose with the estimated completion date", () => {
    const wrapper = mountCard(
      InformationSharingAgreementExpirationConditions.COMPLETION_OF_PURPOSE,
      "2026-10-28"
    )

    expect(wrapper.text()).toContain(
      "This ISA will expire on the completion of the YG purpose estimated to be October 28, 2026"
    )
  })

  it("describes a fixed expiration date", () => {
    const wrapper = mountCard(
      InformationSharingAgreementExpirationConditions.EXPIRATION_DATE,
      "2027-03-17"
    )

    expect(wrapper.text()).toContain("This ISA will expire on March 17, 2027")
    expect(wrapper.text()).not.toContain("completion of the YG purpose")
  })

  it("states when no expiry date is configured", () => {
    const wrapper = mountCard(
      InformationSharingAgreementExpirationConditions.UNDETERMINED_WITH_DEFAULT_EXPIRATION,
      null
    )

    expect(wrapper.text()).toContain("This ISA does not have an expiry date configured")
  })
})
