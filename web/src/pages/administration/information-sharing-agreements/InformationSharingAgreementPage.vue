<template>
  <v-skeleton-loader
    v-if="isNil(informationSharingAgreement)"
    type="card"
  />
  <InformationSharingAgreementBasicInformationCard
    v-else
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
  >
    <template #title>
      <v-icon color="accent">mdi-information-outline</v-icon>
      Basic Information
      <v-spacer />
      <v-btn
        v-bind="editButtonProps"
        variant="outlined"
        prepend-icon="mdi-open-in-new"
        text="Go To ISA Page"
      />
    </template>
  </InformationSharingAgreementBasicInformationCard>

  <v-card class="mt-5 border">
    <!-- TODO: consider if we should have separate tabs for external and internal groups access grants? -->
    <v-tabs
      slider-color="primary"
      bg-color="#ffffff77"
    >
      <v-tab
        :to="{
          name: 'administration/information-sharing-agreements/InformationSharingAgreementAccessGrantsPage',
          params: {
            informationSharingAgreementId,
          },
        }"
      >
        Access Grants
      </v-tab>
    </v-tabs>
    <v-divider />

    <v-card-text>
      <router-view />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed } from "vue"
import { useRouter } from "vue-router"

import { formatInformationSharingAgreementNumber } from "@/utils/formatters"
import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"
import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"

import InformationSharingAgreementBasicInformationCard from "@/components/information-sharing-agreements/InformationSharingAgreementBasicInformationCard.vue"

const props = defineProps<{
  informationSharingAgreementId: string
}>()

const informationSharingAgreementIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementId)
)

const { informationSharingAgreement } = useInformationSharingAgreement(
  informationSharingAgreementIdAsNumber
)

const router = useRouter()
const returnToHref = computed(() => {
  const routeLocation = router.resolve({
    name: "administration/information-sharing-agreements/InformationSharingAgreementPage",
    params: {
      informationSharingAgreementId: props.informationSharingAgreementId,
    },
  })
  return routeLocation.href
})

const editButtonProps = computed(() => ({
  to: {
    name: "information-sharing-agreements/InformationSharingAgreementEditPage",
    params: {
      informationSharingAgreementId: props.informationSharingAgreementId,
    },
    query: {
      returnTo: returnToHref.value,
    },
  },
}))

const pageTitle = computed(() => {
  if (isNil(informationSharingAgreement.value)) return "loading..."

  const { id, title } = informationSharingAgreement.value
  return `${formatInformationSharingAgreementNumber(id)} - ${title}`
})

useBreadcrumbs(pageTitle, [
  ADMIN_CRUMB,
  {
    title: "Information Sharing Agreements",
    to: {
      name: "administration/InformationSharingAgreementsPage",
    },
  },
  {
    title: formatInformationSharingAgreementNumber(informationSharingAgreementIdAsNumber.value),
    to: {
      name: "administration/information-sharing-agreements/InformationSharingAgreementPage",
      params: {
        informationSharingAgreementId: props.informationSharingAgreementId,
      },
    },
  },
])
</script>
