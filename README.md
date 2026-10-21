# Librería Platón

Panel administrativo de nuestra librería, hecho con Angular y Tailwind CSS.

## Para levantar el proyecto

Instala las dependencias y ejecuta el frontend:

```sh
npm ci
npm start
```

Abre [localhost:4200](http://localhost:4200).

Para que funcione el login, primero levanta la base de datos y los servicios del backend:

- Config Server: `8888`
- Eureka: `8761`
- Account: `8083`
- API Gateway: `8080`

Las conexiones locales están en `proxy.conf.json`. Si cambias algún puerto del backend, revísalo también ahí. Para publicar el proyecto, las rutas `/api` se deben configurar en el servidor.

## Avance

Usuarios y Clientes ya están conectados a Account. Se pueden registrar, consultar, editar y desactivar cuentas. Desactivar conserva los datos.

El administrador tiene acceso a todo el panel. El vendedor puede entrar a Productos, Pedidos, Ventas, Clientes y Ayuda, pero en Clientes solo puede consultar. Las cuentas de clientes son para la tienda y no ingresan a este panel. Los permisos del backend todavía están pendientes.

Ambas listas tienen buscador y filtros por estado. También se puede filtrar por rol en Usuarios, por compras pagadas en Clientes y por fecha de registro en los dos módulos.

Dashboard y Reportes siguen usando datos de ejemplo. Dashboard, Clientes, Usuarios, Reportes y Ayuda ya se adaptan a pantallas pequeñas.

## Para revisar los cambios

```sh
npm run build
npm test -- --watch=false
npm run lint
```

El lint general todavía marca funciones vacías en algunos módulos en desarrollo.
