"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../lib/prisma";

export async function saveCuil(cuil: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "No autenticado." };
  }

  if (!/^\d{11}$/.test(cuil)) {
    return { error: "CUIL inválido. Debe tener 11 dígitos." };
  }

  const cuilNumber = BigInt(cuil);

  const existeAdmin = await db.administrador.findUnique({ where: { cuil: cuilNumber } });
  const existeCliente = await db.cliente.findUnique({ where: { cuil: cuilNumber } });

  if (!existeAdmin && !existeCliente) {
    return { error: "El CUIL ingresado no corresponde a un contribuyente registrado en el sistema. Contactá al administrador." };
  }

  await db.clerk_user.upsert({
    where: { id: userId },
    create: { id: userId, cuil },
    update: { cuil },
  });

  return { success: true };
}
