import express from "express";
import * as k8s from "@kubernetes/client-node";
import deploymentService from "./k8s/deploymentService.yaml";
import config from "./k8s/podConfig.json";

// const kc = new k8s.KubeConfig();
// kc.loadFromDefault();
// const k8sClient = k8s.KubernetesObjectApi.makeApiClient(kc);

// const [deploymentYaml, serviceYaml] = deploymentService;
// // this should be brought in from redis thing on every pod creation
// const { USER_APP_IMAGE, USER_APP_PORT, AI_APP_IMAGE, AI_APP_PORT } = config;
// //

// const startPod = async () => {
//   //
//   console.dir(kc.getCurrentCluster(), { depth: null });
//   const workerId = `worker-${crypto.randomUUID()}`;
//   let userAppUrl = "";

//   const deployment = structuredClone(deploymentYaml);
//   deployment.metadata.name = workerId;
//   deployment.metadata.labels.app = workerId;

//   deployment.spec.selector.matchLabels.app = workerId;
//   deployment.spec.template.metadata.labels.app = workerId;

//   deployment.spec.template.spec.containers[0].image = USER_APP_IMAGE;
//   deployment.spec.template.spec.containers[0].ports[0].containerPort =
//     Number(USER_APP_PORT);

//   deployment.spec.template.spec.containers[1].image = AI_APP_IMAGE;
//   deployment.spec.template.spec.containers[1].ports[0].containerPort =
//     Number(AI_APP_PORT);

//   const service = structuredClone(serviceYaml);

//   service.metadata.name = workerId;

//   service.spec.selector.app = workerId;

//   service.spec.ports[0].port = 3000;
//   service.spec.ports[0].targetPort = Number(USER_APP_PORT);

//   service.spec.ports[1].port = 80;
//   service.spec.ports[1].targetPort = Number(AI_APP_PORT);

//   console.log(deployment, service);

//   await Promise.all([k8sClient.create(deployment), k8sClient.create(service)]);

//   return { workerId, userAppUrl };
// };
// startPod();

const app = express();
app.use(express.json());

app.post("/initProject", async (req, res) => {
  const { message } = req.body;
  //
  console.log(message);
});

app.post("/chat", async (req, res) => {
  //

  const { message } = req.body;
});

app.listen(3000);
