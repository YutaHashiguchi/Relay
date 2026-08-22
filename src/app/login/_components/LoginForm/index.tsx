"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/client";

import styles from "./styles.module.css";

const supabase = createClient();

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error(error);

        setErrorMessage("メールアドレスまたはパスワードが正しくありません。");

        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "通信に失敗しました。時間を置いてもう一度お試しください。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleLogin}>
      <Input
        id="email"
        name="email"
        label="メールアドレス"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="example@email.com"
        autoComplete="email"
        disabled={isLoading}
        required
      />

      <Input
        id="password"
        name="password"
        label="パスワード"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="パスワードを入力"
        autoComplete="current-password"
        disabled={isLoading}
        required
      />

      {errorMessage && (
        <p role="alert" className={styles.errorMessage}>
          {errorMessage}
        </p>
      )}

      <SubmitButton isLoading={isLoading} loadingText="ログイン中...">
        ログイン
      </SubmitButton>

      <p className={styles.registerGuide}>
        アカウントをお持ちでない方
        <Link href="/register">新規登録</Link>
      </p>
    </form>
  );
}
