import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddMessageDto } from './dto/add-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MessageSchema, ReadMessageSchema } from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, getRepository, Repository } from 'typeorm';
import { CollectionSchema } from 'src/collection/entities/collection.entity';
import { NftSchema } from 'src/nft/entities/nft.entity';
import { ReadMessagesDto } from './dto/read-messages.dto';
import { FCMService } from 'src/fcm-notification/fcm.service';
import { UserSchema } from '../users/entities/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageSchema)
    private messageRepository: Repository<MessageSchema>,
    private fcmService: FCMService
  ) { }
  queryManager = getManager();
  readMessageRepository = getRepository(ReadMessageSchema);
  userRepository = getRepository(UserSchema);

  async addMessage(addMessageDto: AddMessageDto) {
    try {
      const { from, to, message } = addMessageDto;
      const user = await this.userRepository.findOne({ id: +from });
      const source_author = await this.userRepository.findOne({ id: +addMessageDto?.source_author_id });

      const newMessage = new MessageSchema();
      newMessage.message = message;
      newMessage.from = from;
      newMessage.to = to;
      newMessage.type = addMessageDto?.type;
      newMessage.file_url = addMessageDto?.file_url;
      newMessage.source = addMessageDto?.source;
      newMessage.source_id = addMessageDto?.source_id;
      newMessage.sourceAuthor = source_author;
      newMessage.conversation_id = (from > to) ? from + "_" + to : to + "_" + from;

      const createdMessage = await this.messageRepository
        .save(newMessage)
        .catch((err) => {
          console.log(err);
          return err;
        });

      if (createdMessage) {

        //========= Add Entry in Read message =========
        const msg_id = createdMessage.id;
        let readMessages = await this.readMessageRepository
          .createQueryBuilder('readmessage')
          .where('readmessage.owner_id IN (:owner_id)', { owner_id: +to })
          .andWhere('readmessage.sender_id IN (:sender_id)', { sender_id: +from })
          .getOne();
        if (readMessages) {
          readMessages.last_send_msg = msg_id;
        }
        else {
          readMessages = new ReadMessageSchema();
          readMessages.last_send_msg = msg_id;
          readMessages.last_read_msg = 0;
          readMessages.owner_id = +to;
          readMessages.sender_id = +from;
        }
        await this.readMessageRepository.save(readMessages);
        //================================================

        // Send Notification
        const notification_type = "CHAT";
        const noti_data = {
          user_id: msg_id.toString(),
          notification_type: notification_type,
          file: (addMessageDto?.file_url['url']) ? addMessageDto?.file_url['url'] : "",
          msg_type: addMessageDto?.type
        }
        this.fcmService.send(+to, user.username, message, noti_data, +from, notification_type);

        return {
          msg: 'Message added successfully.',
        };
      } else {
        return { msg: 'Failed to add message to the database' };
      }
    } catch (ex) {
      console.log(ex);
    }
  }
  async getMessages(getMessagesDto: GetMessagesDto) {
    try {
      const { from, to } = getMessagesDto;

      let messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoin('message.sourceAuthor', 'sourceAuthor')
        .addSelect(["sourceAuthor.id", "sourceAuthor.username", "sourceAuthor.profile_photo"])
        .where('message.from IN (:...users)', { users: [from, to] })
        .andWhere('message.to IN (:...users)', { users: [from, to] })
        .getMany();

      const projectedMessages = messages.map((msg) => {
        return {
          fromSelf: msg.from.toString() === from,
          message: msg.message,
          file_url: msg.file_url,
          type: msg.type,
          is_read: msg.is_read,
          source: msg.source,
          source_id: msg.source_id,
          source_author_id: (msg.sourceAuthor?.id) ? msg.sourceAuthor?.id : 0,
          source_author_name: (msg?.sourceAuthor?.username) ? msg?.sourceAuthor?.username : "",
          source_author_profile: (msg?.sourceAuthor?.profile_photo) ? msg?.sourceAuthor?.profile_photo : "",
          conversation_id: msg.conversation_id,
          created_at: msg.created_at.toLocaleString().replace(',', '')
        };
      });

      return projectedMessages;
    } catch (ex) {
      console.log(ex);
    }
  }

  async getUserList(id) {
    // var query = `SELECT u.id, u.username, u.profile_photo, tmp.msgId, tmp.last_msg, tmp.last_msg_time, u.is_admin as online_status,
    // (SELECT COUNT(id) FROM messages WHERE cast("from" as integer) = u.id AND "to" = '${id}' AND is_read = false) as unread_msg
    //   FROM (
    //       SELECT 
    //       distinct id as msgId, message as last_msg, created_at as last_msg_time, case when "from" = '${id}' then cast("to" as integer) else cast("from" as integer) end as userID, 
    //       ROW_NUMBER() OVER (PARTITION BY case when "from" = '${id}' then "to" else "from" end ORDER BY id) AS ROW_ID
    //       FROM messages
    //       WHERE ("from" = '${id}' or "to" = '${id}')
    //   )tmp 
    //   inner join users u on u.id = tmp.userID
    //   WHERE tmp.Row_Id = 1 and tmp.userId <> '${id}'
    //   ORDER BY tmp.msgId`;
    var query = `SELECT users2.id, users2.username, users2.profile_photo, subquery.id as msgId, subquery.message as last_msg, subquery.last_msg_time, users2.is_admin as online_status,
          (SELECT COUNT(id) FROM messages WHERE cast("from" as integer) = users2.id AND "to" = '${id}' AND is_read = false) as unread_msg
          FROM users
          JOIN
            (
              SELECT
                message,
                created_at as last_msg_time,
                row_number() OVER ( PARTITION BY CAST("from" AS integer) + CAST("to" AS integer) ORDER BY id DESC) AS row_num,
                CAST ("from" AS integer),
                CAST ("to" AS integer),
                id
              FROM messages
              GROUP BY id, "to", "from", message, created_at
            ) AS subquery ON ( ( subquery.from = users.id OR subquery.to = users.id)  AND row_num = 1 )
          JOIN users as users2 ON ( users2.id = CASE WHEN users.id = subquery.from THEN subquery.to ELSE subquery.from END )
      WHERE users.id = ${id}
      ORDER BY subquery.id DESC`;
    var userList = await this.queryManager.query(query);
    if (userList) {
      return {
        statusCode: 200,
        data: userList,
        message: "List fetched successfully",
      };
    }
    else {
      throw new BadRequestException({
        statusCode: 401,
        message: 'Users not found.',
      }).getResponse();
    }
  }

  async readMessage(readMessagesDto: ReadMessagesDto) {
    try {
      const { ownerId, senderId, msg_id } = readMessagesDto;

      let readMessages = await this.readMessageRepository
        .createQueryBuilder('readmessage')
        .where('readmessage.owner_id = :owner_id', { owner_id: ownerId })
        .andWhere('readmessage.sender_id = :sender_id', { sender_id: senderId })
        .getOne();
      if (readMessages) {
        readMessages.last_send_msg = msg_id;
        readMessages.last_read_msg = msg_id;
      }
      else {
        readMessages = new ReadMessageSchema();
        readMessages.last_send_msg = msg_id;
        readMessages.last_read_msg = msg_id;
        readMessages.owner_id = ownerId;
        readMessages.sender_id = senderId;
      }

      const createdMessage = await this.readMessageRepository
        .save(readMessages)
        .catch((err) => {
          console.log(err);
          return err;
        });

      let addMessage = await this.messageRepository
        .createQueryBuilder('message')
        .where('message.from = :from', { from: senderId })
        .andWhere('message.to = :to', { to: ownerId })
        .andWhere('message.is_read <> :true', { true: true })
        .andWhere('message.id <= :id', { id: msg_id })
        .getMany();
      const newArr = addMessage.map(el => ({ ...el, is_read: true, read_time: new Date() }));
      await this.messageRepository.save(newArr)

      if (createdMessage) {
        return { msg: 'success.' };
      } else {
        return { msg: 'Failed' };
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  async deleteMessage(id: number, user_id: number) {
    const checkType = `select * from messages where id=${id} AND CAST ("from" AS integer)=${user_id}`
    const checkTypedata = await this.queryManager.query(checkType)
    if (checkTypedata?.length <= 0) {
      return {
        data: false,
        message: `Message Not Found`
      }
    }

    const deleteQuery = `DELETE FROM public.messages
	  WHERE id='${id}' and CAST ("from" AS integer)=${user_id};`
    await this.queryManager.query(deleteQuery)
    return {
      status: 200,
      data: true,
      message: "Message Deleted"
    }
  }

  async deleteAllMessage(to_id: number, user_id: number) {

    const deleteQuery = `DELETE FROM public.messages
	  WHERE CAST ("from" AS integer)=${user_id} and CAST ("to" AS integer)=${to_id};`
    await this.queryManager.query(deleteQuery)
    return {
      status: 200,
      data: true,
      message: "Message Deleted"
    }
  }
}
