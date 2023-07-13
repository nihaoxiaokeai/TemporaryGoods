import * as React from "react";

import { Checkbox } from "antd-mobile";
import * as styles from "./index.scss";
interface IProps {
  dataList: any;
  titles: any;
  onSelectChange: any;
}

interface IState {
  list: any;
  props: any;
}
export default class Index extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      list: [],
      props,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { dataList } = nextProps;
    const { list } = prevState;
    if (list !== dataList) {
      return {
        list: dataList,
        props: nextProps,
      };
    }
  }

  handleString = (name: string) => {
    const beforeString = name.slice(0, name.length - 4);
    const afterString = name.substr(name.length - 4, 4);
    return (
      <>
        {beforeString}
        <span style={{ color: "red" }}>{afterString}</span>
      </>
    );
  };

  handleAllChange = (event) => {
    const { list } = this.state;
    const { target } = event;
    this.props.onSelectChange(list, target.checked);
    if (target.checked) {
      list.forEach((item) => {
        item.isCheck = "true";
      });
    } else {
      list.forEach((item) => {
        if (item.isSave !== "true") {
          item.isCheck = "";
        } else {
          item.isCheck = "true";
        }
      });
    }
    this.setState({
      list,
    });
  };

  handleChange = (event, index) => {
    const { target } = event;
    const { list } = this.state;
    this.props.onSelectChange([index], target.checked);
    if (target.checked) {
      list.forEach((item) => {
        if (item.id === index.id) {
          item.isCheck = "true";
        }
      });
    } else {
      list.forEach((item) => {
        if (item.id === index.id) {
          item.isCheck = "";
        }
      });
    }
    this.setState({
      list,
    });
  };

  render() {
    const { titles } = this.props;
    const { list } = this.state;
    const allSave = !list.every((item) => {
      item.isSave === "true";
    });
    return (
      <>
        <div className={styles.wrap}>
          <div className={styles.title}>
            <tr className={styles.tr}>
              <td className={styles.td1}>
                <Checkbox onChange={this.handleAllChange} />
              </td>
              <td className={styles.td2}>{titles[1]}</td>
              <td className={styles.td3}>{titles[2]}</td>
              <td className={styles.td4}>{titles[3]}</td>
            </tr>
          </div>
          <div className={styles.content}>
            {list &&
              list.map((item, index) => {
                return (
                  <tr
                    className={`${styles.tr} ${styles.borderBottom}`}
                    key={index}
                  >
                    <td className={styles.td1}>
                      <Checkbox
                        checked={item.isCheck === "true"}
                        disabled={item.isSave === "true"}
                        onChange={(e) => {
                          this.handleChange(e, item);
                        }}
                      />
                    </td>
                    <td className={styles.td2}>{index}</td>
                    <td className={styles.td3}>
                      {this.handleString(item.produce_code)}
                    </td>
                    <td className={styles.td4}>
                      <span className={styles.font}>{item.produce_name}</span>
                    </td>
                  </tr>
                );
              })}
          </div>
        </div>
      </>
    );
  }
}
