import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "../../lib/prisma"; // Tu instancia configurada de Prisma
import DashboardClient from "@/components/dashboard-client";
import DashboardAdmin from "@/components/dashboard-admin";
import CuilSetup from "@/components/cuil-setup";

export default async function DashboardPage() {
  // 1. Validamos la sesión de Clerk de forma segura en el servidor
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!userEmail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Cuenta incompleta</h1>
        <p className="text-slate-600 max-w-xl">
          No se pudo obtener el correo electrónico de tu sesión de Clerk. Por favor revisá tu cuenta o contactá al administrador.
        </p>
      </div>
    );
  }

  // Sacamos el nombre legible directo de Clerk
  const nombreUsuarioClerk = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Usuario";

  // Replicamos el usuario autenticado en clerk_user (Neon)
  const clerkUser = await db.clerk_user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: userEmail,
      firstName: user?.firstName || undefined,
      lastName: user?.lastName || undefined,
    },
    update: {
      email: userEmail,
      firstName: user?.firstName || undefined,
      lastName: user?.lastName || undefined,
    },
  });

  // También replicamos en la tabla usuario si no existe
  const usuarioExistente = await db.usuario.findFirst({ where: { email: userEmail } });
  if (!usuarioExistente) {
    await db.usuario.create({
      data: {
        email: userEmail,
        nombre_usuario: user?.firstName || undefined,
        apellido_usuario: user?.lastName || undefined,
      },
    });
  }

  const userCuil = typeof clerkUser.cuil === "string" ? clerkUser.cuil.replace(/\D/g, "") : undefined;
  if (!userCuil || !/^\d{11}$/.test(userCuil)) {
    return <CuilSetup userName={nombreUsuarioClerk} />;
  }

  const userCuilNumber = BigInt(userCuil);

  // 2. Buscamos primero si este CUIL pertenece a la tabla de administradores
  const dbAdmin = await db.administrador.findUnique({
    where: { cuil: userCuilNumber },
    select: { cuil: true, id_estudio: true }
  });

  // 3. VISTA ADMINISTRADOR (Vistas 9 y 11)
  if (dbAdmin) {
    const clientes = await db.cliente.findMany({
      where: { id_estudio: dbAdmin.id_estudio },
      select: { 
        cuil: true, 
        liquidacion: {
          select: {
            estado: true
          }
        }
      }
    });
    
    // Mapeamos al formato plano que requiere <DashboardAdmin />
    const clientesData = clientes.map(c => ({
      id: c.cuil.toString(),
      nombre: `Cliente CUIL: ${c.cuil}`, 
      cuit: c.cuil.toString(),
      estado: c.liquidacion.some(l => l.estado?.toUpperCase() === "PENDIENTE") ? ("pendiente" as const) : ("al_dia" as const)
    }));

    return <DashboardAdmin adminName={nombreUsuarioClerk} clientesData={clientesData} />;
  }

  // 4. VISTA CLIENTE (Vistas 3, 4 y 5) - Si no entró en el if de Admin
  const dbCliente = await db.cliente.findUnique({
    where: { cuil: userCuilNumber },
    include: {
      liquidacion: {
        include: {
          impuesto: true,
          comprobante: true
        }
      }
    }
  });

  // Si no está registrado físicamente en Neon, mostramos feedback en vez de redireccionar.
  if (!dbCliente) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Cuenta no registrada</h1>
        <p className="text-slate-600 max-w-xl">
          No hay un contribuyente asociado a ese CUIL en la base de datos. Verificá tu CUIL o contactá al soporte.
        </p>
      </div>
    );
  }

  // Formateamos las liquidaciones respetando los nombres estrictos de tu schema.prisma
  const liquidacionesFormateadas = dbCliente.liquidacion.map((liq) => {
    // Tomamos la fecha del comprobante o el periodo fiscal como referencia de vencimiento
    const fechaReferencia = liq.periodo_fiscal || liq.comprobante?.periodo_fiscal;

    return {
      id: liq.numero_boleta.toString(), // <-- Cambiado de id_liquidacion a numero_boleta
      impuesto: liq.impuesto?.formato || "Impuesto General", // <-- Cambiado de nombre_impuesto a formato
      periodo: liq.periodo_fiscal 
        ? new Date(liq.periodo_fiscal).toLocaleDateString("es-AR", { month: "long", year: "numeric" }) 
        : "Período Actual",
      monto: liq.importe || 0,
      estado: (liq.estado?.toUpperCase() === "PAGADO" ? "PAGADO" : "PENDIENTE") as "PAGADO" | "PENDIENTE",
      fechaVencimiento: fechaReferencia 
        ? new Date(fechaReferencia).toLocaleDateString("es-AR") 
        : "Sin fecha"
    };
  });

  return (
    <DashboardClient 
      clienteName={nombreUsuarioClerk} 
      liquidaciones={liquidacionesFormateadas} 
    />
  );
}