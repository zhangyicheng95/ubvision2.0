import pluginApi from './project'

function fibonacci(n: number) {
  let res1 = 1;
  let res2 = 1;
  let sum = res2;
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < n; i++) {
    sum = res1 + res2;
    res1 = res2;
    res2 = sum;
  }
  return sum;
}

class TestPluginApi {

  add = (data: object) => {
    pluginApi.add(data).then((r: object) => {
      return console.log(r)
    })
  }

  remove = (pID: string) => { pluginApi.delete(pID).then((r: object) => { return console.log(r) }) }

  update = (pID: string, data: object) => { pluginApi.update(pID, data).then((r: object) => { return console.log(r) }) }

  get = (pID: string) => { pluginApi.get(pID).then((r: object) => { return console.log(r) }) }

  list = async () => {
    const pluginList = await pluginApi.list()
    return pluginList;
  }
}

const test = async () => {
  const t = new TestPluginApi()
  // 新增
  t.add({ name: 'plugin_1' })
  t.add({ name: 'plugin_2' })
  t.add({ name: 'plugin_3' })
  t.add({ name: 'plugin_4' })

  // 获取某个插件id
  // const pID = res.data[0].id
  fibonacci(3000)
  // 获取插件列表
  const res = await t.list()
  res.data.forEach((e: any) => {
    console.log('获取方案信息');
    t.get(e.id)
    // console.log('更新方案信息');
    // t.update(e.id, { name: e.name })
    console.log('删除方案', e.id);
    t.remove(e.id)
    console.log('删除后获取');
    t.get(e.id)
  })
  await t.list()
}

export default test
