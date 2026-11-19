# EventosPeruIA — Frontend (Vue 3 + Quasar)

## Requisitos
- Node.js 22 o superior
- La API EventosPeruIA corriendo en http://localhost:5166 (Visual Studio)

## Instalar y ejecutar
```bash
npm install
npx quasar dev
```
Se abre en http://localhost:9000 (es el origen que permite el CORS de la API).

## Usuarios de prueba (contraseña: Prueba123)
- Asistente: maria.quispe@gmail.com
- Organizador: carlos.mendoza@gmail.com
- Administrador: admin@eventosperu.pe

## Seguridad
- El token JWT se guarda en localStorage al iniciar sesión y se envía en la cabecera `Authorization` de cada petición.
- Al cerrar sesión, o si la API responde 401, el token se borra y se pide iniciar sesión otra vez.
- Si la API responde 403 por rol, se muestra la página «Acceso denegado».
- Las secciones /organizador y /admin solo se abren con el rol correspondiente.
