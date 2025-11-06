#!/bin/bash

###############################################################################
# N8n Deployment Script for Google Cloud Run
# Bu script N8n'i Google Cloud Run'a deploy eder
###############################################################################

set -e

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonksiyonlar
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Gerekli değişkenleri kontrol et
check_env_vars() {
    log_info "Environment değişkenleri kontrol ediliyor..."

    local required_vars=(
        "PROJECT_ID"
        "REGION"
        "N8N_BASIC_AUTH_PASSWORD"
        "N8N_ENCRYPTION_KEY"
        "DB_PASSWORD"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "$var değişkeni tanımlanmamış!"
            exit 1
        fi
    done

    log_info "Tüm gerekli değişkenler tanımlı ✓"
}

# Varsayılan değerler
PROJECT_ID=${PROJECT_ID:-""}
REGION=${REGION:-"us-central1"}
SERVICE_NAME=${SERVICE_NAME:-"n8n-stok-yonetim"}
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Cloud SQL ayarları
DB_INSTANCE_NAME=${DB_INSTANCE_NAME:-"n8n-database"}
DB_NAME=${DB_NAME:-"n8n"}
DB_USER=${DB_USER:-"n8n_user"}
DB_PASSWORD=${DB_PASSWORD:-""}

# N8n ayarları
N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER:-"admin"}
N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD:-""}
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY:-""}

# Webhook URL
WEBHOOK_URL=${WEBHOOK_URL:-"https://${SERVICE_NAME}-${PROJECT_ID}.a.run.app"}

log_info "=========================================="
log_info "N8n Google Cloud Run Deployment"
log_info "=========================================="
log_info "Project ID: ${PROJECT_ID}"
log_info "Region: ${REGION}"
log_info "Service Name: ${SERVICE_NAME}"
log_info "=========================================="

# Environment değişkenlerini kontrol et
check_env_vars

# 1. Cloud SQL Instance oluştur (eğer yoksa)
log_info "Cloud SQL instance kontrol ediliyor..."

if ! gcloud sql instances describe ${DB_INSTANCE_NAME} --project=${PROJECT_ID} &> /dev/null; then
    log_warn "Cloud SQL instance bulunamadı, oluşturuluyor..."

    gcloud sql instances create ${DB_INSTANCE_NAME} \
        --project=${PROJECT_ID} \
        --database-version=POSTGRES_14 \
        --tier=db-f1-micro \
        --region=${REGION} \
        --storage-type=HDD \
        --storage-size=10GB \
        --network=default \
        --no-assign-ip \
        --database-flags=max_connections=100

    log_info "Cloud SQL instance oluşturuldu ✓"
else
    log_info "Cloud SQL instance mevcut ✓"
fi

# 2. Database oluştur
log_info "Database oluşturuluyor..."

gcloud sql databases create ${DB_NAME} \
    --instance=${DB_INSTANCE_NAME} \
    --project=${PROJECT_ID} || log_warn "Database zaten mevcut olabilir"

# 3. Database kullanıcısı oluştur
log_info "Database kullanıcısı oluşturuluyor..."

gcloud sql users create ${DB_USER} \
    --instance=${DB_INSTANCE_NAME} \
    --password=${DB_PASSWORD} \
    --project=${PROJECT_ID} || log_warn "Kullanıcı zaten mevcut olabilir"

# 4. Docker image build
log_info "Docker image build ediliyor..."

cd ../n8n
docker build -t ${IMAGE_NAME}:latest .

# 5. Docker image push
log_info "Docker image Google Container Registry'e push ediliyor..."

docker push ${IMAGE_NAME}:latest

log_info "Docker image push edildi ✓"

# 6. Cloud Run'a deploy
log_info "Cloud Run'a deploy ediliyor..."

gcloud run deploy ${SERVICE_NAME} \
    --project=${PROJECT_ID} \
    --image=${IMAGE_NAME}:latest \
    --platform=managed \
    --region=${REGION} \
    --allow-unauthenticated \
    --memory=1Gi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=2 \
    --timeout=300 \
    --concurrency=80 \
    --port=8080 \
    --set-env-vars="N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}" \
    --set-env-vars="N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}" \
    --set-env-vars="N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}" \
    --set-env-vars="DB_HOST=/cloudsql/${PROJECT_ID}:${REGION}:${DB_INSTANCE_NAME}" \
    --set-env-vars="DB_NAME=${DB_NAME}" \
    --set-env-vars="DB_USER=${DB_USER}" \
    --set-env-vars="DB_PASSWORD=${DB_PASSWORD}" \
    --set-env-vars="WEBHOOK_URL=${WEBHOOK_URL}" \
    --set-cloudsql-instances="${PROJECT_ID}:${REGION}:${DB_INSTANCE_NAME}"

# 7. Service URL'i al
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --project=${PROJECT_ID} \
    --region=${REGION} \
    --format='value(status.url)')

log_info "=========================================="
log_info "Deployment başarılı! ✓"
log_info "=========================================="
log_info "N8n URL: ${SERVICE_URL}"
log_info "Username: ${N8N_BASIC_AUTH_USER}"
log_info "Password: ${N8N_BASIC_AUTH_PASSWORD}"
log_info "=========================================="
log_info ""
log_info "Webhook URL'leri:"
log_info "  - Login: ${SERVICE_URL}/webhook/login"
log_info "  - Ses Kayıt: ${SERVICE_URL}/webhook/ses-kayit"
log_info "=========================================="

# URL'i clipboard'a kopyala (macOS için)
if command -v pbcopy &> /dev/null; then
    echo "${SERVICE_URL}" | pbcopy
    log_info "URL clipboard'a kopyalandı!"
fi

log_info ""
log_info "Frontend uygulamasındaki config'i güncellemeyi unutmayın:"
log_info "  N8N_WEBHOOK_URL: ${SERVICE_URL}/webhook/ses-kayit"
log_info "  LOGIN_WEBHOOK_URL: ${SERVICE_URL}/webhook/login"
