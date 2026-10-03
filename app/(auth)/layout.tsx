import Logo from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12 outline-none"
    >
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
