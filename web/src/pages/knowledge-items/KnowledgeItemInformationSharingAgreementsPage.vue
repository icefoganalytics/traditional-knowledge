<template>
  <v-card>
    <template #text>
      <div>
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
import { computed } from "vue"

import useKnowledgeItem from "@/use/use-knowledge-item"
import useInformationSharingAgreementKnowledgeItems from "@/use/use-information-sharing-agreement-knowledge-items"

import InformationSharingAgreementKnowledgeItemsAsInformationSharingAgreementsEditDataIterator from "@/components/information-sharing-agreement-knowledge-items/InformationSharingAgreementKnowledgeItemsAsInformationSharingAgreementsEditDataIterator.vue"

const props = defineProps<{
  knowledgeItemId: string
}>()

const knowledgeItemIdAsNumber = computed(() => parseInt(props.knowledgeItemId))
const { refresh: refreshKnowledgeItem } = useKnowledgeItem(knowledgeItemIdAsNumber)

const informationSharingAgreementKnowledgeItemsWhereOptions = computed(() => ({
  knowledgeItemId: knowledgeItemIdAsNumber.value,
}))

const informationSharingAgreementKnowledgeItemsQuery = computed(() => ({
  where: {
    knowledgeItemId: knowledgeItemIdAsNumber.value,
  },
  perPage: 1,
}))
const { refresh: refreshInformationSharingAgreementKnowledgeItems } =
  useInformationSharingAgreementKnowledgeItems(informationSharingAgreementKnowledgeItemsQuery)

async function refreshArchiveAndLinks() {
  await Promise.all([refreshKnowledgeItem(), refreshInformationSharingAgreementKnowledgeItems()])
}
</script>
