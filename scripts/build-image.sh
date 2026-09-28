#!/usr/bin/env bash

set -euo pipefail

# -----------------------------
# Defaults
# -----------------------------
IMAGE_NAME="iconickyle/user-app"
TAG="$(date +%Y%m%d%H%M)"
LATEST=false

# -----------------------------
# Functions
# -----------------------------
usage() {
    cat <<EOF

Usage:
  ./build-image.sh [options]

Options:
  --image   Docker image name
            Default: ${IMAGE_NAME}

  --tag     Image tag
            Default: ${TAG}

  --latest  Tag and push as latest
            true/false
            Default: ${LATEST}

  --help    Show this help message

Examples:

  ./build-image.sh

  ./build-image.sh \
      --image iconickyle/user-app \
      --tag v1.0.0

  ./build-image.sh \
      --image iconickyle/user-app \
      --tag v1.0.0 \
      --latest false

EOF
}

info() {
    echo "[INFO] $*"
}

success() {
    echo "[SUCCESS] $*"
}

error() {
    echo "[ERROR] $*" >&2
}

# -----------------------------
# Parse Arguments
# -----------------------------
while [[ "$#" -gt 0 ]]; do

    case "$1" in

        --image)
            IMAGE_NAME="$2"
            shift 2
            ;;

        --tag)
            TAG="$2"
            shift 2
            ;;

        --latest)
            LATEST="$2"
            shift 2
            ;;

        --help)
            usage
            exit 0
            ;;

        *)
            error "Unknown parameter: $1"
            usage
            exit 1
            ;;

    esac

done

# -----------------------------
# Validation
# -----------------------------
if [[ -z "${IMAGE_NAME}" ]]; then
    error "IMAGE_NAME is required"
    exit 1
fi

if [[ -z "${TAG}" ]]; then
    error "TAG is required"
    exit 1
fi

if [[ "${LATEST}" != "true" && "${LATEST}" != "false" ]]; then
    error "--latest must be either true or false"
    exit 1
fi

# -----------------------------
# Check Docker
# -----------------------------
if ! command -v docker >/dev/null 2>&1; then
    error "Docker is not installed or not available in PATH."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    error "Docker is not running or is not accessible."
    exit 1
fi

# -----------------------------
# Configuration
# -----------------------------
echo
echo "============================================================"
echo "                  Docker Image Build"
echo "============================================================"
echo
echo "Image:  ${IMAGE_NAME}"
echo "Tag:    ${TAG}"
echo "Latest: ${LATEST}"
echo

# -----------------------------
# Build
# -----------------------------
info "Building image..."

docker build \
    -t "${IMAGE_NAME}:${TAG}" \
    .

success "Image built: ${IMAGE_NAME}:${TAG}"

# -----------------------------
# Tag latest
# -----------------------------
if [[ "${LATEST}" == "true" ]]; then

    info "Tagging image as latest..."

    docker tag \
        "${IMAGE_NAME}:${TAG}" \
        "${IMAGE_NAME}:latest"

    success "Tagged: ${IMAGE_NAME}:latest"

fi

# -----------------------------
# Docker Hub Login
# -----------------------------
info "Checking Docker Hub authentication..."

if ! docker push "${IMAGE_NAME}:${TAG}" >/dev/null 2>&1; then

    info "Docker push failed. Docker authentication may be required."

    docker login

    info "Retrying push..."

    docker push "${IMAGE_NAME}:${TAG}"

else

    success "Docker Hub authentication is valid."

fi

# -----------------------------
# Push latest
# -----------------------------
if [[ "${LATEST}" == "true" ]]; then

    info "Pushing ${IMAGE_NAME}:latest..."

    docker push "${IMAGE_NAME}:latest"

    success "Pushed ${IMAGE_NAME}:latest"

fi

# -----------------------------
# Complete
# -----------------------------
echo
echo "============================================================"
echo "                    Build Complete"
echo "============================================================"
echo
echo "Pushed images:"
echo "  ${IMAGE_NAME}:${TAG}"

if [[ "${LATEST}" == "true" ]]; then
    echo "  ${IMAGE_NAME}:latest"
fi

echo