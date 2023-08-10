import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getManager } from 'typeorm';
import { AppModule } from './app.module';
import { authenticat } from './common/middleware/authenticat.middleware';
const socket = require("socket.io");

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(authenticat);
  const config = new DocumentBuilder()
    .setTitle('The nft Rest API')
    .setVersion('1.0')
    .setDescription("Login Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkIjoyfSwiaWF0IjoxNjU0NjU3NjEyLCJleHAiOjQzMzY1NDY1NzYxMn0.-6I43Xre2yjGXTRkQg3kyZF7hv-7bqBNIo1KPuzBkOg")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  const PORT = process.env.PORT || 1337;
  const server = await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
  const queryManager = getManager();
  const io = socket(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  global.onlineUsers = new Map();
  io.on("connection", async (socket) => {
    console.log("new connection established");
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      console.log(`${userId} person added via add-user`)
      global.onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
      const sendUserSocket = global.onlineUsers.get(data.to);
      data.conversation_id = (+data.from > +data.to) ? data.from + "_" + data.to : data.to + "_" + data.from;
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data);
      }
    });

    socket.on("read-msg", async (message_id) => {
      const query = `SELECT * FROM messages WHERE id = ${message_id}`;
      var MessageData = await queryManager.query(query);
      const msg = MessageData[0];
      const sendUserSocket = global.onlineUsers.get(msg.from);

      const readchkquery = `SELECT * FROM read_messages WHERE owner_id = ${msg.to} AND sender_id = ${msg.from}`;
      var ReadMessageChkData = await queryManager.query(readchkquery);
      if (ReadMessageChkData.length > 0) {

        const readquery = `UPDATE read_messages SET last_read_msg = ${message_id} WHERE id = ${ReadMessageChkData[0]?.id}`;
        await queryManager.query(readquery);
      }
      else {
        const readquery = `INSERT INTO read_messages (owner_id, sender_id, last_send_msg, last_read_msg, conversation_id) VALUES (${msg.to},${msg.from},${message_id},0,${msg.conversation_id})`;
        await queryManager.query(readquery);
      }

      const readquery = `UPDATE messages SET is_read = ${true}, read_time = NOW() WHERE "from" = '${msg.from}' AND "to" = '${msg.to}' AND is_read <> true AND id < ${message_id}`;
      await queryManager.query(readquery);

      // if (sendUserSocket) {
      //   socket.to(sendUserSocket).emit("msg-recieve", msg);
      // }
    });
  });
}
bootstrap();

process.on('uncaughtException', (err) => {
  console.log(err);
});
process.on('unhandledRejection', (err) => {
  console.log(err);
});
