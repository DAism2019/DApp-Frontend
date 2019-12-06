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
// React components
import React, {useState, useEffect} from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import Card from "components/Card/Card.jsx";
import CardHeader from "components/Card/CardHeader.jsx";
import CardBody from "components/Card/CardBody.jsx";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
// import copy from 'copy-to-clipboard'
import { isMobile } from 'react-device-detect'
import { useMethodInfoContract,useMethodAdminContract} from 'hooks';
import { useSnackbarContext } from 'contexts/SnackBarProvider.jsx';
import { useTranslation } from 'react-i18next'
import Pagination from "material-ui-flat-pagination"
import {useWeb3Context} from 'web3-react';
import { getIndexArray,calculateGasMargin} from 'utils'
import { utils } from 'ethers'
// import * as txDecoder from 'ethereum-tx-decoder';

const GAS_MARGIN = utils.bigNumberify(1000);
const PAGE_SIZE = 10;


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
      transferButton: {
        margin: theme.spacing(2),
        width:isMobile ? "40%" :"10%",
        backgroundColor:'#FF8623'
      },
    buttonWrapper:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    buttonWrapperTwo:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent:"center",
    },
    ContentWrapper:{
        fontSize:isMobile ? "13px" : "18px",
        fontWeight: "300",
        lineHeight:"0.7",
    }
}));

function MethodInfos({id}) {
    const classes = useStyles()
    const {t} = useTranslation()
    const {account} = useWeb3Context();
    const method_info_contract = useMethodInfoContract()
    const method_admin_contract = useMethodAdminContract()
    const showSnackbar= useSnackbarContext()
    const [methodCount,setMethodCount] = useState(0)
    const [offset,setOffset] = useState(0)
    const [indexArray,setIndexArray] = useState([])
    const [methodInfo,setMethodInfo] = useState([])

    //refresh method amount and index array
    useEffect(()=>{
        if(id && method_info_contract && method_admin_contract) {
            let stale = false;
            async function getMethodCount() {
                let amount = await method_info_contract.getStoreMethodCount(id)
                if(!stale){
                    setMethodCount( +amount);
                }
            }
            //todo test
            let filter = method_admin_contract.filters.AddOneMethodSuc(null,id);
            let filter2 = method_admin_contract.filters.RemoveMethodSuc(null,id);
            let filter3 = method_admin_contract.filters.UpdateMethodSuc(null,id);
            method_admin_contract.on(filter,(creator,storeId,amount,event) =>{
                console.log("receive a addmethod event")
                setMethodCount(+amount)
            })
            method_admin_contract.on(filter2,(creator,storeId,index,amount,event) =>{
                console.log("receive a remove method event")
                setMethodCount(+amount)
            })
            //todo update only one method
            method_admin_contract.on(filter3,(creator,storeId,index,event) =>{
                method_info_contract.getStoreMethodCount(id).then(amount =>{
                    let _count = + amount;
                    let _indexArray = getIndexArray(_count,PAGE_SIZE,offset);
                    if(!stale){
                        setIndexArray(_indexArray)
                    }
                });
            })
            getMethodCount()
            return ()=>{
                stale = true;
                method_admin_contract.removeAllListeners('AddOneMethodSuc');
                method_admin_contract.removeAllListeners('RemoveMethodSuc');
                method_admin_contract.removeAllListeners('UpdateMethodSuc');
            }
        }
    },[id,method_info_contract,method_admin_contract,offset])

    //refresh method info
    useEffect(()=> {
        if(id && method_info_contract && indexArray.length > 0) {
            let stale = false;
            function getMethodInfo() {
                let allPromise = [];
                for (let i=0;i<indexArray.length;i++){
                    let _index =indexArray[i];
                    allPromise.push(method_info_contract.allStoreMethodInfos(id,_index));
                }
                Promise.all(allPromise).then(results =>{
                    let _methodInfo = []
                    for(let j=0;j<indexArray.length;j++){
                        let info = results[j];
                        let to = info[0];
                        let isPayable = info[1];
                        let value = info[2];
                        let infos = info[3];
                        let data = info[4];
                        let isHidden = info[5];
                        let _id = indexArray[j];
                        _methodInfo.push([_id,to,isPayable,value,infos,data,isHidden])
                    }
                    if(!stale){
                        setMethodInfo(_methodInfo)
                    }
                });
            }
            getMethodInfo()
            return () =>{
                stale = true;
            }
        }

    },[indexArray,id,method_info_contract])

    //refresh idArray
    useEffect(()=>{
        if(methodCount > 0){
            let _indexArray = getIndexArray(methodCount,PAGE_SIZE,offset);
            setIndexArray(_indexArray)
        }
    },[methodCount,offset])

    function showMethodTable() {
        return (
            methodInfo.map((row,index) => (
                showOneMethod(row,index)
            ))
        )
    }

    function showOneMethod(row,index) {
        if(row[4] ==='infos_skip'){
            row[4] = "skip_name|skip_des|uint256|300"
        }
        let [,to,isPayable,value,infos,data,isHidden] = row
        infos = infos.split('|');
        let [name,description,paramType,paramDemo] = infos;
        paramType = paramType || ''
        let allParam = paramType.split(',');
        return (
            <Card key={index}>
                {/* <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>{t("dapp_method_name") + ": " + name}</h4>
                </CardHeader> */}
                <CardBody>
                    <p className={classes.ContentWrapper}>
                      {t("dapp_method_name") + ": " + name}
                    </p>
                    {isMobile ? <>
                        <p className={classes.ContentWrapper}>
                          {t("method_description") + ":"}
                        </p>
                        <p className={classes.ContentWrapper}>
                          {description}
                        </p>
                        <p className={classes.ContentWrapper}>
                          {t("method_to") + ":"}
                        </p>
                        <p className={classes.ContentWrapper}>
                          {to}
                        </p>
                    </>
                    : <>
                        <p className={classes.ContentWrapper}>
                            {t("method_description") + ": " + description}
                        </p>
                        <p className={classes.ContentWrapper}>
                          {t("method_to") + ": "  + to}
                        </p>
                    </>}
                    <p className={classes.ContentWrapper}>
                      {t("method_isPayable") + ": "  + isPayable}
                    </p>
                    <p className={classes.ContentWrapper}>
                      {t("method_value") + ": "  + utils.formatEther(value) + " ETH"}
                    </p>
                    { allParam.map((param,paramIndex) => (
                        <p className={classes.ContentWrapper} key={paramIndex}>
                          {t("param_type").replace("{index}",paramIndex +1 ) + ": " + param}
                        </p>
                    ))}
                    {isMobile ? <>
                        <p className={classes.ContentWrapper}>
                          {t("param_demo") + ":"}
                        </p>
                        <p className={classes.ContentWrapper}>
                          {paramDemo==='none' ? "" : paramDemo}
                        </p>
                    </>
                    : <>
                        <p className={classes.ContentWrapper}>
                            {t("param_demo") + ": " + (paramDemo==='none' ? "" : paramDemo)}
                        </p>
                    </>}
                    <div className={classes.buttonWrapper}>
                       <Button variant="contained" disabled ={!account}  className={classes.transferButton}>
                             {t("change")}
                       </Button>
                       <Button variant="contained" disabled ={!account}  className={classes.transferButton}>
                             {t("delete")}
                       </Button>
                    </div>
                </CardBody>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("dapp_method_admin")}</h4>
            </CardHeader>
            <CardBody>
                {showMethodTable()}
                <div className = {classes.buttonWrapper}>
                    <Pagination
                     limit={PAGE_SIZE}
                     offset={offset}
                     total={methodCount}
                     size ='large'
                     onClick={(e,_offset) => {
                          if(_offset === offset)
                              return;
                          setOffset(_offset)
                     }}
                   />
                </div>
            </CardBody>
        </Card>
   )
}

MethodInfos.propTypes = {
    classes: PropTypes.object
};

export default MethodInfos
