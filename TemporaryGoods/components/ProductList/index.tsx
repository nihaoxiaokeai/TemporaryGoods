import * as React from "react";
import * as styles from "./index.scss";
import { Button } from "antd-mobile";
import ListModuleLeft from "./components/ListModuleLeft";
import ListModuleRight from "./components/ListModuleRight";
interface IProps {
  data: any;
  onSelectChange: any;
  onInputChange: Function;
  onOtherChange: Function;
  name: String;
  msgid: String;
}

export default React.memo((props: IProps) => {
  const titles = [
    <span></span>,
    "序号",
    "条码",
    "品名",
    "撤柜生产日期",
    "保质期",
    "当前库存",
    "撤柜批次号到货数量",
    "临期撤柜数量",
    "其他质量问题",
    "操作人姓名",
  ];
  return (
    <>
      <div className={styles.wrap}>
        <Button
          inline
          size="small"
          style={{ marginLeft: "10px" }}
          onClick={() => {
            // const url = `http://192.168.197.149:8099/datafairyapi/expirationDateWarnController/exportExpirationExcell?msgid=${props.msgid}`;
            const url = `http://datafairy.rainbowcn.com:9005/datafairyapi/expirationDateWarnController/exportExpirationExcell?msgid=${props.msgid}`;
            window.open(url);
          }}
        >
          导出Excel
        </Button>
        <div>
          <div className={styles.leftContent}>
            <ListModuleLeft
              titles={titles}
              dataList={props.data}
              onSelectChange={props.onSelectChange}
            />
          </div>
          <div className={styles.right}>
            <div className={styles.rightContent}>
              <ListModuleRight
                name={props.name}
                titles={titles}
                dataList={props.data}
                onInputChange={props.onInputChange}
                onOtherChange={props.onOtherChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
