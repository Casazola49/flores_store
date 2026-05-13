import Link from "next/link";
import { Phone, MapPin, Mail } from "lucide-react";

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <h3 className="text-3xl font-black tracking-tighter uppercase">
              FLORES<span className="text-[var(--color-accent)]">.</span>
            </h3>
            <p className="text-white/50 text-xs font-bold tracking-widest uppercase leading-relaxed max-w-xs">
              La liquidación más grande de calzado premium en Bolivia. Calidad Aria garantizada.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-white hover:text-[var(--color-accent)] transition-colors">
                <InstagramIcon />
              </a>
              <a href="#" className="text-white hover:text-[var(--color-accent)] transition-colors">
                <FacebookIcon />
              </a>
              <a href="#" className="text-white hover:text-[var(--color-accent)] transition-colors">
                <ZapIcon />
              </a>
            </div>
          </div>

          {/* Links: Tienda */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] font-black uppercase mb-8 text-[var(--color-accent)]">Categorías</h4>
            <ul className="space-y-4 text-[10px] tracking-[0.2em] uppercase font-bold text-white/60">
              <li><Link href="/productos" className="hover:text-white transition-colors">Todos los Productos</Link></li>
              <li><Link href="/categorias/botas" className="hover:text-black transition-colors bg-[var(--color-accent)] text-black px-2 py-1">Botas en Liquidación</Link></li>
              <li><Link href="/categorias/zapatillas" className="hover:text-white transition-colors">Zapatillas</Link></li>
              <li><Link href="/categorias/zapatos" className="hover:text-white transition-colors">Zapatos</Link></li>
              <li><Link href="/categorias/tacos" className="hover:text-white transition-colors">Tacos</Link></li>
            </ul>
          </div>

          {/* Links: Soporte */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] font-black uppercase mb-8 text-[var(--color-accent)]">Soporte</h4>
            <ul className="space-y-4 text-[10px] tracking-[0.2em] uppercase font-bold text-white/60">
              <li><Link href="/faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/envios" className="hover:text-white transition-colors">Políticas de Envío</Link></li>
              <li><Link href="/tallas" className="hover:text-white transition-colors">Guía de Tallas</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Sucursales</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] font-black uppercase mb-8 text-[var(--color-accent)]">Contacto</h4>
            <ul className="space-y-6 text-[10px] tracking-[0.2em] uppercase font-bold text-white/40">
              <li className="flex items-start gap-4">
                <MapPin size={16} className="text-[var(--color-accent)] shrink-0" />
                <span className="leading-relaxed">Santa Cruz de la Sierra<br/>Bolivia</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={16} className="text-[var(--color-accent)] shrink-0" />
                <span>+591 70000000</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={16} className="text-[var(--color-accent)] shrink-0" />
                <span className="lowercase">ventas@flores.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row items-center justify-between text-[9px] font-black tracking-[0.3em] uppercase text-white/20">
          <p>© {new Date().getFullYear()} FLORES STUDIOS & ARIA. Todos los derechos reservados.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
