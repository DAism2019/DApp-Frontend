/*!

=========================================================
* Material Dashboard React - v1.7.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import PropTypes from "prop-types";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import ExploreIcon from '@material-ui/icons/Explore';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Button from '@material-ui/core/Button';
// import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect'
import { getPathBase } from 'utils'
import { Link } from 'react-router-dom';
// core components
import tableStyle from "assets/jss/material-dashboard-react/components/tableStyle.jsx";
// import tasksStyle from "assets/jss/material-dashboard-react/components/tasksStyle.jsx";

const FONT_SIZE  = isMobile ? 13 : 20;

function CustomTable({ ...props }) {
  const { classes, tableHead, tableData,tableHeaderColor,viewFunc,adminFunc } = props;
  const {origin} = window.location
  // const pre_url = origin + getPathBase() + '/full#';

  // const handleClick = id => event =>{
  //       event.preventDefault()
  //       window.open(pre_url + id)
  //       return false
  // }
  // const handleClickAddress = author => event => {
  //     event.preventDefault()
  //     console.log(author)
  //     return false
  // }
  const view_dapp = id => () => {
      if(viewFunc){
          viewFunc(id)
      }
  };

  const admin_dapp = id => () => {
      if(adminFunc){
          adminFunc(id)
      }
  };

  const showRowData = (prop) => {
      let id = + prop[0]
      return (<>
          {prop.map((_prop,key) => <TableCell className={classes.tableCell} key={key} style={{fontSize:FONT_SIZE}}>
                                      {_prop}
                                  </TableCell>)
          }
          <TableCell >
              <Tooltip
                  id="tooltip-top-start"
                  title="View dapp"
                  placement="top"
                  classes={{ tooltip: classes.tooltip }}
              >
                  <IconButton
                     aria-label="View" style={{marginLeft:"-20px"}}
                     onClick = {view_dapp(id)}

                  // className={classes.tableActionButton}
                  >
                      <ExploreIcon fontSize="large"

                        // className={
                        //   classes.tableActionButtonIcon + " " + classes.close
                        // }
                      />
                  </IconButton>
              </Tooltip>
              <Tooltip
                id="tooltip-top"
                title="Admin Dapp"
                placement="top"
                classes={{ tooltip: classes.tooltip }}
              >
                  <IconButton
                      aria-label="Admin"
                       onClick = {admin_dapp(id)}
                      // className={classes.tableActionButton}
                  >
                      <SettingsApplicationsIcon fontSize="large"
                            // className={
                            //   classes.tableActionButtonIcon + " " + classes.edit
                            // }
                      />
                  </IconButton>
              </Tooltip>
          </TableCell>
      </>)
  };

  return (
    <div className={classes.tableResponsive}>
      <Table className={classes.table}>
        {tableHead !== undefined ? (
          <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
            <TableRow className={classes.tableHeadRow}>
              {tableHead.map((prop, key) => {
                return (
                  <TableCell
                    className={classes.tableCell + " " + classes.tableHeadCell}
                    // style={{fontSize:FONT_SIZE}}
                    key={key}
                  >
                    {prop}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
        ) : null}
        <TableBody>
          {tableData.map((prop, key) => (
                  <TableRow key={key} className={classes.tableBodyRow}>
                    {showRowData(prop,classes)}
                  </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}


CustomTable.defaultProps = {
  tableHeaderColor: "gray"
};

CustomTable.propTypes = {
  classes: PropTypes.object.isRequired,
  tableHeaderColor: PropTypes.oneOf([
    "warning",
    "primary",
    "danger",
    "success",
    "info",
    "rose",
    "gray"
  ]),
  tableHead: PropTypes.arrayOf(PropTypes.string),
  tableData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
};

export default withStyles(tableStyle)(CustomTable);
