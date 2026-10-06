<template>
  <v-dialog
    :model-value="showDialog"
    max-width="600px"
    @keydown.esc="hide"
    @update:model-value="hideIfFalse"
  >
    <v-form
      ref="form"
      v-model="isValid"
      @submit.prevent="createAndHide"
    >
      <v-card :loading="isLoading">
        <template #title> Grant Access </template>

        <template #text>
          <v-row>
            <v-col>
              <InformationSharingAgreementSearchableAutocomplete
                v-model="
                  informationSharingAgreementKnowledgeItemAttributes.informationSharingAgreementId
                "
                :filters="informationSharingAgreementFilters"
              />
            </v-col>
          </v-row>
        </template>

        <template #actions>
          <v-btn
            :loading="isLoading"
            type="submit"
            variant="flat"
          >
            Save
          </v-btn>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="error"
            variant="outlined"
            @click="hide"
          >
            Cancel
          </v-btn>
        </template>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue"
import { useRouteQuery } from "@vueuse/router"
import { isNil } from "lodash"

import { type VForm } from "vuetify/components"

import { integerTransformer } from "@/utils/use-route-query-transformers"
import informationSharingAgreementKnowledgeItemsApi, {
  type InformationSharingAgreementKnowledgeItem,
} from "@/api/information-sharing-agreement-knowledge-items-api"
import useSnack from "@/use/use-snack"

import InformationSharingAgreementSearchableAutocomplete from "@/components/information-sharing-agreements/InformationSharingAgreementSearchableAutocomplete.vue"

const emit = defineEmits<{
  created: [informationSharingAgreementKnowledgeItemId: number]
}>()

const knowledgeItemId = useRouteQuery<string | undefined, number | undefined>(
  "showAddKnowledgeItemToInformationSharingAgreementDialog",
  undefined,
  {
    transform: integerTransformer,
  }
)

function hide() {
  knowledgeItemId.value = undefined
}

function show(newKnowledgeItemId: number) {
  knowledgeItemId.value = newKnowledgeItemId
}

const showDialog = computed(() => !isNil(knowledgeItemId.value))

const informationSharingAgreementKnowledgeItemAttributes = ref<
  Partial<InformationSharingAgreementKnowledgeItem>
>({
  knowledgeItemId: undefined,
  informationSharingAgreementId: undefined,
})

const informationSharingAgreementFilters = computed(() => ({
  notAssociatedWithKnowledgeItem: knowledgeItemId.value,
  notLinkedToAnyKnowledgeItem: true,
}))

const form = ref<InstanceType<typeof VForm> | null>(null)

watch(
  () => knowledgeItemId.value,
  (newKnowledgeItemId) => {
    if (isNil(newKnowledgeItemId)) {
      informationSharingAgreementKnowledgeItemAttributes.value = {
        knowledgeItemId: undefined,
        informationSharingAgreementId: undefined,
      }
      form.value?.resetValidation()
    } else {
      informationSharingAgreementKnowledgeItemAttributes.value = {
        knowledgeItemId: newKnowledgeItemId,
        informationSharingAgreementId: undefined,
      }
    }
  },
  { immediate: true }
)

const isLoading = ref(false)
const isValid = ref(false)

const snack = useSnack()

async function createAndHide() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  isLoading.value = true
  try {
    const { informationSharingAgreementKnowledgeItem } =
      await informationSharingAgreementKnowledgeItemsApi.create(
        informationSharingAgreementKnowledgeItemAttributes.value
      )
    hide()

    await nextTick()
    emit("created", informationSharingAgreementKnowledgeItem.id)
    snack.success("Knowledge item added to information sharing agreement")
  } catch (error) {
    snack.error(`Failed to add knowledge item to information sharing agreement ${error}`)
  } finally {
    isLoading.value = false
  }
}

function hideIfFalse(value: boolean) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
})
</script>
