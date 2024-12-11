import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Badge,
  Button,
  message,
  Modal,
  Tour,
  Upload,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash-es';
import {
  getUserAuthList,
  guid,
} from '@/utils/utils';
import styles from './index.module.less';
import ProjectApi from '@/api/project';
import PrimaryTitle from '@/components/PrimaryTitle';
import { addParamsService, } from '@/services/flowEditor';
import tipIcon from '@/assets/imgs/tip.svg';
import postmanIcon from '@/assets/imgs/postman.svg';
import moment from 'moment';
import {
  ApartmentOutlined, BugFilled, FieldTimeOutlined, FolderAddOutlined, FolderOpenOutlined, FolderOutlined, LaptopOutlined, PlusOutlined, ProjectOutlined
} from '@ant-design/icons';
import TooltipDiv from '@/components/TooltipDiv';
import icon1 from '../../assets/home/机械臂1.png';
import icon2 from '../../assets/home/机械臂2.png';
import icon3 from '../../assets/home/机械臂3.png';
import icon4 from '../../assets/home/机械臂4.png';
import { dpmDomain } from '@/utils/fetch';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';


const { confirm } = Modal;

interface Props { }
const tipList = [
  '请关闭所有网络适配器的省电模式，防止相机或其他通讯异常',
]

const Home: React.FC<Props> = (props: any) => {
  const { loading, projectList, getProjectListFun } = useSelector((state: IRootActions) => state);
  const navigate = useNavigate();
  const userAuthList = getUserAuthList();
  const { ipcRenderer }: any = window || {};
  const homeRef = useRef<any>({});

  const [tourOpen, setTourOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState<any>([]);
  const [softwareList, setSoftwareList] = useState([]);
  const [tipNum, setTipNum] = useState(0);
  const [caseVisible, setCaseVisible] = useState(false);
  const [caseList, setCaseList] = useState([
    { name: '3D视觉引导钢板切割下料', icon: icon1, description: '视觉引导机器人识别并依次吸取不同品规的钢板切割件，置于传送带上，传送至下一工位。机器人识别并抓取传送带上的切割件，按品规分类，堆叠码放于料框中。' },
    { name: '3D视觉引导大小阀块抓取上料', icon: icon2, description: '视觉系统识别定位阀块，引导机器人进行抓取，运输到指定位置进行上料。' },
    { name: '3D视觉引导链轨节深框抓取上料', icon: icon3, description: '视觉系统识别定位深框中堆叠放置的链轨节，引导机器人逐一抓取并二次识别正反，搭配翻转台以固定姿态放置于指定位置。' },
    { name: '3D视觉引导螺栓拧紧', icon: icon4, description: '3D视觉高精度定位螺栓位置，引导机器人完成拧紧。' },
    { name: '3D视觉引导螺栓拧紧', icon: icon4, description: '3D视觉高精度定位螺栓位置，引导机器人完成拧紧。' },
    { name: '3D视觉引导螺栓拧紧', icon: icon4, description: '3D视觉高精度定位螺栓位置，引导机器人完成拧紧。' }
  ]);

  useEffect(() => {
    // 新手引导-只有第一次进来才开启引导
    if (!loading && !!localStorage.getItem('ubvision-tour-slider') && !localStorage.getItem('ubvision-tour-home')) {
      setTourOpen(true);
      setTourSteps([
        {
          title: 'tips提示',
          description: 'tips提示',
          target: homeRef.current['tip'],
        },
        {
          title: '快捷操作',
          description: '快捷操作',
          target: homeRef.current['operation'],
        },
        {
          title: '最近的方案',
          description: '最近的方案',
          target: homeRef.current['projects'],
        },
        {
          title: '常用工具',
          description: '常用工具',
          target: homeRef.current['tools'],
        },
        {
          title: '帮助文档',
          description: '帮助文档',
          target: homeRef.current['markdown'],
        }
      ]);
    };
  }, [loading, localStorage.getItem('ubvision-tour-slider')]);
  useEffect(() => {
    ProjectApi.getStorage('softwareStorage').then((res: any) => {
      if (!!res && res.code === 'SUCCESS' && !_.isEmpty(res.data)) {
        const { list = [] } = res.data;
        setSoftwareList((list || [])?.map?.((item: any) => {
          return {
            ...item,
            id: guid(),
          }
        })?.filter((i: any) => !!i?.collected));
      }
    });
    let timer = setInterval(() => {
      setTipNum(pre => pre + 1);
    }, 5000);

    return () => {
      !!timer && clearInterval(timer);
    }
  }, []);
  // 导入项目
  const uploadProps = {
    accept: '.json',
    showUploadList: false,
    multiple: true,
    beforeUpload(file: any) {
      const reader = new FileReader(); // 创建文件对象
      reader.readAsText(file); // 读取文件的内容/URL
      reader.onload = (res: any) => {
        const {
          target: { result },
        } = res;
        try {
          const data = _.omit(_.omit(_.omit(JSON.parse(result), 'id'), 'alertShow'), 'running');
          addParamsService(data).then((res) => {
            if (
              !!res &&
              res.code === 'SUCCESS' &&
              !!res.data &&
              !!res.data?.id
            ) {
              getProjectListFun?.();
              ipcRenderer?.ipcCommTest(
                'alert-open-browser',
                JSON.stringify({
                  type: 'flow',
                  id: res.data?.id,
                })
              );
            } else {
              message.error(res?.message || res?.msg || '接口异常');
            }
          });
        } catch (err) {
          message.error('json文件格式错误，请修改后上传。');
          console.error(err);
        }
      };
      return false;
    },
  };

  return (
    <div className={`${styles.homePage}`}>
      <PrimaryTitle title="UBVISION  STUDIO" style={{ marginBottom: 8 }}></PrimaryTitle>
      <div className="flex-box-column home-body">
        <div className="flex-box home-body-top" ref={(element: any) => {
          return (homeRef.current['tip'] = element);
        }}>
          <img src={tipIcon} alt="" className='home-body-top-icon' />
          Tips:
          &nbsp;
          <div>
            {tipList[tipNum % tipList?.length]}
          </div>
          &nbsp;
          <div className="home-body-top-link" onClick={() => {
            // window.open('http://www.baidu.com');
          }}>详情</div>
        </div>
        <div className="flex-box-start home-body-bottom">
          <div className="home-body-bottom-left">
            <h1 className='home-body-bottom-title' ref={(element: any) => {
              return (homeRef.current['operation'] = element);
            }}>快捷操作</h1>
            <div className="flex-box home-body-bottom-left-operation">
              <Button
                type="text"
                icon={<FolderAddOutlined className='home-body-bottom-icon' />}
                onClick={() => {
                  ipcRenderer?.ipcCommTest(
                    'alert-open-browser',
                    JSON.stringify({
                      type: 'flow',
                      id: 'new'
                    })
                  );
                }}>新建方案</Button>
              <Upload {...uploadProps}>
                <Button
                  type="text"
                  icon={<FolderOpenOutlined className='home-body-bottom-icon' />}
                >打开方案</Button>
              </Upload>
              <Button
                type="text"
                icon={<ProjectOutlined className='home-body-bottom-icon' />}
                onClick={() => {
                  setCaseVisible(true);
                  // getCaseListService().then((res: any) => {
                  //   if (!!res && res.code === 'SUCCESS') {
                  //     setCaseList(res.data);
                  //   } else {
                  //     message.error(res?.message || '接口异常');
                  //   }
                  // });
                }}>打开案例库</Button>
            </div>
            <h1 className='home-body-bottom-title' ref={(element: any) => {
              return (homeRef.current['projects'] = element);
            }}>最近的方案</h1>
            <div className="home-body-bottom-left-list">
              {
                (projectList?.slice(0, 5) || [])?.map((item: any, index: number) => {
                  const { name, id, running, plugin_dir, updatedAt } = item;
                  return <div
                    key={`home-body-bottom-left-list-item-${index}`}
                    className="home-body-bottom-left-list-item"
                    onClick={() => {
                      if (userAuthList.includes('projects.modify')) {
                        ipcRenderer?.ipcCommTest(
                          'alert-open-browser',
                          JSON.stringify({
                            type: 'flow',
                            id
                          })
                        );
                      }
                    }}
                  >
                    <div className="flex-box home-body-bottom-left-list-item-name">
                      {running ? <Badge color="green" /> : null}
                      {name}
                    </div>
                    <div className="flex-box home-body-bottom-left-list-item-time">
                      <FieldTimeOutlined />
                      {moment(new Date(updatedAt)).format('YYYY-MM-DD HH:mm:ss')}
                    </div>
                    <div className="flex-box home-body-bottom-left-list-item-time">
                      <FolderOutlined />
                      {plugin_dir || '-'}
                    </div>
                  </div>
                })
              }
            </div>
          </div>
          <div className="home-body-bottom-line" />
          <div className="home-body-bottom-right">
            {/* <h1 className='home-body-bottom-title'>发布的应用</h1>
            <div className="flex-box home-body-bottom-right-project-list">

            </div> */}
            <h1 className='home-body-bottom-title' ref={(element: any) => {
              return (homeRef.current['tools'] = element);
            }}>常用工具</h1>
            <div className="flex-box home-body-bottom-right-project-list">
              {
                softwareList?.length ?
                  (softwareList || [])?.slice(0, 3)?.map((item: any, index: number) => {
                    const { id, type, value, alias, name, icon, collected } = item;
                    return <div
                      className="flex-box-column home-body-bottom-right-project-list-item"
                      key={`flex-box-column home-body-bottom-right-project-list-item-${index}`}
                      onClick={() => {
                        if (type === 'web') {
                          ipcRenderer.ipcCommTest('alert-open-browser', JSON.stringify({
                            type: 'software',
                            url: value,
                            id
                          }));
                        } else if (type === 'electron') {
                          ipcRenderer.ipcCommTest('startup-software', value);
                        }
                      }}
                    >
                      <div className='flex-box-center home-body-bottom-right-project-list-item-icon'>
                        {
                          !!icon ?
                            <img
                              src={`${dpmDomain}file_browser${icon?.indexOf('/') === 0 ? '' : '/'}${icon}`}
                              alt="logo"
                            />
                            :
                            formatIcon(value + name)
                        }
                      </div>
                      <div>{alias || '-'}</div>
                      {name || '-'}
                    </div>
                  })
                  :
                  <div
                    className="flex-box-column home-body-bottom-right-project-list-item"
                    key={`flex-box-column home-body-bottom-right-project-list-item`}
                    onClick={() => {
                      navigate('/software');
                    }}
                  >
                    <div className='flex-box-center home-body-bottom-right-project-list-item-icon' style={{ marginBottom: 0 }}>
                      <PlusOutlined style={{ fontSize: 24 }} />
                    </div>
                  </div>
              }
            </div>
            <h1 className='home-body-bottom-title' ref={(element: any) => {
              return (homeRef.current['markdown'] = element);
            }}>帮助文档</h1>
            <div className="flex-box-column home-body-bottom-right-document-list">
              {
                [
                  { label: '快速入门', value: 'quickStart' },
                  { label: '通用插件介绍', value: 'pluginIntroduction' },
                  { label: '了解基础知识', value: 'basicKnowledge' },
                  { label: '进阶使用技巧', value: 'usageSkills' }
                ]?.map((item: any, index: number) => {
                  const { label, value } = item;
                  return <a
                    className="flex-box home-body-bottom-right-document-list-item"
                    key={`home-body-bottom-right-document-list-item-${value}`}
                    onClick={() => {
                      // message.destroy();
                      // message.info('功能开发中，敬请期待。');
                      ipcRenderer.ipcCommTest(
                        'alert-open-browser',
                        JSON.stringify({
                          type: 'markdown',
                          id: value,
                        })
                      );
                    }}
                  >
                    {label}
                  </a>
                })
              }
            </div>
          </div>
        </div>
      </div>
      <Tour open={tourOpen} onClose={() => {
        setTourOpen(false);
        // 引导完，存在本地缓存，下次就不做引导了
        localStorage.setItem('ubvision-tour-home', 'true');
      }} steps={tourSteps} />
      {
        caseVisible ?
          <Modal
            title={`案例库`}
            width="calc(100vw - 48px)"
            wrapClassName="full-screen-modal case-list-modal"
            centered
            open={caseVisible}
            maskClosable={false}
            getContainer={false}
            footer={null}
            onCancel={() => { setCaseVisible(false) }}
          >
            <div className="flex-box case-body">
              {
                (caseList || [])?.map((item: any, index: number) => {
                  const { id, icon, name, description } = item;
                  return <div
                    className="case-item-box"
                    key={`case-item-box-${index}`}
                    onClick={() => {
                      message.destroy();
                      message.info('功能开发中，敬请期待。')
                      console.log(item);
                      return;
                      ipcRenderer.ipcCommTest(
                        'alert-open-browser',
                        JSON.stringify({
                          type: 'case',
                          id: id || guid(),
                        })
                      );
                      return;
                      addParamsService(item).then((res) => {
                        if (
                          !!res &&
                          res.code === 'SUCCESS' &&
                          !!res.data &&
                          !!res.data?.id
                        ) {
                          ipcRenderer?.ipcCommTest(
                            'alert-open-browser',
                            JSON.stringify({
                              type: 'flow',
                              id: res.data?.id,
                            })
                          );
                        } else {
                          message.error(res?.message || res?.msg || '接口异常');
                        }
                      });
                    }}
                  >
                    <div className="flex-box-center case-item-box-img">
                      {!!icon ? <img src={icon} alt="logo" /> : null}
                      <div className="flex-box-center case-item-box-img-info">
                        {description}
                      </div>
                    </div>
                    <TooltipDiv className="case-item-box-title">
                      {name}
                    </TooltipDiv>
                  </div>
                })
              }
            </div>
          </Modal>
          : null
      }
    </div>
  );
};

export default Home;

const formatIcon = (link: string) => {
  if (link?.indexOf('ssist') > -1) {
    return <ApartmentOutlined style={{ fontSize: 24 }} />
  } else if (link?.indexOf('niffer') > -1) {
    return <LaptopOutlined style={{ fontSize: 24 }} />
  } else if (link?.indexOf('ostman') > -1) {
    return <img src={postmanIcon} alt="" />
  } else {
    return <BugFilled style={{ fontSize: 24 }} />
  }
}