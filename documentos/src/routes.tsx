import { createBrowserRouter } from "react-router-dom";
import PainelMKT from "./pagesAndComponents/painel-ged";
import Documents from "./pagesAndComponents/painel-ged/pages/documents";
import Trash from "./pagesAndComponents/painel-ged/pages/Trash";
import CompanyUsers from "./pagesAndComponents/painel-ged/pages/CompanyUsers";
import SubscriptionPlans from "./pagesAndComponents/painel-ged/pages/alterplan";
import PageBusnessSelected from "./pagesAndComponents/painel-ged/pagebusness";
import Plans from "./pagesAndComponents/painel-ged/components/selectedPlan";
import MetricsDashboard from "./pagesAndComponents/painel-ged/pages/MetricsDashboard";
import PageLogin from "./pagesAndComponents/LoginUser/pages/PageLogin/PageLogin";
import PlatformSelector from "./pagesAndComponents/painel-ged/pages/platform-selector";

import EnvironmentSelection from "./pagesAndComponents/LoginUser/pages/EnvironmentSelection";

export const router = createBrowserRouter([

  // {
  //   path: "/alterplan",
  //   element: <SubscriptionPlans />,
  // },
  {
    path: "/",
    element: <PageLogin />,
  },
  {
    path: "/marketplaceDash",
    element: <PainelMKT />,
  },
  {
    path: "/ged",
    element: <PainelMKT />,
  },
  {
    path: "/documents",
    element: <Documents />,
  },
  // {
  //   path: "/planos",
  //   element: <Plans />,
  // },

  {
    path: "/login",
    element: <PageLogin />,
  },
  {
    path: "/platform-selector",
    element: <PlatformSelector />,
  },
  {
    path: "/select-environment",
    element: <EnvironmentSelection />,
  },
  {
    path: "/ged/documents",
    element: <Documents />,
  },
  {
    path: "/ged/trash",
    element: <Trash />,
  },
  {
    path: "/ged/company/users",
    element: <CompanyUsers />,
  },
  {
    path: "/ged/metrics",
    element: <MetricsDashboard viewMode="company" />,
  },
  {
    path: "/ged/metrics/user",
    element: <MetricsDashboard viewMode="user" />,
  }
]);
