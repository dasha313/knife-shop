import { isMobile } from "../files/functions.js";
import { flsModules } from "../files/modules.js";

// Клас FullPage
export class FullPage {
	constructor(element, options) {
		let config = {
			noEventSelector: '[data-no-event]',
			сlassInit: 'fp-init',
			wrapperAnimatedClass: 'fp-switching',
			selectorSection: '[data-fp-section]',
			activeClass: 'active-section',
			previousClass: 'previous-section',
			nextClass: 'next-section',
			idActiveSection: 0,
			mode: element.dataset.fpEffect ? element.dataset.fpEffect : 'slider',
			bullets: element.hasAttribute('data-fp-bullets') ? true : false,
			bulletsClass: 'fp-bullets',
			bulletClass: 'fp-bullet',
			bulletActiveClass: 'fp-bullet-active',
			onInit: function () { },
			onSwitching: function () { },
			onDestroy: function () { },
		}
		this.options = Object.assign(config, options);
		this.wrapper = element;
		this.sections = this.wrapper.querySelectorAll(this.options.selectorSection);
		this.activeSection = false;
		this.activeSectionId = false;
		this.previousSection = false;
		this.previousSectionId = false;
		this.nextSection = false;
		this.nextSectionId = false;
		this.bulletsWrapper = false;
		this.stopEvent = false;
		if (this.sections.length) {
			this.init();
		}
	}
	init() {
		if (this.options.idActiveSection > (this.sections.length - 1)) return
		this.setId();
		this.activeSectionId = this.options.idActiveSection;
		this.setEffectsClasses();
		this.setClasses();
		this.setStyle();
		if (this.options.bullets) {
			this.setBullets();
			this.setActiveBullet(this.activeSectionId);
		}
		this.events();
		setTimeout(() => {
			document.documentElement.classList.add(this.options.сlassInit);
			this.options.onInit(this);
			document.dispatchEvent(new CustomEvent("fpinit", {
				detail: {
					fp: this
				}
			}));
		}, 0);
	}
	destroy() {
		this.removeEvents();
		this.removeClasses();
		document.documentElement.classList.remove(this.options.сlassInit);
		this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
		this.removeEffectsClasses();
		this.removeZIndex();
		this.removeStyle();
		this.removeId();
		this.options.onDestroy(this);
		document.dispatchEvent(new CustomEvent("fpdestroy", {
			detail: {
				fp: this
			}
		}));
	}
	setId() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.setAttribute('data-fp-id', index);
		}
	}
	removeId() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.removeAttribute('data-fp-id');
		}
	}
	setClasses() {
		this.previousSectionId = (this.activeSectionId - 1) >= 0 ?
			this.activeSectionId - 1 : false;

		this.nextSectionId = (this.activeSectionId + 1) < this.sections.length ?
			this.activeSectionId + 1 : false;

		this.activeSection = this.sections[this.activeSectionId];
		this.activeSection.classList.add(this.options.activeClass);

		if (this.previousSectionId !== false) {
			this.previousSection = this.sections[this.previousSectionId];
			this.previousSection.classList.add(this.options.previousClass);
		} else {
			this.previousSection = false;
		}

		if (this.nextSectionId !== false) {
			this.nextSection = this.sections[this.nextSectionId];
			this.nextSection.classList.add(this.options.nextClass);
		} else {
			this.nextSection = false;
		}
	}
	removeEffectsClasses() {
		switch (this.options.mode) {
			case 'slider':
				this.wrapper.classList.remove('slider-mode');
				break;

			case 'cards':
				this.wrapper.classList.remove('cards-mode');
				this.setZIndex();
				break;

			case 'fade':
				this.wrapper.classList.remove('fade-mode');
				this.setZIndex();
				break;

			default:
				break;
		}
	}
	setEffectsClasses() {
		switch (this.options.mode) {
			case 'slider':
				this.wrapper.classList.add('slider-mode');
				break;

			case 'cards':
				this.wrapper.classList.add('cards-mode');
				this.setZIndex();
				break;

			case 'fade':
				this.wrapper.classList.add('fade-mode');
				this.setZIndex();
				break;

			default:
				break;
		}
	}
	setStyle() {
		switch (this.options.mode) {
			case 'slider':
				this.styleSlider();
				break;

			case 'cards':
				this.styleCards();
				break;

			case 'fade':
				this.styleFade();
				break;
			default:
				break;
		}
	}
	styleSlider() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index === this.activeSectionId) {
				section.style.transform = 'translate3D(0,0,0)';
			} else if (index < this.activeSectionId) {
				section.style.transform = 'translate3D(0,-100%,0)';
			} else if (index > this.activeSectionId) {
				section.style.transform = 'translate3D(0,100%,0)';
			}
		}
	}
	styleCards() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index >= this.activeSectionId) {
				section.style.transform = 'translate3D(0,0,0)';
			} else if (index < this.activeSectionId) {
				section.style.transform = 'translate3D(0,-100%,0)';
			}
		}
	}
	styleFade() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index === this.activeSectionId) {
				section.style.opacity = '1';
				section.style.visibility = 'visible';
			} else {
				section.style.opacity = '0';
				section.style.visibility = 'hidden';
			}
		}
	}
	removeStyle() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.opacity = '';
			section.style.visibility = '';
			section.style.transform = '';
		}
	}
	checkScroll(yCoord, element) {
		this.goScroll = false;

		if (!this.stopEvent && element) {
			this.goScroll = true;
			if (this.haveScroll(element)) {
				this.goScroll = false;
				const position = Math.round(element.scrollHeight - element.scrollTop);
				if (
					((Math.abs(position - element.scrollHeight) < 2) && yCoord <= 0) ||
					((Math.abs(position - element.clientHeight) < 2) && yCoord >= 0)
				) {
					this.goScroll = true;
				}
			}
		}
	}
	haveScroll(element) {
		return element.scrollHeight !== window.innerHeight
	}
	removeClasses() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.classList.remove(this.options.activeClass);
			section.classList.remove(this.options.previousClass);
			section.classList.remove(this.options.nextClass);
		}
	}
	events() {
		this.events = {
			wheel: this.wheel.bind(this),

			touchdown: this.touchDown.bind(this),
			touchup: this.touchUp.bind(this),
			touchmove: this.touchMove.bind(this),
			touchcancel: this.touchUp.bind(this),

			transitionEnd: this.transitionend.bind(this),

			click: this.clickBullets.bind(this),
		}
		if (isMobile.iOS()) {
			document.addEventListener('touchmove', (e) => {
				e.preventDefault();
			});
		}
		this.setEvents();
	}
	setEvents() {
		this.wrapper.addEventListener('wheel', this.events.wheel);
		this.wrapper.addEventListener('touchstart', this.events.touchdown);
		if (this.options.bullets && this.bulletsWrapper) {
			this.bulletsWrapper.addEventListener('click', this.events.click);
		}
	}
	removeEvents() {
		this.wrapper.removeEventListener('wheel', this.events.wheel);
		this.wrapper.removeEventListener('touchdown', this.events.touchdown);
		this.wrapper.removeEventListener('touchup', this.events.touchup);
		this.wrapper.removeEventListener('touchcancel', this.events.touchup);
		this.wrapper.removeEventListener('touchmove', this.events.touchmove);
		if (this.bulletsWrapper) {
			this.bulletsWrapper.removeEventListener('click', this.events.click);
		}
	}
	clickBullets(e) {
		const bullet = e.target.closest(`.${this.options.bulletClass}`);
		if (bullet) {
			const arrayChildren = Array.from(this.bulletsWrapper.children);

			const idClickBullet = arrayChildren.indexOf(bullet)

			this.switchingSection(idClickBullet)
		}
	}
	setActiveBullet(idButton) {
		if (!this.bulletsWrapper) return
		const bullets = this.bulletsWrapper.children;

		for (let index = 0; index < bullets.length; index++) {
			const bullet = bullets[index];
			if (idButton === index) bullet.classList.add(this.options.bulletActiveClass);
			else bullet.classList.remove(this.options.bulletActiveClass);
		}
	}

	touchDown(e) {
		this._yP = e.changedTouches[0].pageY;
		this._eventElement = e.target.closest(`.${this.options.activeClass}`);
		if (this._eventElement) {
			this._eventElement.addEventListener('touchend', this.events.touchup);
			this._eventElement.addEventListener('touchcancel', this.events.touchup);
			this._eventElement.addEventListener('touchmove', this.events.touchmove);
			// Тач стався
			this.clickOrTouch = true;

			//==============================
			if (isMobile.iOS()) {
				if (this._eventElement.scrollHeight !== this._eventElement.clientHeight) {
					if (this._eventElement.scrollTop === 0) {
						this._eventElement.scrollTop = 1;
					}
					if (this._eventElement.scrollTop === this._eventElement.scrollHeight - this._eventElement.clientHeight) {
						this._eventElement.scrollTop = this._eventElement.scrollHeight - this._eventElement.clientHeight - 1;
					}
				}
				this.allowUp = this._eventElement.scrollTop > 0;
				this.allowDown = this._eventElement.scrollTop < (this._eventElement.scrollHeight - this._eventElement.clientHeight);
				this.lastY = e.changedTouches[0].pageY;
			}
			//===============================

		}


	}
	//===============================
	touchMove(e) {
		const targetElement = e.target.closest(`.${this.options.activeClass}`);
		if (isMobile.iOS()) {
			let up = e.changedTouches[0].pageY > this.lastY;
			let down = !up;
			this.lastY = e.changedTouches[0].pageY;
			if (targetElement) {
				if ((up && this.allowUp) || (down && this.allowDown)) {
					e.stopPropagation();
				} else if (e.cancelable) {
					e.preventDefault();
				}
			}
		}
		//===============================
		if (!this.clickOrTouch || e.target.closest(this.options.noEventSelector)) return
		let yCoord = this._yP - e.changedTouches[0].pageY;
		this.checkScroll(yCoord, targetElement);
		if (this.goScroll && Math.abs(yCoord) > 20) {
			this.choiceOfDirection(yCoord);
		}
	}
	//===============================
	touchUp(e) {
		this._eventElement.removeEventListener('touchend', this.events.touchup);
		this._eventElement.removeEventListener('touchcancel', this.events.touchup);
		this._eventElement.removeEventListener('touchmove', this.events.touchmove);
		return this.clickOrTouch = false;
	}
	//===============================
	transitionend(e) {
		if (e.target.closest(this.options.selectorSection)) {
			this.stopEvent = false;
			this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
		}
	}
	//===============================
	wheel(e) {
		if (e.target.closest(this.options.noEventSelector)) return
		const yCoord = e.deltaY;
		const targetElement = e.target.closest(`.${this.options.activeClass}`);
		this.checkScroll(yCoord, targetElement);
		if (this.goScroll) this.choiceOfDirection(yCoord);
	}
	//===============================
	choiceOfDirection(direction) {
		this.stopEvent = true;

		if (((this.activeSectionId === 0) && direction < 0) || ((this.activeSectionId === (this.sections.length - 1)) && direction > 0)) {
			this.stopEvent = false;
		}

		if (direction > 0 && this.nextSection !== false) {
			this.activeSectionId = (this.activeSectionId + 1) < this.sections.length ?
				++this.activeSectionId : this.activeSectionId;
		} else if (direction < 0 && this.previousSection !== false) {
			this.activeSectionId = (this.activeSectionId - 1) >= 0 ?
				--this.activeSectionId : this.activeSectionId;
		}

		if (this.stopEvent) this.switchingSection();
	}
	//===============================
	switchingSection(idSection = this.activeSectionId) {
		this.activeSectionId = idSection;
		this.wrapper.classList.add(this.options.wrapperAnimatedClass);
		this.wrapper.addEventListener('transitionend', this.events.transitionEnd);
		this.removeClasses();
		this.setClasses();
		this.setStyle();
		if (this.options.bullets) this.setActiveBullet(this.activeSectionId);
		this.options.onSwitching(this);
		document.dispatchEvent(new CustomEvent("fpswitching", {
			detail: {
				fp: this
			}
		}));
	}
	//===============================
	setBullets() {
		this.bulletsWrapper = document.querySelector(`.${this.options.bulletsClass}`);

		if (!this.bulletsWrapper) {
			const bullets = document.createElement('div');
			bullets.classList.add(this.options.bulletsClass);
			this.wrapper.append(bullets);
			this.bulletsWrapper = bullets;
		}

		if (this.bulletsWrapper) {
			for (let index = 0; index < this.sections.length; index++) {
				const span = document.createElement('span');
				span.classList.add(this.options.bulletClass);
				this.bulletsWrapper.append(span);
			}
		}
	}
	//===============================
	// Z-INDEX
	setZIndex() {
		let zIndex = this.sections.length
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.zIndex = zIndex;
			--zIndex;
		}
	}
	removeZIndex() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.zIndex = ''
		}
	}
}
if (document.querySelector('[data-fp]')) {
	flsModules.fullpage = new FullPage(document.querySelector('[data-fp]'), '');
}
