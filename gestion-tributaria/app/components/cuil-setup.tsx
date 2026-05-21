"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCuil } from "@/actions";

interface CuilSetupProps {
  userName: string;
}

export default function CuilSetup({ userName }: CuilSetupProps) {
  const router = useRouter();
  const [cuil, setCuil] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "saving" | "success" | "error"; message?: string }>({ type: "idle" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: "saving" });

    const sanitized = cuil.replace(/\D/g, "");
    if (!/^\d{11}$/.test(sanitized)) {
      setStatus({ type: "error", message: "El CUIL debe tener 11 dígitos numéricos." });
      return;
    }

    try {
      const result = await saveCuil(sanitized);

      if (result.error) {
        throw new Error(result.error);
      }

      setStatus({ type: "success", message: "CUIL guardado correctamente. Recargue la página para continuar." });
      router.refresh();
    } catch (error: unknown) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Error desconocido." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-3">Completar tu perfil</h1>
        <p className="text-slate-600 mb-6">
          Hola <strong>{userName}</strong>, aún falta tu CUIL para acceder al panel. Ingresalo a continuación y seguí con tus gestiones.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            CUIL
            <input
              name="cuil"
              value={cuil}
              onChange={(event) => setCuil(event.target.value)}
              placeholder="00-00000000-0"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <button
            type="submit"
            disabled={status.type === "saving"}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {status.type === "saving" ? "Guardando..." : "Guardar CUIL"}
          </button>

          {status.type === "error" && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{status.message}</p>
          )}

          {status.type === "success" && (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status.message}</p>
          )}
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
          <p className="font-semibold">Por qué lo pedimos</p>
          <p>El CUIL se usa para asociar tu cuenta de Clerk con tu registro fiscal y tus datos en la base de datos.</p>
        </div>
      </div>
    </div>
  );
}
