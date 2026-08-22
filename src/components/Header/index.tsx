"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tangerine } from "next/font/google";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import styles from "./styles.module.css";

const tangerine = Tangerine({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

const supabase = createClient();

export default function Header() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsLoggedIn(Boolean(user));
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    setIsLoggedIn(false);

    router.push("/");
    router.refresh();
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={`${styles.logo} ${tangerine.className}`}>
          Re:lay
        </Link>

        <nav className={styles.navigation}>
          <Link href="/stories" className={styles.navLink}>
            作品を探す
          </Link>

          {isLoggedIn === true && (
            <>
              <Link href="/stories/new" className={styles.navLink}>
                物語を書く
              </Link>

              <Link href="/mypage" className={styles.navLink}>
                マイページ
              </Link>

              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                ログアウト
              </button>
            </>
          )}

          {isLoggedIn === false && (
            <div className={styles.authArea}>
              <Link href="/login" className={styles.loginLink}>
                ログイン
              </Link>

              <Link href="/register" className={styles.registerLink}>
                新規登録
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
