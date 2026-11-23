<template>
  <h2 class="mb-3">Traditional Knowledge Vault</h2>
  <v-row>
    <v-col
      cols="12"
      md="8"
    >
      <v-card class="border">
        <v-card-text>
          <p class="text-subtitle-1 mb-4">
            The Vault provides two layers of secure storage: one to store signed Information Sharing
            Agreements (ISAs) and the other to store the corresponding Traditional Knowledge (TK).
          </p>

          <v-row>
            <v-col cols="12">
              <DashboardStepCard
                :step="1"
                description="View Information Sharing Agreements."
                icon="mdi-file-search"
                :to="{
                  name: 'InformationSharingAgreementsPage',
                }"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <DashboardStepCard
                :step="2"
                title="Add an Information Sharing Agreement"
                description="Create an Information Sharing Agreement from a template, upload it here and enter the details into this Vault. ISAs set out the terms and conditions under which TK will be shared with the Yukon government."
                icon="mdi-file-document-edit"
                :to="{
                  name: 'information-sharing-agreements/InformationSharingAgreementNewPage',
                }"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <DashboardStepCard
                :step="3"
                title="Add Traditional Knowledge"
                description="Click here to upload TK under the corresponding ISA."
                icon="mdi-archive"
                :to="{
                  name: 'knowledge-items/KnowledgeItemNewPage',
                }"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <VaultInfoCard />
      <VaultStatisticsCard />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import DashboardStepCard from "@/components/common/DashboardStepCard.vue"
import VaultInfoCard from "@/components/common/VaultInfoCard.vue"
import VaultStatisticsCard from "@/components/common/VaultStatisticsCard.vue"
import useBreadcrumbs from "@/use/use-breadcrumbs"

useBreadcrumbs("Dashboard", [])
</script>

<style>
.v-card-item__prepend i {
  color: #7a7878;
}
</style>
