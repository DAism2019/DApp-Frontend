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
import React, {useState} from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import Card from "components/Card/Card.jsx";
import CardHeader from "components/Card/CardHeader.jsx";
import CardBody from "components/Card/CardBody.jsx";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import CustomInput from "components/CustomInput/CustomInput.jsx";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
// import FormLabel from '@material-ui/core/FormLabel';
import { isMobile } from 'react-device-detect'
import { useMethodAdminContract} from 'hooks';
import { useSnackbarContext } from 'contexts/SnackBarProvider.jsx';
import { useTranslation } from 'react-i18next'

import { isAddress,calculateGasMargin } from 'utils'
import { utils,constants } from 'ethers'

const METHOD_SPLITTER = '|'

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
  noteTwo: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        color: "#00c1c2",
        fontWeight: "400",
        fontSize:  "18px",
        left: "0",
        marginLeft: isMobile ? "10px":"20px",
        marginTop:theme.spacing(3),
        marginBottom:theme.spacing(3),
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
    radioControl:{
     marginTop: theme.spacing(-2),
     // marginBottom:theme.spacing(1),
 },
}));

const methodInfoInit = {
    to:'',
    isPayable:'',
    eth_value:'',
    name:'',
    description:'',
    param_type:'',
    param_demo:''
}



function AddMethod({id}) {
    const [methodInfo,setMethodInfo] = useState(methodInfoInit)
    const method_admin = useMethodAdminContract()
    const {t} = useTranslation()
    const showSnackbar= useSnackbarContext()
    const classes = useStyles()

    const handleChange = name => event => {
        let value = event.target.value
        setMethodInfo({
            ...methodInfo,
            [name]:value
        })
    }

    const check_input = () => {
        //todo
        const {to,isPayable,eth_value,name,description,param_type,param_demo} = methodInfo
        if(!name || !description || !param_type) {
            showSnackbar("empty_input","error")
            return false
        }
        if(!to || !isAddress(to) || constants.AddressZero === to) {
            showSnackbar("invalid_address","error")
            return false
        }
        return true
    };

    const parseParam = () => {
        const {to,isPayable,eth_value,name,description,param_type,param_demo} = methodInfo
        let _isPayable = isPayable==='true'
        let _value = _isPayable ? utils.parseEther(eth_value) : 0
        let _infos = name + METHOD_SPLITTER + description + METHOD_SPLITTER + param_type + METHOD_SPLITTER + param_demo
        return [id,to,_isPayable,_value,_infos,'0x']
    };

    const doAddMethod = async () => {
        if(!check_input() || !method_admin){
            return
        }
        let estimate = method_admin.estimate.addMethod
        let method = method_admin.addMethod
        let args = parseParam()
        let value = constants.Zero
        const estimatedGasLimit = await estimate(...args, { value })
        method(...args, {
            value,
            gasPrice:utils.parseUnits('10.0','gwei'),
            gasLimit: calculateGasMargin(estimatedGasLimit, GAS_MARGIN) })
        .then(response => {
            showSnackbar(t('transaction_send_success'),'success')
        })


    }


    const {to,isPayable,eth_value,name,description,param_type,param_demo} = methodInfo
    return (
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("add_dapp_method")}</h4>
            </CardHeader>
            <CardBody>
                <div className={classes.typo}>
                    <div className={classes.note}>
                            {t("method_to") + ":"}
                    </div>
                   <CustomInput formControlProps={{
                           className: classes.addressTxt
                       }} inputProps={{
                           placeholder: t("input_method_to"),
                           inputProps: {
                               "aria-label": "SetLabel"
                           },
                           value:to,
                           onChange: handleChange('to')
                       }}/>
                </div>
                <div className={classes.typo}>
                   <div className={classes.note}>
                           {t("method_name") + ":"}
                   </div>
                   <CustomInput formControlProps={{
                           className: classes.addressTxt
                       }} inputProps={{
                           placeholder: t("input_method_name"),
                           inputProps: {
                               "aria-label": "SetLabel"
                           },
                           value:name,
                           onChange: handleChange('name')
                       }}/>
                </div>
                <div className={classes.typo}>
                   <div className={classes.note}>
                           {t("method_description") + ":"}
                   </div>
                   <CustomInput formControlProps={{
                           className: classes.addressTxt
                       }} inputProps={{
                           placeholder: t("input_method_description"),
                           inputProps: {
                               "aria-label": "SetLabel"
                           },
                           value:description,
                           onChange: handleChange('description')
                       }}/>
                </div>
                <div className={classes.typo}>
                   <div className={classes.note}>
                           {t("method_param_type") + ":"}
                   </div>
                   <CustomInput formControlProps={{
                           className: classes.addressTxt
                       }} inputProps={{
                           placeholder: t("input_method_param_type"),
                           inputProps: {
                               "aria-label": "SetLabel"
                           },
                           value:param_type,
                           onChange: handleChange("param_type")
                       }}/>
                </div>
                <div className={classes.typo}>
                   <div className={classes.note}>
                           {t("method_param_demo") + ":"}
                   </div>
                   <CustomInput formControlProps={{
                           className: classes.addressTxt
                       }} inputProps={{
                           placeholder: t("input_method_param_demo"),
                           inputProps: {
                               "aria-label": "SetLabel"
                           },
                           value:param_demo,
                           onChange: handleChange("param_demo")
                       }}/>
                </div>
                <div className={classes.typo}>
                    <div className={classes.note}>
                            {t("method_isPayable") + ":"}
                    </div>

                    <FormControl component="fieldset">
                        {/* <FormLabel component="legend" >{t("select_svg_type")}</FormLabel> */}
                        <RadioGroup aria-label="svg_type" name="svg_type" row value={isPayable}
                            onChange={handleChange('isPayable')} className={classes.radioControl}>
                          <FormControlLabel value="true"  control={<Radio />} label={t('yes')}/>
                          <FormControlLabel value="false" selected control={<Radio />} label={t("no")} />
                        </RadioGroup>
                    </FormControl>
                </div>
                {isPayable==='true' &&
                    <div className={classes.typo}>
                       <div className={classes.note}>
                               {t("method_eth_value") + ":"}
                       </div>
                       <CustomInput formControlProps={{
                               className: classes.addressTxt
                           }} inputProps={{
                               placeholder: t("input_method_eth_value"),
                               inputProps: {
                                   "aria-label": "SetLabel"
                               },
                               value:eth_value,
                               onChange: handleChange("eth_value")
                           }}/>
                           ETH
                    </div>
                }

                <div className={classes.buttonWrapper}>
                    <Button variant="contained" onClick={doAddMethod}   className={classes.transferButton}>
                        {t('add')}
                    </Button>
                </div>
            </CardBody>
        </Card>
    )
}
AddMethod.propTypes = {
    classes: PropTypes.object
};

export default AddMethod
