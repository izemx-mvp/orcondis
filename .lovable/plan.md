# Refonte Design ORCONDIS - Light & Dark Mode

Ce plan vise à transformer l'interface ORCONDIS pour atteindre une qualité premium, avec un focus sur la correction du titre Hero, l'amélioration radicale du mode sombre (Dark Mode) et la création d'environnements visuels riches mais subtils pour les deux modes.

## Changements visuels et structurels

### 1. Refonte du Système de Couleurs (Dark Mode)
- Abandonner le noir pur (`#000000`) au profit d'une palette "Dark Navy" sophistiquée.
- Utiliser des surfaces en `oklch` pour garantir le contraste et la profondeur.
- Assurer que les cartes se détachent clairement du fond.

### 2. Correction du Hero & Logo
- Réduction drastique de la taille du titre "ORCONDIS" pour une hiérarchie visuelle élégante.
- Rééquilibrage de la disposition en deux colonnes : à gauche le contenu textuel/CTA, à droite la carte de mission.
- Adaptation responsive pour éviter les chevauchements sur tous les écrans.

### 3. Backgrounds Premium
- **Light Mode** : Introduction de gradients bleutés extrêmement pâles, halos lumineux subtils et effets de profondeur pour sortir du blanc "plat".
- **Dark Mode** : Background bleu nuit profond avec animations fluides très lentes, évoquant la technologie et la logistique.

### 4. Composants & Accessibilité
- Mise à jour de tous les composants (Navbar, Buttons, StatCards, Tables, Dialogs) pour une cohérence totale.
- Correction des contrastes pour tous les textes (principaux et secondaires) dans les deux modes.
- Raffinement des cercles d'étapes (1-6) pour une lisibilité parfaite.

## Détails techniques

### Couleurs OKLCH (Estimation)
- **Dark Background** : `oklch(0.15 0.04 258)` (Navy profond)
- **Dark Surface** : `oklch(0.20 0.04 258)` (Légèrement plus clair)
- **Light Background** : `oklch(0.99 0.01 258)` (Blanc teinté)

### Typographie & Spacing
- Maintien de "Inter var" avec une échelle de titres corrigée (H1 Hero réduit).
- Utilisation de `border-radius: 24px` pour un look moderne et doux.

### Composants impactés
- `src/styles.css` : Définition des nouvelles variables de thème.
- `src/components/ui/design-system/AnimatedBackground.tsx` : Amélioration des visuels de fond.
- `src/routes/site/index.tsx` : Rééquilibrage complet de la section Hero.
- `src/components/bo/kit.tsx` : Harmonisation des composants du back-office.
- `src/components/PublicLayout.tsx` : Mise à jour de la Navbar et du Footer.
