# Plan - ORCONDIS Agent Dispatch Coursiers Module

Implementation of a dedicated operational module for automated courier communication, strictly following business logic and relationships with existing modules.

## User-facing changes
- **New Sidebar Entry**: "Agent Dispatch Coursiers" added to the Back-Office navigation.
- **Dedicated Dispatch Module**: A new operational dashboard (`/backoffice/dispatch`) with KPI cards (Missions à envoyer, Acceptées, Refusées, etc.) and a detailed communication planning table.
- **Enhanced Course Detail**: "Dispatch & Communication" tab in Course details for manual triggers, status tracking, and message history.
- **Enhanced Courier Detail**: "Communications & Missions" tab in Courier details showing historical and upcoming mission dispatches.
- **Updated Dashboard**: New widgets for dispatch alerts and upcoming scheduled sends.
- **WhatsApp Integration**: Improved filters to separate client conversations from courier mission dispatches.
- **Reports**: New "Dispatch Coursiers" report section for operational efficiency analysis (acceptance rates, confirmation times).
- **Settings**: New "Agent Dispatch Coursiers" section for global automation rules (timing, mode, relay counts).

## Technical details
- **Data Store (`ops-store.tsx`)**:
    - Extend `setData` mutations to handle automatic cancellation on reassignment.
    - Implement the scheduler logic (simulated) for "X minutes before" and "Day before" sends.
    - Add `DispatchLog` persistence for audit trails.
- **Routing**: Create `src/routes/backoffice.dispatch.tsx`.
- **UI Components**:
    - Create `src/components/bo/dispatch/DispatchStats.tsx` and `DispatchTable.tsx`.
    - Update `src/routes/backoffice.courses.tsx` and `src/routes/backoffice.coursiers.tsx` with new tabs.
    - Update `src/components/bo/BOLayout.tsx` navigation order.
- **Business Logic**:
    - Automatic message/audio generation logic using course data templates.
    - Multi-level settings resolution (Course > Courier > Global).
    - Status transitions and operator intervention triggers.
