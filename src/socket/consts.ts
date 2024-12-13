// const BASE_IP = process.env.NODE_ENV === 'development' ? 'test78.sany.com.cn' : 'localhost';

import { GetQueryObj } from "@/utils/utils";

export const BASE_IP = localStorage.getItem("ipUrl") || 'localhost:8866';
const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
        ? GetQueryObj(location.href)
        : {};
const id = params?.['id'];

export const website = {
    socket: `ws://${BASE_IP}/`,
    id
};
