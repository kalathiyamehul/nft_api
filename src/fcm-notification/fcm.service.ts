import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FCMSchema } from './entities/fcm.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import { UserSchema } from '../users/entities/user.entity';
// var fcm = require('fcm-notification');
// var FCM = new fcm('constants/horizon-firebase.json');

var admin = require("firebase-admin");
// var serviceAccount = require("./../constants/horizon-firebase.json");
admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "horizon-4a192",
    "private_key_id": "83081f76aca12976f51b7aa2b77d03ab027cfae2",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHiCupMoXWkCnH\n8x4UcXFdR4qk0+ZACEQBWxhvWPOD8Ecit/lxFrzCNO3bKdKzNaU8FxK7gsYuyGFS\nncOJ14PUH5RhHzdU6/7lkNW+vaNzpSO1oiAz0Zw2ITRzOxSWER0dQTKsCKX5UFpB\nKFlx/KLpisOnU9rSrXIdvzQDhN1xVpocagRi80NQxuNrE8qnAa6C7ivni0Wh3S6C\nPjCcczIA76nBuDr7RHmWw0YkQQSOUJWWDe81t2tyF+lM+UVUNeWSWadKecja9DRp\nvHBH8OA0L1rdyfo3VziBINU9sk/tjIlzqHC3ddA3zWKrlGOZ6wAZevEMbz/nTpTf\nLWd30X/zAgMBAAECggEARJoMTOGKg5FQVCdB9cxlKimRQQd72BMfconj9lCSdQ/1\nHTo8wIWNQ4ZYKyyPfT8Z/vV94stdITOSxoloc+mNsS5kYRoO95smKb6oxqpD2txx\n0R6bTMWqHDBBbMbo1omuxWKnrd9RVU0rotBhJGA0kPA9QbgCecHZhOG62+TgD/mX\nWtVowgsKpetnjs/C7r/HOm1CcVPLNXJF2nMBFXmNDlahIJm6xiKCjkQ4ftvl0n80\ncca+b1L4I8bLa7wB2hORwui1EYSE+ILVtczi3vjzDfHSxmm0KzjMPXvnTTLddzxe\nQYiz3Dl6VnFxYCPmUeOOvWLXHA1CWzy530GbBsQvPQKBgQDvWoEhwz3q0WG1MhkA\nHzf46YbdxMB0DVIpGex44+ha65sG9L0DNb98HMiefcbNZtOh1KRXLLC7wlhtt6wo\n5icI//KHXPNWo9oN7cQOu+g5LOh354fvCK08DfbRkvkDz8HfJQjRLYZXmvR7CtmB\nYiywzEdaqK10ycgW7Lo27q8vRwKBgQDVaKyuKc1pnqH5uZS9lYKTfAGSQ2tfFVXx\nboNFFzE+fABNB/ieFoAF50oUR/ahuCnWuMUf1MsXM+vS7GMMgv4FLXrsEm58M5f8\nfy3BOnYSzyochYlS75Mgo2chKl9gPHggAZ3dBwDRufmCH9xPK4OnvqkwY3gCEItH\nkOsmq3c39QKBgQCiimpw3B57DQ92NfwmSgz/ms58YXV0Geu2f6VHfzW2MJNJiP+m\nY2SSyxUuFCniKLcFCdtEW9P03YihkX53E7xkbzNq2yNgrcqRdOqUOuT7ltSTQIbe\nO50w0CbRsSYrgXWdrI+tRWYard7ig76rD1lcAo1eMngAfFrFvqLCVRpgVwKBgDDT\nO/60zaxGgORzkxY06KT5kBp4lk4wwXL1R8882SVklWUKV9VDbJLtMcOmG0Uwr1HT\nADaiJrzuQhwFvTuVlKx2lVMBfImp/DHmnv9Actcm0omn+50f9tdWyzeJTDzmWM1p\n0UZKXeOd2vnsdCkg2YQ9WNQbTc+bHWKIQ2SbgjEpAoGBAIDmTRQpTh2bagNONlP+\n0uMFWPVUYs2JKvlzBo5/ufxPraYxdSXCr/Fs01F5A7opRPLn8SvbfQMWY/4zPXbz\n2EKD4nIMgWYmj/RYKyY86Ju8nyPt2ho7loX1KIzU3VvbO41q9MP1JmP0jjI4XVpV\nPIYcgBO5b2dcJkFp+cw8cgAA\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-18aar@horizon-4a192.iam.gserviceaccount.com",
    "client_id": "101016826202055371694",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-18aar%40horizon-4a192.iam.gserviceaccount.com"
  })
});

@Injectable()
export class FCMService {
  constructor(
    @InjectRepository(FCMSchema)
    private FCMRepository: Repository<FCMSchema>,
  ) { }

  userRepository = getRepository(UserSchema);
  queryManager = getManager();

  async send(user_id: number, title: string, message: string, noti_data: any, login_user_id: number, notification_type: string) {
    const user = await this.userRepository.findOne({ id: user_id });
    if (user && typeof user.fcm_token !== undefined && user.fcm_token !== "") {
      const image = (noti_data.file && noti_data.msg_type.includes("image")) ? noti_data.file : "";
      let notificationData = {};
      if (image && image !== '') {
        notificationData = {
          title: title,
          body: message,
          imageUrl: image,
        };
      }
      else {
        notificationData = {
          title: title,
          body: message,
        }
      }
      const messages = {
        // name: notification_type,
        notification: notificationData,
        data: noti_data,
        android: {
          priority: "high",
          ttl: 1000 * 60 * 60 * 24,
          notification: {
            icon: "myicon",
            color: "#FFFC00",
            // sound: "",
            // channelId: notification_type
          },
        },
        token: user.fcm_token
      };
      // Send a message to the device
      admin.messaging().send(messages)
        .then(async (response) => {
          if (notification_type != "CHAT") {
            const fcmData = new FCMSchema();
            fcmData.device_token = user.fcm_token;
            fcmData.title = title;
            fcmData.msg = message;
            fcmData.data = noti_data;
            fcmData.sender_id = login_user_id;
            fcmData.user = user;
            fcmData.notification_type = notification_type;
            await this.FCMRepository.save(fcmData).catch((err) => {
              console.log(err);
              return { status: 401, message: "Error!", error: err };
            });
          }
        })
        .catch((error) => {
          // console.log('Error sending message:', error);
        });
    }
  }

  async get(page: number, user_id: number) {

    if (!page) { page = 1 }
    const limit = +process.env?.NOTIFICATION_LIMIT;
    const offset = (page - 1) * limit;

    const querycreateFollowingDto = `select notification.*,
    users.username AS author_username, users.profile_photo AS author_profile_photo 
    from notification
    LEFT JOIN users ON users.id = sender_id 
    where "userId" = ${user_id}
    ORDER BY notification.id DESC
    OFFSET ${offset}
    LIMIT ${limit}`
    const noti = await this.queryManager.query(querycreateFollowingDto);
    return {
      statusCode: 200,
      message: 'List Fatched',
      data: noti
    }
  }
}
