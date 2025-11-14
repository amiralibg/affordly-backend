import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ganjino API',
      version: '1.0.0',
      description: 'API documentation for Ganjino (گنجینو) - A savings goal tracking application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'https://ganjino-api.amiralibg.xyz',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../models/*.ts'),
    path.join(__dirname, '../models/*.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
