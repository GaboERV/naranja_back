import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173', // Permitir solicitudes desde tu aplicación React
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], // Métodos permitidos
    credentials: true, // Si necesitas enviar
  });
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Naranja')
    .setDescription('Documentación de la API para de Itzchel')
    .setVersion('1.0')
    .addBearerAuth() // Agregar autenticación con JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Habilitar en /api

  await app.listen(3000);
}
bootstrap();
