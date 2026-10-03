import Footer from "@/components/shared/footer";
import Header from "@/components/shared/header";

// Every page reads the session (header) and the database, so render per
// request; this also keeps `next build` from needing a database connection
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" tabIndex={-1} className="wrapper flex-1 outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
