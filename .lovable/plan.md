# Plan — Agent de Dispatch Coursiers ORCONDIS

Ce plan vise à ajouter un agent interne d'automatisation pour la communication vers les coursiers, permettant l'envoi programmé de missions (texte/audio) et la gestion des réponses.

## Modifications du modèle de données (`src/lib/bo/ops-data.ts`)

- Ajouter les types `DispatchStatus`, `CommunicationMode`, `DispatchSchedule`.
- Étendre `CourseOps` pour inclure les paramètres de communication (mode, programmation, dates/heures, statuts).
- Ajouter un type `AgentSettings` pour la configuration globale.
- Ajouter une collection `dispatchLogs` dans `OpsData` pour l'audit.

## Mise à jour du Store (`src/lib/bo/ops-store.tsx`)

- Ajouter des actions pour programmer, envoyer, annuler et reprogrammer les communications.
- Gérer la logique de réaffectation : annulation automatique des envois programmés pour l'ancien coursier et création pour le nouveau.
- Implémenter la détection de modification de course après programmation/envoi.
- Gérer les relances automatiques et les confirmations.

## Interface Back-Office

### Paramètres (`src/routes/backoffice.parametres.tsx`)
- Ajouter une nouvelle section "Agent de communication coursier" pour configurer les règles par défaut (activation, canal, mode, programmation, relances, ton).

### Gestion des courses (`src/routes/backoffice.courses.tsx`)
- Mettre à jour le formulaire de création/édition : ajout de la section "Communication au coursier".
- Mettre à jour le détail de la course : ajout d'un onglet "Communication coursier" avec l'historique et les actions manuelles.

### Planning & Dispatch (`src/routes/backoffice.coursiers.tsx` ou nouvelle vue)
- Mettre à jour la vue planning pour afficher les indicateurs de communication.
- Créer une vue "Dispatch du jour" (chronologique) intégrée aux modules existants.

### Dashboard (`src/routes/backoffice.dashboard.tsx`)
- Ajouter une carte opérationnelle "Communications coursiers" et un widget "Prochains envois programmés".

## Simulation de l'Agent
- Génération dynamique de textes et de scripts audio en français naturel basés sur les données réelles de la course.
- Système de notifications internes pour les événements de dispatch (reçu, accepté, refusé, alerte).

## Détails techniques
- Utilisation de `localStorage` pour persister l'état de l'agent et les logs.
- Les fichiers `src/lib/bo/ops-data.ts` et `src/lib/bo/ops-store.tsx` seront les pivots de la logique métier.
- L'interface restera cohérente avec le kit UI existant (`src/components/bo/kit.tsx`).
