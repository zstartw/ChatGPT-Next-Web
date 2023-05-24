import { NextRequest, NextResponse } from "next/server";

import * as dd from "dingtalk-jsapi"; // 此方式为整体加载，也可按需进行加载

import { getServerSideConfig } from "@/app/config/server";
import { resolve } from "path";
import { rejects } from "assert";

let code: any;

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

  code = params.get("code");

  console.log("====", req.url);
  console.log("[h5 platform]", dd.env.platform);
  console.log("[code]", code);

  let tokenHost = `https://oapi.dingtalk.com/gettoken?appkey=${serverConfig.appKey}&appsecret=${serverConfig.appSecurity}`;
  console.log("[get token]", tokenHost);
  try {
    const api = await fetch(tokenHost, {
      method: "get",
    });
    const tokenData = await api.json();

    let userInfoHost = "https://oapi.dingtalk.com/topapi/v2/user/getuserinfo";
    let param = `access_token=${tokenData.access_token}&code=${code}`;

    try {
      const api = await fetch(userInfoHost, {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: param,
      });

      const resultjson = await api.json();

      let response = new Response(JSON.stringify(resultjson));

      console.log("[login]", JSON.stringify(resultjson));

      return NextResponse.json(JSON.stringify(resultjson));

      // if(result.errcode == 0){
      // return NextResponse.json(JSON.stringify(resultjson));
      // }else{
      //   //showToast(result.errmsg);
      //   return NextResponse.json('{}');
      // }
    } catch (e) {
      console.error("[OpenAI get userinfo] ", e);
      return formatResponse(e);
    }
  } catch (e) {
    console.error("[OpenAI getaccess token] ", e);
    return formatResponse(e);
  }

  // getAccessToken().then( res=> {
  //   // console.log('[access token]', res);
  //   getUserinfo(res).then(res=>{
  //     // console.log('[login result]', res);

  //     return NextResponse.json(JSON.stringify(res));
  //   })
  // })

  // return NextResponse.json('{}');

  // const params = new URLSearchParams(req.url);

  // let userName = params.get("name")
  // let password = params.get("pwd")

  // let host = 'http://localhost:8096/auth/login'
  // // let host = 'api/login'
  //     let param = {
  //         email: userName,
  //         password: password
  //     };

  //       try{
  //         const api = await  fetch(host, {
  //             method: "post",
  //             headers: {
  //                 'Content-Type':'application/json',
  //                 'sc-api-version': '1.0.0'
  //             },
  //             body: JSON.stringify(param),
  //           });
  //           console.log('123');

  //           const resultjson = await api.json();

  //           let response = new Response(JSON.stringify(resultjson));

  //           console.log(JSON.stringify(resultjson))

  //           return NextResponse.json(JSON.stringify(resultjson));
  //       }catch(e){
  //         console.error("[OpenAI] ", e);
  //          return formatResponse(e);
  //       }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
