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
      - `resources/ConvertDocument/` - Conversion de documents (HTML→PDF, Office→PDF)
        - `ConvertDescription.ts` - Définitions des opérations et champs pour la conversion
        - `ConvertOperations.ts` - Implémentation des opérations de conversion
      - `resources/Template/` - Gestion des templates (descriptions et opérations)
        - `TemplateDescription.ts` - Définitions des opérations et champs pour les templates
        - `TemplateOperations.ts` - Implémentation des opérations sur les templates
      - `resources/RenderDocument/` - Gestion des documents générés (descriptions et opérations)
        - `RenderDescription.ts` - Définitions des opérations et champs pour le rendu
        - `RenderOperations.ts` - Implémentation des opérations de rendu

### Routes API Carbone.io complètes :
- **Template Management**:
  - `POST /template` - Upload template (**application/json with base64 template**, not multipart)
    - Paramètres body JSON:
      - `versioning`: boolean (défaut: true) - Active le versioning des templates
      - `id`: string - Custom template ID
      - `name`: string - Nom du template
      - `comment`: string - Commentaire sur le template
      - `category`: string - Catégorie du template
      - `tags`: string[] - Tags array
      - `deployedAt`: Unix timestamp (integer) - Date de déploiement
      - `expireAt`: Unix timestamp (integer) - Date d'expiration
      - `template`: string - Le fichier de template encodé en base64
    - **Important**: Utiliser JSON body (pas multipart) — les tableaux multipart (`tags`) ne sont pas correctement parsés par Carbone
    - **Important**: Les dates ISO sont converties en Unix timestamp (number) avant envoi via `convertIsoToUnixTimestamp()`
    - **Important**: Le template est converti en base64 via `arrayBufferToBase64(fileBuffer as unknown as ArrayBuffer)`
  - `PATCH /template/{templateId}` - Update template metadata
    - Paramètres body JSON: `name`, `comment`, `category`, `tags` (array), `deployedAt` (Unix timestamp), `expireAt` (Unix timestamp)
    - Tags: input comma-separated string → split/trim/filter → sent as array
  - `GET /template/{templateId}` - Download template file
  - `DELETE /template/{templateId}` - Delete template
  - `GET /templates/categories` - List all template categories
  - `GET /templates/tags` - List all template tags

- **Document Rendering**:
  - `POST /render/{templateId}` - Generate document from template ID + JSON data
    - Paramètres:
      - Body `data`: JSON dataset requis pour le rendu
      - Body `convertTo`: Format de conversion (pdf, docx, xlsx, ods, csv, txt, odp, ppt, pptx, jpg, png, odt, doc, html, xml, idml, epub)
      - Body `converter`: PDF rendering engine — `L` LibreOffice (ODT/ODS/ODP), `O` OnlyOffice (DOCX/XLSX/PPTX), `C` Chromium (HTML)
      - Body `batchSplitBy`: JSON path to an array for batch generation (e.g. `d.items`)
      - Body `batchOutput`: Batch output format — `zip` or `pdf` (merged)
      - Body `reportName`, `timezone`, `lang`, `complement`, `variableStr`, `enum`, `translations`, `currencySource`, `currencyTarget`, `currencyRates`, `hardRefresh`: additional rendering options
  - `POST /render/template` - Generate document from base64 template + JSON data
    - Paramètres:
      - Body `data`: JSON dataset requis pour le rendu
      - Body `convertTo`: Format de conversion (pdf, docx, xlsx, ods, csv, txt, odp, ppt, pptx, jpg, png, odt, doc, html, xml, idml, epub)
      - Body `template`: string - Template en base64 requis
  - `GET /render/{renderId}` - Retrieve generated document (file stream)

- **Asynchronous rendering** (`webhookUrl` additional option):
  - Sent as `carbone-webhook-url` **header** (not body param)
  - When set, `?download=true` is NOT added — response is JSON `{ success, message }`
  - Carbone POSTs `{ success, data: { renderId } }` to the webhook URL when done
  - In code: `if (!returnRenderId && !webhookUrl)` → download branch; else → JSON branch

- **Document Conversion** (uses `POST /render/template` with `?download=true`):
  - **Convert HTML to PDF**: body `{ data: {}, template: "<base64>", convertTo: "pdf", converter: "C" }`
    - 4 input sources: URL (fetched then base64-encoded), File (n8n binary), Template ID (downloaded via `GET /template/{id}` then base64), Raw HTML (string to base64)
    - Always uses Chromium converter (`C`)
  - **Convert Office to PDF**: body `{ data: {}, template: "<base64>", convertTo: "pdf", converter: "L"|"O" }`
    - 2 input sources: File (n8n binary), Template ID (downloaded then base64)
    - User-selectable converter: LibreOffice (`L`, default) or OnlyOffice (`O`)
  - **Important**: No `@types/node` in devDependencies — use `arrayBufferToBase64()` and `stringToBase64()` helper functions instead of `Buffer.from()`. The `getBinaryDataBuffer` return value has `.toString('base64')` available at runtime.

- **Template Listing**:
  - `GET /templates` - List templates with optional filtering
    - Paramètres:
      - Query `id`: string - Filter by template ID
      - Query `versionId`: string - Filter by version ID
      - Query `category`: string - Filter by category
      - Query `includeVersions`: boolean (défaut: false) - Include all versions for a specific template ID
      - Query `origin`: number - Filter by origin: `0` = API, `1` = Studio (omit for all)
      - Query `search`: string - Search in template name (fuzzy search), version ID (exact), or template ID (exact)
      - Query `limit`: number (défaut: 100) - Limit the number of items returned
      - Query `cursor`: string - Cursor for pagination

- **Paramètres globaux**:
  - Header `carbone-version`: 4 ou 5 (défaut: 5)
- **Authentification**: Bearer token via header `Authorization`
- **Host**: api.carbone.io (HTTPS)

## Environnement de développement
- **CLI officiel n8n**: Le projet utilise `@n8n/node-cli` (v0.20.0+) pour le développement, build et tests
- **Configuration ESLint**: Format flat config moderne (`eslint.config.mjs`) — `import { config } from '@n8n/node-cli/eslint'; export default config;`
- **Cloud support**: Activé via `n8n-node cloud-support enable` — `"strict": true` dans la section `n8n` de `package.json`, requis pour l'éligibilité n8n Cloud
- **Hot-reload**: Le serveur de développement recharge automatiquement les modifications

## Build and Test Commands
- `npm run build` - Compile TypeScript avec le CLI n8n et copie les icônes (via gulp)
- `npm run dev` - Lance une instance n8n locale avec hot-reload sur `localhost:5678`
- **Import test workflows**: importer manuellement les fichiers JSON du dossier `test/` via l'interface n8n (Workflows → Import from file) une fois l'instance démarrée. La commande `n8n import:workflow` nécessite n8n installé globalement et n'est pas incluse dans les scripts npm.
- `npm run lint` - Vérification du code avec ESLint 9 (règles strictes community nodes)
- `npm run lintfix` - Correction automatique des problèmes de linting
- `npm run format` - Formatage du code avec Prettier
- `npm run prepublishOnly` - Validation prerelease + build des icônes avant publication npm
- `npm run release` - Bumps version + publishes to npm — **ne jamais modifier manuellement `"version"` dans `package.json`**

## Code Style Guidelines
- **TypeScript**: Configuration stricte (target ES2019, CommonJS)
- **ESLint 9**: Configuration flat config héritée de `@n8n/node-cli/eslint`
  - Règles community nodes strictes (requis pour n8n Cloud)
  - Détection des fonctions dépréciées (ex: `requestWithAuthentication`)
  - Validation des icônes et structure des nœuds
  - Typage TypeScript strict (pas de `any`)
  - **Les options d'une `collection` doivent être en ordre alphabétique strict par `displayName`** (`node-param-collection-type-unsorted-items`) — non négociable, ne peut pas être désactivé
  - **Ne jamais ajouter `@typescript-eslint/*` en devDependencies directes** — géré en interne par `@n8n/node-cli`
- **Prettier**: Formatage automatique appliqué via `npm run format`
- **Structure**: Convention de nommage et organisation des fichiers selon standards n8n

## Testing Instructions
Pour tester les modifications :
1. Exécuter `npm run dev` pour lancer n8n localement avec le nœud chargé
   - Le serveur démarre sur `http://localhost:5678`
   - Les modifications sont rechargées automatiquement (hot-reload)
   - Vous pouvez tester directement dans l'interface n8n
2. Exécuter `npm run lint` pour vérifier la conformité du code
3. Exécuter `npm run build` pour compiler avant publication
4. Vérifier le bon fonctionnement des opérations template et render
5. Valider les retours API et la gestion des erreurs
6. Pour publier sur npm: `npm run release` (gère le bump de version automatiquement)
