# LESSA AI - Frontend Web Application

Interfaz de usuario interactiva y fluida para el Banco de Datos de LESSA AI 2.0, diseñada con **React 19**, compilada con **Vite**, estilizada con **TailwindCSS v4** y potenciada con **Zustand** para la gestión del estado global y **MediaPipe Tasks Vision** para la extracción de landmarks local.

---

## 🛠️ Stack Tecnológico y Dependencias

- **Vite + React 19:** Compilación ultra rápida y renderizado de componentes reactivos.
- **TailwindCSS v4:** Sistema de estilos moderno integrado directamente en la compilación mediante `@tailwindcss/vite`.
- **Zustand:** Manejo ligero del estado de la cola de captura, calibración de cámara, login y carga del catálogo.
- **Lucide React:** Iconografía vectorial estilizada.
- **MediaPipe Tasks Vision (`@mediapipe/tasks-vision`):** Motor Web Assembly (WASM) para ejecutar modelos de detección de manos en el navegador con latencias inferiores a 15ms.

---

## ⚙️ Configuración del Servidor y API (Capa de Conexión)

El cliente Axios centralizado en [api.js](file:///c:/Users/ale_d/Documents/Creapx/2026/LESSAV2/frontend/src/services/api.js) adapta automáticamente las peticiones de red dependiendo del tipo de backend que utilices:

1. **Google Apps Script Web App (Producción en la Nube):**
   - Utiliza llamadas HTTP `GET` y `POST` simples para evadir restricciones de preflight de CORS de Google.
   - Envía los payloads de carga de videos/imágenes codificados en base64 junto con metadatos estructurados en formato JSON plano.
   
2. **FastAPI local (Desarrollo y Servidor Físico Python):**
   - Utiliza endpoints REST tradicionales (`GET /pending`, `POST /upload`, `PATCH /validation/{id}`).
   - Pasa tokens de autenticación en cabeceras `Authorization: Bearer <token>`.

*Para cambiar de servidor, simplemente edita la constante de URL en `api.js` o crea un archivo `.env` configurando `VITE_API_URL`.*

---

## 📹 Módulo de Captura Inteligente (Camera.jsx)

La cámara frontal integra algoritmos de pre-clasificación para garantizar que las muestras guardadas en la base de datos cumplan con los estándares de calidad necesarios para entrenar el modelo YOLO11 y MLP:
- **Luminosidad:** Submuestrea el centro del canvas y requiere que el promedio de iluminación sea $>100$.
- **Centrado de Mano:** Verifica que el centro de masas de la mano se ubique dentro de las coordenadas relativas de $0.25$ a $0.75$.
- **Estabilidad (Jitter):** Mide la distancia de cambio Euclidiana acumulada de los landmarks en los últimos 15 frames, deteniendo la captura si el temblor es mayor a $0.015$.

---

## 🚀 Instrucciones de Ejecución

1. Descarga e instala las dependencias de Node.js:
   ```bash
   cd frontend
   npm install
   ```
2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Para compilar una versión de producción optimizada:
   ```bash
   npm run build
   ```

   ---
    Credenciales para el dashboard:
   Email: admin@lessa.org
Password: password123
Rol: administrador
