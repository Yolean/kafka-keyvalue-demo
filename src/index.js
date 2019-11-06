import express from 'express';
import KafkaKeyValue from '@yolean/kafka-keyvalue';
import promClient from 'prom-client';

const PORT = 8080;

const app = express();

function getEnvOrThrow(key) {
  const value = process.env[key];
  if (value === undefined) throw new Error(`Missing env "${key}"`);
  return value;
}

const cache = new KafkaKeyValue.default({
  cacheHost: getEnvOrThrow('CACHE_HOST'),
  metrics: KafkaKeyValue.default.createMetrics(promClient.Counter, promClient.Gauge, promClient.Histogram),
  pixyHost: getEnvOrThrow('PIXY_HOST'),
  topicName: getEnvOrThrow('TOPIC_NAME')
});

app.post(KafkaKeyValue.ON_UPDATE_DEFAULT_PATH, KafkaKeyValue.getOnUpdateRoute());

app.get('/:id', async (req, res) => {
  const config = await cache.get(req.params.id);
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
      <title>KKV Demo</title>
    </head>
    <body>
      <div style="background-color: ${config.color}">Hello Kafka!</div>
    </body>
    </html>
  `);
});

cache.onUpdate((key, value) => {
  console.log({ key, value }, 'Received update from KKV');
});

app.listen(PORT);

console.log(`Listening to port ${PORT}`);