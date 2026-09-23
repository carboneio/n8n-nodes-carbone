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
      - `deployedAt`: Unix timestamp (integer) - Date de déploiement (futur interdit, ≥ 42000000000 = "NOW")
      - `expireAt`: Unix timestamp (integer) - Date d'expiration (0 = n'expire jamais)
      - `origin`: integer - `0` API (défaut), `1` Studio, `2` Salesforce, `3` Odoo, `4` HubSpot - fixé à l'upload, non modifiable
      - `sample`: array (maxItems 1) - Données d'exemple pour Carbone Studio (`[{ data, complement, translations, enum }]`)
      - `template`: string - Le fichier de template encodé en base64
    - **Important**: Utiliser JSON body (pas multipart) - les tableaux multipart (`tags`) ne sont pas correctement parsés par Carbone
    - **Important**: Les dates ISO sont converties en Unix timestamp (number, jamais string) avant envoi via `toUnixTimestamp()`
    - **Important**: Le template est encodé en base64 via `fileBuffer.toString('base64')` (PAS `arrayBufferToBase64`, qui corrompt les données sur ce chemin)
  - `PATCH /template/{templateId-or-versionId}` - Update template metadata
    - Un template ID dans l'URL modifie la version déployée ; un version ID modifie cette version précise
    - Paramètres body JSON: `id` (déplace la version vers un autre template ID), `name`, `comment`, `category`, `tags` (array, envoyés tels quels depuis le multiOptions), `deployedAt` (Unix timestamp integer), `expireAt` (Unix timestamp integer - champ ajouté mais laissé vide dans l'UI → envoie `0` = annule une suppression programmée)
  - `GET /template/{templateId-or-versionId}` - Download template file
  - `DELETE /template/{templateId-or-versionId}` - Delete template (soft delete : template ID = toutes les versions, version ID = cette version ; fichier supprimé après le délai de rétention, 24 h sur le Cloud)
  - `GET /templates/categories` - List all template categories
  - `GET /templates/tags` - List all template tags

- **Document Rendering**:
  - `POST /render/{templateId}` - Generate document from template ID + JSON data
    - Paramètres:
      - Body `data`: JSON dataset requis pour le rendu
      - Body `convertTo`: string (bmp, csv, doc, docx, epub, gif, html, idml, jpg, md, odg, odp, ods, odt, pdf, png, ppt, pptx, rtf, svg, tiff, txt, webp, xhtml, xls, xlsx, xml) **ou objet** `{ formatName, formatOptions }` - le nœud bascule sur la forme objet quand des Format Options sont définies (sécurité PDF, watermarks max 4, PDF/A/UA, options image/CSV). Les formats acceptant `formatOptions` : pdf, jpg, png, csv (constante `FORMAT_OPTIONS_FORMATS` dans `RenderOperations.ts`, alignée sur la condition d'affichage du champ)
      - Body `converter`: PDF rendering engine - `I` Carbone ICE (DOCX/ODT, le plus rapide, options Security+Watermark seulement), `L` LibreOffice (défaut, toutes les options), `O` OnlyOffice (XLSX/PPTX ; pour DOCX→PDF, préférer ICE), `C` Chromium (HTML, options Security+Watermark)
      - Body `batchSplitBy`: JSON path to an array for batch generation (e.g. `d.items`) - requiert le webhook (asynchrone), max 100 objets sur le Cloud
      - Body `batchOutput`: Batch output format - `zip` or `pdf` (merged)
      - Body `batchReportName`: nom de chaque fichier du ZIP (tags Carbone acceptés, ex. `report-{d.id}`)
      - Body `preReleaseFeatureIn`: integer - niveau de features pre-release pour ce rendu
      - Body `failOn`: array - conditions qui font échouer le rendu (`IMAGE_URL_ERROR`)
      - Body `reportName`, `timezone`, `lang`, `complement`, `variableStr`, `enum`, `translations`, `currencySource`, `currencyTarget`, `currencyRates`, `hardRefresh`: additional rendering options
  - `POST /render/template` - Generate document from base64 template + JSON data
    - Paramètres:
      - Body `data`: JSON dataset requis pour le rendu
      - Body `convertTo`: identique à `POST /render/{templateId}` (string ou objet)
      - Body `template`: string - Template en base64 requis
    - Used when `templateSource` is `'file'` or `'base64'`
    - `'file'`: binary read via `assertBinaryData` + `getBinaryDataBuffer` → `.toString('base64')`
    - `'base64'`: user-provided base64 string passed directly
  - `GET /render/{renderId}` - Retrieve generated document (file stream)

- **Asynchronous rendering** (`webhookUrl` additional option):
  - Sent as `carbone-webhook-url` **header** (not body param) - raises the render timeout to 5 minutes
  - When set, `?download=true` is NOT added - response is JSON `{ success, message }`
  - Carbone POSTs `{ success, data: { renderId } }` to the webhook URL when done
  - In code: `if (!returnRenderId && !webhookUrl)` → download branch; else → JSON branch
  - Header `carbone-webhook-header-authorization` (option `webhookAuthorization`): header `authorization` envoyé par Carbone à l'appel du webhook
  - Header `carbone-egress-header-authorization` (option `egressAuthorization`, max 511 chars): header `authorization` sur TOUT le trafic sortant de Carbone (webhooks, images dynamiques par URL, `appendFile`) - envoyé sur les deux branches (synchrone incluse)

- **Document Conversion** (uses `POST /render/template` with `?download=true`):
  - **Convert HTML to PDF**: body `{ data: {}, template: "<base64>", convertTo: "pdf", converter: "C" }`
    - 4 input sources: URL (fetched then base64-encoded), File (n8n binary), Template ID (downloaded via `GET /template/{id}` then base64), Raw HTML (string to base64)
    - Always uses Chromium converter (`C`)
  - **Convert Office to PDF**: body `{ data: {}, template: "<base64>", convertTo: "pdf", converter: "I"|"L"|"O" }`
    - 2 input sources: File (n8n binary), Template ID (downloaded then base64)
    - User-selectable converter: Carbone ICE (`I`, fastest for DOCX/ODT), LibreOffice (`L`, default) or OnlyOffice (`O`)
    - **Décision produit**: la ressource Convert est volontairement limitée à la sortie PDF (mise en avant de la génération PDF) - ne pas proposer de généraliser `convertTo` ici
  - **Note**: `@types/node` est déclaré en devDependency (build-only, compatible vérification n8n Cloud) - le type `Buffer` est donc disponible. Les helpers `arrayBufferToBase64()` / `stringToBase64()` existants restent utilisés dans `ConvertOperations.ts`.

- **Template Listing**:
  - `GET /templates` - List templates with optional filtering
    - Paramètres:
      - Query `id`: string - Filter by template ID
      - Query `versionId`: string - Filter by version ID
      - Query `category`: string - Filter by category
      - Query `includeVersions`: boolean (défaut: false) - Include all versions for a specific template ID
      - Query `origin`: number - Filter by origin: `0` API, `1` Studio, `2` Salesforce, `3` Odoo, `4` HubSpot (omit for all) - en sortie, le nœud mappe la valeur numérique vers son libellé
      - Query `search`: string - Search in template name (fuzzy search), version ID (exact), or template ID (exact)
      - Query `limit`: number (min 1, max 100, défaut API 100 - défaut UI 50, imposé par la règle lint `node-param-default-wrong-for-limit`)
      - Query `cursor`: string - Cursor for pagination

- **Paramètres globaux**:
  - Header `carbone-version`: `5` (le credential ne propose que la v5 - **décision produit** : ne jamais mentionner les anciennes versions de l'API dans l'UI, elles ne supportent pas toutes les options du nœud)
  - Credential `apiKey`: optionnel - les instances On-Premise sans authentification doivent fonctionner (ne pas mettre `required: true`)
- **Authentification**: Bearer token via header `Authorization`
- **Host**: api.carbone.io (HTTPS)

## Environnement de développement
- **CLI officiel n8n**: Le projet utilise `@n8n/node-cli` (v0.49+) pour le développement, build et lint
- **Node 26 + isolated-vm**: installer/mettre à jour `n8n-workflow` avec `npm install n8n-workflow@latest --ignore-scripts` (le module natif `isolated-vm`, inutile au build, ne compile pas sur les Node récents) et garder `"n8n-workflow": "*"` en peerDependencies
- **Configuration ESLint**: Format flat config moderne (`eslint.config.mjs`) - `import { config } from '@n8n/node-cli/eslint'; export default config;`
- **Cloud support**: Activé via `n8n-node cloud-support enable` - `"strict": true` dans la section `n8n` de `package.json`, requis pour l'éligibilité n8n Cloud
- **Hot-reload**: Le serveur de développement recharge automatiquement les modifications

## Build and Test Commands
- `npm run build` - Compile TypeScript avec le CLI n8n et copie les icônes (via gulp)
- `npm run dev` - Lance une instance n8n locale avec hot-reload sur `localhost:5678`
- **Import test workflows**: importer manuellement les fichiers JSON du dossier `test/` via l'interface n8n (Workflows → Import from file) une fois l'instance démarrée. La commande `n8n import:workflow` nécessite n8n installé globalement et n'est pas incluse dans les scripts npm.
- `npm test` - Tests unitaires vitest (dossier `__tests__/` à la racine - ne PAS les mettre dans `nodes/` : `n8n-node build` compile tout le `include` du tsconfig dans `dist/`)
- `npm run lint` - Vérification du code avec ESLint 9 (règles strictes community nodes)
- `npm run lintfix` - Correction automatique des problèmes de linting
- `npm run format` - Formatage du code avec Prettier
- `npm run prepublishOnly` - Validation prerelease + build des icônes avant publication npm
- `npm run release` - Bumps version + publishes to npm - **ne jamais modifier manuellement `"version"` dans `package.json`**

## Code Rules
Chaque changement doit respecter quatre propriétés, et elles s'appliquent à toutes les échelles à la
fois - une expression, une fonction, un fichier, et tout le chemin entre l'UI du nœud et l'appel à
l'API Carbone. C'est ainsi que la première version est écrite, pas lors d'une passe de polish
ultérieure.

- **Minimal, parce que moins c'est mieux.** Le moins de code qui résout entièrement le problème, et
  rien de plus. Chaque ligne en trop est un passif, pas un actif : elle élargit la surface où une
  erreur peut se cacher, et c'est une chose de plus à lire, documenter et maintenir vraie dans un an.
  Préférer supprimer plutôt qu'ajouter ; réutiliser l'existant avant d'écrire une variante ; fusionner
  la logique dupliquée chez un seul propriétaire. Entre deux changements qui arrivent au même
  résultat, celui qui touche le moins de lignes et introduit le moins de concepts gagne. Une branche
  morte, un paramètre inutilisé, un deuxième helper qui fait ce qu'un premier fait déjà, une couche
  qui ne fait que transmettre - supprimés, pas laissés. Le même principe vaut de bout en bout : ne
  pas ajouter un champ UI, un paramètre de body ou un aller-retour API dont la feature n'a pas
  besoin.
- **Élégant.** Le code se lit comme le code qui l'entoure et exprime son intention directement : la
  forme de la solution épouse la forme du problème, les noms disent ce qu'est une chose, et le flux
  de contrôle est le plus simple. Déléguer à la plateforme - les helpers n8n (`prepareBinaryData`,
  `assertBinaryData`, `httpRequestWithAuthentication`), les `displayOptions`, les resource locators -
  plutôt que de les réimplémenter, et faire en sorte qu'une vérification exécute la *même* primitive
  que ce qu'elle protège, pour que les deux ne puissent pas diverger (la garde runtime de `convertTo`
  s'appuie sur la même liste de formats que la condition d'affichage du champ). Aucune astuce qu'un
  lecteur devrait décoder.
- **Ultra performant.** Aucun travail gaspillé : rien n'est parsé, téléchargé, alloué ou requêté
  deux fois quand une fois suffit ; pas de construction de chaîne octet par octet là où un seul
  `Buffer.toString('base64')` fait l'affaire ; pas de template téléchargé puis re-uploadé quand
  l'API convertit en un seul appel ; une valeur calculée une fois et réutilisée. Attention aux gros
  fichiers et buffers - les documents sont la charge utile de ce nœud. Pousser le travail là où il
  coûte le moins - l'API Carbone, le runtime n8n - et le faire paresseusement quand il peut ne pas
  être nécessaire du tout.
- **Sécurisé.** Refus par défaut, et comparaison contre une allow-list exacte, jamais une sous-chaîne
  ni une denylist. Valider la valeur exacte qui sera utilisée, pas une copie : un décodage ou une
  normalisation entre la vérification et l'usage, c'est ainsi qu'un payload contourne la
  vérification. Ne faire confiance à aucune entrée - valider le type, la forme et la longueur en
  entrée (JSON parsé avec une erreur explicite, IDs passés par `extractValue`), et ne jamais
  construire d'URL, de headers ou de JSON par concaténation d'entrées non validées. Échouer fermé
  quand une config ou un credential manque. Ne rien laisser fuiter : une erreur interne n'atteint
  jamais la sortie sans filtrage, les secrets sont en `typeOptions: { password: true }` et jamais
  loggés. Zéro dépendance runtime ; les GitHub Actions pinnées sur des SHAs de commit. La logique
  sensible pour la sécurité est prouvée par un test qui rejoue les vecteurs d'attaque.

## Code Style Guidelines
- **TypeScript**: Configuration stricte (target ES2019, CommonJS)
- **ESLint 9**: Configuration flat config héritée de `@n8n/node-cli/eslint`
  - Règles community nodes strictes (requis pour n8n Cloud)
  - Détection des fonctions dépréciées (ex: `requestWithAuthentication`)
  - Validation des icônes et structure des nœuds
  - Typage TypeScript strict (pas de `any`)
  - **Les options d'une `collection` doivent être en ordre alphabétique strict par `displayName`** (`node-param-collection-type-unsorted-items`) - non négociable, ne peut pas être désactivé
  - **Ne jamais ajouter `@typescript-eslint/*` en devDependencies directes** - géré en interne par `@n8n/node-cli`
- **Prettier**: Formatage automatique appliqué via `npm run format`
- **Structure**: Convention de nommage et organisation des fichiers selon standards n8n

## Testing Instructions
Pour tester les modifications :
1. Exécuter `npm test` - tests unitaires vitest (`__tests__/`, mocks d'`IExecuteFunctions`, assertions sur les corps de requêtes HTTP)
2. Exécuter `npm run lint` pour vérifier la conformité du code
3. Exécuter `npm run build` pour compiler avant publication
4. Exécuter `npm run dev` pour lancer n8n localement avec le nœud chargé
   - Le serveur démarre sur `http://localhost:5678` (hot-reload)
   - Importer les workflows e2e du dossier `test/` et les exécuter contre la vraie API
5. Valider les retours API et la gestion des erreurs

## Publication
- `npm run release` en local : lint + build, bump de version interactif, changelog, commit, **tag** poussé
- Le tag `*.*.*` déclenche `.github/workflows/publish.yml` → publication npm avec **provenance** (requis par n8n pour les nodes vérifiés depuis mai 2026)
- Prérequis one-time : Trusted Publisher (OIDC) configuré sur npmjs.com, ou secret `NPM_TOKEN` (voir les commentaires de `publish.yml`)
- Les GitHub Actions sont pinnées sur des SHAs de commit - les maintenir ainsi lors des mises à jour
