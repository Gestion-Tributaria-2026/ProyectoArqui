import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Cargar variables de entorno
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL no definida en .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: DATABASE_URL }),
});

// Datos de admins ficticios
const adminsData = [
  {
    clerkId: "user_3EJJs1npSpJinSKMvobwUsFwrJj",
    email: "admin@example.com",
    name: "admin",
    cuil: "10987654321",
  },
  {
    clerkId: "user_ADMIN2_fake_id_123456789",
    email: "contador.perez@example.com",
    name: "Juan Pérez",
    cuil: "10456789123",
  },
  {
    clerkId: "user_ADMIN3_fake_id_987654321",
    email: "contador.garcia@example.com",
    name: "María García",
    cuil: "10789123456",
  },
];

// Datos de clientes ficticios - más clientes asignados al admin principal
const clientesData = [
  {
    clerkId: "user_3EJJaBVKdlCqD40E4PglLpJyUPR",
    email: "cliente@example.com",
    name: "cliente",
    cuil: "20123456789",
    adminIndex: 0, // admin@example.com
  },
  {
    clerkId: "user_CLIENT2_fake_id_111111111",
    email: "empresa.Lopez@example.com",
    name: "Carlos López",
    cuil: "20456789012",
    adminIndex: 0, // admin@example.com
  },
  {
    clerkId: "user_CLIENT3_fake_id_222222222",
    email: "negocio.martinez@example.com",
    name: "Laura Martínez",
    cuil: "20789012345",
    adminIndex: 0, // admin@example.com
  },
  {
    clerkId: "user_CLIENT4_fake_id_333333333",
    email: "empresa.rodriguez@example.com",
    name: "Roberto Rodríguez",
    cuil: "20012345678",
    adminIndex: 1, // Juan Pérez
  },
  {
    clerkId: "user_CLIENT5_fake_id_444444444",
    email: "empresa.fernandez@example.com",
    name: "Ana Fernández",
    cuil: "20345678901",
    adminIndex: 0, // admin@example.com
  },
  {
    clerkId: "user_CLIENT6_fake_id_555555555",
    email: "negocio.sanchez@example.com",
    name: "Pedro Sánchez",
    cuil: "20678901234",
    adminIndex: 2, // María García
  },
  {
    clerkId: "user_CLIENT7_fake_id_666666666",
    email: "empresa.torres@example.com",
    name: "Santiago Torres",
    cuil: "20901234567",
    adminIndex: 0, // admin@example.com
  },
  {
    clerkId: "user_CLIENT8_fake_id_777777777",
    email: "negocio.moreno@example.com",
    name: "Valentina Moreno",
    cuil: "20234567890",
    adminIndex: 1, // Juan Pérez
  },
];

async function main() {
  try {
    console.log("🧹 Limpiando datos existentes...");

    // Eliminar en orden de dependencias
    await prisma.turno.deleteMany();
    await prisma.inscripto_en.deleteMany();
    await prisma.liquidacion.deleteMany();
    await prisma.comprobante.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.contador.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.clerk_user.deleteMany();
    await prisma.impuesto.deleteMany();
    await prisma.entidad_tributaria.deleteMany();
    await prisma.estudio_contable.deleteMany();

    console.log("✓ Base de datos limpiada\n");

    // Obtener o crear el estudio contable
    console.log("📁 Creando estudio contable...");
    const estudio = await prisma.estudio_contable.create({ data: {} });
    console.log("✓ Estudio contable creado:", estudio.id_estudio);

    // Crear admins
    console.log("\n📋 Creando admins (contadores)...");
    for (const admin of adminsData) {
      const cuilNum = BigInt(admin.cuil);

      // Crear usuario
      await prisma.usuario.upsert({
        where: { CUIL_usuario: cuilNum },
        update: {
          nombre_usuario: admin.name,
          email: admin.email,
        },
        create: {
          CUIL_usuario: cuilNum,
          nombre_usuario: admin.name,
          email: admin.email,
        },
      });

      // Crear contador
      await prisma.contador.upsert({
        where: { cuil: cuilNum },
        update: { id_estudio: estudio.id_estudio },
        create: { cuil: cuilNum, id_estudio: estudio.id_estudio },
      });

      // Crear clerk_user
      await prisma.clerk_user.upsert({
        where: { id: admin.clerkId },
        create: {
          id: admin.clerkId,
          email: admin.email,
          firstName: admin.name,
          cuil: admin.cuil,
          rol: "admin",
        },
        update: {
          email: admin.email,
          firstName: admin.name,
          cuil: admin.cuil,
          rol: "admin",
        },
      });

      console.log(`  ✓ Admin: ${admin.name} (${admin.email})`);
    }

    // Crear clientes
    console.log("\n👥 Creando clientes...");
    for (const cliente of clientesData) {
      const cuilNum = BigInt(cliente.cuil);
      const adminCuil = BigInt(adminsData[cliente.adminIndex].cuil);

      // Crear usuario
      await prisma.usuario.upsert({
        where: { CUIL_usuario: cuilNum },
        update: {
          nombre_usuario: cliente.name,
          email: cliente.email,
        },
        create: {
          CUIL_usuario: cuilNum,
          nombre_usuario: cliente.name,
          email: cliente.email,
        },
      });

      // Crear cliente
      await prisma.cliente.upsert({
        where: { cuil: cuilNum },
        update: {
          id_estudio: estudio.id_estudio,
          contador: adminCuil,
        },
        create: {
          cuil: cuilNum,
          id_estudio: estudio.id_estudio,
          contador: adminCuil,
        },
      });

      // Crear clerk_user
      await prisma.clerk_user.upsert({
        where: { id: cliente.clerkId },
        create: {
          id: cliente.clerkId,
          email: cliente.email,
          firstName: cliente.name,
          cuil: cliente.cuil,
          rol: "cliente",
        },
        update: {
          email: cliente.email,
          firstName: cliente.name,
          cuil: cliente.cuil,
          rol: "cliente",
        },
      });

      const adminName = adminsData[cliente.adminIndex].name;
      console.log(`  ✓ Cliente: ${cliente.name} (${cliente.email}) → asignado a ${adminName}`);
    }

    // Crear entidades tributarias
    console.log("\n🏛️ Creando entidades tributarias...");
    const entidadesMap: Record<string, number> = {};
    const entidadTributariaData = [
      { nombre: "AFIP", url: "https://www.afip.gob.ar" },
      { nombre: "ARBA", url: "https://www.arba.gov.ar" },
      { nombre: "AGIP", url: "https://www.agip.gob.ar" },
      { nombre: "DGI", url: "https://www.dgi.gub.uy" },
    ];
    for (const entidad of entidadTributariaData) {
      const created = await prisma.entidad_tributaria.create({
        data: { nombre: entidad.nombre, url: entidad.url },
      });
      entidadesMap[entidad.nombre] = created.id_entidad;
      console.log(`  ✓ ${entidad.nombre}`);
    }

    // Crear impuestos
    console.log("\n💰 Creando impuestos...");
    const impuestosMap: Record<string, number> = {};
    const impuestosData = [
      { formato: "IVA" },
      { formato: "Ganancias" },
      { formato: "Ingresos Brutos" },
      { formato: "Bienes Personales" },
      { formato: "Monotributo" },
    ];
    for (const impuesto of impuestosData) {
      const created = await prisma.impuesto.create({
        data: { formato: impuesto.formato },
      });
      impuestosMap[impuesto.formato] = created.id_impuesto;
      console.log(`  ✓ ${impuesto.formato}`);
    }

    // Crear inscripciones
    console.log("\n📋 Creando inscripciones en entidades...");
    const inscripcionesData = [
      { clienteIndex: 0, entidad: "AFIP", clave: "afip-20123456789" },
      { clienteIndex: 0, entidad: "ARBA", clave: "arba-20123456789" },
      { clienteIndex: 1, entidad: "AFIP", clave: "afip-20456789012" },
      { clienteIndex: 1, entidad: "AGIP", clave: "agip-20456789012" },
      { clienteIndex: 2, entidad: "AFIP", clave: "afip-20789012345" },
      { clienteIndex: 3, entidad: "ARBA", clave: "arba-20012345678" },
      { clienteIndex: 4, entidad: "AFIP", clave: "afip-20345678901" },
      { clienteIndex: 4, entidad: "DGI", clave: "dgi-20345678901" },
      { clienteIndex: 5, entidad: "AFIP", clave: "afip-20678901234" },
      { clienteIndex: 6, entidad: "AGIP", clave: "agip-20901234567" },
      { clienteIndex: 7, entidad: "AFIP", clave: "afip-20234567890" },
      { clienteIndex: 7, entidad: "ARBA", clave: "arba-20234567890" },
    ];
    for (const inscripcion of inscripcionesData) {
      const clienteCuil = BigInt(clientesData[inscripcion.clienteIndex].cuil);
      const entidadId = entidadesMap[inscripcion.entidad];
      await prisma.inscripto_en.create({
        data: {
          cuil_cliente: clienteCuil,
          id_entidad: entidadId,
          clave: inscripcion.clave,
        },
      });
    }
    console.log(`  ✓ ${inscripcionesData.length} inscripciones creadas`);

    // Crear liquidaciones y comprobantes
    console.log("\n📊 Creando liquidaciones y comprobantes...");
    const liquidacionesData = [
      { clienteIndex: 0, impuesto: "IVA", mes: 0, importe: 15000.50, estado: "PAGADO" },
      { clienteIndex: 0, impuesto: "Ganancias", mes: 1, importe: 22300.00, estado: "PENDIENTE" },
      { clienteIndex: 1, impuesto: "IVA", mes: 2, importe: 18750.75, estado: "PAGADO" },
      { clienteIndex: 1, impuesto: "Ingresos Brutos", mes: 3, importe: 31200.00, estado: "PENDIENTE" },
      { clienteIndex: 2, impuesto: "IVA", mes: 4, importe: 9800.25, estado: "PAGADO" },
      { clienteIndex: 2, impuesto: "Bienes Personales", mes: 5, importe: 45000.00, estado: "PENDIENTE" },
      { clienteIndex: 3, impuesto: "Ganancias", mes: 6, importe: 12450.00, estado: "PAGADO" },
      { clienteIndex: 3, impuesto: "Monotributo", mes: 7, importe: 27600.00, estado: "PENDIENTE" },
      { clienteIndex: 4, impuesto: "IVA", mes: 8, importe: 19200.50, estado: "PAGADO" },
      { clienteIndex: 4, impuesto: "Ingresos Brutos", mes: 9, importe: 35000.00, estado: "PENDIENTE" },
      { clienteIndex: 5, impuesto: "Bienes Personales", mes: 10, importe: 8700.00, estado: "PAGADO" },
      { clienteIndex: 5, impuesto: "IVA", mes: 11, importe: 52000.00, estado: "PENDIENTE" },
      { clienteIndex: 6, impuesto: "Ganancias", mes: 0, importe: 8000.00, estado: "PENDIENTE" },
      { clienteIndex: 6, impuesto: "Monotributo", mes: 2, importe: 11000.00, estado: "PAGADO" },
      { clienteIndex: 7, impuesto: "IVA", mes: 4, importe: 16500.00, estado: "PENDIENTE" },
    ];
    let comprobantesCount = 0;
    for (const liq of liquidacionesData) {
      const clienteCuil = BigInt(clientesData[liq.clienteIndex].cuil);
      const impuestoId = impuestosMap[liq.impuesto];
      let numeroBoletaComprobante: number | undefined;
      if (liq.estado === "PAGADO") {
        const comprobante = await prisma.comprobante.create({
          data: {
            periodo_fiscal: new Date(2025, liq.mes, 15),
            importe: liq.importe,
          },
        });
        numeroBoletaComprobante = comprobante.numero_boleta;
        comprobantesCount++;
      }
      await prisma.liquidacion.create({
        data: {
          periodo_fiscal: new Date(2025, liq.mes, 15),
          importe: liq.importe,
          estado: liq.estado,
          cuil_cliente: clienteCuil,
          id_impuesto: impuestoId,
          numero_boleta_comprobante: numeroBoletaComprobante,
        },
      });
    }
    console.log(`  ✓ ${liquidacionesData.length} liquidaciones creadas`);
    console.log(`  ✓ ${comprobantesCount} comprobantes creados`);

    // Crear turnos
    console.log("\n📅 Creando turnos...");
    const turnosData = [
      { clienteIndex: 0, adminIndex: 0, fecha: new Date("2025-02-10"), hora: "10:00" },
      { clienteIndex: 1, adminIndex: 0, fecha: new Date("2025-02-11"), hora: "14:30" },
      { clienteIndex: 2, adminIndex: 0, fecha: new Date("2025-02-12"), hora: "09:00" },
      { clienteIndex: 3, adminIndex: 1, fecha: new Date("2025-02-13"), hora: "11:00" },
      { clienteIndex: 4, adminIndex: 0, fecha: new Date("2025-02-14"), hora: "16:00" },
      { clienteIndex: 5, adminIndex: 2, fecha: new Date("2025-02-15"), hora: "13:00" },
      { clienteIndex: 6, adminIndex: 0, fecha: new Date("2025-02-16"), hora: "15:30" },
    ];
    for (const turno of turnosData) {
      const clienteCuil = BigInt(clientesData[turno.clienteIndex].cuil);
      const contadorCuil = BigInt(adminsData[turno.adminIndex].cuil);
      const [hours, minutes] = turno.hora.split(":").map(Number);
      const horaDate = new Date();
      horaDate.setHours(hours, minutes, 0, 0);
      await prisma.turno.create({
        data: {
          cuil_cliente: clienteCuil,
          cuil_contador: contadorCuil,
          fecha: turno.fecha,
          hora: horaDate,
        },
      });
    }
    console.log(`  ✓ ${turnosData.length} turnos creados`);

    console.log(`\n✅ Seed completado exitosamente:`);
    console.log(`   📊 Admins creados: ${adminsData.length}`);
    console.log(`   👥 Clientes creados: ${clientesData.length}`);
    console.log(`   🏛️ Entidades tributarias: ${Object.keys(entidadesMap).length}`);
    console.log(`   💰 Impuestos: ${Object.keys(impuestosMap).length}`);
    console.log(`   📋 Inscripciones: ${inscripcionesData.length}`);
    console.log(`   📊 Liquidaciones: ${liquidacionesData.length}`);
    console.log(`   📄 Comprobantes: ${comprobantesCount}`);
    console.log(`   📅 Turnos: ${turnosData.length}`);
    console.log(`   👤 Admin principal (admin@example.com): ${clientesData.filter(c => c.adminIndex === 0).length} clientes`);
    console.log(`\nYa podés iniciar sesión con cualquiera de estos usuarios.`);
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
