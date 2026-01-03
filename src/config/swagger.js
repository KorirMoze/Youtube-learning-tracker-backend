import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YouTube Learning Tracker API',
      version: '1.0.0',
      description: 'API for tracking YouTube educational content',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
    Video: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        youtube_id: { type: 'string', example: 'dQw4w9WgXcQ' },
        title: { type: 'string', example: 'Node.js Crash Course' },
        channel_name: { type: 'string', example: 'Traversy Media' },
        channel_id: { type: 'string', example: 'UC29ju8bIPH5as8OGnQzwJyA' },
        thumbnail_url: { type: 'string' },
        duration: { type: 'integer', example: 1200 },
        watch_time: { type: 'integer', example: 900 },
        completion_percentage: { type: 'integer', example: 75 },
        is_completed: { type: 'boolean', example: false },
        category: { type: 'string', example: 'Backend' },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
        notes: { type: 'string', nullable: true },
        rating: { type: 'integer', nullable: true, example: 4 },
        watched_at: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  },
  security: [{ bearerAuth: [] }],

    }
  },
  apis: ['./src/routes/*.js'] // Path to route files
};

export default swaggerJsdoc(options);