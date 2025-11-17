import etherumIco from "../assets/img/etherum-ico.png";

const chainTypes = [
  {
    id: 1,
    label: "Mainnet",
    img: etherumIco,
    Currency: "ETH",
  },
  {
    id: 3,
    label: "Ropsten",
    img: etherumIco,
    Currency: "ETH",
  },
  {
    id: 42,
    label: "Kovan",
    img: etherumIco,
    Currency: "ETH",
  },
  {
    id: 4,
    label: "Rinkeby",
    img: etherumIco,
    Currency: "ETH",
  },
  {
    id: 56,
    label: "Binance Smart Chain Mainnet",
    img: etherumIco,
    Currency: "BNB",
  }
];

function clientVersionInfo(clientVersion) {
  const versionArr = clientVersion.split("/");
  const client = versionArr[0]; //.toLowerCase();
  const version = versionArr[versionArr.length - 1].replace(/[^\d.]/g, "");
  return `${client} ${version}`;
}

function filterChainType(chainId) {
  const net = chainTypes.filter((item) => item.id === Number(chainId));
  return net[0];
}


function numberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "N/A";
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

export default {
  clientVersionInfo,
  filterChainType,
  numberWithCommas,
  formatBytes,
};
