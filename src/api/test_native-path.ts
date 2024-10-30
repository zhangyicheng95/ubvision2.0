import { chooseFile, chooseFolder } from '@/api/native-path';

const printResult = (r:any, e:any) => {

}
// 选择文件夹
chooseFolder(printResult)
// 文件多选
chooseFile(printResult, true)
// 文件单选
chooseFile(printResult, false)
// 执行文件类型
chooseFile(printResult, true, {name:'Image', extensions:['jpg', 'jpeg', 'png', 'bmp']})
