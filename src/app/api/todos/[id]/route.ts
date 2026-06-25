import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const data = await request.json();
  const todo = await prisma.todo.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json(todo);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.todo.delete({
    where: { id: Number(id) },
  });
  return NextResponse.json({ message: 'Todo deleted' });
}
