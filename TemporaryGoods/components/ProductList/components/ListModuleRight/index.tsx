import * as React from "react";
import * as styles from "./index.scss";
import {
  List,
  InputItem,
  WhiteSpace,
  Modal,
  Checkbox,
  Toast,
} from "antd-mobile";
import { time } from "console";
const { useState, useEffect, useCallback } = React;
interface IProps {
  dataList: any;
  titles: any;
  onInputChange: Function;
  onOtherChange: Function;
  name: String;
}
const option = [
  {
    label: "过期",
    value: 1,
  },
  {
    label: "失效变质",
    value: 2,
  },
  {
    label: "生虫",
    value: 3,
  },
  {
    label: "有异物",
    value: 4,
  },
  {
    label: "无生产日期",
    value: 5,
  },
  {
    label: "生产日期模糊",
    value: 6,
  },
  {
    label: "净含量不足",
    value: 7,
  },
  {
    label: "其他",
    value: 8,
  },
  // {
  //   label: "其他",
  //   value: 9,
  // },
];

export default React.memo((props: IProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectOption, setSelectOption] = useState({
    id: "",
    other_question: [],
    isSave: false,
  });
  const [defaultOption, setDefaultOption] = useState([]);

  const handleSelect = (data) => {
    setSelectOption(data);
    setModalVisible(true);
    setDefaultOption(data.other_question);
  };

  const handleCheckboxChange = (event, item) => {
    const { target } = event;
    if (target.checked) {
      selectOption.other_question.push(item.value);
    } else {
      selectOption.other_question = selectOption.other_question.filter(
        (index) => index !== item.value
      );
    }
    props.onOtherChange(
      selectOption.other_question,
      selectOption.id,
      props.name
    );
  };

  const { dataList = [], titles = [] } = props;
  return (
    <>
      <div className={styles.wrap}>
        <div className={styles.title}>
          <tr className={styles.tr}>
            <td className={styles.td4}>{titles[4]}</td>
            <td className={styles.td5}>{titles[5]}</td>
            <td className={styles.td6}>{titles[6]}</td>
            <td className={styles.td7}>{titles[7]}</td>
            <td className={styles.td8}>{titles[8]}</td>
            <td className={styles.td9}>{titles[9]}</td>
            <td className={styles.td10}>{titles[10]}</td>
          </tr>
        </div>
        <div className={styles.content}>
          {dataList &&
            dataList.map((item: any, index: number) => {
              return (
                <tr
                  className={`${styles.tr} ${styles.borderBottom}`}
                  key={index}
                >
                  <td className={styles.td4}>{item.produce_date}</td>
                  <td className={styles.td5}>{item.expiration_date}</td>
                  <td className={styles.td6}>{item.inventory}</td>
                  <td className={styles.td7}>{item.batch_number}</td>
                  <td className={styles.td8}>
                    <InputItem
                      placeholder="填写数量"
                      // type="digit"
                      value={item.remove_nums}
                      style={{ textAlign: "center", fontSize: "12px" }}
                      disabled={item.isSave}
                      onChange={(e: any) => {
                        const reg = /^([1-9]{0,1}|[1-9]([0-9]{0,}))(\.[0-9]{0,2})?$/;
                        const isNumber = reg.test(e);
                        // console.log("----->", e, isNumber);
                        if (!isNumber) {
                          Toast.info("请输入数字", 1);
                          return;
                        }
                        props.onInputChange(e, item.id, props.name);
                      }}
                    />
                  </td>
                  <td className={styles.td9}>
                    <p
                      onClick={() => {
                        handleSelect(item);
                      }}
                    >
                      {item.other_question && item.other_question.length > 0
                        ? `已选${item.other_question.length}项`
                        : "请选择"}
                    </p>
                  </td>
                  <td className={styles.td10}>{item.check_empl_name}</td>
                </tr>
              );
            })}
        </div>
        <Modal
          visible={modalVisible}
          maskClosable={false}
          transparent
          footer={[
            {
              text: "确定",
              onPress: () => {
                setModalVisible(false);
              },
            },
          ]}
          // wrapProps={{ onTouchStart: this.onWrapTouchStart }}
        >
          <List>
            {option.map((item) => {
              return (
                <List.Item>
                  <Checkbox
                    style={{ margin: "0 10px" }}
                    onChange={(e) => {
                      handleCheckboxChange(e, item);
                    }}
                    disabled={selectOption.isSave}
                    defaultChecked={defaultOption.includes(item.value)}
                  />
                  {item.label}
                </List.Item>
              );
            })}
          </List>
        </Modal>
      </div>
    </>
  );
});
