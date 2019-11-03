import express from 'express';
import * as KafkaKeyValue from '@yolean/kafka-keyvalue';

import * as promClient from 'prom-client';

const PORT = 8080;

const app = express();

function getEnvOrThrow(key) {
  const value = process.env[key];
  if (value === undefined) throw new Error(`Missing env "${key}"`);
  return value;
}

const cache = new KafkaKeyValue({
  cacheHost: getEnvOrThrow('CACHE_HOST'),
  metrics: KafkaKeyValue.createMetrics(promClient.Counter, promClient.Gauge, promClient.Histogram),
  pixyHost: getEnvOrThrow('PIXY_HOST'),
  topicName: getEnvOrThrow('TOPIC_NAME')
});

app.get('/:id', async (req, res) => {
  const config = await cache.get(req.params.id);
  res.send(config);
});

app.listen(PORT);

console.log(`Listening to port ${PORT}`);