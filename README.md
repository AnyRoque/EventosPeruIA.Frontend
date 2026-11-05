# EventosPeruIA · Frontend

Entrega 3 con Vue 3, Quasar 2, Vue Router y Vite. Diseño basado en las referencias de Figma.

## Ejecutar

Requiere Node.js 20.19+ o 22.12+ y npm.

```powershell
npm install
npm run dev
```

Abre http://127.0.0.1:9000. Vite mantiene el puerto fijo para evitar confusiones con el backend.
Para compilar: `npm run build`. Para revisar la compilación: `npm run preview`.

## Pantallas

- /#/login: inicio de sesión real, validación, contraseña visible/oculta, errores y carga.
- /#/registro: formulario demostrativo con validaciones y selección de rol. No crea usuarios.
- /#/inicio: portada, categorías y eventos destacados de ejemplo.
- /#/explorar: búsqueda, filtros por ciudad/categoría y detalle en diálogo.
- /#/notificaciones: lectura individual y marcar todas como leídas.
- /#/mis-eventos: creación, edición y cancelación de eventos de ejemplo.

Solo login llama a la API: POST /api/Usuario/login con { correo, password }. Lee datos.token y los datos del usuario. El backend debe estar iniciado en http://localhost:5166. El proxy de Vite evita problemas de CORS en desarrollo. Para otro servidor revisa .env.example.

La sesión se conserva en sessionStorage hasta cerrar la pestaña o salir. La navegación de demostración es pública y no representa autorización a recursos privados del backend. Las demás pantallas usan datos locales en memoria y se reinician al recargar. No se envían correos, pagos ni altas de usuarios.

## Cuenta de prueba

Si cargaste EventosPeruIA_Demo.sql en el backend:

- asistente.demo@example.test
- organizador.demo@example.test
- admin.demo@example.test

Contraseña de las cuentas sintéticas: Prueba123. Los botones de acceso rápido solo completan campos; el servidor comprueba las credenciales. El enlace «Explorar la demostración» permite revisar el diseño sin backend.

## Git

Los cambios se entregan sin commit ni push para revisarlos primero. En la consulta realizada, la rama predeterminada del remoto era feature/US-01-04; no existía main. Verifica la rama de destino con tu equipo antes de subir.

## Imágenes

Fotografías de muestra servidas por Unsplash, guardadas en public/images para que la demostración no dependa de una conexión externa. Orígenes documentados en public/images/SOURCES.md.
