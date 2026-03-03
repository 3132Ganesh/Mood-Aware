import { z } from 'zod';
import { 
  insertUserSchema, users, 
  insertUserProfileSchema, userProfiles, 
  insertTaskSchema, tasks, 
  insertMoodLogSchema, moodLogs, 
  insertPlanSchema, plans, 
  insertPlanItemSchema, planItems, 
  insertDailyHabitSchema, dailyHabits, 
  insertFeelingsNoteSchema, feelingsNotes 
} from './schema';
import * as chatSchema from './models/chat';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.null(),
      },
    },
  },
  profile: {
    get: {
      method: 'GET' as const,
      path: '/api/profile',
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/profile',
      input: insertUserProfileSchema,
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
      },
    },
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
      },
    },
  },
  plans: {
    current: {
      method: 'GET' as const,
      path: '/api/plans/current',
      responses: {
        200: z.custom<typeof plans.$inferSelect & { items: (typeof planItems.$inferSelect & { task: typeof tasks.$inferSelect })[] }>(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/plans/generate',
      responses: {
        201: z.custom<typeof plans.$inferSelect>(),
      },
    },
    completeTask: {
      method: 'PATCH' as const,
      path: '/api/plans/:id/tasks/:taskId/complete',
      input: z.object({ isCompleted: z.boolean() }),
      responses: {
        200: z.custom<typeof planItems.$inferSelect>(),
      },
    },
  },
  mood: {
    log: {
      method: 'POST' as const,
      path: '/api/mood',
      input: insertMoodLogSchema,
      responses: {
        201: z.custom<typeof moodLogs.$inferSelect>(),
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/mood/history',
      responses: {
        200: z.array(z.custom<typeof moodLogs.$inferSelect>()),
      },
    },
  },
  habits: {
    log: {
      method: 'POST' as const,
      path: '/api/habits',
      input: insertDailyHabitSchema,
      responses: {
        201: z.custom<typeof dailyHabits.$inferSelect>(),
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/habits/history',
      responses: {
        200: z.array(z.custom<typeof dailyHabits.$inferSelect>()),
      },
    },
  },
  notes: {
    list: {
      method: 'GET' as const,
      path: '/api/notes',
      responses: {
        200: z.array(z.custom<typeof feelingsNotes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/notes',
      input: insertFeelingsNoteSchema,
      responses: {
        201: z.custom<typeof feelingsNotes.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
