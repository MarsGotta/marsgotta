---
description: Prepara la otra versión de una señal de Signals by Mars en el vault, para que Mars la revise
argument-hint: <número de señal>
---

Vamos a preparar la traducción de la **señal $ARGUMENTS** de Signals by Mars. Mars la escribió en un idioma; tú preparas la otra versión como borrador y ella la revisa (`design/signals/LEEME.md` §3.2).

1. Lee `CLAUDE.md` y, de `design/signals/LEEME.md`, §3.1 (el vault y el formato), §3.2 (traducir) y §9 (la voz). Antes de escribir en el vault, lee también su `AGENTS.md`: manda sobre cómo se escribe y se sincroniza allí.
2. Busca la señal en la carpeta de señales del vault (`$SIGNALS_VAULT_DIR`, por defecto `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/mars-vault`): el fichero `NNN-slug.es.md` o `NNN-slug.en.md` con ese número.
   - Si no hay ninguno, o si ya están los dos idiomas, para y pregúntame. Nunca pises una traducción que ya existe.
3. Escribe la otra versión **en el vault**, junto a la original, como `NNN-slug.<idioma>.md`:
   - **Propiedades:** el mismo `number`, `topic`, `cover`, `publishedAt` y `startHere`; el `lang` contrario; `slug`, `title`, `deck`, `coverCaption` y las etiquetas que sean palabras, traducidos (los nombres propios, como SQLite o MCP, se quedan); y `draft: true`, siempre.
   - **El texto:** no es una traducción literal. Mantén la voz de Mars: directa, cercana, en primera persona y con frases cortas. En español, «tú» peninsular y nada de voseo; en inglés, sencillo y en voz activa. Ninguna raya larga (—).
   - **Adapta lo que no viaja:** ejemplos, guiños y referencias se cambian por los que funcionan para quien lee en ese idioma. Si cambias algo de fondo, déjalo anotado para Mars en un comentario `%% … %%` (la importación los elimina).
   - **Lo que no se traduce:** el código, los comandos, los nombres de ficheros y los nombres propios. Los comentarios dentro del código, sí.
   - **Obsidian:** los callouts (`> [!TIP]`) se quedan con su sintaxis y traduces su texto. Las imágenes `![[…]]` son las mismas, con la descripción traducida. Un enlace `[[…]]` a otra señal apunta a su versión en este idioma si existe en el vault; si no, déjalo como está.
   - Para el español, usa las skills `marcela-prose` y `spanish-prose-craft`.
4. Valida con `npm run signals:import`: si la nota no cumple el esquema, el script dice por qué. Arréglalo antes de terminar.
5. Sincroniza el vault como pide su `AGENTS.md`: añade solo el fichero nuevo, nunca todo.
6. Termina con un resumen para Mars:
   - dónde está la nota;
   - qué has adaptado y por qué;
   - qué conviene que mire con calma.

   Recuérdale que la versión solo se publica cuando ella cambie `draft` a `false` e importe.
