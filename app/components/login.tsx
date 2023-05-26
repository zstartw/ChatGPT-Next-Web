"use client";

import Locale from "../locales";
import { IconButton } from "./button";
import SendWhiteIcon from "../icons/send-white.svg";
import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import styles from "./home.module.scss";

import { Link, useNavigate } from "react-router-dom";

import "./login.module.scss";

import { useAccessStore } from "../store";

import { Path, UPDATE_URL } from "../constant";

import { Button, Checkbox, Form, Input } from "antd";
import { showToast } from "./ui-lib";
import { Route } from "react-router-dom";

export function Login() {
  const accessStore = useAccessStore();

  // const navigate = useNavigate();

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const onFinish = (values: any) => {
    console.log("Success:", values);

    // let param = {
    //   email: values.username,
    //   password: values.password
    // };

    let email = values.username;
    let password = values.password;

    let loginPath =
      "/api/normalLogin?name=" + email + "&pwd=" + password + "&name=" + email;
    fetch(loginPath, {
      method: "get",
    })
      .then((res) => res.json())
      .then((res) => {
        let result = JSON.parse(res);
        console.log(result);

        if (result.code == 200) {
          accessStore.updateLoginToken("zhengwu");

          window.location.reload();
        }
        showToast(result.msg);
      })
      .catch(() => {
        console.error("[Config] failed to fetch config");
      })
      .finally(() => {});
  };

  const App = (
    <Form
      name="basic"
      initialValues={{ remember: true, size: "large" }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input size="large" type="email" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password size="large" className={styles["input"]} />
      </Form.Item>

      {/* <Form.Item
        name="remember"
        valuePropName="checked"
        wrapperCol={{ offset: 8, span: 16 }}
      >
        <Checkbox >Remember me</Checkbox>
      </Form.Item> */}

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button size="large" type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );

  return App;

  return (
    <div>
      <input type={"text"} placeholder={"请输入用户名"} />
      <input type={"password"} placeholder={"请输入密码"} />
      <IconButton
        icon={<SendWhiteIcon />}
        bordered
        text={"登录"}
        onClick={() => {
          <dialog title="123"></dialog>;

          // accessStore.updateLoginToken("123");

          // let host = 'http://localhost:8099/login'
          let host = "api/login";
          let body = "username=suncent&password=123456&rememberMe=false";

          fetch(host, {
            method: "post",
            body: body,
          })
            .then((res) => res.json())
            .then((res: DangerConfig) => {
              console.log("[Config] got config from server", res);
            })
            .catch(() => {
              console.error("[Config] failed to fetch config");
            })
            .finally(() => {});
        }}
      />
      ,
    </div>
  );
}
