# BTFG Module

Babele Translation Files Generator

![Foundry v11](https://img.shields.io/badge/foundry-v11-green)

_(English version below)_

---

Ce module permet de générer le fichier de traduction JSON d’un compendium afin de faciliter la mise en place de
traductions pour des systèmes et/ou modules.

Il est possible de traiter n’importe quel type de compendium et de personnaliser le fichier exporté grâce à la
définition de mapping pour Babele (pour les compendiums `Actor`, `Item` et `Adventure`).

## Installation

Le système est installable directement depuis Foundry en recherchant son nom : `Babele Translation Files Generator`.
Vous aurez alors la dernière version et profiterez des mises à jour automatiques.

Sinon, il est possible l’ajouter en utilisant le lien de son manifest :
`https://github.com/DjLeChuck/foundryvtt-babele-translation-files-generator/releases/latest/download/module.json`

## Utilisation

Ouvrez un compendium et cliquer sur l’icône de téléchargement en en-tête de fenêtre. Une dialogue de configuration
apparaîtra alors et permettra de lancer l’export du fichier de traduction.

Il est également possible de lancer une fenêtre de sélection du compendium par glisser-déposer en exécutant une macro
contenant le script suivant : `game.babeleFilesGenerator.api.compendiumExporter.selectPack();`

## Comment contribuer ?

### Rapport de bug

Merci d’ouvrir un ticket : https://github.com/DjLeChuck/foundryvtt-babele-translation-files-generator/issues

Vous pouvez aussi proposer un fix via une pull
request : https://github.com/DjLeChuck/foundryvtt-babele-translation-files-generator/pulls

---

_(English version)_

This module allows you to generate the JSON translation file of a compendium in order to facilitate the implementation
of translations for systems and/or modules.

It is possible to process any type of compendium and personalize the exported file using the mapping definition for
Babele (for `Actor`, `Item` and `Adventure` compendiums).

## Installation

The system can be installed directly from Foundry by searching for its name: `Babele Translation Files Generator`.
You'll then have the latest version and benefit from automatic updates.

Alternatively, you can add it using its manifest link:
`https://github.com/DjLeChuck/foundryvtt-babele-translation-files-generator/releases/latest/download/module.json`

## Usage

Open a compendium and click on the download icon in the window header. A configuration dialog will then appear, allowing
you to start the export of the translation file.

It is also possible to launch a selection window of the compendium by drag-and-drop by running a macro containing the
following script: `game.babeleFilesGenerator.api.compendiumExporter.selectPack();`

## How to contribute?

### Bug report

Please open a ticket: https://github.com/DjLeChuck/foundryvtt-babele-translation-files-generator/issues

You can also propose a fix via a pull
request: https://github.com/DjLeChuck/foundryvtt-babele-translation-files-generator/pulls
