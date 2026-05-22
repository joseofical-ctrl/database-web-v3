# 🗄️ Repositorio Académico - Base de Datos II

Una plataforma web moderna y escalable construida para gestionar, visualizar y almacenar las evidencias y entregables de la asignatura de **Base de Datos II** de la **Universidad Peruana Los Andes (UPLA)**. 

El proyecto cuenta con una interfaz pública de portafolio y un panel de administración privado (Dashboard) con operaciones CRUD completas, diseñado bajo una estética *Modern Dark Tech* (Glassmorphism, animaciones fluidas y alto contraste).

## ✨ Características Principales

- **Portafolio Interactivo:** Visualización de trabajos organizados por Unidades y Semanas con un sistema de filtrado dinámico.
- **Visor de Documentos Integrado:** Modal a pantalla completa para previsualizar PDFs e imágenes sin salir de la aplicación.
- **Panel de Administración (Dashboard):** Área segura protegida por login para gestionar la base de datos en tiempo real.
- **Operaciones CRUD:** Subida de nuevos trabajos (con soporte multipart/form-data), edición de registros existentes y eliminación segura.
- **Animaciones GSAP:** Transiciones suaves basadas en el scroll y micro-interacciones en la interfaz de usuario.
- **Arquitectura SSR:** Renderizado del lado del servidor nativo de Astro para conexiones seguras a la base de datos PostgreSQL.

## 🛠️ Stack Tecnológico

- **Framework Principal:** [Astro](https://astro.build/) (Modo SSR)
- **Librería UI:** [React](https://reactjs.org/) (Componentes interactivos, Modales, Visor de Docs)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Base de Datos:** PostgreSQL (Hosteado en Railway)
- **Animaciones:** GSAP (ScrollTrigger)
- **Gestor de Paquetes:** pnpm

## 📂 Estructura del Proyecto

La arquitectura del proyecto sigue las convenciones de Astro, separando claramente la lógica del servidor, las páginas y los componentes de UI:

```text
/
├── public/                 # Assets estáticos (imágenes, logos)
├── src/
│   ├── assets/             # Assets procesados
│   ├── components/         # Componentes reutilizables
│   │   ├── admin/          # Componentes del Dashboard (TrabajoModal, LoginForm)
│   │   └── ui/             # Componentes de interfaz (DocumentViewer)
│   ├── layouts/            # Plantillas base (layout.astro, admin.astro)
│   ├── lib/                # Configuración de Backend
│   │   └── db.ts           # Conexión pool a PostgreSQL (Railway)
│   └── pages/              # Rutas de la aplicación (File-based routing)
│       ├── admin/          # Rutas protegidas (dashboard.astro)
│       ├── api/            # Endpoints backend (login.ts, trabajos/...)
│       └── index.astro     # Portafolio público principal
├── astro.config.mjs        # Configuración de Astro
├── tailwind.config.mjs     # Configuración del tema y colores
└── package.json            # Dependencias y scripts

