<template>
  <v-card>
    <template #text>
      <InformationSharingAgreementAccessGrantsDataIterator
        v-if="!isNil(knowledgeItemId)"
        :filters="informationSharingAgreementAccessGrantsFilters"
      />
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed } from "vue"

import useInformationSharingAgreementKnowledgeItem from "@/use/use-information-sharing-agreement-knowledge-item"

import InformationSharingAgreementAccessGrantsDataIterator from "@/components/information-sharing-agreement-access-grants/InformationSharingAgreementAccessGrantsDataIterator.vue"

const props = defineProps<{
  informationSharingAgreementId: string
  informationSharingAgreementKnowledgeItemId: string
}>()

const informationSharingAgreementKnowledgeItemIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementKnowledgeItemId)
)
const { informationSharingAgreementKnowledgeItem: rawInformationSharingAgreementKnowledgeItem } =
  useInformationSharingAgreementKnowledgeItem(informationSharingAgreementKnowledgeItemIdAsNumber)

const knowledgeItemId = computed(() => {
  if (isNil(rawInformationSharingAgreementKnowledgeItem.value)) {
    return null
  }
  if (
    rawInformationSharingAgreementKnowledgeItem.value.informationSharingAgreementId !==
    parseInt(props.informationSharingAgreementId)
  ) {
    return null
  }
  return rawInformationSharingAgreementKnowledgeItem.value.knowledgeItemId
})

const informationSharingAgreementAccessGrantsFilters = computed(() =>
  isNil(knowledgeItemId.value) ? {} : { forKnowledgeItemId: knowledgeItemId.value }
)
</script>
