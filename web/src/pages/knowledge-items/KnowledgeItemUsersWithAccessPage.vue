<template>
  <v-card>
    <template #text>
      <InformationSharingAgreementAccessGrantsDataIterator
        :filters="informationSharingAgreementAccessGrantsFilters"
      />
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"

import InformationSharingAgreementAccessGrantsDataIterator from "@/components/information-sharing-agreement-access-grants/InformationSharingAgreementAccessGrantsDataIterator.vue"

const props = defineProps<{
  knowledgeItemId: string
}>()

const informationSharingAgreementAccessGrantsFilters = computed(() => ({
  forKnowledgeItemId: parseInt(props.knowledgeItemId),
}))
</script>
