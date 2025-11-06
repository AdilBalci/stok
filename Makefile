.PHONY: help install start stop restart logs clean test

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Stok Yönetim Sistemi - Docker Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Examples:$(NC)"
	@echo "  make start       # Start all services"
	@echo "  make logs        # View logs"
	@echo "  make stop        # Stop all services"

install: ## Install dependencies and create .env file
	@echo "$(BLUE)Installing dependencies...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file from template...$(NC)"; \
		cp .env.example .env; \
		echo "$(GREEN)✓ .env file created. Please edit it with your credentials.$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists$(NC)"; \
	fi
	@cd mock-api && npm install
	@echo "$(GREEN)✓ Installation complete!$(NC)"

start: ## Start all services
	@echo "$(BLUE)Starting all services...$(NC)"
	@docker-compose up -d
	@echo ""
	@echo "$(GREEN)✓ Services started!$(NC)"
	@echo ""
	@echo "$(YELLOW)Access URLs:$(NC)"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  N8n:       http://localhost:5678 (admin/admin123)"
	@echo "  Mock API:  http://localhost:3001"
	@echo "  Postgres:  localhost:5432 (n8n_user/n8n_password)"
	@echo ""
	@echo "$(BLUE)Run 'make logs' to view logs$(NC)"

stop: ## Stop all services
	@echo "$(BLUE)Stopping all services...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ All services stopped$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting all services...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✓ All services restarted$(NC)"

logs: ## View logs from all services
	@docker-compose logs -f

logs-n8n: ## View N8n logs only
	@docker-compose logs -f n8n

logs-frontend: ## View frontend logs only
	@docker-compose logs -f frontend

logs-mock: ## View mock API logs only
	@docker-compose logs -f mock-api

status: ## Show status of all services
	@docker-compose ps

clean: ## Stop and remove all containers, volumes, and networks
	@echo "$(RED)Warning: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)Cleaning up...$(NC)"; \
		docker-compose down -v; \
		echo "$(GREEN)✓ Cleanup complete$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

rebuild: ## Rebuild all containers
	@echo "$(BLUE)Rebuilding containers...$(NC)"
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo "$(GREEN)✓ Rebuild complete$(NC)"

shell-n8n: ## Open shell in N8n container
	@docker-compose exec n8n sh

shell-postgres: ## Open psql shell in PostgreSQL
	@docker-compose exec postgres psql -U n8n_user -d n8n_db

backup-db: ## Backup PostgreSQL database
	@echo "$(BLUE)Backing up database...$(NC)"
	@mkdir -p backups
	@docker-compose exec -T postgres pg_dump -U n8n_user n8n_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup saved to backups/$(NC)"

restore-db: ## Restore PostgreSQL database (Usage: make restore-db FILE=backups/backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify FILE parameter$(NC)"; \
		echo "Usage: make restore-db FILE=backups/backup_20240115.sql"; \
		exit 1; \
	fi
	@echo "$(BLUE)Restoring database from $(FILE)...$(NC)"
	@docker-compose exec -T postgres psql -U n8n_user n8n_db < $(FILE)
	@echo "$(GREEN)✓ Database restored$(NC)"

test: ## Run tests
	@echo "$(BLUE)Running tests...$(NC)"
	@cd mock-api && npm test
	@echo "$(GREEN)✓ Tests complete$(NC)"

health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC)"
	@curl -f http://localhost:3000/health || echo "$(RED)✗ Frontend unhealthy$(NC)"
	@echo ""
	@echo "$(YELLOW)N8n:$(NC)"
	@curl -f http://localhost:5678/healthz || echo "$(RED)✗ N8n unhealthy$(NC)"
	@echo ""
	@echo "$(YELLOW)Mock API:$(NC)"
	@curl -f http://localhost:3001/health || echo "$(RED)✗ Mock API unhealthy$(NC)"
	@echo ""

dev: ## Start in development mode with auto-reload
	@echo "$(BLUE)Starting in development mode...$(NC)"
	@docker-compose -f docker-compose.yml -f docker-compose.override.yml up
