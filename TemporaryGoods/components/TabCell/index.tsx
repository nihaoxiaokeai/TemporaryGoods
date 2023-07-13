import * as React from 'react';
import { Checkbox, Modal, InputItem, Menu, Icon, Toast } from 'antd-mobile';
import CardCell from '../../../../components/CardCell';
import { useCallback, useEffect } from 'react';
import './styles.scss';

interface IPorps {
    data?: any;
    loading?: boolean;
    onChange?: Function;
    rounded?: boolean;
    disabled?: boolean;
}

const menuList = [
    {
        value: '1',
        label: '过期',
    },
    {
        value: '2',
        label: '失效变质',
    },
    {
        value: '3',
        label: '生虫',
    },
    {
        value: '4',
        label: '有异物',
    },
    {
        value: '5',
        label: '无生产日期',
    },
    {
        value: '6',
        label: '生产日期模糊',
    },
    {
        value: '7',
        label: '净含量不足',
    },
    {
        value: '8',
        label: '其它',
    },
];

const getCodehtml = (code: any) => {
    if (code) {
        const codeLength = code.length;

        const start = code.substring(0, codeLength - 4);
        const end = code.substring(codeLength - 4);
        return (
            <div>
                <span>{start}</span>
                <span style={{ fontWeight: 'bold', color: 'red' }}>{end}</span>
            </div>
        );
    } else {
        return null;
    }
};

const Cell = React.memo(
    React.forwardRef((props: any, ref) => {
        const {
            beforeText,
            afterText,
            buttonText,
            afterRedText = false,
            beforeRedText = false,
            isGray = false,
            onChange,
        } = props;

        return (
            <div className="cell">
                <span
                    className={
                        beforeRedText
                            ? 'before-text red-text'
                            : isGray
                            ? 'before-text gray-text'
                            : 'before-text'
                    }
                >
                    {beforeText}
                </span>
                {afterText && (
                    <span
                        className={
                            afterRedText
                                ? 'after-text red-text'
                                : isGray
                                ? 'after-text gray-text'
                                : 'after-text'
                        }
                    >
                        {afterText}
                    </span>
                )}
                {buttonText && (
                    <span className="button-text" onClick={onChange}>
                        {buttonText}
                    </span>
                )}
            </div>
        );
    })
);

const TabCell = React.memo(
    React.forwardRef((props: IPorps, ref) => {
        const { data = [], loading, onChange, rounded = false, disabled = false } = props;
        const [dataSource, setDataSource] = React.useState([]);
        const [visible, setVisible] = React.useState(false);
        const [show, setShow] = React.useState(false);
        const [menuIds, setMenuIds] = React.useState([]);
        const [operationIndex, setOperationIndex] = React.useState(-1);
        const [quantity, setQuantity] = React.useState('');
        const [allCheck, setAllCheck] = React.useState(false);
        const [allDisabled, setAllDisabled] = React.useState(false);
        const [modifyItem, setModifyItem] = React.useState({ inventory: 0 });

        useEffect(() => {
            const filterList = data.filter((item: any) => item.isSave === 'true');
            if (filterList.length === data.length && data.length !== 0) {
                setAllCheck(false);
                setAllDisabled(true);
            }
            setDataSource(data);
        }, [data]);

        // 点击修改
        const onModifyChange = useCallback(
            (item, index) => {
                setOperationIndex(index);
                setVisible(true);
                setModifyItem(item);
            },
            [visible, operationIndex]
        );

        // 关闭对话框
        const onCloseChange = useCallback(() => {
            setShow(false);
            setMenuIds([]);
            setQuantity('');
            setVisible(false);
        }, [visible]);

        // 点击确定按钮对框
        const onOkChange = useCallback(() => {
            // 深拷贝
            const newList = data.concat();
            const item = newList[operationIndex];
            // 设置值
            if (item) {
                Object.assign(item, {
                    remove_nums: quantity,
                    other_question: menuIds,
                    isQuantity: true,
                    isQuestion: true,
                });
                setDataSource(newList);
            }
            setShow(false);
            setQuantity('');
            setMenuIds([]);
            setVisible(false);
        }, [visible, dataSource, operationIndex, quantity, menuIds]);

        // 撤柜数量输入
        const onInputChange = useCallback(
            e => {
                const total = modifyItem.inventory;
                const number = Number(e);
                const reg = /^[1-9]\d*$/;
                if ((number > 0 && reg.test(e) === false) || (number === 0 && e.length > 1)) {
                    Toast.info('请输入正整数');
                    return false;
                }

                if (+e > +total) {
                    Toast.info('撤柜数量不能超出库存');
                    return false;
                }
                setQuantity(e);
            },
            [quantity, modifyItem]
        );

        // 展开收起其它质量问题
        const onClickMenu = useCallback(() => {
            setShow(!show);
        }, [show]);

        // 选择其它质量问题
        const onMenuChange = useCallback(
            e => {
                setMenuIds(e);
            },
            [menuIds]
        );

        // 全选处理
        const onAllCheck = useCallback(
            e => {
                const checked = e.target.checked;
                const newList = dataSource.concat();
                if (checked === false) {
                    // 取消全选
                    newList.map(item => Object.assign(item, { checked: false }));
                } else {
                    // 全选
                    newList.map(item => Object.assign(item, { checked: true }));
                }
                setAllCheck(checked);
                setDataSource(newList);
                if (onChange) {
                    const checkList = newList.filter(
                        (item: any) => item.checked && item.isSave !== 'true'
                    );
                    onChange(checkList);
                }
            },
            [allCheck, onChange, dataSource]
        );

        const onItemChecked = useCallback(
            (check: boolean, index: any) => {
                // 检测选中的个数是否全选中
                const newList = dataSource.concat();
                const item = newList[index];
                if (item) {
                    Object.assign(item, { checked: check });
                }
                const filterList = newList.filter(item => item.checked);
                if (filterList.length === dataSource.length) {
                    setAllCheck(true);
                } else {
                    setAllCheck(false);
                }
                setDataSource(newList);
                if (onChange) {
                    const checkList = newList.filter(
                        (item: any) => item.checked && item.isSave !== 'true'
                    );
                    onChange(checkList);
                }
            },
            [dataSource, allCheck, onChange]
        );

        return (
            <div className={`${rounded ? 'tab-cell round-height' : 'tab-cell'}`}>
                {!loading && (
                    <div className={`${rounded ? 'all-check round-style' : 'all-check'}`}>
                        <Checkbox
                            checked={allCheck || disabled}
                            disabled={allDisabled}
                            onChange={onAllCheck}
                        />
                        <span className="text">全选</span>
                    </div>
                )}
                {dataSource.length > 0 &&
                    dataSource.map((item: any, index: any) => {
                        if (allCheck) {
                            Object.assign(item, { checked: true });
                        } else {
                            Object.assign(item, {
                                checked:
                                    item.isSave === 'true' ? true : item.checked ? true : false,
                            });
                        }
                        return (
                            <CardCell
                                rounded
                                key={index}
                                checked={item.checked}
                                title={`${index + 1}.${item.produce_name}`}
                                code={getCodehtml(item.produce_code)}
                                disabled={item.isSave === 'true' ? true : false}
                                onChecked={(e: boolean) => {
                                    onItemChecked(e, index);
                                }}
                            >
                                <div>
                                    <Cell
                                        isGray={item.isSave === 'true' ? true : false}
                                        beforeText={`撤柜生产日期：${item.produce_date}`}
                                        afterText={`保质期：${item.expiration_date}`}
                                    />
                                    <Cell
                                        isGray={item.isSave === 'true' ? true : false}
                                        beforeText={`撤柜批次号到货数量：${item.batch_number}`}
                                        afterText={`当前库存：${item.inventory}`}
                                    />
                                    <Cell
                                        isGray={item.isSave === 'true' ? true : false}
                                        beforeText={`临期撤柜数量：${item.remove_nums}`}
                                        afterText={`操作人：${item.check_empl_name}`}
                                        afterRedText={item.check_empl_name ? true : false}
                                        beforeRedText={
                                            item.isQuantity ||
                                            (item.isSave === 'true' && +item.remove_nums > 0)
                                                ? true
                                                : false
                                        }
                                    />
                                    <Cell
                                        isGray={item.isSave === 'true' ? true : false}
                                        beforeText={`其它质量问题：${
                                            item.other_question.length > 0
                                                ? `已选择${item.other_question.length}项`
                                                : ''
                                        }`}
                                        buttonText={`${item.isSave === 'true' ? '' : '修改'}`}
                                        beforeRedText={
                                            item.isQuestion ||
                                            (item.isSave === 'true' &&
                                                item.other_question.length > 0)
                                                ? true
                                                : false
                                        }
                                        onChange={() => {
                                            onModifyChange(item, index);
                                        }}
                                    />
                                </div>
                            </CardCell>
                        );
                    })}
                <Modal
                    visible={visible}
                    className="modal"
                    transparent
                    maskClosable={false}
                    title="修改"
                    footer={[
                        {
                            text: '取消',
                            onPress: onCloseChange,
                        },
                        {
                            text: '确定',
                            onPress: onOkChange,
                        },
                    ]}
                >
                    <div className="modal-style">
                        <InputItem
                            value={quantity}
                            type="number"
                            placeholder="请输入临期撤柜数量"
                            clear
                            onChange={onInputChange}
                        />
                        <div className="menu-style" onClick={onClickMenu}>
                            <span>请选择其它质量问题</span>
                            <Icon className="icon" type={show ? 'down' : 'up'} />
                        </div>
                        {show && (
                            <Menu
                                className="single-multi-foo-menu"
                                data={menuList}
                                value={menuIds}
                                level={1}
                                onChange={onMenuChange}
                                // onOk={this.onOk}
                                // onCancel={this.onCancel}
                                height={300}
                                multiSelect
                            />
                        )}
                    </div>
                </Modal>
            </div>
        );
    })
);

export default TabCell;
