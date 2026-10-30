FRONTEND_PORT ?= 8080

.PHONY: help up down build restart logs ps test-api clean

help:
	@echo "HCMC Traffic IOC - Docker Management Commands"
	@echo "------------------------------------------------"
	@echo "  make up        : Khởi động hệ thống (PostgreSQL + FastAPI + Nginx)"
	@echo "  make build     : Build lại toàn bộ docker containers"
	@echo "  make down      : Dừng toàn bộ hệ thống"
	@echo "  make restart   : Khởi động lại hệ thống"
	@echo "  make logs      : Xem realtime logs các containers"
	@echo "  make ps        : Kiểm tra trạng thái containers"
	@echo "  make test-api  : Kiểm tra endpoint health check"
	@echo "  make clean     : Dừng và xóa toàn bộ dữ liệu volumes"

up:
	docker compose up -d

build:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

test-api:
	curl --fail --silent --show-error http://localhost:$(FRONTEND_PORT)/api/health

clean:
	docker compose down -v
