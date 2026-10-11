# CoachSpace — Implementation Prompts

> This document holds the prompts used to continue Phase 1 (Interactive Demo), one pull request per feature. The current phase is recorded only in [`ROADMAP.md`](ROADMAP.md) (D-015).
>
> **Language note:** the prompt texts in section 5 are copied verbatim from the owner's original document, which is written in Spanish. They are kept in their original language so that no requirement is lost in translation. Everything else in this file follows the project rule of British English (D-004).
>
> **Numbering note:** "Prompt 1" to "Prompt 7" follow the original document. They do not match GitHub pull request numbers (for example, Groups & Participants was merged as GitHub PR #4).

## 1. Before Running Any Prompt

Some features already exist. Before executing a prompt:

1. Check the current state of the code in `src/` and the status in `docs/ROADMAP.md`.
2. Reuse existing features, components, data and patterns instead of rebuilding them.
3. If a prompt asks for something that already exists, extend or adjust it; do not duplicate it.
4. If a prompt conflicts with the code or with the documentation, explain the conflict to the owner before making changes.

### Already implemented

| Feature | Status | Where |
|---|---|---|
| Groups & Participants (Prompt 1) | Implemented (GitHub PR #4) | `/groups`, `/groups/[id]`, `src/components/ParticipantList.tsx`, `src/data/groups.ts` |
| Exercise library (most of Prompt 6) | Implemented early (GitHub PR #5, D-022) | `/library`, `/library/new`, `/library/[id]`, `/library/[id]/assign`, `src/components/library/`, `src/data/exercises.ts`, `src/data/store.tsx` |

The exercise library already supports: one shared library per coach, search and discipline filters, creating exercises, optional external video links (no video hosting, D-009), assigning an exercise to several groups with group-specific instructions, and assigning to the whole group or to selected participants. `/videos` redirects to `/library`. Section 5 lists, prompt by prompt, what is already covered and what is still missing.

## 2. General Instructions for Every PR

The original document states (verbatim):

> Guarda los siguientes prompts. Utilízalos uno por uno, después de revisar y fusionar el PR anterior. Cada uno hereda las reglas técnicas y de Git del Prompt 1.

The inherited rules are the **Requisitos** 6–9, **Git y pull request** and **Validación** sections of Prompt 1 (section 5.1). The rules in [`CLAUDE.md`](../CLAUDE.md) also apply to every PR.

Branch names: each prompt suggests a branch (for example `feat/chat`). If the working environment assigns a different branch name, say so to the owner before starting.

## 3. Implementation Order

All seven prompts are implemented; see the roadmap for the quality and demonstration tasks.

| Order | Prompt | Status |
|---|---|---|
| — | 1. Groups & Participants | Implemented (GitHub PR #4). No further work needed for its requirements. |
| — | 2. Chat | Implemented (`feat/chat`): `/chat` and `/chat/[id]`, simulated sending kept in memory only (D-024). |
| — | 3. Announcements | Implemented (`feat/announcements`): `/announcements`, `/announcements/new`, dashboard and group detail (D-025). |
| — | 4. Calendar | Implemented (`feat/calendar`): `/calendar` week view and `/calendar/[id]` session detail (D-026). |
| — | 5. Attendance | Implemented (`feat/attendance`): `/calendar/[id]/attendance`, summaries on the session and dashboard (D-027). |
| — | 6. Videos & Exercises | Implemented (library in GitHub PR #5, gaps completed in `feat/videos-exercises`, D-028). |
| — | 7. Participant View | Implemented (`feat/participant-view`): `/me` routes, demo view switch, My Videos (D-029). |

### Changes to the original order, and why

1. **Prompt 1 is complete.** It was implemented and merged first, as the original document intended.
2. **Most of Prompt 6 was built before Chat.** The owner decided to build the exercise library before chat because it is the core differentiator (D-022). Prompt 6 keeps its original position, but it becomes a gap-completion PR instead of a new feature. Its position still works: Prompt 7 needs it, and nothing in Prompts 2–5 depends on it.
3. **No requirement has been removed.** Every original requirement is still in section 5. The tables only record what the current code already covers.

## 4. Local Persistence Decision (D-023)

This decision is consistent with the current code (checked against `src/data/store.tsx` and `src/components/DeviceOnlyNotice.tsx`):

- Created exercises and their assignments are saved in the browser's `localStorage` (key `coachspace-demo-v1`), through `DemoStoreProvider` / `useDemoStore()`.
- Screens where the coach creates or edits data show the "saved on this device only" notice (`DeviceOnlyNotice`). Current text: "Demo: changes are saved on this device only. Nothing is sent to participants yet."
- A `Reset demo data` action on `/library` restores the fictional seed data.
- Nothing is sent to a server or to other users. Do not describe this data as shared or stored in the cloud.

The original prompts for Chat, Announcements and Attendance ask only for **local state** and forbid claiming real persistence. Whether a feature also saves to `localStorage` is a decision for the owner, feature by feature. If it does, it must use the existing demo store, show the same notice, and be cleared by `Reset demo data`. If it does not, the screen must not suggest that the data survives a reload.

## 5. Prompts

Each original prompt is in a code block so it can be copied as it is. The status tables are not part of the original prompts.

### 5.1 Prompt 1 — Groups & Participants

**Status: implemented (GitHub PR #4).** Kept for reference; its Git and validation rules are inherited by every later prompt.

| Requirement | Current code |
|---|---|
| 1. Review and reuse existing routes, components and data | Done |
| 2. Group list: name, sport, description or category, participant count, next session | Done: name, discipline, participant count and next session on `/groups`; the description appears on the group detail page |
| 3. Working navigation to each group's detail | Done (`/groups/g1` … `/groups/g4`) |
| 4. General information and fictional participant list in each group | Done, with participant search. Participants can be consulted, not edited (requirement 4 asks only to show them) |
| 5. Reusable structure for future sections, clearly marked if provisional | Done: group detail has sessions, announcements, assigned exercises and participants; `/chat` and `/calendar` show `Coming soon` |
| 6–9. Types, central data, mobile-first, empty states, no backend | Done |

Original note (verbatim):

> Esta será la primera funcionalidad. En el repositorio que revisamos, la pantalla de grupos era provisional, por lo que Claude debe inspeccionar su estado actual antes de modificarla.

````markdown
Lee `CLAUDE.md` y los documentos de `docs/` antes de modificar código.

Implementa exclusivamente la funcionalidad **Groups & Participants** de CoachSpace, siguiendo las decisiones del producto y la arquitectura existente.

## Objetivo

Convertir la sección de grupos en una parte funcional de la demo para que un entrenador pueda consultar sus grupos y abrir cada uno para gestionar y consultar sus participantes.

## Requisitos

1. Revisa primero el estado actual de las rutas, componentes y datos. Reutiliza lo que ya exista.
2. Implementa una lista de grupos con nombre, deporte, descripción o categoría, número de participantes y próxima sesión cuando esos datos estén disponibles.
3. Permite abrir el detalle de cada grupo mediante una navegación funcional.
4. Dentro de cada grupo, muestra información general y la lista de participantes con datos ficticios coherentes.
5. Prepara una estructura reutilizable para las futuras secciones `Chat`, `Announcements`, `Calendar`, `Videos & Exercises` y `Attendance`, pero no implementes esas funcionalidades en este PR. Si aparecen como navegación provisional, indica claramente que aún están en desarrollo.
6. Utiliza tipos TypeScript coherentes y datos centralizados en `src/data/` cuando corresponda.
7. Mantén el diseño mobile-first, el estilo visual existente y la navegación global.
8. Incluye estados vacíos y evita enlaces rotos.
9. No añadas backend, autenticación, dependencias innecesarias ni funcionalidades ajenas al alcance.

## Git y pull request

- Comprueba el estado de Git antes de trabajar.
- Crea una rama dedicada, por ejemplo `feat/groups-participants`.
- No trabajes directamente en `main`.
- No sobrescribas cambios previos del usuario.
- Mantén el PR limitado a Groups & Participants y a los cambios documentales imprescindibles para esta funcionalidad.

## Validación

Ejecuta `npm run check` y corrige los errores que hayas introducido. Comprueba las rutas, la navegación y los distintos grupos. Si no puedes ejecutar alguna comprobación, explica por qué sin afirmar que ha pasado.

No fusiones el PR automáticamente. Devuélveme un resumen de los cambios, las pruebas ejecutadas y los pasos para revisar la demo en Vercel.

No comiences la siguiente funcionalidad hasta que yo lo apruebe.
````

### 5.2 Prompt 2 — Chat

**Status: implemented (`feat/chat`).** Conversation list (`/chat`) and conversation screen (`/chat/[id]`), data in `src/data/messages.ts`, in-memory store in `src/data/chat-store.tsx` (D-024).

````markdown
Lee `CLAUDE.md` y `docs/`. Implementa exclusivamente Chat en CoachSpace, inspeccionando primero las rutas y datos existentes.

Crea una rama `feat/chat` y no trabajes directamente en `main`.

Requisitos:

- Lista de conversaciones, diferenciando conversaciones de grupo e individuales.
- Pantalla de conversación con historial de mensajes ficticios.
- Permite seleccionar una conversación, escribir un mensaje y enviarlo.
- El mensaje nuevo debe aparecer inmediatamente en la conversación mediante estado local.
- Incluye remitente, hora y estados vacíos coherentes.
- Utiliza datos y tipos centralizados y reutilizables.
- Si el chat grupal está asociado a un grupo, muestra claramente cuál.
- Mantén el diseño mobile-first y la navegación existente.
- No implementes backend, cuentas reales, notificaciones ni comunicación en tiempo real. Deja claro que es una simulación.

Limita los cambios al chat y a los ajustes imprescindibles. Ejecuta `npm run check`, revisa las rutas y prueba el envío de mensajes. No afirmes que los mensajes persisten después de recargar si no es así.

No fusiones el PR ni empieces otra funcionalidad. Devuélveme el resumen, las pruebas realizadas y las instrucciones para revisarlo en Vercel.
````

### 5.3 Prompt 3 — Announcements

**Status: implemented (`feat/announcements`).** Board (`/announcements`), form (`/announcements/new`), recent announcements on the dashboard and group detail; stored in the demo store (D-025).

````markdown
Lee `CLAUDE.md` y `docs/`. Implementa exclusivamente Announcements en CoachSpace.

Crea una rama `feat/announcements` a partir de la versión aprobada de `main`.

Requisitos:

- Tablón de anuncios con título, contenido, autor, fecha y grupo relacionado cuando corresponda.
- Formulario para crear un anuncio con validación básica.
- Posibilidad de publicar un anuncio para un grupo concreto.
- Visualización de los anuncios relevantes en el detalle del grupo y, cuando tenga sentido, en el dashboard.
- Utiliza los mismos datos de anuncios entre las pantallas; evita duplicados o información contradictoria.
- Los datos nuevos pueden mantenerse en estado local durante la demo.
- Diseño mobile-first, estados vacíos y mensajes claros de validación.
- No añadas backend, notificaciones reales ni funcionalidades ajenas al alcance.

Ejecuta `npm run check` y verifica el flujo de creación y visualización. Actualiza la documentación solo si es necesario. No fusiones el PR ni empieces otra funcionalidad. Devuélveme un resumen y las instrucciones para revisar la vista previa de Vercel.
````

### 5.4 Prompt 4 — Calendar

**Status: implemented (`feat/calendar`).** Week view (`/calendar`), session detail (`/calendar/[id]`); sessions generated from each group's weekly slots (D-026). The dashboard and groups use the same data.

````markdown
Lee `CLAUDE.md` y `docs/`. Implementa exclusivamente Calendar en CoachSpace.

Crea una rama `feat/calendar` desde la versión aprobada de `main`.

Requisitos:

- Vista semanal navegable para consultar sesiones.
- Cada sesión muestra nombre o actividad, fecha, hora y grupo.
- Al seleccionar una sesión, se abre un detalle con la información disponible.
- Incluye navegación entre semanas y una forma clara de volver a la semana actual.
- Reutiliza los datos existentes en `src/data/calendar.ts` y los tipos actuales siempre que sea posible.
- Mantén los datos del calendario coherentes con los grupos y el dashboard.
- Incluye estados vacíos y diseño mobile-first.
- No implementes sincronización externa, reservas, recordatorios reales ni backend.

Deja preparada la relación entre sesión y grupo para que Attendance pueda utilizarla en el siguiente PR. Ejecuta `npm run check` y prueba la navegación y los detalles de sesión. No fusiones el PR ni empieces otra funcionalidad. Devuélveme el resumen y los pasos de revisión en Vercel.
````

### 5.5 Prompt 5 — Attendance

**Status: implemented (`feat/attendance`).** Attendance form at `/calendar/[id]/attendance`, summary on the session detail and the dashboard; stored in the demo store (D-027).

````markdown
Lee `CLAUDE.md` y `docs/`. Implementa exclusivamente Attendance en CoachSpace.

Crea una rama `feat/attendance` desde la versión aprobada de `main`.

Requisitos:

- Acceso a pasar lista desde el detalle de una sesión.
- Mostrar los participantes del grupo correspondiente a esa sesión.
- Permitir marcar a cada participante como presente o ausente.
- Permitir corregir una marca antes de terminar.
- Mostrar un resumen del número de presentes y ausentes.
- Evitar participantes duplicados y sesiones asociadas al grupo incorrecto.
- Utilizar datos ficticios y estado local, sin afirmar que existe persistencia real.
- Mantener diseño mobile-first y una interfaz sencilla de usar durante un entrenamiento.

No implementes estadísticas avanzadas, informes históricos ni backend. Ejecuta `npm run check` y comprueba el flujo de pasar lista y corregir marcas. No fusiones el PR ni empieces otra funcionalidad. Devuélveme el resumen y los pasos para revisar la demo.
````

### 5.6 Prompt 6 — Videos & Exercises

**Status: implemented.** The library came first (GitHub PR #5); the gaps below were completed in `feat/videos-exercises` (D-028). The table shows the state before that PR. Do not create a second library or rebuild what exists. The existing extras are product decisions and must be kept: discipline, duration, equipment, group-specific instructions, `localStorage` persistence and `Reset demo data` (D-022, D-023).

| Requirement | Current code | Gap |
|---|---|---|
| Model: stable id, title, category | Done (`Exercise` in `src/data/types.ts`) | — |
| Model: description and instructions | Partial | One `instructions` field; no separate description |
| Model: YouTube or Vimeo URL | Partial | `videoUrl` is optional and accepts any `http(s)` link |
| Model: basic creation data if needed | Partial | Assignments have `assignedOn`; exercises have no creation date |
| Model: definition separated from assignments | Done (`Exercise` and `Assignment`) | — |
| 1. `Videos & Exercises` inside each group | Partial | Group detail has an "Assigned exercises" section; the main screen is called "Library" (`/library`). Renaming is an owner decision |
| 2. Creation form validating title and URL | Partial | Title is validated; the URL is optional and only checked as a web link |
| 3. Only YouTube and Vimeo links | Missing | — |
| 4. Assign to the whole group, specific athletes, or both | Partial | Whole group or selected participants, one assignment per exercise and group; "both" is not supported |
| 5. View and edit existing exercises | Partial | Exercises can be viewed and assignments edited; the exercise itself cannot be edited |
| 6. Organise exercises by category | Partial | Category is shown and searchable; the filter is by discipline |
| 7. Reusable function for an athlete in several groups | Missing | Also, each participant belongs to one group only (`Participant.groupId`), so the data model must change |
| 8. No separate participant library yet | Done | — |
| 9. Empty states and accessible confirmation messages | Partial | Empty states exist; removal uses `window.confirm` and there are no accessible success messages |
| 10. Mobile-first | Done | — |
| Limits: no video upload, no completion tracking, no backend, local data labelled, no extra dependencies | Done | — |

Original note (verbatim):

> Este es el PR más importante para tu idea de producto. Conviene implementar primero bien el modelo de datos y después las pantallas.

````markdown
Lee `CLAUDE.md` y todos los documentos relevantes de `docs/`. Implementa exclusivamente Videos & Exercises en CoachSpace, respetando las decisiones de producto acordadas.

Crea una rama `feat/videos-exercises` desde la versión aprobada de `main`.

## Modelo de contenido

Cada ejercicio debe tener:

- Identificador estable.
- Título.
- Descripción e instrucciones.
- URL de YouTube o Vimeo.
- Categoría.
- Datos básicos de creación si son necesarios para la interfaz.

Separa la definición del ejercicio de sus asignaciones. Un mismo ejercicio debe poder asignarse a varios grupos o a deportistas concretos sin duplicar su ficha.

## Funcionalidades

1. Dentro de cada grupo, añade `Videos & Exercises`.
2. Permite crear un ejercicio mediante un formulario que valide el título y la URL.
3. Acepta únicamente enlaces válidos de YouTube y Vimeo para esta primera versión.
4. Permite asignar el ejercicio al grupo completo, a deportistas concretos o a ambos.
5. Permite consultar y editar los ejercicios existentes, si encaja con la arquitectura actual.
6. Organiza los ejercicios por categorías.
7. Prepara una función reutilizable para obtener los ejercicios correspondientes a un deportista perteneciente a varios grupos.
8. No crees todavía una segunda biblioteca independiente para el deportista: esa vista se implementará en el PR Participant View.
9. Muestra claramente los estados vacíos y confirma las acciones mediante mensajes accesibles.
10. Mantén el diseño mobile-first.

## Límites

- No subir ni almacenar archivos de vídeo.
- No implementar seguimiento de ejercicios completados.
- No implementar notificaciones, backend ni autenticación real.
- No presentar los datos locales como persistentes o compartidos entre usuarios.
- No añadir dependencias innecesarias.

Ejecuta `npm run check` y prueba creación, validación de enlaces, asignación múltiple y reutilización de ejercicios. Actualiza la documentación relevante si el modelo de datos lo requiere.

No fusiones el PR ni empieces otra funcionalidad. Devuélveme un resumen del modelo implementado, las pruebas y los pasos para revisar Vercel.
````

### 5.7 Prompt 7 — Participant View

**Status: implemented (`feat/participant-view`).** Participant routes under `/me` for the fictional participant Jordan Hale, a Coach/Participant demo switch and a unified, deduplicated My Videos (D-029).

````markdown
Lee `CLAUDE.md` y `docs/`. Implementa exclusivamente Participant View en CoachSpace, utilizando las funcionalidades existentes en vez de duplicarlas.

Crea una rama `feat/participant-view` desde la versión aprobada de `main`.

## Requisitos

1. Añade un selector de rol para alternar entre Coach y Participant en la demo.
2. Adapta la navegación y las acciones visibles al rol seleccionado.
3. La vista Coach mantiene el acceso a la gestión de grupos, anuncios, calendario, asistencia y ejercicios.
4. La vista Participant muestra sus grupos, anuncios, próximas sesiones y conversaciones simuladas.
5. Implementa `My Videos` como una biblioteca unificada con los ejercicios que corresponden al deportista en todos sus grupos.
6. Incluye ejercicios asignados a grupos y asignaciones individuales, sin duplicar el mismo ejercicio cuando ambos criterios lo hacen visible.
7. Permite filtrar por grupo y categoría.
8. Utiliza un participante ficticio claramente identificado y coherente con los datos existentes.
9. Evita mostrar al deportista controles de gestión exclusivos del entrenador.
10. Mantén el diseño mobile-first y todas las rutas funcionales.

## Límites de seguridad

El selector es solo una simulación visual para probar la experiencia. No lo describas como autenticación o autorización real. No implementes cuentas, permisos de backend ni datos privados reales.

Ejecuta `npm run check` y prueba ambos roles, sus rutas y la biblioteca My Videos con un deportista perteneciente a varios grupos. No fusiones el PR automáticamente.

Devuélveme el resumen, las pruebas realizadas y una lista de los elementos que aún son simulados antes de considerar la demo lista para validar con entrenadores.
````
