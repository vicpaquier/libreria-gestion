# Frontend - Gestión de biblioteca

Aplicación web para la gestión de la biblioteca, desarrollada con Angular 22 y Angular Material.
Consume el backend mediante rutas relativas bajo `/api`.

## Requisitos

- Node.js 22.22.3 o una versión posterior compatible con Angular 22.
- npm 11.19.0, versión fijada en `package.json`.
- El backend disponible en `http://localhost:8080` para trabajar localmente.

## Instalación

```bash
npm install
```

## Ejecución local

```bash
npm start
```

La aplicación queda disponible en `http://localhost:4200`. El servidor de desarrollo usa
`proxy.conf.json` para enviar las solicitudes de `/api` a `http://localhost:8080`.

## Pruebas y compilación

Ejecutar las pruebas una sola vez:

```bash
npx ng test --watch=false
```

Generar el paquete optimizado para producción:

```bash
npm run build
```

Los archivos estáticos se generan en `dist/libreria-gestion/browser/`.

## Despliegue

El frontend se puede publicar en cualquier servidor de archivos estáticos. El servidor debe:

1. Servir el contenido de `dist/libreria-gestion/browser/`.
2. Entregar `index.html` para las rutas que no correspondan a un archivo, porque Angular controla
   la navegación en el navegador.
3. Redirigir `/api/*` al backend. `proxy.conf.json` solo se utiliza con `npm start` y no forma parte
   del paquete de producción.

### Ejemplo con Nginx

Después de ejecutar `npm ci` y `npm run build`, copiar el contenido generado al directorio público
del servidor:

```bash
sudo cp -r dist/libreria-gestion/browser/. /var/www/libreria/
```

Configuración de ejemplo cuando el backend se ejecuta en el mismo servidor, en el puerto `8080`:

```nginx
server {
    listen 80;
    server_name ejemplo.com;

    root /var/www/libreria;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Validar y recargar Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

En una plataforma de alojamiento estático se deben configurar reglas equivalentes: una reescritura
de las rutas de la aplicación hacia `/index.html` y un proxy de `/api/*` hacia la URL pública del
backend. No es suficiente configurar únicamente la URL del backend en `proxy.conf.json`.

## Comandos disponibles

| Comando                     | Descripción                                   |
| --------------------------- | --------------------------------------------- |
| `npm start`                 | Inicia el servidor local en el puerto `4200`. |
| `npm run build`             | Genera el paquete de producción.              |
| `npm run watch`             | Compila en modo desarrollo y observa cambios. |
| `npm test`                  | Ejecuta las pruebas en modo interactivo.      |
| `npx ng test --watch=false` | Ejecuta todas las pruebas una sola vez.       |
