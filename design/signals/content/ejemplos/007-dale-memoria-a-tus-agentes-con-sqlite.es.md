---
number: 7
lang: es
slug: dale-memoria-a-tus-agentes-con-sqlite
title: "Dale memoria a tus agentes con un solo fichero SQLite"
deck: "Búsqueda de texto completo con FTS5, sin GPU ni servicios externos. El patrón que uso en Jezero, paso a paso."
topic: tutorial
cover: strata
coverCaption: "Portada generada a partir de la señal 007: los estratos del cráter Jezero."
publishedAt: 2026-10-21
tags: ["SQLite", "Agentes", "MCP", "Python"]
draft: true
---

Tus agentes olvidan. Cada sesión empieza de cero: lo que decidimos ayer, el comando que por fin funcionó, el error exacto que ya resolvimos la semana pasada. Y tú acabas repitiendo contexto, como quien explica lo mismo a un compañero nuevo cada mañana.

La tentación es montar una base de datos vectorial, un servicio de embeddings y una GPU. Para la memoria de trabajo de un equipo, casi nunca hace falta. Empieza por algo más pequeño: **un único fichero SQLite con búsqueda de texto completo**.

## Por qué texto completo y no embeddings

Lo que más se busca en la memoria de un agente son cosas exactas: un mensaje de error, el nombre de un fichero, un flag, una decisión con sus palabras. Ahí la búsqueda léxica gana. Encuentra la coincidencia literal en milisegundos y puedes explicar por qué la ha encontrado.

`FTS5` es la extensión de búsqueda de texto completo que viene con SQLite. Ordena por relevancia con `bm25`, resalta los fragmentos que coinciden y no necesita ningún servidor.

> [!TIP]
> Empieza con FTS5. Añade embeddings solo cuando tengas consultas reales que fallen por sinónimos, no antes.

## Una tabla virtual, cuatro columnas

La memoria vive en una tabla virtual. Solo se indexa lo que se busca; el origen y la fecha van en columnas sin indexar.

```sql title="schema.sql"
CREATE VIRTUAL TABLE atoms USING fts5(
  kind,               -- decision, error, fix, command
  body,
  source UNINDEXED,   -- qué agente lo escribió
  created_at UNINDEXED,
  tokenize = 'unicode61 remove_diacritics 2'
);
```

El tokenizador `unicode61` con `remove_diacritics 2` hace que «decisión» y «decision» encuentren lo mismo. En español, eso importa.

## Guarda átomos, no sesiones enteras

Una sesión completa es ruido: cientos de líneas para una sola decisión útil. Antes de guardar, resume cada sesión en **átomos**: una decisión, su porqué, un error exacto, el arreglo, el comando que funcionó. Un átomo, una fila.

```python title="save.py"
import sqlite3

db = sqlite3.connect("memory.db")
db.execute(
    "INSERT INTO atoms (kind, body, source, created_at) VALUES (?, ?, ?, ?)",
    ("decision", "Usamos SQLite FTS5: milisegundos y sin GPU.", "claude-code", "2026-10-02"),
)
db.commit()
```

> Una memoria que tú no puedes leer tampoco es una memoria en la que puedas confiar.

## Buscar con ranking

Para recuperar algo, `MATCH` filtra, `bm25()` ordena (cuanto más bajo, más relevante) y `snippet()` devuelve el trozo exacto que coincide, listo para meterlo en el contexto del agente.

```sql title="search.sql"
SELECT kind,
       snippet(atoms, 1, '[', ']', '…', 12) AS hit,
       source
FROM atoms
WHERE atoms MATCH 'sqlite OR fts5'
ORDER BY bm25(atoms)
LIMIT 5;
```

Con unos miles de átomos, esta consulta tarda milisegundos en un portátil. Y el fichero entero se copia, se versiona y se borra como cualquier otro.

## Que lean todos, que no escriba ninguno

El último paso es darles acceso. Yo lo expongo como un servidor MCP de **solo lectura**: cualquier agente puede preguntar qué se decidió o qué falló, pero ninguno puede reescribir la memoria. Escribe un proceso aparte, que además redacta los secretos antes de guardar nada.

- Un fichero, sin servicios: lo entiendes, lo copias y lo borras.
- Átomos pequeños: el agente recibe un contexto corto y preciso.
- Lectura para todos y escritura para uno: la memoria no se corrompe sola.

Este es el patrón que hay detrás de [Jezero](https://github.com/MarsGotta/jezero), la memoria compartida de mis agentes, que ya es open source.
