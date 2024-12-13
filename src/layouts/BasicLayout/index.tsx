import { useEffect, useMemo } from 'react';
import { Button, Dropdown, Layout, Menu, Spin } from 'antd';
import { SunOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router';
import SiderNav from '@/layouts/BasicLayout/components/siderNav';
import CHeader from '@/layouts/BasicLayout/components/header';
import styles from './index.module.less';
import { useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';
import ErrorBoundary from '@/components/ErrorBoundary';
import { GetQueryObj } from '@/utils/utils';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

interface Props {
  route?: any;
}

const BasicLayout = (props: any) => {
  const { children, route } = props;
  const { loading, projectList, canvasData } = useSelector((state: IRootActions) => state);
  const params: any = !!window.location.search
    ? GetQueryObj(window.location.search)
    : !!window.location.href
      ? GetQueryObj(window.location.href)
      : {};
  const number = [undefined, 'undefined'].includes(params?.['number']) ? 1 : params?.['number'];
  const location = useLocation();
  const { pathname = '/home' } = location;

  // 某些模块不需要展示侧边栏
  const ifShowSiderNav = useMemo(() => {
    return (
      pathname?.indexOf('/flow') < 0 &&
      pathname?.indexOf('/ccd') < 0 &&
      pathname !== '/login' &&
      pathname?.indexOf('/softwareopen') < 0 &&
      pathname?.indexOf('/markdown') < 0 &&
      pathname?.indexOf('/case') < 0
    );
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: any) => {
      if (e.code === "F12") {
        window?.ipcRenderer?.invoke(`openDevTools-${number}`);
      } else if (e.code === "F5") {
        window.location.reload();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className={`flex-box-column ${styles.basicLayoutWrapper}`}>
      <CHeader />
      <ErrorBoundary>
        <div className='flex-box' style={{ height: '100%' }}>
          {ifShowSiderNav ? <SiderNav /> : null}
          <div style={{
            width: ifShowSiderNav ? `calc(100% - 68px)` : '100%',
            height: '100%'
          }}>
            <Spin
              spinning={loading}
              tip={<div style={{ fontSize: 16, fontWeight: 'bold' }}>数据加载中...</div>}
              percent="auto"
              indicator={<SunOutlined style={{ fontSize: 40 }} spin />}
            >
              <Layout className="basic-layout">
                <Content className="basic-layout-content">{children}</Content>
              </Layout>
            </Spin>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default BasicLayout;
