export const authSchemas = {
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', example: 'user@example.com' },
          name: { type: 'string', example: 'John Doe' }
        }
      }
    },
    requestBodies: {
      RegisterRequest: {
        required: true,
        content: {
          'application/json': {
            schema: {
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 6 },
                name: { type: 'string' }
              }
            },
            example: {
              email: 'user@example.com',
              password: 'password123',
              name: 'John Doe'
            }
          }
        }
      },
      LoginRequest: {
        required: true,
        content: {
          'application/json': {
            example: {
              email: 'user@example.com',
              password: 'password123'
            }
          }
        }
      }
    },
    responses: {
      AuthSuccess: {
        description: 'Authentication successful',
        content: {
          'application/json': {
            example: {
              message: 'Login successful',
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              user: {
                id: 1,
                email: 'user@example.com',
                name: 'John Doe'
              }
            }
          }
        }
      },
      Unauthorized: {
        description: 'Invalid credentials'
      },
      Conflict: {
        description: 'Resource already exists'
      }
    }
  }
};
