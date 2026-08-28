import AnnouncementBar from "@/components/store/AnnouncementBar";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import ToastNotifications from "@/components/store/ToastNotifications";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Announcement bar — fixed height used by Navbar offset */}
      <div className="fixed top-0 left-0 w-full z-[60]">
        <AnnouncementBar />
      </div>

      {/* Navbar sits below announcement bar */}
      <Navbar />

      {/* Main content padded to clear fixed bars */}
      <main className="min-h-screen bg-[var(--color-bg)]" style={{ paddingTop: 0 }}>
        {children}
      </main>

      <Footer />
      <CartDrawer />
      <WhatsAppButton />

      {/* Social proof toasts — bottom left */}
      <ToastNotifications />
    </>
  );
}
