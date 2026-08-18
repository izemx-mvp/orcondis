# Mise à jour du module Courses : Liste et Planning

Ajout d'une vue Calendrier professionnelle et d'une gestion de planification visuelle pour le Back-Office ORCONDIS.

## Changements

### Module Courses (`/backoffice/courses`)
- Ajout d'un sélecteur de vue "Liste | Planning" en haut de page.
- Persistance de la vue sélectionnée.

### Vue Liste
- Mise à jour des colonnes pour inclure : N° Course, Date, Heure, Client, Correspondant, Service, Type, Genre, Retrait, Destination, Coursier, Dispatch, Statut.
- Optimisation des filtres : Période, Client, Dossier, Coursier, Zone, Type, Genre, Statut, Dispatch, Transport.

### Vue Planning (Calendrier)
- Intégration d'un calendrier complet avec modes **Jour**, **Semaine** (défaut) et **Mois**.
- Affichage des événements avec informations clés (Heure, N°, Client, Trajet, Coursier, Statut).
- Indicateurs visuels pour le statut du Dispatch (Agent de communication WhatsApp).
- Code couleur par statut opérationnel.
- Section dédiée aux **Courses à planifier** (sans date/heure).
- Drag & Drop pour modifier la date/heure (si possible techniquement) ou planification manuelle rapide.
- Panneau de détail latéral ou dialogue au clic sur un événement.

### Gestion du Dispatch dans le Planning
- Visualisation directe de l'état des communications coursiers (Envoyé, Confirmé, Refusé, Sans réponse).
- Accès rapide aux actions de dispatch depuis le calendrier (Relancer, Voir conversation).

### Intégration de données
- Utilisation stricte de la même source de données pour les deux vues.
- Pas de portail coursier (communication exclusive via WhatsApp).

## Détails techniques

### Dépendances
- `date-fns` pour la manipulation des dates.
- `lucide-react` pour les icônes opérationnelles.

### Composants
- `CalendarContainer` : Structure globale du calendrier avec navigation.
- `CalendarWeekView` : Grille hebdomadaire avec créneaux horaires.
- `CalendarDayView` : Vue détaillée de la journée.
- `CalendarMonthView` : Vue d'ensemble mensuelle avec compteurs.
- `UnplannedCourses` : Liste des courses en attente de programmation.

### Modèle de données
- Aucun changement requis sur `CourseOps`, exploitation des champs `dateCourse`, `heureFixe`, `trancheHoraire` et `dispatch`.
