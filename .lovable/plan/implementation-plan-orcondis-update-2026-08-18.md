# Implementation Plan - ORCONDIS Update

Complete business content, branding, and data model update for the ORCONDIS project.

## Branding & Visuals
- Complete the "ARCONDIS" to "ORCONDIS" transition (lowercase "orcondis" in code/storage).
- Update logo placeholders: replace initial 'O' with a styled text logo "ORCONDIS" or a placeholder if an image is provided later.
- Update footer text to include "Created by IZEMX".
- Update color scheme if needed (though existing colors seem professional).
- Add "Tizzla and Serve" service branding to the landing page and specific service descriptions.

## Data Model Updates
- **src/lib/orcondis.ts**:
    - Update `SERVICES` list to match the new taxonomy.
    - Update `Qualification` and `Demande` types to support multiple destinations properly.
    - Add "Exclusive" to course types/urgency levels.
- **src/lib/bo/ops-data.ts**:
    - Update core operational models to reflect new business rules.
    - Ensure multi-destination support in course objects.

## Content & Public Pages
- **src/routes/index.tsx**:
    - Hero section update with "Tizzla and Serve".
    - Update service cards and "Formulas" (standard, express, exclusive).
    - Update contact info: `0666 70 99 41`, `orcondiscourses@gmail.com`.
- **src/components/PublicLayout.tsx**:
    - Header and footer branding.

## Back-Office Updates
- **src/components/bo/BOLayout.tsx**:
    - Update sidebar logo and title.
- **Back-office pages**:
    - Ensure "Exclusive" courses are visually distinct.
    - Update forms for "Demandes" and "Courses" to handle multiple destinations (2+ stops).

## Technical Details
- Standard TanStack Router patterns for routes.
- Tailwind CSS for all styling (no hardcoded colors outside theme).
- Zod for validation in server functions (if any).
- LocalStorage persistence for demo data via `bo-store.tsx`.
