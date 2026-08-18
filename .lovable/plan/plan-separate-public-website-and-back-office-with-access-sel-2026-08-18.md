# Plan: Separate Public Website and Back-Office with Access Selection

The goal is to strictly separate the Public Website from the Back-Office and create an access-selection interface (`/acces`) while keeping the data connected.

## Architecture Changes

1.  **Layout Separation**:
    *   Public pages (`/`, `/services`, etc.) will continue using `PublicLayout`.
    *   Back-Office pages (under `/backoffice/*`) will continue using `BOLayout`.
    *   Create a new root layout or logic to ensure headers/sidebars don't bleed between environments.
2.  **Access Selection Page**:
    *   Create `src/routes/acces.tsx` with two cards: "Site Web ORCONDIS" and "Back-Office ORCONDIS".
3.  **Route Adjustments**:
    *   Update `src/routes/connexion.tsx` to redirect to `/acces` or `/backoffice/dashboard`.
    *   Ensure all `/backoffice` routes are grouped under the `backoffice.tsx` layout.

## Implementation Details

### 1. Access Selection Page (`/acces`)
*   Design a centered page with the official ORCONDIS logo.
*   Two large professional cards with icons:
    *   **Globe icon** for Site Web.
    *   **Dashboard/Admin icon** for Back-Office.
*   Clean corporate design in French.

### 2. Branding & Content
*   Remove any remaining "Tizzla and Serve" branding where not explicitly requested (keeping it only in authorized places like the specific slogan if already there, but favoring "ORCONDIS" as the primary brand).
*   Ensure the official logo is used consistently.

### 3. Public Website Updates
*   Header: Update the "Connexion" button to point to `/acces`.
*   Footer: Ensure "Created by IZEMX" is present.
*   Verify no internal components (sidebar, dashboard) are visible.

### 4. Back-Office Updates
*   Header: Add a "Site public" link pointing to `/`.
*   Sidebar: Verify all requested modules are present.
*   Dashboard: Ensure it's the default route (`/backoffice/dashboard`).

### 5. Technical Tasks
*   Modify `src/components/PublicLayout.tsx` to remove "Tizzla and Serve" from the logo subtext as per the new requirement "No Tizzla and Serve".
*   Create `src/routes/acces.tsx`.
*   Update `src/routes/backoffice.tsx` to ensure it only renders its specific layout.
*   Update `src/routes/__root.tsx` if global layouting logic needs adjustment to prevent side-effects.

## Validation Steps
*   Test `/acces` navigation to both environments.
*   Verify Public Website does not show Back-Office elements.
*   Verify Back-Office does not show Public Website navbar.
*   Verify data connectivity (e.g., creating a demand on the website and seeing it in the Back-Office).
