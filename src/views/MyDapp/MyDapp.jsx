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
import { useStoreAdminContract,useStoreInfoContract } from 'hooks';
import { useSnackbarContext } from 'contexts/SnackBarProvider.jsx';
import {useWeb3Context} from 'web3-react';
import Pagination from "material-ui-flat-pagination"
import GridItem from "components/Grid/GridItem.jsx";
import GridContainer from "components/Grid/GridContainer.jsx";
import Table from "components/Table/TableOnClickIcon.jsx";
import { useTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { getIndexArray,convertTimetoTimeString } from 'utils'

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

function MyDapp({history}) {
    const classes = useStyles()
    const {account} = useWeb3Context()
    const {t} = useTranslation()
    const showSnackbar= useSnackbarContext()
    const store_info = useStoreInfoContract()
    const store_admin = useStoreAdminContract()
    const [offset,setOffset] = useState(0)
    const [amount,setAmount] = useState(-1)
    const [tableData,setTableData] = useState([])
    const [adminId,setAdminId] = useState(0)
    const [allResultInfo,setAllResultInfo] = useState([])

    const viewDapp = (id) => {
        history.push('/view#' + id)
    }

    const adminDapp = (id) => {
        setAdminId(id)
    }

    useEffect(()=>{
        setAmount(0)
        setTableData([])
        setAllResultInfo([])
        setAdminId(0)
    },[account])

    //refresh amount
    useEffect(()=>{
        if(account && store_info && store_admin){
            let stale = false
            async function getAmount(){
                let _amount = await store_info.getUserStoreCount(account)
                if(!stale){
                    setAmount( + _amount)
                }
            }
            let filter = store_admin.filters.RegisterDappSuc(account)
            store_admin.on(filter,(creator,store,id,name,event) => {
                getAmount()
            })
            getAmount()

            return() => {
                stale = true;
                store_admin.removeAllListeners('RegisterDappSuc')
            }
        }
    },[account,store_info,store_admin])

    //refresh list
    useEffect(()=>{
        if( store_info && account && amount > 0){
            let stale = false
            function getInfoByIndex(){
                let indexArray = getIndexArray(amount,PAGE_SIZE,offset)
                if(indexArray.length === 0)
                  return;
                let allPromise = []
                 for(let i=0;i<indexArray.length;i++){
                     allPromise.push(store_info.getUserStoreInfoByIndex(account,indexArray[i]).catch(() => {}))
                 }
                 Promise.all(allPromise).then(results =>{
                     let _tableData = []
                     for(let j=0;j<indexArray.length;j++){
                         let infos = results[j]
                         if(!infos) {
                             return
                         }
                         let id = infos[2]
                         let name = infos[4]
                         let label = infos[6]
                         _tableData.push([id.toString(),name,label])
                     }
                     if(!stale){
                         setAllResultInfo(results)
                         setTableData(_tableData)
                     }
                 }).catch((err)=>console.log(err));
            }
            getInfoByIndex()

            return ()=>{
                stale = true
            }
        }
    },[store_info,amount,account,offset])


    const showAdmin = adminId > 0 && account
    return (<>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card plain>
              <CardHeader plain color="primary">
                <h4 className={classes.cardTitleWhite}>
                    {amount === -1 && account ? t("getting") :t("dapp_amount").replace("{amount}",(amount < 0 ? 0 :amount))}
                </h4>
                {/* <p className={classes.cardCategoryWhite}>
                  {t("show_detail")}
                </p> */}
              </CardHeader>
              <CardBody>
                <Table
                  tableHeaderColor="primary"
                  tableHead={[t('id'),t("name"),t("label"),t("action")]}
                  tableData={tableData}
                  viewFunc = {viewDapp}
                  adminFunc = {adminDapp}
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
        {showAdmin &&
            <Card>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>{t("admin_dapp") + ": " }</h4>
                </CardHeader>
                <CardBody>

                </CardBody>
            </Card>
        }
    </>)
}

MyDapp.propTypes = {
    classes: PropTypes.object
};

export default withRouter(MyDapp)
