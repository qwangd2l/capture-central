import '@brightspace-ui/core/components/breadcrumbs/breadcrumb.js';
import '@brightspace-ui/core/components/breadcrumbs/breadcrumb-current-page.js';
import '@brightspace-ui/core/components/breadcrumbs/breadcrumbs.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/dropdown/dropdown-context-menu.js';
import '@brightspace-ui/core/components/dropdown/dropdown-menu.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/inputs/input-search.js';
import '@brightspace-ui-labs/pagination/pagination.js';
import 'd2l-table/d2l-table-wrapper.js';

import { bodyStandardStyles, heading2Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html } from 'lit-element/lit-element.js';
import { sharedManageStyles, sharedTableStyles } from '../../components/shared-styles.js';
import { d2lTableStyles } from '../../components/d2l-table-styles.js';
import { DependencyRequester } from '../../mixins/dependency-requester-mixin.js';
import { PageViewElement } from '../../components/page-view-element.js';

class D2lCaptureClips extends DependencyRequester(PageViewElement) {

	static get properties() {
		return {
			_numSelectedClips: { type: Number },
			_clips: { type: Array }
		};
	}

	static get styles() {
		return [
			d2lTableStyles,
			sharedTableStyles,
			sharedManageStyles,
			bodyStandardStyles,
			heading2Styles,
			css``
		];
	}

	constructor() {
		super();
		this._numSelectedClips = 0;
		this._clips = [{
			name: 'Clip 1',
		}, {
			name: 'Clip 2',
		}, {
			name: 'Clip 3',
		}, {
			name: 'Clip 4',
		}, {
			name: 'Clip 5',
		}, {
			name: 'Clip 6',
		}];
	}

	_addAllToSelection(e) {
		const checkboxes = this.shadowRoot.querySelectorAll('tbody d2l-input-checkbox');
		let numAddedToSelection = 0;
		checkboxes.forEach(checkbox => {
			if (checkbox.checked !== e.target.checked) {
				numAddedToSelection += 1;
			}
			checkbox.checked = e.target.checked;
		});
		this._numSelectedClips += numAddedToSelection * (e.target.checked ? 1 : -1);
	}

	_addToSelection(e) {
		this._numSelectedClips += e.target.checked ? 1 : -1;
	}

	_renderClips() {
		return this._clips.map(row => html`
			<tr>
				<td>
					<d2l-input-checkbox
						aria-label=${this.localize('selectOption', { option: row.name })}
						@change=${this._addToSelection}
					></d2l-input-checkbox>
				</td>
				<td>${row.name}</td>
				<td>
					<d2l-dropdown-context-menu>
						<d2l-dropdown-menu>
							<d2l-menu label="${this.localize('moreOptions')}">
								<d2l-menu-item text="${this.localize('download')}"></d2l-menu-item>
								<d2l-menu-item text="${this.localize('delete')}"></d2l-menu-item>
							</d2l-menu>
						</d2l-dropdown-menu>
					</d2l-dropdown-context-menu>
				</td>
			</tr>
		`);
	}

	render() {
		return html`
			<div class="d2l-capture-central-manage-container">
				<d2l-breadcrumbs>
					<d2l-breadcrumb @click=${this._goTo('/admin')} href="#" text="${this.localize('captureCentral')}"></d2l-breadcrumb>
					<d2l-breadcrumb-current-page text="${this.localize('clips')}"></d2l-breadcrumb-current-page>
				</d2l-breadcrumbs>
				<div class="d2l-capture-central-manage-header">
					<h2 class="d2l-heading-2">${this.localize('manageClips')}</h2>
					<d2l-button primary>
						${this.localize('uploadFile')}
					</d2l-button>
				</div>
				<div class="d2l-body-standard d2l-capture-central-manage-num-selected">
					${this.localize('numEventsSelected', { count: this._numSelectedClips })}
				</div>
				<div class="d2l-capture-central-manage-options">
					<d2l-button class="delete-button">${this.localize('delete')}</d2l-button>
					<d2l-input-search
						class="search-live-events"
						label="${this.localize('searchClips')}"
						placeholder="${this.localize('searchClips')}"
					></d2l-input-search>
				</div>
				<d2l-table-wrapper sticky-headers>
					<p class="d2l-capture-central-table-caption" id="d2l-capture-central-table-caption">
						${this.localize('manageClips')}
					</p>
					<table class="d2l-table" aria-describedby="d2l-capture-central-table-caption">
						<thead>
							<tr>
								<th class="d2l-capture-central-th-checkbox-container">
									<d2l-input-checkbox aria-label=${this.localize('selectAllLiveEvents')} @change=${this._addAllToSelection}></d2l-input-checkbox>
								</th>
								<th><div class="d2l-capture-central-th-container">
									${this.localize('name')}
								</div></th>
								<th class="d2l-capture-central-th-more-options-container"></th>
							</tr>
						</thead>
						<tbody>
							${this._renderClips()}
						</tbody>
					</table>
				</d2l-table-wrapper>
				<d2l-labs-pagination page-number="1" max-page-number="5"></d2l-labs-pagination>
			</div>
		`;
	}
}

window.customElements.define('d2l-capture-central-clips', D2lCaptureClips);