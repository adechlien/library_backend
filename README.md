# Libreria Backend

API para la gestión de usuarios, libros y reservas de una biblioteca.

- Manejo de modelos: **Usuario**, **Libro**, **Reserva**
- CRUD para usuarios y libros
- Búsqueda de libros con **filtros** y **paginación**
- **Historial de reservas** por libro y por usuario
- **Pruebas automáticas** para cada controlador

---

## Instalación de dependencias

```bash
npm install
```

---

## Configuración de entorno

Crear un .env y copiar en este lo siguiente:

```env
PORT=3000
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=2h
```

Esta información también se puede encontrar en el `.env.example`.

---

### Iniciar el servidor

```bash
npm start
```

### Ejecutar todas las pruebas

```bash
npm test
```

---

## Seed de datos inicial (Admin)

Al iniciar la API, se crea automáticamente un usuario **Admin** si no existe:

* **Email:** `admin@admin.com`
* **Contraseña:** `123456`

Este usuario tiene todos los permisos: crear libros, actualizarlos y borrarlos, actualizar usuarios y borrarlos, y leer la lista de usuarios.

Probar

```bash
curl http://localhost:3000/health
```

Respuesta esperada
```bash
{"ok":true,"service":"sanito, todo bien"}
```
---

## Pruebas automáticas

El proyecto incluye pruebas para los 4 controladores:

* `authController.test.js`
* `userController.test.js`
* `bookController.test.js`
* `reservationController.test.js`

Ejecutar

```bash
npm test
```

Salida esperada (algo parecido a esto)

```text
> libreria-backend-api@1.0.0 test
> NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand

 PASS  tests/userController.test.js
 PASS  tests/reservationController.test.js
 PASS  tests/bookController.test.js
 PASS  tests/authController.test.js

Test Suites: 4 passed, 4 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        3.671 s
Ran all test suites.
```

---

## Pruebas manuales de la API (paso a paso)

### 1. Autenticación

#### 1.1. Registrar un nuevo usuario

```bash
curl -X POST http://localhost:3000/auth/register
  -H "Content-Type: application/json"
  -d '{
    "name": "Juan Lector",
    "email": "juan@example.com",
    "password": "lector123"
  }'
```

Respuesta esperada

```json
{
  "id": 2,
  "name": "Juan Lector",
  "email": "juan@example.com",
  "permissions": {
    "canCreateBook": false,
    "canUpdateBook": false,
    "canDeleteBook": false,
    "canUpdateUser": false,
    "canDeleteUser": false,
    "canReadUsers": false
  },
  "isDisabled": false
}
```

#### 1.2. Login (admin o usuario)

```bash
curl -X POST http://localhost:3000/auth/login
  -H "Content-Type: application/json"
  -d '{
    "email": "admin@admin.com",
    "password": "123456"
  }'
```

Respuesta esperada

```json
{
  "token": "JWT_AQUI",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@admin.com",
    "permissions": { ... }
  }
}
```

> Guarda el `token` para usarlo en otros casos

---

### 2. Pruebas del módulo de Libros

#### 2.1. Crear libro (pega el token guardado en la parte de Authorization)

```bash
curl -X POST http://localhost:3000/books
  -H "Content-Type: application/json"
  -H "Authorization: Bearer ADMIN_TOKEN_AQUI"
  -d '{
    "title": "El amor en los tiempos del cólera",
    "author": "Gabriel García Márquez",
    "genre": "Novel",
    "publisher": "La Oveja Negra Ltda.",
    "publicationDate": "1985-11-01"
  }'
```

Respuesta esperada

```json
{
  "id": 1,
  "title": "El amor en los tiempos del cólera",
  "author": "Gabriel García Márquez",
  "genre": "Novel",
  "publisher": "La Oveja Negra Ltda.",
  "publicationDate": "1985-11-01",
  "isAvailable": true,
  "isDisabled": false
}
```

#### 2.2. Listar libros con paginación y filtros

```bash
curl "http://localhost:3000/books?page=1&limit=10"
```

Respuesta esperada

```json
{
  "data": [
    { "id": 1, "title": "El amor en los tiempos del cólera" }
  ],
  "pagination": {
    "page": 1,
    "totalPages": 1,
    "limit": 10,
    "totalItems": 1
  }
}
```

Ejemplos de filtros:

```bash
curl "http://localhost:3000/books?author=Gabriel García Márquez"
curl "http://localhost:3000/books?genre=Novel"
curl "http://localhost:3000/books?publisher=La Oveja Negra Ltda."
curl "http://localhost:3000/books?fromDate=1980-01-01&toDate=1990-12-31"
curl "http://localhost:3000/books?available=true"
```

#### 2.3. Obtener un libro por id

```bash
curl "http://localhost:3000/books/1"
```

#### 2.4. Actualizar libro

```bash
curl -X PUT http://localhost:3000/books/1
  -H "Content-Type: application/json"
  -H "Authorization: Bearer ADMIN_TOKEN_AQUI"
  -d '{"title": "El amor en los tiempos del covid"}'
```

#### 2.5. Eliminar libro

```bash
curl -X DELETE http://localhost:3000/books/1
  -H "Authorization: Bearer ADMIN_TOKEN_AQUI"
```

---

### 3. Pruebas del módulo de Usuarios

#### 3.1. Ver perfil de usuario

```bash
curl "http://localhost:3000/users/2"
```

#### 3.2. Actualizar datos del propio usuario

1. Login del usuario:

```bash
curl -X POST http://localhost:3000/auth/login
  -H "Content-Type: application/json"
  -d '{
    "email": "peter@parker.com",
    "password": "soyspiderman"
  }'
```

Guarda el token del usuario y su id.
```

2. Actualiza

```bash
curl -X PUT http://localhost:3000/users/$USER_ID
  -H "Content-Type: application/json"
  -H "Authorization: Bearer $USER_TOKEN"
  -d '{"name": "Peter B. Parker"}'
```

---

### 4. Pruebas del módulo de Reservas

> Recordatorio: solo se puede reservar un libro **disponible** (`isAvailable = true`).

#### 4.1. Crear una reserva

Ejemplo

```bash
curl -X POST http://localhost:3000/reservations
  -H "Content-Type: application/json"
  -H "Authorization: Bearer $USER_TOKEN"
  -d '{ "bookId": 1 }'
```

Respuesta esperada

```json
{
  "id": 1,
  "userId": 2,
  "bookId": 1,
  "reservedAt": "...",
  "deliveredAt": null
}
```

El libro reservado pasa a `isAvailable = false`.

#### 4.2. Historial de reservas por usuario

```bash
curl -X GET http://localhost:3000/reservations/user/$USER_ID
  -H "Authorization: Bearer $USER_TOKEN"
```

Respuesta

```json
[
  {
    "id": 1,
    "book": {
      "id": 1,
      "title": "El amor en los tiempos del cólera"
    },
    "reservedAt": "...",
    "deliveredAt": null
  }
]
```

#### 4.3. Historial de reservas por libro

```bash
curl -X GET http://localhost:3000/reservations/book/1
  -H "Authorization: Bearer ADMIN_TOKEN_AQUI"
```

Respuesta

```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "name": "Peter Parker",
      "email": "peter@parker.com"
    },
    "reservedAt": "...",
    "deliveredAt": null
  }
]
```

```
