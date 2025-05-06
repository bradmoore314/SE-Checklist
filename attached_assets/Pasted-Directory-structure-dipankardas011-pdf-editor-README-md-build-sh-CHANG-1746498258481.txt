Directory structure:
└── dipankardas011-pdf-editor/
    ├── README.md
    ├── build.sh
    ├── CHANGELOG.md
    ├── code-of-conduct.md
    ├── CONTRIBUTING.md
    ├── cosign.key
    ├── cosign.pub
    ├── deployer.sh
    ├── docker-compose.yml
    ├── Jenkinsfile
    ├── LICENSE
    ├── Makefile
    ├── okteto-prod.yml
    ├── okteto.yml
    ├── pdf.app.yaml
    ├── .gitpod.yml
    ├── .stignore
    ├── deploy/
    │   ├── blue-green/
    │   │   └── readme.md
    │   ├── canary/
    │   │   └── readme.md
    │   ├── cluster/
    │   │   ├── README.md
    │   │   ├── argoCD.yaml
    │   │   ├── artifact/
    │   │   │   ├── index.yaml
    │   │   │   ├── pdf-editor-helm-0.8.0.tgz
    │   │   │   └── pdf-editor-helm-1.0.0.tgz
    │   │   ├── backend/
    │   │   │   ├── deploy-pdf.yml
    │   │   │   ├── kustomization.yml
    │   │   │   ├── pv.yml
    │   │   │   └── svc.yml
    │   │   ├── cilium/
    │   │   │   ├── backend-merge.yml
    │   │   │   ├── backend-rotate.yml
    │   │   │   └── frontend.yml
    │   │   ├── frontend/
    │   │   │   ├── deploy-pdf.yml
    │   │   │   ├── kustomization.yml
    │   │   │   └── svc.yml
    │   │   ├── monitoring/
    │   │   │   ├── jaeger-deploy.yml
    │   │   │   ├── service-monitor.yml
    │   │   │   └── AddditionalInfo/
    │   │   │       ├── grafana-deply.txt
    │   │   │       ├── HTTP Responses-1665425652148.json
    │   │   │       ├── metrics-server.txt
    │   │   │       ├── prometheus-deploy.txt
    │   │   │       └── System Usage-1665427430720.json
    │   │   ├── okteto/
    │   │   │   ├── deploy-pdf-frontend.yml
    │   │   │   ├── deploy-pdf.yml
    │   │   │   ├── jaeger-deploy copy.yml
    │   │   │   ├── svc copy.yml
    │   │   │   ├── svc.yml
    │   │   │   └── .monokle
    │   │   └── pdf-editor-helm/
    │   │       ├── README.md
    │   │       ├── Chart.yaml
    │   │       ├── values.yaml
    │   │       ├── .helmignore
    │   │       └── templates/
    │   │           ├── deployment.yaml
    │   │           ├── namespace.yml
    │   │           ├── service.yaml
    │   │           └── tracing.yml
    │   ├── IAC/
    │   │   ├── ansible-terraform/
    │   │   │   ├── readme.md
    │   │   │   ├── ansible-script.sh
    │   │   │   ├── docker-compose.yml
    │   │   │   ├── ec2-cfg-update.yml
    │   │   │   ├── ec2-cfg.yml
    │   │   │   ├── main.tf
    │   │   │   └── .gitignore
    │   │   └── AWS-old/
    │   │       ├── main.tf
    │   │       └── terraform.tfvars
    │   ├── Jenkins/
    │   │   ├── docker-compose.yml
    │   │   ├── dockerfile
    │   │   └── ec2-user.sh
    │   ├── litmus-chaos/
    │   │   ├── backend-merge-delete.yaml
    │   │   ├── backend-rotate-pod-delete.yaml
    │   │   ├── frontend-pod-chaos.yaml
    │   │   └── frontend-pod-delete.yaml
    │   ├── Logging/
    │   │   ├── deploy.yml
    │   │   ├── fluentd.yaml.bk
    │   │   └── notes.md
    │   ├── okteto-prod/
    │   │   └── manifests.yaml
    │   ├── policy/
    │   │   ├── disallow-hostPath.yml
    │   │   ├── label-pods.yml
    │   │   ├── limits-pod.yml
    │   │   ├── nginx-ingress.yml
    │   │   ├── run-as-non-root.yml
    │   │   └── security-pods.yml
    │   ├── rollouts/
    │   │   ├── backend-preview-svc.yml
    │   │   ├── deploy-backend.yml
    │   │   ├── deploy-frontend.yml
    │   │   ├── frontend-preview-svc.yml
    │   │   └── hpa.text
    │   └── tekton-ci/
    │       ├── pipeline-runner.yml
    │       ├── pipeline.yml
    │       ├── task-back.yml
    │       └── task-front.yml
    ├── EC2-server(old)/
    │   ├── changes.md
    │   ├── EC2-new.sh
    │   ├── EC2-old.sh
    │   ├── pdf-editor.service
    │   └── setup.sh
    ├── src/
    │   ├── readme.md
    │   ├── docker-compose.yml
    │   ├── skaffold.yaml
    │   ├── backend/
    │   │   ├── README.md
    │   │   ├── merger/
    │   │   │   ├── Dockerfile
    │   │   │   ├── file.go
    │   │   │   ├── go.mod
    │   │   │   ├── go.sum
    │   │   │   ├── main.go
    │   │   │   ├── main_test.go
    │   │   │   ├── .dockerignore
    │   │   │   └── templates/
    │   │   │       └── upload.html
    │   │   └── rotator/
    │   │       ├── Dockerfile
    │   │       ├── file.go
    │   │       ├── go.mod
    │   │       ├── go.sum
    │   │       ├── main.go
    │   │       ├── main_test.go
    │   │       ├── .dockerignore
    │   │       └── templates/
    │   │           └── upload.html
    │   ├── dev-manifests/
    │   │   ├── backend/
    │   │   │   ├── deploy-pdf.yml
    │   │   │   └── svc.yml
    │   │   └── frontend/
    │   │       ├── deploy-pdf.yml
    │   │       └── svc.yml
    │   └── frontend/
    │       ├── About.html
    │       ├── Dockerfile
    │       ├── index-merge.html
    │       ├── index-rotate.html
    │       ├── index.html
    │       ├── package.json
    │       ├── server.js
    │       ├── .dockerignore
    │       ├── __tests__/
    │       │   └── simple.js
    │       └── resources/
    ├── test/
    │   ├── integration/
    │   │   ├── test-merger.sh
    │   │   └── resources/
    │   │       ├── 01.txt
    │   │       └── 02.txt
    │   └── unit/
    │       └── unit-tester.sh
    ├── .circleci/
    │   └── config.yml
    └── .github/
        ├── dependabot.yml
        ├── FUNDING.yml
        ├── pull_request_template.md
        ├── settings.yml
        ├── ISSUE_TEMPLATE/
        │   ├── bug.yml
        │   └── Feature.yml
        └── workflows/
            ├── CD-backend-merge.yaml
            ├── CD-backend-rotate.yaml
            ├── CD-frontend.yaml
            ├── CI-kubescape.yml
            ├── CI-PR.yaml
            ├── CI.yaml
            ├── codeql-analysis.yml
            ├── Datree-CD.yaml
            ├── imageScan.yaml
            └── terraform.yml


Files Content:

(Files content cropped to 300k characters, download full ingest to see more)
================================================
FILE: README.md
================================================
# Web-based PDF Editor 🥳

Website that can edit PDF's to give you a Merged or a Rotated version of it

[![Golang and Docker CI](https://github.com/dipankardas011/PDF-Editor/actions/workflows/CI.yaml/badge.svg?branch=main)](https://github.com/dipankardas011/PDF-Editor/actions/workflows/CI.yaml) [![pages-build-deployment](https://github.com/dipankardas011/PDF-Editor/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/dipankardas011/PDF-Editor/actions/workflows/pages/pages-build-deployment) [![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/pdf-editor-web)](https://artifacthub.io/packages/search?repo=pdf-editor-web) [![CodeQL](https://github.com/dipankardas011/PDF-Editor/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/dipankardas011/PDF-Editor/actions/workflows/codeql-analysis.yml) [![\[Stable\](Backend-merger) Docker Signed Image Release](https://github.com/dipankardas011/PDF-Editor/actions/workflows/CD-backend-merge.yaml/badge.svg)](https://github.com/dipankardas011/PDF-Editor/actions/workflows/CD-backend-merge.yaml) [![\[Stable\](Backend-rotate) Docker Signed Image Release](https://github.com/dipankardas011/PDF-Editor/actions/workflows/CD-backend-rotate.yaml/badge.svg)](https://github.com/dipankardas011/PDF-Editor/actions/workflows/CD-backend-rotate.yaml) [![\[Stable\](Frontend) Stable Docker Signed Image Release](https://github.com/dipankardas011/PDF-Editor/actions/workflows/CD-frontend.yaml/badge.svg)](https://github.com/dipankardas011/PDF-Editor/actions/workflows/CD-frontend.yaml) [![Datree-policy-Checks](https://github.com/dipankardas011/PDF-Editor/actions/workflows/Datree-CD.yaml/badge.svg?branch=main)](https://github.com/dipankardas011/PDF-Editor/actions/workflows/Datree-CD.yaml) [![ImageScan [Aqua Trivy]](https://github.com/dipankardas011/PDF-Editor/actions/workflows/imageScan.yaml/badge.svg)](https://github.com/dipankardas011/PDF-Editor/actions/workflows/imageScan.yaml) [![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/dipankardas011/PDF-Editor)[![CircleCI](https://dl.circleci.com/status-badge/img/gh/dipankardas011/PDF-Editor/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/dipankardas011/PDF-Editor/tree/main)

> **Note**
> it's no longer being maintained

## Software Requirement Specification

[Link for entire Documentation about this project](https://docs.google.com/document/d/e/2PACX-1vQvfAZFG0Tw9MAXtXXXDDGFZ6967Iz9CK1rTE9Gl-cR8fKF268qoggKPIUhKGD3fWszGFEUfwoKYC9D/pub)

[Project Board For Current Status](https://github.com/users/dipankardas011/projects/2/views/1)

~Jenkins server -> [URL](http://ec2-XX-XX-XX-XX.compute-1.amazonaws.com:8080/)~
> **Note**

> User: `guest`
> Pass: `77777`

> (Available till 15th Sep '22) Due to 💰 had to stop the instance

Stage | Tags | Links | Status
--|--|--|--
Production | `1.0` | (Azure Web-Apps) https://pdf-web-editor.azurewebsites.net/, (Okteto) https://frontend-lb-dipankardas011.cloud.okteto.net/ | ✅
Alpha | `latest` ; `1.0` | ~http://44.209.39.161/~ | ✅

> A Humble request! 🙏 don't expoit the resources I have used here

> Release Cycle of ~1 Month

### Tech Stack
* GO
* Docker & Docker-Compose
* HTML
* K8s
* Helm
* ArgoCD
* Terraform
* Flux
* Prometheus

# Website
![](./coverpage.png)


# How to Run

## Kustomize install
```bash
kubectl apply -k deploy/cluster/backend
kubectl apply -k deploy/cluster/frontend
```

---


## Helm plugin

### Usage


```bash
kubectl create ns pdf
helm repo add pdf-editor-web https://dipankardas011.github.io/PDF-Editor/
helm install my-pdf-editor-helm pdf-editor-web/pdf-editor-helm --version 0.1.0
```
To uninstall the chart:

    helm delete my-pdf-editor-helm

---

## From Source Code
```bash
cd deploy/cluster/
kubectl create ns pdf
helm install <Release Name> ./pdf-editor-helm
helm uninstall <Release Name> ./pdf-editor-helm
```

---

## ArgoRollouts
```
# using Argo-CD to deploy
deploy the path deploy/rollouts
With namespace set to pdf-editor-ns
```

# How to Run

```bash
make run
```

# How to Dev

```bash
cd src/
skaffold dev
```

# How to Test

```bash
# Integration testing
make unit-test
# Integration testing
make integration-test
```


# To View the page visit

```url
http://localhost
```

# Production Cluster (demo)

<h3>Civo Dashboard</h3>

![image](https://user-images.githubusercontent.com/65275144/199149205-3c34da17-6b68-46ec-b2ce-737d09dc132c.png)

<h3>Youtube Video</h3>
    
[![IMAGE ALT TEXT](http://img.youtube.com/vi/bstJHtv0L_s/0.jpg)](http://www.youtube.com/watch?v=bstJHtv0L_s "Video Title")


# Blog Post on this project
[![](./coverpage.png)](https://blog.kubesimplify.com/about-my-pdf-editor-project)


# Decission Tree

# Trace
![](./trace.png)

## Frontend -> Backend-Merger
```mermaid
flowchart LR;
    XX[START]:::white--/merger-->web{Website};
    web{Website}-->B{Upload PDF1};
    web{Website}-->C{Upload PDF2};
    DD{Download Link}-->web{Website};

    classDef green color:#022e1f,fill:#00f500;
    classDef red color:#022e1f,fill:#f11111;
    classDef white color:#022e1f,fill:#fff;
    classDef black color:#fff,fill:#000;
    classDef BLUE color:#fff,fill:#00f;

    B--Upload PDF-1-->S[GO Server]:::green;
    C--Upload PDF-2-->S[GO Server]:::green;

    S[GO server]-->DD{Merged PDF available}
    web--/merger/download-->dd{Download};
    dd--->YY[END]:::BLUE;
```

## Frontend -> Backend-Rotator
```mermaid
flowchart LR;
    XX[START]:::white--/rotator-->web{Website};
    web{Website}-->B{Upload PDF};
    web{Website}-->C{Additional Parameters};
    DD{Download Link}-->web{Website};

    classDef green color:#022e1f,fill:#00f500;
    classDef red color:#022e1f,fill:#f11111;
    classDef white color:#022e1f,fill:#fff;
    classDef black color:#fff,fill:#000;
    classDef BLUE color:#fff,fill:#00f;

    B--Upload PDF-->S[GO Server]:::green;
    C--upload Params-->S[GO Server]:::green;

    S[GO server]-->DD{Rotated PDF available}
    web--/rotator/download-->dd{Download};
    dd--->YY[END]:::BLUE;

```

[**Changelog link**](./CHANGELOG.md)

[**Code Of Conduct**](./code-of-conduct.md)

[**Contributing Guidelines**](./CONTRIBUTING.md)

Happy Coding 👍🏼🥳


<a href = "https://github.com/dipankardas011/PDF-Editor/graphs/contributors"><img src = "https://contrib.rocks/image?repo=dipankardas011/PDF-Editor"/></a>

Made with [contributors-img](https://contrib.rocks).



================================================
FILE: build.sh
================================================
#!/bin/sh

BACKEND_MERGE='dipugodocker/pdf-editor:backend-merge'
BACKEND_ROTATE='dipugodocker/pdf-editor:backend-rotate'
FRONTEND='dipugodocker/pdf-editor:frontend'

# building the docker images
backend_docker_build_dev() {
  echo '[🙂] Building for Devlopment [Backend-merger]'
  cd src/backend/merger && docker build --target dev -t $BACKEND_MERGE .
  echo '[🙂] Building for Devlopment [Backend-rotator]'
  cd ../rotator && docker build --target dev -t $BACKEND_ROTATE .
}

frontend_docker_build_dev() {
  echo '[🙂] Building Dev [Frontend]'
  cd ../../frontend && docker build --target dev -t $FRONTEND .
}


# building the docker images
backend_docker_build_prod() {
  echo '[🏭] Building for Production [Backend-merger]'
  cd src/backend/merger && docker build --target prod -t $BACKEND_MERGE . --no-cache
  echo '[🏭] Building for Production [Backend-rotator]'
  cd ../rotator && docker build --target prod -t $BACKEND_ROTATE . --no-cache
}

frontend_docker_build_prod() {
  echo '[🏭] Building Prod [Frontend]'
  cd ../../frontend && docker build --target prod -t $FRONTEND . --no-cache
}

# building the docker images
backend_docker_build_test() {
  echo '[🧪] Building for Testing [Backend-merger]'
  cd src/backend/merger && docker build --target test -t $BACKEND_MERGE . --no-cache
  echo '[🧪] Building for Testing [Backend-rotator]'
  cd ../rotator && docker build --target test -t $BACKEND_ROTATE . --no-cache
}

frontend_docker_build_test() {
  echo '[🧪] Building Test [Frontend]'
  cd ../../frontend && docker build --target test -t $FRONTEND . --no-cache
}


# echo 'Enter 0 for prod, 1 for dev, 2 for test'

# read choice

if [ $# != 1 ]; then
  echo -n "
Help [1 argument required]
0 Production
1 Development
2 Testing
"
  exit 1
fi

choice=$1

if [ $choice -eq 0 ]
then
  backend_docker_build_prod
  frontend_docker_build_prod
elif [ $choice -eq 1 ]
then
  backend_docker_build_dev
  frontend_docker_build_dev
elif [ $choice -eq 2 ]
then
  backend_docker_build_test
  frontend_docker_build_test
else
  echo 'Invalid request'
  return 1
fi

echo 'docker container ps'

docker images | grep pdf-editor | head -n4



================================================
FILE: CHANGELOG.md
================================================
# CHANGELOG

## Version 1.0
* Improved the Observability stack (Metrics and traces)
* CiliumNetworkPolicy
* Addition of Skaffold for faster development
* Removed the backend/db
* removed DEPRICATED parts

## Version 0.8
* New UX
* Removed the need for the clear button
* One Click merge and download
* added feature Rotate PDF
* some minor fixes
  * K8s manifests
  * argo rollouts
  * ansible configs
  * testing

## Version 0.6 & 0.7
* New UI
* Microservice Architecture
  * backend server
  * frontend server
* Metrics
* Docker compose

## Version 0.5
* AWS EC2 deploy method using Terraform
* Helm plugin
* preview of the web app during PR
* Argo-CD deploy file

## Version 0.1
* First Version is Deployed 🥳
* Ability to merge 2 PDFs
* Merged PDF is Downloadable



================================================
FILE: code-of-conduct.md
================================================
# Standards to follow
- Demonstrating empathy and kindness toward other people
- Being respectful of differing opinions, viewpoints, and experiences
- Giving and gracefully accepting constructive feedback
- Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience
- Focusing on what is best not just for us as individuals, but for the overall community


================================================
FILE: CONTRIBUTING.md
================================================
# Contributing
Welcome to PDF-Editor!

## GuideLines
- For PR title and commit message heading
```none
Title should be:
[--Topic-- Example: Test or Code or Documentation or ..](--SubTopic-- Example: backend or frontend or unit or integration) PRs title
```

- PR Approval is required from `@dipankardas011`


================================================
FILE: cosign.key
================================================
-----BEGIN ENCRYPTED COSIGN PRIVATE KEY-----
eyJrZGYiOnsibmFtZSI6InNjcnlwdCIsInBhcmFtcyI6eyJOIjozMjc2OCwiciI6
OCwicCI6MX0sInNhbHQiOiJYK3Y0cERKOC81SDVHRkpFN1lYTW00dzUrWlVOdUFs
YXplOVlWOUtrbkJZPSJ9LCJjaXBoZXIiOnsibmFtZSI6Im5hY2wvc2VjcmV0Ym94
Iiwibm9uY2UiOiJoSWl4THpndG9iOEFaakhxVGZPTDN2U2M4cU5pYmJhciJ9LCJj
aXBoZXJ0ZXh0IjoidDB5aFFCclpocXBYWXVNS3ZNa1dKRjJDSTVZbFlDUWo3eHpX
UUNQdUpuRDFEWjFIbCtJRnh0czdDQmxFZmdlWWNqdVZoRklYb0xOY1hCTzlJck9G
bTliSkpYSFVDdzBFcm5Zdkp1MyswUnprMFdLdmVJVCs3YktrWVc5cHpwQlZvVjhs
aEthS2NidHArRDVSTzlpTDh1bXppZy9nbi94MnNyOGVCQ3ExL0ZYS1hzaHhJK1ZO
dVJGQlBoYWVVZk5wTkxLRk1LdHBwM1V3TFE9PSJ9
-----END ENCRYPTED COSIGN PRIVATE KEY-----



================================================
FILE: cosign.pub
================================================
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEz+W+rrK0d+a55NSZsiyFCz85JFWG
aj+Ll8hdvsQ8SCvkoDFDDRPKlCrwU56oX+pu8X+Ug2JPJ5Lo78ZZ8qtrMA==
-----END PUBLIC KEY-----



================================================
FILE: deployer.sh
================================================
#!/bin/bash
kubectl apply -k deploy/cluster/backend
kubectl apply -k deploy/cluster/frontend
kubectl apply -f deploy/cluster/monitoring/prometheus-deploy.yml

helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update
helm install kyverno kyverno/kyverno --namespace kyverno --create-namespace

kubectl apply -f deploy/policy


================================================
FILE: docker-compose.yml
================================================
version: '3'

volumes:
  app_data_M:
  app_data_R:

networks:
  pdf-editor:
services:
  backend-merge:
    image: docker.io/dipugodocker/pdf-editor:1.0-backend-merge
    container_name: backend-merge
    ports:
      - "8080"
    networks:
      - pdf-editor
    volumes:
      - app_data_M:/go/src

  backend-rotate:
    image: docker.io/dipugodocker/pdf-editor:1.0-backend-rotate
    container_name: backend-rotate
    ports:
      - "8081"
    volumes:
      - app_data_R:/go/src
    networks:
      - pdf-editor

  frontend:
    depends_on:
      - backend-merge
      - backend-rotate
    image: docker.io/dipugodocker/pdf-editor:1.0-frontend
    container_name: frontend
    ports:
      - "80:80"
    networks:
      - pdf-editor

  trace:
    depends_on:
      - frontend
    image: jaegertracing/all-in-one
    container_name: jaeger-tracing-pdf
    ports:
    - "6831"
    - "6832"
    - "5778"
    - "16686:16686"
    - "4317"
    - "4318"
    - "14250"
    - "14268"
    - "14269"
    - "9411"
    networks:
      - pdf-editor



================================================
FILE: Jenkinsfile
================================================
pipeline {
  agent any
  tools {
    // gradle 'gradle'
    'org.jenkinsci.plugins.docker.commons.tools.DockerTool' 'docker-latest'
  }
  stages {
    stage('Git-Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/dipankardas011/PDF-Editor.git'
      }
    }

    stage('Build') {
      steps{
        sh '''
          cd src/backend/merger
          docker build --target test -t hello-backendM .
          cd ../rotator
          docker build --target test -t hello-backendR .
          cd ../../frontend/
          docker build --target test -t hello-frontend .
        '''
      }
    }

    stage('Test') {
      steps {
        sh '''
          echo "Backend testing"
          docker run --rm hello-backendM
          echo "Rotator testing"
          docker run --rm hello-backendR
          echo "Frontend testing"
          docker run --rm hello-frontend
        '''
      }
    }
  }

  post {
    always {
      sh '''
        docker rmi -f hello-backendM
        docker rmi -f hello-backendR
        docker rmi -f hello-frontend
        echo "Done cLEAniNg"
      '''
    }
  }
}



================================================
FILE: LICENSE
================================================
MIT License

Copyright (c) 2022 Dipankar Das

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



================================================
FILE: Makefile
================================================
testing:
	cd test/unit && \
	chmod 700 backend.sh && \
	./backend.sh

build:
	chmod +x build.sh && \
	./build.sh 0

run: build
	cd deploy/IAC/ansible-terraform/ && \
	sudo docker compose up -d
	docker ps

clean:
	cd deploy/IAC/ansible-terraform/ && \
	sudo docker compose down
	docker ps
	docker volume rm ansible-terraform_app_data_M
	docker volume rm ansible-terraform_app_data_R

unit-test:
	cd test/unit && \
	chmod +x ./unit-tester.sh && \
	./unit-tester.sh

integration-test:
	cd test/integration && \
	chmod +x test-merger.sh && \
	./test-merger.sh

local-deploy-no-cd:
	kubectl cluster-info
	kubectl create ns monitoring
	kubectl create ns pdf-editor-ns
	helm install prom prometheus-community/kube-prometheus-stack -n monitoring
	cd deploy/cluster && \
		kubectl create -k backend && \
		kubectl create -k frontend && \
		kubectl create -f monitoring
	helm upgrade --install loki-stack grafana/loki-stack --set fluent-bit.enabled=true,promtail.enabled=false -n monitoring
	echo "\nLoki URL for grafana datasource addition: http://loki-stack-headless:3100\nPrometheus URL for grafana datasource addition: http://prom-kube-prometheus-stack-prometheus:9090\nJaeger URL for grafana datasource addition: http://trace.pdf-editor-ns:16686"

local-uninstall-no-cd:
	kubectl cluster-info
	cd deploy/cluster && \
		kubectl delete -k backend && \
		kubectl delete -k frontend && \
		kubectl delete -f monitoring
	helm uninstall prom -n monitoring
	helm uninstall loki-stack -n monitoring
	kubectl delete ns monitoring
	kubectl delete ns pdf-editor-ns


publish:
	docker push dipugodocker/pdf-editor:frontend
	docker push dipugodocker/pdf-editor:backend-merge
	docker push dipugodocker/pdf-editor:backend-rotate
	docker push dipugodocker/pdf-editor:backend-db

push_docker:
	docker push dipugodocker/pdf-editor:0.8-frontend
	docker push dipugodocker/pdf-editor:0.8-backend



================================================
FILE: okteto-prod.yml
================================================
name: pdf-editor-prod

# The build section defines how to build the images of your development environment
# More info: https://www.okteto.com/docs/reference/manifest/#build
# build:

#   # You can use the following env vars to refer to this image in your deploy commands:
#   #  - OKTETO_BUILD_BACKEND_REGISTRY: image registry
#   #  - OKTETO_BUILD_BACKEND_REPOSITORY: image repo
#   #  - OKTETO_BUILD_BACKEND_IMAGE: image name
#   #  - OKTETO_BUILD_BACKEND_TAG: image tag
#   backEnd:
#     context: backEnd
#     dockerfile: backEnd/Dockerfile

# The deploy section defines how to deploy your development environment
# More info: https://www.okteto.com/docs/reference/manifest/#deploy
deploy:
  commands:
  - name: Deploy
    command: kubectl apply -f deploy/okteto-prod

# The dependencies section defines other git repositories to be deployed as part of your development environment
# More info: https://www.okteto.com/docs/reference/manifest/#dependencies
# dependencies:
#   - https://github.com/okteto/sample


# The dev section defines how to activate a development container
# More info: https://www.okteto.com/docs/reference/manifest/#dev
#dev:
#  merge-pdf:
#    image: okteto/golang:1
#    command: bash
#    securityContext:
#      capabilities:
#        add:
#          - SYS_PTRACE
#    sync:
#      - .:/usr/src/app
#    forward:
#      - 2345:2345
#      - 8080:8080
#    autocreate: true
#    volumes:
#      - /go/pkg/
#      - /root/.cache/go-build/




================================================
FILE: okteto.yml
================================================
name: pdf-editor

# The build section defines how to build the images of your development environment
# More info: https://www.okteto.com/docs/reference/manifest/#build
# build:

#   # You can use the following env vars to refer to this image in your deploy commands:
#   #  - OKTETO_BUILD_BACKEND_REGISTRY: image registry
#   #  - OKTETO_BUILD_BACKEND_REPOSITORY: image repo
#   #  - OKTETO_BUILD_BACKEND_IMAGE: image name
#   #  - OKTETO_BUILD_BACKEND_TAG: image tag
#   backEnd:
#     context: backEnd
#     dockerfile: backEnd/Dockerfile

# The deploy section defines how to deploy your development environment
# More info: https://www.okteto.com/docs/reference/manifest/#deploy
deploy:
  commands:
  - name: Deploy
    command: kubectl apply -f deploy/cluster/okteto

# The dependencies section defines other git repositories to be deployed as part of your development environment
# More info: https://www.okteto.com/docs/reference/manifest/#dependencies
# dependencies:
#   - https://github.com/okteto/sample


# The dev section defines how to activate a development container
# More info: https://www.okteto.com/docs/reference/manifest/#dev
dev:
  merge-pdf:
    image: okteto/golang:1
    command: bash
    securityContext:
      capabilities:
        add:
          - SYS_PTRACE
    sync:
      - .:/usr/src/app
    forward:
      - 2345:2345
      - 8080:8080
    autocreate: true
    volumes:
      - /go/pkg/
      - /root/.cache/go-build/




================================================
FILE: pdf.app.yaml
================================================
---
apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: napptive-sc
spec:
  components:
    - name: napptive-sc
      type: k8s-objects # Set to k8s-objects
      properties:
        objects:
          - apiVersion: v1
            kind: Secret
            metadata:
              name: napptive-sc
            data:
              url: SGkg8J+YiQ==

---
apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: pdf-editor
spec:
  components:
    - name: frontend
      type: webservice
      properties:
        image: docker.io/dipugodocker/pdf-editor:1.0-frontend
        ports:
          - port: 80
            expose: true
      traits:
        - type: resource # Set to resource
          properties:
            requests: # (Optional) Specify resources in requests
              cpu: 0.05 # (Optional) Specify the amount of cpu for requests. 1 by default
              memory: "10Mi" # (Optional) Specify the amount of memory for requests. 2048Mi by default
            limits: # (Optional) Specify resources in limits
              cpu: 0.25 # (Optional) Specify the amount of cpu for limits. 1 by default
              memory: "200Mi" # (Optional) Specify the amount of memory for limits. 2048Mi by default
        - type: napptive-ingress
          properties:
            port: 80
            path: /

  workflow:
    steps:
      - name: apply-frontend
        # Apply all the traits and the components in an application
        type: apply-application # Set to apply-application 
        # No arguments required
      - name: slack-message
        type: notification
        properties:
          slack: # set to slack  
            # the Slack webhook address, please refer to: https://api.slack.com/messaging/webhooks
            url:
              # url can either specify in value or secretRef
              value: "https://hooks.slack.com/services/AAABBBCdcddcde" # (Optional) slack url
              secretRef: # (Optional) slack url in a secret
                name: napptive-sc # (Required) secret name
                key: url # (Required) secret key
            message: # (Required) message to send
              text: Hello from frontend!! # (Optional) text
---
apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: backend-merge
spec:
  components:
    - name: backend-merge
      type: webservice
      properties:
        image: docker.io/dipugodocker/pdf-editor:1.0-backend-merge
        ports:
          - port: 8080
            expose: true
      traits:
        - type: resource # Set to resource
          properties:
            requests: # (Optional) Specify resources in requests
              cpu: 0.1 # (Optional) Specify the amount of cpu for requests. 1 by default
              memory: "50Mi" # (Optional) Specify the amount of memory for requests. 2048Mi by default
            limits: # (Optional) Specify resources in limits
              cpu: 0.25 # (Optional) Specify the amount of cpu for limits. 1 by default
              memory: "200Mi" # (Optional) Specify the amount of memory for limits. 2048Mi by default
        - type: init-container
          properties:
            name: backend-merge-init
            image: docker.io/dipugodocker/pdf-editor:1.0-backend-merge
            cmd: ["cp", "-vR", ".", "/mnt"] # (Optional) commands run in the init container
            mountName: "empty-vol-rotate" # (Required) mount name of shared volume. workdir by default
            appMountPath:  "/go/src/" # (Required) mount path of app container
            initMountPath: "/mnt" # (Required) mount path of init container

  workflow:
    steps:
      - name: apply-backend-merge
        # Apply all the traits and the components in an application
        type: apply-application # Set to apply-application 
        # No arguments required
      - name: slack-message
        type: notification
        properties:
          slack: # set to slack  
            # the Slack webhook address, please refer to: https://api.slack.com/messaging/webhooks
            url:
              # url can either specify in value or secretRef
              value: "https://hooks.slack.com/services/AAABBBCdcddcde" # (Optional) slack url
              secretRef: # (Optional) slack url in a secret
                name: napptive-sc # (Required) secret name
                key: url # (Required) secret key
            message: # (Required) message to send
              text: Hello from backend-merger!! # (Optional) text

---
apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: backend-rotate
spec:
  components:
    - name: backend-rotate
      type: webservice
      properties:
        image: docker.io/dipugodocker/pdf-editor:1.0-backend-rotate
        ports:
          - port: 8081
            expose: true
      traits:
        - type: resource # Set to resource
          properties:
            requests: # (Optional) Specify resources in requests
              cpu: 0.1 # (Optional) Specify the amount of cpu for requests. 1 by default
              memory: "50Mi" # (Optional) Specify the amount of memory for requests. 2048Mi by default
            limits: # (Optional) Specify resources in limits
              cpu: 0.25 # (Optional) Specify the amount of cpu for limits. 1 by default
              memory: "200Mi" # (Optional) Specify the amount of memory for limits. 2048Mi by default
        - type: init-container
          properties:
            name: backend-merge-init
            image: docker.io/dipugodocker/pdf-editor:1.0-backend-rotate
            cmd: ["cp", "-vR", ".", "/mnt"] # (Optional) commands run in the init container
            mountName: "empty-vol-rotate" # (Required) mount name of shared volume. workdir by default
            appMountPath:  "/go/src/" # (Required) mount path of app container
            initMountPath: "/mnt" # (Required) mount path of init container
  workflow:
    steps:
      - name: apply-backend-rotate
        # Apply all the traits and the components in an application
        type: apply-application # Set to apply-application 
        # No arguments required
      - name: slack-message
        type: notification
        properties:
          slack: # set to slack  
            # the Slack webhook address, please refer to: https://api.slack.com/messaging/webhooks
            url:
              # url can either specify in value or secretRef
              value: "https://hooks.slack.com/services/AAABBBCdcddcde" # (Optional) slack url
              secretRef: # (Optional) slack url in a secret
                name: napptive-sc # (Required) secret name
                key: url # (Required) secret key
            message: # (Required) message to send
              text: Hello from backend-rotate!! # (Optional) text
...



================================================
FILE: .gitpod.yml
================================================

# for backend testing & running
tasks:
  - init: |
      cd src/backend/merger
      sudo apt install qpdf -y
      go get && go build -o backend && go test ./...
    command: |
      cd src/backend/merger
      ./backend



================================================
FILE: .stignore
================================================
.git
*.exe
*.exe~
*.dll
*.so
*.dylib

# vendor folders
vendor

# Test binary, built with go test -c
*.test

# Output of the go coverage tool, specifically when used with LiteIDE
*.out

# dlv binary
__debug_bin



================================================
FILE: deploy/blue-green/readme.md
================================================
# IMPORTANT Decision
the folder
- `deploy/blue-green`
- `deploy/canary`

are all place to
`deploy/rollouts`


================================================
FILE: deploy/canary/readme.md
================================================
# IMPORTANT Decision
the folder
- `deploy/blue-green`
- `deploy/canary`

are all place to
`deploy/rollouts`


================================================
FILE: deploy/cluster/README.md
================================================
# Navigate through k8s manifests

./pdf-editor-kustomize/ --> made using Kustomize
./pdf-editor-helm/ --> made using Helm charts


================================================
FILE: deploy/cluster/argoCD.yaml
================================================
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: pdf-editor-backend
  namespace: argocd
spec:
  project: pdf-editor
  source:
    repoURL: 'https://github.com/dipankardas011/PDF-Editor/'
    path: deploy/cluster/backend
    targetRevision: HEAD
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: pdf-editor-ns
  syncPolicy:
    syncOptions:
      - CreateNamespace=true      # to create the namaspace if not exsists
    automated:
      prune: true
      selfHeal: true
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: pdf-editor-frontend
  namespace: argocd
spec:
  project: pdf-editor
  source:
    repoURL: 'https://github.com/dipankardas011/PDF-Editor/'
    path: deploy/cluster/frontend
    targetRevision: HEAD
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: pdf-editor-ns
  syncPolicy:
    syncOptions:
      - CreateNamespace=true      # to create the namaspace if not exsists
    automated:
      prune: true
      selfHeal: true


================================================
FILE: deploy/cluster/artifact/index.yaml
================================================
apiVersion: v1
entries:
  pdf-editor-helm:
  - apiVersion: v2
    appVersion: "1.0"
    created: "2022-10-13T18:32:54.645618135+05:30"
    description: A Helm chart for pdf-editor application
    digest: a4115b5816dee040770efa74dc270898da44b0b23597ea5f4c523b1f9c50957f
    maintainers:
    - email: dipankardas0115@gmail.com
      name: Dipankar Das
    name: pdf-editor-helm
    type: application
    urls:
    - pdf-editor-helm-1.0.0.tgz
    version: 1.0.0
  - apiVersion: v2
    appVersion: "0.8"
    created: "2022-10-13T18:32:54.644698761+05:30"
    description: A Helm chart for pdf-editor
    digest: b7073ddfb8a3e98359490959e8504255751ddf7e8495035d948e2fa62d08cfcf
    maintainers:
    - email: dipankardas0115@gmail.com
      name: Dipankar Das
    name: pdf-editor-helm
    type: application
    urls:
    - pdf-editor-helm-0.8.0.tgz
    version: 0.8.0
generated: "2022-10-13T18:32:54.643365083+05:30"



================================================
FILE: deploy/cluster/artifact/pdf-editor-helm-0.8.0.tgz
================================================
[Non-text file]


================================================
FILE: deploy/cluster/artifact/pdf-editor-helm-1.0.0.tgz
================================================
[Non-text file]


================================================
FILE: deploy/cluster/backend/deploy-pdf.yml
================================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-backend-merger
  labels:
    app: backend-merge
  namespace: pdf-editor-ns
spec:
  selector:
    matchLabels:
      app: backend-merge
  replicas: 2
  template:
    metadata:
      labels:
        app: backend-merge
    spec:
      initContainers:
        - name: pdf-files
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-merge
          volumeMounts:
          - name: backend
            mountPath: /mnt
          command: ["cp", "-vR", ".", "/mnt"]

      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-merge
          volumeMounts:
          - name: backend
            mountPath: /go/src/
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              port: 8080
              path: /greet
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              port: 8080
              path: /greet
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 8080
              name: backend-port
      volumes:
      - name: backend
        emptyDir: {}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-backend-rotator
  labels:
    app: backend-rotate
  namespace: pdf-editor-ns
spec:
  selector:
    matchLabels:
      app: backend-rotate
  replicas: 2
  template:
    metadata:
      labels:
        app: backend-rotate
    spec:
      initContainers:
        - name: pdf-files
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-rotate
          volumeMounts:
          - name: backend
            mountPath: /mnt
          command: ["cp", "-vR", ".", "/mnt"]

      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-rotate
          volumeMounts:
          - name: backend
            mountPath: /go/src/
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              port: 8081
              path: /greet
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              port: 8081
              path: /greet
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 8081
              name: backend-port
      volumes:
      - name: backend
        emptyDir: {}



================================================
FILE: deploy/cluster/backend/kustomization.yml
================================================
resources:
- deploy-pdf.yml
- svc.yml



================================================
FILE: deploy/cluster/backend/pv.yml
================================================
# apiVersion: v1
# kind: PersistentVolumeClaim
# metadata:
#   name: pdf-editor-pvc
#   labels:
#     pvc: pdf
#   namespace: pdf-editor-ns
# spec:
#   accessModes:
#     - ReadWriteOnce
#   storageClassName: standard
#   resources:
#     requests:
#       storage: 50Mi


================================================
FILE: deploy/cluster/backend/svc.yml
================================================
apiVersion: v1
kind: Service
metadata:
  name: backend-merge
  namespace: pdf-editor-ns
  labels:
    service: backend-merge
spec:
  selector:
    app: backend-merge
  ports:
  - port: 8080
    name: web
    targetPort: backend-port
    protocol: TCP
---
apiVersion: v1
kind: Service
metadata:
  name: backend-rotate
  namespace: pdf-editor-ns
  labels:
    service: backend-rotate
spec:
  selector:
    app: backend-rotate
  ports:
  - port: 8081
    name: web
    targetPort: backend-port
    protocol: TCP



================================================
FILE: deploy/cluster/cilium/backend-merge.yml
================================================
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: backend-merge-cilium-policy
  namespace: pdf-editor-ns
spec:
  endpointSelector:
    matchLabels:
      service: backend-merge
  ingress:
    - fromEndpoints:
        - matchLabels:
            name: pdf-editor-frontend
      toPorts:
        - ports:
            - port: "8080"
  egress:
    - toEndpoints:
        - matchLabels:
            io.kubernetes.pod.namespace: kube-system
            k8s-app: kube-dns
      toPorts:
        - ports:
            - port: "53"
              protocol: UDP
          rules:
            dns:
              - matchPattern: "*"
    - toServices:
        - k8sServiceSelector:
            selector:
              matchLabels:
                name: pdf-editor-frontend




================================================
FILE: deploy/cluster/cilium/backend-rotate.yml
================================================
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: backend-rotate-cilium-policy
  namespace: pdf-editor-ns
spec:
  endpointSelector:
    matchLabels:
      service: backend-rotate
  ingress:
    - fromEndpoints:
        - matchLabels:
            name: pdf-editor-frontend
      toPorts:
        - ports:
            - port: "8081"
  egress:
    - toEndpoints:
        - matchLabels:
            io.kubernetes.pod.namespace: kube-system
            k8s-app: kube-dns
      toPorts:
        - ports:
            - port: "53"
              protocol: UDP
          rules:
            dns:
              - matchPattern: "*"
    - toServices:
        - k8sServiceSelector:
            selector:
              matchLabels:
                name: pdf-editor-frontend




================================================
FILE: deploy/cluster/cilium/frontend.yml
================================================
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: frontend-cilium-policy
  namespace: pdf-editor-ns
spec:
  endpointSelector:
    matchLabels:
      name: pdf-editor-frontend
  ingress:
    - fromEntities:
        - world
      toPorts:
        - ports:
            - port: "80"
    - fromEntities:
        - cluster
      toPorts:
        - ports:
            - port: "80"
  egress:
    - toEndpoints:
        - matchLabels:
            io.kubernetes.pod.namespace: kube-system
            k8s-app: kube-dns
      toPorts:
        - ports:
            - port: "53"
              protocol: UDP
          rules:
            dns:
              - matchPattern: "*"
    - toServices:
        - k8sServiceSelector:
            selector:
              matchLabels:
                service: backend-merge
      toPorts:
        - ports:
            - port: "8080"
    - toServices:
        - k8sServiceSelector:
            selector:
              matchLabels:
                service: backend-rotate
      toPorts:
        - ports:
            - port: "8081"




================================================
FILE: deploy/cluster/frontend/deploy-pdf.yml
================================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-frontend
  labels:
    app: frontend-pdf
  namespace: pdf-editor-ns
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend-pdf
  template:
    metadata:
      labels:
        app: frontend-pdf
    spec:
      containers:
      - name: pdf-editor-frontend
        image: docker.io/dipugodocker/pdf-editor:1.0-frontend
        resources:
          requests:
              memory: "50Mi"
              cpu: "10m"
          limits:
            memory: "500Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            port: 80
            path: /
          initialDelaySeconds: 5
          periodSeconds: 30
        readinessProbe:
          httpGet:
            port: 80
            path: /
          initialDelaySeconds: 5
          periodSeconds: 10
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
          name: web-port



================================================
FILE: deploy/cluster/frontend/kustomization.yml
================================================
resources:
- deploy-pdf.yml
- svc.yml



================================================
FILE: deploy/cluster/frontend/svc.yml
================================================
apiVersion: v1
kind: Service
metadata:
  name: frontend-lb
  namespace: pdf-editor-ns
  labels:
    name: pdf-editor-frontend
spec:
  selector:
    app: frontend-pdf
  type: ClusterIP
  ports:
  - port: 80
    name: web
    targetPort: web-port
    protocol: TCP

---

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pdf-editor-ig
  labels:
    name: pdf-editor-ig
  annotations:
    kubernetes.io/ingress.class: nginx
  namespace: pdf-editor-ns
spec:
  rules:
  - host: pdf-editor
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: frontend-lb
            port:
              number: 80



================================================
FILE: deploy/cluster/monitoring/jaeger-deploy.yml
================================================
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
  namespace: pdf-editor-ns
spec:
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:1.6
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
        - containerPort: 5775
        - containerPort: 6831
        - containerPort: 6832
        - containerPort: 5778
        - containerPort: 16686
        - containerPort: 14268
        - containerPort: 9411

---

apiVersion: v1
kind: Service
metadata:
  name: trace
  namespace: pdf-editor-ns
spec:
  selector:
    app: jaeger
  ports:
  - port: 16686
    targetPort: 16686
    name: web
  - port: 14268
    targetPort: 14268
    name: conn



================================================
FILE: deploy/cluster/monitoring/service-monitor.yml
================================================
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: backend-merge-service-monitor
  labels:
    release: prom
    service-monitoring: backend-merge
  namespace: pdf-editor-ns
spec:
  selector:
    matchLabels:
      service: backend-merge
  endpoints:
  - port: web

---

apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: backend-rotate-service-monitor
  labels:
    release: prom
    service-monitoring: backend-rotate
  namespace: pdf-editor-ns
spec:
  selector:
    matchLabels:
      service: backend-rotate
  endpoints:
  - port: web

---

apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: frontend-service-monitor
  labels:
    release: prom
    service-monitoring: frontend
  namespace: pdf-editor-ns
spec:
  selector:
    matchLabels:
      name: pdf-editor-frontend
  endpoints:
  - port: web
...



================================================
FILE: deploy/cluster/monitoring/AddditionalInfo/grafana-deply.txt
================================================
# #############################
# DECRYPTED: Now using kube-prom
# #############################
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-config
  namespace: monitoring
data:
  grafana.ini:  |
    [security]
    admin_user = $__file{/etc/config/secrets/username}
    admin_password = $__file{/etc/config/secrets/password}
    [dashboards]
    default_home_dashboard_path = "/var/lib/grafana/dashboards/pdf/pdf.json"
---

apiVersion: v1
kind: Secret
metadata:
  name: grafana-secrets
  namespace: monitoring
type: Opaque
data:
  username: YWRtaW4=
  password: MTIzNA==

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      name: grafana
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: ghcr.io/kubernetes101/grafana:8.1.1
        ports:
        - name: grafana
          containerPort: 3000
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "200m"
        volumeMounts:
          - name: grafana-secrets
            mountPath: /etc/config/secrets
          - name: grafana-storage
            mountPath: /var/lib/grafana
          - name: grafana-datasources
            mountPath: /etc/grafana/provisioning/datasources
            readOnly: false
          - name: grafana-config
            mountPath: /etc/grafana/grafana.ini
            subPath: grafana.ini
          - name: grafana-dashboard-provider
            mountPath: /etc/grafana/provisioning/dashboards/dashboardProvider.yaml
            subPath: dashboardProvider.yaml
          - name: dashboards-pdf
            mountPath: /var/lib/grafana/dashboards/pdf

      volumes:
        - name: grafana-secrets
          secret:
            secretName: grafana-secrets
        - name: grafana-storage
          emptyDir: {}
        - name: grafana-datasources
          configMap:
              defaultMode: 420
              name: grafana-datasources
        - name: grafana-config
          configMap:
            name: grafana-config
        - name: grafana-dashboard-provider
          configMap:
            name: grafana-dashboard-provider
        - name: dashboards-pdf
          configMap:
            name: dashboards-pdf
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboard-provider
  namespace: monitoring
  labels:
    app: grafana
data:
  dashboardProvider.yaml: |
    apiVersion: 1
    providers:
    - name: "PDF-Editor"
      options:
        path: /var/lib/grafana/dashboards/pdf
      orgId: 1
      type: file
      disableDeletion: false



---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: monitoring
data:
  prometheus.yaml: |-
    {
      "apiVersion": 1,
      "datasources": [
        {
          "access": "proxy",
          "editable": true,
          "name": "prometheus",
          "orgId": 1,
          "type": "prometheus",
          "url": "http://prometheus-server.monitoring.svc:9090",
          "version": 1,
          "basicAuth": "true",
          "basicAuthUser": "admin",
          "basicAuthPassword": "1234"
        }
      ]

---

apiVersion: v1
kind: Service
metadata:
  name: grafana
  namespace: monitoring
  annotations:
    prometheus.io/scrape: 'true'
    prometheus.io/port:   '9090'
spec:
  selector:
    app: grafana
  type: ClusterIP
  ports:
    - port: 3000
      targetPort: 3000

---

apiVersion: v1
kind: ConfigMap
metadata:
  name: dashboards-pdf
  namespace: monitoring
  labels:
    app: grafana
data:
  pdf.json: |-
    {
      "annotations": {
        "list": [
          {
            "builtIn": 1,
            "datasource": "-- Grafana --",
            "enable": true,
            "hide": true,
            "iconColor": "rgba(0, 211, 255, 1)",
            "name": "Annotations & Alerts",
            "target": {
              "limit": 100,
              "matchAny": false,
              "tags": [],
              "type": "dashboard"
            },
            "type": "dashboard"
          }
        ]
      },
      "editable": true,
      "gnetId": null,
      "graphTooltip": 0,
      "id": 1,
      "links": [],
      "panels": [
        {
          "datasource": "prometheus",
          "fieldConfig": {
            "defaults": {
              "color": {
                "mode": "thresholds"
              },
              "mappings": [],
              "thresholds": {
                "mode": "absolute",
                "steps": [
                  {
                    "color": "green",
                    "value": null
                  }
                ]
              }
            },
            "overrides": [
              {
                "matcher": {
                  "id": "byName",
                  "options": "go_request_operations_success_total{instance=\"backend-merge.pdf-editor-ns.svc.cluster.local:8080\", job=\"pdf-editor\"}"
                },
                "properties": [
                  {
                    "id": "displayName",
                    "value": "200 Status backend"
                  }
                ]
              },
              {
                "matcher": {
                  "id": "byName",
                  "options": "go_request_operations_error_total{instance=\"backend-merge.pdf-editor-ns.svc.cluster.local:8080\", job=\"pdf-editor\"}"
                },
                "properties": [
                  {
                    "id": "displayName",
                    "value": "500 Status Backend"
                  },
                  {
                    "id": "color",
                    "value": {
                      "fixedColor": "red",
                      "mode": "fixed"
                    }
                  }
                ]
              }
            ]
          },
          "gridPos": {
            "h": 8,
            "w": 12,
            "x": 0,
            "y": 0
          },
          "id": 2,
          "options": {
            "colorMode": "value",
            "graphMode": "area",
            "justifyMode": "auto",
            "orientation": "auto",
            "reduceOptions": {
              "calcs": [
                "lastNotNull"
              ],
              "fields": "",
              "values": false
            },
            "text": {},
            "textMode": "auto"
          },
          "pluginVersion": "8.1.1",
          "targets": [
            {
              "exemplar": true,
              "expr": "go_request_operations_success_total",
              "interval": "",
              "legendFormat": "",
              "queryType": "randomWalk",
              "refId": "A"
            },
            {
              "exemplar": true,
              "expr": "go_request_operations_error_total",
              "hide": false,
              "interval": "",
              "legendFormat": "",
              "refId": "B"
            }
          ],
          "title": "HTTP Status Codes",
          "type": "stat"
        }
      ],
      "schemaVersion": 30,
      "style": "dark",
      "tags": [],
      "templating": {
        "list": []
      },
      "time": {
        "from": "now-6h",
        "to": "now"
      },
      "timepicker": {},
      "timezone": "",
      "title": "PDF-Editor",
      "uid": "BFcum-R4z",
      "version": 2
    }


================================================
FILE: deploy/cluster/monitoring/AddditionalInfo/HTTP Responses-1665425652148.json
================================================
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "grafana",
          "uid": "-- Grafana --"
        },
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "target": {
          "limit": 100,
          "matchAny": false,
          "tags": [],
          "type": "dashboard"
        },
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "id": 28,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "blue",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 10,
        "w": 8,
        "x": 0,
        "y": 0
      },
      "id": 2,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "go_request_operations_merger_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Backend-Merger HTTP Total Response",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 10,
        "w": 8,
        "x": 8,
        "y": 0
      },
      "id": 5,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "go_request_operations_merger_success_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Backend-Merger HTTP 2** Response",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "red",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 10,
        "w": 8,
        "x": 16,
        "y": 0
      },
      "id": 6,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "go_request_operations_merger_error_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Backend-Merger HTTP 4** and 5** Response",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "blue",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 9,
        "w": 8,
        "x": 0,
        "y": 10
      },
      "id": 8,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "go_request_operations_rotator_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Backend-Rotator HTTP Total Response",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 9,
        "w": 8,
        "x": 8,
        "y": 10
      },
      "id": 10,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "go_request_operations_rotator_success_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Backend-Rotator HTTP 2** Response",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "red",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 9,
        "w": 8,
        "x": 16,
        "y": 10
      },
      "id": 12,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "go_request_operations_rotator_error_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Backend-Rotator HTTP 4** and 5** Response",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "blue",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 19
      },
      "id": 14,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "nodejs_request_operations_frontend_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Frontend HTTP Total Response",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 19
      },
      "id": 16,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "nodejs_request_operations_frontend_success_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Frontend HTTP 2** Response",
      "type": "stat"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "red"
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 27
      },
      "id": 18,
      "options": {
        "colorMode": "value",
        "graphMode": "area",
        "justifyMode": "auto",
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "textMode": "auto"
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "nodejs_request_operations_frontend_error_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Frontend HTTP 4** and 5** Response",
      "type": "stat"
    }
  ],
  "refresh": "1m",
  "schemaVersion": 37,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "2022-10-10T09:00:45.958Z",
    "to": "2022-10-10T21:00:45.958Z"
  },
  "timepicker": {},
  "timezone": "",
  "title": "HTTP Responses",
  "uid": "cXISvMI4k",
  "version": 4,
  "weekStart": ""
}


================================================
FILE: deploy/cluster/monitoring/AddditionalInfo/metrics-server.txt
================================================
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    k8s-app: metrics-server
    rbac.authorization.k8s.io/aggregate-to-admin: "true"
    rbac.authorization.k8s.io/aggregate-to-edit: "true"
    rbac.authorization.k8s.io/aggregate-to-view: "true"
  name: system:aggregated-metrics-reader
rules:
- apiGroups:
  - metrics.k8s.io
  resources:
  - pods
  - nodes
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    k8s-app: metrics-server
  name: system:metrics-server
rules:
- apiGroups:
  - ""
  resources:
  - nodes/metrics
  verbs:
  - get
- apiGroups:
  - ""
  resources:
  - pods
  - nodes
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server-auth-reader
  namespace: kube-system
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: extension-apiserver-authentication-reader
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server:system:auth-delegator
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:auth-delegator
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: system:metrics-server
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:metrics-server
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: v1
kind: Service
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
spec:
  ports:
  - name: https
    port: 443
    protocol: TCP
    targetPort: https
  selector:
    k8s-app: metrics-server
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
spec:
  selector:
    matchLabels:
      k8s-app: metrics-server
  strategy:
    rollingUpdate:
      maxUnavailable: 0
  template:
    metadata:
      labels:
        k8s-app: metrics-server
    spec:
      containers:
      - args:
        - --cert-dir=/tmp
        - --secure-port=4443
        - --kubelet-insecure-tls
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --metric-resolution=15s
        image: k8s.gcr.io/metrics-server/metrics-server:v0.6.1
        imagePullPolicy: IfNotPresent
        livenessProbe:
          failureThreshold: 3
          httpGet:
            path: /livez
            port: https
            scheme: HTTPS
          periodSeconds: 10
        name: metrics-server
        ports:
        - containerPort: 4443
          name: https
          protocol: TCP
        readinessProbe:
          failureThreshold: 3
          httpGet:
            path: /readyz
            port: https
            scheme: HTTPS
          initialDelaySeconds: 20
          periodSeconds: 10
        resources:
          requests:
            cpu: 100m
            memory: 200Mi
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1000
        volumeMounts:
        - mountPath: /tmp
          name: tmp-dir
      nodeSelector:
        kubernetes.io/os: linux
      priorityClassName: system-cluster-critical
      serviceAccountName: metrics-server
      volumes:
      - emptyDir: {}
        name: tmp-dir
---
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  labels:
    k8s-app: metrics-server
  name: v1beta1.metrics.k8s.io
spec:
  group: metrics.k8s.io
  groupPriorityMinimum: 100
  insecureSkipTLSVerify: true
  service:
    name: metrics-server
    namespace: kube-system
  version: v1beta1
  versionPriority: 100



================================================
FILE: deploy/cluster/monitoring/AddditionalInfo/prometheus-deploy.txt
================================================
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring

---

apiVersion: v1
kind: ConfigMap
metadata:
  name: special-config
  namespace: monitoring
data:
  prometheus.yml: |-
    global:
      scrape_interval: 10s
      evaluation_interval: 30s
    scrape_configs:
    - job_name: pdf-editor
      static_configs:
      - targets: ["backend-merge.pdf-editor-ns.svc.cluster.local:8080", "frontend.pdf-editor-ns.svc.cluster.local"]

  web.yml: |-
    basic_auth_users:
      admin: $2b$12$K6xJMsqJp7MZL6NN/OIUyuvoMTFJvFKYlK2NVbgwzPk83sQnLMON2

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
  labels:
    app.kubernetes.io/name: prometheus
spec:
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus
        args:
          - '--web.config.file=/etc/prometheus/web.yml'
          - '--config.file=/etc/prometheus/prometheus.yml'
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
          requests:
            memory: "50Mi"
            cpu: "100m"
        ports:
        - containerPort: 9090
          name: prom-port
        volumeMounts:
        - name: config-volume
          mountPath: /etc/prometheus/
      volumes:
        - name: config-volume
          configMap:
            name: special-config
---

apiVersion: v1
kind: Service
metadata:
  name: prometheus-server
  namespace: monitoring
  annotations:
    prometheus.io/scrape: 'true'
    prometheus.io/port:   '9090'

spec:
  selector:
    app: prometheus
  type: ClusterIP
  ports:
  - port: 9090
    targetPort: 9090
...



================================================
FILE: deploy/cluster/monitoring/AddditionalInfo/System Usage-1665427430720.json
================================================
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "grafana",
          "uid": "-- Grafana --"
        },
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "target": {
          "limit": 100,
          "matchAny": false,
          "tags": [],
          "type": "dashboard"
        },
        "type": "dashboard"
      }
    ]
  },
  "description": "",
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "id": 29,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "description": "all p",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "series",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "smooth",
            "lineStyle": {
              "fill": "solid"
            },
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": 3600000,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 9,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "id": 2,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "exemplar": false,
          "expr": "rate(container_cpu_usage_seconds_total{namespace=\"pdf-editor-ns\"}[1m])",
          "format": "heatmap",
          "instant": false,
          "legendFormat": "{{pod}}",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Total CPU usage (seconds) ",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 9,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "id": 4,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "container_memory_usage_bytes{namespace=\"pdf-editor-ns\"}/(1024*1024)",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Container memory usage (MB)",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 9
      },
      "id": 6,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "node_nodejs_active_resources",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Frontend Active Resources",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "area"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "#EAB839",
                "value": 10
              },
              {
                "color": "#6ED0E0",
                "value": 20
              },
              {
                "color": "#EF843C",
                "value": 30
              },
              {
                "color": "#E24D42",
                "value": 40
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 9
      },
      "id": 8,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "pluginVersion": "9.1.6",
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "node_nodejs_active_handles_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Frontend Total Active Handlers",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "area"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "#EAB839",
                "value": 10
              },
              {
                "color": "#6ED0E0",
                "value": 20
              },
              {
                "color": "#EF843C",
                "value": 30
              },
              {
                "color": "#E24D42",
                "value": 40
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 17
      },
      "id": 10,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "node_nodejs_active_requests_total",
          "legendFormat": "__auto",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Frontend Total Active Request",
      "type": "timeseries"
    }
  ],
  "refresh": "5s",
  "schemaVersion": 37,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-15m",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "System Usage",
  "uid": "0cgpdGI4z",
  "version": 6,
  "weekStart": ""
}


================================================
FILE: deploy/cluster/okteto/deploy-pdf-frontend.yml
================================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-frontend
  labels:
    app: frontend-pdf
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend-pdf
  template:
    metadata:
      labels:
        app: frontend-pdf
    spec:
      containers:
      - name: pdf-editor-frontend
        image: docker.io/dipugodocker/pdf-editor:frontend
        resources:
          requests:
              memory: "50Mi"
              cpu: "10m"
          limits:
            memory: "500Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            port: 80
            path: /
          initialDelaySeconds: 5
          periodSeconds: 30
        readinessProbe:
          httpGet:
            port: 80
            path: /about
          initialDelaySeconds: 5
          periodSeconds: 10
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          name: web-port



================================================
FILE: deploy/cluster/okteto/deploy-pdf.yml
================================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-backend
  labels:
    app: backend-merger
spec:
  selector:
    matchLabels:
      app: backend-merger
  replicas: 2
  template:
    metadata:
      labels:
        app: backend-merger
    spec:
      initContainers:
        - name: pdf-files
          image: docker.io/dipugodocker/pdf-editor:backend-merge
          volumeMounts:
          - name: backend
            mountPath: /mnt
          command: ["cp", "-vR", ".", "/mnt"]
          resources:
            requests:
                memory: "10Mi"
                cpu: "1m"
            limits:
              memory: "100Mi"
              cpu: "50m"

      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:backend-merge
          volumeMounts:
          - name: backend
            mountPath: /go/src/
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              port: 8080
              path: /greet
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              port: 8080
              path: /greet
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 8080
              name: backend-port
      volumes:
      - name: backend
        emptyDir: {}

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-rotate
  labels:
    app: backend-rotate
spec:
  selector:
    matchLabels:
      app: backend-rotate
  replicas: 2
  template:
    metadata:
      labels:
        app: backend-rotate
    spec:
      initContainers:
        - name: pdf-files
          image: docker.io/dipugodocker/pdf-editor:backend-rotate
          volumeMounts:
          - name: backend
            mountPath: /mnt
          command: ["cp", "-vR", ".", "/mnt"]
          resources:
            requests:
                memory: "10Mi"
                cpu: "1m"
            limits:
              memory: "100Mi"
              cpu: "50m"

      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:backend-rotate
          volumeMounts:
          - name: backend
            mountPath: /go/src/
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              port: 8081
              path: /greet
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              port: 8081
              path: /greet
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 8081
              name: rotate-port
      volumes:
      - name: backend
        emptyDir: {}



================================================
FILE: deploy/cluster/okteto/jaeger-deploy copy.yml
================================================
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
spec:
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:1.6
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
        - containerPort: 5775
        - containerPort: 6831
        - containerPort: 6832
        - containerPort: 5778
        - containerPort: 16686
        - containerPort: 14268
        - containerPort: 9411

---

apiVersion: v1
kind: Service
metadata:
  name: trace
spec:
  selector:
    app: jaeger
  ports:
  - port: 16686
    targetPort: 16686
    name: web
  - port: 14268
    targetPort: 14268
    name: conn



================================================
FILE: deploy/cluster/okteto/svc copy.yml
================================================
apiVersion: v1
kind: Service
metadata:
  name: frontend-lb
spec:
  selector:
    app: frontend-pdf
  type: NodePort
  ports:
  - port: 8080
    targetPort: web-port
    protocol: TCP



================================================
FILE: deploy/cluster/okteto/svc.yml
================================================
apiVersion: v1
kind: Service
metadata:
  name: backend-merge
spec:
  selector:
    app: backend-merger
  ports:
  - port: 8080
    targetPort: backend-port
    protocol: TCP

---

apiVersion: v1
kind: Service
metadata:
  name: backend-rotate
spec:
  selector:
    app: backend-rotate
  ports:
  - port: 8081
    targetPort: rotate-port
    protocol: TCP



================================================
FILE: deploy/cluster/okteto/.monokle
================================================
{
    "scanExcludes": [
        "node_modules",
        "**/.git",
        "**/pkg/mod/**",
        "**/.kube",
        "**/*.swp",
        ".monokle"
    ],
    "fileIncludes": [
        "*.yaml",
        "*.yml"
    ],
    "folderReadsMaxDepth": 10,
    "k8sVersion": "1.23.3",
    "settings": {
        "helmPreviewMode": "template",
        "kustomizeCommand": "kubectl",
        "createDefaultObjects": false,
        "setDefaultPrimitiveValues": true,
        "allowEditInClusterMode": true
    },
    "kubeConfig": {
        "path": "/home/dipankar/.kube/config",
        "currentContext": ""
    }
}


================================================
FILE: deploy/cluster/pdf-editor-helm/README.md
================================================
# Helm plugin

## Usage

[Helm](https://helm.sh) must be installed to use the charts.  Please refer to
Helm's [documentation](https://helm.sh/docs) to get started.

Once Helm has been set up correctly, add the repo as follows:
```
helm repo add <alias> https://dipankardas011.github.io/PDF-Editor/
helm install my-pdf-editor-helm pdf-editor-web/pdf-editor-helm

```
If you had already added this repo earlier, run `helm repo update` to retrieve
the latest versions of the packages.  You can then run `helm search repo
<alias>` to see the charts.

To install the <chart-name> chart:
```
kubectl create ns pdf
helm repo add pdf-editor-web https://dipankardas011.github.io/PDF-Editor/
helm install my-pdf-editor-helm pdf-editor-web/pdf-editor-helm
```
To uninstall the chart:

    helm delete my-pdf-editor-helm


================================================
FILE: deploy/cluster/pdf-editor-helm/Chart.yaml
================================================
apiVersion: v2
name: pdf-editor-helm
description: A Helm chart for pdf-editor application

# A chart can be either an 'application' or a 'library' chart.
#
# Application charts are a collection of templates that can be packaged into versioned archives
# to be deployed.
#
# Library charts provide useful utilities or functions for the chart developer. They're included as
# a dependency of application charts to inject those utilities and functions into the rendering
# pipeline. Library charts do not define any templates and therefore cannot be deployed.
type: application

# This is the chart version. This version number should be incremented each time you make changes
# to the chart and its templates, including the app version.
# Versions are expected to follow Semantic Versioning (https://semver.org/)
version: 1.0.0

# This is the version number of the application being deployed. This version number should be
# incremented each time you make changes to the application. Versions are not expected to
# follow Semantic Versioning. They should reflect the version the application is using.
# It is recommended to use it with quotes.
appVersion: "1.0"

maintainers:
  - name: Dipankar Das
    email: dipankardas0115@gmail.com



================================================
FILE: deploy/cluster/pdf-editor-helm/values.yaml
================================================
# Default values for pdf-editor-tool.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.

replicaCount:
  backend: 2
  frontend: 4

namespace: helm-pdf-editor-ns

image:
  pullPolicy: Always
  # Overrides the image tag whose default is the chart appVersion.

# imagePullSecrets: []
# nameOverride: ""
# fullnameOverride: ""

# serviceAccount:
  # Specifies whether a service account should be created
  # create: true
  # Annotations to add to the service account
  # annotations: {}
  # The name of the service account to use.
  # If not set and create is true, a name is generated using the fullname template
  # name: ""

podAnnotations: {}

podSecurityContext: {}
  # fsGroup: 2000

securityContext:
  # capabilities:
  #   drop:
  #   - ALL
  readOnlyRootFilesystem: true
  # runAsNonRoot: true
  # runAsUser: 1000

service:
  type: ClusterIP
  port: 10000

ingress:
  enabled: true
  # className: ""
  annotations:
    kubernetes.io/ingress.class: nginx
    # kubernetes.io/tls-acme: "true"
#   hosts:
#     - host: chart-example.local
#       paths:
#         - path: /
#           pathType: ImplementationSpecific
#   tls: []
  #  - secretName: chart-example-tls
  #    hosts:
  #      - chart-example.local

resources: {}
  # We usually recommend not to specify default resources and to leave this as a conscious
  # choice for the user. This also increases chances charts run on environments with little
  # resources, such as Minikube. If you do want to specify resources, uncomment the following
  # lines, adjust them as necessary, and remove the curly braces after 'resources:'.
  # limits:
  #   cpu: 100m
  #   memory: 128Mi
  # requests:
  #   cpu: 100m
  #   memory: 128Mi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80
  # targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity: {}



================================================
FILE: deploy/cluster/pdf-editor-helm/.helmignore
================================================
# Patterns to ignore when building packages.
# This supports shell glob matching, relative path matching, and
# negation (prefixed with !). Only one pattern per line.
.DS_Store
# Common VCS dirs
.git/
.gitignore
.bzr/
.bzrignore
.hg/
.hgignore
.svn/
# Common backup files
*.swp
*.bak
*.tmp
*.orig
*~
# Various IDEs
.project
.idea/
*.tmproj
.vscode/



================================================
FILE: deploy/cluster/pdf-editor-helm/templates/deployment.yaml
================================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-backend-merge
  namespace: {{ .Values.namespace }}
  labels:
    app: backend-merge
spec:
  replicas: {{ .Values.replicaCount.backend }}
  selector:
    matchLabels:
      app: backend-merge
  template:
    metadata:
      labels:
        app: backend-merge

    spec:
      volumes:
      - name: backend
        emptyDir: {}
      initContainers:
        - name: pdf-files
          image: docker.io/dipugodocker/pdf-editor:{{ .Chart.AppVersion }}-backend-merge
          volumeMounts:
          - name: backend
            mountPath: /mnt
          command: ["cp", "-vR", ".", "/mnt"]

      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:{{ .Chart.AppVersion }}-backend-merge
          volumeMounts:
          - name: backend
            mountPath: /go/src/
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              port: 8080
              path: /greet
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              port: 8080
              path: /greet
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 8080
          imagePullPolicy: {{ .Values.image.pullPolicy }}

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-backend-rotate
  namespace: {{ .Values.namespace }}
  labels:
    app: backend-rotate
spec:
  replicas: {{ .Values.replicaCount.backend }}
  selector:
    matchLabels:
      app: backend-rotate
  template:
    metadata:
      labels:
        app: backend-rotate

    spec:
      volumes:
      - name: backend
        emptyDir: {}
      initContainers:
        - name: pdf-files
          image: docker.io/dipugodocker/pdf-editor:{{ .Chart.AppVersion }}-backend-rotate
          volumeMounts:
          - name: backend
            mountPath: /mnt
          command: ["cp", "-vR", ".", "/mnt"]

      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:{{ .Chart.AppVersion }}-backend-rotate
          volumeMounts:
          - name: backend
            mountPath: /go/src/
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              port: 8081
              path: /greet
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              port: 8081
              path: /greet
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 8081
          imagePullPolicy: {{ .Values.image.pullPolicy }}



---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-frontend
  namespace: {{ .Values.namespace }}
  labels:
    app: frontend-pdf
spec:
  replicas: {{ .Values.replicaCount.frontend }}
  selector:
    matchLabels:
      app: frontend-pdf
  template:
    metadata:
      labels:
        app: frontend-pdf
    spec:
      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:{{ .Chart.AppVersion }}-frontend
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            tcpSocket:
              port: 80
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            tcpSocket:
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 80
              name: web-port
          imagePullPolicy: {{ .Values.image.pullPolicy }}
...



================================================
FILE: deploy/cluster/pdf-editor-helm/templates/namespace.yml
================================================
apiVersion: v1
kind: Namespace
metadata:
  name: {{ .Values.namespace }}


================================================
FILE: deploy/cluster/pdf-editor-helm/templates/service.yaml
================================================
apiVersion: v1
kind: Service
metadata:
  name: backend-merge
  namespace: {{ .Values.namespace }}
  labels:
    service: backend-merge
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: 8080
      targetPort: 8080
      name: web
  selector:
    app: backend-merge

---

apiVersion: v1
kind: Service
metadata:
  name: backend-rotate
  namespace: {{ .Values.namespace }}
  labels:
    service: backend-rotate
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: 8081
      targetPort: 8081
      name: web
  selector:
    app: backend-rotate

---

apiVersion: v1
kind: Service
metadata:
  name: frontend-lb
  namespace: {{ .Values.namespace }}
  labels:
    name: pdf-editor-frontend
spec:
  selector:
    app: frontend-pdf
  type: ClusterIP
  ports:
  - port: 80
    name: web
    targetPort: web-port
    protocol: TCP

---

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pdf-editor-ig
  labels:
    name: pdf-editor-ig
  annotations:
    kubernetes.io/ingress.class: nginx
  namespace: {{ .Values.namespace }}
spec:
  rules:
  - host: pdf-editor
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: frontend-lb
            port:
              number: 80



================================================
FILE: deploy/cluster/pdf-editor-helm/templates/tracing.yml
================================================
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
  namespace: {{ .Values.namespace }}
spec:
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:1.6
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
          requests:
            memory: "50Mi"
            cpu: "10m"
        livenessProbe:
          tcpSocket:
            port: 16686
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          tcpSocket:
            port: 16686
          initialDelaySeconds: 5
          periodSeconds: 10
        ports:
        - containerPort: 5775
        - containerPort: 6831
        - containerPort: 6832
        - containerPort: 5778
        - containerPort: 16686
        - containerPort: 14268
        - containerPort: 9411

---

apiVersion: v1
kind: Service
metadata:
  name: trace
  namespace: {{ .Values.namespace }}
spec:
  selector:
    app: jaeger
  ports:
  - port: 16686
    targetPort: 16686
    name: web
  - port: 14268
    targetPort: 14268
    name: conn



================================================
FILE: deploy/IAC/ansible-terraform/readme.md
================================================
# for debugging
```sh
ansible all -u ubuntu --private-key pdf-terraform.pem -i '44.209.39.161,' -m shell -a "ls -la /"
```




================================================
FILE: deploy/IAC/ansible-terraform/ansible-script.sh
================================================

# Licensed under the Apache License, Version 2.0 (the "License");
# Author: dipankardas011

sysUpdate() {
  ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -u ubuntu --private-key ./pdf-terraform.pem -i '44.209.39.161,' ec2-cfg.yml
}

againDeployNewVersion() {
  ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -u ubuntu --private-key ./pdf-terraform.pem -i '44.209.39.161,' ec2-cfg-update.yml
}


if [ $# != 1 ]; then
  echo -n "
Help [1 argument required]
0 system update
1 again deploy
"
  exit 1
fi

choice=$1

if [ $choice -eq 0 ]; then
  sysUpdate
elif [ $choice -eq 1 ]; then
  againDeployNewVersion
else
  echo 'Invalid request'
  return 1
fi




================================================
FILE: deploy/IAC/ansible-terraform/docker-compose.yml
================================================
version: '3'

volumes:
  app_data_M:
  app_data_R:

networks:
  pdf-editor:
services:
  backend-merge:
    image: docker.io/dipugodocker/pdf-editor:backend-merge
    container_name: backend-merge
    ports:
      - "8080"
    networks:
      - pdf-editor
    volumes:
      - app_data_M:/go/src

  backend-rotate:
    image: docker.io/dipugodocker/pdf-editor:backend-rotate
    container_name: backend-rotate
    ports:
      - "8081"
    volumes:
      - app_data_R:/go/src
    networks:
      - pdf-editor

  frontend:
    depends_on:
      - backend-merge
      - backend-rotate
    image: docker.io/dipugodocker/pdf-editor:frontend
    container_name: frontend
    ports:
      - "80:80"
    networks:
      - pdf-editor

  trace:
    depends_on:
      - frontend
    image: jaegertracing/all-in-one
    container_name: jaeger-tracing-pdf
    ports:
    - "6831"
    - "6832"
    - "5778"
    - "16686:16686"
    - "4317"
    - "4318"
    - "14250"
    - "14268"
    - "14269"
    - "9411"
    networks:
      - pdf-editor



================================================
FILE: deploy/IAC/ansible-terraform/ec2-cfg-update.yml
================================================
---
- name: PDF Editor playbook
  hosts: all
  become: true
  tasks:
  - name: Ping my hosts
    ansible.builtin.ping:
  - name: Print message
    ansible.builtin.debug:
      msg: Hello from preview runner!!!

  - name: remove the running docker compose
    shell: 'cd /home/ubuntu/PDF-Editor/deploy/IAC/ansible-terraform/ && docker-compose down && sleep 2'

  - name: removing the docker images
    shell: 'docker rmi -f $(docker images -q) && docker volume prune -f'

  - name: run docker-compose again
    shell: 'cd /home/ubuntu/PDF-Editor/deploy/IAC/ansible-terraform/ && sudo docker-compose up -d && curl --head -X GET http://localhost/'



================================================
FILE: deploy/IAC/ansible-terraform/ec2-cfg.yml
================================================
---
- name: PDF Editor playbook
  hosts: all
  become: true
  tasks:
  - name: Ping my hosts
    ansible.builtin.ping:
  - name: Print message
    ansible.builtin.debug:
      msg: Hello from preview runner!!!
  - name: Git pull latest updates
    shell: "cd /home/ubuntu/PDF-Editor/ && git pull origin main && sudo apt -y update"



================================================
FILE: deploy/IAC/ansible-terraform/main.tf
================================================

terraform {
  backend "remote" {
    # The name of your Terraform Cloud organization.
    organization = "pdf-org"
    # The name of the Terraform Cloud workspace to store Terraform state files in.
    workspaces {
      name = "PDF-Editor"
    }
  }

}


provider "aws" {
  region = "us-east-1"
}

# $ export AWS_ACCESS_KEY_ID="<provide the keys>"
# $ export AWS_SECRET_ACCESS_KEY="<provide the keys>"

# 1. create vpc
resource "aws_vpc" "prod-vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    "Name" = "production"
  }
}

# 2. create internet gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.prod-vpc.id

  tags = {
    Name = "ig"
  }
}

# 3. create custom route table
resource "aws_route_table" "prod-route-table" {
  vpc_id = aws_vpc.prod-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  route {
    ipv6_cidr_block = "::/0"
    gateway_id      = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "prod-rt"
  }
}

# 4. create a subnet
resource "aws_subnet" "subnet-1" {
  vpc_id     = aws_vpc.prod-vpc.id
  cidr_block = "10.0.1.0/24"
  # cidr_block = var.subnet_prefix
  availability_zone = "us-east-1a"

  tags = {
    Name = "prod-subnet"
  }
}

# 5. associate subnet with route table
resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.subnet-1.id
  route_table_id = aws_route_table.prod-route-table.id
}

# 6. create security group to allow port 22, 80, 443
resource "aws_security_group" "allow_web" {
  name        = "allow_web_traffic"
  description = "Allow Web inbound traffic"
  vpc_id      = aws_vpc.prod-vpc.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # so as to make anyone to reach the server
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # so as to make anyone to reach the server
  }

  ingress {
    description = "Tracing"
    from_port   = 16686
    to_port     = 16686
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # so as to make anyone to reach the server
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_web"
  }
}

# 7. create a network interface with an ip in the subnet that was created in step 4
resource "aws_network_interface" "web-server-nic" {
  subnet_id       = aws_subnet.subnet-1.id
  private_ips     = ["10.0.1.50"]
  security_groups = [aws_security_group.allow_web.id]
}

# 8. assign an elastic ip to the network interface created in step 7
resource "aws_eip" "one" {
  depends_on = [
    aws_internet_gateway.gw
  ]
  vpc                       = true
  network_interface         = aws_network_interface.web-server-nic.id
  associate_with_private_ip = "10.0.1.50"
}

output "server_public_ip" { # it will print when terrafrom apply
  value = aws_eip.one.public_ip
}

# 9. create ubuntu server

resource "aws_instance" "web-server-ec2" {
  ami                  = "ami-052efd3df9dad4825"
  instance_type        = "t2.micro"
  availability_zone    = "us-east-1a" # it is hardcoded as aws will make different zones to subnet and ec2 creating error
  iam_instance_profile = "my-ssm-ec2-role"
  key_name             = "pdf-terraform"
  network_interface {
    device_index         = 0
    network_interface_id = aws_network_interface.web-server-nic.id
  }

  user_data = <<-EOF
    #!/bin/bash

    cd /home/ubuntu

    sudo apt update -y

    sudo apt install docker.io -y

    sudo usermod -aG docker ubuntu

    sudo apt install docker-compose -y

    git clone https://github.com/dipankardas011/PDF-Editor.git

    cd PDF-Editor/deploy/IAC/ansible-terraform
    sudo docker-compose up -d

    EOF

  tags = {
    "Name" = "web-server"
  }

  #  provisioner "local-exec" {
  # command = "sleep 120; ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -u ubuntu --private-key ./demo-key-pair.pem -i '${aws_instance.web-server-ec2.public_ip},' ec2-cfg.yml && curl --head ${aws_instance.web-server-ec2.public_ip}"
  # }
}




================================================
FILE: deploy/IAC/ansible-terraform/.gitignore
================================================
*.hcl
*.backup
*.tfstate
.terraform
*.pem


================================================
FILE: deploy/IAC/AWS-old/main.tf
================================================
variable "access_key" {
  description = "Enter your AWS Access Key: "
  type = string
}

variable "secret_key" {
  description = "Enter your AWS Secret Key: "
  type = string
}

provider "aws" {
  region     = "us-east-1"
  access_key = var.access_key
  secret_key = var.secret_key
}

# vpc
resource "aws_vpc" "prod-vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "pdf-editor-vpc"
  }
}

# internet gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.prod-vpc.id

  tags = {
    Name = "pdf-editor-gateway"
  }
}

# route table
resource "aws_route_table" "prod-rt" {
  vpc_id = aws_vpc.prod-vpc.id

  route {
    cidr_block = "0.0.0.0/0" # any ip can access
    gateway_id = aws_internet_gateway.gw.id
  }

  route {
    ipv6_cidr_block        = "::/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "pdf-editor-rt"
  }
}

# subnets
resource "aws_subnet" "prod-subnet" {
  vpc_id     = aws_vpc.prod-vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "pdf-editor-subnet"
  }
}

# join subnets and route table by association
resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.prod-subnet.id
  route_table_id = aws_route_table.prod-rt.id
}

variable "client-ip-access" {
  description = "ip address for the client to access the host"
  type = map(string)
}

variable "accessPort" {
  type = number
}
# security
resource "aws_security_group" "allow_http" {
  name        = "allow-web-traffic"
  description = "Network traffic allowed"
  vpc_id      = aws_vpc.prod-vpc.id

  ingress {
    description      = "HTTPS from pdf-editor"
    from_port        = var.accessPort
    to_port          = var.accessPort
    protocol         = "tcp"
    cidr_blocks      = [var.client-ip-access.https]
  }

  ingress {
    description      = "SSH from VPC"
    from_port        = 22
    to_port          = 22
    protocol         = "tcp"
    cidr_blocks      = [var.client-ip-access.ssh]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pdf-editor-security"
  }
}

# elastic ip
# It's recommended to denote that the AWS Instance or Elastic IP depends on the Internet Gateway. For example:
resource "aws_eip" "bar" {
  vpc = true

  associate_with_private_ip = "10.0.1.50"
  network_interface = aws_network_interface.prod-nic.id
  depends_on                = [aws_internet_gateway.gw]

  tags = {
    "Name" = "pdf-editor-eip"
  }
}

# network interface
resource "aws_network_interface" "prod-nic" {
  subnet_id       = aws_subnet.prod-subnet.id
  private_ips     = ["10.0.1.50"]
  security_groups = [aws_security_group.allow_http.id]

  tags = {
    "Name" = "pdf-editor-nic"
  }
}

# ec2
resource "aws_instance" "prod-ec2" {
  ami           = "ami-0cff7528ff583bf9a" 
  instance_type = "t2.micro"
  availability_zone = "us-east-1a"

  network_interface {
    network_interface_id = aws_network_interface.prod-nic.id
    device_index         = 0
  }

  tags = {
    "Name" = "pdf-editor-ec2"
  }

  key_name = "terraform-access-ec2"

  user_data = <<-EOF
    #!/bin/bash
    yum install -y git qpdf
    
    cd /home/ec2-user

    git clone https://github.com/dipankardas011/PDF-Editor.git
    
    cd PDF-Editor
    
    cp -v pdf-editor.service /etc/systemd/system

    systemctl daemon-reload

    systemctl start pdf-editor.service

    EOF
}

output "server_public_ip" {
  value = aws_eip.bar.public_ip
}


================================================
FILE: deploy/IAC/AWS-old/terraform.tfvars
================================================
client-ip-access = {
  ssh = "0.0.0.0/0"
  https = "0.0.0.0/0"
}
#  192.168.196.215 for ssh
accessPort = 8080


================================================
FILE: deploy/Jenkins/docker-compose.yml
================================================
version: '3'

volumes:
  jenkins:

services:
  jenkins:
    build:
      context: .
    image: jenkins11
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock



================================================
FILE: deploy/Jenkins/dockerfile
================================================
FROM jenkins/jenkins

USER root
RUN apt update -y
RUN apt install -y docker.io

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/jenkins.sh"]
EXPOSE 8080/tcp
EXPOSE 50000/tcp



================================================
FILE: deploy/Jenkins/ec2-user.sh
================================================
#!/bin/bash

# amazon ec2 instance
sudo yum update -y
sudo yum upgrade
sudo amazon-linux-extras install java-openjdk11 -y

sudo yum install docker -y

sudo systemctl start docker
sudo systemctl enable docker

sudo usermod -aG docker ec2-user

mkdir jenkins-server
cd jenkins-server/

cat <<EOF > dockerfile
FROM jenkins/jenkins

USER root
RUN apt update -y
RUN apt install -y docker.io

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/jenkins.sh"]
EXPOSE 8080/tcp
EXPOSE 50000/tcp
EOF

docker build -t jenkins11 .

docker run --rm -d \
-p 8080:8080 \
-p 50000:50000 \
-v jenkins:/var/jenkins_home \
-v /var/run/docker.sock:/var/run/docker.sock \
--name jenkins jenkins11





================================================
FILE: deploy/litmus-chaos/backend-merge-delete.yaml
================================================
kind: Workflow
apiVersion: argoproj.io/v1alpha1
metadata:
  name: pdf-backend-merge-pod-delete-1661574540
  namespace: litmus
  creationTimestamp: null
  labels:
    subject: pdf-backend-merge-pod-delete_litmus
    workflows.argoproj.io/controller-instanceid: 398d4add-47c8-499d-add0-314b0e2015d5
spec:
  templates:
    - name: custom-chaos
      inputs: {}
      outputs: {}
      metadata: {}
      steps:
        - - name: install-chaos-experiments
            template: install-chaos-experiments
            arguments: {}
        - - name: pod-delete-2dj
            template: pod-delete-2dj
            arguments: {}
    - name: install-chaos-experiments
      inputs:
        artifacts:
          - name: pod-delete-2dj
            path: /tmp/pod-delete-2dj.yaml
            raw:
              data: >
                apiVersion: litmuschaos.io/v1alpha1

                description:
                  message: |
                    Deletes a pod belonging to a deployment/statefulset/daemonset
                kind: ChaosExperiment

                metadata:
                  name: pod-delete
                  labels:
                    name: pod-delete
                    app.kubernetes.io/part-of: litmus
                    app.kubernetes.io/component: chaosexperiment
                    app.kubernetes.io/version: 2.11.0
                spec:
                  definition:
                    scope: Namespaced
                    permissions:
                      - apiGroups:
                          - ""
                        resources:
                          - pods
                        verbs:
                          - create
                          - delete
                          - get
                          - list
                          - patch
                          - update
                          - deletecollection
                      - apiGroups:
                          - ""
                        resources:
                          - events
                        verbs:
                          - create
                          - get
                          - list
                          - patch
                          - update
                      - apiGroups:
                          - ""
                        resources:
                          - configmaps
                        verbs:
                          - get
                          - list
                      - apiGroups:
                          - ""
                        resources:
                          - pods/log
                        verbs:
                          - get
                          - list
                          - watch
                      - apiGroups:
                          - ""
                        resources:
                          - pods/exec
                        verbs:
                          - get
                          - list
                          - create
                      - apiGroups:
                          - apps
                        resources:
                          - deployments
                          - statefulsets
                          - replicasets
                          - daemonsets
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - apps.openshift.io
                        resources:
                          - deploymentconfigs
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - ""
                        resources:
                          - replicationcontrollers
                        verbs:
                          - get
                          - list
                      - apiGroups:
                          - argoproj.io
                        resources:
                          - rollouts
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - batch
                        resources:
                          - jobs
                        verbs:
                          - create
                          - list
                          - get
                          - delete
                          - deletecollection
                      - apiGroups:
                          - litmuschaos.io
                        resources:
                          - chaosengines
                          - chaosexperiments
                          - chaosresults
                        verbs:
                          - create
                          - list
                          - get
                          - patch
                          - update
                          - delete
                    image: litmuschaos/go-runner:2.11.0
                    imagePullPolicy: Always
                    args:
                      - -c
                      - ./experiments -name pod-delete
                    command:
                      - /bin/bash
                    env:
                      - name: TOTAL_CHAOS_DURATION
                        value: "15"
                      - name: RAMP_TIME
                        value: ""
                      - name: FORCE
                        value: "true"
                      - name: CHAOS_INTERVAL
                        value: "5"
                      - name: PODS_AFFECTED_PERC
                        value: ""
                      - name: LIB
                        value: litmus
                      - name: TARGET_PODS
                        value: ""
                      - name: NODE_LABEL
                        value: ""
                      - name: SEQUENCE
                        value: parallel
                    labels:
                      name: pod-delete
                      app.kubernetes.io/part-of: litmus
                      app.kubernetes.io/component: experiment-job
                      app.kubernetes.io/version: 2.11.0
      outputs: {}
      metadata: {}
      container:
        name: ""
        image: litmuschaos/k8s:2.11.0
        command:
          - sh
          - -c
        args:
          - kubectl apply -f /tmp/pod-delete-2dj.yaml -n
            {{workflow.parameters.adminModeNamespace}} &&  sleep 30
        resources: {}
    - name: pod-delete-2dj
      inputs:
        artifacts:
          - name: pod-delete-2dj
            path: /tmp/chaosengine-pod-delete-2dj.yaml
            raw:
              data: >
                apiVersion: litmuschaos.io/v1alpha1

                kind: ChaosEngine

                metadata:
                  namespace: "{{workflow.parameters.adminModeNamespace}}"
                  generateName: pod-delete-2dj
                  labels:
                    instance_id: b5756ea7-596b-4f42-9bc4-e16628cb7403
                spec:
                  appinfo:
                    appns: pdf-editor-ns
                    applabel: app=backend-merge
                    appkind: rollout
                  engineState: active
                  chaosServiceAccount: litmus-admin
                  experiments:
                    - name: pod-delete
                      spec:
                        components:
                          env:
                            - name: TOTAL_CHAOS_DURATION
                              value: "10"
                            - name: CHAOS_INTERVAL
                              value: "10"
                            - name: FORCE
                              value: "false"
                            - name: PODS_AFFECTED_PERC
                              value: ""
                        probe:
                          - name: get /greet
                            type: httpProbe
                            mode: Continuous
                            runProperties:
                              probeTimeout: 1
                              retry: 1
                              interval: 1
                              stopOnFailure: false
                            httpProbe/inputs:
                              url: http://backend-merge.pdf-editor-ns.svc.cluster.local:8080/greet
                              method:
                                get:
                                  criteria: ==
                                  responseCode: "200"
                          - name: shouldn't get /upload
                            type: httpProbe
                            mode: Continuous
                            runProperties:
                              probeTimeout: 1
                              retry: 1
                              interval: 1
                              stopOnFailure: false
                            httpProbe/inputs:
                              url: http://backend-merge.pdf-editor-ns.svc.cluster.local:8080/upload
      outputs: {}
      metadata:
        labels:
          weight: "10"
      container:
        name: ""
        image: litmuschaos/litmus-checker:2.11.0
        args:
          - -file=/tmp/chaosengine-pod-delete-2dj.yaml
          - -saveName=/tmp/engine-name
        resources: {}
  entrypoint: custom-chaos
  arguments:
    parameters:
      - name: adminModeNamespace
        value: litmus
  serviceAccountName: argo-chaos
  securityContext:
    runAsUser: 1000
    runAsNonRoot: true
status:
  ? startedAt
  ? finishedAt




================================================
FILE: deploy/litmus-chaos/backend-rotate-pod-delete.yaml
================================================
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  name: pdf-backend-rotate-pod-delete-1661575311
  namespace: litmus
  labels:
    subject: pdf-backend-rotate-pod-delete_litmus
spec:
  arguments:
    parameters:
      - name: adminModeNamespace
        value: litmus
  entrypoint: custom-chaos
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  serviceAccountName: argo-chaos
  templates:
    - name: custom-chaos
      steps:
        - - name: install-chaos-experiments
            template: install-chaos-experiments
        - - name: pod-delete-fng
            template: pod-delete-fng
    - name: install-chaos-experiments
      inputs:
        artifacts:
          - name: pod-delete-fng
            path: /tmp/pod-delete-fng.yaml
            raw:
              data: >
                apiVersion: litmuschaos.io/v1alpha1

                description:
                  message: |
                    Deletes a pod belonging to a deployment/statefulset/daemonset
                kind: ChaosExperiment

                metadata:
                  name: pod-delete
                  labels:
                    name: pod-delete
                    app.kubernetes.io/part-of: litmus
                    app.kubernetes.io/component: chaosexperiment
                    app.kubernetes.io/version: 2.11.0
                spec:
                  definition:
                    scope: Namespaced
                    permissions:
                      - apiGroups:
                          - ""
                        resources:
                          - pods
                        verbs:
                          - create
                          - delete
                          - get
                          - list
                          - patch
                          - update
                          - deletecollection
                      - apiGroups:
                          - ""
                        resources:
                          - events
                        verbs:
                          - create
                          - get
                          - list
                          - patch
                          - update
                      - apiGroups:
                          - ""
                        resources:
                          - configmaps
                        verbs:
                          - get
                          - list
                      - apiGroups:
                          - ""
                        resources:
                          - pods/log
                        verbs:
                          - get
                          - list
                          - watch
                      - apiGroups:
                          - ""
                        resources:
                          - pods/exec
                        verbs:
                          - get
                          - list
                          - create
                      - apiGroups:
                          - apps
                        resources:
                          - deployments
                          - statefulsets
                          - replicasets
                          - daemonsets
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - apps.openshift.io
                        resources:
                          - deploymentconfigs
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - ""
                        resources:
                          - replicationcontrollers
                        verbs:
                          - get
                          - list
                      - apiGroups:
                          - argoproj.io
                        resources:
                          - rollouts
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - batch
                        resources:
                          - jobs
                        verbs:
                          - create
                          - list
                          - get
                          - delete
                          - deletecollection
                      - apiGroups:
                          - litmuschaos.io
                        resources:
                          - chaosengines
                          - chaosexperiments
                          - chaosresults
                        verbs:
                          - create
                          - list
                          - get
                          - patch
                          - update
                          - delete
                    image: litmuschaos/go-runner:2.11.0
                    imagePullPolicy: Always
                    args:
                      - -c
                      - ./experiments -name pod-delete
                    command:
                      - /bin/bash
                    env:
                      - name: TOTAL_CHAOS_DURATION
                        value: "15"
                      - name: RAMP_TIME
                        value: ""
                      - name: FORCE
                        value: "true"
                      - name: CHAOS_INTERVAL
                        value: "5"
                      - name: PODS_AFFECTED_PERC
                        value: ""
                      - name: LIB
                        value: litmus
                      - name: TARGET_PODS
                        value: ""
                      - name: NODE_LABEL
                        value: ""
                      - name: SEQUENCE
                        value: parallel
                    labels:
                      name: pod-delete
                      app.kubernetes.io/part-of: litmus
                      app.kubernetes.io/component: experiment-job
                      app.kubernetes.io/version: 2.11.0
      container:
        args:
          - kubectl apply -f /tmp/pod-delete-fng.yaml -n
            {{workflow.parameters.adminModeNamespace}} &&  sleep 30
        command:
          - sh
          - -c
        image: litmuschaos/k8s:2.11.0
    - name: pod-delete-fng
      inputs:
        artifacts:
          - name: pod-delete-fng
            path: /tmp/chaosengine-pod-delete-fng.yaml
            raw:
              data: >
                apiVersion: litmuschaos.io/v1alpha1

                kind: ChaosEngine

                metadata:
                  namespace: "{{workflow.parameters.adminModeNamespace}}"
                  generateName: pod-delete-fng
                  labels:
                    instance_id: 5db80b5d-18f1-4732-8113-974ffca98a87
                spec:
                  appinfo:
                    appns: pdf-editor-ns
                    applabel: app=backend-rotate
                    appkind: rollout
                  engineState: active
                  chaosServiceAccount: litmus-admin
                  experiments:
                    - name: pod-delete
                      spec:
                        components:
                          env:
                            - name: TOTAL_CHAOS_DURATION
                              value: "10"
                            - name: CHAOS_INTERVAL
                              value: "10"
                            - name: FORCE
                              value: "false"
                            - name: PODS_AFFECTED_PERC
                              value: ""
                        probe:
                          - name: get /greet
                            type: httpProbe
                            mode: Continuous
                            runProperties:
                              probeTimeout: 1
                              retry: 1
                              interval: 1
                              stopOnFailure: false
                            httpProbe/inputs:
                              url: http://backend-rotate.pdf-editor-ns.svc.cluster.local:8081/greet
                              method:
                                get:
                                  criteria: ==
                                  responseCode: "200"
      container:
        args:
          - -file=/tmp/chaosengine-pod-delete-fng.yaml
          - -saveName=/tmp/engine-name
        image: litmuschaos/litmus-checker:2.11.0



================================================
FILE: deploy/litmus-chaos/frontend-pod-chaos.yaml
================================================
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  name: frontend-net-latency-1661577676
  namespace: litmus
  labels:
    subject: frontend-net-latency_litmus
spec:
  arguments:
    parameters:
      - name: adminModeNamespace
        value: litmus
  entrypoint: custom-chaos
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  serviceAccountName: argo-chaos
  templates:
    - name: custom-chaos
      steps:
        - - name: install-chaos-experiments
            template: install-chaos-experiments
        - - name: pod-network-latency-qpk
            template: pod-network-latency-qpk
    - name: install-chaos-experiments
      inputs:
        artifacts:
          - name: pod-network-latency-qpk
            path: /tmp/pod-network-latency-qpk.yaml
            raw:
              data: >
                apiVersion: litmuschaos.io/v1alpha1

                description:
                  message: |
                    Injects network latency on pods belonging to an app deployment
                kind: ChaosExperiment

                metadata:
                  name: pod-network-latency
                  labels:
                    name: pod-network-latency
                    app.kubernetes.io/part-of: litmus
                    app.kubernetes.io/component: chaosexperiment
                    app.kubernetes.io/version: 2.11.0
                spec:
                  definition:
                    scope: Namespaced
                    permissions:
                      - apiGroups:
                          - ""
                        resources:
                          - pods
                        verbs:
                          - create
                          - delete
                          - get
                          - list
                          - patch
                          - update
                          - deletecollection
                      - apiGroups:
                          - ""
                        resources:
                          - events
                        verbs:
                          - create
                          - get
                          - list
                          - patch
                          - update
                      - apiGroups:
                          - ""
                        resources:
                          - configmaps
                        verbs:
                          - get
                          - list
                      - apiGroups:
                          - ""
                        resources:
                          - pods/log
                        verbs:
                          - get
                          - list
                          - watch
                      - apiGroups:
                          - ""
                        resources:
                          - pods/exec
                        verbs:
                          - get
                          - list
                          - create
                      - apiGroups:
                          - apps
                        resources:
                          - deployments
                          - statefulsets
                          - replicasets
                          - daemonsets
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - apps.openshift.io
                        resources:
                          - deploymentconfigs
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - ""
                        resources:
                          - replicationcontrollers
                        verbs:
                          - get
                          - list
                      - apiGroups:
                          - argoproj.io
                        resources:
                          - rollouts
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - batch
                        resources:
                          - jobs
                        verbs:
                          - create
                          - list
                          - get
                          - delete
                          - deletecollection
                      - apiGroups:
                          - litmuschaos.io
                        resources:
                          - chaosengines
                          - chaosexperiments
                          - chaosresults
                        verbs:
                          - create
                          - list
                          - get
                          - patch
                          - update
                          - delete
                    image: litmuschaos/go-runner:2.11.0
                    imagePullPolicy: Always
                    args:
                      - -c
                      - ./experiments -name pod-network-latency
                    command:
                      - /bin/bash
                    env:
                      - name: TARGET_CONTAINER
                        value: ""
                      - name: NETWORK_INTERFACE
                        value: eth0
                      - name: LIB_IMAGE
                        value: litmuschaos/go-runner:2.11.0
                      - name: TC_IMAGE
                        value: gaiadocker/iproute2
                      - name: NETWORK_LATENCY
                        value: "2000"
                      - name: TOTAL_CHAOS_DURATION
                        value: "60"
                      - name: RAMP_TIME
                        value: ""
                      - name: JITTER
                        value: "0"
                      - name: LIB
                        value: litmus
                      - name: PODS_AFFECTED_PERC
                        value: ""
                      - name: TARGET_PODS
                        value: ""
                      - name: CONTAINER_RUNTIME
                        value: docker
                      - name: DESTINATION_IPS
                        value: ""
                      - name: DESTINATION_HOSTS
                        value: ""
                      - name: SOCKET_PATH
                        value: /var/run/docker.sock
                      - name: NODE_LABEL
                        value: ""
                      - name: SEQUENCE
                        value: parallel
                    labels:
                      name: pod-network-latency
                      app.kubernetes.io/part-of: litmus
                      app.kubernetes.io/component: experiment-job
                      app.kubernetes.io/runtime-api-usage: "true"
                      app.kubernetes.io/version: 2.11.0
      container:
        args:
          - kubectl apply -f /tmp/pod-network-latency-qpk.yaml -n
            {{workflow.parameters.adminModeNamespace}} &&  sleep 30
        command:
          - sh
          - -c
        image: litmuschaos/k8s:2.11.0
    - name: pod-network-latency-qpk
      inputs:
        artifacts:
          - name: pod-network-latency-qpk
            path: /tmp/chaosengine-pod-network-latency-qpk.yaml
            raw:
              data: >
                apiVersion: litmuschaos.io/v1alpha1

                kind: ChaosEngine

                metadata:
                  namespace: "{{workflow.parameters.adminModeNamespace}}"
                  generateName: pod-network-latency-qpk
                  labels:
                    instance_id: 34e9da9f-3cf1-4b66-9d1a-53db773279af
                spec:
                  engineState: active
                  appinfo:
                    appns: pdf-editor-ns
                    applabel: app=frontend-pdf
                    appkind: rollout
                  chaosServiceAccount: litmus-admin
                  experiments:
                    - name: pod-network-latency
                      spec:
                        components:
                          env:
                            - name: TOTAL_CHAOS_DURATION
                              value: "60"
                            - name: NETWORK_LATENCY
                              value: "2000"
                            - name: JITTER
                              value: "0"
                            - name: CONTAINER_RUNTIME
                              value: docker
                            - name: SOCKET_PATH
                              value: /var/run/docker.sock
                            - name: PODS_AFFECTED_PERC
                              value: ""
                        probe:
                          - name: xzcxzxz
                            type: httpProbe
                            mode: Continuous
                            runProperties:
                              probeTimeout: 10000
                              retry: 2
                              interval: 2
                              stopOnFailure: false
                            httpProbe/inputs:
                              url: http://frontend-lb.pdf-editor-ns.svc.cluster.local:80
                              method:
                                get:
                                  criteria: ==
                                  responseCode: "200"
      container:
        args:
          - -file=/tmp/chaosengine-pod-network-latency-qpk.yaml
          - -saveName=/tmp/engine-name
        image: litmuschaos/litmus-checker:2.11.0

---

apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  name: frontend-cpu-hog-1661577974
  namespace: litmus
  labels:
    subject: frontend-cpu-hog_litmus
spec:
  arguments:
    parameters:
      - name: adminModeNamespace
        value: litmus
  entrypoint: custom-chaos
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  serviceAccountName: argo-chaos
  templates:
    - name: custom-chaos
      steps:
        - - name: install-chaos-experiments
            template: install-chaos-experiments
        - - name: pod-cpu-hog-03q
            template: pod-cpu-hog-03q
    - name: install-chaos-experiments
      inputs:
        artifacts:
          - name: pod-cpu-hog-03q
            path: /tmp/pod-cpu-hog-03q.yaml
            raw:
              data: >
                apiVersion: litmuschaos.io/v1alpha1

                description:
                  message: |
                    Injects cpu consumption on pods belonging to an app deployment
                kind: ChaosExperiment

                metadata:
                  name: pod-cpu-hog
                  labels:
                    name: pod-cpu-hog
                    app.kubernetes.io/part-of: litmus
                    app.kubernetes.io/component: chaosexperiment
                    app.kubernetes.io/version: 2.11.0
                spec:
                  definition:
                    scope: Namespaced
                    permissions:
                      - apiGroups:
                          - ""
                        resources:
                          - pods
                        verbs:
                          - create
                          - delete
                          - get
                          - list
                          - patch
                          - update
                          - deletecollection
                      - apiGroups:
                          - ""
                        resources:
                          - events
                        verbs:
                          - create
                          - get
                          - list
                          - patch
                          - update
                      - apiGroups:
                          - ""
                        resources:
                          - configmaps
                        verbs:
                          - get
                          - list
                      - apiGroups:
                          - ""
                        resources:
                          - pods/log
                        verbs:
                          - get
                          - list
                          - watch
                      - apiGroups:
                          - ""
                        resources:
                          - pods/exec
                        verbs:
                          - get
                          - list
                          - create
                      - apiGroups:
                          - apps
                        resources:
                          - deployments
                          - statefulsets
                          - replicasets
                          - daemonsets
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - apps.openshift.io
                        resources:
                          - deploymentconfigs
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - ""
                        resources:
                          - replicationcontrollers
                        verbs:
                          - get
                          - list
                      - apiGroups:
                          - argoproj.io
                        resources:
                          - rollouts
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - batch
                        resources:
                          - jobs
                        verbs:
                          - create
                          - list
                          - get
                          - delete
                          - deletecollection
                      - apiGroups:
                          - litmuschaos.io
                        resources:
                          - chaosengines
                          - chaosexperiments
                          - chaosresults
                        verbs:
                          - create
                          - list
                          - get
                          - patch
                          - update
                          - delete
                    image: litmuschaos/go-runner:2.11.0
                    imagePullPolicy: Always
                    args:
                      - -c
                      - ./experiments -name pod-cpu-hog
                    command:
                      - /bin/bash
                    env:
                      - name: TOTAL_CHAOS_DURATION
                        value: "60"
                      - name: CPU_CORES
                        value: "1"
                      - name: CPU_LOAD
                        value: "100"
                      - name: PODS_AFFECTED_PERC
                        value: ""
                      - name: RAMP_TIME
                        value: ""
                      - name: LIB
                        value: litmus
                      - name: LIB_IMAGE
                        value: litmuschaos/go-runner:2.11.0
                      - name: STRESS_IMAGE
                        value: alexeiled/stress-ng:latest-ubuntu
                      - name: CONTAINER_RUNTIME
                        value: docker
                      - name: SOCKET_PATH
                        value: /var/run/docker.sock
                      - name: TARGET_PODS
                        value: ""
                      - name: NODE_LABEL
                        value: ""
                      - name: SEQUENCE
                        value: parallel
                    labels:
                      name: pod-cpu-hog
                      app.kubernetes.io/part-of: litmus
                      app.kubernetes.io/component: experiment-job
                      app.kubernetes.io/runtime-api-usage: "true"
                      app.kubernetes.io/version: 2.11.0
      container:
        args:
          - kubectl apply -f /tmp/pod-cpu-hog-03q.yaml -n
            {{workflow.parameters.adminModeNamespace}} &&  sleep 30
        command:
          - sh
          - -c
        image: litmuschaos/k8s:2.11.0
    - name: pod-cpu-hog-03q
      inputs:
        artifacts:
          - name: pod-cpu-hog-03q
            path: /tmp/chaosengine-pod-cpu-hog-03q.yaml
            raw:
              data: >
                apiVersion: litmuschaos.io/v1alpha1

                kind: ChaosEngine

                metadata:
                  namespace: "{{workflow.parameters.adminModeNamespace}}"
                  generateName: pod-cpu-hog-03q
                  labels:
                    instance_id: 86b67701-a5a8-45e1-a054-7ca238f2c938
                spec:
                  engineState: active
                  appinfo:
                    appns: pdf-editor-ns
                    applabel: app=frontend-pdf
                    appkind: rollout
                  chaosServiceAccount: litmus-admin
                  experiments:
                    - name: pod-cpu-hog
                      spec:
                        components:
                          env:
                            - name: TOTAL_CHAOS_DURATION
                              value: "60"
                            - name: CPU_CORES
                              value: "1"
                            - name: PODS_AFFECTED_PERC
                              value: ""
                            - name: CONTAINER_RUNTIME
                              value: docker
                            - name: SOCKET_PATH
                              value: /var/run/docker.sock
                        probe:
                          - name: cpu hog
                            type: httpProbe
                            mode: Continuous
                            runProperties:
                              probeTimeout: 100
                              retry: 1
                              interval: 3
                              stopOnFailure: false
                            httpProbe/inputs:
                              url: http://frontend-lb.pdf-editor-ns.svc.cluster.local:80
                              method:
                                get:
                                  criteria: ==
                                  responseCode: "200"
      container:
        args:
          - -file=/tmp/chaosengine-pod-cpu-hog-03q.yaml
          - -saveName=/tmp/engine-name
        image: litmuschaos/litmus-checker:2.11.0
...


================================================
FILE: deploy/litmus-chaos/frontend-pod-delete.yaml
================================================
kind: Workflow
apiVersion: argoproj.io/v1alpha1
metadata:
  name: frontend-pod-delete
  namespace: litmus
  creationTimestamp: null
  labels:
    cluster_id: 398d4add-47c8-499d-add0-314b0e2015d5
    subject: frontend-pod-delete_litmus
    workflow_id: 29ea6a83-7288-4083-81ee-8871befba7cf
    workflows.argoproj.io/controller-instanceid: 398d4add-47c8-499d-add0-314b0e2015d5
spec:
  templates:
    - name: custom-chaos
      inputs: {}
      outputs: {}
      metadata: {}
      steps:
        - - name: install-chaos-experiments
            template: install-chaos-experiments
            arguments: {}
        - - name: pod-delete-9hb
            template: pod-delete-9hb
            arguments: {}
    - name: install-chaos-experiments
      inputs:
        artifacts:
          - name: pod-delete-9hb
            path: /tmp/pod-delete-9hb.yaml
            raw:
              data: >
                apiVersion: litmuschaos.io/v1alpha1

                description:
                  message: |
                    Deletes a pod belonging to a deployment/statefulset/daemonset
                kind: ChaosExperiment

                metadata:
                  name: pod-delete
                  labels:
                    name: pod-delete
                    app.kubernetes.io/part-of: litmus
                    app.kubernetes.io/component: chaosexperiment
                    app.kubernetes.io/version: 2.11.0
                spec:
                  definition:
                    scope: Namespaced
                    permissions:
                      - apiGroups:
                          - ""
                        resources:
                          - pods
                        verbs:
                          - create
                          - delete
                          - get
                          - list
                          - patch
                          - update
                          - deletecollection
                      - apiGroups:
                          - ""
                        resources:
                          - events
                        verbs:
                          - create
                          - get
                          - list
                          - patch
                          - update
                      - apiGroups:
                          - ""
                        resources:
                          - configmaps
                        verbs:
                          - get
                          - list
                      - apiGroups:
                          - ""
                        resources:
                          - pods/log
                        verbs:
                          - get
                          - list
                          - watch
                      - apiGroups:
                          - ""
                        resources:
                          - pods/exec
                        verbs:
                          - get
                          - list
                          - create
                      - apiGroups:
                          - apps
                        resources:
                          - deployments
                          - statefulsets
                          - replicasets
                          - daemonsets
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - apps.openshift.io
                        resources:
                          - deploymentconfigs
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - ""
                        resources:
                          - replicationcontrollers
                        verbs:
                          - get
                          - list
                      - apiGroups:
                          - argoproj.io
                        resources:
                          - rollouts
                        verbs:
                          - list
                          - get
                      - apiGroups:
                          - batch
                        resources:
                          - jobs
                        verbs:
                          - create
                          - list
                          - get
                          - delete
                          - deletecollection
                      - apiGroups:
                          - litmuschaos.io
                        resources:
                          - chaosengines
                          - chaosexperiments
                          - chaosresults
                        verbs:
                          - create
                          - list
                          - get
                          - patch
                          - update
                          - delete
                    image: litmuschaos/go-runner:2.11.0
                    imagePullPolicy: Always
                    args:
                      - -c
                      - ./experiments -name pod-delete
                    command:
                      - /bin/bash
                    env:
                      - name: TOTAL_CHAOS_DURATION
                        value: "15"
                      - name: RAMP_TIME
                        value: ""
                      - name: FORCE
                        value: "true"
                      - name: CHAOS_INTERVAL
                        value: "5"
                      - name: PODS_AFFECTED_PERC
                        value: ""
                      - name: LIB
                        value: litmus
                      - name: TARGET_PODS
                        value: ""
                      - name: NODE_LABEL
                        value: ""
                      - name: SEQUENCE
                        value: parallel
                    labels:
                      name: pod-delete
                      app.kubernetes.io/part-of: litmus
                      app.kubernetes.io/component: experiment-job
                      app.kubernetes.io/version: 2.11.0
      outputs: {}
      metadata: {}
      container:
        name: ""
        image: litmuschaos/k8s:2.11.0
        command:
          - sh
          - -c
        args:
          - kubectl apply -f /tmp/pod-delete-9hb.yaml -n
            {{workflow.parameters.adminModeNamespace}} &&  sleep 30
        resources: {}
    - name: pod-delete-9hb
      inputs:
        artifacts:
          - name: pod-delete-9hb
            path: /tmp/chaosengine-pod-delete-9hb.yaml
            raw:
              data: >
                apiVersion: litmuschaos.io/v1alpha1

                kind: ChaosEngine

                metadata:
                  namespace: "{{workflow.parameters.adminModeNamespace}}"
                  generateName: pod-delete-9hb
                  labels:
                    instance_id: 3cec6ead-bae2-40be-a8cb-432e72a239ef
                spec:
                  appinfo:
                    appns: pdf-editor-ns
                    applabel: app=frontend-pdf
                    appkind: rollout
                  engineState: active
                  chaosServiceAccount: litmus-admin
                  experiments:
                    - name: pod-delete
                      spec:
                        components:
                          env:
                            - name: TOTAL_CHAOS_DURATION
                              value: "10"
                            - name: CHAOS_INTERVAL
                              value: "10"
                            - name: FORCE
                              value: "false"
                            - name: PODS_AFFECTED_PERC
                              value: ""
                        probe:
                          - name: pdf-editor-frontend /
                            type: httpProbe
                            mode: Continuous
                            runProperties:
                              probeTimeout: 1
                              retry: 1
                              interval: 1
                              stopOnFailure: false
                            httpProbe/inputs:
                              url: http://frontend-lb.pdf-editor-ns.svc.cluster.local:80/
                              method:
                                get:
                                  criteria: ==
                                  responseCode: "200"
      outputs: {}
      metadata:
        labels:
          weight: "10"
      container:
        name: ""
        image: litmuschaos/litmus-checker:2.11.0
        args:
          - -file=/tmp/chaosengine-pod-delete-9hb.yaml
          - -saveName=/tmp/engine-name
        resources: {}
  entrypoint: custom-chaos
  arguments:
    parameters:
      - name: adminModeNamespace
        value: litmus
  serviceAccountName: argo-chaos
  securityContext:
    runAsUser: 1000
    runAsNonRoot: true
status:
  ? startedAt
  ? finishedAt



================================================
FILE: deploy/Logging/deploy.yml
================================================
# # Grafana Loki
# ---
# apiVersion: apps/v1
# kind: Deployment
# metadata:
#   name: loki
#   labels:
#     app.kubernetes.io/name: loki
#     stack: logging
# spec:
#   selector:
#     matchLabels:
#       app.kubernetes.io/name: loki
#       stack: logging
#   replicas: 2
#   template:
#     metadata:
#       labels:
#         app.kubernetes.io/name: loki
#         stack: logging
#     spec:
#       containers:
#         - name: grafana-loki
#           image: grafana/loki:2.6.1
#           args: ["-config.file=/etc/loki/local-config.yaml"]
# ---
# apiVersion: v1
# kind: Service
# metadata:
#   name: loki
#   labels:
#     app.kubernetes.io/service: loki
#     stack: logging
# spec:
#   selector:
#     app.kubernetes.io/name: loki
#     stack: logging
#   type: ClusterIP
#   ports:
#     - name: web
#       targetPort: 3100
#       port: 3100
# ---

# # FluentBit
# #-----------
# apiVersion: apps/v1
# kind: DaemonSet
# metadata:
#   name: fluent-bit
#   labels:
#     app.kubernetes.io/name: fluent-bit
#     stack: logging
# spec:
#   selector:
#     matchLabels:
#       app.kubernetes.io/name: fluent-bit
#       stack: logging
#   replicas: 2

#   template:
#     metadata:
#       labels:
#         app.kubernetes.io/name: fluent-bit
#         stack: logging

#     spec:
#       containers:
#       - name: fluent-bit
#         image: grafana/fluent-bit-plugin-loki:latest
#         env:
#           - name: LOG_PATH
#             value: "/var/log/pods/*/*/*.log"
#           - name: LOKI_URL
#             value: "http://loki:3100/loki/api/v1/push"
#         securityContext:
#           privileged: true
#         volumeMounts:
#         - mountPath: /var/log/
#           name: mount-docker-containers
#       volumes:
#       - name: mount-docker-containers
#         hostPath:
#           # directory location on host
#           path: /var/log/
#           # this field is optional
#           type: Directory
# ---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  labels:
    app.kubernetes.io/name: grafana
    stack: logging
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: grafana
      stack: logging
  replicas: 2
  template:
    metadata:
      labels:
        app.kubernetes.io/name: grafana
        stack: logging
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        env:
        - name: GF_AUTH_DISABLE_LOGIN_FORM
          value: "true"
        - name: GF_AUTH_ANONYMOUS_ENABLED
          value: "true"
        - name: GF_AUTH_ANONYMOUS_ORG_ROLE
          value: "Admin"
---
apiVersion: v1
kind: Service
metadata:
  name: grafana
  labels:
    app.kubernetes.io/service: grafana
    stack: logging
spec:
  selector:
    app.kubernetes.io/name: grafana
    stack: logging
  type: NodePort
  ports:
  - port: 3000
    targetPort: 3000

      # use http://loki-stack-headless:3100
...



================================================
FILE: deploy/Logging/fluentd.yaml.bk
================================================
---

apiVersion: v1
kind: Namespace
metadata:
  name: logging

---

apiVersion: v1
kind: ServiceAccount
metadata:
  name: fluent-bit
  namespace: logging
---

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: fluent-bit-read
rules:
- apiGroups: [""]
  resources:
  - namespaces
  - pods
  verbs: ["get", "list", "watch"]

---

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: fluent-bit-read
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: fluent-bit-read
subjects:
- kind: ServiceAccount
  name: fluent-bit
  namespace: logging

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
  namespace: logging
  labels:
    k8s-app: fluent-bit
data:
  # Configuration files: server, input, filters and output
  # ======================================================
  fluent-bit.conf: |
    [SERVICE]
        Flush         1
        Log_Level     info
        Daemon        off
        Parsers_File  parsers.conf
        HTTP_Server   On
        HTTP_Listen   0.0.0.0
        HTTP_Port     2020

    @INCLUDE input-kubernetes.conf
    @INCLUDE filter-kubernetes.conf
    @INCLUDE output-loki.conf

  input-kubernetes.conf: |
    [INPUT]
        Name              tail
        Tag               kube.*
        Path              /var/log/containers/*.log
        Parser            docker
        DB                /var/log/flb_kube.db
        Mem_Buf_Limit     5MB
        Skip_Long_Lines   On
        Refresh_Interval  10

  filter-kubernetes.conf: |
    [FILTER]
        Name                kubernetes
        Match               kube.*
        Kube_URL            https://kubernetes.default.svc:443
        Kube_CA_File        /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        Kube_Token_File     /var/run/secrets/kubernetes.io/serviceaccount/token
        Kube_Tag_Prefix     kube.var.log.containers.
        Merge_Log           On
        Merge_Log_Key       log_processed
        K8S-Logging.Parser  On
        K8S-Logging.Exclude Off

  # output-elasticsearch.conf: |
  #   [OUTPUT]
  #       Name            es
  #       Match           *
  #       Host            ${FLUENT_ELASTICSEARCH_HOST}
  #       Port            ${FLUENT_ELASTICSEARCH_PORT}
  #       Logstash_Format On
  #       Replace_Dots    On
  #       Retry_Limit     False

  output-loki.conf: |
    [OUTPUT]
        Name  http
        Match *
        Host  loki
        Port  3100
        URI   /loki/api/v1/push 

  parsers.conf: |
    [PARSER]
        Name   apache
        Format regex
        Regex  ^(?<host>[^ ]*) [^ ]* (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^\"]*?)(?: +\S*)?)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^\"]*)" "(?<agent>[^\"]*)")?$
        Time_Key time
        Time_Format %d/%b/%Y:%H:%M:%S %z

    [PARSER]
        Name   apache2
        Format regex
        Regex  ^(?<host>[^ ]*) [^ ]* (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^ ]*) +\S*)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^\"]*)" "(?<agent>[^\"]*)")?$
        Time_Key time
        Time_Format %d/%b/%Y:%H:%M:%S %z

    [PARSER]
        Name   apache_error
        Format regex
        Regex  ^\[[^ ]* (?<time>[^\]]*)\] \[(?<level>[^\]]*)\](?: \[pid (?<pid>[^\]]*)\])?( \[client (?<client>[^\]]*)\])? (?<message>.*)$

    [PARSER]
        Name   nginx
        Format regex
        Regex ^(?<remote>[^ ]*) (?<host>[^ ]*) (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^\"]*?)(?: +\S*)?)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^\"]*)" "(?<agent>[^\"]*)")?$
        Time_Key time
        Time_Format %d/%b/%Y:%H:%M:%S %z

    [PARSER]
        Name   json
        Format json
        Time_Key time
        Time_Format %d/%b/%Y:%H:%M:%S %z

    [PARSER]
        Name        docker
        Format      json
        Time_Key    time
        Time_Format %Y-%m-%dT%H:%M:%S.%L
        Time_Keep   On

    [PARSER]
        # http://rubular.com/r/tjUt3Awgg4
        Name cri
        Format regex
        Regex ^(?<time>[^ ]+) (?<stream>stdout|stderr) (?<logtag>[^ ]*) (?<message>.*)$
        Time_Key    time
        Time_Format %Y-%m-%dT%H:%M:%S.%L%z

    [PARSER]
        Name        syslog
        Format      regex
        Regex       ^\<(?<pri>[0-9]+)\>(?<time>[^ ]* {1,2}[^ ]* [^ ]*) (?<host>[^ ]*) (?<ident>[a-zA-Z0-9_\/\.\-]*)(?:\[(?<pid>[0-9]+)\])?(?:[^\:]*\:)? *(?<message>.*)$
        Time_Key    time
        Time_Format %b %d %H:%M:%S
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: logging
  labels:
    k8s-app: fluent-bit-logging
    version: v1
    kubernetes.io/cluster-service: "true"
spec:
  selector:
    matchLabels:
      k8s-app: fluent-bit-logging
  template:
    metadata:
      labels:
        k8s-app: fluent-bit-logging
        version: v1
        kubernetes.io/cluster-service: "true"
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "2020"
        prometheus.io/path: /api/v1/metrics/prometheus
    spec:
      containers:
      - name: fluent-bit
        image: fluent/fluent-bit:1.5
        imagePullPolicy: Always
        ports:
          - containerPort: 2020
        env:
        - name: FLUENT_ELASTICSEARCH_HOST
          value: "elasticsearch"
        - name: FLUENT_ELASTICSEARCH_PORT
          value: "9200"
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        - name: fluent-bit-config
          mountPath: /fluent-bit/etc/
        - name: mnt
          mountPath: /mnt
          readOnly: true
      terminationGracePeriodSeconds: 10
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
      - name: fluent-bit-config
        configMap:
          name: fluent-bit-config
      - name: mnt
        hostPath:
          path: /mnt
      serviceAccountName: fluent-bit
      tolerations:
      - key: node-role.kubernetes.io/master
        operator: Exists
        effect: NoSchedule
      - operator: "Exists"
        effect: "NoExecute"
      - operator: "Exists"
        effect: "NoSchedule"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: loki
  namespace: logging
  labels:
    app.kubernetes.io/name: loki
    stack: logging
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: loki
      stack: logging
  replicas: 2
  template:
    metadata:
      labels:
        app.kubernetes.io/name: loki
        stack: logging
    spec:
      containers:
        - name: grafana-loki
          image: grafana/loki:2.6.1
          args: ["-config.file=/etc/loki/local-config.yaml"]
---
apiVersion: v1
kind: Service
metadata:
  name: loki
  namespace: logging
  labels:
    app.kubernetes.io/service: loki
    stack: logging
spec:
  selector:
    app.kubernetes.io/name: loki
    stack: logging
  type: ClusterIP
  ports:
    - name: web
      targetPort: 3100
      port: 3100
---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: logging
  labels:
    app.kubernetes.io/name: grafana
    stack: logging
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: grafana
      stack: logging
  replicas: 2
  template:
    metadata:
      labels:
        app.kubernetes.io/name: grafana
        stack: logging
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        env:
        - name: GF_AUTH_DISABLE_LOGIN_FORM
          value: "true"
        - name: GF_AUTH_ANONYMOUS_ENABLED
          value: "true"
        - name: GF_AUTH_ANONYMOUS_ORG_ROLE
          value: "Admin"
---
apiVersion: v1
kind: Service
metadata:
  name: grafana
  namespace: logging
  labels:
    app.kubernetes.io/service: grafana
    stack: logging
spec:
  selector:
    app.kubernetes.io/name: grafana
    stack: logging
  type: NodePort
  ports:
  - port: 3000
    targetPort: 3000

...



================================================
FILE: deploy/Logging/notes.md
================================================
```sh
helm upgrade --install loki-stack grafana/loki-stack \\n    --set fluent-bit.enabled=true,promtail.enabled=false
kubectl create -f deploy.yml
```



================================================
FILE: deploy/okteto-prod/manifests.yaml
================================================
---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-frontend
  labels:
    app: frontend-pdf
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend-pdf
  template:
    metadata:
      labels:
        app: frontend-pdf
    spec:
      containers:
      - name: pdf-editor-frontend
        image: docker.io/dipugodocker/pdf-editor:1.0-frontend
        resources:
          requests:
              memory: "50Mi"
              cpu: "10m"
          limits:
            memory: "500Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            port: 80
            path: /
          initialDelaySeconds: 5
          periodSeconds: 30
        readinessProbe:
          httpGet:
            port: 80
            path: /about
          initialDelaySeconds: 5
          periodSeconds: 10
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          name: web-port

---

apiVersion: v1
kind: Service
metadata:
  name: backend-merge
spec:
  selector:
    app: backend-merger
  ports:
  - port: 8080
    targetPort: backend-port
    protocol: TCP

---

apiVersion: v1
kind: Service
metadata:
  name: backend-rotate
spec:
  selector:
    app: backend-rotate
  ports:
  - port: 8081
    targetPort: rotate-port
    protocol: TCP

---

apiVersion: v1
kind: Service
metadata:
  name: frontend-lb
  labels:
    type: frontend
  annotations:
    dev.okteto.com/auto-ingress: "true"
spec:
  selector:
    app: frontend-pdf
  type: ClusterIP
  ports:
  - port: 80
    targetPort: web-port
    protocol: TCP

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-backend
  labels:
    app: backend-merger
spec:
  selector:
    matchLabels:
      app: backend-merger
  template:
    metadata:
      labels:
        app: backend-merger
    spec:
      initContainers:
        - name: pdf-files
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-merge
          volumeMounts:
          - name: backend
            mountPath: /mnt
          command: ["cp", "-vR", ".", "/mnt"]
          resources:
            requests:
                memory: "10Mi"
                cpu: "1m"
            limits:
              memory: "100Mi"
              cpu: "50m"

      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-merge
          volumeMounts:
          - name: backend
            mountPath: /go/src/
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              port: 8080
              path: /greet
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              port: 8080
              path: /greet
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 8080
              name: backend-port
      volumes:
      - name: backend
        emptyDir: {}

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-editor-rotate
  labels:
    app: backend-rotate
spec:
  selector:
    matchLabels:
      app: backend-rotate
  template:
    metadata:
      labels:
        app: backend-rotate
    spec:
      initContainers:
        - name: pdf-files
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-rotate
          volumeMounts:
          - name: backend
            mountPath: /mnt
          command: ["cp", "-vR", ".", "/mnt"]
          resources:
            requests:
                memory: "10Mi"
                cpu: "1m"
            limits:
              memory: "100Mi"
              cpu: "50m"

      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-rotate
          volumeMounts:
          - name: backend
            mountPath: /go/src/
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              port: 8081
              path: /greet
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              port: 8081
              path: /greet
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 8081
              name: rotate-port
      volumes:
      - name: backend
        emptyDir: {}

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
spec:
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:1.6
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
        - containerPort: 5775
        - containerPort: 6831
        - containerPort: 6832
        - containerPort: 5778
        - containerPort: 16686
        - containerPort: 14268
        - containerPort: 9411

---

apiVersion: v1
kind: Service
metadata:
  name: trace
spec:
  selector:
    app: jaeger
  ports:
  - port: 16686
    targetPort: 16686
    name: web
  - port: 14268
    targetPort: 14268
    name: conn

---



================================================
FILE: deploy/policy/disallow-hostPath.yml
================================================
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-host-path
  annotations:
    policies.kyverno.io/title: Disallow hostPath
    policies.kyverno.io/category: Pod Security Standards (Baseline)
    policies.kyverno.io/severity: medium
    policies.kyverno.io/subject: Pod,Volume
    kyverno.io/kyverno-version: 1.6.0
    kyverno.io/kubernetes-version: "1.22-1.23"
    policies.kyverno.io/description: >-
      HostPath volumes let Pods use host directories and volumes in containers.
      Using host resources can be used to access shared data or escalate privileges
      and should not be allowed. This policy ensures no hostPath volumes are in use.
spec:
  validationFailureAction: audit
  background: true
  rules:
    - name: host-path
      match:
        any:
        - resources:
            kinds:
              - Pod
      validate:
        message: >-
                    HostPath volumes are forbidden. The field spec.volumes[*].hostPath must be unset.
        pattern:
          spec:
            =(volumes):
              - X(hostPath): "null"




================================================
FILE: deploy/policy/label-pods.yml
================================================
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  background: false
  validationFailureAction: audit
  #validationFailureAction: enforce
  rules:
  - name: check-for-labels
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "label 'app.kubernetes.io/name' is required"
      pattern:
        metadata:
          labels:
            app.kubernetes.io/name: "?*"



================================================
FILE: deploy/policy/limits-pod.yml
================================================
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-requests-limits
  annotations:
    policies.kyverno.io/title: Require Limits and Requests
    policies.kyverno.io/category: Best Practices
    policies.kyverno.io/severity: medium
    policies.kyverno.io/subject: Pod
    policies.kyverno.io/description: >-
      As application workloads share cluster resources, it is important to limit resources
      requested and consumed by each Pod. It is recommended to require resource requests and
      limits per Pod, especially for memory and CPU. If a Namespace level request or limit is specified,
      defaults will automatically be applied to each Pod based on the LimitRange configuration.
      This policy validates that all containers have something specified for memory and CPU
      requests and memory limits.
spec:
  validationFailureAction: audit
  # validationFailureAction: enforce
  background: true
  rules:
  - name: validate-resources
    match:
      resources:
        kinds:
        - Pod
    validate:
      message: "CPU and memory resource requests and limits are required."
      pattern:
        spec:
          containers:
          - resources:
              requests:
                memory: "?*"
                cpu: "?*"
              limits:
                memory: "?*"



================================================
FILE: deploy/policy/nginx-ingress.yml
================================================
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: restrict-ingress-paths
  annotations:
    policies.kyverno.io/title: Restrict NGINX Ingress path values
    policies.kyverno.io/category: Security, NGINX Ingress
    policies.kyverno.io/severity: high
    policies.kyverno.io/subject: Ingress
    policies.kyverno.io/minversion: "1.6.0"
    kyverno.io/kyverno-version: "1.6.0"
    kyverno.io/kubernetes-version: "1.23"
    policies.kyverno.io/description: >-
      This policy mitigates CVE-2021-25745 by restricting `spec.rules[].http.paths[].path` to safe values.
      Additional paths can be added as required. This issue has been fixed in NGINX Ingress v1.2.0.
      Please refer to the CVE for details.
spec:
  validationFailureAction: enforce
  rules:
    - name: check-paths
      match:
        any:
        - resources:
            kinds:
            - networking.k8s.io/v1/Ingress
      validate:
        message: "spec.rules[].http.paths[].path value is not allowed"
        deny:
          conditions:
            any:
            - key: "{{ request.object.spec.rules[].http.paths[].path.contains(@,'/etc') }}"
              operator: AnyIn
              value: [true]
            - key: "{{ request.object.spec.rules[].http.paths[].path.contains(@,'/var/run/secrets') }}"
              operator: AnyIn
              value: [true]
            - key: "{{ request.object.spec.rules[].http.paths[].path.contains(@,'/root') }}"
              operator: AnyIn
              value: [true]
            - key: "{{ request.object.spec.rules[].http.paths[].path.contains(@,'/var/run/kubernetes/serviceaccount') }}"
              operator: AnyIn
              value: [true]
            - key: "{{ request.object.spec.rules[].http.paths[].path.contains(@,'/etc/kubernetes/admin.conf') }}"
              operator: AnyIn
              value: [true]
            - key: "{{ request.object.spec.rules[].http.paths[].path.contains(@,'/metrics') }}"
              operator: AnyIn
              value: [true]


================================================
FILE: deploy/policy/run-as-non-root.yml
================================================
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-run-as-non-root-user
  annotations:
    policies.kyverno.io/title: Require Run As Non-Root User
    policies.kyverno.io/category: Pod Security Standards (Restricted)
    policies.kyverno.io/severity: medium
    policies.kyverno.io/subject: Pod
    kyverno.io/kyverno-version: 1.6.0
    kyverno.io/kubernetes-version: "1.22-1.23"
    policies.kyverno.io/description: >-
      Containers must be required to run as non-root users. This policy ensures
      `runAsUser` is either unset or set to a number greater than zero.
spec:
  validationFailureAction: audit
  background: true
  rules:
    - name: run-as-non-root-user
      match:
        any:
        - resources:
            kinds:
              - Pod
      validate:
        message: >-
          Running as root is not allowed. The fields spec.securityContext.runAsUser,
          spec.containers[*].securityContext.runAsUser, spec.initContainers[*].securityContext.runAsUser,
          and spec.ephemeralContainers[*].securityContext.runAsUser must be unset or
          set to a number greater than zero.
        pattern:
          spec:
            =(securityContext):
              =(runAsUser): ">0"
            =(ephemeralContainers):
            - =(securityContext):
                =(runAsUser): ">0"
            =(initContainers):
            - =(securityContext):
                =(runAsUser): ">0"
            containers:
            - =(securityContext):
                =(runAsUser): ">0"




================================================
FILE: deploy/policy/security-pods.yml
================================================
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-privileged-containers
  annotations:
    policies.kyverno.io/title: Disallow Privileged Containers
    policies.kyverno.io/category: Pod Security Standards (Baseline)
    policies.kyverno.io/severity: medium
    policies.kyverno.io/subject: Pod
    kyverno.io/kyverno-version: 1.6.0
    kyverno.io/kubernetes-version: "1.22-1.23"
    policies.kyverno.io/description: >-
      Privileged mode disables most security mechanisms and must not be allowed. This policy
      ensures Pods do not call for privileged mode.
spec:
  validationFailureAction: audit
  background: true
  rules:
    - name: privileged-containers
      match:
        any:
        - resources:
            kinds:
              - Pod
      validate:
        message: >-
          Privileged mode is disallowed. The fields spec.containers[*].securityContext.privileged
          and spec.initContainers[*].securityContext.privileged must be unset or set to `false`.
        pattern:
          spec:
            =(ephemeralContainers):
              - =(securityContext):
                  =(privileged): "false"
            =(initContainers):
              - =(securityContext):
                  =(privileged): "false"
            containers:
              - =(securityContext):
                  =(privileged): "false"




================================================
FILE: deploy/rollouts/backend-preview-svc.yml
================================================
apiVersion: v1
kind: Service
metadata:
  name: backend-merge-preview
  namespace: pdf-editor-ns
  labels:
    service: backend-merge
  annotations:
    blue-green: 'true'
spec:
  selector:
    app: backend-merge
  ports:
  - port: 8080
    name: web
    targetPort: backend-port
    protocol: TCP
---
apiVersion: v1
kind: Service
metadata:
  name: backend-rotate-preview
  namespace: pdf-editor-ns
  labels:
    service: backend-rotate
  annotations:
    blue-green: 'true'
spec:
  selector:
    app: backend-rotate
  ports:
  - port: 8081
    name: web
    targetPort: backend-port
    protocol: TCP
...


================================================
FILE: deploy/rollouts/deploy-backend.yml
================================================
# apiVersion: v1
# kind: Namespace
# metadata:
#   name: pdf-editor-ns

---

apiVersion: v1
kind: Service
metadata:
  name: backend-merge
  namespace: pdf-editor-ns
  labels:
    service: backend-merge
spec:
  selector:
    app: backend-merge
  ports:
  - port: 8080
    name: web
    targetPort: backend-port
    protocol: TCP

---

apiVersion: v1
kind: Service
metadata:
  name: backend-rotate
  namespace: pdf-editor-ns
  labels:
    service: backend-rotate
spec:
  selector:
    app: backend-rotate
  ports:
  - port: 8081
    name: web
    targetPort: backend-port
    protocol: TCP

---

apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: pdf-editor-backend-merge
  namespace: pdf-editor-ns
  labels:
    app: backend-merge
spec:
  replicas: 2
  strategy:
    blueGreen:
      # activeService specifies the service to update with the new template hash at time of promotion.
      # This field is mandatory for the blueGreen update strategy.
      activeService: backend-merge
      # previewService specifies the service to update with the new template hash before promotion.
      # This allows the preview stack to be reachable without serving production traffic.
      # This field is optional.
      previewService: backend-merge-preview
      # autoPromotionEnabled disables automated promotion of the new stack by pausing the rollout
      # immediately before the promotion. If omitted, the default behavior is to promote the new
      # stack as soon as the ReplicaSet are completely ready/available.
      # Rollouts can be resumed using: `kubectl argo rollouts promote ROLLOUT`
      autoPromotionEnabled: true
  revisionHistoryLimit: 2
  selector:
    matchLabels:
      app: backend-merge
  template:
    metadata:
      labels:
        app: backend-merge
    spec:
      initContainers:
        - name: pdf-files
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-merge
          volumeMounts:
          - name: backend
            mountPath: /mnt
          command: ["cp", "-vR", ".", "/mnt"]

      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-merge
          volumeMounts:
          - name: backend
            mountPath: /go/src/
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              port: 8080
              path: /greet
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              port: 8080
              path: /greet
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 8080
              name: backend-port
      volumes:
      - name: backend
        emptyDir: {}

---

apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: pdf-editor-rotator
  namespace: pdf-editor-ns
  labels:
    app: backend-rotate
spec:
  replicas: 2
  strategy:
    blueGreen:
      # activeService specifies the service to update with the new template hash at time of promotion.
      # This field is mandatory for the blueGreen update strategy.
      activeService: backend-rotate
      # previewService specifies the service to update with the new template hash before promotion.
      # This allows the preview stack to be reachable without serving production traffic.
      # This field is optional.
      previewService: backend-rotate-preview
      # autoPromotionEnabled disables automated promotion of the new stack by pausing the rollout
      # immediately before the promotion. If omitted, the default behavior is to promote the new
      # stack as soon as the ReplicaSet are completely ready/available.
      # Rollouts can be resumed using: `kubectl argo rollouts promote ROLLOUT`
      autoPromotionEnabled: true
  revisionHistoryLimit: 2
  selector:
    matchLabels:
      app: backend-rotate
  template:
    metadata:
      labels:
        app: backend-rotate
    spec:
      initContainers:
        - name: pdf-files
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-rotate
          volumeMounts:
          - name: backend
            mountPath: /mnt
          command: ["cp", "-vR", ".", "/mnt"]

      containers:
        - name: pdf-editor
          image: docker.io/dipugodocker/pdf-editor:1.0-backend-rotate
          volumeMounts:
          - name: backend
            mountPath: /go/src/
          resources:
            requests:
                memory: "50Mi"
                cpu: "10m"
            limits:
              memory: "500Mi"
              cpu: "100m"
          livenessProbe:
            httpGet:
              port: 8081
              path: /greet
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              port: 8081
              path: /greet
            initialDelaySeconds: 5
            periodSeconds: 10
          ports:
            - containerPort: 8081
              name: backend-port
      volumes:
      - name: backend
        emptyDir: {}

...



================================================
FILE: deploy/rollouts/deploy-frontend.yml
================================================
# apiVersion: v1
# kind: Namespace
# metadata:
#   name: pdf-editor-ns

# ---

apiVersion: v1
kind: Service
metadata:
  name: frontend-lb
  namespace: pdf-editor-ns
  labels:
    name: pdf-editor-frontend
spec:
  selector:
    app: frontend-pdf
  ports:
  - port: 80
    targetPort: web-port
    name: web
    protocol: TCP

---

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pdf-editor-ig
  labels:
    name: pdf-editor-ig
  annotations:
    kubernetes.io/ingress.class: nginx
  namespace: pdf-editor-ns
spec:
  rules:
  - http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: frontend-lb
            port:
              number: 80

---

apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: pdf-editor-frontend
  labels:
    app: frontend-pdf
  namespace: pdf-editor-ns
spec:
  replicas: 4
  minReadySeconds: 30
  revisionHistoryLimit: 3
  strategy:
    canary:
      maxUnavailable: 0
      stableService: frontend-lb
      canaryService: frontend-lb-canary
      trafficRouting:
        nginx:
          stableIngress: pdf-editor-ig
      steps:
      - setWeight: 30
      - pause: {}
      - setWeight: 60
      - pause: {}
      - setWeight: 100
      - pause: {}

  selector:
    matchLabels:
      app: frontend-pdf
  template:
    metadata:
      labels:
        app: frontend-pdf
    spec:
      containers:
      - name: pdf-editor-frontend
        image: docker.io/dipugodocker/pdf-editor:1.0-frontend
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
          name: web-port

...



================================================
FILE: deploy/rollouts/frontend-preview-svc.yml
================================================
apiVersion: v1
kind: Service
metadata:
  name: frontend-lb-canary
  namespace: pdf-editor-ns
  annotations:
    blue-green: 'true'
spec:
  selector:
    app: frontend-pdf
  ports:
  - port: 80
    targetPort: web-port
    protocol: TCP



================================================
FILE: deploy/rollouts/hpa.text
================================================
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: hpa-rollout-frontend
  namespace: pdf-editor-ns
spec:
  maxReplicas: 4
  minReplicas: 2
  scaleTargetRef:
    apiVersion: argoproj.io/v1alpha1
    kind: Rollout
    name: pdf-editor-frontend
  targetCPUUtilizationPercentage: 80
---
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: hpa-rollout-backend
  namespace: pdf-editor-ns
spec:
  maxReplicas: 6
  minReplicas: 2
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: pdf-editor-backend
  targetCPUUtilizationPercentage: 80



================================================
FILE: deploy/tekton-ci/pipeline-runner.yml
================================================
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  name: pdf-pipeline-runner
spec:
  pipelineRef:
    name: pdf-pipeline


================================================
FILE: deploy/tekton-ci/pipeline.yml
================================================
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: pdf-pipeline
spec:
  tasks:
    - name: backend-test-build
      taskRef:
        name: backend
    - name: frontend-test-build
      taskRef:
        name: frontend



================================================
FILE: deploy/tekton-ci/task-back.yml
================================================
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: backend
spec:
  steps:
    - name: backend
      image: golang:1.18
      script: |
        #!/bin/sh
        apt install qpdf git
        git clone https://github.com/dipankardas011/PDF-Editor.git -b main
        cd PDF-Editor/src/backend/merger
        echo "Building.."
        go build -v .
        echo "Testing.."
        go test -v .


================================================
FILE: deploy/tekton-ci/task-front.yml
================================================
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: frontend
spec:
  steps:
    - name: frontend
      image: node:18-alpine3.15
      script: |
        #!/bin/sh
        cd /home
        apk add curl git
        git clone https://github.com/dipankardas011/PDF-Editor.git -b main
        cd PDF-Editor/src/frontend
        npm install
        echo "Testing.."
        npm run test


================================================
FILE: EC2-server(old)/changes.md
================================================
you can find it in deploy/IAC/ansible-terraform


================================================
FILE: EC2-server(old)/EC2-new.sh
================================================
#!/bin/bash

sudo su - admin

cd /home/admin

sudo apt-get update

sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

sudo mkdir -p /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

mkdir main
cd main
cat << EOF > docker-compose.yml
version: '1.0'
services:
  backend:
    image: docker.io/dipugodocker/pdf-editor:backend
    container_name: backend
    ports:
      - "8080"
    networks:
      - pdf-editor
    volumes:
      - db_data:/app/

  frontend:
    depends_on:
      - backend
    image: docker.io/dipugodocker/pdf-editor:frontend
    container_name: frontend
    ports:
      - "80:80"
    networks:
      - pdf-editor

networks:
  pdf-editor:

volumes:
  db_data:
EOF

sudo docker compose up -d


================================================
FILE: EC2-server(old)/EC2-old.sh
================================================
#!/bin/bash
sudo apt update -y && sudo apt install git golang-go qpdf -y
echo "Done"
git clone https://github.com/dipankardas011/PDF-Editor.git
cd PDF-Editor/backEnd/
go build
./backend

EOF


================================================
FILE: EC2-server(old)/pdf-editor.service
================================================
# -----Depricated----
[Unit]
Description=pdf-editor for EC2

[Service]
Type=simple
WorkingDirectory=/home/ec2-user/PDF-Editor/backEnd/
ExecStart=/home/ec2-user/PDF-Editor/backEnd/backend
Restart=always

[Install]
WantedBy=multi-user.target



================================================
FILE: EC2-server(old)/setup.sh
================================================
#!/bin/bash
yum install -y git qpdf
cd /home/ec2-user

git clone https://github.com/dipankardas011/PDF-Editor.git
cd PDF-Editor
cp -v pdf-editor.service /etc/systemd/system

systemctl daemon-reload

systemctl start pdf-editor.service

# It requires binary to be available


================================================
FILE: src/readme.md
================================================
# Faster development

```sh
cd PDF-Editor/src

docker-compose build --no-cache && docker-compose up -d
```

then go to the
[Click Here](http://localhost/)


[Clean up the docker cache](https://forums.docker.com/t/how-to-delete-cache/5753)

```sh

alias docker_clean_images='docker rmi $(docker images -a --filter=dangling=true -q)'
alias docker_clean_ps='docker rm $(docker ps --filter=status=exited --filter=status=created -q)'

##### OR

docker kill $(docker ps -q)
docker_clean_ps
docker rmi $(docker images -a -q)
```


================================================
FILE: src/docker-compose.yml
================================================
version: '3'
services:
  backend-merge:
    image: pdf-merger
    container_name: backend-merge
    build:
      context: backend/merger
      target: prod

    ports:
      - "8080"
    networks:
      - pdf-editor

  backend-rotate:
    image: pdf-rotator
    container_name: backend-rotate
    build:
      context: backend/rotator
      target: prod

    ports:
      - "8081"
    networks:
      - pdf-editor

  frontend:
    depends_on:
      - backend-merge
      - backend-rotate
    image: pdf-frontend
    container_name: frontend-pdf
    build:
      context: frontend
      target: prod

    ports:
      - "80:80"
    networks:
      - pdf-editor

  trace:
    depends_on:
      - frontend
    image: jaegertracing/all-in-one
    container_name: jaeger-tracing
    ports:
    - "6831"
    - "6832"
    - "5778"
    - "16686:16686"
    - "4317"
    - "4318"
    - "14250"
    - "14268"
    - "14269"
    - "9411"
    networks:
      - pdf-editor

networks:
  pdf-editor:



================================================
FILE: src/skaffold.yaml
================================================
apiVersion: skaffold/v2beta29
kind: Config
metadata:
  name: src
build:
  artifacts:
  - image: dipugodocker/skaffold-pdf-editor-frontend
    context: frontend
    docker:
      target: prod
      dockerfile: Dockerfile

  - image: dipugodocker/skaffold-pdf-editor-backend-merge
    context: backend/merger
    docker:
      target: prod
      dockerfile: Dockerfile

  - image: dipugodocker/skaffold-pdf-editor-backend-rotate
    context: backend/rotator
    docker:
      target: prod
      dockerfile: Dockerfile

deploy:
  kubectl:
    manifests:
    - dev-manifests/backend/deploy-pdf.yml
    - dev-manifests/backend/svc.yml
    - dev-manifests/frontend/deploy-pdf.yml
    - dev-manifests/frontend/svc.yml



================================================
FILE: src/backend/README.md
================================================
# How to Make [*Dev*]

Use the two PDFs `01.pdf` and `02.pdf` from testFiles/ for testing purposes

```sh
cd backEnd/merger

docker build --target dev -t <image> .

docker run -it --rm --publish 80:8080 -v ${PWD}:/go/src <image>

# then go
localhost:80
```

# For Testing
```sh
cd backEnd/merger

docker build --target test -t <image> .

docker run --rm <image>

```

> ⚠️**NOTE** : Before you commit remove any executable generated during you testing and development

# Error codes

Code | Description
-|-
501 | unable to load template html
502 | merge error
503 | unable to clean


================================================
FILE: src/backend/merger/Dockerfile
================================================
FROM golang:1.18-alpine as prod-stage1
LABEL MAINTAINER="Dipankar Das <dipankardas0115@gmail.com>"
WORKDIR /go/src
COPY . .
RUN rm -rf uploads/
RUN go get -d
RUN go build -o merger-executable

FROM alpine:3.16.1 as prod
RUN apk add qpdf
LABEL MAINTAINER="Dipankar Das <dipankardas0115@gmail.com>"
WORKDIR /go/src
COPY --from=prod-stage1 /go/src .
RUN rm -f go.sum go.mod file.go main.go main_test.go Dockerfile .dockerignore
CMD ["./merger-executable"]
EXPOSE 8080

FROM golang:1.17-alpine as dev
RUN apk update
RUN apk add qpdf
WORKDIR /go/src


FROM golang:1.18 as test
RUN apt -y update
RUN apt install -y qpdf
WORKDIR /go/src
COPY . .
RUN go get -d
ENTRYPOINT ["go", "test", "-v", "."]



================================================
FILE: src/backend/merger/file.go
================================================
package main

import (
	"context"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"os"

	"go.opentelemetry.io/otel"
)

var (
	numberOfFilesUploaded int
	uploadedStat          bool
)

type templateStat struct {
	Header string `json:"Header"`
	Status string `json:"Status"`
}

const NUMBEROFDOCS int = 2

func uploadFile(w http.ResponseWriter, r *http.Request, ctx context.Context) {
	tr := otel.Tracer("uploadFile")
	ctxinn, span := tr.Start(ctx, "uploading")
	defer span.End()

	// Maximum upload of 10 MB files
	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("File")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		requestsProcessedError.Inc()
		return
	}

	defer file.Close()

	if handler.Header["Content-Type"][0] != "application/pdf" {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		// t, err := template.ParseFiles("./upload.html")
		t, err := template.ParseFiles("./templates/upload.html")
		var x templateStat
		if err != nil {
			x = templateStat{
				Header: "alert alert-danger",
				Status: "Internal Server error 501 ⚠️",
			}
			requestsProcessedError.Inc()
		} else {
			x = templateStat{
				Header: "alert alert-danger",
				Status: "Invalid file format error 415 ⚠️",
			}
			requestsProcessedError.Inc()
		}

		t.Execute(w, x)
		return
	}

	dst, err := os.Create(fmt.Sprintf("./uploads/0%d.pdf", numberOfFilesUploaded))
	if numberOfFilesUploaded == 1 {
		uploadedStat = true
	}
	numberOfFilesUploaded = (numberOfFilesUploaded + 1) % NUMBEROFDOCS
	defer dst.Close()

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		requestsProcessedError.Inc()
		return
	}

	// Copy the uploaded file to the created file on the filesystem
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		requestsProcessedError.Inc()
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	t, err := template.ParseFiles("./templates/upload.html")

	var x templateStat

	if err != nil {
		x = templateStat{
			Header: "alert alert-danger",
			Status: "Internal Server error 501 ⚠️",
		}
		requestsProcessedError.Inc()
	} else {
		x = templateStat{
			Header: "alert alert-success",
			Status: "Uploaded ✅",
		}
		requestsProcessedSuccess.Inc()
	}

	if uploadedStat {
		if MergePdf(ctxinn) == nil {
			uploadedStat = false
		} else {
			x = templateStat{
				Header: "alert alert-danger",
				Status: "CRITICAL ERROR 502 ❌",
			}
			requestsProcessedError.Inc()
		}
		//TODO: condition check to automatically delete the uploads/ by clearExistingpdfs(w, r)
	}
	t.Execute(w, x)
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	tr := tp.Tracer("uploadingMain")
	ctxIn, span := tr.Start(ctx, "mainBlock")
	defer span.End()

	requestsProcessed.Inc()
	switch r.Method {
	case "POST":
		uploadFile(w, r, ctxIn)
	default:
		w.WriteHeader(http.StatusBadRequest)
		requestsProcessedError.Inc()
	}
}



================================================
FILE: src/backend/merger/go.mod
================================================
module github.com/dipankardas011/Merge-PDF/src/backend/merger

go 1.17

require (
	github.com/prometheus/client_golang v1.12.2
	go.opentelemetry.io/otel/sdk v1.7.0
)

require (
	github.com/go-logr/logr v1.2.3 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	go.opentelemetry.io/otel/trace v1.7.0 // indirect
)

require (
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/cespare/xxhash/v2 v2.1.2 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.1 // indirect
	github.com/prometheus/client_model v0.2.0 // indirect
	github.com/prometheus/common v0.35.0 // indirect
	github.com/prometheus/procfs v0.7.3 // indirect
	go.opentelemetry.io/otel v1.7.0
	go.opentelemetry.io/otel/exporters/jaeger v1.7.0
	golang.org/x/sys v0.0.0-20220627191245-f75cf1eec38b // indirect
	google.golang.org/protobuf v1.26.0 // indirect
)



================================================
FILE: src/backend/merger/go.sum
================================================
cloud.google.com/go v0.26.0/go.mod h1:aQUYkXzVsufM+DwF1aE+0xfcU+56JwCaLick0ClmMTw=
cloud.google.com/go v0.34.0/go.mod h1:aQUYkXzVsufM+DwF1aE+0xfcU+56JwCaLick0ClmMTw=
cloud.google.com/go v0.38.0/go.mod h1:990N+gfupTy94rShfmMCWGDn0LpTmnzTp2qbd1dvSRU=
cloud.google.com/go v0.44.1/go.mod h1:iSa0KzasP4Uvy3f1mN/7PiObzGgflwredwwASm/v6AU=
cloud.google.com/go v0.44.2/go.mod h1:60680Gw3Yr4ikxnPRS/oxxkBccT6SA1yMk63TGekxKY=
cloud.google.com/go v0.45.1/go.mod h1:RpBamKRgapWJb87xiFSdk4g1CME7QZg3uwTez+TSTjc=
cloud.google.com/go v0.46.3/go.mod h1:a6bKKbmY7er1mI7TEI4lsAkts/mkhTSZK8w33B4RAg0=
cloud.google.com/go v0.50.0/go.mod h1:r9sluTvynVuxRIOHXQEHMFffphuXHOMZMycpNR5e6To=
cloud.google.com/go v0.52.0/go.mod h1:pXajvRH/6o3+F9jDHZWQ5PbGhn+o8w9qiu/CffaVdO4=
cloud.google.com/go v0.53.0/go.mod h1:fp/UouUEsRkN6ryDKNW/Upv/JBKnv6WDthjR6+vze6M=
cloud.google.com/go v0.54.0/go.mod h1:1rq2OEkV3YMf6n/9ZvGWI3GWw0VoqH/1x2nd8Is/bPc=
cloud.google.com/go v0.56.0/go.mod h1:jr7tqZxxKOVYizybht9+26Z/gUq7tiRzu+ACVAMbKVk=
cloud.google.com/go v0.57.0/go.mod h1:oXiQ6Rzq3RAkkY7N6t3TcE6jE+CIBBbA36lwQ1JyzZs=
cloud.google.com/go v0.62.0/go.mod h1:jmCYTdRCQuc1PHIIJ/maLInMho30T/Y0M4hTdTShOYc=
cloud.google.com/go v0.65.0/go.mod h1:O5N8zS7uWy9vkA9vayVHs65eM1ubvY4h553ofrNHObY=
cloud.google.com/go/bigquery v1.0.1/go.mod h1:i/xbL2UlR5RvWAURpBYZTtm/cXjCha9lbfbpx4poX+o=
cloud.google.com/go/bigquery v1.3.0/go.mod h1:PjpwJnslEMmckchkHFfq+HTD2DmtT67aNFKH1/VBDHE=
cloud.google.com/go/bigquery v1.4.0/go.mod h1:S8dzgnTigyfTmLBfrtrhyYhwRxG72rYxvftPBK2Dvzc=
cloud.google.com/go/bigquery v1.5.0/go.mod h1:snEHRnqQbz117VIFhE8bmtwIDY80NLUZUMb4Nv6dBIg=
cloud.google.com/go/bigquery v1.7.0/go.mod h1://okPTzCYNXSlb24MZs83e2Do+h+VXtc4gLoIoXIAPc=
cloud.google.com/go/bigquery v1.8.0/go.mod h1:J5hqkt3O0uAFnINi6JXValWIb1v0goeZM77hZzJN/fQ=
cloud.google.com/go/datastore v1.0.0/go.mod h1:LXYbyblFSglQ5pkeyhO+Qmw7ukd3C+pD7TKLgZqpHYE=
cloud.google.com/go/datastore v1.1.0/go.mod h1:umbIZjpQpHh4hmRpGhH4tLFup+FVzqBi1b3c64qFpCk=
cloud.google.com/go/pubsub v1.0.1/go.mod h1:R0Gpsv3s54REJCy4fxDixWD93lHJMoZTyQ2kNxGRt3I=
cloud.google.com/go/pubsub v1.1.0/go.mod h1:EwwdRX2sKPjnvnqCa270oGRyludottCI76h+R3AArQw=
cloud.google.com/go/pubsub v1.2.0/go.mod h1:jhfEVHT8odbXTkndysNHCcx0awwzvfOlguIAii9o8iA=
cloud.google.com/go/pubsub v1.3.1/go.mod h1:i+ucay31+CNRpDW4Lu78I4xXG+O1r/MAHgjpRVR+TSU=
cloud.google.com/go/storage v1.0.0/go.mod h1:IhtSnM/ZTZV8YYJWCY8RULGVqBDmpoyjwiyrjsg+URw=
cloud.google.com/go/storage v1.5.0/go.mod h1:tpKbwo567HUNpVclU5sGELwQWBDZ8gh0ZeosJ0Rtdos=
cloud.google.com/go/storage v1.6.0/go.mod h1:N7U0C8pVQ/+NIKOBQyamJIeKQKkZ+mxpohlUTyfDhBk=
cloud.google.com/go/storage v1.8.0/go.mod h1:Wv1Oy7z6Yz3DshWRJFhqM/UCfaWIRTdp0RXyy7KQOVs=
cloud.google.com/go/storage v1.10.0/go.mod h1:FLPqc6j+Ki4BU591ie1oL6qBQGu2Bl/tZ9ullr3+Kg0=
dmitri.shuralyov.com/gpu/mtl v0.0.0-20190408044501-666a987793e9/go.mod h1:H6x//7gZCb22OMCxBHrMx7a5I7Hp++hsVxbQ4BYO7hU=
github.com/BurntSushi/toml v0.3.1/go.mod h1:xHWCNGjB5oqiDr8zfno3MHue2Ht5sIBksp03qcyfWMU=
github.com/BurntSushi/xgb v0.0.0-20160522181843-27f122750802/go.mod h1:IVnqGOEym/WlBOVXweHU+Q+/VP0lqqI8lqeDx9IjBqo=
github.com/alecthomas/template v0.0.0-20160405071501-a0175ee3bccc/go.mod h1:LOuyumcjzFXgccqObfd/Ljyb9UuFJ6TxHnclSeseNhc=
github.com/alecthomas/template v0.0.0-20190718012654-fb15b899a751/go.mod h1:LOuyumcjzFXgccqObfd/Ljyb9UuFJ6TxHnclSeseNhc=
github.com/alecthomas/units v0.0.0-20151022065526-2efee857e7cf/go.mod h1:ybxpYRFXyAe+OPACYpWeL0wqObRcbAqCMya13uyzqw0=
github.com/alecthomas/units v0.0.0-20190717042225-c3de453c63f4/go.mod h1:ybxpYRFXyAe+OPACYpWeL0wqObRcbAqCMya13uyzqw0=
github.com/alecthomas/units v0.0.0-20190924025748-f65c72e2690d/go.mod h1:rBZYJk541a8SKzHPHnH3zbiI+7dagKZ0cgpgrD7Fyho=
github.com/beorn7/perks v0.0.0-20180321164747-3a771d992973/go.mod h1:Dwedo/Wpr24TaqPxmxbtue+5NUziq4I4S80YR8gNf3Q=
github.com/beorn7/perks v1.0.0/go.mod h1:KWe93zE9D1o94FZ5RNwFwVgaQK1VOXiVxmqh+CedLV8=
github.com/beorn7/perks v1.0.1 h1:VlbKKnNfV8bJzeqoa4cOKqO6bYr3WgKZxO8Z16+hsOM=
github.com/beorn7/perks v1.0.1/go.mod h1:G2ZrVWU2WbWT9wwq4/hrbKbnv/1ERSJQ0ibhJ6rlkpw=
github.com/census-instrumentation/opencensus-proto v0.2.1/go.mod h1:f6KPmirojxKA12rnyqOA5BBL4O983OfeGPqjHWSTneU=
github.com/cespare/xxhash/v2 v2.1.1/go.mod h1:VGX0DQ3Q6kWi7AoAeZDth3/j3BFtOZR5XLFGgcrjCOs=
github.com/cespare/xxhash/v2 v2.1.2 h1:YRXhKfTDauu4ajMg1TPgFO5jnlC2HCbmLXMcTG5cbYE=
github.com/cespare/xxhash/v2 v2.1.2/go.mod h1:VGX0DQ3Q6kWi7AoAeZDth3/j3BFtOZR5XLFGgcrjCOs=
github.com/chzyer/logex v1.1.10/go.mod h1:+Ywpsq7O8HXn0nuIou7OrIPyXbp3wmkHB+jjWRnGsAI=
github.com/chzyer/readline v0.0.0-20180603132655-2972be24d48e/go.mod h1:nSuG5e5PlCu98SY8svDHJxuZscDgtXS6KTTbou5AhLI=
github.com/chzyer/test v0.0.0-20180213035817-a1ea475d72b1/go.mod h1:Q3SI9o4m/ZMnBNeIyt5eFwwo7qiLfzFZmjNmxjkiQlU=
github.com/client9/misspell v0.3.4/go.mod h1:qj6jICC3Q7zFZvVWo7KLAzC3yx5G7kyvSDkc90ppPyw=
github.com/cncf/udpa/go v0.0.0-20191209042840-269d4d468f6f/go.mod h1:M8M6+tZqaGXZJjfX53e64911xZQV5JYwmTeXPW+k8Sc=
github.com/davecgh/go-spew v1.1.0/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
github.com/davecgh/go-spew v1.1.1 h1:vj9j/u1bqnvCEfJOwUhtlOARqs3+rkHYY13jYWTU97c=
github.com/davecgh/go-spew v1.1.1/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
github.com/envoyproxy/go-control-plane v0.9.0/go.mod h1:YTl/9mNaCwkRvm6d1a2C3ymFceY/DCBVvsKhRF0iEA4=
github.com/envoyproxy/go-control-plane v0.9.1-0.20191026205805-5f8ba28d4473/go.mod h1:YTl/9mNaCwkRvm6d1a2C3ymFceY/DCBVvsKhRF0iEA4=
github.com/envoyproxy/go-control-plane v0.9.4/go.mod h1:6rpuAdCZL397s3pYoYcLgu1mIlRU8Am5FuJP05cCM98=
github.com/envoyproxy/protoc-gen-validate v0.1.0/go.mod h1:iSmxcyjqTsJpI2R4NaDN7+kN2VEUnK/pcBlmesArF7c=
github.com/go-gl/glfw v0.0.0-20190409004039-e6da0acd62b1/go.mod h1:vR7hzQXu2zJy9AVAgeJqvqgH9Q5CA+iKCZ2gyEVpxRU=
github.com/go-gl/glfw/v3.3/glfw v0.0.0-20191125211704-12ad95a8df72/go.mod h1:tQ2UAYgL5IevRw8kRxooKSPJfGvJ9fJQFa0TUsXzTg8=
github.com/go-gl/glfw/v3.3/glfw v0.0.0-20200222043503-6f7a984d4dc4/go.mod h1:tQ2UAYgL5IevRw8kRxooKSPJfGvJ9fJQFa0TUsXzTg8=
github.com/go-kit/kit v0.8.0/go.mod h1:xBxKIO96dXMWWy0MnWVtmwkA9/13aqxPnvrjFYMA2as=
github.com/go-kit/kit v0.9.0/go.mod h1:xBxKIO96dXMWWy0MnWVtmwkA9/13aqxPnvrjFYMA2as=
github.com/go-kit/log v0.1.0/go.mod h1:zbhenjAZHb184qTLMA9ZjW7ThYL0H2mk7Q6pNt4vbaY=
github.com/go-kit/log v0.2.0/go.mod h1:NwTd00d/i8cPZ3xOwwiv2PO5MOcx78fFErGNcVmBjv0=
github.com/go-logfmt/logfmt v0.3.0/go.mod h1:Qt1PoO58o5twSAckw1HlFXLmHsOX5/0LbT9GBnD5lWE=
github.com/go-logfmt/logfmt v0.4.0/go.mod h1:3RMwSq7FuexP4Kalkev3ejPJsZTpXXBr9+V4qmtdjCk=
github.com/go-logfmt/logfmt v0.5.0/go.mod h1:wCYkCAKZfumFQihp8CzCvQ3paCTfi41vtzG1KdI/P7A=
github.com/go-logfmt/logfmt v0.5.1/go.mod h1:WYhtIu8zTZfxdn5+rREduYbwxfcBr/Vr6KEVveWlfTs=
github.com/go-logr/logr v1.2.2/go.mod h1:jdQByPbusPIv2/zmleS9BjJVeZ6kBagPoEUsqbVz/1A=
github.com/go-logr/logr v1.2.3 h1:2DntVwHkVopvECVRSlL5PSo9eG+cAkDCuckLubN+rq0=
github.com/go-logr/logr v1.2.3/go.mod h1:jdQByPbusPIv2/zmleS9BjJVeZ6kBagPoEUsqbVz/1A=
github.com/go-logr/stdr v1.2.2 h1:hSWxHoqTgW2S2qGc0LTAI563KZ5YKYRhT3MFKZMbjag=
github.com/go-logr/stdr v1.2.2/go.mod h1:mMo/vtBO5dYbehREoey6XUKy/eSumjCCveDpRre4VKE=
github.com/go-stack/stack v1.8.0/go.mod h1:v0f6uXyyMGvRgIKkXu+yp6POWl0qKG85gN/melR3HDY=
github.com/gogo/protobuf v1.1.1/go.mod h1:r8qH/GZQm5c6nD/R0oafs1akxWv10x8SbQlK7atdtwQ=
github.com/golang/glog v0.0.0-20160126235308-23def4e6c14b/go.mod h1:SBH7ygxi8pfUlaOkMMuAQtPIUF8ecWP5IEl/CR7VP2Q=
github.com/golang/groupcache v0.0.0-20190702054246-869f871628b6/go.mod h1:cIg4eruTrX1D+g88fzRXU5OdNfaM+9IcxsU14FzY7Hc=
github.com/golang/groupcache v0.0.0-20191227052852-215e87163ea7/go.mod h1:cIg4eruTrX1D+g88fzRXU5OdNfaM+9IcxsU14FzY7Hc=
github.com/golang/groupcache v0.0.0-20200121045136-8c9f03a8e57e/go.mod h1:cIg4eruTrX1D+g88fzRXU5OdNfaM+9IcxsU14FzY7Hc=
github.com/golang/mock v1.1.1/go.mod h1:oTYuIxOrZwtPieC+H1uAHpcLFnEyAGVDL/k47Jfbm0A=
github.com/golang/mock v1.2.0/go.mod h1:oTYuIxOrZwtPieC+H1uAHpcLFnEyAGVDL/k47Jfbm0A=
github.com/golang/mock v1.3.1/go.mod h1:sBzyDLLjw3U8JLTeZvSv8jJB+tU5PVekmnlKIyFUx0Y=
github.com/golang/mock v1.4.0/go.mod h1:UOMv5ysSaYNkG+OFQykRIcU/QvvxJf3p21QfJ2Bt3cw=
github.com/golang/mock v1.4.1/go.mod h1:UOMv5ysSaYNkG+OFQykRIcU/QvvxJf3p21QfJ2Bt3cw=
github.com/golang/mock v1.4.3/go.mod h1:UOMv5ysSaYNkG+OFQykRIcU/QvvxJf3p21QfJ2Bt3cw=
github.com/golang/mock v1.4.4/go.mod h1:l3mdAwkq5BuhzHwde/uurv3sEJeZMXNpwsxVWU71h+4=
github.com/golang/protobuf v1.2.0/go.mod h1:6lQm79b+lXiMfvg/cZm0SGofjICqVBUtrP5yJMmIC1U=
github.com/golang/protobuf v1.3.1/go.mod h1:6lQm79b+lXiMfvg/cZm0SGofjICqVBUtrP5yJMmIC1U=
github.com/golang/protobuf v1.3.2/go.mod h1:6lQm79b+lXiMfvg/cZm0SGofjICqVBUtrP5yJMmIC1U=
github.com/golang/protobuf v1.3.3/go.mod h1:vzj43D7+SQXF/4pzW/hwtAqwc6iTitCiVSaWz5lYuqw=
github.com/golang/protobuf v1.3.4/go.mod h1:vzj43D7+SQXF/4pzW/hwtAqwc6iTitCiVSaWz5lYuqw=
github.com/golang/protobuf v1.3.5/go.mod h1:6O5/vntMXwX2lRkT1hjjk0nAC1IDOTvTlVgjlRvqsdk=
github.com/golang/protobuf v1.4.0-rc.1/go.mod h1:ceaxUfeHdC40wWswd/P6IGgMaK3YpKi5j83Wpe3EHw8=
github.com/golang/protobuf v1.4.0-rc.1.0.20200221234624-67d41d38c208/go.mod h1:xKAWHe0F5eneWXFV3EuXVDTCmh+JuBKY0li0aMyXATA=
github.com/golang/protobuf v1.4.0-rc.2/go.mod h1:LlEzMj4AhA7rCAGe4KMBDvJI+AwstrUpVNzEA03Pprs=
github.com/golang/protobuf v1.4.0-rc.4.0.20200313231945-b860323f09d0/go.mod h1:WU3c8KckQ9AFe+yFwt9sWVRKCVIyN9cPHBJSNnbL67w=
github.com/golang/protobuf v1.4.0/go.mod h1:jodUvKwWbYaEsadDk5Fwe5c77LiNKVO9IDvqG2KuDX0=
github.com/golang/protobuf v1.4.1/go.mod h1:U8fpvMrcmy5pZrNK1lt4xCsGvpyWQ/VVv6QDs8UjoX8=
github.com/golang/protobuf v1.4.2/go.mod h1:oDoupMAO8OvCJWAcko0GGGIgR6R6ocIYbsSw735rRwI=
github.com/golang/protobuf v1.4.3/go.mod h1:oDoupMAO8OvCJWAcko0GGGIgR6R6ocIYbsSw735rRwI=
github.com/golang/protobuf v1.5.0/go.mod h1:FsONVRAS9T7sI+LIUmWTfcYkHO4aIWwzhcaSAoJOfIk=
github.com/golang/protobuf v1.5.2 h1:ROPKBNFfQgOUMifHyP+KYbvpjbdoFNs+aK7DXlji0Tw=
github.com/golang/protobuf v1.5.2/go.mod h1:XVQd3VNwM+JqD3oG2Ue2ip4fOMUkwXdXDdiuN0vRsmY=
github.com/google/btree v0.0.0-20180813153112-4030bb1f1f0c/go.mod h1:lNA+9X1NB3Zf8V7Ke586lFgjr2dZNuvo3lPJSGZ5JPQ=
github.com/google/btree v1.0.0/go.mod h1:lNA+9X1NB3Zf8V7Ke586lFgjr2dZNuvo3lPJSGZ5JPQ=
github.com/google/go-cmp v0.2.0/go.mod h1:oXzfMopK8JAjlY9xF4vHSVASa0yLyX7SntLO5aqRK0M=
github.com/google/go-cmp v0.3.0/go.mod h1:8QqcDgzrUqlUb/G2PQTWiueGozuR1884gddMywk6iLU=
github.com/google/go-cmp v0.3.1/go.mod h1:8QqcDgzrUqlUb/G2PQTWiueGozuR1884gddMywk6iLU=
github.com/google/go-cmp v0.4.0/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.4.1/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.5.0/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.5.1/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.5.4/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.5.5/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.5.7 h1:81/ik6ipDQS2aGcBfIN5dHDB36BwrStyeAQquSYCV4o=
github.com/google/go-cmp v0.5.7/go.mod h1:n+brtR0CgQNWTVd5ZUFpTBC8YFBDLK/h/bpaJ8/DtOE=
github.com/google/gofuzz v1.0.0/go.mod h1:dBl0BpW6vV/+mYPU4Po3pmUjxk6FQPldtuIdl/M65Eg=
github.com/google/martian v2.1.0+incompatible/go.mod h1:9I4somxYTbIHy5NJKHRl3wXiIaQGbYVAs8BPL6v8lEs=
github.com/google/martian/v3 v3.0.0/go.mod h1:y5Zk1BBys9G+gd6Jrk0W3cC1+ELVxBWuIGO+w/tUAp0=
github.com/google/pprof v0.0.0-20181206194817-3ea8567a2e57/go.mod h1:zfwlbNMJ+OItoe0UupaVj+oy1omPYYDuagoSzA8v9mc=
github.com/google/pprof v0.0.0-20190515194954-54271f7e092f/go.mod h1:zfwlbNMJ+OItoe0UupaVj+oy1omPYYDuagoSzA8v9mc=
github.com/google/pprof v0.0.0-20191218002539-d4f498aebedc/go.mod h1:ZgVRPoUq/hfqzAqh7sHMqb3I9Rq5C59dIz2SbBwJ4eM=
github.com/google/pprof v0.0.0-20200212024743-f11f1df84d12/go.mod h1:ZgVRPoUq/hfqzAqh7sHMqb3I9Rq5C59dIz2SbBwJ4eM=
github.com/google/pprof v0.0.0-20200229191704-1ebb73c60ed3/go.mod h1:ZgVRPoUq/hfqzAqh7sHMqb3I9Rq5C59dIz2SbBwJ4eM=
github.com/google/pprof v0.0.0-20200430221834-fc25d7d30c6d/go.mod h1:ZgVRPoUq/hfqzAqh7sHMqb3I9Rq5C59dIz2SbBwJ4eM=
github.com/google/pprof v0.0.0-20200708004538-1a94d8640e99/go.mod h1:ZgVRPoUq/hfqzAqh7sHMqb3I9Rq5C59dIz2SbBwJ4eM=
github.com/google/renameio v0.1.0/go.mod h1:KWCgfxg9yswjAJkECMjeO8J8rahYeXnNhOm40UhjYkI=
github.com/googleapis/gax-go/v2 v2.0.4/go.mod h1:0Wqv26UfaUD9n4G6kQubkQ+KchISgw+vpHVxEJEs9eg=
github.com/googleapis/gax-go/v2 v2.0.5/go.mod h1:DWXyrwAJ9X0FpwwEdw+IPEYBICEFu5mhpdKc/us6bOk=
github.com/hashicorp/golang-lru v0.5.0/go.mod h1:/m3WP610KZHVQ1SGc6re/UDhFvYD7pJ4Ao+sR/qLZy8=
github.com/hashicorp/golang-lru v0.5.1/go.mod h1:/m3WP610KZHVQ1SGc6re/UDhFvYD7pJ4Ao+sR/qLZy8=
github.com/ianlancetaylor/demangle v0.0.0-20181102032728-5e5cf60278f6/go.mod h1:aSSvb/t6k1mPoxDqO4vJh6VOCGPwU4O0C2/Eqndh1Sc=
github.com/jpillora/backoff v1.0.0/go.mod h1:J/6gKK9jxlEcS3zixgDgUAsiuZ7yrSoa/FX5e0EB2j4=
github.com/json-iterator/go v1.1.6/go.mod h1:+SdeFBvtyEkXs7REEP0seUULqWtbJapLOCVDaaPEHmU=
github.com/json-iterator/go v1.1.10/go.mod h1:KdQUCv79m/52Kvf8AW2vK1V8akMuk1QjK/uOdHXbAo4=
github.com/json-iterator/go v1.1.11/go.mod h1:KdQUCv79m/52Kvf8AW2vK1V8akMuk1QjK/uOdHXbAo4=
github.com/json-iterator/go v1.1.12/go.mod h1:e30LSqwooZae/UwlEbR2852Gd8hjQvJoHmT4TnhNGBo=
github.com/jstemmer/go-junit-report v0.0.0-20190106144839-af01ea7f8024/go.mod h1:6v2b51hI/fHJwM22ozAgKL4VKDeJcHhJFhtBdhmNjmU=
github.com/jstemmer/go-junit-report v0.9.1/go.mod h1:Brl9GWCQeLvo8nXZwPNNblvFj/XSXhF0NWZEnDohbsk=
github.com/julienschmidt/httprouter v1.2.0/go.mod h1:SYymIcj16QtmaHHD7aYtjjsJG7VTCxuUUipMqKk8s4w=
github.com/julienschmidt/httprouter v1.3.0/go.mod h1:JR6WtHb+2LUe8TCKY3cZOxFyyO8IZAc4RVcycCCAKdM=
github.com/kisielk/gotool v1.0.0/go.mod h1:XhKaO+MFFWcvkIS/tQcRk01m1F5IRFswLeQ+oQHNcck=
github.com/konsorten/go-windows-terminal-sequences v1.0.1/go.mod h1:T0+1ngSBFLxvqU3pZ+m/2kptfBszLMUkC4ZK/EgS/cQ=
github.com/konsorten/go-windows-terminal-sequences v1.0.3/go.mod h1:T0+1ngSBFLxvqU3pZ+m/2kptfBszLMUkC4ZK/EgS/cQ=
github.com/kr/logfmt v0.0.0-20140226030751-b84e30acd515/go.mod h1:+0opPa2QZZtGFBFZlji/RkVcI2GknAs/DXo4wKdlNEc=
github.com/kr/pretty v0.1.0/go.mod h1:dAy3ld7l9f0ibDNOQOHHMYYIIbhfbHSm3C4ZsoJORNo=
github.com/kr/pty v1.1.1/go.mod h1:pFQYn66WHrOpPYNljwOMqo10TkYh1fy3cYio2l3bCsQ=
github.com/kr/text v0.1.0/go.mod h1:4Jbv+DJW3UT/LiOwJeYQe1efqtUx/iVham/4vfdArNI=
github.com/matttproud/golang_protobuf_extensions v1.0.1 h1:4hp9jkHxhMHkqkrB3Ix0jegS5sx/RkqARlsWZ6pIwiU=
github.com/matttproud/golang_protobuf_extensions v1.0.1/go.mod h1:D8He9yQNgCq6Z5Ld7szi9bcBfOoFv/3dc6xSMkL2PC0=
github.com/modern-go/concurrent v0.0.0-20180228061459-e0a39a4cb421/go.mod h1:6dJC0mAP4ikYIbvyc7fijjWJddQyLn8Ig3JB5CqoB9Q=
github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd/go.mod h1:6dJC0mAP4ikYIbvyc7fijjWJddQyLn8Ig3JB5CqoB9Q=
github.com/modern-go/reflect2 v0.0.0-20180701023420-4b7aa43c6742/go.mod h1:bx2lNnkwVCuqBIxFjflWJWanXIb3RllmbCylyMrvgv0=
github.com/modern-go/reflect2 v1.0.1/go.mod h1:bx2lNnkwVCuqBIxFjflWJWanXIb3RllmbCylyMrvgv0=
github.com/modern-go/reflect2 v1.0.2/go.mod h1:yWuevngMOJpCy52FWWMvUC8ws7m/LJsjYzDa0/r8luk=
github.com/mwitkow/go-conntrack v0.0.0-20161129095857-cc309e4a2223/go.mod h1:qRWi+5nqEBWmkhHvq77mSJWrCKwh8bxhgT7d/eI7P4U=
github.com/mwitkow/go-conntrack v0.0.0-20190716064945-2f068394615f/go.mod h1:qRWi+5nqEBWmkhHvq77mSJWrCKwh8bxhgT7d/eI7P4U=
github.com/pkg/errors v0.8.0/go.mod h1:bwawxfHBFNV+L2hUp1rHADufV3IMtnDRdf1r5NINEl0=
github.com/pkg/errors v0.8.1/go.mod h1:bwawxfHBFNV+L2hUp1rHADufV3IMtnDRdf1r5NINEl0=
github.com/pkg/errors v0.9.1/go.mod h1:bwawxfHBFNV+L2hUp1rHADufV3IMtnDRdf1r5NINEl0=
github.com/pmezard/go-difflib v1.0.0 h1:4DBwDE0NGyQoBHbLQYPwSUPoCMWR5BEzIk/f1lZbAQM=
github.com/pmezard/go-difflib v1.0.0/go.mod h1:iKH77koFhYxTK1pcRnkKkqfTogsbg7gZNVY4sRDYZ/4=
github.com/prometheus/client_golang v0.9.1/go.mod h1:7SWBe2y4D6OKWSNQJUaRYU/AaXPKyh/dDVn+NZz0KFw=
github.com/prometheus/client_golang v1.0.0/go.mod h1:db9x61etRT2tGnBNRi70OPL5FsnadC4Ky3P0J6CfImo=
github.com/prometheus/client_golang v1.7.1/go.mod h1:PY5Wy2awLA44sXw4AOSfFBetzPP4j5+D6mVACh+pe2M=
github.com/prometheus/client_golang v1.11.0/go.mod h1:Z6t4BnS23TR94PD6BsDNk8yVqroYurpAkEiz0P2BEV0=
github.com/prometheus/client_golang v1.12.1/go.mod h1:3Z9XVyYiZYEO+YQWt3RD2R3jrbd179Rt297l4aS6nDY=
github.com/prometheus/client_golang v1.12.2 h1:51L9cDoUHVrXx4zWYlcLQIZ+d+VXHgqnYKkIuq4g/34=
github.com/prometheus/client_golang v1.12.2/go.mod h1:3Z9XVyYiZYEO+YQWt3RD2R3jrbd179Rt297l4aS6nDY=
github.com/prometheus/client_model v0.0.0-20180712105110-5c3871d89910/go.mod h1:MbSGuTsp3dbXC40dX6PRTWyKYBIrTGTE9sqQNg2J8bo=
github.com/prometheus/client_model v0.0.0-20190129233127-fd36f4220a90/go.mod h1:xMI15A0UPsDsEKsMN9yxemIoYk6Tm2C1GtYGdfGttqA=
github.com/prometheus/client_model v0.0.0-20190812154241-14fe0d1b01d4/go.mod h1:xMI15A0UPsDsEKsMN9yxemIoYk6Tm2C1GtYGdfGttqA=
github.com/prometheus/client_model v0.2.0 h1:uq5h0d+GuxiXLJLNABMgp2qUWDPiLvgCzz2dUR+/W/M=
github.com/prometheus/client_model v0.2.0/go.mod h1:xMI15A0UPsDsEKsMN9yxemIoYk6Tm2C1GtYGdfGttqA=
github.com/prometheus/common v0.4.1/go.mod h1:TNfzLD0ON7rHzMJeJkieUDPYmFC7Snx/y86RQel1bk4=
github.com/prometheus/common v0.10.0/go.mod h1:Tlit/dnDKsSWFlCLTWaA1cyBgKHSMdTB80sz/V91rCo=
github.com/prometheus/common v0.26.0/go.mod h1:M7rCNAaPfAosfx8veZJCuw84e35h3Cfd9VFqTh1DIvc=
github.com/prometheus/common v0.32.1/go.mod h1:vu+V0TpY+O6vW9J44gczi3Ap/oXXR10b+M/gUGO4Hls=
github.com/prometheus/common v0.35.0 h1:Eyr+Pw2VymWejHqCugNaQXkAi6KayVNxaHeu6khmFBE=
github.com/prometheus/common v0.35.0/go.mod h1:phzohg0JFMnBEFGxTDbfu3QyL5GI8gTQJFhYO5B3mfA=
github.com/prometheus/procfs v0.0.0-20181005140218-185b4288413d/go.mod h1:c3At6R/oaqEKCNdg8wHV1ftS6bRYblBhIjjI8uT2IGk=
github.com/prometheus/procfs v0.0.2/go.mod h1:TjEm7ze935MbeOT/UhFTIMYKhuLP4wbCsTZCD3I8kEA=
github.com/prometheus/procfs v0.1.3/go.mod h1:lV6e/gmhEcM9IjHGsFOCxxuZ+z1YqCvr4OA4YeYWdaU=
github.com/prometheus/procfs v0.6.0/go.mod h1:cz+aTbrPOrUb4q7XlbU9ygM+/jj0fzG6c1xBZuNvfVA=
github.com/prometheus/procfs v0.7.3 h1:4jVXhlkAyzOScmCkXBTOLRLTz8EeU+eyjrwB/EPq0VU=
github.com/prometheus/procfs v0.7.3/go.mod h1:cz+aTbrPOrUb4q7XlbU9ygM+/jj0fzG6c1xBZuNvfVA=
github.com/rogpeppe/go-internal v1.3.0/go.mod h1:M8bDsm7K2OlrFYOpmOWEs/qY81heoFRclV5y23lUDJ4=
github.com/sirupsen/logrus v1.2.0/go.mod h1:LxeOpSwHxABJmUn/MG1IvRgCAasNZTLOkJPxbbu5VWo=
github.com/sirupsen/logrus v1.4.2/go.mod h1:tLMulIdttU9McNUspp0xgXVQah82FyeX6MwdIuYE2rE=
github.com/sirupsen/logrus v1.6.0/go.mod h1:7uNnSEd1DgxDLC74fIahvMZmmYsHGZGEOFrfsX/uA88=
github.com/stretchr/objx v0.1.0/go.mod h1:HFkY916IF+rwdDfMAkV7OtwuqBVzrE8GR6GFx+wExME=
github.com/stretchr/objx v0.1.1 h1:2vfRuCMp5sSVIDSqO8oNnWJq7mPa6KVP3iPIwFBuy8A=
github.com/stretchr/objx v0.1.1/go.mod h1:HFkY916IF+rwdDfMAkV7OtwuqBVzrE8GR6GFx+wExME=
github.com/stretchr/testify v1.2.2/go.mod h1:a8OnRcib4nhh0OaRAV+Yts87kKdq0PP7pXfy6kDkUVs=
github.com/stretchr/testify v1.3.0/go.mod h1:M5WIy9Dh21IEIfnGCwXGc5bZfKNJtfHm1UVUgZn+9EI=
github.com/stretchr/testify v1.4.0/go.mod h1:j7eGeouHqKxXV5pUuKE4zz7dFj8WfuZ+81PSLYec5m4=
github.com/stretchr/testify v1.7.1 h1:5TQK59W5E3v0r2duFAb7P95B6hEeOyEnHRa8MjYSMTY=
github.com/stretchr/testify v1.7.1/go.mod h1:6Fq8oRcR53rry900zMqJjRRixrwX3KX962/h/Wwjteg=
github.com/yuin/goldmark v1.1.25/go.mod h1:3hX8gzYuyVAZsxl0MRgGTJEmQBFcNTphYh9decYSb74=
github.com/yuin/goldmark v1.1.27/go.mod h1:3hX8gzYuyVAZsxl0MRgGTJEmQBFcNTphYh9decYSb74=
github.com/yuin/goldmark v1.1.32/go.mod h1:3hX8gzYuyVAZsxl0MRgGTJEmQBFcNTphYh9decYSb74=
go.opencensus.io v0.21.0/go.mod h1:mSImk1erAIZhrmZN+AvHh14ztQfjbGwt4TtuofqLduU=
go.opencensus.io v0.22.0/go.mod h1:+kGneAE2xo2IficOXnaByMWTGM9T73dGwxeWcUqIpI8=
go.opencensus.io v0.22.2/go.mod h1:yxeiOL68Rb0Xd1ddK5vPZ/oVn4vY4Ynel7k9FzqtOIw=
go.opencensus.io v0.22.3/go.mod h1:yxeiOL68Rb0Xd1ddK5vPZ/oVn4vY4Ynel7k9FzqtOIw=
go.opencensus.io v0.22.4/go.mod h1:yxeiOL68Rb0Xd1ddK5vPZ/oVn4vY4Ynel7k9FzqtOIw=
go.opentelemetry.io/otel v1.7.0 h1:Z2lA3Tdch0iDcrhJXDIlC94XE+bxok1F9B+4Lz/lGsM=
go.opentelemetry.io/otel v1.7.0/go.mod h1:5BdUoMIz5WEs0vt0CUEMtSSaTSHBBVwrhnz7+nrD5xk=
go.opentelemetry.io/otel/exporters/jaeger v1.7.0 h1:wXgjiRldljksZkZrldGVe6XrG9u3kYDyQmkZwmm5dI0=
go.opentelemetry.io/otel/exporters/jaeger v1.7.0/go.mod h1:PwQAOqBgqbLQRKlj466DuD2qyMjbtcPpfPfj+AqbSBs=
go.opentelemetry.io/otel/sdk v1.7.0 h1:4OmStpcKVOfvDOgCt7UriAPtKolwIhxpnSNI/yK+1B0=
go.opentelemetry.io/otel/sdk v1.7.0/go.mod h1:uTEOTwaqIVuTGiJN7ii13Ibp75wJmYUDe374q6cZwUU=
go.opentelemetry.io/otel/trace v1.7.0 h1:O37Iogk1lEkMRXewVtZ1BBTVn5JEp8GrJvP92bJqC6o=
go.opentelemetry.io/otel/trace v1.7.0/go.mod h1:fzLSB9nqR2eXzxPXb2JW9IKE+ScyXA48yyE4TNvoHqU=
golang.org/x/crypto v0.0.0-20180904163835-0709b304e793/go.mod h1:6SG95UA2DQfeDnfUPMdvaQW0Q7yPrPDi9nlGo2tz2b4=
golang.org/x/crypto v0.0.0-20190308221718-c2843e01d9a2/go.mod h1:djNgcEr1/C05ACkg1iLfiJU5Ep61QUkGW8qpdssI0+w=
golang.org/x/crypto v0.0.0-20190510104115-cbcb75029529/go.mod h1:yigFU9vqHzYiE8UmvKecakEJjdnWj3jj499lnFckfCI=
golang.org/x/crypto v0.0.0-20190605123033-f99c8df09eb5/go.mod h1:yigFU9vqHzYiE8UmvKecakEJjdnWj3jj499lnFckfCI=
golang.org/x/crypto v0.0.0-20191011191535-87dc89f01550/go.mod h1:yigFU9vqHzYiE8UmvKecakEJjdnWj3jj499lnFckfCI=
golang.org/x/crypto v0.0.0-20200622213623-75b288015ac9/go.mod h1:LzIPMQfyMNhhGPhUkYOs5KpL4U8rLKemX1yGLhDgUto=
golang.org/x/exp v0.0.0-20190121172915-509febef88a4/go.mod h1:CJ0aWSM057203Lf6IL+f9T1iT9GByDxfZKAQTCR3kQA=
golang.org/x/exp v0.0.0-20190306152737-a1d7652674e8/go.mod h1:CJ0aWSM057203Lf6IL+f9T1iT9GByDxfZKAQTCR3kQA=
golang.org/x/exp v0.0.0-20190510132918-efd6b22b2522/go.mod h1:ZjyILWgesfNpC6sMxTJOJm9Kp84zZh5NQWvqDGG3Qr8=
golang.org/x/exp v0.0.0-20190829153037-c13cbed26979/go.mod h1:86+5VVa7VpoJ4kLfm080zCjGlMRFzhUhsZKEZO7MGek=
golang.org/x/exp v0.0.0-20191030013958-a1ab85dbe136/go.mod h1:JXzH8nQsPlswgeRAPE3MuO9GYsAcnJvJ4vnMwN/5qkY=
golang.org/x/exp v0.0.0-20191129062945-2f5052295587/go.mod h1:2RIsYlXP63K8oxa1u096TMicItID8zy7Y6sNkU49FU4=
golang.org/x/exp v0.0.0-20191227195350-da58074b4299/go.mod h1:2RIsYlXP63K8oxa1u096TMicItID8zy7Y6sNkU49FU4=
golang.org/x/exp v0.0.0-20200119233911-0405dc783f0a/go.mod h1:2RIsYlXP63K8oxa1u096TMicItID8zy7Y6sNkU49FU4=
golang.org/x/exp v0.0.0-20200207192155-f17229e696bd/go.mod h1:J/WKrq2StrnmMY6+EHIKF9dgMWnmCNThgcyBT1FY9mM=
golang.org/x/exp v0.0.0-20200224162631-6cc2880d07d6/go.mod h1:3jZMyOhIsHpP37uCMkUooju7aAi5cS1Q23tOzKc+0MU=
golang.org/x/image v0.0.0-20190227222117-0694c2d4d067/go.mod h1:kZ7UVZpmo3dzQBMxlp+ypCbDeSB+sBbTgSJuh5dn5js=
golang.org/x/image v0.0.0-20190802002840-cff245a6509b/go.mod h1:FeLwcggjj3mMvU+oOTbSwawSJRM1uh48EjtB4UJZlP0=
golang.org/x/lint v0.0.0-20181026193005-c67002cb31c3/go.mod h1:UVdnD1Gm6xHRNCYTkRU2/jEulfH38KcIWyp/GAMgvoE=
golang.org/x/lint v0.0.0-20190227174305-5b3e6a55c961/go.mod h1:wehouNa3lNwaWXcvxsM5YxQ5yQlVC4a0KAMCusXpPoU=
golang.org/x/lint v0.0.0-20190301231843-5614ed5bae6f/go.mod h1:UVdnD1Gm6xHRNCYTkRU2/jEulfH38KcIWyp/GAMgvoE=
golang.org/x/lint v0.0.0-20190313153728-d0100b6bd8b3/go.mod h1:6SW0HCj/g11FgYtHlgUYUwCkIfeOF89ocIRzGO/8vkc=
golang.org/x/lint v0.0.0-20190409202823-959b441ac422/go.mod h1:6SW0HCj/g11FgYtHlgUYUwCkIfeOF89ocIRzGO/8vkc=
golang.org/x/lint v0.0.0-20190909230951-414d861bb4ac/go.mod h1:6SW0HCj/g11FgYtHlgUYUwCkIfeOF89ocIRzGO/8vkc=
golang.org/x/lint v0.0.0-20190930215403-16217165b5de/go.mod h1:6SW0HCj/g11FgYtHlgUYUwCkIfeOF89ocIRzGO/8vkc=
golang.org/x/lint v0.0.0-20191125180803-fdd1cda4f05f/go.mod h1:5qLYkcX4OjUUV8bRuDixDT3tpyyb+LUpUlRWLxfhWrs=
golang.org/x/lint v0.0.0-20200130185559-910be7a94367/go.mod h1:3xt1FjdF8hUf6vQPIChWIBhFzV8gjjsPE/fR3IyQdNY=
golang.org/x/lint v0.0.0-20200302205851-738671d3881b/go.mod h1:3xt1FjdF8hUf6vQPIChWIBhFzV8gjjsPE/fR3IyQdNY=
golang.org/x/mobile v0.0.0-20190312151609-d3739f865fa6/go.mod h1:z+o9i4GpDbdi3rU15maQ/Ox0txvL9dWGYEHz965HBQE=
golang.org/x/mobile v0.0.0-20190719004257-d2bd2a29d028/go.mod h1:E/iHnbuqvinMTCcRqshq8CkpyQDoeVncDDYHnLhea+o=
golang.org/x/mod v0.0.0-20190513183733-4bf6d317e70e/go.mod h1:mXi4GBBbnImb6dmsKGUJ2LatrhH/nqhxcFungHvyanc=
golang.org/x/mod v0.1.0/go.mod h1:0QHyrYULN0/3qlju5TqG8bIK38QM8yzMo5ekMj3DlcY=
golang.org/x/mod v0.1.1-0.20191105210325-c90efee705ee/go.mod h1:QqPTAvyqsEbceGzBzNggFXnrqF1CaUcvgkdR5Ot7KZg=
golang.org/x/mod v0.1.1-0.20191107180719-034126e5016b/go.mod h1:QqPTAvyqsEbceGzBzNggFXnrqF1CaUcvgkdR5Ot7KZg=
golang.org/x/mod v0.2.0/go.mod h1:s0Qsj1ACt9ePp/hMypM3fl4fZqREWJwdYDEqhRiZZUA=
golang.org/x/mod v0.3.0/go.mod h1:s0Qsj1ACt9ePp/hMypM3fl4fZqREWJwdYDEqhRiZZUA=
golang.org/x/net v0.0.0-20180724234803-3673e40ba225/go.mod h1:mL1N/T3taQHkDXs73rZJwtUhF3w3ftmwwsq0BUmARs4=
golang.org/x/net v0.0.0-20180826012351-8a410e7b638d/go.mod h1:mL1N/T3taQHkDXs73rZJwtUhF3w3ftmwwsq0BUmARs4=
golang.org/x/net v0.0.0-20181114220301-adae6a3d119a/go.mod h1:mL1N/T3taQHkDXs73rZJwtUhF3w3ftmwwsq0BUmARs4=
golang.org/x/net v0.0.0-20190108225652-1e06a53dbb7e/go.mod h1:mL1N/T3taQHkDXs73rZJwtUhF3w3ftmwwsq0BUmARs4=
golang.org/x/net v0.0.0-20190213061140-3a22650c66bd/go.mod h1:mL1N/T3taQHkDXs73rZJwtUhF3w3ftmwwsq0BUmARs4=
golang.org/x/net v0.0.0-20190311183353-d8887717615a/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190404232315-eb5bcb51f2a3/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190501004415-9ce7a6920f09/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190503192946-f4e77d36d62c/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190603091049-60506f45cf65/go.mod h1:HSz+uSET+XFnRR8LxR5pz3Of3rY3CfYBVs4xY44aLks=
golang.org/x/net v0.0.0-20190613194153-d28f0bde5980/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20190620200207-3b0461eec859/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20190628185345-da137c7871d7/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20190724013045-ca1201d0de80/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20191209160850-c0dbc17a3553/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200114155413-6afb5195e5aa/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200202094626-16171245cfb2/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200222125558-5a598a2470a0/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200226121028-0de0cce0169b/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200301022130-244492dfa37a/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200324143707-d3edc9973b7e/go.mod h1:qpuaurCH72eLCgpAm/N6yyVIVM9cpaDIP3A8BGJEC5A=
golang.org/x/net v0.0.0-20200501053045-e0ff5e5a1de5/go.mod h1:qpuaurCH72eLCgpAm/N6yyVIVM9cpaDIP3A8BGJEC5A=
golang.org/x/net v0.0.0-20200506145744-7e3656a0809f/go.mod h1:qpuaurCH72eLCgpAm/N6yyVIVM9cpaDIP3A8BGJEC5A=
golang.org/x/net v0.0.0-20200513185701-a91f0712d120/go.mod h1:qpuaurCH72eLCgpAm/N6yyVIVM9cpaDIP3A8BGJEC5A=
golang.org/x/net v0.0.0-20200520182314-0ba52f642ac2/go.mod h1:qpuaurCH72eLCgpAm/N6yyVIVM9cpaDIP3A8BGJEC5A=
golang.org/x/net v0.0.0-20200625001655-4c5254603344/go.mod h1:/O7V0waA8r7cgGh81Ro3o1hOxt32SMVPicZroKQ2sZA=
golang.org/x/net v0.0.0-20200707034311-ab3426394381/go.mod h1:/O7V0waA8r7cgGh81Ro3o1hOxt32SMVPicZroKQ2sZA=
golang.org/x/net v0.0.0-20200822124328-c89045814202/go.mod h1:/O7V0waA8r7cgGh81Ro3o1hOxt32SMVPicZroKQ2sZA=
golang.org/x/net v0.0.0-20210525063256-abc453219eb5/go.mod h1:9nx3DQGgdP8bBQD5qxJ1jj9UTztislL4KSBs9R2vV5Y=
golang.org/x/net v0.0.0-20220127200216-cd36cc0744dd/go.mod h1:CfG3xpIq0wQ8r1q4Su4UZFWDARRcnwPjda9FqA0JpMk=
golang.org/x/net v0.0.0-20220225172249-27dd8689420f/go.mod h1:CfG3xpIq0wQ8r1q4Su4UZFWDARRcnwPjda9FqA0JpMk=
golang.org/x/oauth2 v0.0.0-20180821212333-d2e6202438be/go.mod h1:N/0e6XlmueqKjAGxoOufVs8QHGRruUQn6yWY3a++T0U=
golang.org/x/oauth2 v0.0.0-20190226205417-e64efc72b421/go.mod h1:gOpvHmFTYa4IltrdGE7lF6nIHvwfUNPOp7c8zoXwtLw=
golang.org/x/oauth2 v0.0.0-20190604053449-0f29369cfe45/go.mod h1:gOpvHmFTYa4IltrdGE7lF6nIHvwfUNPOp7c8zoXwtLw=
golang.org/x/oauth2 v0.0.0-20191202225959-858c2ad4c8b6/go.mod h1:gOpvHmFTYa4IltrdGE7lF6nIHvwfUNPOp7c8zoXwtLw=
golang.org/x/oauth2 v0.0.0-20200107190931-bf48bf16ab8d/go.mod h1:gOpvHmFTYa4IltrdGE7lF6nIHvwfUNPOp7c8zoXwtLw=
golang.org/x/oauth2 v0.0.0-20210514164344-f6687ab2804c/go.mod h1:KelEdhl1UZF7XfJ4dDtk6s++YSgaE7mD/BuKKDLBl4A=
golang.org/x/oauth2 v0.0.0-20220223155221-ee480838109b/go.mod h1:DAh4E804XQdzx2j+YRIaUnCqCV2RuMz24cGBJ5QYIrc=
golang.org/x/sync v0.0.0-20180314180146-1d60e4601c6f/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20181108010431-42b317875d0f/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20181221193216-37e7f081c4d4/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20190227155943-e225da77a7e6/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20190423024810-112230192c58/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20190911185100-cd5d95a43a6e/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20200317015054-43a5402ce75a/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20200625203802-6e8e738ad208/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20201207232520-09787c993a3a/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sys v0.0.0-20180830151530-49385e6e1522/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20180905080454-ebe1bf3edb33/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20181116152217-5ac8a444bdc5/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20190215142949-d0b11bdaac8a/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20190312061237-fead79001313/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190412213103-97732733099d/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190422165155-953cdadca894/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190502145724-3ef323f4f1fd/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190507160741-ecd444e8653b/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190606165138-5da285871e9c/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190624142023-c5567b49c5d0/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190726091711-fc99dfbffb4e/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20191001151750-bb3f8db39f24/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20191204072324-ce4227a45e2e/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20191228213918-04cbcbbfeed8/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200106162015-b016eb3dc98e/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200113162924-86b910548bc1/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200122134326-e047566fdf82/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200202164722-d101bd2416d5/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200212091648-12a6c2dcc1e4/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200223170610-d5e6a3e2c0ae/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200302150141-5c8b2ff67527/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200323222414-85ca7c5b95cd/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200331124033-c3d80250170d/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200501052902-10377860bb8e/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200511232937-7e40ca221e25/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200515095857-1151b9dac4a9/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200523222454-059865788121/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200615200032-f1bc736245b1/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200625212154-ddb9806d33ae/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200803210538-64077c9b5642/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20201119102817-f84b799fce68/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20210124154548-22da62e12c0c/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20210423082822-04245dca01da/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20210423185535-09eb48e85fd7/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20210603081109-ebe580a85c40/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20210615035016-665e8c7367d1/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20211216021012-1d35b9e2eb4e/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20220114195835-da31bd327af9/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/sys v0.0.0-20220627191245-f75cf1eec38b h1:2n253B2r0pYSmEV+UNCQoPfU/FiaizQEK5Gu4Bq4JE8=
golang.org/x/sys v0.0.0-20220627191245-f75cf1eec38b/go.mod h1:oPkhp1MJrh7nUepCBck5+mAzfO9JrbApNNgaTdGDITg=
golang.org/x/term v0.0.0-20201126162022-7de9c90e9dd1/go.mod h1:bj7SfCRtBDWHUb9snDiAeCFNEtKQo2Wmx5Cou7ajbmo=
golang.org/x/term v0.0.0-20210927222741-03fcf44c2211/go.mod h1:jbD1KX2456YbFQfuXm/mYQcufACuNUgVhRMnK/tPxf8=
golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c/go.mod h1:NqM8EUOU14njkJ3fqMW+pc6Ldnwhi/IjpwHt7yyuwOQ=
golang.org/x/text v0.3.0/go.mod h1:NqM8EUOU14njkJ3fqMW+pc6Ldnwhi/IjpwHt7yyuwOQ=
golang.org/x/text v0.3.1-0.20180807135948-17ff2d5776d2/go.mod h1:NqM8EUOU14njkJ3fqMW+pc6Ldnwhi/IjpwHt7yyuwOQ=
golang.org/x/text v0.3.2/go.mod h1:bEr9sfX3Q8Zfm5fL9x+3itogRgK3+ptLWKqgva+5dAk=
golang.org/x/text v0.3.3/go.mod h1:5Zoc/QRtKVWzQhOtBMvqHzDpF6irO9z98xDceosuGiQ=
golang.org/x/text v0.3.6/go.mod h1:5Zoc/QRtKVWzQhOtBMvqHzDpF6irO9z98xDceosuGiQ=
golang.org/x/text v0.3.7/go.mod h1:u+2+/6zg+i71rQMx5EYifcz6MCKuco9NR6JIITiCfzQ=
golang.org/x/time v0.0.0-20181108054448-85acf8d2951c/go.mod h1:tRJNPiyCQ0inRvYxbN9jk5I+vvW/OXSQhTDSoE431IQ=
golang.org/x/time v0.0.0-20190308202827-9d24e82272b4/go.mod h1:tRJNPiyCQ0inRvYxbN9jk5I+vvW/OXSQhTDSoE431IQ=
golang.org/x/time v0.0.0-20191024005414-555d28b269f0/go.mod h1:tRJNPiyCQ0inRvYxbN9jk5I+vvW/OXSQhTDSoE431IQ=
golang.org/x/tools v0.0.0-20180917221912-90fa682c2a6e/go.mod h1:n7NCudcB/nEzxVGmLbDWY5pfWTLqBcC2KZ6jyYvM4mQ=
golang.org/x/tools v0.0.0-20190114222345-bf090417da8b/go.mod h1:n7NCudcB/nEzxVGmLbDWY5pfWTLqBcC2KZ6jyYvM4mQ=
golang.org/x/tools v0.0.0-20190226205152-f727befe758c/go.mod h1:9Yl7xja0Znq3iFh3HoIrodX9oNMXvdceNzlUR8zjMvY=
golang.org/x/tools v0.0.0-20190311212946-11955173bddd/go.mod h1:LCzVGOaR6xXOjkQ3onu1FJEFr0SW1gC7cKk1uF8kGRs=
golang.org/x/tools v0.0.0-20190312151545-0bb0c0a6e846/go.mod h1:LCzVGOaR6xXOjkQ3onu1FJEFr0SW1gC7cKk1uF8kGRs=
golang.org/x/tools v0.0.0-20190312170243-e65039ee4138/go.mod h1:LCzVGOaR6xXOjkQ3onu1FJEFr0SW1gC7cKk1uF8kGRs=
golang.org/x/tools v0.0.0-20190425150028-36563e24a262/go.mod h1:RgjU9mgBXZiqYHBnxXauZ1Gv1EHHAz9KjViQ78xBX0Q=
golang.org/x/tools v0.0.0-20190506145303-2d16b83fe98c/go.mod h1:RgjU9mgBXZiqYHBnxXauZ1Gv1EHHAz9KjViQ78xBX0Q=
golang.org/x/tools v0.0.0-20190524140312-2c0ae7006135/go.mod h1:RgjU9mgBXZiqYHBnxXauZ1Gv1EHHAz9KjViQ78xBX0Q=
golang.org/x/tools v0.0.0-20190606124116-d0a3d012864b/go.mod h1:/rFqwRUd4F7ZHNgwSSTFct+R/Kf4OFW1sUzUTQQTgfc=
golang.org/x/tools v0.0.0-20190621195816-6e04913cbbac/go.mod h1:/rFqwRUd4F7ZHNgwSSTFct+R/Kf4OFW1sUzUTQQTgfc=
golang.org/x/tools v0.0.0-20190628153133-6cdbf07be9d0/go.mod h1:/rFqwRUd4F7ZHNgwSSTFct+R/Kf4OFW1sUzUTQQTgfc=
golang.org/x/tools v0.0.0-20190816200558-6889da9d5479/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20190911174233-4f2ddba30aff/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20191012152004-8de300cfc20a/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20191113191852-77e3bb0ad9e7/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20191115202509-3a792d9c32b2/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20191119224855-298f0cb1881e/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20191125144606-a911d9008d1f/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20191130070609-6e064ea0cf2d/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20191216173652-a0e659d51361/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20191227053925-7b8e75db28f4/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20200117161641-43d50277825c/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20200122220014-bf1340f18c4a/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20200130002326-2f3ba24bd6e7/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20200204074204-1cc6d1ef6c74/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20200207183749-b753a1ba74fa/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20200212150539-ea181f53ac56/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20200224181240-023911ca70b2/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20200227222343-706bc42d1f0d/go.mod h1:TB2adYChydJhpapKDTa4BR/hXlZSLoq2Wpct/0txZ28=
golang.org/x/tools v0.0.0-20200304193943-95d2e580d8eb/go.mod h1:o4KQGtdN14AW+yjsvvwRTJJuXz8XRtIHtEnmAXLyFUw=
golang.org/x/tools v0.0.0-20200312045724-11d5b4c81c7d/go.mod h1:o4KQGtdN14AW+yjsvvwRTJJuXz8XRtIHtEnmAXLyFUw=
golang.org/x/tools v0.0.0-20200331025713-a30bf2db82d4/go.mod h1:Sl4aGygMT6LrqrWclx+PTx3U+LnKx/seiNR+3G19Ar8=
golang.org/x/tools v0.0.0-20200501065659-ab2804fb9c9d/go.mod h1:EkVYQZoAsY45+roYkvgYkIh4xh/qjgUK9TdY2XT94GE=
golang.org/x/tools v0.0.0-20200512131952-2bc93b1c0c88/go.mod h1:EkVYQZoAsY45+roYkvgYkIh4xh/qjgUK9TdY2XT94GE=
golang.org/x/tools v0.0.0-20200515010526-7d3b6ebf133d/go.mod h1:EkVYQZoAsY45+roYkvgYkIh4xh/qjgUK9TdY2XT94GE=
golang.org/x/tools v0.0.0-20200618134242-20370b0cb4b2/go.mod h1:EkVYQZoAsY45+roYkvgYkIh4xh/qjgUK9TdY2XT94GE=
golang.org/x/tools v0.0.0-20200729194436-6467de6f59a7/go.mod h1:njjCfa9FT2d7l9Bc6FUM5FLjQPp3cFF28FI3qnDFljA=
golang.org/x/tools v0.0.0-20200804011535-6c149bb5ef0d/go.mod h1:njjCfa9FT2d7l9Bc6FUM5FLjQPp3cFF28FI3qnDFljA=
golang.org/x/tools v0.0.0-20200825202427-b303f430e36d/go.mod h1:njjCfa9FT2d7l9Bc6FUM5FLjQPp3cFF28FI3qnDFljA=
golang.org/x/xerrors v0.0.0-20190717185122-a985d3407aa7/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
golang.org/x/xerrors v0.0.0-20191011141410-1b5146add898/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
golang.org/x/xerrors v0.0.0-20191204190536-9bdfabe68543/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1 h1:go1bK/D/BFZV2I8cIQd1NKEZ+0owSTG1fDTci4IqFcE=
golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
google.golang.org/api v0.4.0/go.mod h1:8k5glujaEP+g9n7WNsDg8QP6cUVNI86fCNMcbazEtwE=
google.golang.org/api v0.7.0/go.mod h1:WtwebWUNSVBH/HAw79HIFXZNqEvBhG+Ra+ax0hx3E3M=
google.golang.org/api v0.8.0/go.mod h1:o4eAsZoiT+ibD93RtjEohWalFOjRDx6CVaqeizhEnKg=
google.golang.org/api v0.9.0/go.mod h1:o4eAsZoiT+ibD93RtjEohWalFOjRDx6CVaqeizhEnKg=
google.golang.org/api v0.13.0/go.mod h1:iLdEw5Ide6rF15KTC1Kkl0iskquN2gFfn9o9XIsbkAI=
google.golang.org/api v0.14.0/go.mod h1:iLdEw5Ide6rF15KTC1Kkl0iskquN2gFfn9o9XIsbkAI=
google.golang.org/api v0.15.0/go.mod h1:iLdEw5Ide6rF15KTC1Kkl0iskquN2gFfn9o9XIsbkAI=
google.golang.org/api v0.17.0/go.mod h1:BwFmGc8tA3vsd7r/7kR8DY7iEEGSU04BFxCo5jP/sfE=
google.golang.org/api v0.18.0/go.mod h1:BwFmGc8tA3vsd7r/7kR8DY7iEEGSU04BFxCo5jP/sfE=
google.golang.org/api v0.19.0/go.mod h1:BwFmGc8tA3vsd7r/7kR8DY7iEEGSU04BFxCo5jP/sfE=
google.golang.org/api v0.20.0/go.mod h1:BwFmGc8tA3vsd7r/7kR8DY7iEEGSU04BFxCo5jP/sfE=
google.golang.org/api v0.22.0/go.mod h1:BwFmGc8tA3vsd7r/7kR8DY7iEEGSU04BFxCo5jP/sfE=
google.golang.org/api v0.24.0/go.mod h1:lIXQywCXRcnZPGlsd8NbLnOjtAoL6em04bJ9+z0MncE=
google.golang.org/api v0.28.0/go.mod h1:lIXQywCXRcnZPGlsd8NbLnOjtAoL6em04bJ9+z0MncE=
google.golang.org/api v0.29.0/go.mod h1:Lcubydp8VUV7KeIHD9z2Bys/sm/vGKnG1UHuDBSrHWM=
google.golang.org/api v0.30.0/go.mod h1:QGmEvQ87FHZNiUVJkT14jQNYJ4ZJjdRF23ZXz5138Fc=
google.golang.org/appengine v1.1.0/go.mod h1:EbEs0AVv82hx2wNQdGPgUI5lhzA/G0D9YwlJXL52JkM=
google.golang.org/appengine v1.4.0/go.mod h1:xpcJRLb0r/rnEns0DIKYYv+WjYCduHsrkT7/EB5XEv4=
google.golang.org/appengine v1.5.0/go.mod h1:xpcJRLb0r/rnEns0DIKYYv+WjYCduHsrkT7/EB5XEv4=
google.golang.org/appengine v1.6.1/go.mod h1:i06prIuMbXzDqacNJfV5OdTW448YApPu5ww/cMBSeb0=
google.golang.org/appengine v1.6.5/go.mod h1:8WjMMxjGQR8xUklV/ARdw2HLXBOI7O7uCIDZVag1xfc=
google.golang.org/appengine v1.6.6/go.mod h1:8WjMMxjGQR8xUklV/ARdw2HLXBOI7O7uCIDZVag1xfc=
google.golang.org/genproto v0.0.0-20180817151627-c66870c02cf8/go.mod h1:JiN7NxoALGmiZfu7CAH4rXhgtRTLTxftemlI0sWmxmc=
google.golang.org/genproto v0.0.0-20190307195333-5fe7a883aa19/go.mod h1:VzzqZJRnGkLBvHegQrXjBqPurQTc5/KpmUdxsrq26oE=
google.golang.org/genproto v0.0.0-20190418145605-e7d98fc518a7/go.mod h1:VzzqZJRnGkLBvHegQrXjBqPurQTc5/KpmUdxsrq26oE=
google.golang.org/genproto v0.0.0-20190425155659-357c62f0e4bb/go.mod h1:VzzqZJRnGkLBvHegQrXjBqPurQTc5/KpmUdxsrq26oE=
google.golang.org/genproto v0.0.0-20190502173448-54afdca5d873/go.mod h1:VzzqZJRnGkLBvHegQrXjBqPurQTc5/KpmUdxsrq26oE=
google.golang.org/genproto v0.0.0-20190801165951-fa694d86fc64/go.mod h1:DMBHOl98Agz4BDEuKkezgsaosCRResVns1a3J2ZsMNc=
google.golang.org/genproto v0.0.0-20190819201941-24fa4b261c55/go.mod h1:DMBHOl98Agz4BDEuKkezgsaosCRResVns1a3J2ZsMNc=
google.golang.org/genproto v0.0.0-20190911173649-1774047e7e51/go.mod h1:IbNlFCBrqXvoKpeg0TB2l7cyZUmoaFKYIwrEpbDKLA8=
google.golang.org/genproto v0.0.0-20191108220845-16a3f7862a1a/go.mod h1:n3cpQtvxv34hfy77yVDNjmbRyujviMdxYliBSkLhpCc=
google.golang.org/genproto v0.0.0-20191115194625-c23dd37a84c9/go.mod h1:n3cpQtvxv34hfy77yVDNjmbRyujviMdxYliBSkLhpCc=
google.golang.org/genproto v0.0.0-20191216164720-4f79533eabd1/go.mod h1:n3cpQtvxv34hfy77yVDNjmbRyujviMdxYliBSkLhpCc=
google.golang.org/genproto v0.0.0-20191230161307-f3c370f40bfb/go.mod h1:n3cpQtvxv34hfy77yVDNjmbRyujviMdxYliBSkLhpCc=
google.golang.org/genproto v0.0.0-20200115191322-ca5a22157cba/go.mod h1:n3cpQtvxv34hfy77yVDNjmbRyujviMdxYliBSkLhpCc=
google.golang.org/genproto v0.0.0-20200122232147-0452cf42e150/go.mod h1:n3cpQtvxv34hfy77yVDNjmbRyujviMdxYliBSkLhpCc=
google.golang.org/genproto v0.0.0-20200204135345-fa8e72b47b90/go.mod h1:GmwEX6Z4W5gMy59cAlVYjN9JhxgbQH6Gn+gFDQe2lzA=
google.golang.org/genproto v0.0.0-20200212174721-66ed5ce911ce/go.mod h1:55QSHmfGQM9UVYDPBsyGGes0y52j32PQ3BqQfXhyH3c=
google.golang.org/genproto v0.0.0-20200224152610-e50cd9704f63/go.mod h1:55QSHmfGQM9UVYDPBsyGGes0y52j32PQ3BqQfXhyH3c=
google.golang.org/genproto v0.0.0-20200228133532-8c2c7df3a383/go.mod h1:55QSHmfGQM9UVYDPBsyGGes0y52j32PQ3BqQfXhyH3c=
google.golang.org/genproto v0.0.0-20200305110556-506484158171/go.mod h1:55QSHmfGQM9UVYDPBsyGGes0y52j32PQ3BqQfXhyH3c=
google.golang.org/genproto v0.0.0-20200312145019-da6875a35672/go.mod h1:55QSHmfGQM9UVYDPBsyGGes0y52j32PQ3BqQfXhyH3c=
google.golang.org/genproto v0.0.0-20200331122359-1ee6d9798940/go.mod h1:55QSHmfGQM9UVYDPBsyGGes0y52j32PQ3BqQfXhyH3c=
google.golang.org/genproto v0.0.0-20200430143042-b979b6f78d84/go.mod h1:55QSHmfGQM9UVYDPBsyGGes0y52j32PQ3BqQfXhyH3c=
google.golang.org/genproto v0.0.0-20200511104702-f5ebc3bea380/go.mod h1:55QSHmfGQM9UVYDPBsyGGes0y52j32PQ3BqQfXhyH3c=
google.golang.org/genproto v0.0.0-20200515170657-fc4c6c6a6587/go.mod h1:YsZOwe1myG/8QRHRsmBRE1LrgQY60beZKjly0O1fX9U=
google.golang.org/genproto v0.0.0-20200526211855-cb27e3aa2013/go.mod h1:NbSheEEYHJ7i3ixzK3sjbqSGDJWnxyFXZblF3eUsNvo=
google.golang.org/genproto v0.0.0-20200618031413-b414f8b61790/go.mod h1:jDfRM7FcilCzHH/e9qn6dsT145K34l5v+OpcnNgKAAA=
google.golang.org/genproto v0.0.0-20200729003335-053ba62fc06f/go.mod h1:FWY/as6DDZQgahTzZj3fqbO1CbirC29ZNUFHwi0/+no=
google.golang.org/genproto v0.0.0-20200804131852-c06518451d9c/go.mod h1:FWY/as6DDZQgahTzZj3fqbO1CbirC29ZNUFHwi0/+no=
google.golang.org/genproto v0.0.0-20200825200019-8632dd797987/go.mod h1:FWY/as6DDZQgahTzZj3fqbO1CbirC29ZNUFHwi0/+no=
google.golang.org/grpc v1.19.0/go.mod h1:mqu4LbDTu4XGKhr4mRzUsmM4RtVoemTSY81AxZiDr8c=
google.golang.org/grpc v1.20.1/go.mod h1:10oTOabMzJvdu6/UiuZezV6QK5dSlG84ov/aaiqXj38=
google.golang.org/grpc v1.21.1/go.mod h1:oYelfM1adQP15Ek0mdvEgi9Df8B9CZIaU1084ijfRaM=
google.golang.org/grpc v1.23.0/go.mod h1:Y5yQAOtifL1yxbo5wqy6BxZv8vAUGQwXBOALyacEbxg=
google.golang.org/grpc v1.25.1/go.mod h1:c3i+UQWmh7LiEpx4sFZnkU36qjEYZ0imhYfXVyQciAY=
google.golang.org/grpc v1.26.0/go.mod h1:qbnxyOmOxrQa7FizSgH+ReBfzJrCY1pSN7KXBS8abTk=
google.golang.org/grpc v1.27.0/go.mod h1:qbnxyOmOxrQa7FizSgH+ReBfzJrCY1pSN7KXBS8abTk=
google.golang.org/grpc v1.27.1/go.mod h1:qbnxyOmOxrQa7FizSgH+ReBfzJrCY1pSN7KXBS8abTk=
google.golang.org/grpc v1.28.0/go.mod h1:rpkK4SK4GF4Ach/+MFLZUBavHOvF2JJB5uozKKal+60=
google.golang.org/grpc v1.29.1/go.mod h1:itym6AZVZYACWQqET3MqgPpjcuV5QH3BxFS3IjizoKk=
google.golang.org/grpc v1.30.0/go.mod h1:N36X2cJ7JwdamYAgDz+s+rVMFjt3numwzf/HckM8pak=
google.golang.org/grpc v1.31.0/go.mod h1:N36X2cJ7JwdamYAgDz+s+rVMFjt3numwzf/HckM8pak=
google.golang.org/protobuf v0.0.0-20200109180630-ec00e32a8dfd/go.mod h1:DFci5gLYBciE7Vtevhsrf46CRTquxDuWsQurQQe4oz8=
google.golang.org/protobuf v0.0.0-20200221191635-4d8936d0db64/go.mod h1:kwYJMbMJ01Woi6D6+Kah6886xMZcty6N08ah7+eCXa0=
google.golang.org/protobuf v0.0.0-20200228230310-ab0ca4ff8a60/go.mod h1:cfTl7dwQJ+fmap5saPgwCLgHXTUD7jkjRqWcaiX5VyM=
google.golang.org/protobuf v1.20.1-0.20200309200217-e05f789c0967/go.mod h1:A+miEFZTKqfCUM6K7xSMQL9OKL/b6hQv+e19PK+JZNE=
google.golang.org/protobuf v1.21.0/go.mod h1:47Nbq4nVaFHyn7ilMalzfO3qCViNmqZ2kzikPIcrTAo=
google.golang.org/protobuf v1.22.0/go.mod h1:EGpADcykh3NcUnDUJcl1+ZksZNG86OlYog2l/sGQquU=
google.golang.org/protobuf v1.23.0/go.mod h1:EGpADcykh3NcUnDUJcl1+ZksZNG86OlYog2l/sGQquU=
google.golang.org/protobuf v1.23.1-0.20200526195155-81db48ad09cc/go.mod h1:EGpADcykh3NcUnDUJcl1+ZksZNG86OlYog2l/sGQquU=
google.golang.org/protobuf v1.24.0/go.mod h1:r/3tXBNzIEhYS9I1OUVjXDlt8tc493IdKGjtUeSXeh4=
google.golang.org/protobuf v1.25.0/go.mod h1:9JNX74DMeImyA3h4bdi1ymwjUzf21/xIlbajtzgsN7c=
google.golang.org/protobuf v1.26.0-rc.1/go.mod h1:jlhhOSvTdKEhbULTjvd4ARK9grFBp09yW+WbY/TyQbw=
google.golang.org/protobuf v1.26.0 h1:bxAC2xTBsZGibn2RTntX0oH50xLsqy1OxA9tTL3p/lk=
google.golang.org/protobuf v1.26.0/go.mod h1:9q0QmTI4eRPtz6boOQmLYwt+qCgq0jsYwAQnmE0givc=
gopkg.in/alecthomas/kingpin.v2 v2.2.6/go.mod h1:FMv+mEhP44yOT+4EoQTLFTRgOQ1FBLkstjWtayDeSgw=
gopkg.in/check.v1 v0.0.0-20161208181325-20d25e280405/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/check.v1 v1.0.0-20180628173108-788fd7840127/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/check.v1 v1.0.0-20190902080502-41f04d3bba15/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/errgo.v2 v2.1.0/go.mod h1:hNsd1EY+bozCKY1Ytp96fpM3vjJbqLJn88ws8XvfDNI=
gopkg.in/yaml.v2 v2.2.1/go.mod h1:hI93XBmqTisBFMUTm0b8Fm+jr3Dg1NNxqwp+5A1VGuI=
gopkg.in/yaml.v2 v2.2.2/go.mod h1:hI93XBmqTisBFMUTm0b8Fm+jr3Dg1NNxqwp+5A1VGuI=
gopkg.in/yaml.v2 v2.2.4/go.mod h1:hI93XBmqTisBFMUTm0b8Fm+jr3Dg1NNxqwp+5A1VGuI=
gopkg.in/yaml.v2 v2.2.5/go.mod h1:hI93XBmqTisBFMUTm0b8Fm+jr3Dg1NNxqwp+5A1VGuI=
gopkg.in/yaml.v2 v2.3.0/go.mod h1:hI93XBmqTisBFMUTm0b8Fm+jr3Dg1NNxqwp+5A1VGuI=
gopkg.in/yaml.v2 v2.4.0/go.mod h1:RDklbk79AGWmwhnvt/jBztapEOGDOx6ZbXqjP6csGnQ=
gopkg.in/yaml.v3 v3.0.0-20200313102051-9f266ea9e77c h1:dUUwHk2QECo/6vqA44rthZ8ie2QXMNeKRTHCNY2nXvo=
gopkg.in/yaml.v3 v3.0.0-20200313102051-9f266ea9e77c/go.mod h1:K4uyk7z7BCEPqu6E+C64Yfv1cQ7kz7rIZviUmN+EgEM=
honnef.co/go/tools v0.0.0-20190102054323-c2f93a96b099/go.mod h1:rf3lG4BRIbNafJWhAfAdb/ePZxsR/4RtNHQocxwk9r4=
honnef.co/go/tools v0.0.0-20190106161140-3f1c8253044a/go.mod h1:rf3lG4BRIbNafJWhAfAdb/ePZxsR/4RtNHQocxwk9r4=
honnef.co/go/tools v0.0.0-20190418001031-e561f6794a2a/go.mod h1:rf3lG4BRIbNafJWhAfAdb/ePZxsR/4RtNHQocxwk9r4=
honnef.co/go/tools v0.0.0-20190523083050-ea95bdfd59fc/go.mod h1:rf3lG4BRIbNafJWhAfAdb/ePZxsR/4RtNHQocxwk9r4=
honnef.co/go/tools v0.0.1-2019.2.3/go.mod h1:a3bituU0lyd329TUQxRnasdCoJDkEUEAqEt0JzvZhAg=
honnef.co/go/tools v0.0.1-2020.1.3/go.mod h1:X/FiERA/W4tHapMX5mGpAtMSVEeEUOyHaw9vFzvIQ3k=
honnef.co/go/tools v0.0.1-2020.1.4/go.mod h1:X/FiERA/W4tHapMX5mGpAtMSVEeEUOyHaw9vFzvIQ3k=
rsc.io/binaryregexp v0.2.0/go.mod h1:qTv7/COck+e2FymRvadv62gMdZztPaShugOCi3I+8D8=
rsc.io/quote/v3 v3.1.0/go.mod h1:yEA65RcK8LyAZtP9Kv3t0HmxON59tX3rD+tICJqUlj0=
rsc.io/sampler v1.3.0/go.mod h1:T1hPZKmBbMNahiBKFy5HrXp6adAjACjK9JXDnKaTXpA=



================================================
FILE: src/backend/merger/main.go
================================================
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.10.0"
)

const (
	service     = "PDF Editor backend-merger tracing"
	environment = "production"
	id          = 1
)

var (
	tp *tracesdk.TracerProvider
)

func tracerProvider(url string) (*tracesdk.TracerProvider, error) {
	// Create the Jaeger exporter
	exp, err := jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(url)))
	if err != nil {
		return nil, err
	}
	tp := tracesdk.NewTracerProvider(
		// Always be sure to batch in production.
		tracesdk.WithBatcher(exp),
		// Record information about this application in a Resource.
		tracesdk.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String(service),
			attribute.String("environment", environment),
			attribute.Int64("ID", id),
		)),
	)
	return tp, nil
}

func loadConfigsTracing() {
	var err error
	tp, err = tracerProvider("http://trace:14268/api/traces")
	if err != nil {
		log.Fatal(err)
	}
	otel.SetTracerProvider(tp)
}

var requestsProcessed = promauto.NewCounter(prometheus.CounterOpts{
	Name: "go_request_operations_merger_total",
	Help: "The total number of processed requests",
})

var requestsProcessedError = promauto.NewCounter(prometheus.CounterOpts{
	Name: "go_request_operations_merger_error_total",
	Help: "The total number of HTTP requests Errors",
})

var requestsProcessedSuccess = promauto.NewCounter(prometheus.CounterOpts{
	Name: "go_request_operations_merger_success_total",
	Help: "The total number of HTTP 200 requests",
})

func greet(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	tr := tp.Tracer("/greet")
	_, span := tr.Start(ctx, "have a nice day!")
	defer span.End()

	requestsProcessed.Inc()
	fmt.Fprintf(w, "[ %s ] Hello from PDF-Merger", time.Now())
	requestsProcessedSuccess.Inc()
}

func MergePdf(ctx context.Context) error {
	tr := otel.Tracer("Merge")
	_, span := tr.Start(ctx, "merging")
	defer span.End()

	cmd := exec.Command("qpdf", "--empty", "--pages", "./uploads/00.pdf", "./uploads/01.pdf", "--", "./uploads/resrelt.pdf")
	err := cmd.Run()
	if err != nil {
		fmt.Println(">>> Error in MergePDF", err)
		fmt.Println("{\"Source\": \"pdf-merger\", \"FileNo\": [\"1\", \"2\"], \"operation\": \"Merge\", \"Status\": \"Merge ERROR\"}")
		requestsProcessedError.Inc()
	} else {
		fmt.Println("{\"Source\": \"pdf-merger\", \"FileNo\": [\"1\", \"2\"], \"operation\": \"Merge\", \"Status\": \"Merged\"}")
		requestsProcessedSuccess.Inc()
	}
	return err
}

// getPort returns port number for backend merger http server to listen default is 8080
func getPort() string {
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}
	fmt.Printf("{\"Source\": \"pdf-merger\", \"operation\": \"Merge\", \"Status\": {\"Port\": \"%v\"}}\n", port)
	return ":" + port
}

func main() {
	loadConfigsTracing()
	uploadedStat = false
	err := os.MkdirAll("./uploads", os.ModePerm)
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/greet", greet)
	http.HandleFunc("/upload", uploadHandler)
	http.HandleFunc("/downloads", DownloadFile)

	// prometheus metrics
	http.Handle("/metrics", promhttp.Handler())

	http.ListenAndServe(getPort(), nil)
}

func DownloadFile(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	tr := tp.Tracer("PDF download time")
	_, span := tr.Start(ctx, "Download")
	defer span.End()

	requestsProcessed.Inc()
	if r.Method == "GET" {
		fmt.Println("{\"Source\": \"pdf-merger\", \"operation\": \"Merge\", \"Status\": \"Sending MergedPDF\"}")
		http.ServeFile(w, r, "uploads/resrelt.pdf")
		requestsProcessedSuccess.Inc()
	} else {
		requestsProcessedError.Inc()
	}
}



================================================
FILE: src/backend/merger/main_test.go
================================================
// UNIT Testing
package main

import (
	"os"
	"testing"
)

func TestPortNumber(t *testing.T) {
	os.Setenv("PORT", "10000")
	w := getPort()
	if w != ":"+os.Getenv("PORT") {
		t.Fatalf("Port number assigned was `incorrect`\n")
	}
	os.Unsetenv("PORT")
	w = getPort()
	if w != ":8080" {
		t.Fatalf("Port number assigned was `incorrect`\n")
	}
}

func TestNoOfFiles(t *testing.T) {
	no := NUMBEROFDOCS
	if no != 2 {
		t.Fatalf("Number of Docs to be uploaded must be `2`\n")
	}
}

// func TestCleaner(t *testing.T) {
// 	_, err := os.Stat("uploads")
// 	if os.IsNotExist(err) {
// 		// log.Fatal("upload/ does not exist")
// 		err = os.MkdirAll("./uploads", os.ModePerm)
// 		if err != nil {
// 			log.Fatal("Couldn't create a folder")
// 		}
// 	}
// 	ctx := context.Background()
// 	_ = helperCleaner(ctx)
// 	_, err = os.Stat("uploads")
// 	if os.IsNotExist(err) == false {
// 		log.Fatal("CRITICAL ❌ uploads/ exist")
// 	}
// }



================================================
FILE: src/backend/merger/.dockerignore
================================================
backend
uploads


================================================
FILE: src/backend/merger/templates/upload.html
================================================
<html>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"
  integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

<body class="container">
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
      <path
        d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
    </symbol>
    <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
      <path
        d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
    </symbol>
    <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
      <path
        d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
    </symbol>
  </svg>
  </svg>
  <br>
  <h3>
    <div class={{.Header}} role="alert">{{.Status}}</div>
  </h3>
  <br>
  <div class="alert alert-primary d-flex align-items-center" role="alert">
    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:">
      <use xlink:href="#info-fill" />
    </svg>
    <div>Please Go back to the previous page</div>
  </div>
</body>

</html>


================================================
FILE: src/backend/rotator/Dockerfile
================================================
FROM golang:1.18-alpine as prod-stage1
LABEL MAINTAINER="Dipankar Das <dipankardas0115@gmail.com>"
WORKDIR /go/src
COPY . .
RUN rm -rf uploads/
RUN go get -d
RUN go build -o rotator-executable

FROM alpine:3.16.1 as prod
RUN apk add qpdf
LABEL MAINTAINER="Dipankar Das <dipankardas0115@gmail.com>"
WORKDIR /go/src
COPY --from=prod-stage1 /go/src .
RUN rm -f go.mod main.go Dockerfile .dockerignore
CMD ["./rotator-executable"]
EXPOSE 8081

FROM golang:1.17-alpine as dev
RUN apk update
RUN apk add qpdf
WORKDIR /go/src


FROM golang:1.18 as test
RUN apt -y update
RUN apt install -y qpdf
WORKDIR /go/src
COPY . .
RUN go get -d
ENTRYPOINT ["go", "test", "-v", "."]



================================================
FILE: src/backend/rotator/file.go
================================================
package main

import (
	"fmt"
	"html/template"
	"io"
	"net/http"
	"os"
	"os/exec"
)

type templateStat struct {
	Header string `json:"Header"`
	Status string `json:"Status"`
}

const NUMBEROFDOCS int = 1

func RotatePdf(pages string) error {
	// specify the clockwise or anti-clockwise direction
	// Rotate the all the pages
	rotateOptions := "--rotate=+90:" + pages[:(len(pages)-1)]

	cmd := exec.Command("qpdf", rotateOptions, "./uploads/00.pdf", "./uploads/resrelt.pdf")
	err := cmd.Run()
	if err != nil {
		fmt.Println(">>> Error in RotatePDF", err)
		requestsProcessedError.Inc()
		fmt.Println("{\"Source\": \"pdf-rotator\", \"FileNo\": \"1\", \"operation\": \"Rotate\", \"Status\": \"Rotate ERROR\"}")
	} else {
		requestsProcessedSuccess.Inc()
		fmt.Println("{\"Source\": \"pdf-rotator\", \"FileNo\": \"1\", \"operation\": \"Rotate\", \"Status\": \"Rotated\"}")
	}
	return err
}

func uploadFile(w http.ResponseWriter, r *http.Request) {
	// Maximum upload of 10 MB files
	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("File")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		requestsProcessedError.Inc()
		return
	}

	pages := r.FormValue("Pages")

	defer file.Close()

	if handler.Header["Content-Type"][0] != "application/pdf" {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		t, err := template.ParseFiles("./templates/upload.html")
		var x templateStat
		if err != nil {
			x = templateStat{
				Header: "alert alert-danger",
				Status: "Internal Server error 501 ⚠️",
			}
			requestsProcessedError.Inc()
		} else {
			x = templateStat{
				Header: "alert alert-danger",
				Status: "Invalid file format error 415 ⚠️",
			}
		}

		t.Execute(w, x)
		return
	}

	dst, err := os.Create("./uploads/00.pdf")
	defer dst.Close()

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		requestsProcessedError.Inc()
		return
	}

	// Copy the uploaded file to the created file on the filesystem
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		requestsProcessedError.Inc()
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	t, err := template.ParseFiles("./templates/upload.html")

	var x templateStat

	if err != nil {
		x = templateStat{
			Header: "alert alert-danger",
			Status: "Internal Server error 501 ⚠️",
		}
		requestsProcessedError.Inc()
	} else {
		x = templateStat{
			Header: "alert alert-success",
			Status: "Uploaded ✅",
		}
	}

	if RotatePdf(pages) == nil {
		fmt.Println("{\"Source\": \"Backend-Rotate\",\"Status\": \"Came back from RotatePdf\"}")
	} else {
		x = templateStat{
			Header: "alert alert-danger",
			Status: "CRITICAL ERROR 502 ❌",
		}
	}
	t.Execute(w, x)
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	requestsProcessed.Inc()

	switch r.Method {
	case "POST":
		uploadFile(w, r)
	default:
		requestsProcessedError.Inc()
		w.WriteHeader(http.StatusBadRequest)
	}
}



================================================
FILE: src/backend/rotator/go.mod
================================================
module github.com/dipankardas011/Merge-PDF/src/backend/rotator

go 1.17

require github.com/prometheus/client_golang v1.13.0

require (
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/cespare/xxhash/v2 v2.1.2 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.1 // indirect
	github.com/prometheus/client_model v0.2.0 // indirect
	github.com/prometheus/common v0.37.0 // indirect
	github.com/prometheus/procfs v0.8.0 // indirect
	golang.org/x/sys v0.0.0-20220520151302-bc2c85ada10a // indirect
	google.golang.org/protobuf v1.28.1 // indirect
)



================================================
FILE: src/backend/rotator/go.sum
================================================
cloud.google.com/go v0.26.0/go.mod h1:aQUYkXzVsufM+DwF1aE+0xfcU+56JwCaLick0ClmMTw=
cloud.google.com/go v0.34.0/go.mod h1:aQUYkXzVsufM+DwF1aE+0xfcU+56JwCaLick0ClmMTw=
cloud.google.com/go v0.38.0/go.mod h1:990N+gfupTy94rShfmMCWGDn0LpTmnzTp2qbd1dvSRU=
cloud.google.com/go v0.44.1/go.mod h1:iSa0KzasP4Uvy3f1mN/7PiObzGgflwredwwASm/v6AU=
cloud.google.com/go v0.44.2/go.mod h1:60680Gw3Yr4ikxnPRS/oxxkBccT6SA1yMk63TGekxKY=
cloud.google.com/go v0.45.1/go.mod h1:RpBamKRgapWJb87xiFSdk4g1CME7QZg3uwTez+TSTjc=
cloud.google.com/go v0.46.3/go.mod h1:a6bKKbmY7er1mI7TEI4lsAkts/mkhTSZK8w33B4RAg0=
cloud.google.com/go v0.50.0/go.mod h1:r9sluTvynVuxRIOHXQEHMFffphuXHOMZMycpNR5e6To=
cloud.google.com/go v0.52.0/go.mod h1:pXajvRH/6o3+F9jDHZWQ5PbGhn+o8w9qiu/CffaVdO4=
cloud.google.com/go v0.53.0/go.mod h1:fp/UouUEsRkN6ryDKNW/Upv/JBKnv6WDthjR6+vze6M=
cloud.google.com/go v0.54.0/go.mod h1:1rq2OEkV3YMf6n/9ZvGWI3GWw0VoqH/1x2nd8Is/bPc=
cloud.google.com/go v0.56.0/go.mod h1:jr7tqZxxKOVYizybht9+26Z/gUq7tiRzu+ACVAMbKVk=
cloud.google.com/go v0.57.0/go.mod h1:oXiQ6Rzq3RAkkY7N6t3TcE6jE+CIBBbA36lwQ1JyzZs=
cloud.google.com/go v0.62.0/go.mod h1:jmCYTdRCQuc1PHIIJ/maLInMho30T/Y0M4hTdTShOYc=
cloud.google.com/go v0.65.0/go.mod h1:O5N8zS7uWy9vkA9vayVHs65eM1ubvY4h553ofrNHObY=
cloud.google.com/go/bigquery v1.0.1/go.mod h1:i/xbL2UlR5RvWAURpBYZTtm/cXjCha9lbfbpx4poX+o=
cloud.google.com/go/bigquery v1.3.0/go.mod h1:PjpwJnslEMmckchkHFfq+HTD2DmtT67aNFKH1/VBDHE=
cloud.google.com/go/bigquery v1.4.0/go.mod h1:S8dzgnTigyfTmLBfrtrhyYhwRxG72rYxvftPBK2Dvzc=
cloud.google.com/go/bigquery v1.5.0/go.mod h1:snEHRnqQbz117VIFhE8bmtwIDY80NLUZUMb4Nv6dBIg=
cloud.google.com/go/bigquery v1.7.0/go.mod h1://okPTzCYNXSlb24MZs83e2Do+h+VXtc4gLoIoXIAPc=
cloud.google.com/go/bigquery v1.8.0/go.mod h1:J5hqkt3O0uAFnINi6JXValWIb1v0goeZM77hZzJN/fQ=
cloud.google.com/go/datastore v1.0.0/go.mod h1:LXYbyblFSglQ5pkeyhO+Qmw7ukd3C+pD7TKLgZqpHYE=
cloud.google.com/go/datastore v1.1.0/go.mod h1:umbIZjpQpHh4hmRpGhH4tLFup+FVzqBi1b3c64qFpCk=
cloud.google.com/go/pubsub v1.0.1/go.mod h1:R0Gpsv3s54REJCy4fxDixWD93lHJMoZTyQ2kNxGRt3I=
cloud.google.com/go/pubsub v1.1.0/go.mod h1:EwwdRX2sKPjnvnqCa270oGRyludottCI76h+R3AArQw=
cloud.google.com/go/pubsub v1.2.0/go.mod h1:jhfEVHT8odbXTkndysNHCcx0awwzvfOlguIAii9o8iA=
cloud.google.com/go/pubsub v1.3.1/go.mod h1:i+ucay31+CNRpDW4Lu78I4xXG+O1r/MAHgjpRVR+TSU=
cloud.google.com/go/storage v1.0.0/go.mod h1:IhtSnM/ZTZV8YYJWCY8RULGVqBDmpoyjwiyrjsg+URw=
cloud.google.com/go/storage v1.5.0/go.mod h1:tpKbwo567HUNpVclU5sGELwQWBDZ8gh0ZeosJ0Rtdos=
cloud.google.com/go/storage v1.6.0/go.mod h1:N7U0C8pVQ/+NIKOBQyamJIeKQKkZ+mxpohlUTyfDhBk=
cloud.google.com/go/storage v1.8.0/go.mod h1:Wv1Oy7z6Yz3DshWRJFhqM/UCfaWIRTdp0RXyy7KQOVs=
cloud.google.com/go/storage v1.10.0/go.mod h1:FLPqc6j+Ki4BU591ie1oL6qBQGu2Bl/tZ9ullr3+Kg0=
dmitri.shuralyov.com/gpu/mtl v0.0.0-20190408044501-666a987793e9/go.mod h1:H6x//7gZCb22OMCxBHrMx7a5I7Hp++hsVxbQ4BYO7hU=
github.com/BurntSushi/toml v0.3.1/go.mod h1:xHWCNGjB5oqiDr8zfno3MHue2Ht5sIBksp03qcyfWMU=
github.com/BurntSushi/xgb v0.0.0-20160522181843-27f122750802/go.mod h1:IVnqGOEym/WlBOVXweHU+Q+/VP0lqqI8lqeDx9IjBqo=
github.com/alecthomas/template v0.0.0-20160405071501-a0175ee3bccc/go.mod h1:LOuyumcjzFXgccqObfd/Ljyb9UuFJ6TxHnclSeseNhc=
github.com/alecthomas/template v0.0.0-20190718012654-fb15b899a751/go.mod h1:LOuyumcjzFXgccqObfd/Ljyb9UuFJ6TxHnclSeseNhc=
github.com/alecthomas/units v0.0.0-20151022065526-2efee857e7cf/go.mod h1:ybxpYRFXyAe+OPACYpWeL0wqObRcbAqCMya13uyzqw0=
github.com/alecthomas/units v0.0.0-20190717042225-c3de453c63f4/go.mod h1:ybxpYRFXyAe+OPACYpWeL0wqObRcbAqCMya13uyzqw0=
github.com/alecthomas/units v0.0.0-20190924025748-f65c72e2690d/go.mod h1:rBZYJk541a8SKzHPHnH3zbiI+7dagKZ0cgpgrD7Fyho=
github.com/beorn7/perks v0.0.0-20180321164747-3a771d992973/go.mod h1:Dwedo/Wpr24TaqPxmxbtue+5NUziq4I4S80YR8gNf3Q=
github.com/beorn7/perks v1.0.0/go.mod h1:KWe93zE9D1o94FZ5RNwFwVgaQK1VOXiVxmqh+CedLV8=
github.com/beorn7/perks v1.0.1 h1:VlbKKnNfV8bJzeqoa4cOKqO6bYr3WgKZxO8Z16+hsOM=
github.com/beorn7/perks v1.0.1/go.mod h1:G2ZrVWU2WbWT9wwq4/hrbKbnv/1ERSJQ0ibhJ6rlkpw=
github.com/census-instrumentation/opencensus-proto v0.2.1/go.mod h1:f6KPmirojxKA12rnyqOA5BBL4O983OfeGPqjHWSTneU=
github.com/cespare/xxhash/v2 v2.1.1/go.mod h1:VGX0DQ3Q6kWi7AoAeZDth3/j3BFtOZR5XLFGgcrjCOs=
github.com/cespare/xxhash/v2 v2.1.2 h1:YRXhKfTDauu4ajMg1TPgFO5jnlC2HCbmLXMcTG5cbYE=
github.com/cespare/xxhash/v2 v2.1.2/go.mod h1:VGX0DQ3Q6kWi7AoAeZDth3/j3BFtOZR5XLFGgcrjCOs=
github.com/chzyer/logex v1.1.10/go.mod h1:+Ywpsq7O8HXn0nuIou7OrIPyXbp3wmkHB+jjWRnGsAI=
github.com/chzyer/readline v0.0.0-20180603132655-2972be24d48e/go.mod h1:nSuG5e5PlCu98SY8svDHJxuZscDgtXS6KTTbou5AhLI=
github.com/chzyer/test v0.0.0-20180213035817-a1ea475d72b1/go.mod h1:Q3SI9o4m/ZMnBNeIyt5eFwwo7qiLfzFZmjNmxjkiQlU=
github.com/client9/misspell v0.3.4/go.mod h1:qj6jICC3Q7zFZvVWo7KLAzC3yx5G7kyvSDkc90ppPyw=
github.com/cncf/udpa/go v0.0.0-20191209042840-269d4d468f6f/go.mod h1:M8M6+tZqaGXZJjfX53e64911xZQV5JYwmTeXPW+k8Sc=
github.com/davecgh/go-spew v1.1.0/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
github.com/davecgh/go-spew v1.1.1/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
github.com/envoyproxy/go-control-plane v0.9.0/go.mod h1:YTl/9mNaCwkRvm6d1a2C3ymFceY/DCBVvsKhRF0iEA4=
github.com/envoyproxy/go-control-plane v0.9.1-0.20191026205805-5f8ba28d4473/go.mod h1:YTl/9mNaCwkRvm6d1a2C3ymFceY/DCBVvsKhRF0iEA4=
github.com/envoyproxy/go-control-plane v0.9.4/go.mod h1:6rpuAdCZL397s3pYoYcLgu1mIlRU8Am5FuJP05cCM98=
github.com/envoyproxy/protoc-gen-validate v0.1.0/go.mod h1:iSmxcyjqTsJpI2R4NaDN7+kN2VEUnK/pcBlmesArF7c=
github.com/go-gl/glfw v0.0.0-20190409004039-e6da0acd62b1/go.mod h1:vR7hzQXu2zJy9AVAgeJqvqgH9Q5CA+iKCZ2gyEVpxRU=
github.com/go-gl/glfw/v3.3/glfw v0.0.0-20191125211704-12ad95a8df72/go.mod h1:tQ2UAYgL5IevRw8kRxooKSPJfGvJ9fJQFa0TUsXzTg8=
github.com/go-gl/glfw/v3.3/glfw v0.0.0-20200222043503-6f7a984d4dc4/go.mod h1:tQ2UAYgL5IevRw8kRxooKSPJfGvJ9fJQFa0TUsXzTg8=
github.com/go-kit/kit v0.8.0/go.mod h1:xBxKIO96dXMWWy0MnWVtmwkA9/13aqxPnvrjFYMA2as=
github.com/go-kit/kit v0.9.0/go.mod h1:xBxKIO96dXMWWy0MnWVtmwkA9/13aqxPnvrjFYMA2as=
github.com/go-kit/log v0.1.0/go.mod h1:zbhenjAZHb184qTLMA9ZjW7ThYL0H2mk7Q6pNt4vbaY=
github.com/go-kit/log v0.2.0/go.mod h1:NwTd00d/i8cPZ3xOwwiv2PO5MOcx78fFErGNcVmBjv0=
github.com/go-logfmt/logfmt v0.3.0/go.mod h1:Qt1PoO58o5twSAckw1HlFXLmHsOX5/0LbT9GBnD5lWE=
github.com/go-logfmt/logfmt v0.4.0/go.mod h1:3RMwSq7FuexP4Kalkev3ejPJsZTpXXBr9+V4qmtdjCk=
github.com/go-logfmt/logfmt v0.5.0/go.mod h1:wCYkCAKZfumFQihp8CzCvQ3paCTfi41vtzG1KdI/P7A=
github.com/go-logfmt/logfmt v0.5.1/go.mod h1:WYhtIu8zTZfxdn5+rREduYbwxfcBr/Vr6KEVveWlfTs=
github.com/go-stack/stack v1.8.0/go.mod h1:v0f6uXyyMGvRgIKkXu+yp6POWl0qKG85gN/melR3HDY=
github.com/gogo/protobuf v1.1.1/go.mod h1:r8qH/GZQm5c6nD/R0oafs1akxWv10x8SbQlK7atdtwQ=
github.com/golang/glog v0.0.0-20160126235308-23def4e6c14b/go.mod h1:SBH7ygxi8pfUlaOkMMuAQtPIUF8ecWP5IEl/CR7VP2Q=
github.com/golang/groupcache v0.0.0-20190702054246-869f871628b6/go.mod h1:cIg4eruTrX1D+g88fzRXU5OdNfaM+9IcxsU14FzY7Hc=
github.com/golang/groupcache v0.0.0-20191227052852-215e87163ea7/go.mod h1:cIg4eruTrX1D+g88fzRXU5OdNfaM+9IcxsU14FzY7Hc=
github.com/golang/groupcache v0.0.0-20200121045136-8c9f03a8e57e/go.mod h1:cIg4eruTrX1D+g88fzRXU5OdNfaM+9IcxsU14FzY7Hc=
github.com/golang/mock v1.1.1/go.mod h1:oTYuIxOrZwtPieC+H1uAHpcLFnEyAGVDL/k47Jfbm0A=
github.com/golang/mock v1.2.0/go.mod h1:oTYuIxOrZwtPieC+H1uAHpcLFnEyAGVDL/k47Jfbm0A=
github.com/golang/mock v1.3.1/go.mod h1:sBzyDLLjw3U8JLTeZvSv8jJB+tU5PVekmnlKIyFUx0Y=
github.com/golang/mock v1.4.0/go.mod h1:UOMv5ysSaYNkG+OFQykRIcU/QvvxJf3p21QfJ2Bt3cw=
github.com/golang/mock v1.4.1/go.mod h1:UOMv5ysSaYNkG+OFQykRIcU/QvvxJf3p21QfJ2Bt3cw=
github.com/golang/mock v1.4.3/go.mod h1:UOMv5ysSaYNkG+OFQykRIcU/QvvxJf3p21QfJ2Bt3cw=
github.com/golang/mock v1.4.4/go.mod h1:l3mdAwkq5BuhzHwde/uurv3sEJeZMXNpwsxVWU71h+4=
github.com/golang/protobuf v1.2.0/go.mod h1:6lQm79b+lXiMfvg/cZm0SGofjICqVBUtrP5yJMmIC1U=
github.com/golang/protobuf v1.3.1/go.mod h1:6lQm79b+lXiMfvg/cZm0SGofjICqVBUtrP5yJMmIC1U=
github.com/golang/protobuf v1.3.2/go.mod h1:6lQm79b+lXiMfvg/cZm0SGofjICqVBUtrP5yJMmIC1U=
github.com/golang/protobuf v1.3.3/go.mod h1:vzj43D7+SQXF/4pzW/hwtAqwc6iTitCiVSaWz5lYuqw=
github.com/golang/protobuf v1.3.4/go.mod h1:vzj43D7+SQXF/4pzW/hwtAqwc6iTitCiVSaWz5lYuqw=
github.com/golang/protobuf v1.3.5/go.mod h1:6O5/vntMXwX2lRkT1hjjk0nAC1IDOTvTlVgjlRvqsdk=
github.com/golang/protobuf v1.4.0-rc.1/go.mod h1:ceaxUfeHdC40wWswd/P6IGgMaK3YpKi5j83Wpe3EHw8=
github.com/golang/protobuf v1.4.0-rc.1.0.20200221234624-67d41d38c208/go.mod h1:xKAWHe0F5eneWXFV3EuXVDTCmh+JuBKY0li0aMyXATA=
github.com/golang/protobuf v1.4.0-rc.2/go.mod h1:LlEzMj4AhA7rCAGe4KMBDvJI+AwstrUpVNzEA03Pprs=
github.com/golang/protobuf v1.4.0-rc.4.0.20200313231945-b860323f09d0/go.mod h1:WU3c8KckQ9AFe+yFwt9sWVRKCVIyN9cPHBJSNnbL67w=
github.com/golang/protobuf v1.4.0/go.mod h1:jodUvKwWbYaEsadDk5Fwe5c77LiNKVO9IDvqG2KuDX0=
github.com/golang/protobuf v1.4.1/go.mod h1:U8fpvMrcmy5pZrNK1lt4xCsGvpyWQ/VVv6QDs8UjoX8=
github.com/golang/protobuf v1.4.2/go.mod h1:oDoupMAO8OvCJWAcko0GGGIgR6R6ocIYbsSw735rRwI=
github.com/golang/protobuf v1.4.3/go.mod h1:oDoupMAO8OvCJWAcko0GGGIgR6R6ocIYbsSw735rRwI=
github.com/golang/protobuf v1.5.0/go.mod h1:FsONVRAS9T7sI+LIUmWTfcYkHO4aIWwzhcaSAoJOfIk=
github.com/golang/protobuf v1.5.2 h1:ROPKBNFfQgOUMifHyP+KYbvpjbdoFNs+aK7DXlji0Tw=
github.com/golang/protobuf v1.5.2/go.mod h1:XVQd3VNwM+JqD3oG2Ue2ip4fOMUkwXdXDdiuN0vRsmY=
github.com/google/btree v0.0.0-20180813153112-4030bb1f1f0c/go.mod h1:lNA+9X1NB3Zf8V7Ke586lFgjr2dZNuvo3lPJSGZ5JPQ=
github.com/google/btree v1.0.0/go.mod h1:lNA+9X1NB3Zf8V7Ke586lFgjr2dZNuvo3lPJSGZ5JPQ=
github.com/google/go-cmp v0.2.0/go.mod h1:oXzfMopK8JAjlY9xF4vHSVASa0yLyX7SntLO5aqRK0M=
github.com/google/go-cmp v0.3.0/go.mod h1:8QqcDgzrUqlUb/G2PQTWiueGozuR1884gddMywk6iLU=
github.com/google/go-cmp v0.3.1/go.mod h1:8QqcDgzrUqlUb/G2PQTWiueGozuR1884gddMywk6iLU=
github.com/google/go-cmp v0.4.0/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.4.1/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.5.0/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.5.1/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.5.4/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.5.5/go.mod h1:v8dTdLbMG2kIc/vJvl+f65V22dbkXbowE6jgT/gNBxE=
github.com/google/go-cmp v0.5.8 h1:e6P7q2lk1O+qJJb4BtCQXlK8vWEO8V1ZeuEdJNOqZyg=
github.com/google/go-cmp v0.5.8/go.mod h1:17dUlkBOakJ0+DkrSSNjCkIjxS6bF9zb3elmeNGIjoY=
github.com/google/gofuzz v1.0.0/go.mod h1:dBl0BpW6vV/+mYPU4Po3pmUjxk6FQPldtuIdl/M65Eg=
github.com/google/martian v2.1.0+incompatible/go.mod h1:9I4somxYTbIHy5NJKHRl3wXiIaQGbYVAs8BPL6v8lEs=
github.com/google/martian/v3 v3.0.0/go.mod h1:y5Zk1BBys9G+gd6Jrk0W3cC1+ELVxBWuIGO+w/tUAp0=
github.com/google/pprof v0.0.0-20181206194817-3ea8567a2e57/go.mod h1:zfwlbNMJ+OItoe0UupaVj+oy1omPYYDuagoSzA8v9mc=
github.com/google/pprof v0.0.0-20190515194954-54271f7e092f/go.mod h1:zfwlbNMJ+OItoe0UupaVj+oy1omPYYDuagoSzA8v9mc=
github.com/google/pprof v0.0.0-20191218002539-d4f498aebedc/go.mod h1:ZgVRPoUq/hfqzAqh7sHMqb3I9Rq5C59dIz2SbBwJ4eM=
github.com/google/pprof v0.0.0-20200212024743-f11f1df84d12/go.mod h1:ZgVRPoUq/hfqzAqh7sHMqb3I9Rq5C59dIz2SbBwJ4eM=
github.com/google/pprof v0.0.0-20200229191704-1ebb73c60ed3/go.mod h1:ZgVRPoUq/hfqzAqh7sHMqb3I9Rq5C59dIz2SbBwJ4eM=
github.com/google/pprof v0.0.0-20200430221834-fc25d7d30c6d/go.mod h1:ZgVRPoUq/hfqzAqh7sHMqb3I9Rq5C59dIz2SbBwJ4eM=
github.com/google/pprof v0.0.0-20200708004538-1a94d8640e99/go.mod h1:ZgVRPoUq/hfqzAqh7sHMqb3I9Rq5C59dIz2SbBwJ4eM=
github.com/google/renameio v0.1.0/go.mod h1:KWCgfxg9yswjAJkECMjeO8J8rahYeXnNhOm40UhjYkI=
github.com/googleapis/gax-go/v2 v2.0.4/go.mod h1:0Wqv26UfaUD9n4G6kQubkQ+KchISgw+vpHVxEJEs9eg=
github.com/googleapis/gax-go/v2 v2.0.5/go.mod h1:DWXyrwAJ9X0FpwwEdw+IPEYBICEFu5mhpdKc/us6bOk=
github.com/hashicorp/golang-lru v0.5.0/go.mod h1:/m3WP610KZHVQ1SGc6re/UDhFvYD7pJ4Ao+sR/qLZy8=
github.com/hashicorp/golang-lru v0.5.1/go.mod h1:/m3WP610KZHVQ1SGc6re/UDhFvYD7pJ4Ao+sR/qLZy8=
github.com/ianlancetaylor/demangle v0.0.0-20181102032728-5e5cf60278f6/go.mod h1:aSSvb/t6k1mPoxDqO4vJh6VOCGPwU4O0C2/Eqndh1Sc=
github.com/jpillora/backoff v1.0.0/go.mod h1:J/6gKK9jxlEcS3zixgDgUAsiuZ7yrSoa/FX5e0EB2j4=
github.com/json-iterator/go v1.1.6/go.mod h1:+SdeFBvtyEkXs7REEP0seUULqWtbJapLOCVDaaPEHmU=
github.com/json-iterator/go v1.1.10/go.mod h1:KdQUCv79m/52Kvf8AW2vK1V8akMuk1QjK/uOdHXbAo4=
github.com/json-iterator/go v1.1.11/go.mod h1:KdQUCv79m/52Kvf8AW2vK1V8akMuk1QjK/uOdHXbAo4=
github.com/json-iterator/go v1.1.12/go.mod h1:e30LSqwooZae/UwlEbR2852Gd8hjQvJoHmT4TnhNGBo=
github.com/jstemmer/go-junit-report v0.0.0-20190106144839-af01ea7f8024/go.mod h1:6v2b51hI/fHJwM22ozAgKL4VKDeJcHhJFhtBdhmNjmU=
github.com/jstemmer/go-junit-report v0.9.1/go.mod h1:Brl9GWCQeLvo8nXZwPNNblvFj/XSXhF0NWZEnDohbsk=
github.com/julienschmidt/httprouter v1.2.0/go.mod h1:SYymIcj16QtmaHHD7aYtjjsJG7VTCxuUUipMqKk8s4w=
github.com/julienschmidt/httprouter v1.3.0/go.mod h1:JR6WtHb+2LUe8TCKY3cZOxFyyO8IZAc4RVcycCCAKdM=
github.com/kisielk/gotool v1.0.0/go.mod h1:XhKaO+MFFWcvkIS/tQcRk01m1F5IRFswLeQ+oQHNcck=
github.com/konsorten/go-windows-terminal-sequences v1.0.1/go.mod h1:T0+1ngSBFLxvqU3pZ+m/2kptfBszLMUkC4ZK/EgS/cQ=
github.com/konsorten/go-windows-terminal-sequences v1.0.3/go.mod h1:T0+1ngSBFLxvqU3pZ+m/2kptfBszLMUkC4ZK/EgS/cQ=
github.com/kr/logfmt v0.0.0-20140226030751-b84e30acd515/go.mod h1:+0opPa2QZZtGFBFZlji/RkVcI2GknAs/DXo4wKdlNEc=
github.com/kr/pretty v0.1.0/go.mod h1:dAy3ld7l9f0ibDNOQOHHMYYIIbhfbHSm3C4ZsoJORNo=
github.com/kr/pty v1.1.1/go.mod h1:pFQYn66WHrOpPYNljwOMqo10TkYh1fy3cYio2l3bCsQ=
github.com/kr/text v0.1.0/go.mod h1:4Jbv+DJW3UT/LiOwJeYQe1efqtUx/iVham/4vfdArNI=
github.com/matttproud/golang_protobuf_extensions v1.0.1 h1:4hp9jkHxhMHkqkrB3Ix0jegS5sx/RkqARlsWZ6pIwiU=
github.com/matttproud/golang_protobuf_extensions v1.0.1/go.mod h1:D8He9yQNgCq6Z5Ld7szi9bcBfOoFv/3dc6xSMkL2PC0=
github.com/modern-go/concurrent v0.0.0-20180228061459-e0a39a4cb421/go.mod h1:6dJC0mAP4ikYIbvyc7fijjWJddQyLn8Ig3JB5CqoB9Q=
github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd/go.mod h1:6dJC0mAP4ikYIbvyc7fijjWJddQyLn8Ig3JB5CqoB9Q=
github.com/modern-go/reflect2 v0.0.0-20180701023420-4b7aa43c6742/go.mod h1:bx2lNnkwVCuqBIxFjflWJWanXIb3RllmbCylyMrvgv0=
github.com/modern-go/reflect2 v1.0.1/go.mod h1:bx2lNnkwVCuqBIxFjflWJWanXIb3RllmbCylyMrvgv0=
github.com/modern-go/reflect2 v1.0.2/go.mod h1:yWuevngMOJpCy52FWWMvUC8ws7m/LJsjYzDa0/r8luk=
github.com/mwitkow/go-conntrack v0.0.0-20161129095857-cc309e4a2223/go.mod h1:qRWi+5nqEBWmkhHvq77mSJWrCKwh8bxhgT7d/eI7P4U=
github.com/mwitkow/go-conntrack v0.0.0-20190716064945-2f068394615f/go.mod h1:qRWi+5nqEBWmkhHvq77mSJWrCKwh8bxhgT7d/eI7P4U=
github.com/pkg/errors v0.8.0/go.mod h1:bwawxfHBFNV+L2hUp1rHADufV3IMtnDRdf1r5NINEl0=
github.com/pkg/errors v0.8.1/go.mod h1:bwawxfHBFNV+L2hUp1rHADufV3IMtnDRdf1r5NINEl0=
github.com/pkg/errors v0.9.1/go.mod h1:bwawxfHBFNV+L2hUp1rHADufV3IMtnDRdf1r5NINEl0=
github.com/pmezard/go-difflib v1.0.0/go.mod h1:iKH77koFhYxTK1pcRnkKkqfTogsbg7gZNVY4sRDYZ/4=
github.com/prometheus/client_golang v0.9.1/go.mod h1:7SWBe2y4D6OKWSNQJUaRYU/AaXPKyh/dDVn+NZz0KFw=
github.com/prometheus/client_golang v1.0.0/go.mod h1:db9x61etRT2tGnBNRi70OPL5FsnadC4Ky3P0J6CfImo=
github.com/prometheus/client_golang v1.7.1/go.mod h1:PY5Wy2awLA44sXw4AOSfFBetzPP4j5+D6mVACh+pe2M=
github.com/prometheus/client_golang v1.11.0/go.mod h1:Z6t4BnS23TR94PD6BsDNk8yVqroYurpAkEiz0P2BEV0=
github.com/prometheus/client_golang v1.12.1/go.mod h1:3Z9XVyYiZYEO+YQWt3RD2R3jrbd179Rt297l4aS6nDY=
github.com/prometheus/client_golang v1.13.0 h1:b71QUfeo5M8gq2+evJdTPfZhYMAU0uKPkyPJ7TPsloU=
github.com/prometheus/client_golang v1.13.0/go.mod h1:vTeo+zgvILHsnnj/39Ou/1fPN5nJFOEMgftOUOmlvYQ=
github.com/prometheus/client_model v0.0.0-20180712105110-5c3871d89910/go.mod h1:MbSGuTsp3dbXC40dX6PRTWyKYBIrTGTE9sqQNg2J8bo=
github.com/prometheus/client_model v0.0.0-20190129233127-fd36f4220a90/go.mod h1:xMI15A0UPsDsEKsMN9yxemIoYk6Tm2C1GtYGdfGttqA=
github.com/prometheus/client_model v0.0.0-20190812154241-14fe0d1b01d4/go.mod h1:xMI15A0UPsDsEKsMN9yxemIoYk6Tm2C1GtYGdfGttqA=
github.com/prometheus/client_model v0.2.0 h1:uq5h0d+GuxiXLJLNABMgp2qUWDPiLvgCzz2dUR+/W/M=
github.com/prometheus/client_model v0.2.0/go.mod h1:xMI15A0UPsDsEKsMN9yxemIoYk6Tm2C1GtYGdfGttqA=
github.com/prometheus/common v0.4.1/go.mod h1:TNfzLD0ON7rHzMJeJkieUDPYmFC7Snx/y86RQel1bk4=
github.com/prometheus/common v0.10.0/go.mod h1:Tlit/dnDKsSWFlCLTWaA1cyBgKHSMdTB80sz/V91rCo=
github.com/prometheus/common v0.26.0/go.mod h1:M7rCNAaPfAosfx8veZJCuw84e35h3Cfd9VFqTh1DIvc=
github.com/prometheus/common v0.32.1/go.mod h1:vu+V0TpY+O6vW9J44gczi3Ap/oXXR10b+M/gUGO4Hls=
github.com/prometheus/common v0.37.0 h1:ccBbHCgIiT9uSoFY0vX8H3zsNR5eLt17/RQLUvn8pXE=
github.com/prometheus/common v0.37.0/go.mod h1:phzohg0JFMnBEFGxTDbfu3QyL5GI8gTQJFhYO5B3mfA=
github.com/prometheus/procfs v0.0.0-20181005140218-185b4288413d/go.mod h1:c3At6R/oaqEKCNdg8wHV1ftS6bRYblBhIjjI8uT2IGk=
github.com/prometheus/procfs v0.0.2/go.mod h1:TjEm7ze935MbeOT/UhFTIMYKhuLP4wbCsTZCD3I8kEA=
github.com/prometheus/procfs v0.1.3/go.mod h1:lV6e/gmhEcM9IjHGsFOCxxuZ+z1YqCvr4OA4YeYWdaU=
github.com/prometheus/procfs v0.6.0/go.mod h1:cz+aTbrPOrUb4q7XlbU9ygM+/jj0fzG6c1xBZuNvfVA=
github.com/prometheus/procfs v0.7.3/go.mod h1:cz+aTbrPOrUb4q7XlbU9ygM+/jj0fzG6c1xBZuNvfVA=
github.com/prometheus/procfs v0.8.0 h1:ODq8ZFEaYeCaZOJlZZdJA2AbQR98dSHSM1KW/You5mo=
github.com/prometheus/procfs v0.8.0/go.mod h1:z7EfXMXOkbkqb9IINtpCn86r/to3BnA0uaxHdg830/4=
github.com/rogpeppe/go-internal v1.3.0/go.mod h1:M8bDsm7K2OlrFYOpmOWEs/qY81heoFRclV5y23lUDJ4=
github.com/sirupsen/logrus v1.2.0/go.mod h1:LxeOpSwHxABJmUn/MG1IvRgCAasNZTLOkJPxbbu5VWo=
github.com/sirupsen/logrus v1.4.2/go.mod h1:tLMulIdttU9McNUspp0xgXVQah82FyeX6MwdIuYE2rE=
github.com/sirupsen/logrus v1.6.0/go.mod h1:7uNnSEd1DgxDLC74fIahvMZmmYsHGZGEOFrfsX/uA88=
github.com/stretchr/objx v0.1.0/go.mod h1:HFkY916IF+rwdDfMAkV7OtwuqBVzrE8GR6GFx+wExME=
github.com/stretchr/objx v0.1.1/go.mod h1:HFkY916IF+rwdDfMAkV7OtwuqBVzrE8GR6GFx+wExME=
github.com/stretchr/testify v1.2.2/go.mod h1:a8OnRcib4nhh0OaRAV+Yts87kKdq0PP7pXfy6kDkUVs=
github.com/stretchr/testify v1.3.0/go.mod h1:M5WIy9Dh21IEIfnGCwXGc5bZfKNJtfHm1UVUgZn+9EI=
github.com/stretchr/testify v1.4.0/go.mod h1:j7eGeouHqKxXV5pUuKE4zz7dFj8WfuZ+81PSLYec5m4=
github.com/yuin/goldmark v1.1.25/go.mod h1:3hX8gzYuyVAZsxl0MRgGTJEmQBFcNTphYh9decYSb74=
github.com/yuin/goldmark v1.1.27/go.mod h1:3hX8gzYuyVAZsxl0MRgGTJEmQBFcNTphYh9decYSb74=
github.com/yuin/goldmark v1.1.32/go.mod h1:3hX8gzYuyVAZsxl0MRgGTJEmQBFcNTphYh9decYSb74=
go.opencensus.io v0.21.0/go.mod h1:mSImk1erAIZhrmZN+AvHh14ztQfjbGwt4TtuofqLduU=
go.opencensus.io v0.22.0/go.mod h1:+kGneAE2xo2IficOXnaByMWTGM9T73dGwxeWcUqIpI8=
go.opencensus.io v0.22.2/go.mod h1:yxeiOL68Rb0Xd1ddK5vPZ/oVn4vY4Ynel7k9FzqtOIw=
go.opencensus.io v0.22.3/go.mod h1:yxeiOL68Rb0Xd1ddK5vPZ/oVn4vY4Ynel7k9FzqtOIw=
go.opencensus.io v0.22.4/go.mod h1:yxeiOL68Rb0Xd1ddK5vPZ/oVn4vY4Ynel7k9FzqtOIw=
golang.org/x/crypto v0.0.0-20180904163835-0709b304e793/go.mod h1:6SG95UA2DQfeDnfUPMdvaQW0Q7yPrPDi9nlGo2tz2b4=
golang.org/x/crypto v0.0.0-20190308221718-c2843e01d9a2/go.mod h1:djNgcEr1/C05ACkg1iLfiJU5Ep61QUkGW8qpdssI0+w=
golang.org/x/crypto v0.0.0-20190510104115-cbcb75029529/go.mod h1:yigFU9vqHzYiE8UmvKecakEJjdnWj3jj499lnFckfCI=
golang.org/x/crypto v0.0.0-20190605123033-f99c8df09eb5/go.mod h1:yigFU9vqHzYiE8UmvKecakEJjdnWj3jj499lnFckfCI=
golang.org/x/crypto v0.0.0-20191011191535-87dc89f01550/go.mod h1:yigFU9vqHzYiE8UmvKecakEJjdnWj3jj499lnFckfCI=
golang.org/x/crypto v0.0.0-20200622213623-75b288015ac9/go.mod h1:LzIPMQfyMNhhGPhUkYOs5KpL4U8rLKemX1yGLhDgUto=
golang.org/x/exp v0.0.0-20190121172915-509febef88a4/go.mod h1:CJ0aWSM057203Lf6IL+f9T1iT9GByDxfZKAQTCR3kQA=
golang.org/x/exp v0.0.0-20190306152737-a1d7652674e8/go.mod h1:CJ0aWSM057203Lf6IL+f9T1iT9GByDxfZKAQTCR3kQA=
golang.org/x/exp v0.0.0-20190510132918-efd6b22b2522/go.mod h1:ZjyILWgesfNpC6sMxTJOJm9Kp84zZh5NQWvqDGG3Qr8=
golang.org/x/exp v0.0.0-20190829153037-c13cbed26979/go.mod h1:86+5VVa7VpoJ4kLfm080zCjGlMRFzhUhsZKEZO7MGek=
golang.org/x/exp v0.0.0-20191030013958-a1ab85dbe136/go.mod h1:JXzH8nQsPlswgeRAPE3MuO9GYsAcnJvJ4vnMwN/5qkY=
golang.org/x/exp v0.0.0-20191129062945-2f5052295587/go.mod h1:2RIsYlXP63K8oxa1u096TMicItID8zy7Y6sNkU49FU4=
golang.org/x/exp v0.0.0-20191227195350-da58074b4299/go.mod h1:2RIsYlXP63K8oxa1u096TMicItID8zy7Y6sNkU49FU4=
golang.org/x/exp v0.0.0-20200119233911-0405dc783f0a/go.mod h1:2RIsYlXP63K8oxa1u096TMicItID8zy7Y6sNkU49FU4=
golang.org/x/exp v0.0.0-20200207192155-f17229e696bd/go.mod h1:J/WKrq2StrnmMY6+EHIKF9dgMWnmCNThgcyBT1FY9mM=
golang.org/x/exp v0.0.0-20200224162631-6cc2880d07d6/go.mod h1:3jZMyOhIsHpP37uCMkUooju7aAi5cS1Q23tOzKc+0MU=
golang.org/x/image v0.0.0-20190227222117-0694c2d4d067/go.mod h1:kZ7UVZpmo3dzQBMxlp+ypCbDeSB+sBbTgSJuh5dn5js=
golang.org/x/image v0.0.0-20190802002840-cff245a6509b/go.mod h1:FeLwcggjj3mMvU+oOTbSwawSJRM1uh48EjtB4UJZlP0=
golang.org/x/lint v0.0.0-20181026193005-c67002cb31c3/go.mod h1:UVdnD1Gm6xHRNCYTkRU2/jEulfH38KcIWyp/GAMgvoE=
golang.org/x/lint v0.0.0-20190227174305-5b3e6a55c961/go.mod h1:wehouNa3lNwaWXcvxsM5YxQ5yQlVC4a0KAMCusXpPoU=
golang.org/x/lint v0.0.0-20190301231843-5614ed5bae6f/go.mod h1:UVdnD1Gm6xHRNCYTkRU2/jEulfH38KcIWyp/GAMgvoE=
golang.org/x/lint v0.0.0-20190313153728-d0100b6bd8b3/go.mod h1:6SW0HCj/g11FgYtHlgUYUwCkIfeOF89ocIRzGO/8vkc=
golang.org/x/lint v0.0.0-20190409202823-959b441ac422/go.mod h1:6SW0HCj/g11FgYtHlgUYUwCkIfeOF89ocIRzGO/8vkc=
golang.org/x/lint v0.0.0-20190909230951-414d861bb4ac/go.mod h1:6SW0HCj/g11FgYtHlgUYUwCkIfeOF89ocIRzGO/8vkc=
golang.org/x/lint v0.0.0-20190930215403-16217165b5de/go.mod h1:6SW0HCj/g11FgYtHlgUYUwCkIfeOF89ocIRzGO/8vkc=
golang.org/x/lint v0.0.0-20191125180803-fdd1cda4f05f/go.mod h1:5qLYkcX4OjUUV8bRuDixDT3tpyyb+LUpUlRWLxfhWrs=
golang.org/x/lint v0.0.0-20200130185559-910be7a94367/go.mod h1:3xt1FjdF8hUf6vQPIChWIBhFzV8gjjsPE/fR3IyQdNY=
golang.org/x/lint v0.0.0-20200302205851-738671d3881b/go.mod h1:3xt1FjdF8hUf6vQPIChWIBhFzV8gjjsPE/fR3IyQdNY=
golang.org/x/mobile v0.0.0-20190312151609-d3739f865fa6/go.mod h1:z+o9i4GpDbdi3rU15maQ/Ox0txvL9dWGYEHz965HBQE=
golang.org/x/mobile v0.0.0-20190719004257-d2bd2a29d028/go.mod h1:E/iHnbuqvinMTCcRqshq8CkpyQDoeVncDDYHnLhea+o=
golang.org/x/mod v0.0.0-20190513183733-4bf6d317e70e/go.mod h1:mXi4GBBbnImb6dmsKGUJ2LatrhH/nqhxcFungHvyanc=
golang.org/x/mod v0.1.0/go.mod h1:0QHyrYULN0/3qlju5TqG8bIK38QM8yzMo5ekMj3DlcY=
golang.org/x/mod v0.1.1-0.20191105210325-c90efee705ee/go.mod h1:QqPTAvyqsEbceGzBzNggFXnrqF1CaUcvgkdR5Ot7KZg=
golang.org/x/mod v0.1.1-0.20191107180719-034126e5016b/go.mod h1:QqPTAvyqsEbceGzBzNggFXnrqF1CaUcvgkdR5Ot7KZg=
golang.org/x/mod v0.2.0/go.mod h1:s0Qsj1ACt9ePp/hMypM3fl4fZqREWJwdYDEqhRiZZUA=
golang.org/x/mod v0.3.0/go.mod h1:s0Qsj1ACt9ePp/hMypM3fl4fZqREWJwdYDEqhRiZZUA=
golang.org/x/net v0.0.0-20180724234803-3673e40ba225/go.mod h1:mL1N/T3taQHkDXs73rZJwtUhF3w3ftmwwsq0BUmARs4=
golang.org/x/net v0.0.0-20180826012351-8a410e7b638d/go.mod h1:mL1N/T3taQHkDXs73rZJwtUhF3w3ftmwwsq0BUmARs4=
golang.org/x/net v0.0.0-20181114220301-adae6a3d119a/go.mod h1:mL1N/T3taQHkDXs73rZJwtUhF3w3ftmwwsq0BUmARs4=
golang.org/x/net v0.0.0-20190108225652-1e06a53dbb7e/go.mod h1:mL1N/T3taQHkDXs73rZJwtUhF3w3ftmwwsq0BUmARs4=
golang.org/x/net v0.0.0-20190213061140-3a22650c66bd/go.mod h1:mL1N/T3taQHkDXs73rZJwtUhF3w3ftmwwsq0BUmARs4=
golang.org/x/net v0.0.0-20190311183353-d8887717615a/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190404232315-eb5bcb51f2a3/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190501004415-9ce7a6920f09/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190503192946-f4e77d36d62c/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190603091049-60506f45cf65/go.mod h1:HSz+uSET+XFnRR8LxR5pz3Of3rY3CfYBVs4xY44aLks=
golang.org/x/net v0.0.0-20190613194153-d28f0bde5980/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20190620200207-3b0461eec859/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20190628185345-da137c7871d7/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20190724013045-ca1201d0de80/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20191209160850-c0dbc17a3553/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200114155413-6afb5195e5aa/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200202094626-16171245cfb2/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200222125558-5a598a2470a0/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200226121028-0de0cce0169b/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200301022130-244492dfa37a/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200324143707-d3edc9973b7e/go.mod h1:qpuaurCH72eLCgpAm/N6yyVIVM9cpaDIP3A8BGJEC5A=
golang.org/x/net v0.0.0-20200501053045-e0ff5e5a1de5/go.mod h1:qpuaurCH72eLCgpAm/N6yyVIVM9cpaDIP3A8BGJEC5A=
golang.org/x/net v0.0.0-20200506145744-7e3656a0809f/go.mod h1:qpuaurCH72eLCgpAm/N6yyVIVM9cpaDIP3A8BGJEC5A=
golang.org/x/net v0.0.0-20200513185701-a91f0712d120/go.mod h1:qpuaurCH72eLCgpAm/N6yyVIVM9cpaDIP3A8BGJEC5A=
golang.org/x/net v0.0.0-20200520182314-0ba52f642ac2/go.mod h1:qpuaurCH72eLCgpAm/N6yyVIVM9cpaDIP3A8BGJEC5A=
golang.org/x/net v0.0.0-20200625001655-4c5254603344/go.mod h1:/O7V0waA8r7cgGh81Ro3o1hOxt32SMVPicZroKQ2sZA=
golang.org/x/net v0.0.0-20200707034311-ab3426394381/go.mod h1:/O7V0waA8r7cgGh81Ro3o1hOxt32SMVPicZroKQ2sZA=
golang.org/x/net v0.0.0-20200822124328-c89045814202/go.mod h1:/O7V0waA8r7cgGh81Ro3o1hOxt32SMVPicZroKQ2sZA=
golang.org/x/net v0.0.0-20210525063256-abc453219eb5/go.mod h1:9nx3DQGgdP8bBQD5qxJ1jj9UTztislL4KSBs9R2vV5Y=
golang.org/x/net v0.0.0-20220127200216-cd36cc0744dd/go.mod h1:CfG3xpIq0wQ8r1q4Su4UZFWDARRcnwPjda9FqA0JpMk=
golang.org/x/net v0.0.0-20220225172249-27dd8689420f/go.mod h1:CfG3xpIq0wQ8r1q4Su4UZFWDARRcnwPjda9FqA0JpMk=
golang.org/x/oauth2 v0.0.0-20180821212333-d2e6202438be/go.mod h1:N/0e6XlmueqKjAGxoOufVs8QHGRruUQn6yWY3a++T0U=
golang.org/x/oauth2 v0.0.0-20190226205417-e64efc72b421/go.mod h1:gOpvHmFTYa4IltrdGE7lF6nIHvwfUNPOp7c8zoXwtLw=
golang.org/x/oauth2 v0.0.0-20190604053449-0f29369cfe45/go.mod h1:gOpvHmFTYa4IltrdGE7lF6nIHvwfUNPOp7c8zoXwtLw=
golang.org/x/oauth2 v0.0.0-20191202225959-858c2ad4c8b6/go.mod h1:gOpvHmFTYa4IltrdGE7lF6nIHvwfUNPOp7c8zoXwtLw=
golang.org/x/oauth2 v0.0.0-20200107190931-bf48bf16ab8d/go.mod h1:gOpvHmFTYa4IltrdGE7lF6nIHvwfUNPOp7c8zoXwtLw=
golang.org/x/oauth2 v0.0.0-20210514164344-f6687ab2804c/go.mod h1:KelEdhl1UZF7XfJ4dDtk6s++YSgaE7mD/BuKKDLBl4A=
golang.org/x/oauth2 v0.0.0-20220223155221-ee480838109b/go.mod h1:DAh4E804XQdzx2j+YRIaUnCqCV2RuMz24cGBJ5QYIrc=
golang.org/x/sync v0.0.0-20180314180146-1d60e4601c6f/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20181108010431-42b317875d0f/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20181221193216-37e7f081c4d4/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20190227155943-e225da77a7e6/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20190423024810-112230192c58/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20190911185100-cd5d95a43a6e/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20200317015054-43a5402ce75a/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20200625203802-6e8e738ad208/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20201207232520-09787c993a3a/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20220601150217-0de741cfad7f/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sys v0.0.0-20180830151530-49385e6e1522/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20180905080454-ebe1bf3edb3