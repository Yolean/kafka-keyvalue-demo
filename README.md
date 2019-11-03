### README.md

Why? I'm trying to make sense of how and why we implemented KKV (TODO Link)

## Resources/Background/Motivation/Inspiration
https://www.slideshare.net/KaiWaehner/service-mesh-with-apache-kafka-kubernetes-envoy-istio-and-linkerd

## Setup

```sh
# Use our own namespace
kubectl --context ystack-k3s create namespace kkv-demo
# Set up services independently of deployments because we don't want them deleted during the development-loop
kubectl --context ystack-k3s create -f variant-dev/services.yaml
skaffold --kube-context ystack-k3s dev -n kkv-demo
```

## Demo "Script"

```sh
# Set up a toil container
kubectl --context ystack-k3s -n kkv-demo run --restart=Never -ti --image yolean/toil@sha256:82c8cc8d082f40753d2e409a670e1dc34455b0e2143adff285cc4102b1326d11 toil
# See that we can list kafka topics

# TODO Use pixy instead
kafkacat -b bootstrap.kafka:9092 -L

# Produce a message
echo 'A~{ "id": "A", "color": "blue" }' | kafkacat -b bootstrap.kafka:9092 -t sidecar-demo -P -K "~"

curl http://kafka-keyvalue-nodejs--sidecar-demo:8091/cache/v1/keys
curl http://kafka-keyvalue-nodejs--sidecar-demo:8091/cache/v1/values
```