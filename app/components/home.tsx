"use client";

require("../polyfill");

import { useState, useEffect } from "react";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import dd from "dingtalk-jsapi"; // 此方式为整体加载，也可按需进行加载

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { useMaskStore } from "../store/mask";
import { useAccessStore } from "../store/access";

import { Login } from "./login";
import { showToast } from "./ui-lib";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  linkEl.rel = "stylesheet";
  linkEl.href =
    "/google-fonts/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap";
  document.head.appendChild(linkEl);
};

function addDingDebug() {
  //   const meta = document.createElement('meta');
  // meta.setAttribute('name', 'wpk-bid');
  // meta.setAttribute('content', 'dta_1_2587851622');
  // document.head.appendChild(meta);

  const script = document.createElement("script");
  script.innerHTML = `
  var isDingtalk = navigator && /DingTalk/.test(navigator.userAgent);
  var isProductEnv = window &&window.location &&window.location.host 
      && window.location.host.indexOf('127.0.0.1')===-1
      && window.location.host.indexOf('localhost')===-1
      && window.location.host.indexOf('192.168.')===-1
      // 如果有其它测试域名，请一起排掉，减少测试环境对生产环境监控的干扰
  if (isProductEnv) {    !(function(c,i,e,b){var h=i.createElement("script");
  var f=i.getElementsByTagName("script")[0];
  h.type="text/javascript";
  h.crossorigin=true;
  h.onload=function(){c[b]||(c[b]=new c.wpkReporter({bid:"dta_1_2587851622"}));
  c[b].installAll()};
  f.parentNode.insertBefore(h,f);
  h.src=e})(window,document,"https://g.alicdn.com/woodpeckerx/jssdk??wpkReporter.js","__wpk");
  }`;
  document.head.appendChild(script);
}

function Screen() {
  const config = useAppConfig();
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  return (
    <div
      className={
        styles.container +
        ` ${
          config.tightBorder && !isMobileScreen
            ? styles["tight-container"]
            : styles.container
        }`
      }
    >
      <SideBar className={isHome ? styles["sidebar-show"] : ""} />

      <div className={styles["window-content"]} id={SlotID.AppBody}>
        <Routes>
          <Route path={Path.Home} element={<Chat />} />
          <Route path={Path.NewChat} element={<NewChat />} />
          <Route path={Path.Masks} element={<MaskPage />} />
          <Route path={Path.Chat} element={<Chat />} />
          <Route path={Path.Settings} element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export function Home() {
  const accessStore = useAccessStore();

  useSwitchTheme();

  useEffect(() => {
    addDingDebug();
  }, []);

  if (!useHasHydrated()) {
    return <Loading />;
  }

  console.log("[dingding platform]", dd.env.platform);
  if (dd.env.platform !== "notInDingTalk") {
    if (accessStore.loginToken.length == 0) {
      dd.ready(function () {
        dd.runtime.permission
          .requestAuthCode({ corpId: "dingff4418450cea3cc635c2f4657eb6378f" })
          .then((res) => {
            console.log("code=", res.code);

            let loginPath = "/api/login?code=" + res.code + "&code=" + res.code;
            fetch(loginPath, {
              method: "get",
            })
              .then((res) => res.json())
              .then((res) => {
                let result = JSON.parse(res);
                console.log("[home result]", result);

                if (result.errcode == 0) {
                  console.log("[=====]", result.result.name);
                  accessStore.updateLoginToken(result.result.name);
                  // window.location.reload();
                }
                // showToast(result.msg);
              })
              .catch((e) => {
                console.error("[Config] failed to fetch config", e);
              })
              .finally(() => {});
          });
      });

      return <Loading />;
    } else {
      return (
        <ErrorBoundary>
          <Router>
            <Screen />
          </Router>
        </ErrorBoundary>
      );
    }
  } else {
    if (accessStore.loginToken.length == 0) {
      return (
        <>
          <Login />
        </>
      );
    } else {
      return (
        <ErrorBoundary>
          <Router>
            <Screen />
          </Router>
        </ErrorBoundary>
      );
    }
  }
}
