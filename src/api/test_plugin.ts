import pluginApi from './plugin'

class TestPluginApi {

  add = (data:object) => {pluginApi.add(data).then((r:object) => {return console.log(r)})}

  remove = (pID:string) => {pluginApi.delete(pID).then((r:object) => {return console.log(r)})}

  update = (pID:string,data:object) => {pluginApi.update(pID, data).then((r:object) => {return console.log(r)})}

  get = (pID:string) => {pluginApi.get(pID).then((r:object) => {return console.log(r)})}

  list = async () => {
    const pluginList = await pluginApi.list()
    console.log(pluginList);
    return pluginList;
  }
}

const test = async () => {
  const t = new TestPluginApi()
  // 新增
  t.add({ name: 'plugin_1' })
  // 获取插件列表
  const res = await t.list()
  // 获取某个插件id
  const pID = res.data[0].id
  // 使用插件id获取插件信息
  t.get(pID)
  t.update(pID, { name: 'plugin2' })
  t.remove(pID)
  t.get(pID)
  await t.list()
}

test()
