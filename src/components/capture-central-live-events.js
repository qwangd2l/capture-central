import '@brightspace-ui/core/components/alert/alert.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-icon.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/dropdown/dropdown-menu.js';
import '@brightspace-ui/core/components/dropdown/dropdown-more.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/inputs/input-search.js';
import '@brightspace-ui/core/components/link/link.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import 'd2l-table/d2l-table-wrapper.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';
import { observe, toJS } from 'mobx';
import { sharedManageStyles, sharedTableStyles } from '../components/shared-styles.js';
import { d2lTableStyles } from '../components/d2l-table-styles.js';
import { DependencyRequester } from '../mixins/dependency-requester-mixin.js';
import { formatDateTime } from '@brightspace-ui/intl/lib/dateTime.js';
import { heading2Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { InternalLocalizeMixin } from '../mixins/internal-localize-mixin.js';
import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { NavigationMixin } from '../mixins/navigation-mixin.js';
import { pageNames } from '../util/constants.js';
import { rootStore } from '../state/root-store.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

class CaptureCentralLiveEvents extends DependencyRequester(InternalLocalizeMixin(NavigationMixin(RtlMixin(MobxReactionUpdate(LitElement))))) {

	static get properties() {
		return {
			_loading: { type: Boolean, attribute: false },
			_liveEvents: { type: Array, attribute: false },
			_isErrorState: { type: Boolean, attribute: false },
			_alertMessage: { type: String, attribute: false },
			_canManage: { type: Boolean, attribute: false },
			_canView: { type: Boolean, attribute: false }
		};
	}

	static get styles() {
		return [ d2lTableStyles, sharedManageStyles, sharedTableStyles, heading2Styles, css`
			d2l-loading-spinner {
				display: flex;
				margin-top: 10%;
			}

			d2l-input-search {
				width: 50%;
			}

			.d2l-capture-central-live-events-header {
				align-items: center;
				display: flex;
				justify-content: space-between;
				margin-bottom: 1rem;
			}

			.d2l-capture-central-live-events-inline-critical-alert {
				display: none;
				margin: 1rem 0;
			}

			.d2l-capture-central-live-events-no-events-container {
				margin: 1rem 0;
			}
		`];
	}

	constructor() {
		super();
		this._liveEvents = [];
		this._permissions = {};
		this._loading = true;
		this._isErrorState = false;
		this._canManage = false;
		this._canView = false;
	}

	async connectedCallback() {
		super.connectedCallback();
		this.captureApiClient = this.requestDependency('capture-service-client');
		this.userBrightspaceClient = this.requestDependency('user-brightspace-client');
		this.observeQueryParams();
		await this.reload({ searchQuery: rootStore.routingStore.getQueryParams().searchQuery });
	}

	observeQueryParams() {
		observe(
			rootStore.routingStore,
			'queryParams',
			async change => {
				if (this.loading) {
					return;
				}

				const { searchQuery = '' } = toJS(change.newValue);

				if (rootStore.routingStore.getPage() === pageNames.landing) {
					await this.reload({ searchQuery });
				}
			}
		);
	}

	async reload({ searchQuery = '' } = {}) {
		this._loading = true;
		this._liveEvents = [];
		this._permissions = [];
		this.hideAlerts();
		this._isErrorState = false;

		try {
			this._permissions = await this.userBrightspaceClient.getPermissions();
			this._canView =
				this._permissions.canViewLiveEvents === 'true' &&
				this._permissions.canAccessCaptureCentral === 'true';
			this._canManage =
				this._permissions.canAccessCaptureCentral === 'true' &&
				this._permissions.canManageLiveEvents === 'true';
			if (!this._canView) {
				this._alertMessage = this.localize('unauthorized');
				this._loading = false;
				return;
			}

			const events = await this.captureApiClient.listEvents({ title: searchQuery });
			this._liveEvents = events.items;
			this._liveEvents.forEach(event => event.delete = () => this._deleteEvent({ id: event.id }));
		} catch (error) {
			this._alertMessage = this.localize('getLiveEventsError');
			this._isErrorState = true;
		}

		this._loading = false;
	}

	hideAlerts() {
		const inlineCriticalAlertElement = this.shadowRoot.querySelector('#live-events-inline-critical-alert');
		if (inlineCriticalAlertElement) {
			inlineCriticalAlertElement.style.display = 'none';
			this._alertMessage = '';
		}
	}

	_addAllToSelection(e) {
		const checkboxes = this.shadowRoot.querySelectorAll('tbody d2l-input-checkbox');

		checkboxes.forEach(checkbox => {
			if (checkbox.checked !== e.target.checked) {
				const eventId = checkbox.getAttribute('event-id');
				this._updateLiveEventForSelection({ id: eventId, selected: e.target.checked });
			}
			checkbox.checked = e.target.checked;
		});
	}

	_addToSelection(e) {
		const selectedEventId = e.target.getAttribute('event-id');

		if (!e.target.checked) {
			const bulkSelectCheckboxElement = this.shadowRoot.querySelector('#toggle-select-all-checkbox');
			bulkSelectCheckboxElement.checked = false;
		}

		this._updateLiveEventForSelection({ id: selectedEventId, selected: e.target.checked });
		this.requestUpdate();
	}

	_updateLiveEventForSelection({ id, selected }) {
		const selectedEvent = this._liveEvents.find(liveEvent => liveEvent.id === id);
		selectedEvent.state = { selected };
	}

	async _bulkDelete() {
		await  Promise.all(this._liveEvents.map(async liveEvent => {
			if (liveEvent.state && liveEvent.state.selected) {
				return this._deleteEvent({ id: liveEvent.id });
			}
		}));
	}

	async _deleteEvent({ id }) {
		this.hideAlerts();

		try {
			await this.captureApiClient.deleteEvent({ id });
		} catch (error) {
			const inlineCriticalAlertElement = this.shadowRoot.querySelector('#live-events-inline-critical-alert');
			this._alertMessage = this.localize('deleteEventError');
			inlineCriticalAlertElement.style.display = 'block';
			return;
		}

		const eventIndex = this._liveEvents.findIndex(event => event.id === id);
		if (eventIndex !== -1) {
			this._liveEvents.splice(eventIndex, 1);
			this.requestUpdate();
		}
	}

	_handleSearch(e) {
		const searchQuery = e.detail.value;

		if (searchQuery) {
			this._navigate('/', { searchQuery });
		} else {
			this._navigate('/');
		}

	}

	_renderLiveEvents() {
		return this._liveEvents.map(row => html`
			<tr>
				${this._canManage ? html`
					<td>
						<d2l-input-checkbox
							aria-label=${this.localize('selectOption', { option: row.title })}
							event-id=${row.id}
							@change=${this._addToSelection}
							?checked=${row.state ? row.state.selected : false}
						></d2l-input-checkbox>
					</td>` : ''}
				<td><d2l-link>${row.title}</d2l-link></td>
				<td>${row.startTime ? formatDateTime(new Date(row.startTime)) : ''}</td>
				<td>${this.localize(row.status)}</td>
				${this._canManage ? html`
					<td>
						<d2l-dropdown-more text="${this.localize('moreOptions')}">
							<d2l-dropdown-menu>
								<d2l-menu label="${this.localize('moreOptions')}">
									<d2l-menu-item
										text="${this.localize('edit')}"
										@click=${this._goTo('/manage-live-events/edit', { id: row.id })}>
									</d2l-menu-item>
									<d2l-menu-item
										text="${this.localize('delete')}"
										@click=${row.delete}>
									</d2l-menu-item>
								</d2l-menu>
							</d2l-dropdown-menu>
						</d2l-dropdown-more>
					</td>` : ''}
			</tr>
		`);
	}

	_renderTable() {
		if (this._liveEvents.length === 0) {
			return html `
				<div class="d2l-capture-central-live-events-no-events-container">
					${this.localize('noLiveEvents')}
				</div>
			`;
		}

		return html`
			<d2l-table-wrapper type="light" sticky-headers>
				<p class="d2l-capture-central-table-caption" id="d2l-capture-central-table-caption">
					${this.localize('liveEvents')}
				</p>
				<table class="d2l-table" aria-describedby="d2l-capture-central-table-caption">
					<thead>
						<tr>
							${this._canManage ? html`
								<th class="d2l-capture-central-th-checkbox-container">
									<d2l-input-checkbox
										id="toggle-select-all-checkbox"
										aria-label=${this.localize('selectAllLiveEvents')}
										@change=${this._addAllToSelection}>
									</d2l-input-checkbox>
								</th>` : ''}
							<th><div class="d2l-capture-central-th-container">
								${this.localize('name')}
							</div></th>
							<th><div class="d2l-capture-central-th-container">
								${this.localize('startTime')}
							</div></th>
							<th><div class="d2l-capture-central-th-container">
								${this.localize('status')}
							</div></th>
							${this._canManage ? html`
								<th class="d2l-capture-central-th-more-options-container"></th>` : ''}
						</tr>
					</thead>
					<tbody>
						${this._renderLiveEvents()}
					</tbody>
				</table>
			</d2l-table-wrapper>
		`;
	}

	render() {
		if (this._loading) {
			return html`<d2l-loading-spinner size=150></d2l-loading-spinner>`;
		}

		if (!this._canView || this._isErrorState) {
			return html`
				<d2l-alert
					type="critical">
					${this._alertMessage}
				</d2l-alert>
			`;
		}

		return html`
			<div class="d2l-capture-central-manage-container">
				<div class="d2l-capture-central-live-events-header">
					<d2l-input-search
						label="${this.localize('searchPlaceholder')}"
						placeholder="${this.localize('searchPlaceholder')}"
						@d2l-input-search-searched=${this._handleSearch}
						maxlength="100"
						value=${rootStore.routingStore.getQueryParams().searchQuery || ''}>
					></d2l-input-search>
					${this._canManage ? html`
						<d2l-button-icon
							text="${this.localize('delete')}"
							icon="tier2:delete"
							@click=${this._bulkDelete}>
						</d2l-button-icon>` : ''}
				</div>
				<div class="d2l-capture-central-manage-options">
					${this._canManage ? html`
						<d2l-button primary @click=${this._goTo('/manage-live-events/create')}>
							${this.localize('createLiveEvent')}
						</d2l-button>` : ''}
				</div>
				<d2l-alert
					id="live-events-inline-critical-alert"
					class="d2l-capture-central-live-events-inline-critical-alert"
					type="critical">
					${this._alertMessage}
				</d2l-alert>
				${this._renderTable()}
			</div>
		`;
	}
}

window.customElements.define('capture-central-live-events', CaptureCentralLiveEvents);
