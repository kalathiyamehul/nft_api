const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");
const sha1 = require(`${basePath}/node_modules/sha1`);
const { createCanvas, loadImage } = require(`${basePath}/node_modules/canvas`);
const buildDir = `${basePath}`;
const layersDir = `${basePath}/layers`;
import {
  format,
  description,
  background,
  uniqueNftTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
} from "./config"
import { getConnection } from "typeorm";
import { CreateNftDBDto, CreateNftDto } from "./nft/dto/create-nft.dto";
import { NftSchema } from "./nft/entities/nft.entity";

const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = format.smoothing;
var metadataList = [];
var attributesList = [];
const Nft_DELIMITER = "-";
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

let hashlipsGiffer = null;

export const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(`${buildDir}/json`);
  fs.mkdirSync(`${buildDir}/images`);
  if (gif.export) {
    fs.mkdirSync(`${buildDir}/gifs`);
  }
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 1;
  }
  return nameWithoutWeight;
};

const cleanNft = (_str) => {
  const withoutOptions = removeQueryStrings(_str);
  var nft = Number(withoutOptions.split(":").shift());
  return nft;
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      if (i.includes("-")) {
        throw new Error(`layer name can not contain dashes, please fix: ${i}`);
      }
      return {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };
    });
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    name:
      layerObj.options?.["displayName"] != undefined
        ? layerObj.options?.["displayName"]
        : layerObj.name,
    blend:
      layerObj.options?.["blend"] != undefined
        ? layerObj.options?.["blend"]
        : "source-over",
    opacity:
      layerObj.options?.["opacity"] != undefined
        ? layerObj.options?.["opacity"]
        : 1,
    bypassNft:
      layerObj.options?.["bypassNft"] !== undefined
        ? layerObj.options?.["bypassNft"]
        : false,
  }));
  return layers;
};

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/${_editionCount}.png`,
    canvas.toBuffer("image/png")
  );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_Nft, _edition, generate_dto: CreateNftDBDto) => {
  let tempMetadata = {
    name: `${namePrefix} #${_edition}`,
    description: generate_dto?.description ? generate_dto?.description : description,
    author: generate_dto?.author?.username ? generate_dto?.author?.username : "cryptonium",
    unique_string: sha1(_Nft),
    edition: _edition,
    ...extraMetadata,
    attributes: attributesList,
  };
  if (network == NETWORK.sol) {
    // tempMetadata = {
    //   name: tempMetadata.name,
    //   symbol: solanaMetadata.symbol,
    //   description: tempMetadata.description,
    //   seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
    //   image: `${_edition}.png`,
    //   external_url: solanaMetadata.external_url,
    //   edition: _edition,
    //   ...extraMetadata,
    //   attributes: tempMetadata.attributes,
    //   properties: {
    //     files: [
    //       {
    //         uri: `${_edition}.png`,
    //         type: "image/png",
    //       },
    //     ],
    //     category: "image",
    //     creators: solanaMetadata.creators,
    //   },
    // };
  }
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let selectedElement = _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = async (_layer) => {
  try {
    return new Promise(async (resolve) => {
      const image = await loadImage(`${_layer.selectedElement.path}`);
      resolve({ layer: _layer, loadedImage: image });
    });
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

const addText = (_sig, x, y, size) => {
  ctx.fillStyle = text.color;
  ctx.font = `${text.weight} ${size}pt ${text.family}`;
  ctx.textBaseline = text.baseline;
  ctx.textAlign = text.align;
  ctx.fillText(_sig, x, y);
};

const drawElement = (_renderObject, _index, _layersLen) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blend;
  text.only
    ? addText(
      `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
      text.xGap,
      text.yGap * (_index + 1),
      text.size
    )
    : ctx.drawImage(
      _renderObject.loadedImage,
      0,
      0,
      format.width,
      format.height
    );

  addAttributes(_renderObject);
};

const constructLayerToNft = (_Nft = "", _layers = []) => {
  let mappedNftToLayers = _layers.map((layer, index) => {
    let selectedElement = layer.elements.find(
      (e) => e.id == cleanNft(_Nft.split(Nft_DELIMITER)[index])
    );
    return {
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
  return mappedNftToLayers;
};

const filterNftOptions = (_Nft) => {
  const NftItems = _Nft.split(Nft_DELIMITER);
  const filteredNft = NftItems.filter((element) => {
    const query = /(\?.*$)/;
    const querystring = query.exec(element);
    if (!querystring) {
      return true;
    }
    const options = querystring[1].split("&").reduce((r, setting) => {
      const keyPairs = setting.split("=");
      return { ...r, [keyPairs[0]]: keyPairs[1] };
    }, []);

    return options['bypassNft'];
  });
  return filteredNft.join(Nft_DELIMITER);
};

const removeQueryStrings = (_Nft) => {
  const query = /(\?.*$)/;
  return _Nft.replace(query, "");
};

const isNftUnique = async (_Nft = "") => {
  const connection = getConnection()
  const _filteredNft = filterNftOptions(_Nft);
  let nftRepository = connection.getRepository(NftSchema);
  let savedPhotos = await nftRepository.findOne({ unique_string: sha1(_filteredNft) });
  if (savedPhotos) {
    return false;
  }
  else
    return true
};

const createNft = (_layers) => {
  let randNum = [];
  _layers.forEach((layer) => {
    var totalWeight = 0;
    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });
    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < layer.elements.length; i++) {
      random -= layer.elements[i].weight;
      if (random < 0) {
        return randNum.push(
          `${layer.elements[i].id}:${layer.elements[i].filename}${layer.bypassNft ? "?bypassNft=true" : ""
          }`
        );
      }
    }
  });
  return randNum.join(Nft_DELIMITER);
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount) => {
  let metadata = metadataList.find((meta) => meta.edition == _editionCount);
  debugLogs
    ? console.log(
      `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
    )
    : null;
  // fs.writeFileSync(
  //   `${_editionCount}.json`,
  //   JSON.stringify(metadata, null, 2)
  // );
  return metadata;
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const startCreating = async (numberOfNft) => {
  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];
  console.log(numberOfNft);
  for (
    let i = network == NETWORK.sol ? 0 : 1;
    i <= numberOfNft;
    i++
  ) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;
  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );
    while (
      editionCount <= numberOfNft
    ) {
      let newNft = createNft(layers);
      if (await isNftUnique(newNft)) {
        let results = constructLayerToNft(newNft, layers);
        let loadedElements = [];

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          debugLogs ? console.log("Clearing canvas") : null;
          ctx.clearRect(0, 0, format.width, format.height);
          if (gif.export) {
            hashlipsGiffer = new HashlipsGiffer(
              canvas,
              ctx,
              `${buildDir}/gifs/${abstractedIndexes[0]}.gif`,
              gif.repeat,
              gif.quality,
              gif.delay
            );
            hashlipsGiffer.start();
          }
          if (background.generate) {
            drawBackground();
          }
          renderObjectArray.forEach((renderObject, index) => {
            drawElement(
              renderObject,
              index,
              layerConfigurations[layerConfigIndex].layersOrder.length
            );
            if (gif.export) {
              hashlipsGiffer.add();
            }
          });
          if (gif.export) {
            hashlipsGiffer.stop();
          }
          debugLogs
            ? console.log("Editions left to create: ", abstractedIndexes)
            : null;
          saveImage(abstractedIndexes[0]);
          // addMetadata(newNft, abstractedIndexes[0], { , description: "", numberOfNft: 1 });
          saveMetaDataSingleFile(abstractedIndexes[0]);
          console.log(
            `Created edition: ${abstractedIndexes[0]}, with NFT: ${sha1(
              newNft
            )}`
          );
        });
        editionCount++;
        abstractedIndexes.shift();
      } else {
        console.log("NFT exists!");
        failedCount++;
        if (failedCount >= uniqueNftTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          process.exit();
        }
      }
    }
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
};
const startCreatingOneNft = async (generate_dto: CreateNftDBDto, edition: number) => {
  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];
  let metadataJson = {}
  for (
    let i = network == NETWORK.sol ? 0 : 1;
    i <= generate_dto.numberOfNft;
    i++
  ) {
    abstractedIndexes.push(i);
  }

  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }

  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;

  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );
    while (
      editionCount <= generate_dto.numberOfNft
    ) {
      let newNft = createNft(layers);
      if (await isNftUnique(newNft)) {
        let results = constructLayerToNft(newNft, layers);
        let loadedElements = [];

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          debugLogs ? console.log("Clearing canvas") : null;
          ctx.clearRect(0, 0, format.width, format.height);
          if (gif.export) {
            hashlipsGiffer = new HashlipsGiffer(
              canvas,
              ctx,
              `${buildDir}/gifs/${edition}.gif`,
              gif.repeat,
              gif.quality,
              gif.delay
            );
            hashlipsGiffer.start();
          }
          if (background.generate) {
            drawBackground();
          }
          renderObjectArray.forEach((renderObject, index) => {
            drawElement(
              renderObject,
              index,
              layerConfigurations[layerConfigIndex].layersOrder.length
            );
            if (gif.export) {
              hashlipsGiffer.add();
            }
          });
          if (gif.export) {
            hashlipsGiffer.stop();
          }
          debugLogs
            ? console.log("Editions left to create: ", abstractedIndexes)
            : null;
          saveImage(edition);
          addMetadata(newNft, edition, generate_dto);
          metadataJson = saveMetaDataSingleFile(edition);
          console.log(
            `Created edition: ${edition}, with NFT: ${sha1(
              newNft
            )}`
          );
        });
        editionCount++;
        abstractedIndexes.shift();
      } else {
        console.log("NFT exists!");
        failedCount++;
        if (failedCount >= uniqueNftTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          return {
            success: false,
            data: {}
          };
        }
      }
    }
    layerConfigIndex++;
  }
  // writeMetaData(JSON.stringify(metadataList, null, 2));
  return {
    success: true,
    data: metadataJson
  };

};
const generator = { startCreating, startCreatingOneNft, buildSetup, getElements };
export default generator
