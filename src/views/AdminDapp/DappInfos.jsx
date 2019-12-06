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
import React from "react";
import {useTranslation} from 'react-i18next'
import Card from "components/Card/Card.jsx";
import CardHeader from "components/Card/CardHeader.jsx";
import CardBody from "components/Card/CardBody.jsx";
import Button from '@material-ui/core/Button';
import {useWeb3Context} from 'web3-react';
import {isMobile} from 'react-device-detect'
import {makeStyles} from '@material-ui/core/styles';

import { convertTimetoTimeString } from 'utils'

const useStyles = makeStyles(theme => ({
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
        lineHeight:"0.7",
    }
}));

export default function DappInfos({dappInfo}) {
    const {t} = useTranslation()
    const classes = useStyles()
    const {account} = useWeb3Context();
    const [creator,store,id,createTime,name,description,label] = dappInfo;
    const website = 'http://localhost'
    let time_str = +(createTime.mul(1000))
    time_str = convertTimetoTimeString(time_str)

    return (
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>{t("dapp_name") + ": " + name}</h4>
            </CardHeader>
            <CardBody>
                <div>
                    {isMobile ? <>
                        <p className={classes.ContentWrapper}>
                          {t("dapp_address") + ":"}
                        </p>
                        <p className={classes.ContentWrapper}>
                          {store}
                        </p>
                        <p className={classes.ContentWrapper}>
                          {t("creator_address") + ":"}
                        </p>
                        <p className={classes.ContentWrapper}>
                          {creator}
                        </p>
                    </>
                    : <>
                        <p className={classes.ContentWrapper}>
                            {t("dapp_address") + ": " + store}
                        </p>
                        <p className={classes.ContentWrapper}>
                          {t("creator") + ": " + creator}
                        </p>

                    </>
                  }
                  <p className={classes.ContentWrapper}>
                    {t("dapp_id") + ": " + id}
                  </p>
                  <p className={classes.ContentWrapper}>
                    {t("dapp_label") + ": " + label}
                  </p>
                  {isMobile ? <>
                      <p className={classes.ContentWrapper}>
                        {t("create_time") + ":"}
                      </p>
                      <p className={classes.ContentWrapper}>
                        {time_str}
                      </p>
                      <p className={classes.ContentWrapper}>
                        {t("dapp_description") + ":"}
                      </p>
                      <p className={classes.ContentWrapper}>
                        {description}
                      </p>
                      <p className={classes.ContentWrapper}>
                        {t("dapp_website") + ":"}
                      </p>
                      <p className={classes.ContentWrapper}>
                          <a href={website} target="_blank" rel="noopener noreferrer">
                              {website}
                          </a>

                      </p>
                  </>
                  : <>
                      <p className={classes.ContentWrapper}>
                        {t("create_time") + ": " + time_str}
                      </p>
                      <p className={classes.ContentWrapper}>
                        {t("dapp_description") + ": " + description}
                      </p>
                      <p className={classes.ContentWrapper}>
                        {t("dapp_website") + ": "}
                        <a href={website} target="_blank" rel="noopener noreferrer">
                             {website}
                        </a>
                      </p>
                  </>
                }
                </div>
                <div className={classes.buttonWrapper}>
                   <Button variant="contained" disabled ={!account}  className={classes.transferButton}>
                         {t("change")}
                   </Button>
                </div>
            </CardBody>
        </Card>

    )
}
