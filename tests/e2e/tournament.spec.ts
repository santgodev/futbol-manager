import { test, expect } from '@playwright/test';

test.describe('Panel de Control - Fútbol Manager', () => {
  // Iniciar sesión como administrador antes de cada prueba
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Rellenar formulario de acceso autorizado
    await page.fill('input[name="email"]', 'admin@torneo.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Esperar a que la redirección a /admin se complete de forma exitosa
    await page.waitForURL(/\/admin/);
  });

  test('debe cargar la página del panel de control con estética premium', async ({ page }) => {
    // Verificar que el título principal del panel de control está visible
    const mainTitle = page.locator('h1:has-text("PANEL DE CONTROL")');
    await expect(mainTitle).toBeVisible();

    // Verificar que los widgets de estadísticas se renderizan correctamente
    const statsCards = page.locator('.panel-stat');
    await expect(statsCards).toHaveCount(3);
  });

  test('debe navegar al formulario de creación y validar la presencia de los nuevos formatos cyberpunk', async ({ page }) => {
    // Hacer clic en "+ Nuevo Torneo" en el dashboard
    const newTournamentBtn = page.locator('text="+ Nuevo Torneo"');
    await expect(newTournamentBtn).toBeVisible();
    await newTournamentBtn.click();

    // Verificar redirección correcta a /admin/tournaments/new
    await expect(page).toHaveURL(/\/admin\/tournaments\/new/);

    // Verificar campos requeridos del formulario usando getByText
    const nameLabel = page.getByText('Nombre del Torneo', { exact: true });
    await expect(nameLabel).toBeVisible();

    // Verificar los tres nuevos formatos de competición premium
    const groupsFormatBtn = page.getByText('Grupos + Playoffs', { exact: true });
    await expect(groupsFormatBtn).toBeVisible();

    const leagueFormatBtn = page.getByText('Liga Directa', { exact: true });
    await expect(leagueFormatBtn).toBeVisible();

    const playoffsFormatBtn = page.getByText('Copa Directa', { exact: true });
    await expect(playoffsFormatBtn).toBeVisible();
  });
});
