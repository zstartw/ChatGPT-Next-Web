import { NextRequest, NextResponse } from "next/server";

import { getServerSideConfig } from "@/app/config/server";
import { resolve } from "path";
import { rejects } from "assert";

const serverConfig = getServerSideConfig();

/* const TOKEN_INFO = {
    msg: '',
    code: 0,
    data: {
        token: ''
    },
    version: ''
};

declare global {
  type TOKEN_INFO = typeof TOKEN_INFO;
} */

function formatResponse(msg: any) {
  const jsonMsg = ["```json\n", JSON.stringify(msg, null, "  "), "\n```"].join(
    "",
  );
  return new Response(jsonMsg);
}

async function handle(req: NextRequest) {
  const params = new URLSearchParams(req.url);

  let userName = params.get("name");
  let password = params.get("pwd");

  let host = "http://localhost:8097/auth/login";
  let param = {
    email: userName,
    password: password,
  };

  try {
    const api = await fetch(host, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "sc-api-version": "1.0.0",
      },
      body: JSON.stringify(param),
    });
    console.log("123");

    const resultjson = await api.json();

    let response = new Response(JSON.stringify(resultjson));

    console.log(JSON.stringify(resultjson));

    return NextResponse.json(JSON.stringify(resultjson));
  } catch (e) {
    console.error("[OpenAI] ", e);
    return formatResponse(e);
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
