import * as React from 'react';
import { Tabs, Badge, Button, ImagePicker, Toast, Modal } from 'antd-mobile';
import * as qs from 'query-string';
import * as api from '../../../services/temporaryGoods';
import TabCell from '../components/TabCell';
import ExportButton from '../components/ExportButton';
import './styles.scss';

const { memo, forwardRef, useCallback, useState, useEffect } = React;

const genUUID = () => {
    const s = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i += 1) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01

    // eslint-disable-next-line
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
};

function toastLoading(isShow: boolean) {
    if (isShow) {
        Toast.loading('Loading...', 0, () => {}, true);
    } else {
        Toast.hide();
    }
}
const handleArray = arr => {
    const newArr = arr.map(item => {
        return {
            ...item,
            isCheck: item.isSave,
            id: genUUID(),
            // other_question: [1, 2, 3],
        };
    });
    return newArr;
};

let isSubmit = false;

const OrderList = memo(
    forwardRef((props, ref) => {
        const params = qs.parse(window.location.search);
        const { msgid } = params;

        const [visible, setVisible] = useState(false);
        const [files, setFiles] = useState([]);
        const [loading, setLoading] = useState(true);
        const [dataList, setDataList] = useState([]);
        const [allData, setAllData] = useState([]);

        // 获取数据
        const getList = useCallback(() => {
            toastLoading(true);
            setLoading(true);
            api.getProductList(msgid, true)
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
                    const filterList = allData.filter(item => +item.remove_nums > 0);

                    // 判断是否有提交
                    const getIsSubmit = filterList.length > 0 ? filterList[0] : {};
                    isSubmit = getIsSubmit.isDispose === 'true' ? true : false;

                    // 处理查看上传图片
                    if (getIsSubmit.isDispose) {
                        const { url = [] } = getIsSubmit;
                        const imageList = url.map((item: any) => {
                            return { url: item, id: genUUID() };
                        });
                        setFiles(imageList);
                    }

                    setAllData(allData);
                    setDataList(filterList || []);
                    toastLoading(false);
                    setLoading(false);
                })
                .catch(() => {
                    toastLoading(false);
                    setLoading(false);
                });
        }, [msgid]);

        // 核查接口
        const checkList = useCallback(
            payload => {
                Toast.loading('确认核查中....');
                api.saveProductList(payload)
                    .then((res: any) => {
                        Toast.hide();
                        Toast.success('提审成功', 1, getList);
                    })
                    .catch(() => {
                        Toast.hide();
                    });
            },
            [msgid]
        );

        useEffect(() => {
            getList();
        }, []);

        // 显示
        const onShowChange = useCallback(() => {
            setVisible(true);
        }, [visible]);

        // 关闭
        const onCloseChange = useCallback(() => {
            setVisible(false);
        }, [visible]);

        // 上传图片组件方法回调
        const onUploadChange = useCallback(
            (fileList, type, imageIndex) => {
                console.log(fileList, type, imageIndex);
                if (type === 'add') {
                    // 添加
                    const index = fileList.length - 1;
                    const file = fileList[index].file;
                    const formData = new FormData();
                    formData.append('file', file);
                    handleUploadImage(formData, index);
                } else {
                    // 移除
                    const newList = files.concat();
                    newList.splice(imageIndex, 1);
                    setFiles(newList);
                }
            },
            [files]
        );

        // 上传
        const handleUploadImage = useCallback(
            (formData: any, index: number) => {
                api.uploadImage(formData)
                    .then((res: any) => {
                        const { assetsUrl = '' } = res;
                        const img = { url: assetsUrl, id: genUUID() };
                        const newList = files.concat();
                        newList.splice(index + 1, 0, img);
                        setFiles(newList);
                    })
                    .catch(err => {
                        Toast.fail(err.message, 1);
                    });
            },
            [files]
        );

        // 点击图片
        const handleClickImage = useCallback(
            (index: number, imageList: any) => {
                if (isSubmit) {
                    // 查看图上
                    window.open(imageList[index].url);
                }
            },
            [files]
        );

        // 核查
        const handleCheckChange = useCallback(() => {
            if (files.length === 0) {
                Toast.info('请先上传封装图片', 1);
                return false;
            }

            const saveData = allData.map((item: any) => {
                return {
                    msgseq: item.msgseq,
                    otherquestion: item.other_question,
                    removenums: item.remove_nums,
                };
            });
            const imageList = files.map((item: any) => {
                return item.url;
            });

            const paylod = {
                disposeMode: 2,
                msgid: msgid,
                expirationDateResultDetails: saveData,
                url: imageList,
            };
            checkList(paylod);
        }, [files, dataList, allData]);

        // 导出
        const onExport = useCallback(() => {
            const url = `http://datafairy.rainbowcn.com:9005/datafairyapi/expirationDateWarnController/exportExpirationExcellv2?msgid=${msgid}&type=2`;
            window.open(url);
        }, []);

        // 渲染
        return (
            <div className="order-list">
                <TabCell disabled loading={loading} rounded={true} data={dataList} />
                {/* 底部按钮 */}

                {dataList.length > 0 && (
                    <div className="bottom-button">
                        <Button
                            type="ghost"
                            style={{ width: isSubmit ? '100%' : '50%' }}
                            className="save"
                            onClick={onShowChange}
                        >
                            {`${isSubmit ? '查看图片' : '上传图片'}`}
                        </Button>

                        {isSubmit === false && (
                            <Button
                                className="order"
                                type="primary"
                                disabled={files.length === 0}
                                onClick={handleCheckChange}
                            >
                                确认核查
                            </Button>
                        )}
                    </div>
                )}
                {dataList.length > 0 && <ExportButton onExport={onExport} />}
                <Modal popup animationType="slide-up" visible={visible} onClose={onCloseChange}>
                    <ImagePicker
                        files={files}
                        disableDelete={isSubmit}
                        onChange={onUploadChange}
                        onImageClick={handleClickImage}
                        selectable={isSubmit ? false : files.length < 3}
                        accept="image/gif,image/jpeg,image/jpg,image/png"
                    />
                    <Button
                        type="primary"
                        style={{ marginBottom: '10px', marginLeft: '10px', marginRight: '10px' }}
                        onClick={onCloseChange}
                    >
                        {isSubmit === false ? '确定' : '关闭'}
                    </Button>
                </Modal>
            </div>
        );
    })
);

export default OrderList;
