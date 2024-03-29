# README.md

Why? I'm trying to make sense of how and why we implemented [Kafka KeyValue (KKV)](https://github.com/Yolean/kafka-keyvalue)

## Goal

Demonstrate how we built a never-stale, update-pushing key-value cache on top of kafka

## Pre-requisites

In order to follow this example with 0 modifications, you need a Kubernetes cluster set up according to https://github.com/y-stack/ystack#cluster-setup

## Keywords (stuff that should probably be explained and/or understood)

* Kubernetes
* Microservices
* Pods
* Containers
* Kafka
* Kafka Streams
* Kafka Topic
* Topic Partition
* Keyed messages
* Topic Compaction

## Setup

```sh
# Use our own namespace
kubectl --context ystack-k3s create namespace kkv-demo
# Set up services independently of deployments because we don't want them deleted during the development-loop
kubectl --context ystack-k3s -n kkv-demo create -f variant-dev/services.yaml

# Terimnal 1
skaffold --kube-context ystack-k3s dev -n kkv-demo

# Terminal 2
kubectl --context ystack-k3s -n kkv-demo port-forward svc/kafka-keyvalue-nodejs--sidecar-demo 8080

# Terminal 3
kubectl --context ystack-k3s -n kkv-demo get all

# Terminal 4
kubectl --context ystack-k3s -n kkv-demo get pods -w

# Terminal 5
kubectl --context ystack-k3s -n kkv-demo run --restart=Never -ti --image yolean/toil@sha256:82c8cc8d082f40753d2e409a670e1dc34455b0e2143adff285cc4102b1326d11 toil
```

## Demo "Script"

```sh
# Produce a message
curl -X POST -H 'content-type: application/json' -d '{ "id": "A", "color": "red" }' http://pixy/topics/sidecar-demo/messages?key=A
curl -X POST -H 'content-type: application/json' -d '{ "id": "B", "color": "blue" }' http://pixy/topics/sidecar-demo/messages?key=B

# Different ways of consuming the message using our API
curl http://kafka-keyvalue-nodejs--sidecar-demo:8091/cache/v1/keys
curl http://kafka-keyvalue-nodejs--sidecar-demo:8091/cache/v1/values
curl http://kafka-keyvalue-nodejs--sidecar-demo:8091/cache/v1/raw/A
```

## Implementation details for the cache

* Standard Kafka Consumer, because we need "seekToBeginning"
* The cache is (right now) a simple (Hash)Map <String, Byte[]>

## Integrating with an application

* npm @yolean/kafka-keyvalue, open sourced at https://github.com/Yolean/kafka-keyvalue-nodejs

```js
// API example
const cache = new KafkaKeyValue({
  cacheHost: 'http://localhost:8091',
  metrics: KafkaKeyValue.createMetrics(promClient.Counter, promClient.Gauge, promClient.Histogram),
  pixyHost: 'http://pixy',
  topicName: 'sidecar-demo'
});

await cache.onReady();

cache.onUpdate((key, value) => console.log(key, value));

const value = cache.get('A')
await cache.put('A', { id: 'A', color: 'green' });
```


## Making things a bit more interesting

* Horizontal scaling
* ...
