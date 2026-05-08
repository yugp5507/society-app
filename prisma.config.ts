import path from 'path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  // @ts-expect-error earlyAccess is a valid Prisma 7 config option
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: 'postgresql://postgres:8866@localhost:5432/society_db',
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      return new PrismaPg({
        connectionString: 'postgresql://postgres:8866@localhost:5432/society_db',
      })
    },
  },
})