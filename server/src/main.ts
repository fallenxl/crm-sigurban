import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import { CORS, SWAGGER_CONFIG } from './constants';
import * as express from 'express';
import { User, UserSchema } from './modules/users/schemas';
import { Model } from 'mongoose';

const createNestServer = async () => {
  const app = await NestFactory.create(AppModule);


  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, SWAGGER_CONFIG);

  SwaggerModule.setup('docs/', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors(CORS);

  app.use(morgan('dev'));

  await app.listen(process.env.PORT || 3001);
  //  crear un usuario admin
  const userModel = app.get('UserModel') as Model<User>;
  const admin = await userModel.findOne({ email: process.env.ADMIN_EMAIL });
  if (!admin) {
    await userModel.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: process.env.ADMIN_ROLE,
      phone: process.env.ADMIN_PHONE,
      position: process.env.ADMIN_POSITION,
      genre: process.env.ADMIN_GENRE,
    });
  }

  console.log(`Application is running on: ${await app.getUrl()}`);

};

createNestServer();
