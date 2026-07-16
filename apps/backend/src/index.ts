import express from "express";
import * as k8s from "@kubernetes/client-node";
import deploymentService from "./k8s/deploymentService.yaml";
import config from "./k8s/podConfig.json";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const appsApi = kc.makeApiClient(k8s.AppsV1Api);

const [deploymentYaml, serviceYaml] = deploymentService;
// this should be brought in from redis thing on every pod creation
const { USER_APP_IMAGE, USER_APP_PORT, AI_APP_IMAGE, AI_APP_PORT } = config;
//

const startPod = async () => {
  //

  const workerId = crypto.randomUUID();
  let userAppUrl = "";

  console.log(deploymentYaml);
  const deployment = deploymentYaml
    .replaceAll("${WORKER_NAME}", workerId)
    .replaceAll("${USER_APP_IMAGE}", USER_APP_IMAGE)
    .replaceAll("${USER_APP_PORT}", USER_APP_PORT)
    .replaceAll("${AI_APP_IMAGE}", AI_APP_IMAGE)
    .replaceAll("${AI_APP_PORT}", AI_APP_PORT);

  const service = serviceYaml
    .replaceAll("${WORKER_NAME}", workerId)
    .replaceAll("${USER_APP_PORT}", USER_APP_PORT)
    .replaceAll("${AI_APP_PORT}", AI_APP_PORT);

  console.log(deployment, service);

  return { workerId, userAppUrl };
};
startPod();

const app = express();
app.use(express.json());

app.post("/initProject", async (req, res) => {
  const { message } = req.body;
  //
});

app.post("/chat", async (req, res) => {
  //

  const { message } = req.body;
});

app.listen(3000);
