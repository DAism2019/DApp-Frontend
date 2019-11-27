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
// @material-ui/icons
import Dashboard from "@material-ui/icons/Dashboard"
import Unarchive from "@material-ui/icons/Unarchive";
import LibraryBooks from "@material-ui/icons/LibraryBooks";
import BubbleChart from "@material-ui/icons/BubbleChart";
import Search from "@material-ui/icons/Search";
import HowToReg from "@material-ui/icons/HowToReg";
import AppsIcon from '@material-ui/icons/Apps';
import FormatAlignJustifyIcon from '@material-ui/icons/FormatAlignJustify';
import EditorIcon from '@material-ui/icons/Edit';
// custom views
import AllArticle from "views/AllArticle/AllArticle.jsx"
import ArticleUpload from "views/ArticleUpload/ArticleUpload.jsx"
import MyArticle from "views/MyArticle/MyArticle.jsx"
import AllSvg from "views/AllSvg/AllSvg.jsx"
import Guide from 'views/Guide/Guide.jsx'
import ArticleQuery from 'views/ArticleQuery/ArticleQuery.jsx'
import RegisterName from 'views/RegisterName/RegisterName.jsx'
import ArticleDetail from 'views/ArticleDetail/ArticleDetail.jsx'

const dashboardRoutes = [
    {
        path: "latest",
        name: "latest_article",
        icon: AppsIcon,
        component: AllArticle,
        layout: "/"
    },
    {
        path: "full",
        name: "full_article",
        icon: FormatAlignJustifyIcon,
        component: ArticleDetail,
        layout: "/"
    },
    {
        path: "publish",
        name: "upload_article",
        icon: Unarchive,
        component: ArticleUpload,
        layout: "/"
    },
    {
        path: "mine",
        name: "my_article",
        icon: LibraryBooks,
        component: MyArticle,
        layout: "/"
    },
    {
        path: "image",
        name: "all_svg",
        icon: BubbleChart,
        component: AllSvg,
        layout: "/"
    },
    {
        path: "search",
        name: "query_article",
        icon: Search,
        component: ArticleQuery,
        layout: "/"
    },
    {
        path: "author",
        name: "register_nickname",
        icon: HowToReg,
        component: RegisterName,
        layout: "/"
    },
    {
        path: "guide",
        name: "guide",
        icon: Dashboard,
        component: Guide,
        layout: "/"
    },
    {
        path:"editor",
        name:"editor",
        icon:EditorIcon,
        component:null,
        layout:"/"
    }
];

export default dashboardRoutes;
