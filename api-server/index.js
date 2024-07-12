const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");

const app = express();
const PORT = 9000;

const ecsClient = new ECSClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const config = {
  CLUSTER: "arn:aws:ecs:ap-south-1:767398057993:cluster/builder-cluster-test",
  TASK: "arn:aws:ecs:ap-south-1:767398057993:task-definition/builder-task-test",
};

app.use(express.json());

app.post("/project", async(req, res) => {
  const { gitURL } = req.body;
  const projectSlug = generateSlug();

  //Spin a container using ECS ::
  const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          "subnet-07be0dbbaa7bd036d",
          "subnet-0bf63f4f7785c1b40",
          "subnet-071d7b24af93052b0",
        ],
        securityGroups: ["sg-04a565624cab48b8d"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-image",
          environment: [
            {
              name: "GIT_REPOSITORY__URL",
              value: gitURL,
            },
            {
              name: "PROJECT_ID",
              value: projectSlug,
            },
          ],
        },
      ],
    },
  });

  await ecsClient.send(command);
  return res.json({
    status : 'queued',
    data : {projectSlug , url : `https://${projectSlug}.localhost:8000`}
  })
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
