import React from "react";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/BottomNav";
import TopBar from "../../components/TopBar";

const Profile: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="s-page-shell">
      <TopBar />
      <div className="s-page-shell__muted-center">{t("profile.developing")}</div>
      <BottomNav />
    </div>
  );
};

export default Profile;
