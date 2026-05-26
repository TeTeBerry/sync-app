import "./AvatarGroup.scss";
import React from "react";
import { ACTIVITY_GUEST_AVATARS } from "../constants/activityGuestAvatars";

interface AvatarGroupProps {
  avatars?: string[];
  max?: number;
  total?: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars = ACTIVITY_GUEST_AVATARS,
  max = 3,
  total = 70,
}) => {
  const displayAvatars = avatars.slice(0, max);

  return (
    <div data-cmp="AvatarGroup" className="s-avatar-group">
      <div className="s-avatar-group__pile">
        {displayAvatars.map((url, i) => (
          <img key={url + i} src={url} alt="" className="s-avatar-group__avatar" />
        ))}
      </div>
      {total > 0 ? (
        <span className="s-avatar-group__count">
          {total.toLocaleString()} 参与
        </span>
      ) : null}
    </div>
  );
};

export default AvatarGroup;
