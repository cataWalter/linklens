# LinkLens - Analizzatore di Link e Dipendenze tra File

LinkLens è un'applicazione desktop che mappa le relazioni tra file in un progetto e visualizza il grafo delle dipendenze in modo interattivo. Apri una cartella e vedi immediatamente come i file sono collegati.

## Il Problema

Nei progetti software, le dipendenze tra file diventano rapidamente complesse. È difficile capire a colpo d'occhio:
- Quali file dipendono da quali altri
- Se esistono dipendenze circolari
- Quali file sono "orfani" (non importati da nessuno)
- Quali file sono "hub" (importati da molti altri file)
- Come un cambiamento in un file può impattare il resto del progetto

Esistono tool per linguaggi specifici (es. `madge` per JavaScript, `pydeps` per Python), ma nessuno strumento generico con interfaccia grafica che supporti multipli linguaggi contemporaneamente.

## Cosa Fa LinkLens

1. **Scansiona** una cartella e analizza tutti i file supportati
2. **Estrae** le relazioni di import/include/require tra file
3. **Visualizza** il grafo delle dipendenze con Cytoscape.js in modo interattivo
4. **Identifica** dipendenze circolari, file orfani e hub di accoppiamento
5. **Permette** di filtrare per linguaggio, cartella, o profondità di dipendenza
6. **Esporta** il grafo in PNG, SVG, o JSON

## Funzionalità

- **Multi-linguaggio**: Supporta JavaScript, TypeScript, Python, Java, C, C++, Go, Rust, e altri
- **Grafo interattivo**: Zoom, pan, click per evidenziare percorsi
- **Analisi statica**: Identifica problemi strutturali nel codice
- **Metriche**: Calcola coupling, cohesion, e instabilità dei moduli
- **Filtri avanzati**: Per linguaggio, cartella, tipo di dipendenza
- **Esportazione**: PNG, SVG, JSON, GraphML
- **Tema chiaro/scuro**: Supporto completo per entrambi i temi
- **Hot reload**: Aggiornamento automatico quando i file cambiano

## Stack Tecnologico

### Backend (Tauri - Rust)
- **Tauri** - Framework per app desktop leggere e sicure
- **Rust** - Linguaggio per il parsing e l'analisi dei file
- **tree-sitter** - Parsing incrementale per estrarre dipendenze da multipli linguaggi
- **notify** - File system watcher per hot reload
- **serde** - Serializzazione/deserializzazione JSON

### Frontend (React + TypeScript)
- **React 18** - UI library con hooks e concurrent features
- **TypeScript** - Type safety per tutto il codice frontend
- **Cytoscape.js** - Grafo interattivo con layout personalizzabili
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - State management leggero
- **Vite** - Build tool veloce

### Testing & CI
- **Vitest** - Testing framework per il frontend
- **cargo test** - Testing per il backend Rust
- **GitHub Actions** - CI/CD per build multi-piattaforma
- **Playwright** - E2E testing

### Packaging
- **Tauri CLI** - Build per macOS, Windows, Linux
- **GitHub Releases** - Distribuzione binari precompilati

## Struttura del Progetto

```
linklens/
├── src-tauri/                    # Backend Tauri (Rust)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   ├── icons/
│   └── src/
│       ├── main.rs               # Entry point Tauri
│       ├── lib.rs                # Logica principale
│       ├── parser/
│       │   ├── mod.rs
│       │   ├── javascript.rs     # Parser JS/TS
│       │   ├── python.rs         # Parser Python
│       │   ├── java.rs           # Parser Java
│       │   ├── c.rs              # Parser C/C++
│       │   ├── go.rs             # Parser Go
│       │   ├── rust.rs           # Parser Rust
│       │   └── treesitter.rs     # Wrapper tree-sitter
│       ├── graph/
│       │   ├── mod.rs
│       │   ├── builder.rs        # Costruttore del grafo
│       │   ├── analysis.rs       # Analisi (cicli, hub, orfani)
│       │   └── metrics.rs        # Metriche di accoppiamento
│       ├── watcher.rs            # File system watcher
│       └── commands.rs           # Comandi Tauri esposti al frontend
├── src/                          # Frontend (React + TypeScript)
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── GraphView.tsx         # Vista grafo Cytoscape
│   │   ├── FileTree.tsx          # Albero file laterale
│   │   ├── MetricsPanel.tsx      # Pannello metriche
│   │   ├── FilterBar.tsx         # Barra filtri
│   │   ├── DependencyList.tsx    # Lista dipendenze
│   │   └── Toolbar.tsx           # Toolbar principale
│   ├── hooks/
│   │   ├── useGraph.ts
│   │   ├── useWatcher.ts
│   │   └── useFilters.ts
│   ├── store/
│   │   └── graphStore.ts         # Zustand store
│   ├── utils/
│   │   ├── layout.ts             # Configurazioni layout Cytoscape
│   │   ├── colors.ts             # Schema colori per linguaggi
│   │   └── export.ts             # Funzioni esportazione
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       └── index.ts
├── tests/
│   ├── e2e/
│   └── unit/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .github/
    └── workflows/
        └── ci.yml
```

## Quick Start

### Prerequisiti

- Node.js 18+
- Rust 1.70+ (installato tramite `rustup`)
- Build tools per la tua piattaforma:
  - macOS: Xcode Command Line Tools
  - Windows: Visual Studio Build Tools
  - Linux: `build-essential` e `libwebkit2gtk-4.1-dev`

### Installazione

```bash
# Clona il repository
git clone https://github.com/cataWalter/linklens.git
cd linklens

# Installa dipendenze frontend
npm install

# Installa dipendenze Rust
cd src-tauri && cargo build && cd ..

# Avvia in modalità sviluppo
npm run tauri dev
```

### Build per Produzione

```bash
# Build per la tua piattaforma
npm run tauri build

# I binari saranno in src-tauri/target/release/bundle/
```

## Utilizzo

1. **Apri una cartella**: Click su "Open Folder" o trascina una cartella nella finestra
2. **Esplora il grafo**: Zoom con scroll, pan con click+trascinamento, click su un nodo per evidenziare le connessioni
3. **Filtra**: Usa la barra filtri per linguaggio, cartella, o tipo di dipendenza
4. **Analizza**: Apri il pannello metriche per vedere coupling, cohesion, e problemi strutturali
5. **Esporta**: Click su "Export" per salvare il grafo come PNG, SVG, o JSON

## Linguaggi Supportati

| Linguaggio | Estensioni | Parser |
|------------|------------|--------|
| JavaScript | `.js`, `.mjs`, `.cjs` | tree-sitter-javascript |
| TypeScript | `.ts`, `.tsx` | tree-sitter-typescript |
| Python | `.py` | tree-sitter-python |
| Java | `.java` | tree-sitter-java |
| C | `.c`, `.h` | tree-sitter-c |
| C++ | `.cpp`, `.cc`, `.hpp` | tree-sitter-cpp |
| Go | `.go` | tree-sitter-go |
| Rust | `.rs` | tree-sitter-rust |
| PHP | `.php` | tree-sitter-php |
| Ruby | `.rb` | tree-sitter-ruby |

## Metriche Calcolate

| Metrica | Descrizione |
|---------|-------------|
| **Afferent Coupling (Ca)** | Numero di file che dipendono da questo file |
| **Efferent Coupling (Ce)** | Numero di file da cui questo file dipende |
| **Instability (I)** | Ce / (Ca + Ce) - quanto è probabile che il file cambi |
| **Abstractness (A)** | Ratio di file astratti/interfacce |
| **Distance from Main Sequence (D)** | |A + I - 1| - quanto il modulo è bilanciato |
| **Cycle Detection** | Identifica catene di dipendenze circolari |
| **Orphan Files** | File non importati da nessun altro |
| **Hub Files** | File importati da molti altri (potenziale punto di fragilità) |

## Comandi Tauri

Il backend espone questi comandi al frontend:

| Comando | Descrizione |
|---------|-------------|
| `open_folder(path)` | Scansiona una cartella e restituisce il grafo |
| `get_file_deps(file_path)` | Restituisce le dipendenze di un file specifico |
| `get_reverse_deps(file_path)` | Restituisce chi dipende a un file specifico |
| `detect_cycles()` | Identifica tutte le dipendenze circolari |
| `calculate_metrics()` | Calcola le metriche per tutti i file |
| `export_graph(format)` | Esporta il grafo nel formato specificato |
| `start_watcher(path)` | Avvia il watcher per hot reload |
| `stop_watcher()` | Ferma il watcher |

## Sviluppo

### Aggiungere un Nuovo Linguaggio

1. Aggiungi il parser tree-sitter in `Cargo.toml`:
```toml
tree-sitter-ruby = "0.20"
```

2. Crea il parser in `src-tauri/src/parser/ruby.rs`:
```rust
use tree_sitter::Parser;

pub fn parse_ruby(content: &str) -> Vec<Dependency> {
    // Implementa l'estrazione delle dipendenze
}
```

3. Registra il parser in `mod.rs` e aggiungi le estensioni in `lib.rs`

### Testing

```bash
# Test frontend
npm run test

# Test backend
cd src-tauri && cargo test

# E2E testing
npm run test:e2e
```

### Linting

```bash
# Frontend
npm run lint

# Backend
cd src-tauri && cargo clippy
```

## Roadmap

- [ ] Supporto per Svelte, Vue, Angular
- [ ] Integrazione con Git per vedere come le dipendenze cambiano nel tempo
- [ ] Confronto tra due versioni del grafo
- [ ] Plugin system per parser custom
- [ ] Modalità "what-if" per simulare cambiamenti
- [ ] Integrazione con LSP per analisi più precisa
- [ ] Supporto per monorepo con multipli workspace

## License

MIT License - vedi file LICENSE per dettagli.

## Contributing

Le contribuzioni sono benvenute! Leggi le linee guida per contribuire e apri una issue per feature request o bug.
