<template>
  <q-item clickable v-ripple class="ethereum-info">
    <q-item-section side>
      <q-avatar size="48px">
        <img :src="img" />
        <!-- <q-badge floating color="teal">new 333</q-badge> -->
        <div class="full-blue"></div>
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label class="label-network">{{ network }} Node</q-item-label>
      <q-item-label class="label-properties" caption>{{
        properties
      }}</q-item-label>
    </q-item-section>
  </q-item>
</template>
<script setup>
import { defineProps } from "vue";
defineProps({
  img: {
    type: String,
    required: true,
  },
  network: {
    type: String,
    required: true,
  },
  properties: {
    // 节点性质
    type: String,
    required: true,
    default: "Archivenode",
  },
});
</script>
<style lang="scss" scoped>
.label-network {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  color: #1a130f;
}
.label-properties {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 14px;
  color: #847c77;
}
.ethereum-info {
  padding-left: 0px;
}
</style>
