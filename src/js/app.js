
window['FLS'] = true;

import "../scss/style.scss";

import * as flsFunctions from "./files/functions.js";

flsFunctions.isWebp();

flsFunctions.menuInit();

flsFunctions.spollers();

flsFunctions.tabs();

import './libs/popup.js'

import * as flsForms from "./files/forms/forms.js";


flsForms.formFieldsInit({
	viewPass: false,
	autoHeight: false
});

flsForms.formSubmit(true);

flsForms.formQuantity();

flsForms.formRating();

import './libs/select.js'

import "./files/forms/range.js";


import "./files/tippy.js";


import "./files/sliders.js";


import * as flsScroll from "./files/scroll/scroll.js";

import "./libs/dynamic_adapt.js";

import "./files/script.js";
//============================================================================================================================================================================================================================================