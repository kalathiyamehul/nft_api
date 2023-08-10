import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import request from 'request';
import FormData from 'form-data';
import { CreateAccessTokenDto } from './dto/create-access-token.dto';

@Injectable()
export class InstagramService {
  async createe(createAccessTokenDto: CreateAccessTokenDto) {
    if (!createAccessTokenDto?.code) {
      return { status: 400, message: 'bad request' };
    }
    let data = new FormData();
    data.append('client_id', process.env.INSTAGRAM_CLIENT_ID);
    data.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);
    data.append('code', createAccessTokenDto?.code);
    data.append('grant_type', 'authorization_code');
    data.append('redirect_uri', process.env.INSTAGRAM_REDIRECT_URI);

    try {
      let response = await axios({
        method: 'post',
        url: 'https://api.instagram.com/oauth/access_token',
        headers: {
          Cookie:
            'csrftoken=rrbrVP9Mur7bGthqGxPvruYBkHsahNZW; ig_did=4B9FC24B-D7CE-46A9-8A70-9EEB42913589; ig_nrcb=1; mid=Yks3pgAEAAF62fKHNvOXO6qVJeHc',
          ...data.getHeaders(),
        },
        data: data,
      });
      if (response) {
        console.log('res1 : ', JSON.stringify(response.data));
        // return response.data;
        let s_accessToken = response.data.access_token;
        try {
          let res2 = await axios({
            method: 'get',
            url: `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${s_accessToken}`,
            headers: {
              Cookie:
                'csrftoken=rrbrVP9Mur7bGthqGxPvruYBkHsahNZW; ig_did=4B9FC24B-D7CE-46A9-8A70-9EEB42913589; ig_nrcb=1; mid=Yks3pgAEAAF62fKHNvOXO6qVJeHc',
            },
          });
          console.log('res2 : ', JSON.stringify(res2.data));
          return res2.data;
        } catch (err) {
          console.log('error 2 occured');
        }
      }
    } catch (error) {
      console.log('error1 occured');
      return { errorCode: 400, message: 'bad request' };
    }
  }
}
