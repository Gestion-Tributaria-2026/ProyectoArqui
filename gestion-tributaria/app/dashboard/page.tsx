import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "../../lib/prisma"; // Tu instancia configurada de Prisma
import DashboardClient from "@/components/dashboard-client";
import DashboardAdmin from "@/components/dashboard-admin";

export default async function DashboardPage() {
  // 1. Validamos la sesión de Clerk de forma segura en el servidor
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!userEmail) {
    redirect("/");
  }

  // Sacamos el nombre legible directo de Clerk para no depender de campos inexistentes en BD
  const nombreUsuarioClerk = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Usuario";

  // Obtenemos el CUIL guardado en los publicMetadata de Clerk
  const userCuil = user?.publicMetadata?.cuil as number | undefined;

  if (!userCuil) {
    // Si todavía no configuraste el CUIL en el metadata de este usuario de Clerk,
    // te redirige temporalmente para evitar que explote la consulta.
    redirect("/");
  }

  // 2. Buscamos primero si este CUIL pertenece a la tabla de administradores
  const dbAdmin = await db.administrador.findUnique({
    where: { cuil: userCuil },
    select: { cuil: true }
  });

  // 3. VISTA ADMINISTRADOR (Vistas 9 y 11)
  if (dbAdmin) {
    const clientes = await db.cliente.findMany({
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
      estado: c.liquidacion.some(l => l.estado?.toUpperCase() === "PENDIENTE") ? "pendiente" : "al_dia"
    }));

    return <DashboardAdmin adminName={nombreUsuarioClerk} clientesData={clientesData} />;
  }

  // 4. VISTA CLIENTE (Vistas 3, 4 y 5) - Si no entró en el if de Admin
  const dbCliente = await db.cliente.findUnique({
    where: { cuil: userCuil },
    include: {
      liquidacion: {
        include: {
          impuesto: true,
          comprobante: true
        }
      }
    }
  });

  // Si no está registrado físicamente en Neon, lo sacamos
  if (!dbCliente) {
    redirect("/"); 
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