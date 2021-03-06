import React from 'react'
import PropTypes from 'prop-types'
import { Upload, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { reqDeleteImg } from '../../api'
import { BASE_IMG_URL } from '../../utils/constants';
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

//用于图片上传的组件
export default class PicturesWall extends React.Component {

    static propTypes = {
        imgs: PropTypes.array
    }


    state = {


    };

    constructor(props) {
        super(props)

        const fileList = []

        //如果传入了imgs属性
        const { imgs } = this.props
        if (imgs && imgs.lenght > 0) {
            fileList = imgs.map((img, index) => ({
                uid: -index,
                name: img,
                status: 'done',
                url: BASE_IMG_URL + img,
            }))
        }
        //初始化状态
        this.state = {
            previewVisible: false, //标识是否显示大图预览
            previewImage: '', //大图的url
            previewTitle: '',
            fileList // 所有已上传图片的数组
        }
    }
    handleCancel = () => this.setState({ previewVisible: false });

    handlePreview = async file => {
        // 指定file对应的大图
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        });
    };

    handleChange = async ({ file, fileList }) => { //file当前操作的图片，filelist所有已上传图片的数组
        //一旦上传成功，将当前上传你的file信息修正
        if (file.status === 'done') {
            const result = file.response
            if (result.status === 0) {
                message.success('上传图片成功')
                const { name, url } = result.data
                file = fileList[fileList.length - 1]
                file.name = name
                file.url = url
            } else {
                message.error('上传图片失败')
            }
        } else if (file.status === 'removed') {
            //删除图片
            const result = await reqDeleteImg(file.name)
            if (result.status === 0) {
                message.success('删除图片成功')
            } else {
                message.error('删除图片失败')
            }
        }
        //在操作过程中更新fileList状态
        this.setState({ fileList })
    };

    getImgs = () => {
        return this.state.fileList.map(file => file.name)
    }
    render() {
        const { previewVisible, previewImage, fileList, previewTitle } = this.state;
        const uploadButton = (
            <div>
                <PlusOutlined />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        return (
            <div className="clearfix">
                <Upload
                    action="/manage/img/upload"//上传图片的接口地址
                    accept='image/*' //只接受图片格式
                    name='image' //请求参数名
                    listType="picture-card" //卡片样式
                    fileList={fileList} //所有已上传图片文件对象的数组
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                >
                    {fileList.length >= 8 ? null : uploadButton}
                </Upload>
                <Modal
                    visible={previewVisible}
                    title={previewTitle}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </div>
        );
    }
}
