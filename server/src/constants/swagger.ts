import { DocumentBuilder } from '@nestjs/swagger';
export const SWAGGER_CONFIG = new DocumentBuilder()
  .setTitle('NARANJA & MEDIA CRM API')
  .setDescription('API for Naranja & Media CRM')
  .setVersion('1.0')
  .addTag('Naranja & Media CRM')
  .build();
