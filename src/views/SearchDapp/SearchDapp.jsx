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
import Search from "@material-ui/icons/Search";
import Pagination from "material-ui-flat-pagination"
import CustomInput from "components/CustomInput/CustomInput.jsx";
import Button from '@material-ui/core/Button';
import GridItem from "components/Grid/GridItem.jsx";
import GridContainer from "components/Grid/GridContainer.jsx";
import Table from "components/Table/TableOnClick.jsx";
import { withRouter } from 'react-router'
// import {useWeb3Context} from 'web3-react';
import { useStoreAdminContract,useStoreInfoContract } from 'hooks';
import { useSnackbarContext } from 'contexts/SnackBarProvider.jsx';
import { isMobile } from 'react-device-detect'
import { ethers } from 'ethers'
import { useTranslation } from 'react-i18next'
import { isAddress,getIndexArray,convertTimetoTimeString } from 'utils'

const PAGE_SIZE = 10;
const ZERO_ADDRESS = ethers.constants.AddressZero

const useStyles = makeStyles(theme => ({
    cardCategoryWhite: {
        // color: "rgba(33,33,33,.99)",
        color: "white",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
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
   addressTxt:{
      fontSize:isMobile ? "13px" : "18px",
      marginLeft:isMobile ? 20 : 0,
      width:"60%"
  },
    typo: {
    paddingLeft: "25%",
    marginBottom: "20px",
    position: "relative"
  },
  typoTwo: {
    paddingLeft: "25%",
    marginBottom: "20px",
    marginTop:"-40px",
    position: "relative"
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
let infoInit = {
    amount:-1,
    address:'',
    label:''
}

let queryValuesInit = {
    dapp_name_query:'',
    dapp_id_query:'',
    dapp_address_query:'',
    dapp_creator_query:"",
    dapp_label_query:''
}

function SearchDapp({history}) {
    const classes = useStyles()
    const {t} = useTranslation()
    const store_info = useStoreInfoContract()
    const [offset,setOffset] = useState(0)
    const [info,setInfo] = useState(infoInit)
    const [tableData,setTableData] = useState([])
    const [queryValues,setqueryValues] = useState(queryValuesInit)
    const [amount,setAmount] = useState(0)
    const showSnackbar= useSnackbarContext()
    const [inPanel,setInPanel] = useState(true)
    const [currentSelect,setCurrentSelect] = useState('')
    const [queryLabel,setQueryLabel] = useState('')
    const [queryCreator,setQueryCreator] = useState('')
    // const [idArray,setIdArray] = useState([])

    const handleChange = name => event => {
        setqueryValues({
            ...queryValues,
            [name]: event.target.value,
        });
    };

    const getQueryFuncByKey = (key) => {
        switch (key) {
            case "dapp_name_query":
                return queryByName
            case "dapp_id_query":
                return queryById
            case "dapp_address_query":
                return queryByAddress
            case "dapp_label_query":
                return queryByLabel
            case "dapp_creator_query":
                return queryByCreator
            default:

        }
    }

    const queryById = async () => {
        let id = queryValues.dapp_id_query
        if(!id) {
            return showSnackbar(t('empty_input'),"error")
        }
        id = +id
        let int_id = Math.floor(id)
        if(id !== int_id) {
            showSnackbar(t('must_int'),"error")
        }else {
            let infos = await store_info.allStoreInfos(int_id);
            if(inPanel) {
                if(infos[0] === ZERO_ADDRESS) {
                    setTableData([])
                    setAmount(0)
                    return showSnackbar(t("no_dapp"),'info')
                }else{
                    let name = infos[4]
                    let _createTime = convertTimetoTimeString((+ infos[3]) * 1000)
                    let label = infos[6]
                    setAmount(1)
                    setTableData([[int_id.toString(),name,label,_createTime]])
                }
            }
        }
    };

    const queryByName = async () => {
        let name = queryValues.dapp_name_query
        if(!name) {
            return showSnackbar(t('empty_input'),"error")
        }
        let infos = await store_info.getStoreInfoByName(name);
        if(inPanel) {
            if(infos[0] === ZERO_ADDRESS) {
                setTableData([])
                setAmount(0)
                return showSnackbar(t("no_dapp"),'info')
            }else{
                let id = infos[2].toString()
                let label = infos[6]
                let _createTime = convertTimetoTimeString((+ infos[3]) * 1000)
                setAmount(1)
                setTableData([[id,name,label,_createTime]])
            }
        }
    };
    const queryByAddress = async () => {
        let address = queryValues.dapp_address_query
        if(!address || !isAddress(address)) {
            return showSnackbar(t('invalid_address'),"error")
        }
        let id = await store_info.storeId(address);
        let infos = await store_info.allStoreInfos(id)
        if(inPanel) {
            if(infos[0] === ZERO_ADDRESS) {
                setTableData([])
                setAmount(0)
                return showSnackbar(t("no_dapp"),'info')
            }else{
                let name = infos[4]
                let label = infos[6]
                let _createTime = convertTimetoTimeString((+ infos[3]) * 1000)
                setAmount(1)
                setTableData([[id.toString(),name,label,_createTime]])
            }
        }
    };
    const queryByLabel = async () => {
        let param_label = queryValues.dapp_label_query
        // let param_label = label
        if(!param_label) {
            return showSnackbar(t('empty_input'),"error")
        }
        setCurrentSelect('')
        let count = await store_info.getLabelStoreCount(param_label)
        count = + count
        if(inPanel) {
            if(count === 0) {
                setTableData([])
                setAmount(0)
                return showSnackbar(t("no_dapp"),'info')
            }else {
                //todo
                setTableData([])
                setAmount(0)
                if(count === 1) {
                    console.log("label:",param_label)
                    let infos = await store_info.getLabelStoreInfoByIndex(param_label,0)
                    let id = infos[2].toString()
                    let name = infos[4]
                    let label = infos[6]
                    let _createTime = convertTimetoTimeString((+ infos[3]) * 1000)
                    if(inPanel){
                        setAmount(1)
                        setTableData([[id,name,label,_createTime]])
                    }
                }else {
                    setQueryLabel(param_label)
                    setAmount(count)
                    setCurrentSelect('label')
                }
            }
        }
    };

    const queryByCreator = async () => {
        let creator = queryValues.dapp_creator_query
        if(!creator || !isAddress(creator)) {
            return showSnackbar(t('invalid_address'),"error")
        }
        setCurrentSelect('')
        let count = await store_info.getUserStoreCount(creator)
        count = + count
        if(inPanel) {
            if(count === 0) {
                setTableData([])
                setAmount(0)
                return showSnackbar(t("no_dapp"),'info')
            }else {
                setTableData([])
                setAmount(0)
                if(count === 1) {
                    let infos = await store_info.getUserStoreInfoByIndex(creator,0)
                    let id = infos[2].toString()
                    let name = infos[4]
                    let label = infos[6]
                    let _createTime = convertTimetoTimeString((+ infos[3]) * 1000)
                    if(inPanel){
                        setAmount(1)
                        setTableData([[id,name,label,_createTime]])
                    }
                }else {
                    setQueryCreator(creator)
                    setAmount(count)
                    setCurrentSelect('creator')
                }
            }
        }
    };

    useEffect(()=>{
       return () => setInPanel(false)
    },[])

    useEffect(() => {
        if(store_info && amount > 1 && currentSelect ) {
            let stale = false
            let indexArray = getIndexArray(amount,PAGE_SIZE,offset)
            let allPromise = []

            for(let i=0;i<indexArray.length;i++){
                let index = indexArray[i]
                if(currentSelect === 'label') {
                    allPromise.push(store_info.getLabelStoreInfoByIndex(queryLabel,index).catch(()=>{}))
                }else{
                    allPromise.push(store_info.getUserStoreInfoByIndex(queryCreator,index).catch(()=>{}))
                }
            }
            let data = []
            Promise.all(allPromise,results =>{
                for(let j=0;j<indexArray.length;j++) {
                    let infos = results[j]
                    let id = infos[2].toString()
                    let name = infos[4]
                    let label = infos[6]
                    let _createTime = convertTimetoTimeString((+ infos[3]) * 1000)
                    data.push([id,name,label,_createTime])
                }
                if(!stale) {
                    setTableData(data)
                }
            })

            return ()=>{
                stale = true
            }
        }
    },[store_info,amount,currentSelect,offset,queryLabel.queryCreator])

    function showTableData() {
        return (
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <Card plain>
                  <CardHeader plain color="primary">
                    <h4 className={classes.cardTitleWhite}>
                        { t("dapp_amount").replace("{amount}",amount)}
                    </h4>
                    <p className={classes.cardCategoryWhite}>
                      {t("show_dapp_view")}
                    </p>
                  </CardHeader>
                  <CardBody>
                    <Table
                      tableHeaderColor="primary"
                      tableHead={[t("id"),t("name"),t('label'),t("create_time")]}
                      tableData={tableData}
                    />
                  </CardBody>
                </Card>
                <div className = {classes.buttonWrapper}>
                    <Pagination
                     limit={PAGE_SIZE}
                     offset={offset}
                     total={amount}
                     size ='large'
                     onClick={(e,_offset) => {
                          if(_offset === offset)
                              return;
                          setOffset(_offset)
                     }}
                   />
                </div>
              </GridItem>
            </GridContainer>
        )
    }

    function showSearchUI() {
        let keys = []
        for(let key in queryValuesInit) {
            keys.push(key)
        }
        return  keys.map((key,index) =>
            <div className={classes.typoTwo} key={index}>
                <div className={classes.note} >
                        {t(key)}
                </div>
                <div className={classes.searchWrapperLeft} >
                    <CustomInput
                        formControlProps={{
                            className:classes.addressTxt
                        }}
                        inputProps={{
                            placeholder: t("input" + key),
                            inputProps: {
                                "aria-label": key
                            },
                            onChange:handleChange(key)
                        }}
                   />
                   <Button color="primary" aria-label="edit" onClick={getQueryFuncByKey(key)} justicon="true" round="true">
                       <Search />
                   </Button>
               </div>
            </div>)
    }

    return (<>
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("search_dapp")}</h4>
            </CardHeader>
            <CardBody>
                {showSearchUI()}
            </CardBody>
        </Card>
        {showTableData()}
    </>)
}

SearchDapp.propTypes = {
    classes: PropTypes.object
};

export default withRouter(SearchDapp)
