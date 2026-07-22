# Python Corpus Expansion — From 458 to ~800 Entries

Working roadmap. Each new entry follows the existing three-tier schema (intro/junior/senior with Decision Rule + Anti-Pattern in the senior tier).

## Inventory by sheet

13 new sheets + extensions to existing sheets. Total target: **~340 new entries**.

### Tier 1 — universal-but-opinionated (highest RAG lift)

These are topics every working Python developer hits, where the model has reasonable baseline knowledge but lacks the *opinionated picks* that make code production-grade.

#### `database.js` — ~25 entries  ⭐ start here

| Section | Entries |
|---|---|
| `sqlalchemy-orm` | engine · session · declarative-models · select-2.0 · relationships · loading-strategies · transactions · scoped-session |
| `sqlalchemy-core` | metadata-table · raw-sql-execute · core-vs-orm-decision · connection-pool |
| `drivers` | psycopg3 · asyncpg · sqlite3-stdlib · aiosqlite |
| `migrations` | alembic-init · alembic-revision · data-migrations · branching |
| `patterns` | repository-pattern · unit-of-work · n-plus-one · isolation-levels |

#### `debugging-profiling.js` — ~18 entries

| Section | Entries |
|---|---|
| `debugging` | pdb-basics · breakpoint-builtin · debugpy-vscode · ipdb · post-mortem · faulthandler |
| `cpu-profiling` | cProfile · line-profiler · py-spy · scalene · profile-decorator · time-perf-counter |
| `memory-profiling` | tracemalloc · memray · memory-profiler · gc-module |
| `tracing` | sys-settrace · structured-traces |

#### `crypto-secrets.js` — ~15 entries

| Section | Entries |
|---|---|
| `primitives` | secrets-module · hashlib-security · os-urandom · hmac-compare-digest · constant-time |
| `symmetric` | fernet · aes-gcm · key-rotation |
| `asymmetric` | rsa-sign-verify · ed25519 · x509-basics |
| `passwords` | argon2-cffi · password-rotation |
| `tokens` | pyjwt-validate · jose-rfc · oauth-flows |

#### `caching.js` — ~10 entries

| Section | Entries |
|---|---|
| `in-process` | functools-cache-deep · cachetools · diskcache |
| `redis` | redis-py · redis-async · connection-pool · distributed-locks |
| `patterns` | cache-aside · stampede · invalidation · key-naming |

#### `observability.js` — ~12 entries

| Section | Entries |
|---|---|
| `structured-logging` | structlog-deep · json-sinks · correlation-ids |
| `metrics` | prometheus-counters · histograms · metrics-endpoint |
| `tracing` | otel-sdk · spans · propagation · otlp-exporter |
| `errors` | sentry-sdk · breadcrumbs · before-send · release-tagging |

#### `containerization.js` — ~10 entries (Python-specific only)

| Section | Entries |
|---|---|
| `dockerfile` | uv-based-image · pythonunbuffered · layer-caching · non-root-user · distroless |
| `runtime` | entrypoint-pid1 · signal-handling · graceful-shutdown |
| `compose` | dev-stack · healthchecks |

**Tier 1 total: ~90 entries across 6 sheets**

---

### Tier 2 — specialized common (high-value extensions)

#### `data-apps.js` — ~12 entries

| Section | Entries |
|---|---|
| `streamlit` | core-widgets · session-state · caching · multipage · st-dataframe |
| `gradio` | interface · blocks · chatinterface · queueing |
| `dash` | callbacks · dcc-store · plotly-integration |

#### `messaging-queues.js` — ~10 entries

| Section | Entries |
|---|---|
| `celery` | tasks · workers · beat-scheduling · result-backends · retries |
| `alternatives` | rq-simple · dramatiq · arq-async · apscheduler |
| `patterns` | idempotent-tasks · dead-letter |

#### `nlp-classical.js` — ~10 entries

| Section | Entries |
|---|---|
| `spacy` | pipelines · ner · pos-parsing · custom-components · spacy-llm |
| `nltk` | tokenizers · stemmers · classical-tasks |
| `preprocessing` | text-cleaning · normalization |

#### `image-processing.js` — ~8 entries

| Section | Entries |
|---|---|
| `pillow` | load-save · resize-crop · format-conversion · exif |
| `opencv-intro` | cv2-vs-pil · color-spaces · transforms |
| `ml-prep` | image-prep-for-ml |

#### `notebooks.js` — ~7 entries

| Section | Entries |
|---|---|
| `jupyter` | kernel-selection · magics · cell-types |
| `parameterized` | papermill · nbconvert |
| `reproducibility` | jupytext · seed-discipline |

#### `documentation.js` — ~8 entries

| Section | Entries |
|---|---|
| `docstrings` | google-style · numpy-style · doctests |
| `mkdocs` | mkdocs-material · mkdocstrings · deploy |
| `sphinx` | sphinx-autodoc · napoleon · rst-basics |

**Tier 2 total: ~55 entries across 6 sheets**

---

### Tier 3 — niche libraries (highest RAG lift per entry)

These are the topics where the model is genuinely weak — sparse training data means RAG transforms the answer quality.

#### `cv-opencv.js` — ~22 entries

| Section | Entries |
|---|---|
| `basics` | cv2-imread-imwrite · color-spaces · pixel-access · roi-slicing |
| `transforms` | resize-crop · rotation-affine · perspective · warpaffine |
| `filters` | blur · sharpen · edges-canny · morphology |
| `detection` | cascade-classifiers · template-matching · feature-detection |
| `video` | videocapture · videowriter · frame-iteration · webcam |
| `dl-integration` | dnn-module · onnx-loading |

#### `gui-tkinter.js` — ~15 entries

| Section | Entries |
|---|---|
| `basics` | root-mainloop · widgets · grid-vs-pack · ttk-themed |
| `events` | bindings · callbacks · variables-tk |
| `layout` | grid · pack · place · resize-behavior |
| `advanced` | menus · canvas · threading-rules |

#### `gui-pyqt.js` — ~18 entries

| Section | Entries |
|---|---|
| `basics` | qapplication · qwidget · pyqt6-vs-pyside6 |
| `signals-slots` | signal-slot · custom-signals · qt-thread |
| `widgets` | qpushbutton · qlineedit · qlistview · qtableview |
| `layouts` | qboxlayout · qgridlayout · qstackedwidget |
| `models` | qabstractlistmodel · qabstracttablemodel |
| `advanced` | qss-styling · qthread-worker · drag-drop |

#### `audio-dsp.js` — ~12 entries

| Section | Entries |
|---|---|
| `librosa` | load-resample · stft · mfcc · pitch-detection |
| `sounddevice` | playback · recording · stream-callback |
| `scipy-signal` | filters · convolution · windows |
| `formats` | wave-stdlib · soundfile · pydub |

#### `geospatial.js` — ~15 entries

| Section | Entries |
|---|---|
| `geopandas` | gdf-from-shapefile · crs-projections · spatial-joins · plotting |
| `shapely` | geometry-types · spatial-predicates · operations |
| `rasterio` | open-read · masks · reprojection |
| `folium` | basic-map · markers · choropleth |
| `osmnx` | street-networks |

#### `quantum.js` — ~12 entries

| Section | Entries |
|---|---|
| `qiskit` | quantum-circuit · gates · measurement · simulators · transpile |
| `cirq` | google-quantum · qubits · noise-models |
| `concepts` | bloch-sphere · entanglement · vqe |

#### `web3-blockchain.js` — ~12 entries

| Section | Entries |
|---|---|
| `web3-py` | provider · contract · transactions · events |
| `solana` | solana-py · keypair · rpc |
| `patterns` | gas-estimation · nonce-management · signing |

#### `bioinformatics.js` — ~15 entries

| Section | Entries |
|---|---|
| `biopython` | seqrecord · sequence-io · blast · alignment |
| `pysam` | bam-reading · variant-calling · pileup |
| `scanpy` | annData · preprocessing · clustering |
| `pyteomics` | mass-spec |

#### `astropy-scientific.js` — ~12 entries

| Section | Entries |
|---|---|
| `astropy` | units-quantity · time · coordinates · fits-files |
| `sunpy` | maps · timeseries |
| `scientific-libs` | sympy-symbolic · networkx-graphs |

#### `gamedev-pygame.js` — ~10 entries

| Section | Entries |
|---|---|
| `basics` | event-loop · surface-blit · rect · keypress |
| `assets` | image-loading · sound-loading · spritesheets |
| `physics` | collision-rect · pymunk-intro |
| `patterns` | game-loop · scene-management |

#### `embedded-micropython.js` — ~12 entries

| Section | Entries |
|---|---|
| `core-diff` | micropython-vs-cpython · memory-constraints · gc-tuning |
| `hardware` | gpio · adc · pwm · i2c · spi |
| `platforms` | esp32 · raspberry-pi-pico · circuitpython |
| `tooling` | mpremote · ampy · webrepl |

#### `mqtt-iot.js` — ~10 entries

| Section | Entries |
|---|---|
| `paho-mqtt` | publish · subscribe · qos-levels · last-will |
| `asyncio-mqtt` | async-client · context-manager |
| `patterns` | retained-messages · topic-design · auth-tls |

#### `network-protocols.js` — ~12 entries

| Section | Entries |
|---|---|
| `sockets` | tcp-server · udp · ipv4-vs-ipv6 |
| `low-level` | scapy-packet · scapy-sniff |
| `protocols` | http-2 · websockets-server · grpc-python |
| `tools` | netaddr · ipaddress-deep |

**Tier 3 total: ~190 entries across 13 sheets**

---

### Tier 0 — densify existing senior tiers (highest hour-for-hour lift)

This isn't a new sheet; it's adding more `Decision Rule` and `Anti-Pattern` blocks to existing entries that are thin on opinions.

| Existing sheet | Entries to densify | New decision/anti-pattern cards |
|---|---|---|
| `pandas.js` | ~30 (apply, groupby, merge, etc.) | ~60 |
| `numpy.js` | ~15 | ~30 |
| `ml.js` | ~25 | ~50 |
| `web.js` | ~20 | ~40 |
| `apis.js` | ~15 | ~30 |
| `oop.js` | ~15 | ~30 |
| `core.js` | ~30 | ~60 |
| Other sheets | ~30 | ~60 |

**Tier 0 total: ~360 new opinion cards (no new entries)**

The **vault counts** improve dramatically because each card becomes its own retrievable chunk in the RAG.

---

## Authoring strategy & cadence

**Order of operations:**

1. **`database.js`** — biggest single gap. Start here. ~25 entries, ~2 weeks.
2. **`debugging-profiling.js`** — universal need. ~18 entries, ~1.5 weeks.
3. **`crypto-secrets.js`** — small but high-impact. ~15 entries, ~1 week.
4. **`caching.js`** + **`observability.js`** — paired modern infra. ~22 entries combined, ~1.5 weeks.
5. **Tier 0 densification** in parallel — squeeze in 5-10 new opinion cards per existing entry as time permits.
6. Tier 2 sheets in priority order based on the user's actual focus (data-apps if data-sci leaning, messaging if backend leaning).
7. Tier 3 niche sheets last — these are the highest *RAG lift per entry* but require the most domain expertise per author hour.

**Per-entry quality bar (matches existing senior tier standard):**

```
intro tier:    ~15-30 lines    plain-API usage, runs as written
junior tier:   ~25-40 lines    typical real-world usage with options/idioms
senior tier:   ~40-70 lines    production patterns + Decision Rule + Anti-Pattern
tips:          3-6 bullets
mistake:       1-3 sentences
```

**Verification per file:**

```
node /sessions/keen-sweet-galileo/mnt/outputs/check_file.mjs <file>
# expects: "OK", N entries / N tiered, all banners correct
```

**After each batch:**

```
node scripts/build-python-vault.mjs
# regenerates Obsidian vault including the new sheet
```

---

## Per-batch tracking

Each new sheet gets a TaskCreate entry of the form `<sheet> A: section1 + section2 (N entries)` mirroring the existing pattern (e.g., `pandas A: io section — 9 entries`).

When all batches for a sheet are done, the sheet adds itself to `data/catalog.js` under the python domain.

---

## Stretch — auto-generate the manifest

Once the corpus exists, the per-model probe script (`build-model-vault.mjs` from the earlier discussion) reads this expansion plan to know which entries it can probe. Any new entry written following the schema gets automatic coverage in the per-model lens with no plumbing changes.

---

*Generated: 2026-04-30. This is a working document — edit as priorities shift.*
