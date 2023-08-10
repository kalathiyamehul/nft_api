import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetNftQueryDto } from 'src/nft/dto/create-nft.dto';
import { UserSchema } from 'src/users/entities/user.entity';
import { getConnection, getManager, getRepository, ILike, Not, Repository } from 'typeorm';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CompileContract } from './dto/create_newCollection';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionSchema } from './entities/collection.entity';

@Injectable()
export class CollectionService {
  constructor(@InjectRepository(CollectionSchema) private collectionRepository: Repository<CollectionSchema>) { }

  userRepository = getRepository(UserSchema);

  async create(createCollectionDto: CreateCollectionDto, id: number) {
    const user = await this.userRepository.findOne({ id: id });

    const collection = await this.collectionRepository.findOne({ collection_name: createCollectionDto?.collection_name });
    if (collection) {
      throw new NotFoundException('Collection Already Exist.').getResponse()
    }
    const data = await this.collectionRepository.save(
      {
        ...createCollectionDto,
        author: user,
        created_by: user?.username,
        created_user_photo:
          user?.profile_photo
      })
    delete data?.author;
    return {
      "message": "Collection Created Succsessfully",
      "collection": data
    };
  }
  async compilcontacrt(params: CompileContract) {
    var finalContact = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

    contract NFT is ERC721URIStorage {
        using Counters for Counters.Counter;
        Counters.Counter private _tokenIds;
        address public owner;
        address contractAddress;

        constructor(address marketplaceAddress) ERC721("${params.collection_name}", "${params.collection_symbol}") {
            owner = msg.sender;
            contractAddress = marketplaceAddress;
        }

        function createToken(string memory tokenURI) public returns (uint) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();

            _mint(msg.sender, newItemId);
            _setTokenURI(newItemId, tokenURI);
            setApprovalForAll(contractAddress, true);
            return newItemId;
        }
    }`
    const fs = require('fs')
    var path = require('path');
    try {
      const data = path.resolve(process.cwd(), 'contracts', 'NFT.sol');
      fs.writeFileSync(data, finalContact)
    } catch (err) {
      console.error(err)
    }
    var withOutError = true;
    await this.chailProcessRun().then(async (res) => {
      console.log(res)
      withOutError = true;
      //Compiled 1 Solidity file successfully
    }).catch(err => {
      withOutError = false;
      console.log(err)
    })
    if (withOutError) {
      const compilefilePath = path.resolve(process.cwd(), 'artifacts', 'contracts', 'NFT.sol', 'NFT.json');
      try {
        const finalData = await require(compilefilePath);
        fs.unlink(compilefilePath, (err) => { console.log(err) })
        return {
          ABI: finalData?.abi,
          bytecode:
          {
            object: finalData?.bytecode
          }
        };
      } catch (err) {
        console.log(err)
      }
    }
    else {
      throw new BadRequestException("Some Unknown Error").getResponse()
    }
  }
  async chailProcessRun() {
    return new Promise((resolve, reject) => {
      (async () => {
        const exec = require('child_process').exec;
        await exec('npx hardhat compile', (err, stdout, stderr) => {
          if (err || stderr) {
            return reject(err || stderr);
          }
          return resolve(stdout);
        });
      })();
    });
  }
  async findAll() {
    const collection = await this.collectionRepository
      .createQueryBuilder("collections")
      // .leftJoinAndSelect('collections.author', 'author')
      .where("collections.collection_name not like :name", { name: `%_defalut%` })
      .getMany();
    return collection;
  }

  async getTrandingCollection(query: GetNftQueryDto, user_id: number) {
    let page = 1;
    if (query?.page && query?.page > 0) { page = query?.page }
    const limit = +process.env?.NFT_LIMIT;
    const offset = (page - 1) * limit;
    const collection = await this.collectionRepository
      .createQueryBuilder("collections")
      .leftJoin('collections.author', 'author')
      .addSelect(['author.username', "author.id", "author.profile_photo"])
      .where("collections.collection_name not like :name", { name: `%_defalut%` })
      // .andWhere(`collections."authorId" <> ${user_id}`)
      .offset(offset)
      .limit(limit)
      .getMany();
    return collection;
  }


  async findById(id: number) {
    const collection = await this.collectionRepository.find();
    // const colletion = await this.collectionRepository.findOne({ collection_name: "cryptonium" })
    if (!collection) {
      throw new NotFoundException('Collection Not found.').getResponse()
    }
    return collection;
  }
  async findByUserId(id: number) {
    const collection = await this.collectionRepository
      .createQueryBuilder('collections')
      .where("collections.authorId=:id", { id: id })
      .orWhere("collections.id= 2")
      .getMany();
    if (!collection) {
      throw new NotFoundException('Collection Not found.').getResponse()
    }
    return collection;
  }

  findByAuthorID(page: number, user_id: number) {
    if (!page || Number.isNaN(page) || page == 0) { page = 1 }
    const limit = +process.env?.COLLECTION_LIMIT;
    const offset = (page - 1) * limit;
    return this.collectionRepository
      .createQueryBuilder("collections")
      .where(`CAST(collections.authorId as varchar) LIKE :id`, {
        id: ((!Number.isNaN(user_id) && user_id > 0) ? `${user_id}` : `%`),
      })
      .orWhere("collections.id= 2")
      .offset(offset)
      .limit(limit)
      .getMany();
  }

  async findOne(id: number) {
    const collection = await this.collectionRepository
      .createQueryBuilder("collections")
      .leftJoin('collections.author', 'author')
      .addSelect(['author.username', "author.id", "author.profile_photo"])
      .leftJoin('collections.nfts', 'nfts')
      .addSelect([
        'nfts.id',
        'nfts.name',
        'nfts.image_url',
        'nfts.auction_iscreated',
        'nfts.nft_is_minted',
        'nfts.final_value',
        'nfts.total_like',
      ])
      .where("collections.id=:id", { id: id })
      .getOne();
    return collection;
  }

  async update(id: number, updateCollectionDto: UpdateCollectionDto) {

    const collection = await this.collectionRepository.findOne({ id: id });

    if (collection) {
      if (updateCollectionDto?.total_like) {
        updateCollectionDto.total_like = collection?.total_like + updateCollectionDto.total_like;
        if (updateCollectionDto.total_like <= -1)
          updateCollectionDto.total_like = 0
      }
      if (updateCollectionDto?.total_bookmark) {
        updateCollectionDto.total_bookmark = collection?.total_bookmark + updateCollectionDto.total_bookmark;
        if (updateCollectionDto.total_bookmark <= -1)
          updateCollectionDto.total_bookmark = 0
      }
      const collectionData = await this.collectionRepository.update({ id: id }, {
        ...updateCollectionDto
      })
      return {
        "message": "Collection Created Succsessfully",
        "status": 200,
        "collection": collectionData
      }
    }
    else {
      throw new NotFoundException('Collection Not found').getResponse()
    }

  }

  async remove(id: number) {
    const collection = await this.collectionRepository.findOne({ id: id });

    if (collection) {
      return await this.collectionRepository.remove(collection)
    }
    else {
      throw new NotFoundException('Collection Not found').getResponse()
    }
  }
}
