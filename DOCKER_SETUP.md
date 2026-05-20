# Docker Setup Guide for Team Collaboration

## Quick Start

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git for version control
- Your shared environment variables (API keys, secrets)

### Setup Steps for You and Your Friend

1. **Clone or pull the repository**
   ```bash
   git clone <your-repo-url>
   cd Zinko
   ```

2. **Create `.env` file from template**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your actual API keys:
   - `SUPABASE_URL` and `SUPABASE_KEY`
   - `CLERK_SECRET_KEY` and `VITE_CLERK_PUBLISHABLE_KEY`
   - `GROQ_API_KEY`
   - `SVIX_WEBHOOK_SECRET`

3. **Build and start containers**
   ```bash
   docker-compose up --build
   ```
   This will:
   - Build both backend and frontend images
   - Start the backend on `http://localhost:5000`
   - Start the frontend on `http://localhost:5173`
   - Create a shared network between services

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

### Useful Commands

**Stop containers (without removing them)**
```bash
docker-compose down
```

**Restart containers**
```bash
docker-compose restart
```

**View logs from backend**
```bash
docker-compose logs backend -f
```

**View logs from frontend**
```bash
docker-compose logs frontend -f
```

**Rebuild after changing dependencies**
```bash
docker-compose up --build
```

**Access backend container shell**
```bash
docker-compose exec backend sh
```

**Access frontend container shell**
```bash
docker-compose exec frontend sh
```

## How It Works

- **Volumes**: Your local code folders (`./backend`, `./frontend`, `./packages/shared`) are synced to the containers in real-time
- **Hot Reload**: Changes you make locally automatically reload in the running containers
- **Shared Network**: frontend and backend communicate through `zinko-network` bridge network
- **Environment**: All credentials and API keys are loaded from `.env` file

## For Your Friend

Your friend just needs to:
1. Clone the same repository
2. Copy `.env.example` to `.env`
3. Get the same environment variable values from you
4. Look for credentials in a shared document or password manager
5. Run `docker-compose up --build`

**Important**: The `.env` file should **NOT** be committed to Git. It's in `.gitignore` already.

## Shared Package (@zinko/shared)

Your `packages/shared` folder is mounted in both containers, so changes there are automatically available to both backend and frontend.

## Troubleshooting

**Container fails to start**
- Check logs: `docker-compose logs`
- Ensure ports 5000 and 5173 are not in use
- Try rebuilding: `docker-compose up --build`

**Dependencies not updating**
- Run: `docker-compose up --build`
- Or rebuild specific service: `docker-compose build --no-cache backend`

**Port already in use**
- Change ports in `docker-compose.yml`:
  ```yaml
  ports:
    - "3000:5000"  # external:internal
    - "3001:5173"
  ```

**Node modules not installing**
- Run: `docker-compose build --no-cache`

## Development Workflow

1. Both you and your friend work on your local machines
2. Use Git to commit and push changes
3. Your friend pulls changes
4. Both run `docker-compose up` with the same environment variables
5. Code changes sync automatically via volumes
6. Use Git to manage conflicts and merges
