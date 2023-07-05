import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX } from "../constant";

interface UserInfo {
  userId: string;
  openId: string;
  userName: string;
  roles: string[];
  avatar: string;
  introduction: string;
  telephone: string;
  referralCode: string;
  referredBy: string;
  expireOn: string;
  mjExpireOn: string;
  ifAgent: boolean;
  withdrawn: number;
  historyWithdrawn: number;
}

// function getIP(req: NextRequest) {
//   let ip = req.ip ?? req.headers.get("x-real-ip");
//   const forwardedFor = req.headers.get("x-forwarded-for");

//   if (!ip && forwardedFor) {
//     ip = forwardedFor.split(",").at(0) ?? "";
//   }

//   return ip;
// }

// function parseApiKey(bearToken: string) {
//   const token = bearToken.trim().replaceAll("Bearer ", "").trim();
//   const isOpenAiKey = !token.startsWith(ACCESS_CODE_PREFIX);

//   return {
//     accessCode: isOpenAiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
//     apiKey: isOpenAiKey ? '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' : "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",
//   };
// }

export async function auth(req: NextRequest, skipCustomKey = true) {
  // const authToken = req.headers.get("Authorization") ?? req.nextUrl.searchParams.get("Authorization") ?? "";
  const authToken0 = req.cookies.get('YUNAI-ACCESS-TOKEN')?.value
  // const authToken = "ak-258199199";

  // // check if it is openai api key or user token
  // const { accessCode, apiKey: token } = parseApiKey(authToken);

  // const hashedCode = md5.hash(accessCode ?? "").trim();

  // const serverConfig = getServerSideConfig();
  // console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  // console.log("[Auth] got access code:", accessCode);
  // console.log("[Auth] hashed access code:", hashedCode);
  // console.log("[User IP] ", getIP(req));
  // console.log("[Time] ", new Date().toLocaleString());

  // if (serverConfig.needCode && !serverConfig.codes.has(hashedCode)) {
  //   if (!token || !skipCustomKey) {
  //     return {
  //       error: true,
  //       msg: !accessCode ? "empty access code" : "wrong access code",
  //     };
  //   }
  // }

  // if user does not provide an api key, inject system api key
  // if (!token) {
  //   const apiKey = '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';
  //   if (apiKey) {
  //     console.log("[Auth] use system api key");
  //     req.headers.set("Authorization", `Bearer ${apiKey}`);
  //   } else {
  //     console.log("[Auth] admin did not provide an api key");
  //   }
  // } else {
  //   const apiKey = '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';
  //   req.headers.set("Authorization", `Bearer ${apiKey}`);
  //   console.log("[Auth] use user api key");
  // }
  const apiKey = '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';
  req.headers.set("Authorization", `Bearer ${apiKey}`);

// TODO: 根据实际情况解析 token 获取用户信息
  if(!authToken0){
    return {
      error: true,
      msg: "YUNAI-ACCESS-TOKEN is null, please login again.",
    };
  }
  const userInfo = await getUserInfoFromToken(authToken0);
  if(isExpired(userInfo.mjExpireOn)){
    return {
      error: true,
      msg: "你好，"+userInfo.userName+" ，您的体验期已经于" + userInfo.mjExpireOn + "日过期，请您购买AI生图服务",
    };
  }
  return {
    error: false,
  };
}

async function getUserInfoFromToken(token: string): Promise<UserInfo> {
  // TODO: 根据实际情况使用给定的 token 获取用户信息
  // 示例：假设这里是请求后端接口来获取用户信息
  const response = await fetch(`https://chat.yunai.com.cn/yunai-api/user/info/${token}`);
  const data = await response.json();

  return data.data as UserInfo;
}
function isExpired(mjExpireOn: string): boolean {
  const today = new Date();
  const expireDate = new Date(mjExpireOn);

  // 移除小时、分钟和秒的信息，只保留日期
  today.setHours(0, 0, 0, 0);
  expireDate.setHours(0, 0, 0, 0);

  if (expireDate < today) {
    return true; // 过期
  } else {
    return false; // 未过期
  }
}