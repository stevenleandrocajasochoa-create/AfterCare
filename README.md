# AFTERCARE

Aplicación de bienestar personal construida con HTML, CSS y JavaScript. Diseño adaptable, registros guardados localmente, gráficos semanales, exportación JSON, chatbot de demostración y funciones de voz del navegador.

## 1. Abrirla como HTML (rápido)

1. Descomprime la carpeta `AFTERCARE`.
2. Abre `index.html` con tu navegador.
3. La interfaz y los registros funcionan. Algunas funciones de PWA/voz requieren HTTPS o localhost.

## 2. Probarla correctamente en tu computadora

El modo recomendado es servirla por localhost:

- Instala Node.js desde https://nodejs.org/
- Abre una terminal dentro de esta carpeta.
- Ejecuta `npx serve .` (o `python -m http.server 8000` si tienes Python).
- Abre la URL local que muestre la terminal, por ejemplo `http://localhost:3000`.

## 3. Publicarla gratis con GitHub Pages

1. Crea una cuenta en https://github.com/ si no tienes.
2. Crea un repositorio nuevo llamado `aftercare`.
3. Sube los archivos de esta carpeta manteniendo la estructura (`index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `service-worker.js` y la carpeta `public`).
4. En el repositorio abre **Settings → Pages**.
5. En **Build and deployment**, elige **Deploy from a branch**, selecciona `main` y `/ (root)`, y guarda.
6. Espera a que GitHub muestre el enlace de Pages. Esa será la web para el profesor.

La página funciona sin backend en modo demostración. GitHub Pages no ejecuta el servidor Node.js; el servidor de IA debe publicarse aparte.

## 4. Instalarla como app (PWA)

- Android/Chrome: abre la web publicada, pulsa el menú ⋮ y elige **Instalar aplicación** o **Añadir a pantalla de inicio**.
- iPhone/iPad/Safari: Compartir → **Añadir a pantalla de inicio**.
- Computadora: busca el icono de instalación en la barra del navegador si aparece.

## 5. Conectar una IA real (opcional)

El chatbot ya responde en modo local. Para conectar IA real:

1. Entra en la carpeta `server`.
2. Copia `.env.example` como `.env` y pon tu clave secreta de API en `OPENAI_API_KEY`. **Nunca publiques `.env` en GitHub ni pongas la clave en `app.js`.**
3. En una terminal dentro de `server`, ejecuta `npm install` y después `npm start`.
4. El servidor queda en `http://localhost:3000`. Para conectar el front-end local, añade al principio de `app.js` una línea como:
   `window.AFTERCARE_API_URL = "http://localhost:3000/api/chat";`
   Hazlo solo para pruebas locales.
5. Para que funcione en el enlace público, despliega la carpeta `server` en un servicio que ejecute Node.js y cambia esa URL por la URL HTTPS pública del endpoint `/api/chat`. Ajusta `ALLOWED_ORIGIN` en las variables de entorno para permitir únicamente el dominio de tu página.
6. La API de IA puede tener costes y requiere una cuenta/proyecto con acceso. Comprueba el precio y los límites del proveedor antes de activarla.

## 6. ¿Y la APK Android?

Una PWA se instala en Android sin crear una APK y sirve para la mayoría de demostraciones escolares. Para entregar un archivo `.apk` independiente, hace falta envolver la web con Capacitor y compilarla en Android Studio. Esto requiere Android Studio/JDK y normalmente un entorno de escritorio. Instrucciones de referencia: https://capacitorjs.com/docs/android

### Preparación básica para APK con Capacitor

1. Instala Node.js y Android Studio.
2. En la carpeta del proyecto, ejecuta:
   `npm init -y`
   `npm install @capacitor/core @capacitor/cli @capacitor/android`
   `npx cap init AFTERCARE com.example.aftercare`
3. Crea una carpeta `www` y copia dentro los archivos web: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `service-worker.js` y `public/`.
4. En `capacitor.config.json`, configura `"webDir": "www"`.
5. Ejecuta `npx cap add android`, luego `npx cap sync android` y `npx cap open android`.
6. En Android Studio, usa **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

La PWA es la opción más simple y multiplataforma. Una APK es solo para Android; iPhone usa el método de añadir a pantalla de inicio.

## Notas de privacidad y seguridad

- Los registros de hábitos se guardan en `localStorage` del navegador y no se sincronizan automáticamente entre dispositivos.
- Exporta los datos desde la sección Hábitos para tener una copia.
- No incluyas datos privados o información médica sensible.
- Es una herramienta educativa de bienestar general, no un producto médico ni un sustituto de profesionales.
