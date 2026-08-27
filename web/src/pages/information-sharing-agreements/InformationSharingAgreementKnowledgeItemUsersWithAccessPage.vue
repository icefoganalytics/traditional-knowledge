<template>
  <v-card>
    <template #text>
      <InformationSharingAgreementAccessGrantsDataIterator
        v-if="!isNil(archiveItemId)"
        :filters="informationSharingAgreementAccessGrantsFilters"
      />
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed } from "vue"

import useInformationSharingAgreementArchiveItem from "@/use/use-information-sharing-agreement-archive-item"

import InformationSharingAgreementAccessGrantsDataIterator from "@/components/information-sharing-agreement-access-grants/InformationSharingAgreementAccessGrantsDataIterator.vue"

const props = defineProps<{
  informationSharingAgreementId: string
  informationSharingAgreementArchiveItemId: string
}>()

const informationSharingAgreementArchiveItemIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementArchiveItemId)
)
const { informationSharingAgreementArchiveItem: rawInformationSharingAgreementArchiveItem } =
  useInformationSharingAgreementArchiveItem(informationSharingAgreementArchiveItemIdAsNumber)

const archiveItemId = computed(() => {
  if (isNil(rawInformationSharingAgreementArchiveItem.value)) {
    return null
  }
  if (
    rawInformationSharingAgreementArchiveItem.value.informationSharingAgreementId !==
    parseInt(props.informationSharingAgreementId)
  ) {
    return null
  }
  return rawInformationSharingAgreementArchiveItem.value.archiveItemId
})

const informationSharingAgreementAccessGrantsFilters = computed(() =>
  isNil(archiveItemId.value) ? {} : { forArchiveItemId: archiveItemId.value }
)
</script>
