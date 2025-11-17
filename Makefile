.PHONY: help build up down logs clean test

help:
	@echo "Available commands:"
	@echo "  make build         - Build Docker images"
	@echo "  make up            - Start services"
	@echo "  make down          - Stop services"
	@echo "  make logs          - View logs"
	@echo "  make clean         - Remove containers and volumes"
	@echo "  make rebuild       - Rebuild and restart"
	@echo "  make backend-logs  - View backend logs"
	@echo "  make frontend-logs - View frontend logs"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	find . -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name dist -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name bin -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name obj -exec rm -rf {} + 2>/dev/null || true

rebuild: clean build up

backend-logs:
	docker-compose logs -f backend

frontend-logs:
	docker-compose logs -f frontend

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f
