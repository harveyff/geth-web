<template>
  <div style="width: 100%">
    <!-- <p v-for="(val, key, index) in list">{{key}}--{{val}}</p> -->
    <div
      v-for="(val, key, index) in baseData"
      :key="index"
      class="flex items-center justify-between item"
    >
      <div class="label">
        {{ key }}
      </div>
      <div class="content">
        {{ val }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps } from "vue";
defineProps({
  baseData: {
    type: Object,
    required: true,
  },
});
</script>
<style scoped>
.label {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 14px;
  color: #847c77;
}
.content {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  text-align: right;
  color: #1a130f;
}
.item {
  margin: 13px 0;
}
</style>
