import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',  // Define dónde están las pruebas
  use: {
    headless: false,   // Para ver el navegador en acción
    screenshot: 'on',  // Toma capturas de pantalla en caso de fallos
    video: 'retain-on-failure' // Guarda video si falla una prueba
  },
});
