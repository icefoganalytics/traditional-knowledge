<template>
  <v-card>
    <template #text>
      <div v-if="!isNil(knowledgeItemId)">
        <InformationSharingAgreementKnowledgeItemsAsInformationSharingAgreementsEditDataIterator
          ref="informationSharingAgreementKnowledgeItemsAsInformationSharingAgreementsEditDataIterator"
          :where="informationSharingAgreementKnowledgeItemsWhereOptions"
          route-query-suffix="InformationSharingAgreementKnowledgeItems"
          @deleted="refreshArchiveAndLinks"
        />
      </div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed } from "vue"

import useKnowledgeItem from "@/use/use-knowledge-item"
import useInformationSharingAgreementKnowledgeItem from "@/use/use-information-sharing-agreement-knowledge-item"
import useInformationSharingAgreementKnowledgeItems from "@/use/use-information-sharing-agreement-knowledge-items"

import InformationSharingAgreementKnowledgeItemsAsInformationSharingAgreementsEditDataIterator from "@/components/information-sharing-agreement-knowledge-items/InformationSharingAgreementKnowledgeItemsAsInformationSharingAgreementsEditDataIterator.vue"

const props = defineProps<{
  informationSharingAgreementId: string
  informationSharingAgreementKnowledgeItemId: string
}>()

const informationSharingAgreementKnowledgeItemIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementKnowledgeItemId)
)
const {
  informationSharingAgreementKnowledgeItem: rawInformationSharingAgreementKnowledgeItem,
  refresh: refreshInformationSharingAgreementKnowledgeItem,
} = useInformationSharingAgreementKnowledgeItem(informationSharingAgreementKnowledgeItemIdAsNumber)

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

const { refresh: refreshKnowledgeItem } = useKnowledgeItem(knowledgeItemId)

const informationSharingAgreementKnowledgeItemsWhereOptions = computed(() => ({
  knowledgeItemId: knowledgeItemId.value ?? undefined,
}))

const informationSharingAgreementKnowledgeItemsQuery = computed(() => ({
  where: {
    knowledgeItemId: knowledgeItemId.value ?? undefined,
  },
  perPage: 1,
}))
const { refresh: refreshInformationSharingAgreementKnowledgeItems } =
  useInformationSharingAgreementKnowledgeItems(informationSharingAgreementKnowledgeItemsQuery, {
    skipWatchIf: () => isNil(knowledgeItemId.value),
  })

async function refreshArchiveAndLinks() {
  await Promise.all([
    refreshKnowledgeItem(),
    refreshInformationSharingAgreementKnowledgeItems(),
    refreshInformationSharingAgreementKnowledgeItem(),
  ])
}
</script>
