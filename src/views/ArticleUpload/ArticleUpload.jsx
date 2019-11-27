/* !

=========================================================
* Material Dashboard React - v1.7.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. */
import React, {useState, useEffect, useRef} from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import Card from "components/Card/Card.jsx";
import CardHeader from "components/Card/CardHeader.jsx";
import CardBody from "components/Card/CardBody.jsx";
import Button from '@material-ui/core/Button';
// import Search from "@material-ui/icons/Search";
import {makeStyles} from '@material-ui/core/styles';
import {useSvgHashNewContract, useArticleAdminContract,useSvgAdminContract} from 'hooks';
import {useWeb3Context} from 'web3-react';
// import Switch from '@material-ui/core/Switch';
import {ethers} from 'ethers'
import {isMobile} from 'react-device-detect'
import TextField from '@material-ui/core/TextField';
import styled from 'styled-components'
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { useTranslation } from 'react-i18next'
import AlbumSvgItem from 'components/AlbumItem/AlbumSvgItem.jsx'
import CustomInput from "components/CustomInput/CustomInput.jsx";
import { useSnackbarContext } from 'contexts/SnackBarProvider.jsx';
import i18next from 'i18next'

const SVG_START = '<svg'
const SVG_END = '</svg>'

const HASH_START = '<hashsvg>'
const HASH_END = '</hashsvg>'

const ButtonWrapper = styled.div `
  ${ ({
    theme}) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: center;
  `

const useStyles = makeStyles(theme => ({
    typo: {
        paddingLeft: "25%",
        marginBottom: "20px",
        position: "relative"
    },
    typoTwo: {
        paddingLeft: "25%",
        marginBottom: "20px",
        marginTop: "-40px",
        position: "relative"
    },
    typoThree: {
        paddingLeft: "25%",
        marginBottom: "20px",
        marginTop: "40px",
        position: "relative"
    },
    note: {
     fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
     bottom: "10px",
     color: "#00c1c2",
     display: "flex",
     flexDirection:"row",
     wrap:"wrap",
     fontWeight: "400",
     fontSize: isMobile ? "13px" : "18px",
     lineHeight:  isMobile ? "13px" : "18px",
     left: "0",
     marginLeft: isMobile ? "10px":"20px",
     position: "absolute",
     width: isMobile ? "90px" : "260px",
     marginTop:isMobile? theme.spacing(-15): theme.spacing(-20),
     maxWidth:isMobile ? "90px" : "260px"
    },
    noteTop: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        bottom: "10px",
        color: "#00c1c2",
        display: "block",
        fontWeight: "400",
        fontSize: isMobile
            ? "13px"
            : "18px",
        lineHeight: isMobile
            ? "13px"
            : "18px",
        left: "0",
        marginLeft: "20px",
        marginTop: "20px",
        position: "absolute",
        width: "260px"
    },
    noteMiddle: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        bottom: "10px",
        color: "#000000",
        display: "block",
        fontWeight: "400",
        fontSize: isMobile
            ? "13px"
            : "18px",
        lineHeight: isMobile
            ? "13px"
            : "18px",
        left: "200",
        marginLeft: "20px",
        position: "absolute",
        width: "260px"
    },
    addressTxt: {
        fontSize: isMobile
            ? "13px"
            : "18px",
        marginLeft: isMobile
            ? 20
            : 0,
        width: "60%"
    },
    cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8)
    },
    cardCategoryWhite: {
        // color: "rgba(33,33,33,.99)",
        color: "white",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
    },
    cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none"
    },
    contextWrapper: {
        marginLeft: isMobile
            ? 20
            : 0,
        fontSize: isMobile
            ? "13px"
            : "18px"
    },

    transferButton: {
        margin: theme.spacing(2),
        // width:"8%",
        backgroundColor: '#FF8623'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: "100%"
    }
}));

const svgInfosInit = {
    saveData: '',
    parseOver: false,
    allHashs: [],
    allCodes: {}
}

const articleInfosInit = {
    source: '',
    title: '',
    label:''
}

export default function TypographyPage() {
    const classes = useStyles()
    const {t} = useTranslation()
    const svg_hash_contract = useSvgHashNewContract()
    const svg_admin_contract = useSvgAdminContract()
    const article_admin = useArticleAdminContract()
    const {account} = useWeb3Context()
    const [articleInfos, setArticleInfos] = useState(articleInfosInit);
    const [svgInfos, setSvgInfos] = useState(svgInfosInit)
    const [hashStatus, setHashStatus] = useState({})
    const [viewData, setViewData] = useState('')
    const showSnackbar= useSnackbarContext()
    let language = i18next.language
    //这里语言统一为zh
    if(language ==='zh-CN'  || language === 'zh-cn') {
        language =  'zh' ;
    }

    const parseArticle = event => {
        event.preventDefault()
        if (articleInfos.source.length > 0) {
            let newstr = convertStr(articleInfos.source)
            parseSvg(newstr, [], {})
        }
    };
    const handleChange = name => event => {
        let value = event.target.value
        setArticleInfos({
            ...articleInfos,
            [name]: value
        })
    };
    const convertStr = (str) => {
        let reg = /\n(\n)*( )*(\n)*\n/g
        let newstr = str.replace(reg, '\n')
        newstr = newstr.replace(/(\r\n\t|\n|\r\t)/gm, '')
        return newstr
    };
    const reset = (event) => {
        event.preventDefault()
        setArticleInfos(articleInfosInit)
        setSvgInfos(svgInfosInit)
        setViewData('')
    };
    const parseSvg = (str, hashs, codes) => {
        let start = str.indexOf(SVG_START);
        let end = str.indexOf(SVG_END);
        let final = end + SVG_END.length
        if (start !== -1 && end !== -1) {
            let subStr = str.substring(start, final);
            let subStrBytes = ethers.utils.toUtf8Bytes(subStr);
            let _hash = ethers.utils.keccak256(subStrBytes);
            _hash = _hash.substring(2)
            let newHashs = [
                ...hashs,
                _hash
            ]
            codes[_hash] = subStr
            let newStr = str.substring(0, start) + HASH_START + _hash
                + HASH_END + str.substring(final)
            parseSvg(newStr, newHashs, codes)
        } else {
            setSvgInfos({saveData: str, parseOver: true, allHashs: hashs, allCodes: codes})

        }
    };
    const onUpload = hash => (type) => {
        let isPublic = type === 'public';
        // event.preventDefault()
        if(svg_admin_contract){
            svg_admin_contract.addCode(hash, svgInfos.allCodes[hash],isPublic, {
                gasPrice: ethers.utils.parseUnits('2.5', 'gwei')
            }).then(response => {
                showSnackbar(t('transaction_send_success'),'success')
            }).catch(err => {
                console.log(err);
            });
        }
    };
    const uploadArticle = (event) => {
        event.preventDefault()
        const {title,label} = articleInfos
        if(!title)
            return showSnackbar(t('input_article_title'),'error')
        if(!label)
            return showSnackbar(t('input_article_label'),'error')
        const {saveData} = svgInfos
        if(!article_admin){
            return;
        }
        article_admin.addOneArticle(title,label, saveData,language, {
            gasPrice: ethers.utils.parseUnits('2.5', 'gwei')
        }).then(response => {
            showSnackbar(t('transaction_send_success'),'success')
        }).catch(err => {
            console.log(err);
        });
    };
    const preview = (event) => {
        event.preventDefault()
        setViewData(articleInfos.source)
    };
    const checkCanUpload = () => {
        if(!account)
            return false;
        if (svgInfos.parseOver) {
            if (svgInfos.allHashs.length === 0)
                return true;
            // eslint-disable-next-line
            for (let status in hashStatus)
                if (!hashStatus[status])
                    return false
        return true
        } else {
            return false;
        }
    };

    //监听事件
    useEffect(() => {
        if (article_admin && account) {
            let stale = false;
            // A filter that matches my Signer as the author
            let filter = article_admin.filters.AddArticleSuc(account);
            article_admin.on(filter, (author, title, event) => {
                if(!stale)
                    showSnackbar(t("save_article_suc").replace("{title}",title),'success')
            });
            return() => {
                stale = true;
                article_admin.removeAllListeners('AddArticleSuc');
            }
        }
    }, [article_admin, account,showSnackbar,t])

    //显示图片状态
    useEffect(() => {
        if (svg_hash_contract && svgInfos.allHashs.length > 0) {
            let validHashs = []
            // eslint-disable-next-line
            for (let _hash of svgInfos.allHashs) {
                if (validHashs.indexOf(_hash) === -1)
                    validHashs.push(_hash)
            }
            let allPromise = []
            //todo 获取每个hash是否有过提交的状态，记住promise.all是顺序返回的，所以这里最好采用下标方式容易对应
            for (let i = 0; i < validHashs.length; i++) {
                let _hash = validHashs[i];
                allPromise.push(svg_hash_contract.hasCode(_hash));
            }
            Promise.all(allPromise).then(results => {
                let status = {};
                for (let j = 0; j < results.length; j++) {
                    status[validHashs[j]] = results[j]
                }
                setHashStatus(status)
            }).catch(err => console.log(err));
        }
    }, [svgInfos, svg_hash_contract])

    //刷新上传图片的状态
    useEffect(() => {
        if (svg_admin_contract && account) {
            let stale = false;
            let filter = svg_admin_contract.filters.AddSvgCode(account)
            svg_admin_contract.on(filter, (user,isPublic, amount,hash,event) => {
                if(!stale)
                    setHashStatus(_oldStatus => {
                        return {
                            ..._oldStatus,
                            [hash]: true
                        }
                    });
            });
            return() => {
                stale = true;
                svg_admin_contract.removeAllListeners('AddSvgCode');
            }
        }
    }, [svg_admin_contract,account])

    // 刷新图片内容
    const ref = useRef()
    useEffect(() => {
        if (ref.current && viewData) {
            ref.current.innerHTML = viewData
        }

    }, [viewData])

    const activeFlag = account && svg_hash_contract
    return (<>
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("input_source_code")}</h4>
                <p className={classes.cardCategoryWhite}>
                    {t("can_edit_source")}
                </p>
            </CardHeader>
            <CardBody>
                <TextField id="outlined-multiline-static" multiline rows="10" label={t("copy_source")}
                    // defaultValue=""
                    value={articleInfos.source} className={classes.textField} margin="normal" onChange={handleChange('source')} variant="outlined"/>
                <ButtonWrapper>
                    <Button variant="contained" onClick={reset} className={classes.transferButton}>
                        {t('reset')}
                    </Button>
                    <Button variant="contained" onClick={preview} className={classes.transferButton}>
                        {t('preview')}
                    </Button>
                </ButtonWrapper>
            </CardBody>
        </Card>
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("preview_article")}</h4>
                <p className={classes.cardCategoryWhite}>
                    {t("click_parse")}
                </p>
            </CardHeader>
            <CardBody>
                {
                    viewData && <> <div ref = {ref} />
                        <ButtonWrapper>
                            <Button variant="contained" onClick={parseArticle} className={classes.transferButton}>
                                {t("parse")}
                            </Button>
                        </ButtonWrapper>
                    </>
                }
            </CardBody>
        </Card>
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("upload_image")}</h4>
                <p className={classes.cardCategoryWhite}>
                    {t('after_upload_image')}
                </p>
            </CardHeader>
            <CardBody>
                <Container className={classes.cardGrid} maxWidth={'xl'}>
                    <Grid container spacing={4}>
                        {svgInfos.allHashs.map((hash, index) => (<AlbumSvgItem key={hash + index} url={svgInfos.allCodes[hash]} active={activeFlag} hasCode={hashStatus[hash]} onUpload={onUpload(hash)}/>))}
                    </Grid>
                </Container>
            </CardBody>
        </Card>
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("upload_article")}</h4>
                <p className={classes.cardCategoryWhite}>
                    {t('after_upload_image')}
                </p>
            </CardHeader>
            <CardBody>
                <div className={classes.typo}>
                    <div className={classes.note}>

                            {t("article_title") + ":"}

                    </div>
                    <CustomInput formControlProps={{
                            className: classes.addressTxt
                        }} inputProps={{
                            placeholder: t("input_article_title"),
                            inputProps: {
                                "aria-label": "SetTitle"
                            },
                            value:articleInfos['title'],
                            onChange: handleChange('title')
                        }}/>
                </div>
                <div className={classes.typo}>
                    <div className={classes.note}>

                            {t("article_label") + ":"}
                    </div>
                    <CustomInput formControlProps={{
                            className: classes.addressTxt
                        }} inputProps={{
                            placeholder: t("input_article_label"),
                            inputProps: {
                                "aria-label": "SetLabel"
                            },
                            value:articleInfos['label'],
                            onChange: handleChange('label')
                        }}/>
                </div>
                <ButtonWrapper>
                    <Button variant="contained" disabled={!checkCanUpload()} onClick={uploadArticle} className={classes.transferButton}>
                        {t('upload')}
                    </Button>
                </ButtonWrapper>
            </CardBody>
        </Card>
    </>)
}

TypographyPage.propTypes = {
    classes: PropTypes.object
};
