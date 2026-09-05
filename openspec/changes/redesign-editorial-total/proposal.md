# Propuesta — Rediseño Editorial Total del storefront

## Metadata del change

- **Change:** `redesign-editorial-total`
- **Branch:** `redesign/editorial-total`
- **Tipo:** rediseño visual agresivo del storefront de Flores Store
- **Fuente de verdad:** `DESIGN.md` y `PRODUCT.md`
- **Estrategia:** primer slice de tokens + Home; segundo slice de catálogo + PDP
- **Fuera de alcance:** backend, administración, carrito/checkout, API, CMS y configuración de Next.js

## Intención

Reemplazar la acumulación de parches visuales y señales de persuasión no verificadas por una experiencia de storefront editorial, brutalista y coherente con **The Crimson Atelier**. El cambio debe hacer que Flores se sienta como una marca premium-accesible de calzado —mujer-first, pero unisex— y no como una liquidación genérica.

La dirección será deliberadamente exagerada en composición, escala y presencia editorial, pero permanecerá gobernada por los tokens y límites de `DESIGN.md`: carmín Flores como único acento, superficies tinta/hueso/papel, tipografía Playfair Display reservada para uno o dos momentos premium por página, DM Sans para el contenido y lenguaje sharp con `radius: 0`.

No se abrirá una ronda adicional de preguntas de producto: el handoff confirmado fija el problema, la dirección, los límites y el orden del primer slice.

## Problema y oportunidad

El storefront actual tiene parches sobre parches que rompen la lectura de marca y reducen la confianza:

- La escala tipográfica está rota: el hero llega a `10rem` aunque el token display termina en `4.5rem`, y varias secciones usan titulares de tamaño display donde deberían usar headlines.
- Playfair aparece en al menos seis headlines de la home, contra el límite de uno o dos headlines premium por página.
- Labels de `7.5–9px` quedan por debajo del mínimo de legibilidad de `10–12px`; además, texto corrido se presenta en uppercase con tracking de label.
- La interfaz fabrica urgencia y prueba social: toasts de compras aleatorias, countdown perpetuo, precios tachados calculados desde `base_price * 1.45` o `* 1.5`, y claims de escasez no respaldados.
- La etiqueta `ARIA` aparece junto a productos y confunde la identidad de Flores.
- El anuncio amarillo `#E5C400`, los emojis, los acentos múltiples y la mezcla de inglés con español hacen que el storefront parezca inconsistente con la marca.
- El registro de voz mezcla formas verbales y no mantiene un español boliviano neutro.

La oportunidad es recuperar una señal visual fuerte y una persuasión honesta: menos ruido, mejor jerarquía, más confianza y una identidad editorial reconocible en todo el recorrido de compra.

## Dirección de producto

### Principios que deben permanecer visibles

1. **Editorial brutalista, no outlet:** la exageración estará en la composición, el contraste y la jerarquía, no en descuentos o alarmas inventadas.
2. **Un solo acento:** usar `var(--color-accent)` / carmín Flores `#9B1C1C` con disciplina; eliminar amarillo, acentos cromáticos múltiples y colores hardcodeados en los componentes incluidos.
3. **Mujer-first y unisex:** la navegación puede destacar Mujer, pero el catálogo debe seguir sirviendo a mujer, varón y niños.
4. **Voz local consistente:** español boliviano neutro, sin voseo rioplatense, sin strings sueltos en inglés y sin claims que no puedan verificarse.
5. **Persuasión ética:** solo mostrar precio tachado si existe un `compare_price` real; solo comunicar stock o urgencia con datos verdaderos; no generar social proof sintético.
6. **Drama responsivo:** la misma intención editorial debe funcionar desde `360px` hasta `1440px`, sin depender de overflow, tamaños ilegibles o una composición exclusiva de escritorio.
7. **Accesibilidad como límite:** conservar foco visible, contraste AA, lectura en sentence case para body y respeto a `prefers-reduced-motion`, conforme a `PRODUCT.md` y `DESIGN.md`.

## Resultado esperado para el usuario

Una persona que entra a Flores debería poder entender rápidamente qué vende la marca, qué colección está viendo y qué producto puede comprar, sin descifrar una interfaz saturada de badges o claims. La página debe sentirse intencional y memorable, pero los precios, el stock, el idioma y las acciones deben seguir siendo claros.

En concreto, el resultado debe:

- presentar una home con hero y secciones editoriales de escala controlada;
- permitir recorrer catálogo y PDP con la misma gramática visual;
- reservar Playfair para los momentos que realmente necesitan énfasis;
- usar DM Sans legible para navegación, descripciones, precios, filtros y estados;
- eliminar las señales falsas de popularidad, urgencia, descuento y competencia;
- conservar intacta la capacidad existente de consultar productos y continuar hacia el carrito.

## Alcance incluido

El cambio se limita a la capa visual y al copy del storefront. Los archivos y superficies afectadas son:

- `src/app/globals.css`: consolidar y consumir tokens de color, tipografía, escala, spacing, radio y motion; revisar utilidades heredadas y reglas de reduced motion.
- `src/app/(store)/HomeClient.tsx`: rediseñar la home, corregir la escala del hero y headings, reducir Playfair, eliminar cálculos de precios inventados, limpiar newsletter/social/popup y normalizar copy.
- `src/app/(store)/productos/ProductsClient.tsx`: aplicar la jerarquía editorial al catálogo, retirar `ARIA`, eliminar precios tachados derivados, corregir labels/estados vacíos y traducir copy.
- `src/app/(store)/productos/[slug]/ProductPageClient.tsx`: alinear PDP con tokens y voz, devolver la descripción a body legible y corregir naming y estados de producto.
- `src/components/store/ProductCard.tsx`: unificar tokens y mostrar descuentos únicamente ante `compare_price` real.
- `src/components/store/Navbar.tsx`: retirar emojis y badges de urgencia inventada, mantener la prioridad Mujer y normalizar navegación.
- `src/components/store/Footer.tsx`: quitar claims no verificados, resolver o retirar enlaces muertos y usar iconografía/elementos compatibles con el sistema.
- `src/components/store/AnnouncementBar.tsx`: retirar countdown perpetuo; solo admitir una fecha final real si la fuente disponible la respalda; neutralizar en presentación cualquier fondo amarillo proveniente del CMS.
- `src/components/store/ToastNotifications.tsx`: remover el componente y cualquier render/import asociado; no reemplazarlo por datos inventados.
- **Metadata del storefront:** revisar títulos, descripciones y fallback OG/copy en `src/app/(store)/page.tsx`, `productos/page.tsx` y `productos/[slug]/page.tsx` para que no prometan liquidación ni usen referencias de imagen/copy incompatibles con Flores.

El primer slice implementable es **tokens + home**. Una vez establecida esa base, el segundo slice alinea **catálogo + PDP + componentes compartidos**. La división reduce el riesgo de propagar una nueva gramática visual antes de comprobarla en la superficie principal.

## Fuera de alcance y no-goals

No se modificará:

- `convex/**`, schema, seed, productos, settings, banners, auth u órdenes;
- `src/app/admin/**`;
- carrito, checkout o WhatsApp, incluyendo Zustand, `CartDrawer` y `WhatsAppButton`;
- `src/app/api/**`, `src/lib/api.ts` y otras integraciones de API;
- `next.config.ts`, configuración de providers y `database/`;
- la lógica de negocio de catálogo, stock, precios, pagos o envíos.

No son objetivos de este change:

- crear testimonios reales o un sistema de social proof;
- agregar un buscador;
- agregar nuevos métodos de pago;
- cambiar el CMS o migrar datos para corregir valores heredados;
- inventar campañas, descuentos, fechas de cierre o claims para llenar espacios visuales.

Si el CMS conserva un valor amarillo o una fecha no confiable, el storefront debe presentarlo de forma segura o no presentarlo; corregir la fuente de datos requeriría otro change.

## Áreas afectadas e implicaciones

### Marca y UX

La eliminación de urgencias falsas y de la etiqueta `ARIA` cambia señales que podían llamar la atención, pero mejora la confianza y deja que producto, diseño y stock real sean los argumentos de conversión. La estética más agresiva puede aumentar la recordación, aunque debe conservar legibilidad y claridad de compra.

### Contenido y operaciones

La normalización de copy elimina frases que soporte y marketing podrían haber usado informalmente. Los nuevos textos no deben afirmar disponibilidad, descuentos, tiempos o beneficios que no provengan de datos o compromisos existentes en `PRODUCT.md`.

### Datos y compatibilidad

No habrá migración ni cambio de contrato con Convex. Los componentes deberán tolerar catálogo vacío, ausencia de `compare_price` y ausencia de fecha final de oferta sin mostrar placeholders engañosos, tachados artificiales o countdowns de relleno.

### Responsive y accesibilidad

La composición deberá revisarse al menos en 360px, un ancho intermedio y 1440px. Labels no podrán volver a tamaños submínimos; body no deberá depender de uppercase ni tracking amplio; animaciones no deberán ignorar `prefers-reduced-motion`. Se conserva el objetivo WCAG 2.2 AA de `PRODUCT.md`.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La dirección brutalista puede sacrificar conversión o escaneabilidad. | Alto | Mantener jerarquía de producto, precio y CTA en DM Sans, probar los tres anchos objetivo y tratar el drama como composición, no como ruido. |
| Retirar toasts y claims de urgencia puede reducir la sensación de actividad. | Medio | Sustituir persuasión fabricada por fotografía/video, curaduría editorial y datos reales de stock/precio; no reintroducir social proof no verificado. |
| El CMS puede enviar amarillo o una fecha de countdown perpetua. | Alto | Sanitizar/neutralizar esos valores en `AnnouncementBar`; si no existe fecha real, ocultar countdown y conservar un anuncio neutro. |
| La limpieza de colores y tipografía puede dejar inconsistencias entre slices. | Medio | Implementar tokens + home primero y usar los mismos tokens/nombres en catálogo, PDP y componentes compartidos. |
| El español neutro puede perder matices de la voz local. | Medio | Mantener terminología boliviana comprensible, evitar voseo rioplatense y revisar todos los strings visibles del storefront como conjunto. |
| Fallbacks visuales repetidos pueden debilitar la nueva identidad. | Medio | Revisar metadata y fallbacks dentro del storefront sin introducir una migración de backend ni stock photography como nuevo claim de marca. |

## Rollback

El rollback será puramente de código y por slice:

1. revertir el slice de catálogo/PDP si la segunda etapa introduce regresiones;
2. revertir el slice de tokens/home si la primera etapa no supera la verificación visual o de build;
3. restaurar los componentes previos mediante el revert del commit correspondiente, sin tocar Convex, CMS, precios, stock ni carrito;
4. si el anuncio falla, mantener como fallback el anuncio sin countdown ni color amarillo, en lugar de restaurar una urgencia no verificable.

No se requiere migración de datos ni rollback de infraestructura porque el cambio no modifica APIs, esquema, configuración de Next.js ni estado persistido.

## Criterios de éxito

El change se considerará exitoso cuando se cumplan todos estos resultados:

### Coherencia visual

- Hero y headings respetan la escala de `DESIGN.md`; ningún hero vuelve a alcanzar `10rem` y los headings de sección no se comportan como display.
- Cada página usa Playfair Display en un máximo de uno o dos headlines premium; el body y los labels usan DM Sans con la jerarquía definida.
- Labels permanecen en `10–12px` como mínimo; el texto corrido usa sentence case, `16px` y line-height legible.
- Los componentes incluidos consumen tokens, usan radio `0` y mantienen el carmín como único acento de marca; no aparece amarillo ni una paleta multi-acento.
- La composición mantiene su carácter editorial en 360px, anchos intermedios y 1440px sin overflow ni texto ilegible.

### Honestidad y copy

- `ToastNotifications` ya no se importa ni renderiza.
- No existen cálculos de precio tachado basados en `base_price * 1.45`, `base_price * 1.5` u otra estimación; el tachado solo aparece con `compare_price` real.
- No se muestra countdown sin fecha de finalización real y verificable; el amarillo del CMS no llega a la presentación.
- `ARIA`, emojis de urgencia y claims de escasez/liquidación no verificados desaparecen del storefront.
- Los textos visibles están en español boliviano neutro, sin mezcla accidental de inglés ni voseo rioplatense.

### Calidad y seguridad de entrega

- Se preservan navegación de producto, consulta de datos y continuidad hacia carrito/checkout sin modificar su lógica.
- El storefront conserva foco visible, contraste AA y comportamiento respetuoso de `prefers-reduced-motion`.
- La verificación prevista de la fase correspondiente pasa `npm run lint`, `npm run build` y los greps de marca definidos en `openspec/config.yaml`.
- No se modifican archivos de las áreas OUT.

## Verificación posterior

La especificación y el diseño técnico deberán convertir esta propuesta en criterios por componente y tareas atómicas. Durante apply/verify se comprobarán especialmente:

- ausencia de los hex amarillos prohibidos y de hex hardcodeados en los componentes incluidos;
- límite de Playfair y escala tipográfica por página;
- radio sharp y acento carmín único;
- estados vacíos, datos parciales, ausencia de descuento real y ausencia de fecha de oferta;
- responsive 360–1440px, contraste AA, foco visible y reduced motion;
- `npm run lint` y `npm run build`.
