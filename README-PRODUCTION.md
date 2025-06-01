# 🚀 Despliegue en Producción

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Variables de entorno configuradas correctamente
- SSL/TLS certificados (para HTTPS en producción real)

## 🔧 Configuración

### 1. Variables de Entorno

Crea el archivo `.env.production` basándote en las siguientes variables:

```bash
# Ejemplo de configuración de producción
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=tu_password_super_seguro_aqui_123!
POSTGRES_DB=prueba_db_prod
DATABASE_URL="postgresql://prod_user:tu_password_super_seguro_aqui_123!@postgres:5432/prueba_db_prod?schema=public"

# Genera un JWT secret seguro con: openssl rand -base64 32
JWT_SECRET=tu_jwt_secret_super_seguro_de_32_caracteres_minimo

FRONTEND_URL=https://tu-dominio-frontend.com
APP_PORT=8080
```

### 2. Generar JWT Secret Seguro

```bash
# Generar un JWT secret aleatorio y seguro
openssl rand -base64 32
```

## 🚀 Despliegue

### Opción 1: Script Automático (Recomendado)

```bash
./deploy-production.sh
```

### Opción 2: Manual

```bash
# 1. Construir imágenes
docker compose -f docker-compose.prod.yml build --no-cache

# 2. Iniciar servicios
docker compose -f docker-compose.prod.yml up -d

# 3. Verificar estado
docker compose -f docker-compose.prod.yml ps
```

## 📊 Monitoreo

### Ver Logs

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo la aplicación
docker compose -f docker-compose.prod.yml logs -f prueba-tecnica

# Solo la base de datos
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Health Checks

```bash
# Verificar salud de los contenedores
docker compose -f docker-compose.prod.yml ps

# Health check manual de la aplicación
curl -f http://localhost:8080/api/auth/verify-session
```

## 🔒 Características de Seguridad

✅ **Implementadas:**

- Puerto de base de datos NO expuesto externamente
- Variables de entorno para credenciales
- Usuario no-root en contenedores
- Health checks automáticos
- Red aislada para servicios
- Reinicio automático de contenedores

❌ **Pendientes para producción real:**

- SSL/TLS termination (usar Nginx/Traefik)
- Rate limiting
- Logs centralizados
- Backup automático de base de datos
- Secrets management (Docker Swarm/Kubernetes)

## 🛠️ Comandos Útiles

```bash
# Detener servicios
docker compose -f docker-compose.prod.yml down

# Reiniciar un servicio específico
docker compose -f docker-compose.prod.yml restart prueba-tecnica

# Backup manual de base de datos
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U prod_user prueba_db_prod > backup.sql

# Restaurar backup
docker compose -f docker-compose.prod.yml exec -i postgres psql -U prod_user prueba_db_prod < backup.sql

# Escalar la aplicación (múltiples instancias)
docker compose -f docker-compose.prod.yml up -d --scale prueba-tecnica=3
```

## 🚨 Troubleshooting

### Contenedor no inicia

```bash
# Ver logs detallados
docker compose -f docker-compose.prod.yml logs prueba-tecnica

# Verificar variables de entorno
docker compose -f docker-compose.prod.yml config
```

### Base de datos no conecta

```bash
# Verificar que Postgres esté corriendo
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Probar conexión manual
docker compose -f docker-compose.prod.yml exec postgres psql -U prod_user -d prueba_db_prod
```

### Health check falla

```bash
# Verificar que la aplicación responda
curl -v http://localhost:8080/api/auth/verify-session

# Ver logs de la aplicación
docker compose -f docker-compose.prod.yml logs -f prueba-tecnica
```

## 📈 Próximos Pasos para Producción Completa

1. **Proxy Reverso**: Nginx o Traefik para SSL/TLS
2. **Load Balancer**: Para múltiples instancias
3. **Monitoring**: Prometheus + Grafana
4. **Logs**: ELK Stack o similar
5. **CI/CD**: GitHub Actions o GitLab CI
6. **Orchestration**: Kubernetes o Docker Swarm
