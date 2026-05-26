import { prismaClient as db } from "../pg";
import { DrawSchema, type DrawElement } from "@repo/common";
import type { Prisma } from "@prisma/client";

export async function getShapesByRoom(roomId: string): Promise<DrawElement[]> {
  const rows = await db.canvasElements.findMany({
    where: { roomId },
    orderBy: { zIndex: "asc" },
  });
  return rows.map((row) => DrawSchema.parse(row.data));
}

export async function createElement(
  roomId: string,
  element: DrawElement,
  zIndex: number,
): Promise<void> {
  await db.canvasElements.create({
    data: {
      id: element.id,
      type: element.type,
      zIndex,
      roomId,
      data: element as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function updateElement(element: DrawElement): Promise<void> {
  await db.canvasElements.update({
    where: { id: element.id },
    data: { data: element as unknown as Prisma.InputJsonValue },
  });
}

export async function upsertElement(element: DrawElement, roomId: string) {
  await db.canvasElements.upsert({
    where: { id: element.id },
    update: { data: element as unknown as Prisma.InputJsonValue },
    create: {
      id: element.id,
      type: element.type,
      roomId,
      data: element as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function upsertManyElements(
  elements: DrawElement[],
  roomId: string,
) {
  await db.$transaction(
    elements.map((element) =>
      db.canvasElements.upsert({
        where: { id: element.id },
        update: { data: element as unknown as Prisma.InputJsonValue },
        create: {
          id: element.id,
          type: element.type,
          roomId,
          data: element as unknown as Prisma.InputJsonValue,
        },
      }),
    ),
  );
}

export async function deleteManyElements(
  roomId: string,
  elementIds: string[],
): Promise<void> {
  await db.canvasElements.deleteMany({
    where: { id: { in: elementIds }, roomId },
  });
}

export async function deleteElement(
  roomId: string,
  elementId: string,
): Promise<void> {
  await db.canvasElements.delete({ where: { id: elementId, roomId } });
}

export async function deleteElementByRoom(roomId: string): Promise<void> {
  await db.canvasElements.deleteMany({ where: { roomId } });
}
