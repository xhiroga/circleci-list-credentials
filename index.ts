import "dotenv/config";
import * as fs from "fs";
import fetch from "node-fetch";

const { API_TOKEN, PROJECT_PREFIX } = process.env;
if (API_TOKEN == undefined || PROJECT_PREFIX == undefined) {
  throw new Error("Environment variables are not configured.");
}

const readConnectedProjects = () => {
  const text = fs.readFileSync("projects.txt", "utf8");
  const linesFromEnd = text.split("\n").reverse();
  const projects: string[] = [];
  let i = 0;
  while (i < linesFromEnd.length) {
    const line = linesFromEnd[i];
    if (["", "Follow Project", "Unfollow Project"].includes(line)) {
      i++;
      continue;
    } else if (line === "Set Up Project") {
      i = i + 2;
    } else {
      projects.push(line);
      i++;
    }
  }
  return projects.reverse();
};

const getEnvvarItems = async (
  projectName: string,
  pageToken?: string
): Promise<string[]> => {
  const headers = {
    authorization: `Basic ${Buffer.from(API_TOKEN).toString("base64")}`,
  };
  const response = await fetch(
    `https://circleci.com/api/v2/project/${PROJECT_PREFIX}/${projectName}/envvar${
      pageToken ? `?page-token=${pageToken}` : ""
    }`,
    { headers }
  );
  const data = await response.json();
  if (data.items != undefined) {
    const next: string[] = data.next_page_token
      ? await getEnvvarItems(projectName, data.nextPageToken)
      : [];
    return [...data.items, next];
  } else if (data.message === "Project not found") {
    return [];
  } else {
    throw new Error(data);
  }
};

const app = async () => {
  const connectedProjects = readConnectedProjects();
  connectedProjects.forEach(async (projectName) => {
    const items = await getEnvvarItems(projectName);
    console.log(`{${projectName}, ${JSON.stringify(items)}}`);
  });
};
app();
