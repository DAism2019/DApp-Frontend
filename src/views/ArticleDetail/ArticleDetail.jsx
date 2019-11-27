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
import {makeStyles} from '@material-ui/core/styles';
import { withRouter } from 'react-router'
import Button from '@material-ui/core/Button';
import copy from 'copy-to-clipboard'
import { isMobile } from 'react-device-detect'
import {useSvgHashNewContract,useArticleAdminContract,useArticleInfoContract} from 'hooks';
import { useSnackbarContext } from 'contexts/SnackBarProvider.jsx';
import { useTranslation } from 'react-i18next'
import {reactLocalStorage} from 'reactjs-localstorage'
import { NETWORK_NAME } from 'utils'

const HASH_START = '<hashsvg>'
const HASH_END = '</hashsvg>'
const tokenId = process.env.REACT_APP_TOKEN || "demeinfo";
const network_id = process.env.REACT_APP_NETWORK_ID || "1";
const network_name = NETWORK_NAME[network_id] || 'localhost';


const useStyles = makeStyles(theme => ({
    cardCategoryWhite: {
        // color: "rgba(33,33,33,.99)",
        color: "white",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
    },
    copyText:{
     // width:"100%",
     textAlign:"right",
     textDecoration:"underline",
     fontSize:"13px",
     marginBottom: isMobile ? theme.spacing(0) : theme.spacing(-2)
    },
    RewardText:{
     // width:"100%",
     textAlign:"left",
     // textDecoration:"underline",
     color:"red",
     fontSize:isMobile?"13px":"18px",
     // marginBottom: isMobile ? theme.spacing(-1) : theme.spacing(-5)
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
    buttonWrapper:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }
}));

// let allArticle = {}

function ArticleDetail({history}) {
    const classes = useStyles()
    const {t} = useTranslation()
    const hash = history.location.hash;
    const svg_hash_contract = useSvgHashNewContract()
    const article_admin = useArticleAdminContract()
    const article_info = useArticleInfoContract()
    const showSnackbar= useSnackbarContext()
    const [viewData, setViewData] = useState()
    const [showLabel,setShowLabel] = useState("")
    const [title,setTitle] = useState("")
    const [creator,setCreator] = useState('')


    const copyURL = (event)=>{
        event.preventDefault();
        if(copy(window.location.href)){
            showSnackbar(t("url_copied"),'info',null)
        }
    };
    // useEffect(()=>{
    //     console.log("....")
    //     setViewData(t('getting'))
    // },[t])

    useEffect(()=>{
        if(title){
            document.title = title;
        }else{
            document.title = 'DeMe';
        }
        return ()=>{
            document.title = 'DeMe';
        }
    },[t,title])

    useEffect(()=>{
        if(hash && article_info && svg_hash_contract && article_admin && hash.length > 1){
            let _hash = +(hash.substring(1));
            if(Number.isNaN(_hash) || _hash <= 0){
                setViewData(t('no_article'));
            }else{
                //HASH值存在，去拿数据
                let stale = false;
                async function parseContext(_creator,str,id) {
                    let start = str.indexOf(HASH_START);
                    let end = str.indexOf(HASH_END);
                    let final = end + HASH_END.length
                    if (start !== -1 && end !== -1) {
                        let subStr = str.substring(start + HASH_START.length , end);
                        let svg_code = await svg_hash_contract.getCode(subStr)
                        let newStr = str.substring(0, start)  + svg_code + str.substring(final)
                        parseContext(_creator,newStr,id)
                    } else {
                        // allArticle["" + id] = str
                        if( id <= 2){
                            str = str.replace(/www.honor.io/g,'https://www.dhonor.io');
                            str = str.replace(/www.naturaldao.io/g,'https://www.naturaldao.io');
                        }else if (id === 3){
                            str = str.replace("https://dhonor.io/t/www.naturaldao.io",'https://www.naturaldao.io');
                            str = str.replace("https://dhonor.io/t/www.honor.io",'https://www.dhonor.io');
                        }
                        setViewData(str)
                        setCreator(_creator)
                    }
                }
                async function getArticleInfo() {
                    try{
                        //如果本地存在
                        let userProfile = reactLocalStorage.getObject(tokenId)
                        if(!userProfile[network_name]){
                            userProfile[network_name] = {}
                        }
                        let localInfos = userProfile[network_name]["" + _hash]
                        if(localInfos){
                            const {creator,title,label} = localInfos
                            let context = await article_info.getArticleContextByIndex(_hash);
                            if(!stale){
                                setShowLabel(label)
                                setTitle(title)
                                setViewData(t('getting'))
                                parseContext(creator,context,_hash)
                            }
                        }else{
                            let nonce = await article_admin.nonce();
                            nonce = + nonce;
                            if(_hash > nonce){
                                if(!stale){
                                    setViewData(t('no_article'));
                                    setShowLabel("");
                                    setTitle('');
                                    setCreator('')
                                }
                            }else{
                                let infos = await article_info.getArticleInfoByIndex(_hash);
                                let _creator = infos[0];
                                let _title = infos[1];
                                let _label = infos[2];
                                let _timestamp = + infos[3];
                                let context = await article_info.getArticleContextByIndex(_hash);
                                userProfile[network_name]["" + _hash] = {
                                    creator:_creator,
                                    title:_title,
                                    label:_label,
                                    timestamp:_timestamp
                                }
                                reactLocalStorage.setObject(tokenId,userProfile)
                                if(!stale){
                                    setShowLabel(_label)
                                    setTitle(_title)
                                    setViewData(t('getting'))
                                    parseContext(_creator,context,_hash)
                                }
                            }
                        }

                    }catch(err){
                        setViewData(t('no_article'));
                        setShowLabel("");
                        setTitle('');
                        setCreator('')
                    }
                }
                getArticleInfo();
                return ()=>{
                    stale = true
                }
            }
        }else{
            if(hash){
                setViewData(t('getting'));

            }else{
                setViewData(t('no_article'));
            }

            setShowLabel("");
            setTitle('');
        }
    },[hash,article_admin,article_info,svg_hash_contract,t])

    //显示文章详情
    const ref = useRef()
    useEffect(() => {
        if (ref.current && viewData) {
            ref.current.innerHTML = viewData
        }

    }, [viewData])

    return (<>
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("article_title") + ": " + title}</h4>
                <p className={classes.cardCategoryWhite}>
                  {t('article_label') + ": " + showLabel}
                </p>
            </CardHeader>
            <CardBody>
                {showLabel &&  <div className={classes.copyText}>
                    <Button onClick={copyURL} color='secondary'>
                      {t('click_share')}
                    </Button>
                 </div> }
                <div ref = {ref} />
                {creator &&  <div className={classes.RewardText}>
                    {t('reward_author')}
                    <div>
                        {creator}
                    </div>
                </div>}
            </CardBody>
        </Card>
    </>)
}

ArticleDetail.propTypes = {
    classes: PropTypes.object
};

export default withRouter(ArticleDetail)
