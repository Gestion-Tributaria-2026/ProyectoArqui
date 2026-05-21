"use client";

import { useState } from "react";
import Sidebar from "./sidebar";

interface Cliente {
  id: string;
  nombre: string;
  cuit: string;
  estado: "al_dia" | "pendiente";
}

interface DashboardAdminProps {
  adminName: string;
  clientesData: Cliente[];
}

export default function DashboardAdmin({ adminName, clientesData }: DashboardAdminProps) {
  const [activeTab, setActiveTab] = useState("clientes");
  
  // Pestañas exclusivas para el Administrador Contable (Vistas 9, 10 y 11)
  const adminTabs = [
    { id: "clientes", label: "Padrón de Clientes" },
    { id: "subir", label: "Subir Liquidación" },
    { id: "liquidaciones", label: "Listado Liquidaciones" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar 
        userName={adminName} 
        userRole="ADMIN" 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tabs={adminTabs} 
      />

      <main className="flex-grow p-8 max-w-5xl mx-auto w-full">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
          <span className="text-xs bg-blue-900 text-white font-bold px-2.5 py-1 rounded-md">Perfil: Contador</span>
        </header>

        {/* TAB 1: PADRÓN DE CLIENTES (Vista 9) */}
        {activeTab === "clientes" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Clientes Activos</h2>
              <button className="btn-primary py-1.5 px-3 text-xs">+ Agregar Nuevo Cliente</button>
            </div>
            <div className="card-base">
              <div className="divide-y divide-slate-100">
                {clientesData.map((cli) => (
                  <div key={cli.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{cli.nombre}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">CUIT: {cli.cuit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cli.estado === "pendiente" ? "badge-pending" : "badge-paid"}>{cli.estado === "pendiente" ? "Pendiente" : "Al día"}</span>
                      <button className="btn-action-outline">Gestionar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBIR LIQUIDACIÓN (Vista 10) */}
        {activeTab === "subir" && (
          <div className="card-base p-6 max-w-lg bg-white space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Nueva Liquidación Impositiva</h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Seleccionar Cliente</label>
                <select className="w-full p-2.5 border rounded-xl bg-slate-50">
                  {clientesData.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Tipo de Impuesto</label>
                <select className="w-full p-2.5 border rounded-xl bg-slate-50">
                  <option>IVA</option>
                  <option>Monotributo</option>
                  <option>Ingresos Brutos</option>
                  <option>Bienes Personales</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Monto ($ ARS)</label>
                  <input type="number" placeholder="45000" className="w-full p-2.5 border rounded-xl bg-slate-50" />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Período</label>
                  <input type="text" placeholder="Mayo 2026" className="w-full p-2.5 border rounded-xl bg-slate-50" />
                </div>
              </div>
              <div className="p-6 border border-dashed rounded-xl text-center cursor-pointer hover:bg-slate-50 transition">
                <p className="text-slate-500 font-medium">📄 Adjuntar Archivo PDF de Liquidación</p>
                <p className="text-xs text-slate-400 mt-1">Arrastrá el archivo aquí o hacé clic</p>
              </div>
              <button type="submit" className="btn-secondary w-full py-3 mt-2">Subir e Informar al Cliente</button>
            </form>
          </div>
        )}

        {/* TAB 3: LISTADO COMPLETO DE LIQUIDACIONES (Vista 11) */}
        {activeTab === "liquidaciones" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Historial Global de Comprobantes</h2>
            <div className="card-base p-6 text-center py-12 text-slate-400 text-sm">
              📁 Panel de auditoría de archivos adjuntos y estados de pago unificados.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}