import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const URL = 'https://sistemacuenca.ucp.edu.ar/alumnosnotas/';
const USER_SELECTOR = '#ctl00_ContentPlaceHolder1_TextBox1';
const PASSWORD_SELECTOR = '[name="ctl00$ContentPlaceHolder1$Clave"]';
const LOGIN_BUTTON_SELECTOR = '[name="ctl00$ContentPlaceHolder1$ImageButton1"]';
const ERROR_MESSAGE_SELECTOR = '#ctl00_ContentPlaceHolder1_Label2'; // Mensaje de error en el login
const CURSADO_BUTTON = '#ctl00_PanelCursado_header';
const INASISTENCIAS_URL = 'https://sistemacuenca.ucp.edu.ar/alumnosnotas/Proteccion/Inasistencias.aspx?Sel=1';
const INASISTENCIAS_SELECTOR = '#ctl00_ContentPlaceHolder1_GridView1 td[align="center"]';
const TABLE_SELECTOR = '#ctl00_ContentPlaceHolder1_GridView1';
const ROWS_SELECTOR = `${TABLE_SELECTOR} tbody tr`;

/*async function sendEmail(subject: string, body: string) {
    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false, // No usar SSL, sino STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false, // Permitir certificados no verificados
        },
    });

    await transporter.sendMail({
        from: `"Sistema Alumnos" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        subject,
        html: body,
    });

    console.log("📧 Email enviado correctamente desde Hotmail!");
} */

test('Caso exitoso: Ingreso correcto al sistema', async ({ page }) => {
    await page.goto(URL);

    await page.fill(USER_SELECTOR, process.env.USERNAME!);
    await page.fill(PASSWORD_SELECTOR, process.env.PASSWORD!);
    await page.click(LOGIN_BUTTON_SELECTOR);

    //URL esperada después del login exitoso
    await expect(page).toHaveURL("https://sistemacuenca.ucp.edu.ar/alumnosnotas/Proteccion/Inicio.aspx");

    // 2. Click en "Cursado"
    await page.click(CURSADO_BUTTON);

    // 3. Navegar a la página de inasistencias
    await page.goto(INASISTENCIAS_URL);

    // 4. Extraer todas las filas de la tabla
    const rows = await page.$$(ROWS_SELECTOR);
    let emailBody = `<h2>📋 Resumen de Inasistencias</h2><ul>`;

    console.log(`Se encontraron ${rows.length} filas en la tabla de inasistencias:`);

    for (const row of rows) {
        // Obtener todas las celdas de la fila
        const cells = await row.$$('td');

        // Si hay al menos dos columnas (materia + inasistencia)
        if (cells.length > 1) {
            // Extraer el nombre de la materia (columna 1) y porcentaje de inasistencia (última columna)
            const materia = await cells[0].textContent();
            const inasistencia = await cells[cells.length - 1].textContent();

            console.log(`Materia: ${materia?.trim()} - Inasistencia: ${inasistencia?.trim()}`);

            // Validación: asegurarse de que la inasistencia tiene un formato válido
            expect(inasistencia).not.toBeNull();
            expect(inasistencia).toMatch(/\d+(\.\d+)?\s?%/); // Expresión para validar formato de porcentaje
            emailBody += `<li><strong>${materia?.trim()}:</strong> ${inasistencia?.trim()}</li>`;
        }
    } 
    emailBody += `</ul>`;
     // 5. Enviar correo
     //await sendEmail("Reporte de Inasistencias", emailBody);
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
