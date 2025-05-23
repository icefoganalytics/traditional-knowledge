<template>
  <v-form
    v-if="createItem"
    ref="form"
    v-model="isValid"
    @submit.prevent="saveWrapper"
  >
    <v-card>
      <FileDrop @files-dropped="handleFileDrop">
        <v-card-title>Archive Item Description</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="12"
            >
              <v-text-field
                v-model="createItem.title"
                label="Title"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="createItem.description"
                label="Description"
                rows="3"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-title>Tags</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Tags are used as filter criteria to find items in the archive. You can select as many as
            are applicable to this item.
          </p>
          <v-combobox
            v-model="createItem.tags"
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
            v-model="createItem.files"
            multiple
            chips
            clearable
            label="Attachments"
          />

          <v-btn
            type="submit"
            class="mt-5"
            :disabled="!isValid"
            >Save</v-btn
          >
        </v-card-text>
      </FileDrop>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { isEmpty, isNil } from "lodash"
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { VForm } from "vuetify/components"

import useSnack from "@/use/use-snack"
import useArchiveItemLegacy from "@/use/use-archive-item-legacy"

import { SecurityLevel } from "@/api/archive-items-api"

import FileDrop from "@/components/common/FileDrop.vue"

const rules = {
  required: (value: string | null) => !!value || "Field is required",

  email(value: string | null) {
    if (isNil(value) || isEmpty(value)) return true
    if (/^[a-z.-]+@[a-z.-]+\.[a-z]+$/i.test(value)) return true
    return "Must be a valid e-mail."
  },
}

const isValid = ref(false)

const snack = useSnack()
const router = useRouter()

const { createItem, isUpdate, save } = useArchiveItemLegacy(ref(null))

const isLoading = ref(false)
const form = ref<InstanceType<typeof VForm> | null>(null)

onMounted(() => {
  createItem.value = {
    title: "",
    securityLevel: SecurityLevel.LOW,
    description: null,
    summary: null,
    tags: [],
    files: [],
  }
})

function handleFileDrop(droppedFiles: File[]) {
  if (createItem.value) createItem.value.files = droppedFiles
}

async function saveWrapper() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  isLoading.value = true
  try {
    await save()

    if (isUpdate) snack.success("Item saved.")
    else snack.success("Item created.")

    router.push({ name: "archive-item/ArchiveItemListPage" })
  } catch (error) {
    snack.error("Save failed!")
    throw error
  } finally {
    isLoading.value = false
  }
}
</script>
