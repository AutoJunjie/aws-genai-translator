// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// IMPORTS
// IMPORTS | REACT
//import { Suspense, useEffect, useState } from 'react';
import { Suspense } from 'react';
import AppRoutes from './appRoutes';
// IMPORTS | AMPLIFY
//import { Amplify, Auth, Hub } from "aws-amplify";
// import amplifyConfig from "./util/aws-exports";
// IMPORTS | LANGUAGES
import "./util/i18n";
// IMPORTS | COMPONENTS
import TopNavigation from "./page/partial/topNavigation";
import SideNavigation from "./page/partial/sideNavigation";
// import Header from './page/partial/header';
//import Footer from "./page/partial/footer";
// CLOUDSCAPE DESIGN
import { AppLayout } from "@cloudscape-design/components";
// CONFIGURE
// CONFIGURE | AMPLIFY

// FUNCTIONS
export default function App() {
	return (
		<>
			<Suspense fallback={null}>
				<TopNavigation/>
				<AppLayout
					navigation={<SideNavigation />}
					toolsHide
					content={<AppRoutes />}
				></AppLayout>
			</Suspense>
		</>
	);
};
