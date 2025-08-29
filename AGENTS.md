# AGENTS.md - Contexte pour le développement du nœud n8n-carbone

## Project Overview
- **Projet**: n8n-nodes-carbone - Un nœud personnalisé pour n8n permettant d'interagir avec l'API Carbone.io
- **Objectif**: Gestion de templates et génération de documents (PDF, DOCX, XLS, etc.) via Carbone.io
- **Architecture**: Package npm communautaire n8n avec structure TypeScript
- **Composants principaux** :
  - Node principal: `Carbone` dans `nodes/Carbone/`
  - Credentials: `CarboneApi` dans `credentials/`
  - **Nouvelle structure modulaire** :
    - `CarboneDescription.ts` - Point d'entrée pour les imports des descriptions
    - **Ressources organisées par domaine** :
      - `resources/Template/` - Gestion des templates (descriptions et opérations)
        - `TemplateDescription.ts` - Définitions des opérations et champs pour les templates
        - `TemplateOperations.ts` - Implémentation des opérations sur les templates
      - `resources/RenderDocument/` - Gestion des documents générés (descriptions et opérations)
        - `RenderDescription.ts` - Définitions des opérations et champs pour le rendu
        - `RenderOperations.ts` - Implémentation des opérations de rendu

### Routes API Carbone.io complètes :
- **Template Management**:
  - `POST /template` - Upload template (multipart/form-data ou JSON)
    - Paramètres:
      - FormData `versioning`: boolean (défaut: true) - Active le versioning des templates
      - FormData `name`: string - Nom du template
      - FormData `comment`: string - Commentaire sur le template
      - FormData `deployedAt`: date - Date de déploiement (When a report is generated using the new template ID, Carbone selects the template version with the highest deployedAt timestamp that is not in the future)
      - FormData `template`: fichier - Le fichier de template à uploader
    - **Important**: Le champ 'versioning' doit être envoyé avant le champ 'template' dans le form-data
  - `GET /template/{templateId}` - Download template file
  - `DELETE /template/{templateId}` - Delete template

- **Document Rendering**:
  - `POST /render/{templateId}` - Generate document from template + JSON data
    - Paramètres:
      - Body `data`: JSON dataset requis pour le rendu
      - Body `convertTo`: Format de conversion (pdf, docx, xlsx, ods, csv, txt, odp, ppt, pptx, jpg, png, odt, doc, html, xml, idml, epub)
  - `GET /render/{renderId}` - Retrieve generated document (file stream)

- **Template Listing**:
  - `GET /templates` - List templates with optional filtering
    - Paramètres:
      - Query `id`: string - Filter by template ID
      - Query `versionId`: string - Filter by version ID
      - Query `category`: string - Filter by category
      - Query `includeVersions`: boolean (défaut: false) - Include all versions for a specific template ID
      - Query `search`: string - Search in template name (fuzzy search), version ID (exact), or template ID (exact)
      - Query `limit`: number (défaut: 100) - Limit the number of items returned
      - Query `cursor`: string - Cursor for pagination

- **Paramètres globaux**:
  - Header `carbone-version`: 4 ou 5 (défaut: 5)
- **Authentification**: Bearer token via header `Authorization`
- **Host**: api.carbone.io (HTTPS)

## Build and Test Commands
- `npm run build` - Compile TypeScript et copie les icônes
- `npm run dev` - Mode développement avec watch TypeScript
- `npm run lint` - Vérification du code avec ESLint
- `npm run lintfix` - Correction automatique des problèmes de linting
- `npm run format` - Formatage du code avec Prettier
- `npm run prepublishOnly` - Build + linting avant publication

## Code Style Guidelines
- **TypeScript**: Configuration stricte (target ES2019, CommonJS)
- **ESLint**: Plugin `eslint-plugin-n8n-nodes-base` avec règles spécifiques n8n
- **Prettier**: Formatage automatique appliqué via `npm run format`
- **Structure**: Convention de nommage et organisation des fichiers selon standards n8n

## Testing Instructions
Pour tester les modifications :
1. Exécuter `npm run build` pour compiler le projet
2. Exécuter `npm run lint` pour vérifier la conformité du code
3. Tester le nœud dans une instance n8n locale en chargeant le package
4. Vérifier le bon fonctionnement des opérations template et render
5. Valider les retours API et la gestion des erreurs
