import { useMemo } from 'react';
import { Layout, Menu, Spin } from 'antd';
import { SunOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router';
import SiderNav from '@/layouts/BasicLayout/components/siderNav';
import CHeader from '@/layouts/BasicLayout/components/header';
import styles from './index.module.less';
import { useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';
import ErrorBoundary from '@/components/ErrorBoundary';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

interface Props {
  route?: any;
}

const BasicLayout = (props: any) => {
  const { children, route } = props;
  const { loading, projectList } = useSelector((state: IRootActions) => state);
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
    <div className={styles.basicLayoutWrapper}>
      <CHeader />
      <ErrorBoundary>
        <Spin spinning={loading} tip={<div style={{ fontSize: 16, fontWeight: 'bold' }}>数据加载中...</div>} percent="auto" indicator={<SunOutlined style={{ fontSize: 40 }} spin />}>
          <Layout>
            {ifShowSiderNav ? <SiderNav /> : null}
            <Layout className="basic-layout">
              <Content className="basic-layout-content">{children}</Content>
            </Layout>
          </Layout>
        </Spin>
      </ErrorBoundary>
    </div>
  );
};

export default BasicLayout;
