import { useEffect } from "react";
import { useProfilePindanQuery } from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { loadMyPindanItems } from "../../utils/myPindanStorage";
import { myPinDanEvents } from "../../pages/profile/mockData";
import { usePindanSessionStore } from "../pindanSessionStore";

/** 将 API / 本地缓存的「我的拼单」同步到全局 joinedIds */
export function useSyncJoinedPindanIds() {
  const profilePindanQuery = useProfilePindanQuery();
  const setJoinedIds = usePindanSessionStore((state) => state.setJoinedIds);

  useEffect(() => {
    if (isApiEnabled()) {
      if (profilePindanQuery.data) {
        setJoinedIds(profilePindanQuery.data.map((item) => item.id));
      }
      return;
    }

    setJoinedIds(loadMyPindanItems(myPinDanEvents).map((item) => item.id));
  }, [profilePindanQuery.data, setJoinedIds]);
}
