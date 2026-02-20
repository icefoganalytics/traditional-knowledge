<template>
  <v-form
    v-if="archiveItemAttributes"
    ref="form"
    @submit.prevent="saveAndRedirect"
  >
    <v-card class="border">
      <FileDrop @files-dropped="attachDroppedFiles">
        <v-card-title>Knowledge Item Description</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="8"
            >
              <v-text-field
                v-model="archiveItemAttributes.title"
                label="Title"
                :rules="[required]"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <SecurityLevelSelect
                v-model="archiveItemAttributes.securityLevel"
                :rules="[required]"
                label="Security level"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="archiveItemAttributes.description"
                label="Description"
                rows="3"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-title>Yukon First Nation</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Please select the Yukon First Nations that this Traditional Knowledge pertains to. You
            can select as many as are applicable to this item. If it is not listed, please directly
            type in the name and click enter.
          </p>
          <YukonFirstNationsComboBox
            v-model="archiveItemAttributes.yukonFirstNations"
            label="Yukon First Nations"
            multiple
            chips
            clearable
            variant="outlined"
          />
        </v-card-text>

        <v-card-title>Sharing Purpose</v-card-title>
        <v-card-text>
          <p class="mb-3">For what purpose this traditional knowledge is shared?</p>
          <v-textarea
            v-model="archiveItemAttributes.sharingPurpose"
            label="Sharing Purpose"
            rows="2"
            variant="outlined"
          />
          <v-checkbox
            v-model="archiveItemAttributes.confidentialityReceipt"
            label="I confirm that I have received and agreed to the confidentiality terms."
            hide-details
            class="mt-3"
          />
        </v-card-text>

        <v-divider
          thickness="3"
          class="mb-4"
        ></v-divider>

        <v-card-title>Categories and Tags</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Categories and Tags are used as filter criteria to find items. You can select as many of
            each as are applicable to this item.
          </p>
          <CategorySelect
            v-model="archiveItemAttributes.categoryIds"
            :rules="[required]"
            :hide-details="false"
            label="Categories"
            hide-selected
            clearable
            multiple
            chips
          />
          <v-combobox
            v-model="archiveItemAttributes.tags"
            label="Tags"
            multiple
            chips
            clearable
          />
        </v-card-text>

        <v-card-title>Attachments</v-card-title>

        <v-card-text>
          <p class="mb-4">Drag and drop files or click the box belox</p>
          <v-file-input
            v-model="archiveItemAttributes.files"
            multiple
            chips
            clearable
            label="Attachments"
          />

          <v-btn
            type="submit"
            class="mt-5"
            >Save</v-btn
          >
        </v-card-text>
      </FileDrop>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref, toRefs, useTemplateRef, watchEffect } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import { archiveItemsApi, type ArchiveItemCreate, SecurityLevel } from "@/api/archive-items-api"
import { InformationSharingAgreementAccessLevels } from "@/api/information-sharing-agreements-api"

import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"
import useSnack from "@/use/use-snack"

import CategorySelect from "@/components/categories/CategorySelect.vue"
import FileDrop from "@/components/common/FileDrop.vue"
import YukonFirstNationsComboBox from "@/components/archive-items/YukonFirstNationsComboBox.vue"

const props = defineProps<{
  informationSharingAgreementId: number
}>()

const { informationSharingAgreementId } = toRefs(props)
const { informationSharingAgreement } = useInformationSharingAgreement(
  informationSharingAgreementId
)

// TODO: need to add ISA id in payload to create relationship.
const archiveItemAttributes = ref<Partial<ArchiveItemCreate>>({
  title: "",
  securityLevel: SecurityLevel.LOW,
  description: null,
  summary: null,
  sharingPurpose: null,
  confidentialityReceipt: false,
  yukonFirstNations: null,
  tags: [],
  files: [],
  categoryIds: [],
})

const ACCESS_LEVEL_TO_SECURITY_LEVEL = {
  [InformationSharingAgreementAccessLevels.INTERNAL]: SecurityLevel.LOW,
  [InformationSharingAgreementAccessLevels.PROTECTED_AND_LIMITED]: SecurityLevel.MEDIUM,
  [InformationSharingAgreementAccessLevels.CONFIDENTIAL_AND_RESTRICTED]: SecurityLevel.HIGH,
}

watchEffect(() => {
  if (informationSharingAgreement.value) {
    const { accessLevel, purpose, authorizedApplication, title } = informationSharingAgreement.value

    const accessLevelOrDefault = accessLevel ?? InformationSharingAgreementAccessLevels.INTERNAL

    archiveItemAttributes.value.securityLevel = ACCESS_LEVEL_TO_SECURITY_LEVEL[accessLevelOrDefault]
    archiveItemAttributes.value.sharingPurpose = authorizedApplication
    archiveItemAttributes.value.description = purpose
    archiveItemAttributes.value.title = title
  }
})

function attachDroppedFiles(droppedFiles: File[]) {
  if (archiveItemAttributes.value) {
    archiveItemAttributes.value.files = droppedFiles
  }
}

const isLoading = ref(false)
const form = useTemplateRef("form")
const snack = useSnack()
const router = useRouter()

async function saveAndRedirect() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  isLoading.value = true
  try {
    // TODO: need to add dedicated endpoint for creation ArchiveItem from ISA namespace.
    await archiveItemsApi.create(archiveItemAttributes.value)

    snack.success("Item created.")

    router.push({
      name: "archive-items/ArchiveItemListPage",
    })
  } catch (error) {
    snack.error("Save failed!")
    throw error
  } finally {
    archiveItemAttributes
    isLoading.value = false
  }
}
</script>
