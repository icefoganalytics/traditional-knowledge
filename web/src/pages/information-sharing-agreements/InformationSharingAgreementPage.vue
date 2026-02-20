<template>
  <v-skeleton-loader
    v-if="isNil(informationSharingAgreement)"
    type="card@4"
  />
  <v-container
    v-else
    class="pa-0"
  >
    <v-row>
      <v-col>
        <InformationSharingAgreementBasicInformationCard
          class="rounded-lg"
          :title="informationSharingAgreement.title"
          :purpose="informationSharingAgreement.purpose"
          :external-group-contact-id="informationSharingAgreement.externalGroupContactId"
          :external-group-contact-title="informationSharingAgreement.externalGroupContactTitle"
          :internal-group-contact-id="informationSharingAgreement.internalGroupContactId"
          :internal-group-contact-title="informationSharingAgreement.internalGroupContactTitle"
          :internal-group-secondary-contact-id="
            informationSharingAgreement.internalGroupSecondaryContactId
          "
        />

        <InformationSharingAgreementDurationCard
          class="mt-6 rounded-lg"
          :expiration-condition="informationSharingAgreement.expirationCondition"
          :end-date="informationSharingAgreement.endDate"
        />

        <InformationSharingAgreementAccessCard
          class="mt-6 rounded-lg"
          :access-level="informationSharingAgreement.accessLevel"
          :access-level-department-restriction="
            informationSharingAgreement.accessLevelDepartmentRestriction
          "
          :access-level-branch-restriction="
            informationSharingAgreement.accessLevelBranchRestriction
          "
          :access-level-unit-restriction="informationSharingAgreement.accessLevelUnitRestriction"
          :has-additional-access-restrictions="
            informationSharingAgreement.hasAdditionalAccessRestrictions
          "
          :additional-access-restrictions="informationSharingAgreement.additionalAccessRestrictions"
        />

        <InformationSharingAgreementConfidentialityCard
          class="mt-6 rounded-lg"
          :confidentiality-type="informationSharingAgreement.confidentialityType"
          :authorized-application="informationSharingAgreement.authorizedApplication"
        />

        <div class="mt-4 d-flex flex-column flex-md-row justify-space-between ga-3 px-6 py-4">
          <InformationSharingAgreementActionsMenu
            :information-sharing-agreement-id="informationSharingAgreementIdAsNumber"
            :information-sharing-agreement-status="informationSharingAgreement.status"
            @updated="refresh"
          />

          <v-btn
            size="large"
            variant="outlined"
            color="secondary"
            :to="{
              name: 'InformationSharingAgreementsPage',
            }"
          >
            Back to List
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { isNil } from "lodash"

import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"
import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"

import InformationSharingAgreementAccessCard from "@/components/information-sharing-agreements/InformationSharingAgreementAccessCard.vue"
import InformationSharingAgreementActionsMenu from "@/components/information-sharing-agreements/InformationSharingAgreementActionsMenu.vue"
import InformationSharingAgreementBasicInformationCard from "@/components/information-sharing-agreements/InformationSharingAgreementBasicInformationCard.vue"
import InformationSharingAgreementConfidentialityCard from "@/components/information-sharing-agreements/InformationSharingAgreementConfidentialityCard.vue"
import InformationSharingAgreementDurationCard from "@/components/information-sharing-agreements/InformationSharingAgreementDurationCard.vue"

const props = defineProps<{
  informationSharingAgreementId: string
}>()

const informationSharingAgreementIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementId)
)
const { informationSharingAgreement, refresh } = useInformationSharingAgreement(
  informationSharingAgreementIdAsNumber
)

const pageTitle = computed(() => {
  if (isNil(informationSharingAgreement.value)) {
    return "loading..."
  }

  const { title } = informationSharingAgreement.value
  return title
})

useBreadcrumbs(pageTitle, [
  BASE_CRUMB,
  {
    title: "Information Sharing Agreements",
    to: {
      name: "InformationSharingAgreementsPage",
    },
  },
])
</script>
