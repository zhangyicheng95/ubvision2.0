/**
 * 适用于不需要大量数据处理的应用部分
 * repo：https://github.com/louischatriot/nedb
 * 中文 doc：https://www.w3cschool.cn/nedbintro/
 */


import path from 'path';

import Nedb from 'nedb';

import { userPath } from '../types/global';

type QueryDB<T> = {
  [K in keyof T]?: T[K];
};

class DB<T = any> {
  $db: Nedb<Nedb.DataStoreOptions>;

  /**
   * 数据库初始化
   * @param dbName
   */
  constructor (dbName: string) {
    const dbPath = path.join(userPath, `db/${dbName}.db`);
    this.$db =  new Nedb({
      autoload: true,
      filename: dbPath,
      timestampData: true
    })
  }


  /**
   * 分页查找
   * https://github.com/louischatriot/nedb#sorting-and-paginating
   * @returns
   * @param query
   */
  paging (query: { pageNum: number; pageSize: number; desc: boolean }): Promise<any> {
    const { pageNum = 1, pageSize = 10, desc = true } = query || {};

    return new Promise((resolve) => {
      this.$db
        .find({})
        .sort({ createdAt: desc ? -1 : 1 })
        .skip(pageNum * pageSize - pageSize)
        .limit(pageSize)
        .exec((err, result) => {
          resolve(result);
        });
    });
  }

  /**
   * 新增某项
   * https://github.com/louischatriot/nedb#inserting-documents
   * @param doc
   * @returns
   */
  insert (doc: any): Promise<any> {
    return new Promise((resolve: (value: any) => void) => {
      this.$db.insert(doc, (error: Error | null, document: any) => {
        if (!error) {
          resolve(document);
        }
      });
    });
  }

  /**
   * 寻找某项并排序
   * @param query
   * @param desc
   * @returns
   */
  find (query: QueryDB<T> = {}, desc = true): Promise<any> {
    return new Promise((resolve) => {
      this.$db
        .find(query)
        .sort({ createdAt: desc ? -1 : 1 })
        .exec((e, d) => {
          resolve(d);
        });
    });
  }

  /**
   * 寻找某一个项
   * https://github.com/louischatriot/nedb#finding-documents
   * @param query
   * @returns
   */
  findOne (query: QueryDB<T> = {}): Promise<any> {
    return new Promise((resolve: (value: T) => void) => {
      this.$db.findOne(query, (error: Error | null, document) => {
        if (!error) {
          resolve(document as T);
        }
      });
    });
  }

  /**
   * 删除数据库项
   * https://github.com/louischatriot/nedb#removing-documents
   * @param query
   * @param options
   * @returns
   */
  remove (query: QueryDB<T>, options: Nedb.RemoveOptions = {}): Promise<any> {
    return new Promise((resolve: (value: number) => void) => {
      this.$db.remove(query, options, (error: Error | null, n: number) => {
        if (!error) {
          resolve(n);
        }
      });
    });
  }

  /**
   * 更新数据库项
   * https://github.com/louischatriot/nedb#updating-documents
   * @param query
   * @param updateQuery
   * @param options
   * @returns
   */
  update (query: unknown, updateQuery: unknown, options: Nedb.UpdateOptions = {}): Promise<any> {
    return new Promise((resolve: (value: any) => void) => {
      this.$db.update(
        query,
        updateQuery,
        options,
        (error: Error | null, numberOfUpdated: number, affectedDocuments: any) => {
          if (!error) {
            resolve(affectedDocuments);
          }
        }
      );
    });
  }
}

export default DB;

