# Explorador Rick and Morty — proyecto-web-ia

Aplicación web que consulta en tiempo real la [Rick and Morty API](https://rickandmortyapi.com/documentation) para explorar personajes de la serie: buscarlos, filtrarlos, ordenarlos y guardar favoritos.

- **Repositorio:** https://github.com/almeida-crypto/proyecto-web-ia
- **Aplicación publicada (GitHub Pages):** https://almeida-crypto.github.io/proyecto-web-ia/

## Integrante

| Nombre | Usuario de GitHub | Aportes |
|---|---|---|
| _(escribe tu nombre)_ | [almeida-crypto](https://github.com/almeida-crypto) | Todo el proyecto: HTML, CSS, JavaScript, documentación, Issues y Pull Request |

## Descripción

La página usa **HTML** para la estructura, **CSS** para el diseño y **JavaScript** para la lógica. Con `fetch()` pide los personajes a la API y crea una tarjeta por cada uno con su imagen y descripción (estado, especie, género, origen, ubicación y número de episodios). Cada página de la API trae 20 personajes.

### Funcionalidades

1. **Consulta a la API con `fetch()`** — los datos no están escritos a mano; se descargan de `https://rickandmortyapi.com/api/character`.
2. **Tarjetas con imagen y descripción** — 20 personajes por página, con paginación.
3. **Buscador** — busca por nombre mientras escribes (espera 400 ms para no saturar la API) o al pulsar *Buscar*.
4. **Filtros** — por estado (vivo/muerto/desconocido), género y especie. Se envían a la API como parámetros de la URL.
5. **Ordenar** — A → Z o Z → A por nombre.
6. **Favoritos** — botón ☆ en cada tarjeta y una pestaña *Favoritos* para verlos.
7. **localStorage** — los favoritos se guardan en el navegador y siguen ahí al recargar la página.
8. **Mensajes** — avisa cuando está cargando, cuando no hay resultados y cuando falla la conexión con la API.
9. **Diseño adaptable** — cuadrícula que se ajusta a celulares, tablets y computadoras (CSS Grid + media queries).
10. **Extra (reto): modo oscuro / claro** — ver sección más abajo.

## Instrucciones de uso

1. Abre el enlace de GitHub Pages.
2. Escribe un nombre en el buscador (por ejemplo `Rick`, `Morty`, `Summer`).
3. Usa los menús para filtrar por estado, género o especie, u ordenar alfabéticamente.
4. Pulsa *Limpiar* para quitar la búsqueda y los filtros.
5. Pulsa la estrella ☆ para guardar un personaje en favoritos; ábrelos en la pestaña **Favoritos**.
6. Usa *Anterior* / *Siguiente* para recorrer las páginas.
7. Pulsa el botón 🌙 / ☀️ para cambiar entre modo oscuro y claro.

## Estructura del proyecto

```
proyecto-web-ia/
├── index.html   → estructura de la página y plantilla de tarjeta
├── style.css    → colores, diseño de tarjetas, modo oscuro y media queries
├── script.js    → fetch a la API, buscador, filtros, favoritos y tema
└── README.md    → esta documentación
```

## Uso de inteligencia artificial

> El profesor puede preguntar por cualquiera de estos puntos.

### Tres prompts importantes

1. *"Crea una página con HTML, CSS y JavaScript que use fetch() para consultar la Rick and Morty API y muestre los personajes en tarjetas con imagen, estado, especie, origen y ubicación."*
2. *"Agrega un buscador por nombre y filtros por estado, género y especie usando los parámetros de la API. Muestra un mensaje si no hay resultados o si la API falla."*
3. *"Agrega una sección de favoritos que se guarde con localStorage, y un botón para cambiar entre modo oscuro y claro que recuerde la elección del usuario."*

### Una respuesta de la IA que requirió correcciones

La primera versión del buscador trataba **cualquier** respuesta que no fuera `ok` como un error de conexión. Pero la Rick and Morty API responde con código **404** cuando una búsqueda no tiene resultados (por ejemplo, buscar `zzzz`). Resultado: la página decía *"No se pudo conectar con la API"* cuando en realidad solo no existían personajes con ese nombre. Lo corregimos revisando `respuesta.status === 404` antes de lanzar el error, para mostrar *"No se encontraron personajes"*.

### Un error encontrado y cómo lo resolvimos

Al escribir en el buscador se hacía una petición a la API **por cada letra**, lo que generaba muchas consultas y a veces los resultados llegaban desordenados. Lo resolvimos con un *debounce*: usamos `setTimeout` y `clearTimeout` para esperar 400 ms después de la última tecla antes de consultar la API.

### Una modificación al código que podemos explicar

Los datos de cada personaje se insertan con `textContent` clonando una etiqueta `<template>` del HTML, en vez de armar todo el HTML con `innerHTML`. Así, si un nombre de la API tuviera caracteres especiales o código, el navegador lo mostraría como texto y no lo ejecutaría. Además, los textos de la API (`Alive`, `Dead`, `Female`…) se traducen al español con el objeto `TRADUCCIONES`.

### Reflexión sobre el uso de IA

_Escriban aquí, con sus palabras, qué aprendieron. Ideas: la IA acelera la escritura del código, pero hay que probarlo porque no siempre conoce el comportamiento real de la API (caso del 404); pedir explicaciones línea por línea nos ayudó a entender `fetch`, `async/await` y `localStorage`; y dividir el trabajo en prompts pequeños dio mejores resultados que pedir todo de una vez._

## Funcionalidad extra (reto): modo oscuro / claro

**Cómo funciona:**

1. En `style.css` todos los colores están en **variables CSS** dentro de `:root` (tema claro). El selector `[data-theme="dark"]` redefine esas mismas variables con colores oscuros.
2. En `script.js`, la función `aplicarTema(tema)` pone el atributo `data-theme="dark"` o `"light"` en la etiqueta `<html>`. Como todo el CSS usa las variables, la página entera cambia de color sin tocar cada elemento.
3. Al pulsar el botón se alterna el tema y se guarda en `localStorage` con la clave `rm-tema`.
4. Al abrir la página, `temaInicial()` lee ese valor; si no existe, usa la preferencia del sistema operativo con `matchMedia("(prefers-color-scheme: dark)")`.

## Dificultades

- Entender que la API devuelve 404 cuando no hay resultados.
- Evitar demasiadas peticiones al escribir en el buscador (debounce).
- Hacer que la cuadrícula se vea bien en celulares sin que los filtros se salgan de la pantalla.
- Trabajar con ramas, Issues y Pull Requests por primera vez.

## Respuestas para la presentación

- **¿Qué función cumple `fetch()`?** Hace la petición HTTP a la API y devuelve una promesa con la respuesta; con `await respuesta.json()` convertimos el JSON en objetos de JavaScript (`datos.results` son los personajes y `datos.info` trae el total de páginas).
- **Diferencia entre HTML, CSS y JavaScript:** HTML define el contenido y la estructura (buscador, botones, plantilla de tarjeta); CSS define la apariencia (colores, cuadrícula, adaptación a celular); JavaScript agrega comportamiento (consultar la API, reaccionar a clics, guardar favoritos).
- **¿Cómo funciona el buscador?** Toma el texto del input y los filtros, arma la URL con `URLSearchParams` (`?name=rick&status=alive&page=1`) y llama a la API. En la pestaña Favoritos filtra localmente con `filter()` e `includes()`.
- **¿Qué pasa si la API no responde?** El `fetch` lanza un error que capturamos con `try...catch` y mostramos un mensaje rojo pidiendo revisar la conexión. Si la API responde 404 mostramos "No se encontraron personajes".
- **¿Qué generó la IA y qué modificamos?** La IA generó la base del HTML, CSS y JS; nosotros corregimos el manejo del 404, agregamos el debounce, la traducción al español y ajustamos el diseño en celulares.
- **¿Cómo publicamos con GitHub Pages?** En el repositorio: *Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save*. A los pocos minutos GitHub muestra la URL pública.
