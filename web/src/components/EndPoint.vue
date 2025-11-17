<template>
  <div style="width: 100%" class="flex justify-between">
    <div class="flex items-center item">
      <div class="label">{{ label }}</div>
      <div class="content" ref="textDiv">
        {{ content }}
      </div>
    </div>
    <q-btn
      flat
      rounded
      color="#4EB4FF"
      label="Copy"
      class="copy"
      icon="img:/svg/copy.svg"
      no-caps
      @click="copyText"
    />
  </div>
</template>
<script setup>
import { defineProps, ref } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
});

const textDiv = ref(null);

async function copyText() {
  if (!navigator.clipboard) {
    fallbackCopyText();
    return;
  }
  navigator.clipboard.writeText(props.content);
}

function fallbackCopyText() {
  const range = document.createRange();
  range.selectNode(textDiv.value);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
}
</script>
<style scoped>
.label {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 14px;
  color: #847c77;
  width: 45px;
}
.content {
  margin-left: 12px;
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 16px;
  color: #1a130f;
}

.item {
  margin: 13px 0;
}
.copy {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  /* identical to box height, or 114% */
  text-align: center;
  color: #4eb4ff;
}
</style>
