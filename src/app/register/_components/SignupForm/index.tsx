"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/client";

import styles from "./styles.module.css";

export default function SignupForm() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const trimmedDisplayName = displayName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedDisplayName) {
      setErrorMessage("表示名を入力してください。");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("メールアドレスを入力してください。");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("パスワードは8文字以上で入力してください。");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("確認用パスワードが一致していません。");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            display_name: trimmedDisplayName,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);

        setErrorMessage("新規登録に失敗しました。");

        return;
      }

      // メール認証なしの場合
      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }

      // メール認証ありの場合
      setSuccessMessage(
        "確認メールを送信しました。メール内のリンクから登録を完了してください。",
      );

      setPassword("");
      setPasswordConfirmation("");
    } catch (error) {
      console.error("Signup error:", error);

      setErrorMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSignup}>
      <Input
        id="displayName"
        name="displayName"
        label="表示名"
        type="text"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="表示名を入力"
        maxLength={30}
        disabled={isLoading}
        required
      />

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
        placeholder="8文字以上"
        autoComplete="new-password"
        minLength={8}
        disabled={isLoading}
        required
      />

      <Input
        id="passwordConfirmation"
        name="passwordConfirmation"
        label="パスワード（確認）"
        type="password"
        value={passwordConfirmation}
        onChange={(event) => setPasswordConfirmation(event.target.value)}
        placeholder="もう一度入力してください"
        autoComplete="new-password"
        minLength={8}
        disabled={isLoading}
        required
      />

      {errorMessage && (
        <p role="alert" className={styles.errorMessage}>
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p role="status" className={styles.successMessage}>
          {successMessage}
        </p>
      )}

      <SubmitButton isLoading={isLoading} loadingText="登録中...">
        新規登録
      </SubmitButton>

      <p className={styles.loginGuide}>
        すでにアカウントをお持ちの方
        <Link href="/login">ログイン</Link>
      </p>
    </form>
  );
}
