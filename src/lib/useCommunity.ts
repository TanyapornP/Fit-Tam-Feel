import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import * as api from "./api";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import type { Post, PublicCard } from "./types";

/** ข้อมูลชุมชน — โหลดใหม่ทุกครั้งที่เปิดหน้าจอ (useFocusEffect) */
export function useCommunity() {
  const { userId } = useAuth();
  const { reloadNotifs } = useData();
  const [data, setData] = useState<api.CommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .fetchCommunity()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      reloadNotifs();
    }, [load]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const me = userId ?? "";
  const follows = data?.follows ?? [];
  const followingOf = (id: string) => new Set(follows.filter((f) => f.follower === id).map((f) => f.following));
  const followersOf = (id: string) => follows.filter((f) => f.following === id).map((f) => f.follower);
  const card = (id: string): PublicCard =>
    data?.cards[id] ?? { id, username: null, avatar_url: null, bio: null, current_streak: 0 };

  /** ทำคำสั่ง แล้วโหลดฟีดใหม่ ถ้าพังให้แสดงข้อความ */
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      setError(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return {
    me,
    loading: loading && !data,
    refreshing: loading && !!data,
    error,
    busy,
    reload: load,
    posts: data?.posts ?? ([] as Post[]),
    cards: data?.cards ?? {},
    card,
    followingOf,
    followersOf,
    toggleFollow: (target: string) => run(() => api.setFollow(me, target, !followingOf(me).has(target))),
    toggleCheer: (p: Post) => run(() => api.setCheer(p.id, me, !p.likes.includes(me))),
    comment: (p: Post, text: string, parentId?: string) => run(() => api.addComment(p.id, text, parentId)),
    removeComment: (id: string) => run(() => api.deleteComment(id)),
    remove: (p: Post) => run(() => api.deletePost(p.id)),
    createPost: (input: Parameters<typeof api.createPost>[1]) => run(() => api.createPost(me, input)),
  };
}

export type Community = ReturnType<typeof useCommunity>;
