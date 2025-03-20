import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const URL = 'https://sistemacuenca.ucp.edu.ar/alumnosnotas/';
const USER_SELECTOR = '#ctl00_ContentPlaceHolder1_TextBox1';
const PASSWORD_SELECTOR = '[name="ctl00$ContentPlaceHolder1$Clave"]';
const LOGIN_BUTTON_SELECTOR = '[name="ctl00$ContentPlaceHolder1$ImageButton1"]';
const ERROR_MESSAGE_SELECTOR = '#ctl00_ContentPlaceHolder1_Label2'; // Mensaje de error en el login

test('Caso exitoso: Ingreso correcto al sistema', async ({ page }) => {
    await page.goto(URL);

    await page.fill(USER_SELECTOR, process.env.USERNAME!);
    await page.fill(PASSWORD_SELECTOR, process.env.PASSWORD!);
    await page.click(LOGIN_BUTTON_SELECTOR);

    //URL esperada después del login exitoso
    await expect(page).toHaveURL("https://sistemacuenca.ucp.edu.ar/alumnosnotas/AlumnoDeudor.aspx?mensaje=Error%20al%20verificar");
});

test('Caso fallido: Intento de ingreso con credenciales incorrectas', async ({ page }) => {
    await page.goto(URL);

    await page.fill(USER_SELECTOR, 'usuario_invalido');
    await page.fill(PASSWORD_SELECTOR, 'contraseña_invalida');
    await page.click(LOGIN_BUTTON_SELECTOR);

    // Verifica que aparezca el mensaje de error
    await expect(page.locator(ERROR_MESSAGE_SELECTOR)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_SELECTOR)).toContainText('La combinación de usuario y clave no coincide'); // Ajusta el mensaje según lo que muestre el sistema
});
