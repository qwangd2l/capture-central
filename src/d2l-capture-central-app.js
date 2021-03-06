import { css, html, LitElement } from 'lit-element/lit-element.js';
import { BASE_PATH } from './state/routing-store.js';

import { InternalLocalizeMixin } from './mixins/internal-localize-mixin.js';
import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { NavigationMixin } from './mixins/navigation-mixin.js';
import page from 'page/page.mjs';

import { ResizeObserver } from 'd2l-resize-aware/resize-observer-module.js';
import { rootStore } from './state/root-store.js';

class D2lCaptureCentralApp extends NavigationMixin(InternalLocalizeMixin(MobxReactionUpdate(LitElement))) {
	static get properties() {
		return {
		};
	}

	static get styles() {
		return [css`
			main {
				display: block;
				height: 100%;
				margin: 0 auto;
				max-width: 1175px;
			}

			.page {
				display: none;
			}

			.page[active] {
				display: block;
			}
		`];
	}

	constructor() {
		super();
		const documentObserver = new ResizeObserver(this._resized.bind(this));
		documentObserver.observe(document.body, { attributes: true });

		this.loading = true;
		this._setupPageNavigation();
	}

	_resized() {
		rootStore.appTop = this.offsetTop;
	}

	_setupPageNavigation() {
		page.base(BASE_PATH);

		const routes = [
			'/:orgUnitId/404',
			'/:orgUnitId/admin',
			'/:orgUnitId/audit-logs',
			'/:orgUnitId/clips',
			'/:orgUnitId/course-videos',
			'/:orgUnitId/course-videos/:id',
			'/:orgUnitId/folders',
			'/:orgUnitId/live-events',
			'/:orgUnitId/live-events/edit',
			'/:orgUnitId/live-events-reporting',
			'/:orgUnitId/presentations',
			'/:orgUnitId/presentations/edit',
			'/:orgUnitId/settings',
			'/:orgUnitId/upload-video',
			'/:orgUnitId/visits',
			'/:orgUnitId/',
			'/*',
		];
		routes.forEach(route => page(route, this.setupPage.bind(this)));
		page();
	}

	setupPage(ctx) {
		rootStore.routingStore.setRouteCtx(ctx);
		const { page, subView } = rootStore.routingStore;

		switch (page) {
			case '':
				this._navigate('/admin');
				return;
			case 'admin':
				import('./pages/admin/d2l-capture-central-admin.js');
				return;
			case 'audit-logs':
				import('./pages/reporting/d2l-capture-central-audit-logs.js');
				return;
			case 'course-videos':
				if (subView) {
					import('./pages/course-videos/d2l-capture-central-course-video-player.js');
					return;
				}
				import('./pages/course-videos/d2l-capture-central-course-videos.js');
				return;
			case 'clips':
				import('./pages/clips/d2l-capture-central-clips.js');
				return;
			case 'folders':
				import('./pages/folders/d2l-capture-central-folders.js');
				return;
			case 'groups':
				import('./pages/groups/d2l-capture-central-groups.js');
				return;
			case 'live-events':
				if (subView === 'edit') {
					import('./pages/live-events/d2l-capture-central-live-events-edit.js');
					return;
				}
				import('./pages/live-events/d2l-capture-central-live-events.js');
				return;
			case 'live-events-reporting':
				import('./pages/reporting/d2l-capture-central-live-events-reporting.js');
				return;
			case 'presentations':
				if (subView === 'edit') {
					import('./pages/presentations/d2l-capture-central-presentations-edit.js');
					return;
				}
				import('./pages/presentations/d2l-capture-central-presentations.js');
				return;
			case 'settings':
				import('./pages/settings/d2l-capture-central-settings.js');
				return;
			case 'upload-video':
				import('./pages/upload-video/d2l-capture-central-upload-video.js');
				return;
			case 'users':
				import('./pages/users/d2l-capture-central-users.js');
				return;
			case 'visits':
				import('./pages/reporting/d2l-capture-central-visits.js');
				return;
			default:
				rootStore.routingStore.setPage('404');
				import('./pages/404/d2l-capture-central-404.js');
				break;
		}
	}

	render() {
		const { page: currentPage, subView } = rootStore.routingStore;
		return html`
		<main id="main" role="main">
			<d2l-capture-central-admin class="page" ?active=${currentPage === 'admin'}></d2l-capture-central-admin>
			<d2l-capture-central-audit-logs class="page" ?active=${currentPage === 'audit-logs'}></d2l-capture-central-audit-logs>
			<d2l-capture-central-course-videos class="page" ?active=${currentPage === 'course-videos' && !subView}></d2l-capture-central-course-videos>
			<d2l-capture-central-course-video-player class="page" ?active=${currentPage === 'course-videos' && subView}></d2l-capture-central-course-video-player>
			<d2l-capture-central-clips class="page" ?active=${currentPage === 'clips'}></d2l-capture-central-clips>
			<d2l-capture-central-folders class="page" ?active=${currentPage === 'folders'}></d2l-capture-central-folders>
			<d2l-capture-central-live-events class="page" ?active=${currentPage === 'live-events' && !subView}></d2l-capture-central-live-events>
			<d2l-capture-central-live-events-edit class="page" ?active=${currentPage === 'live-events' && subView === 'edit'}></d2l-capture-central-live-events-edit>
			<d2l-capture-central-live-events-reporting class="page" ?active=${currentPage === 'live-events-reporting'}></d2l-capture-central-live-events-reporting>
			<d2l-capture-central-presentations class="page" ?active=${currentPage === 'presentations' && !subView}></d2l-capture-central-presentations>
			<d2l-capture-central-presentations-edit class="page" ?active=${currentPage === 'presentations' && subView === 'edit'}></d2l-capture-central-presentations-edit>
			<d2l-capture-central-settings class="page" ?active=${currentPage === 'settings'}></d2l-capture-central-settings>
			<d2l-capture-central-upload-video class="page" ?active=${currentPage === 'upload-video'}></d2l-capture-central-upload-video>
			<d2l-capture-central-visits class="page" ?active=${currentPage === 'visits'}></d2l-capture-central-visits>
			<d2l-capture-central-404 class="page" ?active=${currentPage === '404'}></d2l-capture-central-404>
		</main>
		`;
	}
}

customElements.define('d2l-capture-central-app', D2lCaptureCentralApp);
