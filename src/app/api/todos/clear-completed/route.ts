import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE() {
  await prisma.todo.deleteMany({
    where: { done: true },
  });
  return NextResponse.json({ message: 'Completed todos deleted' });
}
