import React, { useMemo, useRef } from 'react';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { GetQueryObj } from '@/utils/utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props { }

const MarkdownRouter: React.FC<Props> = (props: any) => {
  const { ipcRenderer }: any = window || {};
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const id = params?.['id'];
  const number = params?.['number'];

  const markdownValue = useMemo(() => {
    switch (id) {
      case "quickStart":
        return `# 快速入门
        A paragraph with *emphasis* and **strong importance**.
        > A block quote with ~strikethrough~ and a URL: https://reactjs.org.
        * Lists
        * [ ] todo
        * [x] done
        
        A table:
        
        | a | b |
        | - | - |
        `;
      case "pluginIntroduction":
        return `# 通用插件介绍

`;
      case "basicKnowledge":
        return `# 了解基础知识

`;
      case "usageSkills":
        return `# 进阶使用技巧

`;
    }
  }, [id]);

  return (
    <div className={`${styles.markdownPage}`}>
      <Markdown remarkPlugins={[remarkGfm]}>{markdownValue}</Markdown>
    </div >
  );
};

export default MarkdownRouter;
