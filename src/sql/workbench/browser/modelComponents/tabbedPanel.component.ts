/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, forwardRef, Inject, Input, OnDestroy, ViewChild } from '@angular/core';
import * as azdata from 'azdata';
import { NavigationBarLayout, PanelComponent } from 'sql/base/browser/ui/panel/panel.component';
import { TabType } from 'sql/base/browser/ui/panel/tab.component';
import { TabOrientation } from 'sql/workbench/api/common/sqlExtHostTypes';
import { ContainerBase } from 'sql/workbench/browser/modelComponents/componentBase';
import { ComponentEventType, IComponent, IComponentDescriptor, IModelStore } from 'sql/workbench/browser/modelComponents/interfaces';
import 'vs/css!./media/tabbedPanel';

export interface TabConfig {
	title: string;
	id?: string;
	group: string;
}

interface Tab {
	title: string;
	content?: IComponentDescriptor;
	id?: string;
	type: TabType;
}

@Component({
	templateUrl: decodeURI(require.toUrl('./tabbedPanel.component.html'))
})
export default class TabbedPanelComponent extends ContainerBase<TabConfig> implements IComponent, OnDestroy, AfterViewInit {
	@Input() descriptor: IComponentDescriptor;
	@Input() modelStore: IModelStore;
	@ViewChild(PanelComponent) private _panel: PanelComponent;

	private _tabs: Tab[] = [];
	private _itemIndexToProcess: number = 0;

	constructor(
		@Inject(forwardRef(() => ChangeDetectorRef)) changeRef: ChangeDetectorRef,
		@Inject(forwardRef(() => ElementRef)) el: ElementRef) {
		super(changeRef, el);
	}

	ngOnInit(): void {
		this.baseInit();
	}

	public setProperties(properties: { [key: string]: any }) {
		super.setProperties(properties);
		if ('orientation' in properties) {
			this._panel.options = {
				showTabsWhenOne: true,
				layout: this.orientation === TabOrientation.Horizontal ? NavigationBarLayout.horizontal : NavigationBarLayout.vertical,
				showIcon: false
			};
		}
	}

	ngAfterViewInit(): void {
	}

	ngOnDestroy(): void {
		this.baseDestroy();
	}

	setLayout(layout: any): void {
	}

	handleTabChange(event: any): void {
		this.fireEvent({
			eventType: ComponentEventType.onDidChange,
			args: event.identifier
		});
	}

	public get orientation(): TabOrientation {
		return this.getPropertyOrDefault<azdata.TabbedPanelComponentProperties, TabOrientation>((props) => props.orientation, TabOrientation.Vertical);
	}

	get tabs(): Tab[] {
		if (this.items.length > this._itemIndexToProcess) {
			let currentGroup: string | undefined = this.items.length === 1 ? undefined : this.items[this._itemIndexToProcess - 1].config.group;
			for (let i = this._itemIndexToProcess; i < this.items.length; i++) {
				const item = this.items[i];
				if (item.config.group !== currentGroup) {
					currentGroup = item.config.group;
					if (currentGroup) {
						this._tabs.push({
							title: currentGroup,
							type: 'group-header'
						});
					}
				}

				this._tabs.push({
					title: item.config.title,
					id: item.config.id,
					content: item.descriptor,
					type: 'tab'
				});
			}
			this._itemIndexToProcess = this.items.length;
		}
		return this._tabs;
	}
}
