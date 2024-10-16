# Backend Escuela - API en Express.js

Este proyecto es una API construida con Express.js y conectada a una base de datos SQL Server para la gestión de alumnos y maestros.

## Requisitos previos

- Node.js (versión 14 o superior)
- SQL Server
- npm (generalmente se instala junto con Node.js)

## Instalación

1. Clona el repositorio:
    ```bash
    git clone https://github.com/richie010101/back-end-escuelita.git
    ```
2. Navega al directorio del proyecto:
    ```bash
    cd back-end-escuelita
    ```
3. Instala las dependencias:
    ```bash
    npm install
    ```

## Configuración de la base de datos

Antes de ejecutar la aplicación, asegúrate de tener una base de datos SQL Server configurada con los datos correspondientes. También es importante modificar el archivo `index.js` para adecuar la configuración a tu entorno de desarrollo o producción.

En el archivo `index.js`, cambia las siguientes líneas según corresponda:

```javascript
const config = {
  user: 'sa',
  password: 'abc123',
  server: 'RICARDOLAPTOP', // Cambiar por tu servidor SQL en producción
  database: 'Escuela',
  options: {
    encrypt: false, // Cambiar a true si se requiere conexión encriptada
    enableArithAbort: false,
    idleTimeoutMillis: 30000,
  },
  port: 1433
}

para correr el sistema utiliza el comando 
node index.js


Respaldo de la Base de Datos
El respaldo de la base de datos se encuentra disponible como backup.bak. Asegúrate de restaurar este archivo en tu instancia de SQL Server antes de ejecutar la aplicación.