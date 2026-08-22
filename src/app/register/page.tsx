import AuthBook from "@/components/AuthBook";

import SignupForm from "./_components/SignupForm";

export default function SignupPage() {
  return (
    <AuthBook
      eyebrow="Begin Your Story"
      title="新規登録"
      description="Re:layに参加するための情報を入力してください。"
    >
      <SignupForm />
    </AuthBook>
  );
}
