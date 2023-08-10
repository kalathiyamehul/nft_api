const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

export const network = NETWORK.eth;

export const namePrefix = "Cryptonium";
export const description = "Cryptonium Collection";
export const baseUri = "ipfs://NewUriToReplace";

export const solanaMetadata = {
  symbol: "CRY",
  seller_fee_basis_points: 1000,
  external_url: "https://cryptonium.in",
  creators: [
    {
      address: "0x1D5E50754b504A6893E692C92aFeB2d530E79FB1",
      share: 100,
    },
  ],
};

export const layerConfigurations = [
  {
    growEditionSizeTo: 1,
    layersOrder: [
      { name: "Background" },
      { name: "BackBorder" },
      { name: "MainBody" },
      { name: "SubBody" },
      { name: "Eyeeee" },
      { name: "Head" },
      { name: "Dots" },
    ],
  },
];

export const shuffleLayerConfigurations = true;

export const debugLogs = false;

export const format = {
  width: 512,
  height: 512,
  smoothing: true,
};

export const gif = {
  export: false,
  repeat: 0,
  quality: 100,
  delay: 500,
};

export const text = {
  only: false,
  color: "#ffffff",
  size: 20,
  xGap: 40,
  yGap: 40,
  align: "left",
  baseline: "top",
  weight: "regular",
  family: "Courier",
  spacer: " => ",
};

export const pixelFormat = {
  ratio: 2 / 128,
};

export const background = {
  generate: true,
  brightness: "100%",
  static: true,
  default: "#0c0d23",
};

export const extraMetadata = {};

export const rarityDelimiter = "#";

export const uniqueNftTorrance = 10;

export const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.height / format.width,
  imageName: "preview.png",
};

export const preview_gif = {
  numberOfImages: 5,
  order: "ASC",
  repeat: 0,
  quality: 100,
  delay: 500,
  imageName: "preview.gif",
};

module.exports = {
  format,
  baseUri,
  description,
  background,
  uniqueNftTorrance,
  layerConfigurations,
  rarityDelimiter,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  pixelFormat,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
  preview_gif,
};
