// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// IMPORTS
// IMPORTS | ROUTING
import { Routes, Route } from 'react-router-dom';
// IMPORTS | ROUTING | PAGES
import SignOut from './util/signOut';
import Help from "./page/help/help";
import TranslationHistory from './page/translation/history';
import TranslationNew from './page/translation/new';
import ReadableHistory from './page/readable/history';
import ReadableView from './page/readable/view';

const features = require("./features.json");

export default function AppRoutes() {
	return (
		<Routes>
				<>
					<Route path="/" element={<TranslationHistory />} />
					<Route path="/translation/" element={<TranslationHistory />} />
					<Route path="/translation/history/" element={<TranslationHistory />} />
					<Route path="/translation/new/" element={<TranslationNew />} />
				</>
		
		</Routes>
	);
};