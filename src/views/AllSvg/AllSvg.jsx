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
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import {useSvgHashNewContract,useSvgAdminContract} from 'hooks';
import {useWeb3Context} from 'web3-react';
import Pagination from "material-ui-flat-pagination"
import GridItem from "components/Grid/GridItem.jsx";
import GridContainer from "components/Grid/GridContainer.jsx";
import AlbumSvgItemList from 'components/AlbumItem/AlbumSvgItemList.jsx'
import { useTranslation } from 'react-i18next'
import { getIndexArray } from 'utils'

const PAGE_SIZE = 8;
const SPLITTER = '_'
const useStyles = makeStyles(theme => ({
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
    buttonWrapper:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }
}));

//这里需要改进，比如我的图片和所有图片索引是固定的，直接比较索引是否变化就行

export default function TypographyPage() {
    const classes = useStyles()
    const {t} = useTranslation()
    const {account} = useWeb3Context()
    const svg_hash_contract = useSvgHashNewContract()
    const svg_admin_contract = useSvgAdminContract()
    const [offset,setOffset] = useState(0)
    const [publicOffset,setPublicOffset] = useState(0)
    const [amount,setAmount] = useState(-1)
    const [publicAmount,setPublicAmount] = useState(-1)
    const [mySvgIndexArray,setMySvgIndexArray] = useState('')
    const [publicSvgIndexArray,setPublicSvgIndexArray] = useState('')
    const [tableData,setTableData] = useState([])
    const [publicTableData,setPublicTableData] = useState([])

    // 切换账号时进行数据清除
    useEffect(()=>{
        setAmount(-1);
        setTableData([]);
        setOffset(0);
        setMySvgIndexArray('')
    },[account])


    //刷新所有图片数量
    useEffect(()=>{
        if(svg_admin_contract && svg_hash_contract) {
            let stale = false
            async function getPublicAmount() {
                let _publicAmount = await svg_hash_contract.getPublicHashAmount();
                _publicAmount =  + _publicAmount
                setPublicAmount(_publicAmount)
            }
            getPublicAmount()
            // let filter = svg_hash_contract.filters.AddSvgCode(null);
            svg_admin_contract.on("AddSvgCode",(user,isPublic, amount,hash,event) => {
                if(isPublic && !stale){
                    amount = + amount
                    setPublicAmount(amount)
                }
            })
            return() => {
                stale = true;
                svg_admin_contract.removeAllListeners('AddSvgCode')
            }
        }
    },[svg_admin_contract,svg_hash_contract])

    //刷新我的图片数量
    useEffect(()=>{
        if(account && svg_admin_contract && svg_hash_contract){
            let stale = false
            async function getAmount(){
                let _amount = await svg_hash_contract.getUserSvgAmount(account)
                _amount = + _amount
                setAmount(_amount)
            }
            getAmount()
            let filter = svg_admin_contract.filters.AddSvgCode(account)
            svg_admin_contract.on(filter, (user, isPublic, amount,hash,event) => {
                if(!isPublic && !stale){
                    amount = + amount
                    setAmount(amount)
                }
            })
            return() => {
                stale = true;
                svg_admin_contract.removeAllListeners('AddSvgCode')
            }
        }
    },[account,svg_admin_contract,svg_hash_contract])

    //刷新我的图片数组索引列表
    useEffect(()=>{
        if( amount > 0){
            let indexArray = getIndexArray(amount,PAGE_SIZE,offset);
            let _indexStr = indexArray.join(SPLITTER);
            setMySvgIndexArray(_indexStr);
        }
    },[amount,offset])

    //刷新我的图片信息
    useEffect(()=>{
        if(svg_hash_contract && account && mySvgIndexArray) {
            let _idArray = mySvgIndexArray.split(SPLITTER);
            let stale = false;
            function getInfoByIndex() {
                let allPromise = []
                for(let i=0;i<_idArray.length;i++){
                    let _id = _idArray[i]
                    allPromise.push(svg_hash_contract.getUserSvgByIndex(account,_id).catch(() => {}))
                }
                Promise.all(allPromise).then(results =>{
                    let _tableData = []
                    for(let j=0;j<_idArray.length;j++){
                        let _id = _idArray[j]
                        let result = results[j]
                        let _hash = result.hash
                        let _code = result.code
                        _tableData.push([_id,_hash,_code])
                    }
                    if(!stale){
                        setTableData(_tableData)
                    }

                });
            }
            getInfoByIndex()

            return ()=>{
                stale = true
            }
        }
    },[svg_hash_contract,account,mySvgIndexArray])

    //刷新公共图片索引
    useEffect(()=>{
        // console.log("offset 或者 amount变化")
        if( publicAmount > 0){
            let indexArray = getIndexArray(publicAmount,PAGE_SIZE,publicOffset);
            let indexPublicStr = indexArray.join(SPLITTER)
            setPublicSvgIndexArray(indexPublicStr);
        }
    },[publicAmount,publicOffset])

    //刷新公共图片信息
    useEffect(()=>{
        if(svg_hash_contract && publicSvgIndexArray ) {
            let _idArray = publicSvgIndexArray.split(SPLITTER)
             // console.log("刷新数组")
            let stale = false;
            function getInfoByIndex() {
                let allPromise = []
                for(let i=0;i<_idArray.length;i++){
                    let _id = + _idArray[i]
                    allPromise.push(svg_hash_contract.getPublicHashByIndex(_id).catch(() => {}))
                }
                Promise.all(allPromise).then(results =>{
                    let _tableData = []
                    for(let j=0;j<_idArray.length;j++){
                        let _id = + _idArray[j]
                        let result = results[j]
                        let _hash = result.hash
                        let _code = result.code
                        _tableData.push([_id,_hash,_code])
                    }
                    if(!stale){
                        setPublicTableData(_tableData)
                    }
                });
            }
            getInfoByIndex()
            return ()=>{
                stale = true
            }
        }
    },[svg_hash_contract,publicSvgIndexArray])


    return (<>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card >
              <CardHeader  color="primary">
                <h4 className={classes.cardTitleWhite}>
                  {t("show_all_svg")}
                </h4>
                <p className={classes.cardCategoryWhite}>
                    {publicAmount === -1 ? t('getting') :t('svg_amount').replace("{amount}",(publicAmount < 0 ? 0 :publicAmount))}
                </p>
              </CardHeader>
              <CardBody>
                  <Container className={classes.cardGrid} maxWidth={'xl'}>
                      <Grid container spacing={4}>
                          {publicTableData.map((data) => (<AlbumSvgItemList key={data[1]} url={data[2]} index={data[0]} hash={data[1]}/>))}
                      </Grid>
                  </Container>
              </CardBody>
            </Card>
            <div className = {classes.buttonWrapper}>
                <Pagination
                 limit={PAGE_SIZE}
                 offset={publicOffset}
                 total={publicAmount}
                 size ='large'
                 onClick={(e,_offset) => {
                      setPublicOffset(_offset)
                 }}
               />
            </div>
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card >
              <CardHeader  color="primary">
                <h4 className={classes.cardTitleWhite}>
                  {t("show_my_svg")}
                </h4>
                <p className={classes.cardCategoryWhite}>
                    {amount === -1 && account ? t('getting') :t('svg_amount').replace("{amount}",(amount < 0 ? 0 :amount))}
                </p>
              </CardHeader>
              <CardBody>
                  <Container className={classes.cardGrid} maxWidth={'xl'}>
                      <Grid container spacing={4}>
                          {tableData.map((data) => (<AlbumSvgItemList key={data[1]} url={data[2]} index={data[0]} hash={data[1]}/>))}
                      </Grid>
                  </Container>
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
    </>)
}

TypographyPage.propTypes = {
    classes: PropTypes.object
};
