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
                label="Title *"
                :rules="[required]"
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <SecurityLevelSelect
                v-model="archiveItemAttributes.securityLevel"
                :rules="[required]"
                label="Security level *"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="archiveItemAttributes.description"
                label="Description *"
                :rules="[required]"
                auto-grow
                required
                rows="8"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-title>Yukon First Nation</v-card-title>
        <v-card-text>
          <p class="mb-4">
            The Yukon First Nation is determined by the sharing contact on the Information Sharing
            Agreement.
          </p>
          <ExternalOrganizationChip
            v-if="externalGroupContactOrganization"
            :external-organization-id="externalGroupContactOrganization.id"
            variant="outlined"
          />
          <span
            v-else
            class="text-medium-emphasis"
          >
            No organization found for the sharing contact on this agreement.
          </span>
        </v-card-text>

        <v-card-title>Sharing Purpose</v-card-title>
        <v-card-text>
          <p class="mb-3">For what purpose this traditional knowledge is shared?</p>
          <v-textarea
            v-model="archiveItemAttributes.sharingPurpose"
            label="Sharing Purpose *"
            :rules="[required]"
            auto-grow
            required
            rows="8"
          />
          <v-checkbox
            v-model="archiveItemAttributes.confidentialityReceipt"
            label="I confirm that I have received and agreed to the confidentiality terms."
            class="mt-3"
            :rules="[required]"
            required
            hide-details
          />
        </v-card-text>

        <v-divider
          thickness="2"
          class="mb-4"
        />

        <v-card-title>Categories and Tags</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Categories and Tags are used as filter criteria to find items. You can select as many of
            each as are applicable to this item.
          </p>
          <CategorySelect
            v-model="categoryIds"
            label="Categories *"
            :rules="[required]"
            hide-selected
            multiple
            chips
            :closable-chips="categoryIds.length > 1"
          />
          <v-combobox
            v-model="archiveItemAttributes.tags"
            label="Tags"
            class="mt-3"
            multiple
            chips
            clearable
          />
        </v-card-text>

        <v-card-title>Attachments</v-card-title>

        <v-card-text>
          <p class="mb-4">Drag and drop files or click the box belox</p>
          <EnhancedFileInput
            v-model="files"
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
import { computed, ref, toRefs, useTemplateRef, watchEffect } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import Api from "@/api"
import { type ArchiveItemCreationAttributes } from "@/api/information-sharing-agreements/archive-items-api"
import { SecurityLevel } from "@/api/archive-items-api"
import { InformationSharingAgreementAccessLevels } from "@/api/information-sharing-agreements-api"

import useExternalOrganizations from "@/use/use-external-organizations"
import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"
import useSnack from "@/use/use-snack"

import EnhancedFileInput from "@/components/common/EnhancedFileInput.vue"
import FileDrop from "@/components/common/FileDrop.vue"

import CategorySelect from "@/components/categories/CategorySelect.vue"
import ExternalOrganizationChip from "@/components/external-organizations/ExternalOrganizationChip.vue"

import SecurityLevelSelect from "@/components/archive-items/SecurityLevelSelect.vue"

const props = defineProps<{
  informationSharingAgreementId: number
}>()

const { informationSharingAgreementId } = toRefs(props)
const { informationSharingAgreement } = useInformationSharingAgreement(
  informationSharingAgreementId
)

const archiveItemAttributes = ref<Partial<ArchiveItemCreationAttributes>>({
  title: "",
  securityLevel: SecurityLevel.LOW,
  description: null,
  sharingPurpose: null,
  confidentialityReceipt: false,
  yukonFirstNations: [],
  tags: [],
  archiveItemCategoriesAttributes: [],
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

const NULL_USER_ID = -1
const externalGroupContactId = computed(
  () => informationSharingAgreement.value?.externalGroupContactId
)
const externalOrganizationsQuery = computed(() => ({
  filters: {
    withUserId: externalGroupContactId.value ?? NULL_USER_ID,
  },
}))
const { externalOrganizations } = useExternalOrganizations(externalOrganizationsQuery, {
  skipWatchIf: () => isNil(externalGroupContactId.value),
})
const externalGroupContactOrganization = computed(() => externalOrganizations.value[0])

watchEffect(() => {
  if (isNil(externalGroupContactOrganization.value)) return

  archiveItemAttributes.value.yukonFirstNations = [externalGroupContactOrganization.value.name]
})

const files = ref<File[]>([])

function attachDroppedFiles(droppedFiles: File[]) {
  files.value = droppedFiles
}

const categoryIds = ref<number[]>([])

watchEffect(() => {
  archiveItemAttributes.value.archiveItemCategoriesAttributes = categoryIds.value.map(
    (categoryId) => ({
      categoryId,
    })
  )
})

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
    const { archiveItem } = await Api.InformationSharingAgreements.archiveItemsApi.create(
      props.informationSharingAgreementId,
      archiveItemAttributes.value,
      files.value
    )
    snack.success("Item created.")
    await router.push({
      name: "archive-items/ArchiveItemInformationSharingAgreementsPage",
      params: {
        archiveItemId: archiveItem.id,
      },
    })
  } catch (error) {
    snack.error("Save failed!")
    throw error
  } finally {
    isLoading.value = false
  }
}
</script>
