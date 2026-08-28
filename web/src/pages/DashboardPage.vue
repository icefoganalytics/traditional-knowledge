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
            The Vault provides layers of secure storage for Yukon First Nations and Indigenous
            Governments to share their Traditional Knowledge with the Yukon Government. An
            Information Sharing Agreement sets the terms of the sharing, and Traditional Knowledge
            is then added under that agreement.
          </p>

          <v-row>
            <v-col cols="12">
              <DashboardStepCard
                :step="1"
                title="Create an Information Sharing Agreement"
                description="Set out the terms under which Traditional Knowledge will be shared with the Yukon Government."
                icon="mdi-file-document-edit"
                :to="{
                  name: 'information-sharing-agreements/InformationSharingAgreementNewPage',
                }"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <p>
                <router-link
                  :to="{
                    name: 'InformationSharingAgreementsPage',
                  }"
                  >View the Information Sharing Agreements</router-link
                >
              </p>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <DashboardStepCard
                :step="2"
                title="Add Traditional Knowledge"
                description="Open an Information Sharing Agreement to add Traditional Knowledge under its terms."
                icon="mdi-archive"
                :to="{
                  name: 'InformationSharingAgreementsPage',
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
import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"

useBreadcrumbs("Home", [BASE_CRUMB])
</script>

<style>
.v-card-item__prepend i {
  color: #7a7878;
}
</style>
