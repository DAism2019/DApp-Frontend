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
import CustomInput from "components/CustomInput/CustomInput.jsx";
import Button from '@material-ui/core/Button';
import { useTranslation } from 'react-i18next'
import {useWeb3Context} from 'web3-react';
import { useSnackbarContext } from 'contexts/SnackBarProvider.jsx';
import { useStoreAdminContract,useStoreInfoContract } from 'hooks';
import { isMobile } from 'react-device-detect'
import { withRouter } from 'react-router'
import {isAddress,calculateGasMargin} from 'utils'
import { utils } from 'ethers'

const GAS_MARGIN = utils.bigNumberify(1000);

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
    contextWrapper:{
      marginLeft:isMobile ? 20 : 0,
      fontSize:isMobile ? "13px" : "18px",
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
    }
}));

const registerInfoInit = {
    address:'',
    name:'',
    description:'',
    label:'',
    website:''
}

function RegisterDapp({history}) {
    const classes = useStyles()
    const { account } = useWeb3Context()
    const {t} = useTranslation()
    const store_admin = useStoreAdminContract()
    const store_info = useStoreInfoContract()
    const [fee,setFee] = useState(-1)
    const showSnackbar= useSnackbarContext()
    const [registerInfo,setRegisterInfo] = useState(registerInfoInit)
    const [inPanel,setInPanel] = useState(true)

    const handleChange = name => event => {
        let value = event.target.value
        setRegisterInfo({
            ...registerInfo,
            [name]:value
        })
    }

    const checkRegister = async () =>{
        const {name,address,description,label,website} = registerInfo
        if(!name || !address || !description || !label) {
            return showSnackbar(t('empty_input'),"error")
        }
        // let _webSite = website || 'none'
        if(!isAddress(address)) {
            return showSnackbar(t('invalid_address'),'error')
        }

        if(store_info){
            let hasRegister = await store_info.isNameRigstered(name)
            if(hasRegister) {
                if(inPanel)
                    return showSnackbar(t("name_has_register"),"info")
            }
            hasRegister = await store_info.isRegistered(address)
            if(hasRegister) {
                if(inPanel)
                    return showSnackbar(t("address_has_register"),"info")
            }
            if(inPanel) {
                doRegister(name,address,description,label,website)
            }
        }
    };

    const doRegister = async (name,address,description,label,website) => {
        let estimate = store_admin.estimate.registerDappStore
        let method = store_admin.registerDappStore
        let args = [address,name,description,label,website]
        let value = fee
        const estimatedGasLimit = await estimate(...args, { value })
        method(...args, {
            value,
            gasPrice:utils.parseUnits('10.0','gwei'),
            gasLimit: calculateGasMargin(estimatedGasLimit, GAS_MARGIN) })
        .then(response => {
            showSnackbar(t('transaction_send_success'),'success')
        })
    }

    useEffect(()=>{
       return () => setInPanel(false)
    },[])

    //refresh register fee
    useEffect(() => {
        if(store_admin) {
            let stale = false;
            store_admin.getRegisterFee().catch(()=>{}).then( _fee => {
                if(!stale){
                    setFee(_fee)
                }
            })
            return () => {
                stale = true
            }
        }
    },[store_admin])

    //link while register dao successfully
    useEffect(()=>{
        if(store_admin && account) {
            let filter = store_admin.filters.RegisterDappSuc(account)
            store_admin.on(filter,(creator,store,id,name,event) => {
                showSnackbar((t('register_dapp_suc')).replace('{name}',name),"success",()=>{
                    history.push("/mine");
                })
            })

            return () =>{
                store_admin.removeAllListeners('RegisterDappSuc')
            }
        }
    },[store_admin,account,showSnackbar,t,history])

    let canRegister = store_admin && account
    let tip = fee === -1 ? t("getting") : (utils.formatEther(fee) + " ETH")
    return (<>
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("register_dapp")}</h4>
                <p className={classes.cardCategoryWhite}>
                  {t('register_fee') + ": "  + tip}
                </p>
            </CardHeader>
            <CardBody>
                <div className={classes.typo}>
                    <div className={classes.note} >
                             {t('dapp_name')+":"}
                    </div>
                    <div className={classes.searchWrapperLeft} >
                        <CustomInput
                            formControlProps={{
                                className:classes.addressTxt
                            }}
                            inputProps={{
                                placeholder: t("input_dapp_name"),
                                inputProps: {
                                    "aria-label": "dapp_name"
                                },
                                onChange:handleChange('name')
                            }}
                        />
                    </div>
               </div>
               <div className={classes.typo}>
                   <div className={classes.note} >
                            {t('dapp_address')+":"}
                   </div>
                   <div className={classes.searchWrapperLeft} >
                       <CustomInput
                           formControlProps={{
                               className:classes.addressTxt
                           }}
                           inputProps={{
                               placeholder: t("input_dapp_address"),
                               inputProps: {
                                   "aria-label": "dapp_address"
                               },
                               onChange:handleChange('address')
                           }}
                       />
                   </div>
              </div>
              <div className={classes.typo}>
                  <div className={classes.note} >
                           {t('dapp_description')+":"}
                  </div>
                  <div className={classes.searchWrapperLeft} >
                      <CustomInput
                          formControlProps={{
                              className:classes.addressTxt
                          }}
                          inputProps={{
                              placeholder: t("input_dapp_description"),
                              inputProps: {
                                  "aria-label": "dapp_description"
                              },
                              onChange:handleChange('description')
                          }}
                      />
                  </div>
              </div>

              <div className={classes.typo}>
                  <div className={classes.note} >
                         {t('dapp_label')+":"}
                  </div>
                  <div className={classes.searchWrapperLeft} >
                      <CustomInput
                          formControlProps={{
                              className:classes.addressTxt
                          }}
                          inputProps={{
                              placeholder: t("input_dapp_label"),
                              inputProps: {
                                  "aria-label": "dapp_label"
                              },
                              onChange:handleChange('label')
                          }}
                      />
                  </div>
              </div>
              <div className={classes.typo}>
                  <div className={classes.note} >
                          {t('dapp_website')+":"}
                  </div>
                  <div className={classes.searchWrapperLeft} >
                      <CustomInput
                          formControlProps={{
                              className:classes.addressTxt
                          }}
                          inputProps={{
                              placeholder: t("input_dapp_website"),
                              inputProps: {
                                  "aria-label": "dapp_website"
                              },
                              onChange:handleChange('website')
                          }}
                      />
                  </div>
               </div>
               <div className={classes.buttonWrapper}>
                   <Button variant="contained"
                        disabled = {!canRegister}
                        onClick={checkRegister} className={classes.transferButton}>
                        {t("register")}
                  </Button>
               </div>
            </CardBody>
        </Card>
    </>)
}

RegisterDapp.propTypes = {
    classes: PropTypes.object
};

export default  withRouter(RegisterDapp)
