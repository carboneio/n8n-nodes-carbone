# AGENTS.md - Contexte pour le développement du nœud n8n-carbone

## Project Overview
- **Projet**: n8n-nodes-carbone - Un nœud personnalisé pour n8n permettant d'interagir avec l'API Carbone.io
- **Objectif**: Gestion de templates et génération de documents (PDF, DOCX, XLS, etc.) via Carbone.io
- **Architecture**: Package npm communautaire n8n avec structure TypeScript
- **Composants principaux**: 
  - Node principal: `Carbone` dans `nodes/Carbone/`
  - Credentials: `CarboneApi` dans `credentials/`
  - Description des opérations dans `CarboneDescription.ts`

### Routes API Carbone.io complètes :
- **Template Management**:
  - `POST /template` - Upload template (multipart/form-data ou JSON)
  - `GET /template/{templateId}` - Download template file
  - `DELETE /template/{templateId}` - Delete template
- **Document Rendering**:
  - `POST /render/{renderId}` - Generate document from template + JSON data
  - `GET /render/{renderId}` - Retrieve generated document (file stream)
- **Paramètres supportés**:
  - Header `carbone-version`: 4 ou 5 (défaut: 4)
  - Body `data`: JSON dataset requis pour le rendu
  - Body `convertTo`: Format de conversion (pdf, docx, xlsx, ods, csv, txt, odp, ppt, pptx, jpg, png, odt, doc, html, xml, idml, epub)
  - Form `payload`: Optionnel pour générer un template ID différent
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
