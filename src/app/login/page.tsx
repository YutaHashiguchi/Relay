import AuthBook from "@/components/AuthBook";

import LoginForm from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <AuthBook
      eyebrow="Enter the Story"
      title="ログイン"
      description="Re:layのアカウント情報を入力してください。"
    >
      <LoginForm />
    </AuthBook>
  );
}
