import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SignIn 
        appearance={{
          variables: {
            colorPrimary: "#0f2d59", // Forzamos el azul corporativo en el botón de Clerk
          }
        }}
      />
    </div>
  );
}