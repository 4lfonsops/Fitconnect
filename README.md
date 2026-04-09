# FITCONNECT
### Plataforma de Gestión Fitness y Centralización de Servicios

FitConnect es una solución tecnológica integral diseñada por GRTECH para digitalizar la interacción entre centros deportivos y usuarios. El sistema permite la gestión de perfiles de entrenamiento, planes nutricionales y la comercialización de suplementos en un entorno unificado.

---

## RESUMEN DEL PROYECTO

El sistema se divide en dos interfaces estratégicas que interactúan en tiempo real para ofrecer una experiencia fluida tanto al administrador como al atleta:

### Gestión Web (Panel Administrativo)
* **Control de Membresías:** Administración centralizada de usuarios y roles.
* **Gestión de Inventario:** Control de stock y procesamiento de órdenes para la tienda de suplementos.
* **Red de Gimnasios:** Registro y geolocalización de sedes vinculadas.
* **Generador de Afiliación:** Creación de identificadores únicos para la vinculación segura de nuevos socios.

### Experiencia Móvil (Usuario Final)
* **Seguimiento de Rendimiento:** Consulta de rutinas de entrenamiento y progreso físico.
* **Planificación Nutricional:** Visualización de guías alimenticias personalizadas.
* **Marketplace:** Acceso al catálogo de productos y compra directa desde el dispositivo.
* **Buscador de Centros:** Localización de gimnasios mediante servicios de mapas.

---

## INFRAESTRUCTURA TÉCNICA

El núcleo de FitConnect reside en una arquitectura moderna que prioriza la integridad de los datos y la velocidad de respuesta.

| Componente | Tecnología |
| :--- | :--- |
| **Backend & Base de Datos** | Supabase (PostgreSQL) |
| **Autenticación** | Supabase Auth |
| **Almacenamiento** | Supabase Storage |
| **Frontend Web** | [React / Next.js] |
| **Desarrollo Móvil** | [React + Expo] |

---

## SISTEMA DE VINCULACIÓN INTELIGENTE

La innovación principal de FitConnect es su protocolo de conexión entre el entorno físico y digital:

1.  **Generación:** El administrador genera un código alfa-numérico único desde el panel web.
2.  **Validación:** El usuario ingresa el código en la aplicación móvil.
3.  **Sincronización:** Supabase procesa la transacción, vincula la cuenta del usuario al gimnasio correspondiente y desactiva el código para usos futuros, garantizando la exclusividad del acceso.
