import React from "react";

import DappInfos from './DappInfos.jsx'
import MethodInfos from './MethodInfos.jsx'
import AddMethod from './AddMethod.jsx'


function AdminDapp({dappInfo}) {
    const id = dappInfo[2]
    return (
        <>
             <DappInfos dappInfo={dappInfo} />
             <MethodInfos id={id} />
             <AddMethod id={id} />
        </>
    )
}


export default AdminDapp
