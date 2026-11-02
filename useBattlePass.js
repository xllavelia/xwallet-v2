import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "./apiClient";

function useRemote(path, intervalMs) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const alive = useRef(true);

    const refresh = useCallback(async (silent) => {
        if (!silent) setLoading(true);
        try {
            const next = await authFetch(path);
            if (!alive.current) return next;
            setData(next);
            setError("");
            return next;
        } catch (e) {
            if (alive.current) setError(e && e.message ? e.message : "Could not load");
            throw e;
        } finally {
            if (alive.current && !silent) setLoading(false);
        }
    }, [path]);

    useEffect(() => {
        alive.current = true;
        refresh(false).catch(function () {});
        const onFocus = function () { refresh(true).catch(function () {}); };
        window.addEventListener("focus", onFocus);
        const id = window.setInterval(function () {
            refresh(true).catch(function () {});
        }, intervalMs || 45000);
        return function () {
            alive.current = false;
            window.removeEventListener("focus", onFocus);
            window.clearInterval(id);
        };
    }, [refresh, intervalMs]);

    return { data, loading, error, refresh };
}

export function useBattlePass() {
    const remote = useRemote("/battlepass", 45000);
    const refresh = remote.refresh;

    const purchasePass = useCallback(async function () {
        const result = await authFetch("/battlepass/pass", { method: "POST" });
        await refresh(true);
        return result;
    }, [refresh]);

    const claimReward = useCallback(async function (level, track) {
        const result = await authFetch("/battlepass/claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ level: level, track: track })
        });
        await refresh(true);
        return result;
    }, [refresh]);

    const openCase = useCallback(function (tokenId) {
        return authFetch("/battlepass/case/open", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tokenId: tokenId })
        });
    }, []);

    return {
        data: remote.data,
        loading: remote.loading,
        error: remote.error,
        refresh: refresh,
        purchasePass: purchasePass,
        claimReward: claimReward,
        openCase: openCase
    };
}

export function useQuests() {
    const remote = useRemote("/battlepass/quests", 45000);
    const refresh = remote.refresh;

    const claimQuest = useCallback(async function (questId) {
        const result = await authFetch("/battlepass/quests/claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questId: questId })
        });
        await refresh(true);
        return result;
    }, [refresh]);

    const purchasePass = useCallback(async function () {
        const result = await authFetch("/battlepass/pass", { method: "POST" });
        await refresh(true);
        return result;
    }, [refresh]);

    return {
        data: remote.data,
        loading: remote.loading,
        error: remote.error,
        refresh: refresh,
        claimQuest: claimQuest,
        purchasePass: purchasePass
    };
}