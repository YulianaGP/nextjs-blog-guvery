# Taller 21: Kickoff — Research + Planning

> Módulo 6: Clase 21 de 25

Tu proyecto final arranca hoy. Durante las próximas 2 semanas vas a construir un producto real para una empresa real, aplicando todo lo que aprendiste en M1-M5.

**Cómo funciona M06:** Las clases son para presentar avance, resolver dudas y planificar. El trabajo de desarrollo lo haces entre clases (async). Lo que traigas construido a cada sesión es lo que revisamos juntos.

---

## Objetivo del Día

Salir de clase con un plan claro: qué vas a construir, cómo lo vas a estructurar, y qué entregas en cada sprint.

**Entregable de hoy (en clase):** Historias de usuario + wireframes + plan de sprints.

---

## Parte 1: Entender el Brief (25 min)

Lee el brief del proyecto con atención. Está en Canvas.

Mientras lees, responde estas preguntas en tus notas:

- ¿Quién es el cliente y qué problema tiene?
- ¿Qué debe hacer el producto que vas a construir?
- ¿Cuáles son los 3 bloques funcionales (Epics)?
- ¿Qué stack es obligatorio?
- ¿Qué es lo mínimo viable para que el proyecto sea exitoso?

Pregunta al instructor todo lo que no esté claro. Simula que estás en una reunión con el cliente.

---

## Parte 2: Research (30 min)

Investiga antes de planificar. No empieces a codear sin saber qué existe.

### 2.1 Explorar el producto del cliente (10 min)
- Navega el sitio web del cliente.
- Entiende su producto, su público y su tono.
- Anota: ¿qué funciona bien? ¿Qué le falta?

### 2.2 Buscar referentes (10 min)
- Encuentra 2-3 sitios similares a lo que vas a construir.
- Anota: estructura, categorías, cómo manejan el contenido, diseño.
- Guarda los links — te servirán para wireframes.

### 2.3 Revisar documentación técnica (10 min)
- Next.js: [Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata){:target="_blank"}, [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params){:target="_blank"}, [Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap){:target="_blank"}
- Prisma: [Getting Started](https://www.prisma.io/docs/getting-started){:target="_blank"}
- Neon: [Connect from Next.js](https://neon.tech/docs/guides/nextjs){:target="_blank"}

---

## Parte 3: Planning (30 min)

### 3.1 Historias de Usuario (15 min)

Escribe 5-8 historias de usuario basadas en los Epics del brief. El brief te da los bloques funcionales — tú defines el detalle.

Formato:
```
Como [rol], quiero [acción], para [beneficio].

Criterios de aceptación:
- [ ] Criterio 1
- [ ] Criterio 2
```

Ejemplo:
```
Como visitante, quiero ver una lista de artículos en la página principal,
para encontrar contenido relevante rápidamente.

Criterios de aceptación:
- [ ] La home muestra artículos ordenados por fecha
- [ ] Cada artículo muestra título, excerpt, imagen y categoría
- [ ] La página es responsive
```

### 3.2 Wireframes (10 min)

Dibuja la estructura de las páginas principales. Papel, pizarra o Figma — baja fidelidad.

Páginas mínimas:
- Home (listado de contenido)
- Página individual de contenido
- Página de categoría
- Formulario de suscripción (puede ser componente, no página)

### 3.3 Plan de Sprints (5 min)

Distribuye tus historias de usuario en 3 sprints:

| Sprint | Async después de... | Foco |
|--------|---------------------|------|
| Sprint 1 | Clase 21 (hoy) | Setup técnico + schema + seed + layout + deploy |
| Sprint 2 | Clase 22 | Features core: páginas dinámicas, SEO, newsletter |
| Sprint 3 | Clase 23 | Polish: auth admin, búsqueda, responsive, performance |

---

## Cierre (10 min)

Comparte tu plan con la clase en 1 minuto: qué vas a construir y cuál es tu prioridad para Sprint 1.

---

## Async: Tarea para Clase 22

Esto es lo que debes traer listo a la próxima clase. Tiempo estimado: 3-4 horas.

### Entregables

| ✓ | Entregable | Verificación |
|---|------------|--------------|
| ☐ | Repo GitHub con README | Incluye: descripción, historias de usuario, wireframes (foto o link), plan de sprints |
| ☐ | Setup Next.js + TypeScript | `npx create-next-app@latest` con TypeScript habilitado |
| ☐ | Prisma + Neon conectado | `npx prisma db push` ejecutado sin errores |
| ☐ | Schema de datos | Al menos las tablas principales definidas en `schema.prisma` |
| ☐ | Seed con datos de ejemplo | `npx prisma db seed` carga datos de prueba |
| ☐ | Deploy en Vercel | URL accesible (aunque sea el boilerplate) |
| ☐ | Layout base | Header + footer + navegación responsive |

### Setup paso a paso

```bash
# 1. Crear proyecto
npx create-next-app@latest nombre-proyecto --typescript --tailwind --app --src-dir

# 2. Instalar Prisma
cd nombre-proyecto
npm install prisma @prisma/client
npx prisma init

# 3. Configurar Neon
# - Crear base de datos en neon.tech
# - Copiar connection string a .env:
# DATABASE_URL="postgresql://..."

# 4. Definir schema y sincronizar
npx prisma db push

# 5. Crear seed (prisma/seed.ts)
npx prisma db seed

# 6. Deploy
# - Conectar repo a Vercel
# - Agregar DATABASE_URL en Environment Variables
```

### Recomendaciones
- Empieza por el schema. Si tu modelo de datos es sólido, todo lo demás fluye.
- No te preocupes por el diseño visual todavía. Layout funcional > bonito.
- Commitea frecuentemente. Un commit por cada paso completado.
- Si te trabas con Prisma o Neon, revisa los labs de M4 (clases 13-14).

---

## Instrucciones de Entrega

Sube a Canvas:
- Link al repo de GitHub (debe tener README documentado)
- Link al deploy en Vercel
- Screenshot de tu base de datos en Neon con datos de seed
