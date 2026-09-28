# Node.js User Application

A simple Node.js web application built with **Express** and **MongoDB**.

The application provides a basic user management and authentication workflow and serves the web interface directly from the Express application.

## Application Stack

* **Node.js** — application runtime
* **Express** — web framework
* **MongoDB** — application database
* **Mongoose** — MongoDB object modelling
* **JWT** — authentication
* **bcrypt** — password hashing
* **HTML/CSS/JavaScript** — web interface

## Repository Structure

```text
.
├── Dockerfile
├── package.json
├── package-lock.json
├── index.js
├── db.js
├── middleware/
├── models/
├── routes/
├── public/
└── scripts/
    └── build-image.sh
```

### Application

`index.js` is the application entry point. It starts the Express server, connects to MongoDB and exposes the application routes.

```text
/auth/*
/users/*
```

The static web interface is served from the `public/` directory.

### Database

`db.js` handles the MongoDB connection using the `MONGO_URI` environment variable.

MongoDB configuration is provided through environment variables rather than being hard-coded into the application.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

The application listens on the port defined by `PORT`.

For local development, environment-specific configuration can be supplied through a `.env` file.

## Docker Image

The application is containerized using the `Dockerfile`.

The `scripts/build-image.sh` script builds and pushes the application image to Docker Hub.

Example:

```bash
./scripts/build-image.sh \
    --image <dockerhub-username>/user-app \
    --tag v1.0.0
```

The script:

1. Builds the image using the `Dockerfile`
2. Tags the image
3. Authenticates with Docker Hub when required
4. Pushes the image to the configured repository

The resulting image is used by the Kubernetes deployment.

## Deployment

The Kubernetes deployment is maintained separately in the:

**argocd-k8s repository**

The deployment repository contains the Kubernetes manifests and Argo CD configuration used to deploy this application.

When a new application image is released:

```text
Application source
       │
       │ build-image.sh
       ▼
Docker Hub
       │
       │ new image tag
       ▼
argocd-k8s
       │
       │ update image reference
       ▼
Argo CD
       │
       ▼
Kubernetes
```

After building and pushing a new image, update the image reference in the application Deployment manifest in the `argocd-k8s` repository.

For example:

```yaml
image: <dockerhub-username>/user-app:v1.1.0
```

Commit and push the change to the deployment repository. Argo CD will detect the Git change and reconcile the Kubernetes deployment.

## Development Docker Compose

Docker Compose files are included for local application development and testing:

```text
docker-compose.yaml
docker-compose-dev.yaml
```

The production-style Kubernetes deployment is maintained separately in the `argocd-k8s` repository.