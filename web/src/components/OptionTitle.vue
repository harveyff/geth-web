<template>
  <div class="option-title">
    {{ title }}
  </div>
</template>
<script setup>
import { defineProps } from "vue";
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
<style lang="scss" scoped>
.option-title {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  color: #1a130f;
  margin-bottom: 12px;
  margin-top: 12px;
}
</style>
