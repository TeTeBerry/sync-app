import "./AvatarGroup.scss";
import React from "react";

interface AvatarGroupProps {
  avatars?: string[];
  max?: number;
  total?: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars = ["https://i.pravatar.cc/150?u=1", "https://i.pravatar.cc/150?u=2", "https://i.pravatar.cc/150?u=3"],
  max = 3,
  total = 70,
}) => {
  const displayAvatars = avatars.slice(0, max);
  const remaining = total - displayAvatars.length;

  return (
    <div data-cmp="AvatarGroup" className="s-avatar-group">
      <div className="s-avatar-group__pile">
        {displayAvatars.map((url, i) => (
          <img key={url + i} src={url} alt="" className="s-avatar-group__avatar" />
        ))}
      </div>
      {remaining > 0 && (
        <span className="s-avatar-group__count">
          {total} 参与
        </span>
      )}
    </div>
  );
};

export default AvatarGroup;
