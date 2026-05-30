import { env } from "../config/env";

function buildCrudPaths(
  tag: string,
  singularLabel: string,
  path: string,
  requestSchema: string,
  secured = true,
  allowCreate = true,
) {
  const security = secured ? [{ bearerAuth: [] }] : [];

  return {
    [path]: {
      get: {
        tags: [tag],
        security,
        summary: `List ${tag.toLowerCase()}`,
        responses: {
          200: {
            description: "Success",
          },
        },
      },
      ...(allowCreate
        ? {
            post: {
              tags: [tag],
              security,
              summary: `Create ${singularLabel.toLowerCase()}`,
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      $ref: `#/components/schemas/${requestSchema}`,
                    },
                  },
                },
              },
              responses: {
                201: {
                  description: "Created",
                },
              },
            },
          }
        : {}),
    },
    [`${path}/{id}`]: {
      get: {
        tags: [tag],
        security,
        summary: `Get ${singularLabel.toLowerCase()} by id`,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Success",
          },
          404: {
            description: "Not found",
          },
        },
      },
      patch: {
        tags: [tag],
        security,
        summary: `Update ${singularLabel.toLowerCase()}`,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${requestSchema}`,
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated",
          },
        },
      },
      delete: {
        tags: [tag],
        security,
        summary: `Delete ${singularLabel.toLowerCase()}`,
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
          },
        },
      },
    },
  };
}

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Treeningute Platvorm API",
    version: "1.0.0",
    description: "Backend API for the online training platform project.",
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Users" },
    { name: "Categories" },
    { name: "Trainers" },
    { name: "Videos" },
    { name: "Packages" },
    { name: "Playlists" },
    { name: "Subscriptions" },
    { name: "Reports" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Auth"],
        summary: "Health check",
        responses: {
          200: {
            description: "API is running",
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Registered",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Logged in",
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        summary: "Logout user",
        responses: {
          200: {
            description: "Logged out",
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        summary: "Current user profile",
        responses: {
          200: {
            description: "Authenticated user",
          },
        },
      },
    },
    ...buildCrudPaths("Users", "User", "/api/users", "UserUpdateRequest", true, false),
    ...buildCrudPaths("Categories", "Category", "/api/categories", "CategoryRequest"),
    ...buildCrudPaths("Trainers", "Trainer", "/api/trainers", "TrainerRequest"),
    ...buildCrudPaths("Videos", "Video", "/api/videos", "VideoRequest"),
    ...buildCrudPaths("Packages", "Package", "/api/packages", "PackageRequest"),
    ...buildCrudPaths("Playlists", "Playlist", "/api/playlists", "PlaylistRequest"),
    ...buildCrudPaths("Subscriptions", "Subscription", "/api/subscriptions", "SubscriptionRequest"),
    "/api/reports/member/access": {
      get: {
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        summary: "Get current member access overview view",
        responses: {
          200: {
            description: "Access overview loaded",
          },
        },
      },
    },
    "/api/reports/member/progress": {
      get: {
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        summary: "Get current member progress snapshot view",
        responses: {
          200: {
            description: "Progress snapshot loaded",
          },
        },
      },
    },
    "/api/reports/member/completions": {
      post: {
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        summary: "Mark a workout as completed with the database procedure",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/WorkoutCompletionRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Workout completion stored",
          },
        },
      },
    },
    "/api/reports/trainer/programs": {
      get: {
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        summary: "Get trainer program overview view",
        responses: {
          200: {
            description: "Trainer program overview loaded",
          },
        },
      },
    },
    "/api/reports/trainer/videos": {
      get: {
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        summary: "Get trainer video catalog view",
        responses: {
          200: {
            description: "Trainer video catalog loaded",
          },
        },
      },
    },
    "/api/reports/admin/revenue": {
      get: {
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        summary: "Get admin revenue summary view",
        responses: {
          200: {
            description: "Revenue summary loaded",
          },
        },
      },
    },
    "/api/reports/admin/content-quality": {
      get: {
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        summary: "Get admin content quality view",
        responses: {
          200: {
            description: "Content quality summary loaded",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
        },
      },
      UserUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          preferredLanguage: { type: "string" },
          accountStatus: { type: "string" },
          roleCode: { type: "string" },
        },
      },
      CategoryRequest: {
        type: "object",
        properties: {
          categoryName: { type: "string" },
        },
      },
      TrainerRequest: {
        type: "object",
        properties: {
          trainerName: { type: "string" },
          bio: { type: "string" },
          startDate: { type: "string", format: "date" },
        },
      },
      VideoRequest: {
        type: "object",
        properties: {
          title: { type: "string" },
          duration: { type: "integer" },
          videoURL: { type: "string", format: "uri" },
          language: { type: "string" },
          equipment: { type: "string" },
          shortDescription: { type: "string" },
          trainerId: { type: "integer" },
          categoryId: { type: "integer" },
          difficultyLevelId: { type: "integer" },
          accessTier: { type: "string" },
          isFeatured: { type: "boolean" },
        },
      },
      PackageRequest: {
        type: "object",
        properties: {
          planName: { type: "string" },
          price: { type: "number" },
          durationMonths: { type: "integer" },
          accessTier: { type: "string" },
          isActive: { type: "boolean" },
          maxActivePrograms: { type: "integer" },
        },
      },
      PlaylistRequest: {
        type: "object",
        properties: {
          playlistName: { type: "string" },
          videoIds: {
            type: "array",
            items: {
              type: "integer",
            },
          },
        },
      },
      SubscriptionRequest: {
        type: "object",
        properties: {
          planId: { type: "integer" },
          userId: { type: "integer" },
          startDate: { type: "string", format: "date-time" },
          autoRenew: { type: "boolean" },
          paymentMethod: { type: "string" },
        },
      },
      WorkoutCompletionRequest: {
        type: "object",
        required: ["videoId"],
        properties: {
          videoId: { type: "integer" },
          secondsWatched: { type: "integer" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          note: { type: "string" },
        },
      },
    },
  },
};
