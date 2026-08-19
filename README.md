# Remix of Remix of Remix of Remix of Remix of Remix of Arcondis Connect

ARCONDIS — PART 1/3

Public Website, Incoming Requests & WhatsApp Qualification

Build the first part of a complete professional platform for ARCONDIS, a service bureau specialized in professional and individual errands, administrative procedures, document collection and delivery, supplier payments, cheque handling, temporary procedures and field operations performed by couriers.

This is Part 1 of 3.

Create the application architecture and the modules described below.

IMPORTANT:

The entire user interface must be in French.

Keep the architecture extensible because Parts 2 and 3 will add operational and financial modules.

Do NOT build customer live GPS tracking.

Do NOT create an Uber-like experience.

Do NOT invent features that are not requested.

1. GENERAL BUSINESS WORKFLOW

The main ARCONDIS workflow is:

Site web
→
Formulaire court
→
Demande créée
→
Agent WhatsApp
→
Qualification et récupération des informations manquantes
→
Intervention humaine si nécessaire
→
Informations complètes
→
Demande disponible automatiquement dans le Back-Office

ARCONDIS will then continue operational processing from the Back-Office.

The customer does NOT need to enter all operational information directly on the website.

2. DESIGN

Create a premium professional B2B interface.

Style:

Corporate

Modern

Clean

Operational SaaS

White/light grey backgrounds

Dark navy typography

Professional blue accent

Subtle borders

8–12px rounded cards

Clear tables

Professional status badges

Modern icons

Responsive

No excessive gradients

No futuristic AI design

Back-Office layout:

Left sidebar

Top navigation/header

Page titles

Breadcrumbs

Search

Notifications

User profile

Footer:

Created by IZEMX

3. PUBLIC WEBSITE STRUCTURE

Create:

Accueil

Nos services

Comment ça marche

Faire une demande

À propos

Contact

Connexion

4. HOME PAGE

Create a professional ARCONDIS landing page.

Hero:

Vos courses professionnelles et démarches, prises en charge simplement.

Supporting text explaining ARCONDIS services.

Primary CTA:

Faire une demande

Secondary CTA:

Nous contacter sur WhatsApp

Create a services section including:

Récupération de documents

Livraison de documents

Courses administratives

Paiement de factures

Paiement de fournisseurs

Récupération de chèques

Dépôt de chèques

Procédures administratives

Procédure provisoire

Vérification / contrôle

Autres prestations

Services must later be administrable from Back-Office settings.

5. HOW IT WORKS SECTION

Show the customer workflow:

Vous envoyez votre demande.

Notre assistant WhatsApp vous contacte.

Les informations nécessaires sont complétées.

ARCONDIS prend en charge votre demande.

Vous êtes informé de l’avancement.

La prestation est clôturée.

Do NOT mention real-time GPS tracking.

6. WEBSITE REQUEST FORM

Create a short form.

Fields:

Identification

Client existant / Nouveau client

Nom

Prénom

Société / Entreprise

Téléphone

WhatsApp

Email

Demande

Type de demande

Description / Message

Documents

Ajouter une pièce jointe

Consentement

Autoriser ARCONDIS à poursuivre l’échange via WhatsApp

CTA:

Envoyer ma demande

After submission display:

Votre demande a bien été enregistrée. Notre assistant WhatsApp va vous contacter afin de compléter les informations nécessaires.

Automatically create a record:

Status:

À qualifier

Source:

Site web

7. INCOMING REQUEST MODULE

Create Back-Office module:

Demandes entrantes

Navigation:

Toutes

À qualifier

Qualification WhatsApp

Intervention humaine

En attente client

Informations complètes

Transformées

Annulées

Fields:

N° demande

Jour

Date

Heure

Source

Client

Contact

Société

Téléphone

WhatsApp

Email

Service demandé

Message initial

Documents

Agent WhatsApp

Responsable humain

Informations manquantes

Dernière interaction

Statut

Notes internes

Sources:

Site web

WhatsApp

Téléphone

Back-Office

Email

Autre

Statuses:

À qualifier

Qualification WhatsApp

Intervention humaine requise

En attente client

Informations complètes

Transformée

Annulée

8. REQUEST CRUD

Implement visually functional CRUD:

Créer

Consulter

Modifier

Archiver

Restaurer

Assigner

Ajouter document

Ajouter note

Ouvrir WhatsApp

Marquer informations complètes

Annuler

Do not permanently delete operational records.

9. WHATSAPP AI QUALIFICATION

After the website form, the WhatsApp assistant continues the conversation.

IMPORTANT:

The assistant already knows information provided through the website.

It must NOT ask the customer to repeat information already collected.

Example:

Bonjour Monsieur Karim, nous avons bien reçu votre demande concernant une récupération de documents. J’ai besoin de quelques informations complémentaires afin de préparer votre demande.

10. INFORMATION TO COLLECT THROUGH WHATSAPP

The AI should progressively collect missing information.

Client

Type de client

Nom

Prénom

Dénomination

Raison sociale

GSM

Email

Request

Service

Type de course

Description

Niveau d’importance

Instructions spéciales

Pickup

Ville

Quartier

Adresse complète

Zone

Contact sur place

GSM du contact

Destination

Allow multiple destinations.

For each:

Ville

Quartier

Adresse

Zone

Contact

GSM

Instructions

Planning

Date

Tranche horaire

Heure fixe

Normale / Urgente

Documents

Allow:

PDF

Photos

Factures

Chèques

Bons

Documents administratifs

Autres fichiers

The received documents must automatically be associated with the request.

11. HUMAN HANDOFF

Create status:

Intervention humaine requise

Trigger examples:

Demande ambiguë

Tarification particulière

Procédure complexe

Client demande un humain

Informations contradictoires

Agent incapable de poursuivre

Instructions financières sensibles

Cas exceptionnel

The ARCONDIS human operator must see the complete conversation history.

Actions:

Reprendre la conversation

Répondre

Ajouter une note interne

Modifier les informations collectées

Ajouter document

Marquer informations complètes

Clôturer

Annuler

12. WHATSAPP INBOX

Create module:

WhatsApp

Navigation:

Toutes les conversations

Nouvelles

Agent WhatsApp

Intervention humaine

En attente client

Terminées

Use a 3-column interface.

Left

Conversation list.

Center

WhatsApp conversation.

Right

Customer and request context.

Display on the right:

Client

Contact

Téléphone

Service

Demande

Retrait

Destination

Planning

Documents

Informations manquantes

Résumé IA

Responsable humain

Notes internes

Use completion labels:

Complété

Manquant

À confirmer

13. REQUEST DETAIL PAGE

Do NOT use a simple popup.

Create a complete detail page.

Sections/tabs:

Vue d’ensemble

Qualification

Conversation WhatsApp

Documents

Notes

Historique

The operator must immediately understand:

Ce que le client demande

Ce qui a déjà été collecté

Ce qu’il reste à demander

14. PARTIAL DASHBOARD

Create the first version of the Back-Office dashboard.

KPI cards:

Demandes reçues aujourd’hui

Demandes à qualifier

Conversations WhatsApp en cours

Intervention humaine requise

Informations complètes

Demandes annulées

Widgets:

Demandes récentes

Columns:

N°

Client

Type de demande

Source

Date

Statut

Action

Interventions requises

Show conversations requiring human intervention.

Derniers messages WhatsApp

Show latest customer conversations.

15. EXAMPLE WHATSAPP FLOW

Website request:

Je dois récupérer un chèque et payer un fournisseur demain matin.

Assistant:

Bonjour Monsieur Karim. Votre demande a bien été reçue. Pouvez-vous m’indiquer l’adresse où le chèque doit être récupéré ?

Customer:

Maarif, Casablanca.

Assistant:

Merci. Quel est le nom du fournisseur et son adresse ?

Customer:

Fournitures Atlas, Aïn Sebaâ.

Assistant:

Souhaitez-vous que la mission soit réalisée à une heure précise ou durant la matinée ?

Customer:

Avant 11h.

When all mandatory information has been collected:

Status becomes:

Informations complètes

The request becomes ready for operational processing.

16. DEMO DATA

Use realistic French data.

Clients:

Atlas Industrie

Société Marocaine de Distribution

Cabinet El Mansouri

Laboratoire Al Amal

Do not use Lorem Ipsum or generic fake SaaS text.

17. IMPORTANT

For this Part 1:

Focus on:

Public website

Initial request

Request database

WhatsApp qualification

Human handoff

Incoming request management

Initial dashboard

Do NOT yet build the complete:

Dossiers

Courses

Couriers

Billing

Supplier payments

Reporting

These will be added in Parts 2 and 3.

Make all current CRUD actions functional with simulated coherent data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/81f3f982-3aca-40b6-8514-a2ef5bc7d807).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
