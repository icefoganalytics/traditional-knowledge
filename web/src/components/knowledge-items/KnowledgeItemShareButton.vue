<template>
  <v-btn
    color="primary"
    variant="outlined"
    @click="openGrantAccessDialog"
  >
    Share
    <AddKnowledgeItemToInformationSharingAgreementDialog
      ref="addKnowledgeItemToInformationSharingAgreementDialog"
      @created="emit('shared', $event)"
    />
  </v-btn>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue"
import { isNil } from "lodash"

import AddKnowledgeItemToInformationSharingAgreementDialog from "@/components/information-sharing-agreement-knowledge-items/AddKnowledgeItemToInformationSharingAgreementDialog.vue"

const props = defineProps<{
  knowledgeItemId: number
}>()

const emit = defineEmits<{
  shared: [knowledgeItemToInformationSharingAgreementId: number]
}>()

const addKnowledgeItemToInformationSharingAgreementDialog = useTemplateRef<
  InstanceType<typeof AddKnowledgeItemToInformationSharingAgreementDialog>
>("addKnowledgeItemToInformationSharingAgreementDialog")

function openGrantAccessDialog() {
  if (isNil(addKnowledgeItemToInformationSharingAgreementDialog.value)) return

  addKnowledgeItemToInformationSharingAgreementDialog.value.show(props.knowledgeItemId)
}
</script>
