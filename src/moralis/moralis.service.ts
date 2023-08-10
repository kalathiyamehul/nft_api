import { Injectable } from '@nestjs/common';
import { GetNFTs } from './dto/create-morali.dto';
const Moralis = require("moralis/node")
import axios from 'axios';

@Injectable()
export class MoralisService {
  async getAllNFT(getNFTs: GetNFTs) {
    Moralis.start({
      serverUrl: process.env.MORALIS_SERVER_URL,
      appId: process.env.MORALIS_APPLICATION_ID,
      masterKey: process.env.MORALIS_MASTER_KEY
    });
    const polygonNFTs = await Moralis.Web3API.account.getNFTs(getNFTs);
    const data = await this.nftResolve(polygonNFTs)
    return data;
  }
  async getCollection(getNFTs: GetNFTs) {
    Moralis.start({
      serverUrl: process.env.MORALIS_SERVER_URL,
      appId: process.env.MORALIS_APPLICATION_ID,
      masterKey: process.env.MORALIS_MASTER_KEY
    });
    const polygonNFTs = await Moralis.Web3API.account.getNFTs(getNFTs);
    var dataArr = polygonNFTs?.result?.map(item => {
      return [item.token_address, {
        token_address: item?.token_address,
        name: item?.name,
        symbol: item?.symbol,
        contract_type: item?.contract_type,
        token_uri: item?.token_uri,
      }]
    });
    var maparr = new Map(dataArr); // create key value pair from array of array
    var finalArray = [...maparr.values()];
    await this.nftBalanceCollection(finalArray)
    return finalArray;
  }
  nftResolve = async (data: any) => {
    if (data?.result) {
      const NFTs = data.result;
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          NFT.image_url = this.resolveLink(NFT.metadata?.image);
        } else if (NFT?.token_uri) {
          try {
            await axios(NFT?.token_uri)
              .then(async (response) => { return response?.data })
              .then((data) => {
                NFT.image_url = this.resolveLink(data["image"]);
              });
          } catch (error) {
            console.log(error);
          }
        }
      }
      return NFTs;
    }
  };
  nftBalanceCollection = async (data) => {
    let NFTs = data;
    for (let NFT of NFTs) {
      try {
        await axios(NFT?.token_uri)
          .then(async (response) => { return response?.data })
          .then((data) => {
            NFT.image_url = this.resolveLink(data["image"]);
          });
      } catch (error) {
      }
    }
    return NFTs;
  };

  resolveLink = (url: any) => {
    if (!url || !url.includes("ipfs://")) return url;
    return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
  };

}
