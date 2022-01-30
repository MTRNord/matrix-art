[![Total alerts](https://img.shields.io/lgtm/alerts/g/MTRNord/matrix-art.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/MTRNord/matrix-art/alerts/) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/MTRNord/matrix-art.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/MTRNord/matrix-art/context:javascript)
[![#matrix-art:nordgedanken.dev](https://img.shields.io/matrix/matrix-art:nordgedanken.dev?server_fqdn=matrix.nordgedanken.dev&label=%23matrix-art:nordgedanken.dev&logo=matrix)](https://matrix.to/#/#matrix-art:nordgedanken.dev)

# Matrix-Art

Matrix Art is an experimental Devianart Fediverse version which tries to be close to Devianart.

![Screenshot](.github/images/screenshot.png)

## Concept (roughly)

https://scythe-pink-090.notion.site/Art-MX-Fediverse-Devianart-148d45b596e74582acff518baadd3026

## Demo Page

https://art.midnightthoughts.space/

## How to install

### Prerequisites 

- Nodejs
- A Matrix Server with public registration
- A Matrix Server with guests enabled
- A Matrix Server with dynamic thumbnails
- A Meillisearch server (See https://meilisearch.com for more information)

### Steps

1. Copy the `.env.local.example` to `.env.local` or set the `NEXT_PUBLIC_DEFAULT_SERVER_URL` variable.
2. Run `npm run dev` or build and run the Dockerimage

## Translations

Translations can be contributed via https://trans.nordgedanken.dev/projects/matrix-art/matrix-art/

![Übersetzungsstatus](https://trans.nordgedanken.dev/widgets/matrix-art/-/matrix-art/multi-auto.svg)