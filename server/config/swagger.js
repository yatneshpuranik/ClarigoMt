import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AuthDash MERN API',
      version: '1.0.0',
      description:
        'Official OpenAPI documentation for secure MERN authentication and role-based user management dashboard.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter your signed JWT token obtained from /api/auth/login or /api/auth/signup.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '6a8c0c814fb125681a4d7443',
            },
            fullName: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['Admin', 'User'],
              example: 'User',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password', 'role'],
          properties: {
            fullName: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123',
            },
            role: {
              type: 'string',
              enum: ['Admin', 'User'],
              example: 'User',
            },
            adminKey: {
              type: 'string',
              description: 'Required if role is Admin. Must match the server ADMIN_SIGNUP_KEY.',
              example: 'admin123',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'adminpassword123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        UserCreateRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password', 'role'],
          properties: {
            fullName: {
              type: 'string',
              example: 'Jane Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'jane@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123',
            },
            role: {
              type: 'string',
              enum: ['Admin', 'User'],
              example: 'User',
            },
          },
        },
        UserUpdateRequest: {
          type: 'object',
          properties: {
            fullName: {
              type: 'string',
              example: 'Jane Updated',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'jane.updated@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Optional. Leave empty to keep existing password unchanged.',
              example: 'newpassword123',
            },
            role: {
              type: 'string',
              enum: ['Admin', 'User'],
              example: 'Admin',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Invalid email or password',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints for user registration, login, and profile fetching',
      },
      {
        name: 'User Management',
        description: 'Admin-only endpoints for viewing, adding, editing, and deleting users',
      },
    ],
    paths: {
      '/api/auth/signup': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user or admin account',
          description:
            'Creates a new user record with hashed password and returns signed JWT token + user details.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SignupRequest',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Validation Error (Missing field, invalid email, password < 6 chars)',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '409': {
              description: 'Duplicate Email Conflict',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate user credentials',
          description: 'Verifies email & password with bcrypt and returns signed JWT token + user details.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Validation Error (Missing fields, invalid email)',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '401': {
              description: 'Invalid Credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Fetch current authenticated user profile',
          description: 'Requires JWT authentication. Returns active user account details.',
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Profile retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized (Missing or invalid JWT token)',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/users': {
        get: {
          tags: ['User Management'],
          summary: 'Get all registered users',
          description:
            '**Admin Only**. Fetches array of all registered user accounts with passwords omitted.',
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of users retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized (Missing or invalid JWT token)',
            },
            '403': {
              description: 'Forbidden (Non-Admin user attempting to access Admin endpoint)',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['User Management'],
          summary: 'Create a new user account',
          description:
            '**Admin Only**. Admin endpoint to create a user account. Password is required.',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserCreateRequest',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
            '400': {
              description: 'Validation Error',
            },
            '401': {
              description: 'Unauthorized',
            },
            '403': {
              description: 'Forbidden (Non-Admin user)',
            },
            '409': {
              description: 'Duplicate Email Conflict',
            },
          },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['User Management'],
          summary: 'Get user details by ID',
          description: '**Admin Only**. Fetches a specific user record by MongoDB ID.',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Target MongoDB User ID',
              schema: {
                type: 'string',
              },
              example: '6a8c0c814fb125681a4d7443',
            },
          ],
          responses: {
            '200': {
              description: 'User details retrieved',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
            '400': {
              description: 'Invalid User ID format',
            },
            '401': {
              description: 'Unauthorized',
            },
            '403': {
              description: 'Forbidden (Non-Admin user)',
            },
            '404': {
              description: 'User Not Found',
            },
          },
        },
        put: {
          tags: ['User Management'],
          summary: 'Update an existing user account',
          description:
            '**Admin Only**. Updates user fields. Password field is optional.',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Target MongoDB User ID',
              schema: {
                type: 'string',
              },
              example: '6a8c0c814fb125681a4d7443',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserUpdateRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'User updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
            '400': {
              description: 'Validation Error',
            },
            '401': {
              description: 'Unauthorized',
            },
            '403': {
              description: 'Forbidden (Non-Admin user)',
            },
            '404': {
              description: 'User Not Found',
            },
          },
        },
        delete: {
          tags: ['User Management'],
          summary: 'Delete a user account',
          description:
            '**Admin Only**. Removes the specified user account. Self-deletion of the active Admin is blocked.',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Target MongoDB User ID',
              schema: {
                type: 'string',
              },
              example: '6a8c0c814fb125681a4d7443',
            },
          ],
          responses: {
            '200': {
              description: 'User deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'User deleted successfully' },
                      id: { type: 'string', example: '6a8c0c814fb125681a4d7443' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad Request (Self-deletion prevention)',
            },
            '401': {
              description: 'Unauthorized',
            },
            '403': {
              description: 'Forbidden (Non-Admin user)',
            },
            '404': {
              description: 'User Not Found',
            },
          },
        },
      },
    },
  },
  apis: [], // Specifications defined cleanly in definition object above
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
