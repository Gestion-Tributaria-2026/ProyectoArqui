import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white justify-center items-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">Sistema de Gestión Tributaria</h1>
      <p className="text-slate-400 max-w-md mb-8">
        Accedé a tu panel impositivo, revisá tus liquidaciones y gestioná tus vencimientos de forma ágil.
      </p>
      <div className="flex gap-4">
        <Link href="/sign-in" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl transition">
          Ingresar al Sistema
        </Link>
      </div>
    </div>
  );
}