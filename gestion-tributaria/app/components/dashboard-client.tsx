"use client";

import { useState } from "react";
import Sidebar from "./sidebar";

interface Liquidacion {
  id: string;
  impuesto: string;
  periodo: string;
  monto: number;
  estado: "PAGADO" | "PENDIENTE";
  fechaVencimiento: string;
}

interface DashboardClientProps {
  clienteName: string;
  liquidaciones: Liquidacion[];
}

export default function DashboardClient({ clienteName, liquidaciones }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("situacion");
  const [selectedLiquidacion, setSelectedLiquidacion] = useState<Liquidacion | null>(null);

  // Definimos las pestañas del cliente (Vista 3, 7 y 8)
  const clientTabs = [
    { id: "situacion", label: "Situación Impositiva" },
    { id: "turnos", label: "Turnos" },
    { id: "contacto", label: "Contacto" },
  ];

  const pendientes = liquidaciones.filter((l) => l.estado === "PENDIENTE");
  const tienePendientes = pendientes.length > 0;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar 
        userName={clienteName} 
        userRole="CLIENTE" 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tabs={clientTabs} 
      />

      <main className="flex-grow p-8 max-w-5xl mx-auto w-full">
        {/* Header Común */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
          <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">Bahía Blanca, Mayo 2026</span>
        </header>

        {/* SOLAPA 1: SITUACIÓN IMPOSITIVA (Vista 3, 4, 5 y 6) */}
        {activeTab === "situacion" && !selectedLiquidacion && (
          <div className="space-y-6">
            {/* Banner Condicional Dinámico */}
            {tienePendientes ? (
              <div className="card-status-debt animate-fade-in">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">⚠️</div>
                <div>
                  <h3 className="font-bold text-red-950 text-lg">Tenés {pendientes.length} pagos pendientes</h3>
                  <p className="text-red-700 text-sm mb-3">Ponete al día para evitar recargos e intereses de mora municipales.</p>
                  <button onClick={() => {}} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition shadow-xs">
                    Ver detalle de deuda
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-status-ok">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">✓</div>
                <div>
                  <h3 className="font-bold text-emerald-950 text-lg">Estás al día</h3>
                  <p className="text-emerald-700 text-sm">No tenés obligaciones fiscales pendientes de liquidación en el estudio.</p>
                </div>
              </div>
            )}

            {/* Listado de Impuestos (Vista 5) */}
            <div className="card-base">
              <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Últimos movimientos</h3>
                <span className="text-xs text-slate-500 font-medium">Filtro: Período Actual</span>
              </div>
              <div className="divide-y divide-slate-100">
                {liquidaciones.map((liq) => (
                  <div key={liq.id} className="table-row-custom">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm md:text-base">{liq.impuesto}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Vencimiento: {liq.fechaVencimiento} • Período: {liq.periodo}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-bold text-slate-900 text-sm">${liq.monto.toLocaleString("es-AR")}</span>
                      <span className={liq.estado === "PAGADO" ? "badge-paid" : "badge-pending"}>
                        {liq.estado === "PAGADO" ? "Pagado" : "Pendiente"}
                      </span>
                      <button onClick={() => setSelectedLiquidacion(liq)} className="btn-action-outline">
                        Ver detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DETALLE DE IMPUESTO (Vista 6) */}
        {activeTab === "situacion" && selectedLiquidacion && (
          <div className="card-base p-6 max-w-xl bg-white space-y-6">
            <button onClick={() => setSelectedLiquidacion(null)} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
              ← Volver al listado
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Detalle - {selectedLiquidacion.impuesto} {selectedLiquidacion.periodo}</h2>
              <p className="text-xs text-slate-400">ID de Comprobante: {selectedLiquidacion.id}</p>
            </div>
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between"><span className="text-slate-500 text-sm">Impuesto:</span> <span className="font-medium text-slate-800">{selectedLiquidacion.impuesto}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 text-sm">Período:</span> <span className="font-medium text-slate-800">{selectedLiquidacion.periodo}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 text-sm">Vencimiento:</span> <span className="font-medium text-slate-800">{selectedLiquidacion.fechaVencimiento}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500 text-sm">Estado:</span> <span className={selectedLiquidacion.estado === "PAGADO" ? "badge-paid" : "badge-pending"}>{selectedLiquidacion.estado}</span></div>
              <div className="flex justify-between pt-3 border-t border-dashed"><span className="text-slate-900 font-bold">Importe Total:</span> <span className="text-lg font-bold text-slate-900">${selectedLiquidacion.monto.toLocaleString("es-AR")}</span></div>
            </div>
          </div>
        )}

        {/* SOLAPA 2: TURNOS (Vista 7) */}
        {activeTab === "turnos" && (
          <div className="space-y-6">
            <div className="card-base p-6">
              <h2 className="text-lg font-bold mb-2">Solicitar Turno Presencial</h2>
              <p className="text-sm text-slate-500 mb-4">Reservá una cita técnica en nuestras oficinas de Bahía Blanca para asesoramiento impositivo personalizado.</p>
              <button className="btn-secondary">Solicitar nuevo turno</button>
            </div>
            <div className="card-base p-5">
              <h3 className="font-bold border-b pb-3 mb-3">Próximos turnos agendados</h3>
              <p className="text-sm text-slate-400 text-center py-6">No tenés turnos activos programados para este mes.</p>
            </div>
          </div>
        )}

        {/* SOLAPA 3: CONTACTO (Vista 8) */}
        {activeTab === "contacto" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-base p-6 space-y-4">
              <h2 className="text-lg font-bold">Información de Contacto</h2>
              <div className="space-y-3 text-sm">
                <p>📞 <span className="font-semibold ml-2">Teléfono:</span> (0291) 1234-5678</p>
                <p>✉️ <span className="font-semibold ml-2">Email:</span> contacto@estudiocontable.com</p>
                <p>📍 <span className="font-semibold ml-2">Dirección:</span> Alsina 123, Bahía Blanca</p>
              </div>
            </div>
            <div className="card-base p-6 space-y-3">
              <h2 className="text-lg font-bold">Envianos tu consulta</h2>
              <textarea placeholder="Escribí tu mensaje aquí..." rows={4} className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50" />
              <button className="btn-primary w-full">Enviar mensaje</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}