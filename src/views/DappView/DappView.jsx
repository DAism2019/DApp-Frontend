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
import React, {useState, useEffect} from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import Card from "components/Card/Card.jsx";
import CardHeader from "components/Card/CardHeader.jsx";
import CardBody from "components/Card/CardBody.jsx";
import {makeStyles} from '@material-ui/core/styles';
import { withRouter } from 'react-router'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import copy from 'copy-to-clipboard'
import { isMobile } from 'react-device-detect'
import { useStoreInfoContract,useMethodInfoContract,useMethodAdminContract} from 'hooks';
import { useSnackbarContext } from 'contexts/SnackBarProvider.jsx';
import { useTranslation } from 'react-i18next'
import Pagination from "material-ui-flat-pagination"
import {useWeb3Context} from 'web3-react';
import { getIndexArray,isAddress,convertTimetoTimeString,getEtherscanLink,
    getContract,calculateGasMargin,getWalletContract} from 'utils'
import { utils,constants } from 'ethers'
// import * as txDecoder from 'ethereum-tx-decoder';

const GAS_MARGIN = utils.bigNumberify(1000);
const PAGE_SIZE = 10;
const METHOD_SPLITTER = '|'
const PARAM_SPLITTER = ','

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
    ContentWrapper:{
        fontSize:isMobile ? "13px" : "18px",
        fontWeight: "300",
        lineHeight:"1.5",
    }
}));

const store_info_init = {
    creator:'',
    store:'',
    id:'',
    createTime:'',
    name:'',
    description:'',
    label:'',
    website:''
}

// const MY_MUTISIG_WALLET = '0xb22b64776b296182005AA50d5a76ec01CdcB8068'

function DappDetail({history}) {
    const classes = useStyles()
    const {t} = useTranslation()
    const hash = history.location.hash;
    const {library,networkId,account} = useWeb3Context();
    const store_info_contract = useStoreInfoContract()
    const method_info_contract = useMethodInfoContract()
    const method_admin_contract = useMethodAdminContract()

    const showSnackbar= useSnackbarContext()
    // show dapp infos
    const [hasApp,setHasApp] = useState(false)
    const [storeInfo,setStoreInfo] = useState(store_info_init)
    const [tip,setTip] = useState('')
    // show method infos
    const [methodCount,setMethodCount] = useState(0)
    const [offset,setOffset] = useState(0)
    const [indexArray,setIndexArray] = useState([])
    const [methodInfo,setMethodInfo] = useState([])
    const [paramInput,setParamInput] = useState({})
    const [call_info,setCall_Info] = useState({
        type:'',
        selected:-1
    })
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {


      setOpen(false);
      // setParamInput({})
      // setCall_Info({
      //     type:'',
      //     selected:-1
      // })
    };

    const copyURL = (event)=>{
        event.preventDefault();
        if(copy(window.location.href)){
            showSnackbar(t("url_copied"),'info',null)
        }
    };

    const changeInputParam = index => event => {
        let value = event.target.value
        setParamInput({
            ...paramInput,
            [index]:value
        })
    }


    const doCall = async () => {
        const {type,selected} = call_info
        let allParam = []
        if(selected >=0 ){
            let infos= methodInfo[selected][4]
            let [,,paramType,] = infos.split(METHOD_SPLITTER);
            allParam = paramType.split(PARAM_SPLITTER);
        }else{
            return
        }
        let args = []
        for(let i=0;i<allParam.length;i++) {
            let _value = paramInput["" + i]
            let _type = allParam[i]
            try {
                args.push(getValueByType(_type,_value,i))
            }catch(err) {
                console.log("error:",err)
                return
            }
        }
        let [,to,isPayable,value,infos,,] =  methodInfo[selected]
        let [name,,paramType,] = infos.split(METHOD_SPLITTER);
        let eth_value = constants.Zero
        if(isPayable) {
            if(value.gt(constants.Zero)) {
                eth_value = value
            }else{
                if(paramInput['call_value']) {
                    let _value = + paramInput['call_value']
                    if(!Number.isNaN(_value)) {
                        return showSnackbar(t('invalid_eth_value'))
                    }else{
                        eth_value = utils.parseEther(paramInput['call_value'])
                    }
                }
           }
        }
        //
        let address = null
        if(type==='multi') {
            address = isAddress(paramInput['multi_address'])
            if(!address) {
                return showSnackbar(t('invalid_multi_address'))
            }
        }
        let abi = getAbi(name,paramType)
        let contract = getContract(to,abi,library,account);
        //personal call
        if(type === 'single') {
            let estimate = contract.estimate[name]
            let method = contract[name]
            const estimatedGasLimit = await estimate(...args, { value:eth_value })
            handleClose()
            method(...args, {
                value:eth_value,
                gasPrice:utils.parseUnits('10.0','gwei'),
                gasLimit: calculateGasMargin(estimatedGasLimit, GAS_MARGIN) })
            .then(response => {
                showSnackbar(t('transaction_send_success'),'success')
            })
        }else{  //multi_sign_call
            let func = contract.interface.functions[name]
            let data = func.encode(args);
            let multi_args = [to,eth_value,data]
            let wallet_contract = getWalletContract(address,library,account)
            let method_multi = wallet_contract.submitTransaction
            let estimate = wallet_contract.estimate.submitTransaction
            const estimatedGasLimit = await estimate(...multi_args, { value:constants.Zero });
            handleClose()
            method_multi(...multi_args,{
                value:constants.Zero,
                gasPrice:utils.parseUnits('10.0','gwei'),
                gasLimit: calculateGasMargin(estimatedGasLimit, GAS_MARGIN),
            }).catch( err => {
                console.log(err);
            }).then(()=> showSnackbar(t("transaction_send_success"),'success'))
        }
    }

    //todo
    const getValueByType = (type,str,i) => {
        //todo array
        switch (type) {
            case 'uint256':
            case 'uint8':
            case 'uint16':
                let value = + str;
                if(Math.isNaN || Math.floor(value) !== value) {
                    showSnackbar(t("param_index_invalid").replace('{index}',(i+1)))
                    throw(new Error('number_error'))
                }
                return value
            case 'string':
                if(!str && str !== '0') {
                    showSnackbar(t("param_index_invalid").replace('{index}',(i+1)))
                     throw(new Error('string_error'))
                }
                return str
            case 'bool':
                if(!str || (str!=='true' && str !=='false')) {
                    showSnackbar(t("param_index_invalid").replace('{index}',(i+1)))
                    throw(new Error('bool_error'))
                }
                if(str ==='true'){
                    return true
                }else{
                    return false
                }
            case 'bytes':
                if(!str || str.substring(0,2) !== '0x') {
                    showSnackbar(t("param_index_invalid").replace('{index}',(i+1)))
                    throw(new Error('bytes_error'))
                }
                return str
            default:
                return str
        }
    }

    const callByIndex = index => async () => {
        setParamInput({})
        setCall_Info({
            type:"single",
            selected:index
        })
        handleClickOpen()
    }

    const multiCallByIndex = index => async () => {
        setParamInput({})
        setCall_Info({
            type:"multi",
            selected:index
        })
        handleClickOpen()
    };

    function getAbi(name,paramType) {
        let allParam = paramType.split(PARAM_SPLITTER);
        let param_str = '';
        for(let i=0;i<allParam.length;i++){
            param_str = param_str +  allParam[i] + " " + "parma" + i;
            if(i !== allParam.length -1) {
                param_str += ","
            }
        }
        let str = "function " + name + "(" + param_str  + ")"
        let abi = [str];
        return abi;
    }

    //refresh method amount and index array
    useEffect(()=>{
        if(storeInfo.id && method_info_contract && method_admin_contract) {
            let stale = false;
            async function getMethodCount() {
                let amount = await method_info_contract.getStoreMethodCount(storeInfo.id)
                if(!stale){
                    setMethodCount( +amount);
                }
            }
            let _id = utils.bigNumberify(storeInfo.id)
            // todo test
            let filter = method_admin_contract.filters.AddOneMethodSuc(null,_id);
            let filter2 = method_admin_contract.filters.RemoveMethodSuc(null,_id);
            let filter3 = method_admin_contract.filters.UpdateMethodSuc(null,_id);
            method_admin_contract.on(filter,(creator,storeId,amount,event) =>{
                console.log("receive a addmethod event")
                setMethodCount(+amount)
            })
            method_admin_contract.on(filter2,(creator,storeId,index,amount,event) =>{
                console.log("receive a remove method event")
                setMethodCount(+amount)
            })
            method_admin_contract.on(filter3,(creator,storeId,index,event) =>{
                console.log("receive a update method event")
                method_info_contract.getStoreMethodCount(storeInfo.id).then(amount =>{
                    let _count = + amount;
                    let _indexArray = getIndexArray(_count,PAGE_SIZE,offset);
                    if(_indexArray.indexOf(index) !== -1){
                        //todo update one method
                        if(!stale){
                            setIndexArray(_indexArray)
                        }

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
    },[storeInfo.id,method_info_contract,method_admin_contract,offset])

    //refresh method info
    useEffect(()=> {
        if(storeInfo.id && method_info_contract && indexArray.length > 0) {
            let stale = false;
            function getMethodInfo() {
                let allPromise = [];
                for (let i=0;i<indexArray.length;i++){
                    let _index =indexArray[i];
                    allPromise.push(method_info_contract.allStoreMethodInfos(storeInfo.id,_index));
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

    },[indexArray,storeInfo.id,method_info_contract])

    //refresh index str
    useEffect(()=>{
        if(methodCount > 0){
            let _indexArray = getIndexArray(methodCount,PAGE_SIZE,offset);
            setIndexArray(_indexArray)
        }
    },[methodCount,offset])

    //refresh idArray

    //show dapp
    useEffect(()=>{
        if(hash && store_info_contract && method_info_contract && hash.length > 1){
            let _hash = +(hash.substring(1));
            if(Number.isNaN(_hash) || _hash <= 0){
                setTip(t('search_dapp_first'));
            }else{
                //get infos of dapp
                setTip(t('getting'));
                let stale = false;
                async function getDappInfo() {
                    let infos = await store_info_contract.allStoreInfos(_hash);
                    let id = + infos[2];
                    if( _hash !== id){
                        if(!stale){
                           setTip(t('no_dapp'))
                        }
                    }else{

                        let creator = infos[0]
                        let store = infos[1]
                        let createTime = (+ infos[3]) * 1000
                        createTime = convertTimetoTimeString(createTime)
                        let name = infos[4]
                        let description = infos[5]
                        let label = infos[6]
                        let website = infos[7]
                        if(!stale){
                            setHasApp(true);
                            setTip(t("dapp_label") + ": " + label)
                            setStoreInfo({
                                creator,
                                store,
                                createTime,
                                name,
                                id,
                                description,
                                label,
                                website
                            });
                        }
                    }
                }
                getDappInfo()
                return ()=>{
                    stale = true
                }
            }
        }else{
            setTip(t('search_dapp_first'))
        }
    },[hash,store_info_contract,method_info_contract,t])


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
        infos = infos.split(METHOD_SPLITTER);
        let [name,description,paramType,paramDemo] = infos;
        paramType = paramType || ''
        let allParam = paramType.split(PARAM_SPLITTER);
        let link_url = getEtherscanLink(networkId,to,'address')
        return (
            <Card key={index}>
                <CardBody>
                    <div className={classes.ContentWrapper} >
                      {t("dapp_method_name") + ": " + name}
                    </div>
                    {isMobile ? <>
                        <div className={classes.ContentWrapper}>
                          {t("method_description") + ":"}
                        </div>
                        <div className={classes.ContentWrapper}>
                          {description}
                        </div>
                        <div className={classes.ContentWrapper}>
                          {t("method_to") + ":"}
                        </div>
                        <div className={classes.ContentWrapper}>
                            <a href={link_url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'underline'}}>
                                {to}
                            </a>

                        </div>
                    </>
                    : <>
                        <div className={classes.ContentWrapper}>
                            {t("method_description") + ": " + description}
                        </div>
                        <div className={classes.ContentWrapper}>
                          {t("method_to") + ": "}
                          <a href={link_url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'underline'}}>
                              {to}
                          </a>
                      </div>
                    </>}
                    <div className={classes.ContentWrapper}>
                      {t("method_isPayable") + ": "  + isPayable}
                    </div>
                    <div className={classes.ContentWrapper}>
                      {t("method_value") + ": "  + utils.formatEther(value) + " ETH"}
                    </div>
                    { allParam.map((param,paramIndex) => (
                        <div className={classes.ContentWrapper} key={paramIndex}>
                          {t("param_type").replace("{index}",paramIndex +1 ) + ": " + param}
                        </div>
                    ))}
                    {isMobile ? <>
                        <div className={classes.ContentWrapper}>
                          {t("param_demo") + ":"}
                        </div>
                        <div className={classes.ContentWrapper}>
                          {paramDemo}
                        </div>
                    </>
                    : <>
                        <div className={classes.ContentWrapper}>
                            {t("param_demo") + ": " + paramDemo}
                        </div>
                    </>}
                    <div className={classes.buttonWrapper}>
                       <Button variant="contained" disabled ={!account} onClick={callByIndex(index)} className={classes.transferButton}>
                             {t("single_call")}
                       </Button>
                       <Button variant="contained" disabled ={!account} onClick={multiCallByIndex(index)} className={classes.transferButton}>
                             {t("multi_call")}
                       </Button>
                    </div>
                </CardBody>
            </Card>
        )
    }

    function showMethodAmount() {
        return (
            <>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>{t("dapp_method_list")}</h4>
                        <p className={classes.cardCategoryWhite}>
                          {t("method_amount").replace("{amount}",(methodCount < 0 ? 0 :methodCount))}
                      </p>
                    </CardHeader>

                </Card>
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
            </>
        )
    }

    function showStoreInfos() {
        const { creator,store,id,createTime,description,website } = storeInfo;
        return (
            <div>
                {isMobile ? <>
                    <div className={classes.ContentWrapper}>
                      {t("dapp_address") + ":"}
                    </div>
                    <div className={classes.ContentWrapper}>
                        <a href = {getEtherscanLink(networkId,store,'address')} target="_blank" rel="noopener noreferrer" style={{textDecoration:'underline'}}>
                            {store}
                        </a>
                    </div>
                    <div className={classes.ContentWrapper}>
                      {t("creator_address") + ":"}
                    </div>
                    <div className={classes.ContentWrapper}>
                      {creator}
                    </div>
                </>
                : <>
                    <div className={classes.ContentWrapper}>
                        {t("dapp_address") + ": "}
                        <a href = {getEtherscanLink(networkId,store,'address')} target="_blank" rel="noopener noreferrer" style={{textDecoration:'underline'}}>
                            {store}
                        </a>
                    </div>
                    <div className={classes.ContentWrapper}>
                      {t("creator") + ": " + creator}
                    </div>

                </>
              }
              <div className={classes.ContentWrapper}>
                {t("dapp_id") + ": " + id}
              </div>
              {isMobile ? <>
                  <div className={classes.ContentWrapper}>
                    {t("create_time") + ":"}
                  </div>
                  <div className={classes.ContentWrapper}>
                    {createTime}
                  </div>
                  <div className={classes.ContentWrapper}>
                    {t("dapp_description") + ":"}
                  </div>
                  <div className={classes.ContentWrapper}>
                    {description}
                  </div>
                  <div className={classes.ContentWrapper}>
                    {t("dapp_website") + ":"}
                  </div>
                  <div className={classes.ContentWrapper}>
                      <a href={website} target="_blank" rel="noopener noreferrer" style={{textDecoration:'underline'}}>
                          {website}
                      </a>

                  </div>
              </>
              : <>
                  <div className={classes.ContentWrapper}>
                    {t("create_time") + ": " + createTime}
                  </div>
                  <div className={classes.ContentWrapper}>
                    {t("dapp_description") + ": " + description}
                  </div>
                  <div className={classes.ContentWrapper}>
                    {t("dapp_website") + ": "}
                    <a href={website} target="_blank" rel="noopener noreferrer">
                         {website}
                    </a>
                  </div>
              </>
            }
            </div>
        )
    }

    function showDialog() {
        const {type,selected} = call_info
        let allParam = []
        // let paramType = ''
        let name = ''
        let description = ''
        let isPayable = false
        let min_value = constants.Zero
        if(selected >=0 ){
            let infos= methodInfo[selected][4]
            isPayable = methodInfo[selected][2]
            min_value = methodInfo[selected][3]
            let method_info = infos.split(METHOD_SPLITTER);
            name = method_info[0]
            description = method_info[1]
            allParam = method_info[2].split(PARAM_SPLITTER);
        }
        const _title = (type==='multi' ? t('multi_call') : t('single_call') ) + ": " +  name
        return (
            <Dialog open={open} onClose={handleClose} fullWidth aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{_title}</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    {description}
                  </DialogContentText>
                  {allParam.map((parmaType,index) => (
                      <div key={index} style={{marginBottom:"10px"}}>
                          {t('input_param_index').replace('{index}',(index+1)) + ": "}
                          <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label={parmaType}
                            type="text"
                            value = {paramInput[index]}
                            fullWidth
                            onChange={changeInputParam(index)}
                          />
                      </div>
                  ))}
                  {isPayable &&  min_value.eq(constants.Zero)  && <div>
                      {t('method_call_value') + ": "}
                      <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label={t("input_method_call_value")}
                        type="text"
                        value = {paramInput['call_value']}
                        fullWidth
                        onChange={changeInputParam("call_value")}
                      />
                  </div>}

                  {type==='multi' && <div >
                      {t('multi_address') + ": "}
                      <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label={t('input_multi_sign_address')}
                        type="text"
                        value = {paramInput['multi_address']}
                        fullWidth
                        onChange={changeInputParam("multi_address")}
                      />
                  </div>}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    {t('cancel')}
                  </Button>
                  <Button onClick={doCall} color="primary">
                    {t('confirm')}
                  </Button>
                </DialogActions>
          </Dialog>
        )

    }

    return (<>
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("dapp_name") + ": " + storeInfo.name}</h4>
                <p className={classes.cardCategoryWhite}>
                  {tip}
                </p>
            </CardHeader>
            <CardBody>
                {hasApp &&  <div className={classes.copyText}>
                    <Button onClick={copyURL} color='secondary'>
                      {t('click_share')}
                    </Button>
                 </div> }
                {hasApp && showStoreInfos()}
            </CardBody>
        </Card>

        {hasApp && showMethodAmount()}
        {hasApp && methodInfo.length > 0  && showDialog()}
    </>)
}

DappDetail.propTypes = {
    classes: PropTypes.object
};

export default withRouter(DappDetail)
