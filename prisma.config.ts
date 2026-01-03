import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config({ path: '.env.development.local' });

export default defineConfig({
  schema: 'src/prisma/schema.prisma',
  migrations: {
    path: 'src/prisma/migrations',
  },
});
