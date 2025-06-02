<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">Prueba Técnica</h1>

## 🚀 Características

- **NestJS**
- **Docker Compose**

---

## 🔗 Postman

https://www.postman.com/cloudy-escape-667722/workspace/prueba-tecnica

## 🛠️ Requisitos previos

Asegúrate de tener instalados los siguientes elementos antes de continuar:

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [PrismaORM](https://www.prisma.io/)

---

## 📦 Instalación

Sigue estos pasos para configurar el entorno local:

1. Clona el repositorio:

   ```bash
   git clone git@github.com:Kahyberth/prueba-tecnica-backend.git
   cd prueba-tecnica-backend
   ```

2. Ejecuta el siguiente comando para instalar las dependencias

```
npm install
o
bun install
```

3. Reenombrar .env.template a .env

```
.env.template  ---> .env
```

4. Levanta el contenedor de docker con la imagen de postgresql

```
docker compose up -d
```

5. Ejecuta el servidor

```
npm run start:dev

o

bun start:dev

```
