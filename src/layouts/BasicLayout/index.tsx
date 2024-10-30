import { Fragment, useMemo } from 'react';
import { Layout, Menu } from 'antd';
import { useLocation } from 'react-router';
import SiderNav from '@/layouts/BasicLayout/components/siderNav';
import CHeader from '@/layouts/BasicLayout/components/header';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

interface Props {
  route?: any;
}

const BasicLayout = (props: any) => {
  const { children, route } = props;
  const location = useLocation();
  const { pathname = '/home' } = location;
  // 某些模块不需要展示侧边栏
  const ifShowSiderNav = useMemo(() => {
    return (
      pathname?.indexOf('/flow') < 0 &&
      pathname?.indexOf('/ccd') < 0 &&
      pathname !== '/login'
    );
  }, [pathname]);

  return (
    <Fragment>
      <CHeader />
      <Layout>
        {ifShowSiderNav ? <SiderNav /> : null}
        <Layout className="basic-layout">
          <Content className="basic-layout-content">{children}</Content>
        </Layout>
      </Layout>
    </Fragment>
  );
};

export default BasicLayout;
