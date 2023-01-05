import "dotenv/config";
import * as fs from "fs";
import fetch from "node-fetch";

const { API_TOKEN, CVS, OWNER_TYPE, OWNER_NAME } = process.env;
if (
  API_TOKEN == undefined ||
  CVS == undefined ||
  OWNER_TYPE == undefined ||
  OWNER_NAME == undefined
) {
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

const getProjectEnvvars = async (
  projectName: string,
  pageToken?: string
): Promise<any[]> => {
  const headers = {
    authorization: `Basic ${Buffer.from(API_TOKEN).toString("base64")}`,
  };
  const response = await fetch(
    `https://circleci.com/api/v2/project/${CVS}/${OWNER_NAME}/${projectName}/envvar${
      pageToken ? `?page-token=${pageToken}` : ""
    }`,
    { headers }
  );
  const data = await response.json();
  if (data.items != undefined) {
    const next: any[] = data.next_page_token
      ? await getProjectEnvvars(projectName, data.next_page_token)
      : [];
    return [...data.items, ...next];
  } else if (data.message != undefined) {
    return [];
  } else {
    throw new Error(data);
  }
};

const getContexts = async (pageToken?: string): Promise<any[]> => {
  const headers = {
    authorization: `Basic ${Buffer.from(API_TOKEN).toString("base64")}`,
  };
  const response = await fetch(
    `https://circleci.com/api/v2/context?owner-slug=${CVS}/${OWNER_NAME}&owner-type=${OWNER_TYPE}${
      pageToken ? `&page-token=${pageToken}` : ""
    }`,
    {
      headers,
    }
  );
  const data = await response.json();
  if (data.items != undefined) {
    const next: any[] = data.next_page_token
      ? await getContexts(data.next_page_token)
      : [];
    return [...data.items, ...next];
  } else if (data.message != undefined) {
    return [];
  } else {
    throw new Error(data);
  }
};

const getContextEnvvars = async (
  contextId: string,
  pageToken?: string
): Promise<any[]> => {
  const headers = {
    authorization: `Basic ${Buffer.from(API_TOKEN).toString("base64")}`,
  };
  const response = await fetch(
    `https://circleci.com/api/v2/context/${contextId}/environment-variable${
      pageToken ? `?page-token=${pageToken}` : ""
    }`,
    { headers }
  );
  const data = await response.json();
  if (data.items != undefined) {
    const next: any[] = data.next_page_token
      ? await getProjectEnvvars(contextId, data.next_page_token)
      : [];
    return [...data.items, ...next].map(({ variable, created_at }) => ({
      variable,
      created_at,
    }));
  } else if (data.message != undefined) {
    return [];
  } else {
    throw new Error(data);
  }
};

const app = async () => {
  // Projects
  const connectedProjects = readConnectedProjects();
  connectedProjects.forEach(async (projectName) => {
    const items = await getProjectEnvvars(projectName);
    console.log(`{project: ${projectName}, items: ${JSON.stringify(items)}}`);
  });
  // Contexts
  const contexts = await getContexts();
  contexts.forEach(async (context) => {
    const items = await getContextEnvvars(context.id);
    console.log(`{context: ${context.name}, items: ${JSON.stringify(items)}}`);
  });
};
app();
