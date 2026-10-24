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

Dashboard consulta pedidos, clientes y productos reales. Sus ventas incluyen solo pedidos pagados con importe registrado; el informe semanal va de lunes a domingo y las categorías muestran unidades vendidas. Reportes consulta Productos y Payments. Dashboard, Clientes, Usuarios, Reportes y Ayuda ya se adaptan a pantallas pequeñas.

Ventas muestra pagos aceptados, permite buscar por cliente o número de venta, filtrar por fecha del pedido y abrir su detalle. El filtrado se realiza en el panel después de consultar todas las páginas; no se cambió Payments.

## Para revisar los cambios

```sh
npm run build
npm test -- --watch=false
npm run lint
```

Los pedidos de la tienda se pagan con una tarjeta de prueba. El panel muestra Tarjeta · Visa y el estado pagado; ya no pide confirmarlo manualmente. La campana avisa de nuevos pedidos y pagos, y Dashboard, Pedidos y Ventas se actualizan cada 8 segundos mientras están abiertos.

El estado del pedido se cambia desde la misma fila: Pendiente, En camino o Entregado. El perfil permite editar teléfono y dirección. La búsqueda del encabezado sirve para abrir secciones o un pedido por su número.
