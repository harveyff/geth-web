// 实现一个方法,根据传入字符串匹配对应的颜色
function getChainStatusColor(status) {
  const statusColorMap = {
    Syncing: "#86C956",
    Listening: "#FFB800",
    Stopped: "#E84E40",
  };
  return statusColorMap[status] || "#1A130F";
}

function getClientStatus(listening, syncing) {
  if (listening) {
    return syncing ? 'Syncing' : 'Listening';
  }
  return 'Stopped';
}

export default {
  getChainStatusColor,
  getClientStatus,
};
