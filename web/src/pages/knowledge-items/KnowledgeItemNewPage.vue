<template>
  <v-stepper
    v-model="step"
    :items="['Select ISA', 'Add TK']"
    hide-actions
  >
    <template #item.1>
      <h3 class="mb-4">Select the ISA you want to add TK to.</h3>
      <InformationSharingAgreementSearchableAutocomplete
        v-model="informationSharingAgreementId"
        :where="{ status: InformationSharingAgreementStatuses.SIGNED }"
        :filters="{ notLinkedToAnyKnowledgeItem: true }"
        hint="Only signed ISAs that don't have TK yet are listed."
      />
      <div class="d-flex mt-6">
        <v-spacer />
        <v-btn
          color="primary"
          size="large"
          :disabled="isNil(informationSharingAgreementId)"
          text="Next"
          @click="step = 2"
        />
      </div>
    </template>

    <template #item.2>
      <v-form
        ref="form"
        @submit.prevent="createAndGoToKnowledgeItem"
      >
        <FileDrop @files-dropped="attachDroppedFiles">
          <p class="mb-4">
            Adding TK to <strong>{{ informationSharingAgreement?.title }}</strong>
          </p>
          <v-checkbox
            v-model="knowledgeItemAttributes.confidentialityReceipt"
            label="I confirm that I have received and agreed to the confidentiality terms."
            :rules="[required]"
            required
            hide-details
          />

          <p class="mt-4 mb-4">Drag and drop files or click the box below</p>
          <EnhancedFileInput
            v-model="files"
            multiple
            chips
            clearable
            label="Attachments"
          />

          <div class="d-flex mt-6">
            <v-btn
              variant="outlined"
              color="secondary"
              size="large"
              :disabled="isLoading"
              text="Back"
              @click="step = 1"
            />
            <v-spacer />
            <v-btn
              type="submit"
              color="primary"
              variant="elevated"
              size="large"
              :loading="isLoading"
              text="Create"
            />
          </div>
        </FileDrop>
      </v-form>
    </template>
  </v-stepper>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import Api from "@/api"
import informationSharingAgreementKnowledgeItemsApi from "@/api/information-sharing-agreement-knowledge-items-api"
import { InformationSharingAgreementStatuses } from "@/api/information-sharing-agreements-api"
import { type KnowledgeItemCreationAttributes } from "@/api/information-sharing-agreements/knowledge-items-api"

import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"
import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"
import useSnack from "@/use/use-snack"

import EnhancedFileInput from "@/components/common/EnhancedFileInput.vue"
import FileDrop from "@/components/common/FileDrop.vue"
import InformationSharingAgreementSearchableAutocomplete from "@/components/information-sharing-agreements/InformationSharingAgreementSearchableAutocomplete.vue"

const step = ref(1)

const informationSharingAgreementId = ref<number | null>(null)
const { informationSharingAgreement } = useInformationSharingAgreement(
  informationSharingAgreementId
)

const knowledgeItemAttributes = ref<Partial<KnowledgeItemCreationAttributes>>({})
const files = ref<File[]>([])

function attachDroppedFiles(droppedFiles: File[]) {
  files.value = droppedFiles
}

const isLoading = ref(false)
const form = useTemplateRef("form")
const snack = useSnack()
const router = useRouter()

async function createAndGoToKnowledgeItem() {
  if (form.value === null || isNil(informationSharingAgreementId.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  isLoading.value = true
  try {
    const { knowledgeItem } = await Api.InformationSharingAgreements.knowledgeItemsApi.create(
      informationSharingAgreementId.value,
      knowledgeItemAttributes.value,
      files.value
    )
    const { informationSharingAgreementKnowledgeItems } =
      await informationSharingAgreementKnowledgeItemsApi.list({
        where: {
          informationSharingAgreementId: informationSharingAgreementId.value,
          knowledgeItemId: knowledgeItem.id,
        },
        perPage: 1,
      })
    const informationSharingAgreementKnowledgeItem = informationSharingAgreementKnowledgeItems.at(0)
    if (isNil(informationSharingAgreementKnowledgeItem)) {
      throw new Error("Created knowledge item is not linked to the selected ISA.")
    }

    snack.success("Item created.")
    await router.push({
      name: "information-sharing-agreements/InformationSharingAgreementKnowledgeItemPage",
      params: {
        informationSharingAgreementId: informationSharingAgreementId.value,
        informationSharingAgreementKnowledgeItemId: informationSharingAgreementKnowledgeItem.id,
      },
    })
  } catch (error) {
    snack.error("Save failed!")
    throw error
  } finally {
    isLoading.value = false
  }
}

useBreadcrumbs("Add Traditional Knowledge", [BASE_CRUMB])
</script>
