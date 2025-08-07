import { PrismaClient } from './src/prisma/generated/client/index.js';
const prisma = new PrismaClient();

async function migrate() {
  const blogs = await prisma.blog.findMany();
  for (const blog of blogs) {
    if (blog.contentJson) {
      await prisma.blog.update({
        where: { id: blog.id },
        data: { content: blog.contentJson },
      });
    }
  }
  console.log('Copied contentJson to content for all blogs');
  await prisma.$disconnect();
}

migrate();