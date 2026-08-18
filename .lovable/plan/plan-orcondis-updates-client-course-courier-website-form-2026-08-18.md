# Plan - ORCONDIS Updates (Client, Course, Courier & Website Form)

Compliance update based on original ORCONDIS specifications for Client data, Course details, and Courier management.

## User Review Required

> [!IMPORTANT]
> - Automatic Zone generation will be a suggestion based on City/Quartier, but manual override is always available.
> - Multiple Destinations for "Multiple" genre courses will be fully supported in both BO and Public forms.
> - The WhatsApp agent logic description will be updated in the system's "understanding" (mocked in demo data/prompts) as requested.

## Proposed Changes

### 1. Data Model & Logic (`src/lib/bo/ops-data.ts`)
- **Clients**: Update `ClientOps` to match the exact hierarchy:
    - `typeClient`: Personne physique, Entreprise, Société, Autres.
    - Conditional fields: `nom/prenom` vs `denomination` vs `raisonSociale`.
    - Extended fields: `rue`, `numeroRue`, `etage`, `appartement`, `fax`, `facebook`, `instagram`.
    - Automatic numbering with prefixes (10, 20, 30, 40).
- **Contacts**: Update `ContactOps` role types and fields (`service`, `fonction`, `codeContact`).
- **Courses**: Update `CourseOps` with:
    - `dateAppel`, `heureAppel`, `jour`.
    - `moyenTransport` (Moto, Bicyclette, Voiture).
    - Courier operational fields: `heureEnvoiOrdre`, `kmDepart`, `litresDepart`.
- **Couriers**: Update `CoursierOps` with `zoneActuelle`, `positionOp`, and calculated `nbCoursesEnCours`.

### 2. Back-Office Clients (`src/routes/backoffice.clients.tsx`)
- Implement dynamic form based on `typeClient`.
- Add "Contacts" tab within Client detail view (no standalone module).
- Add automatic Zone proposal logic.

### 3. Back-Office Courses (`src/routes/backoffice.courses.tsx`)
- Update creation form with "Informations de la demande" section.
- Implement "Correspondant" selection/creation linked to Client.
- Update Courier selection with Zone/Transport/Availability recommendations.
- Add "Réaffectation" action with history tracking.

### 4. Back-Office Couriers (`src/routes/backoffice.coursiers.tsx`)
- Update profile with new fields (Photo, Code, Zone Actuelle).
- Display calculated "Nombre de courses en cours" with detail drill-down.

### 5. Public Website Form (`src/routes/demande.tsx` if exists, or update `index.tsx`)
- Update "Faire une demande" form to match the structured Step 1 (Identity) and Step 2 (Service) logic.
- Ensure conditional fields mirror the Back-Office logic.

### 6. Settings (`src/routes/backoffice.parametres.tsx`)
- Ensure "Numérotation", "Zones", and "Transports" are configurable.

## Technical Details

- **Zod Schemas**: Update form validation schemas to handle conditional requirements.
- **Store Updates**: Enhance `ops-store.ts` helpers to calculate real-time courier load.
- **UI Components**: Use `Grille` and `ChampSelect` from the internal kit for consistency.
