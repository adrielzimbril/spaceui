# 📐 Guide de Structure Universelle des Pages MDX (Documentation Space UI)

> **Directive stricte pour les développeurs et agents IA :**  
> Tous les fichiers MDX de documentation (`apps/www/src/content/**/*.mdx`) doivent impérativement respecter l'ordre séquentiel et les conventions définis dans ce document. Aucun élément ne doit déroger à cette architecture.

---

## 🎯 Règle d'Or : L'Ordre Séquentiel Universel

Chaque page MDX pioche **exclusivement** dans les 13 blocs ci-dessous, en respectant **strictement leur ordre séquentiel** de haut en bas.

Si une section n'est pas pertinente pour un composant donné, **on l'omet simplement sans jamais inverser l'ordre des sections restantes**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 0. Frontmatter (YAML Metadata)                         [Obligatoire partout]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Hero Preview (<ComponentPreview /> principal)       [Obligatoire UI/Hook]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. ## Installation (<ComponentInstallation />)          [Standard]           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. ## Usage (Imports séparés + JSX/TS minimal)         [Standard]           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. ## Anatomy (Arbre JSX des sous-composants)          [Optionnel]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. ## [Concepts clés / Polymorphisme (asChild, render)][Optionnel]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. ## [Intégrations (Zod, React Compiler, DnD...)]     [Optionnel]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. ## Features / Variantes (<ComponentPreview />)      [Optionnel]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 8. ## Accessibility (Règles clavier, ARIA, Motion)     [Optionnel]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 9. ## API Reference (Tableaux Markdown stricts)        [Standard]           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 10. ## Examples (<ShowcaseGrid /> complet)             [Standard]           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 11. ## Troubleshooting / Notes                         [Optionnel]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 12. ## Credits & References (Inspirations & liens)     [Optionnel]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 13. ## Changelog (Historique & Breaking changes)       [Optionnel]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Matrice d'Obligation par Catégorie

| Section                       |      Primitives UI       |     Space Components     |    Backgrounds    |      Hooks      |     Blocks     | Guides (`docs/`) |
| :---------------------------- | :----------------------: | :----------------------: | :---------------: | :-------------: | :------------: | :--------------: |
| **0. Frontmatter**            |      ✅ Obligatoire      |      ✅ Obligatoire      |  ✅ Obligatoire   | ✅ Obligatoire  | ✅ Obligatoire |  ✅ Obligatoire  |
| **1. Hero Preview**           |      ✅ Obligatoire      |      ✅ Obligatoire      |  ✅ Obligatoire   | ✅ Obligatoire  | ✅ Obligatoire |      ❌ Non      |
| **2. Installation**           |      ✅ Obligatoire      |      ✅ Obligatoire      |  ✅ Obligatoire   | ✅ Obligatoire  | ✅ Obligatoire |   ➖ Variable    |
| **3. Usage**                  |      ✅ Obligatoire      |      ✅ Obligatoire      |  ✅ Obligatoire   | ✅ Obligatoire  | ✅ Obligatoire |   ➖ Variable    |
| **4. Anatomy**                |   ⚡ Si multi-parties    |   ⚡ Si multi-parties    |      ❌ Non       |     ❌ Non      |     ❌ Non     |      ❌ Non      |
| **5. Core Concepts**          | ⚡ Si `render`/`asChild` | ⚡ Si `render`/`asChild` |      ❌ Non       |     ❌ Non      |     ❌ Non     |   ➖ Variable    |
| **6. Integrations**           |   ⚡ Si Form/Zod/etc.    |  ⚡ Si DnD/Virtual/etc.  |      ❌ Non       |     ❌ Non      |     ❌ Non     |   ➖ Variable    |
| **7. Features**               |   ⚡ Si démos majeures   |   ⚡ Si démos majeures   | ⚡ Si multi-modes | ⚡ Si scénarios |     ❌ Non     |   ➖ Variable    |
| **8. Accessibility**          | ⚡ Si widget interactif  | ⚡ Si widget interactif  |      ❌ Non       |     ❌ Non      |     ❌ Non     |   ➖ Variable    |
| **9. API Reference**          |      ✅ Obligatoire      |      ✅ Obligatoire      |  ✅ Obligatoire   | ✅ Obligatoire  |     ❌ Non     |      ❌ Non      |
| **10. Examples**              |      ✅ Obligatoire      |      ✅ Obligatoire      |   ⚡ Optionnel    |  ⚡ Optionnel   |     ❌ Non     |      ❌ Non      |
| **11. Notes/Troubleshooting** |       ⚡ Optionnel       |       ⚡ Optionnel       |   ⚡ Optionnel    |  ⚡ Optionnel   |  ⚡ Optionnel  |   ⚡ Optionnel   |
| **12. Credits**               |       ⚡ Optionnel       |       ⚡ Optionnel       |   ⚡ Optionnel    |  ⚡ Optionnel   |  ⚡ Optionnel  |   ⚡ Optionnel   |
| **13. Changelog**             |       ⚡ Optionnel       |       ⚡ Optionnel       |   ⚡ Optionnel    |  ⚡ Optionnel   |  ⚡ Optionnel  |   ⚡ Optionnel   |

---

## 🛠️ Spécification Détaillée de Chaque Section

### 0. Frontmatter

```yaml
---
title: [Nom en Title Case]
description: [Description concise et claire d'1 à 2 phrases]
links: # Optionnel
  doc: https://base-ui.com/...
  api: https://base-ui.com/...
author: # To delete
  name: usespaceui
  url: https://github.com/usespaceui
---
```

### 1. Hero Preview

Placé **immédiatement après le frontmatter**.

```mdx
<ComponentPreview name="demo-primitives-p-[name]-1" />
```

### 2. Installation

Toujours utiliser le composant unifié `<ComponentInstallation />`. **Ne plus utiliser `<SpaceCodeTabs>` manuellement pour les sections d'installation.**

```mdx
## Installation

<ComponentInstallation name="primitives-[name]" />
```

*Ce Server Component async génère automatiquement :*
- *L'onglet **CLI** : `npx shadcn add @spaceui/[name]`*
- *L'onglet **Manual** : dépendances npm, dépendances registre, code source complet (`<ComponentSource />`), et étapes d'import.*

> **⚠️ Pour les compositions (ex: DatePicker = Calendar + Popover + Button)**, enchaîner plusieurs `<ComponentInstallation />` :
> ```mdx
> <ComponentInstallation name="primitives-calendar" />
> <ComponentInstallation name="primitives-popover" />
> <ComponentInstallation name="primitives-button" />
> ```

### 3. Usage

Toujours structuré en **un seul bloc de code unifié** contenant les imports, une ligne vide, puis l'exemple JSX/TS minimal :

````mdx
## Usage

```tsx
import { Dialog, DialogTrigger, DialogPopup } from '@/registry/primitives/dialog'

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogPopup>Content</DialogPopup>
</Dialog>
```
````

### 4. Anatomy *(Optionnel)*
Présente l'arbre structurel complet sans logique superflue.
```mdx
## Anatomy

```tsx
<Dialog>
  <DialogTrigger />
  <DialogPortal>
    <DialogBackdrop />
    <DialogPopup>
      <DialogHeader>
        <DialogTitle />
        <DialogDescription />
      </DialogHeader>
      <DialogClose />
    </DialogPopup>
  </DialogPortal>
</Dialog>
````

````

### 5. Concepts Clés / Polymorphisme *(Optionnel)*
Exemples de titres autorisés :
- `## Parent Trigger (asChild)`
- `## Polymorphic Rendering (render)`
- `## Controlled and Uncontrolled`

### 6. Intégrations *(Optionnel)*
Exemples de titres autorisés :
- `## Using with Zod`
- `## Field Integration`
- `## React Compiler`
- `## Persisting Order`

### 7. Features & Variantes Détaillées *(Optionnel)*
Chaque variante avec son sous-titre H3, une brève description et son propre `<ComponentPreview />`.
```mdx
## Features

### Destructive Variant

Use the `destructive` variant for dangerous or irreversible actions.

<ComponentPreview name="demo-primitives-p-button-2" />
````

### 8. Accessibility _(Optionnel)_

Règles ARIA, gestion du focus, `prefers-reduced-motion` ou support clavier.

```mdx
## Accessibility

- Follows the [WAI-ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
- Focus is automatically trapped within the popup when open.
- Pressing `Escape` closes the open dialog.
```

### 9. API Reference

> ⚠️ **Règle Cruciale :** Ne JAMAIS insérer de `<ComponentPreview />` à l'intérieur de l'API Reference ! Cette section est réservée exclusivement aux tables de spécifications techniques.
> 
> 📌 **Hiérarchie TOC (Table des Matières) :** Chaque sous-composant, interface ou groupe de paramètres **DOIT** utiliser un titre de niveau 3 (`### `) pour être automatiquement indexé comme enfant sous *API Reference* dans le menu TOC latéral.

```mdx
## API Reference

### ComponentName Props

| Prop       | Type                     | Default     | Description                     |
| :--------- | :----------------------- | :---------- | :------------------------------ |
| `variant`  | `"default" \| "outline"` | `"default"` | Controls visual styling.        |
| `disabled` | `boolean`                | `false`     | Disables interaction when true. |

### SubComponentName Props

| Prop      | Type      | Default | Description                                |
| :-------- | :-------- | :------ | :----------------------------------------- |
| `asChild` | `boolean` | `false` | Merges props onto immediate child element. |
```

Pour les **Hooks** :

```mdx
## API Reference

### Parameters

| Parameter | Type     | Default    | Description            |
| :-------- | :------- | :--------- | :--------------------- |
| `value`   | `T`      | _required_ | The value to debounce. |
| `delay`   | `number` | `500`      | Delay in milliseconds. |

### Return Value

| Type | Description          |
| :--- | :------------------- |
| `T`  | The debounced value. |
```

### 10. Examples

Regroupe toutes les variantes interactives du composant dans une grille standard `<ShowcaseGrid>`.

📌 **Intégration Automatique dans le TOC (Table des Matières) :** 
Chaque `<ShowcaseCard>` est automatiquement détectée grâce à son attribut `data-slot="showcase-card"` et intégrée dynamiquement comme sous-élément (niveau 3) sous `## Examples` dans le TOC latéral de droite !

Il n'est donc **pas nécessaire** de créer manuellement des balises `### ` au-dessus de chaque carte dans le MDX : la description ou le titre de la `<ShowcaseCard>` sert directement de libellé dans le TOC avec ancrage automatique au scroll (`scroll-mt-24`).

```mdx
## Examples

<ShowcaseGrid>
  <ShowcaseCard name="demo-primitives-p-button-1" description="Default button" />
  <ShowcaseCard name="demo-primitives-p-button-2" description="Destructive variant" />
  <ShowcaseCard name="demo-primitives-p-button-3" description="Loading state with spinner" />
</ShowcaseGrid>
```

### 11. Troubleshooting / Notes _(Optionnel)_

```mdx
## Troubleshooting

<Callout type="warn">Ensure you wrap all related items in the root Provider to avoid context errors.</Callout>
```

### 13. Changelog _(Optionnel)_

Placé **tout en bas de la page MDX**, après `## Examples` ou `## Troubleshooting`/`## Credits`.  
Permet d'informer les utilisateurs des évolutions clés, migrations ou breaking changes majeurs survenus spécifiquement sur cette primitive / composant :

```mdx
## Changelog

- [2026-07-31](/docs/changelog#scroll-area) — `ScrollArea` adds optional `overscrollContain` to stop scroll chaining on nested surfaces.
- [2026-04-12](/docs/changelog#table) — `Table` adds optional `variant="card"` support for framed card layouts.
```

---

## 🤖 Directives pour l'Agent IA

Lors de la création, la modification ou le refactoring de pages MDX :

1. **Valider la séquence** : Vérifier que l'ordre des sections suit strictement la liste numérique 0 à 13.
2. **Hiérarchie TOC (H2 et H3)** :
   - `## ` (H2) pour les grands blocs principaux (`## Installation`, `## Usage`, `## API Reference`, `## Examples`, `## Changelog`...).
   - `### ` (H3) obligatoires pour chaque sous-composant sous `## API Reference` (ex: `### Button Props`, `### SubComponent Props`).
   - Pour `## Examples`, les `<ShowcaseCard>` sont **automatiquement scannées et injectées en sous-éléments dans le TOC** via `data-slot="showcase-card"` et `data-toc-title`.
3. **Pas de previews sous API Reference** : Déplacer toute prévisualisation (`<ComponentPreview />`) vers `## Features` ou `## Examples`.
4. **Format des tables** : Toujours utiliser la syntaxe Markdown standard avec backticks sur les noms de props et types courts.
5. **Cohérence des noms de démo** : Veiller à ce que les attributs `name="..."` dans `<ComponentPreview />` et `<ShowcaseCard />` correspondent exactement aux identifiants du registre (`demo-*`).
6. **Scope des Packages** : Toujours utiliser le scope officiel `@spaceui/` (ex: `@spaceui/button`, `@spaceui/accordion`). Ne jamais utiliser `@space/`.
7. **⛔ Ne JAMAIS utiliser `<SpaceCodeTabs>` pour les sections Installation** : La section `## Installation` utilise **uniquement** `<ComponentInstallation name="[name]" />`. Les composants `<SpaceCodeTabs>`, `<TabsList>`, `<TabsTab>`, `<TabsPanel>`, `<InstallCommandBlock>`, `<ComponentSource>` et `<Steps>` sont **interdits dans la section Installation** — ils sont gérés en interne par `ComponentInstallation`.
8. **✂️ Formatage du bloc `## Usage` (Zéro point-virgule Prettier)** : Toujours séparer l'import et le JSX en deux blocs de code distincts ````tsx ... ````. Ne jamais mettre un import et du JSX racine dans le même bloc pour éviter l'injection de point-virgule défensif Prettier (`;<Tag>`).
9. **📜 Section `## Changelog`** : Si le composant a fait l'objet d'une mise à jour majeure ou d'un breaking change notable, ajouter une section `## Changelog` en fin de document avec les dates et liens d'ancres vers la documentation globale.
10. **📑 Synchronisation obligatoire avec `meta.json`** : À chaque création ou ajout d'une nouvelle page MDX dans un dossier de documentation (`src/content/**`), inscrire immédiatement le slug de la page dans la liste `pages` du fichier `meta.json` du dossier correspondant afin d'assurer son intégration dans la navigation, le pager et le sitemap.





