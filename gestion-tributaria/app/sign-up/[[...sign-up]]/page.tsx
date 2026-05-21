import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SignUp 
        appearance={{
          variables: {
            colorPrimary: "#0f2d59", // Forzamos el azul corporativo en el botón de Clerk
          }
        }}
      />
    </div>
  );
}