# Diálogo Socrático Interior

Aplicación web de introspección basada en ACT (Acceptance & Commitment Therapy). El flujo guía al usuario por un perfil ACT, un diagnóstico y un diálogo socrático en seis fases para transformar creencias.

## Requisitos

- Node.js 18+
- npm

## Configuración

La app está lista para funcionar con persistencia local (localStorage). Si deseas conectar servicios externos (por ejemplo, Supabase o un backend propio), configura las variables de entorno.

1. Copia el archivo de ejemplo:

```sh
cp .env.example .env
```

2. Ajusta los valores según tu entorno.

## Desarrollo

```sh
npm install
npm run dev
```

## Build y preview

```sh
npm run build
npm run preview
```

## Persistencia

- Por defecto, la sesión actual y el historial se almacenan en `localStorage`.
- Puedes sustituir esta capa por un backend propio o Supabase en futuras iteraciones.

## IA / Backend seguro (opcional)

Si necesitas integrar un modelo de IA, se recomienda usar un backend seguro (por ejemplo, API propia) y evitar exponer llaves en el cliente. Configura el endpoint vía `.env`.
