kind create cluster --config k8s/cluster.yaml --name lovable
kind load docker-image backend-docker-image:latest --name lovable
kubectl apply -f k8s/kind-ingres-setup.yaml
kubectl apply -f k8s/ingres.yaml
kubectl apply -f k8s/be-service.yaml
kubectl apply -f k8s/be-deployment.yaml
kubectl apply -f k8s/ingres.yaml
