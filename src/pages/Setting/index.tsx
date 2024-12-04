import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SettingLayout from '@/pages/Setting/components/layouts';
import GeneralPage from '@/pages/Setting/components/General';
import AboutPage from '@/pages/Setting/components/About';

interface Props {
  setEmpowerVisible: any;
}

const SettingPage: React.FC<Props> = (props: any) => {
  const { setEmpowerVisible } = props;
  return (
    <SettingLayout>
      <Routes>
        <Route
          path="/"
          element={<GeneralPage />}
        />
        <Route
          path="/general"
          element={<GeneralPage />}
        />
        <Route
          path="/about"
          element={<AboutPage setEmpowerVisible={setEmpowerVisible} />}
        />
      </Routes>
    </SettingLayout>
  );
};
export default SettingPage;
