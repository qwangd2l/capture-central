import '@brightspace-ui/core/components/link/link.js';
import '@brightspace-ui/core/components/colors/colors.js';
import { css, html } from 'lit-element/lit-element.js';
import { heading3Styles, heading4Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { DependencyRequester } from '../../mixins/dependency-requester-mixin.js';
import { PageViewElement } from '../../components/page-view-element.js';

class D2lCaptureCentralAdmin extends DependencyRequester(PageViewElement) {

	static get styles() {
		return [heading3Styles, heading4Styles, css`
			.d2l-capture-central-admin {
				display: grid;
				grid-template-columns: 225px 1fr;
				grid-column-gap: 25px;
			}

			.d2l-heading-3 {
				margin-top: 0;
			}
			.d2l-heading-4 {
				color: var(--d2l-color-mica);
				margin: 0;
				margin-bottom: 10px;
			}

			.d2l-capture-central-sidebar {
				display: grid;
				grid-auto-rows: 25px;
				grid-row-gap: 30px;
				grid-template-rows: 30px;
				padding-top: 20px;
			}

			.d2l-capture-central-server-options {
				padding-top: 20px;
				display: grid;
				grid-template-rows: 60px repeat(3, 1fr) 150px
			}

			.d2l-capture-central-grouping {
				display: flex;
				flex-direction: column;
			}

			.d2l-capture-central-grouping d2l-link {
				margin-top: 10px;
			}
		`];
	}

	render() {
		return html`
			<div class="d2l-capture-central-admin">
				<div class="d2l-capture-central-sidebar">
					<h3 class="d2l-heading-3">${this.localize('captureCentral')}</h3>
					<!-- <span><d2l-link @click=${this._goTo('/live-events')}>${this.localize('liveEvents')}</d2l-link></span> -->
					<span><d2l-link @click=${this._goTo('/presentations')}>${this.localize('presentations')}</d2l-link></span>
					<!-- <span><d2l-link @click=${this._goTo('/folders')}>${this.localize('folders')}</d2l-link></span> -->
					<span><d2l-link @click=${this._goTo('/upload-video')}>${this.localize('uploadVideo')}</d2l-link></span>
					<!-- <span><d2l-link>${this.localize('recordVideo')}</d2l-link></span> -->
					<span><d2l-link @click=${this._goTo('/course-videos')}>${this.localize('courseVideos')}</d2l-link></span>
				</div>
				<!-- Mocked up pages commented out for now -->
				<!-- <div class="d2l-capture-central-server-options">
					<h3 class="d2l-heading-3">${this.localize('server')}</h3>
					<div class="d2l-capture-central-grouping">
						<h4 class="d2l-heading-4">${this.localize('prepostRollHeading')}</h4>
						<d2l-link @click=${this._goTo('/clips')}>${this.localize('clips')}</d2l-link>
						<d2l-link @click=${this._goTo('/settings')}>${this.localize('settings')}</d2l-link>
					</div>
					<div class="d2l-capture-central-grouping">
						<h4 class="d2l-heading-4">${this.localize('reportingHeading')}</h4>
						<d2l-link @click=${this._goTo('/audit-logs')}>${this.localize('auditLogs')}</d2l-link>
						<d2l-link @click=${this._goTo('/live-events-reporting')}>${this.localize('liveEvents')}</d2l-link>
						<d2l-link @click=${this._goTo('/visits')}>${this.localize('visits')}</d2l-link>
					</div>
				</div> -->
			</div>
		`;
	}
}

window.customElements.define('d2l-capture-central-admin', D2lCaptureCentralAdmin);
