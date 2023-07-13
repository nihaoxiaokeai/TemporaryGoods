/*
 * @Author: zengrui
 * @Date: 2020-05-21 09:28:18
 * @LastEditors: zengrui
 * @LastEditTime: 2020-08-10 14:58:13
 * @Description: 临期商品预警 
 */

import * as React from "react";
import { Tabs, Badge, Button, ImagePicker, Toast, Modal } from "antd-mobile";
import * as qs from "query-string";
import * as api from "../../services/temporaryGoods";
import TabCell from "./components/TabCell";
import ExportButton from "./components/ExportButton";
import BroswerHistory from '@utils/history'
import * as styles from "./index.scss";
import "./index.scss";

const { useState, useEffect, useCallback } = React;
const genUUID = () => {
  const s = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i += 1) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01

  // eslint-disable-next-line
  s[8] = s[13] = s[18] = s[23] = "-";
  return s.join("");
};

function toastLoading(isShow: boolean) {
  if (isShow) {
    Toast.loading("Loading...", 0, () => { }, true);
  } else {
    Toast.hide();
  }
}

const tabs = [
  { title: <Badge>生鲜熟</Badge> },
  { title: <Badge>日配</Badge> },
  { title: <Badge>包装食品</Badge> },
  { title: <Badge>日用品</Badge> },
];

let isSubmit = false;

export default React.memo(() => {
  const params = qs.parse(window.location.search);
  const { msgid } = params;
  // const msgid = "30f9c450-237f-4047-9483-dbe6654a11b6";

  document.title = "临期商品预警";

  // 生鲜
  const [FreshList, setFreshList] = useState([]);
  // 包装食品
  const [FoodList, setFoodList] = useState([]);
  // 日配列表块
  const [DeliverList, setDeliverList] = useState([]);
  // 日用品列表块
  const [ConsumerList, setConsumerList] = useState([]);
  // 勾选数据集合
  const [checkedFresh, setCheckedFresh] = useState([]);
  const [checkedFood, setCheckedFood] = useState([]);
  const [checkedDeliver, setCheckedDeliver] = useState([]);
  const [checkedConsumer, setCheckedConsumer] = useState([]);

  // 所有数据的集合
  const [AllData, setAllData] = useState([]);

  // 是否有保存过数据
  const [isSaveData, setIsSaveData] = useState(false);

  // 加载loading
  const [loading, setLoading] = useState(true);

  const [isSave, setisSave] = useState(false);

  const handleArray = (arr) => {
    const newArr = arr.map((item) => {
      return {
        ...item,
        isCheck: item.isSave,
        id: genUUID(),
        // other_question: [1, 2, 3],
      };
    });
    return newArr;
  };

  useEffect(() => {
    getList();
  }, []);

  // 请求列表数据
  const getList = useCallback(() => {
    toastLoading(true);
    setLoading(true);
    api
      .getProductList(msgid, true)
      .then((res: any) => {
        const {
          consumerList = [],
          deliverList = [],
          foodList = [],
          freshList = [],
        } = res;
        const fresh = handleArray(freshList);
        const food = handleArray(foodList);
        const deliver = handleArray(deliverList);
        const consumer = handleArray(consumerList);
        const allData = [...fresh, ...food, ...deliver, ...consumer];
        const getIsSubmit = allData.length > 1 ? allData[0] : {};
        isSubmit = getIsSubmit.isDispose === "true" ? true : false;

        // 查找是否有保存过的数据
        const saveData = allData.every((item) => item.isSave === "true");
        if (saveData) {
          isSubmit = allData.some(item => item.isDispose === 'true' ? true : false)
        }

        setisSave(saveData ? false : true)
        setIsSaveData(saveData);
        setAllData(allData);
        setFreshList(fresh);
        setFoodList(food);
        setDeliverList(deliver);
        setConsumerList(consumer);
        toastLoading(false);
        setLoading(false);
      })
      .catch(() => {
        toastLoading(false);
        setLoading(false);
      });
  }, [msgid]);

  // 保存接口请求
  const handleSaveData = (params: any) => {
    Toast.loading("保存中....");
    api
      .saveProductList(params)
      .then((res: any) => {
        Toast.hide();
        Toast.success("保存成功", 1, getList);
      })
      .catch(() => {
        Toast.hide();
      });
  };


  // 保存
  const handleSave = useCallback(() => {
    const allList = [
      ...checkedFresh,
      ...checkedDeliver,
      ...checkedFood,
      ...checkedConsumer,
    ];
    const saveData = allList.map((item) => {
      return {
        msgseq: item.msgseq,
        otherquestion: item.other_question,
        removenums:
          !item.remove_nums || item.remove_nums === "" ? 0 : item.remove_nums,
      };
    });
    const payload = {
      disposeMode: 1,
      msgid: msgid,
      expirationDateResultDetails: saveData,
      url: [],
    };

    handleSaveData(payload);
  }, [checkedFresh, checkedDeliver, checkedFood, checkedConsumer]);


  const componentsList = [
    {
      key: "FreshList",
      data: FreshList,
    },
    {
      key: "DeliverList",
      data: DeliverList,
    },
    {
      key: "FoodList",
      data: FoodList,
    },
    {
      key: "ConsumerList",
      data: ConsumerList,
    },
  ];

  // 选择数据
  const onCheckedChange = useCallback(
    (data, key) => {
      const checked = data.length > 0 ? true : false;
      if (key === "FreshList") {
        setCheckedFresh(data);
      } else if (key === "DeliverList") {
        setCheckedDeliver(data);
      } else if (key === "FoodList") {
        setCheckedFood(data);
      } else if (key === "ConsumerList") {
        setCheckedConsumer(data);
      }
      setisSave(checked);
    },
    [isSave, checkedFresh, checkedDeliver, checkedFood, checkedConsumer]
  );

  // 导出商品数据
  const onExport = useCallback(() => {
    const url = `http://datafairy.rainbowcn.com:9005/datafairyapi/expirationDateWarnController/exportExpirationExcellv2?msgid=${msgid}&type=1`;
    window.open(url);
  }, []);

  // 核查接口
  const checkList = useCallback((payload) => {
    Toast.loading("确认核查中....");
    api
      .saveProductList(payload)
      .then((res: any) => {
        Toast.hide();
        Toast.success("提审成功", 1, getList);
      })
      .catch(() => {
        Toast.hide();
      });
  }, [msgid])

  // 确定事件
  const onOkChange = () => {
    const saveData = AllData.map((item: any) => {
      return {
        msgseq: item.msgseq,
        otherquestion: item.other_question,
        removenums: item.remove_nums,
      }
    })

    const paylod = {
      disposeMode: 2,
      msgid: msgid,
      expirationDateResultDetails: saveData,
      url: [],
    }
    checkList(paylod)
  }

  // 撤柜清单事件
  const handleOrderList = useCallback(() => {
    const isPush = AllData.every((item) => +item.remove_nums === 0);
    if (isSubmit && isPush) {
      Modal.alert('', '当前撤柜清单暂无数据', [{ text: '关闭' },])
      return false
    }


    if (isPush && !isSubmit) {
      Modal.alert('', '当前撤柜清单暂无数据，是否确认核查', [{ text: '确定', onPress: onOkChange, },])
      return false
    }

    BroswerHistory.push(`/temporary-goods/list?msgid=${msgid}`)
  }, [AllData])

  return (
    <div className="goods">
      <div className="context-flex">
        <Tabs tabs={tabs} initialPage={0} useOnPan={false} swipeable={false}>
          {componentsList.map((item: any) => {
            return <TabCell
              key={item.key}
              loading={loading}
              data={item.data}
              onChange={(data: any) => {
                onCheckedChange(data, item.key);
              }}
            />
          })}
        </Tabs>
      </div>
      {/* 底部按钮 */}
      {AllData.length > 0 && <div className="bottom-button">
        <Button
          type="ghost"
          className={`${!isSave ? "save save-disabled" : "save"}`}
          disabled={!isSave}
          onClick={handleSave}
        >
          保存
        </Button>

        <Button className="order" type="primary" onClick={handleOrderList} disabled={!isSaveData}>
          {isSubmit ? '查看撤柜清单' : '撤柜清单'}
        </Button>
      </div>}
      {AllData.length > 0 && <ExportButton onExport={onExport} />}
    </div>
  );
});
