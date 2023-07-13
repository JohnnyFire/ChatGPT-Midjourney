import { useEffect, useRef } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/fund.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/plugin.svg";

import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";

import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showToast } from "./ui-lib";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        const n = chatStore.sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = chatStore.currentSessionIndex;
        if (e.key === "ArrowUp") {
          chatStore.selectSession(limit(i - 1));
        } else if (e.key === "ArrowDown") {
          chatStore.selectSession(limit(i + 1));
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}
function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();
  const referralCode = localStorage.getItem('referralCode')
  let model = 'image'
  let modelD = 'MJ文生图'
  const value = localStorage.getItem('app-config');
  if (value) {
      const config = JSON.parse(value);
      model = config.state.model;
      if (model === 'text'){
        modelD = 'GPT-聊天'
      }
  }


  useHotKey();

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-header"]}>
        <div className={styles["sidebar-title"]}>
          Midjourney+智能聊天
        </div>
        <div className={styles["sidebar-sub-title"]} style={{ color: "red" }}><span color="red">芸爱智宝，您的智能服务管家，我们推崇极简。</span></div>
        <div className={styles["sidebar-sub-title"]}>客服微信：<span style={{ color: "red" }}>yapd008</span></div>
        <div className={styles["sidebar-sub-title"]}>客服热线：<span style={{ color: "red" }}>18925893643</span></div>
        <div className={styles["sidebar-sub-title"]}>此页面可以同时兼容GPT对话和MJ文作图，当前模式为<span style={{ color: "green" }}>{modelD}</span>，对话框下方可调整切换。
          <table>
            <thead>
              <tr>
                <th>计费模式</th>
                <th>消耗额度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>绘画</td>
                <td>10</td>
              </tr>
              <tr>
                <td>混图</td>
                <td>10</td>
              </tr>
              <tr>
                <td>识图</td>
                <td>10</td>
              </tr>
              <tr>
                <td>变换</td>
                <td>8</td>
              </tr>
              <tr>
                <td>重新作图</td>
                <td>8</td>
              </tr>
              <tr>
                <td>放大</td>
                <td>8</td>
              </tr>
            </tbody>
          </table>
          推荐用户使用可延长使用时间，合作推广合伙人请联系客服微信，您的推荐码: <span style={{ color: "red" }}>{referralCode}</span>,您可点击<a href="https://auto.yunai.com.cn/#/my" target="_blank"><span style={{ color: "red" }}>个人信息及返现</span></a>查看。
          程序员推荐使用价格低廉的纯GPT如果您订购的是第一个纯GPT产品，请点击切换至<a href="https://auto.yunai.com.cn/#/ai" target="_blank"><span style={{ color: "red" }}>纯GPT</span></a>模式。
        </div>
        <div className={styles["sidebar-sub-title"]}>关注公众号，服务不失踪</div>
        <div className={styles["sidebar-sub-title"]}><img src="https://yunaichatgpt.oss-rg-china-mainland.aliyuncs.com/static/img/yazb.bmp" alt="芸爱智宝" width="270" height="100"/></div>
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"] + " " + styles.mobile}>
            <IconButton
              icon={<CloseIcon />}
              onClick={() => {
                if (confirm(Locale.Home.DeleteChat)) {
                  chatStore.deleteSession(chatStore.currentSessionIndex);
                }
              }}
            />
          </div>
          <div className={styles["sidebar-action"]}>
            <Link to={Path.Settings}>
              <IconButton icon={<SettingsIcon />} shadow />
            </Link>
          </div>
          <div className={styles["sidebar-action"]}>
            <IconButton
              icon={<GithubIcon />}
              text={'充值'}
              onClick={() => {
                if (window.top !== null && window.top !== undefined) {
                  window.top.location.href = "https://auto.yunai.com.cn/#/pay";
                }
              }}
            />
          </div>
        </div>
        <div>
          <IconButton
            icon={<AddIcon />}
            text={'纯GPT'}
            onClick={() => {
              if (window.top !== null && window.top !== undefined) {
                window.top.location.href = "https://auto.yunai.com.cn/#/ai";
              }
            }}
            shadow
          />
        </div>
        <div>
          <IconButton
            icon={<AddIcon />}
            text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}
            shadow
          />
        </div>
      </div>

      <div
        className={styles["sidebar-drag"]}
        onMouseDown={(e) => onDragMouseDown(e as any)}
      ></div>
    </div>
  );
}
