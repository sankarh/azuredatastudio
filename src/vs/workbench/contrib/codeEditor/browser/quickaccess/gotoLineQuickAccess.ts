/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from 'vs/nls';
import { IKeyMods } from 'vs/platform/quickinput/common/quickInput';
import { IEditor } from 'vs/editor/common/editorCommon';
import { IEditorService, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { IRange } from 'vs/editor/common/core/range';
import { AbstractGotoLineQuickAccessProvider } from 'vs/editor/contrib/quickAccess/gotoLineQuickAccess';
import { Registry } from 'vs/platform/registry/common/platform';
import { IQuickAccessRegistry, Extensions } from 'vs/platform/quickinput/common/quickAccess';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchEditorConfiguration } from 'vs/workbench/common/editor';

export class GotoLineQuickAccessProvider extends AbstractGotoLineQuickAccessProvider {

	protected readonly onDidActiveTextEditorControlChange = this.editorService.onDidActiveEditorChange;

	constructor(
		@IEditorService private readonly editorService: IEditorService,
		@IConfigurationService private readonly configurationService: IConfigurationService
	) {
		super();
	}

	private get configuration() {
		const editorConfig = this.configurationService.getValue<IWorkbenchEditorConfiguration>().workbench.editor;

		return {
			openEditorPinned: !editorConfig.enablePreviewFromQuickOpen,
		};
	}

	protected get activeTextEditorControl() {
		return this.editorService.activeTextEditorControl;
	}

	protected gotoLocation(editor: IEditor, options: { range: IRange, keyMods: IKeyMods, forceSideBySide?: boolean, preserveFocus?: boolean }): void {

		// Check for sideBySide use
		if ((options.keyMods.ctrlCmd || options.forceSideBySide) && this.editorService.activeEditor) {
			this.editorService.openEditor(this.editorService.activeEditor, {
				selection: options.range,
				pinned: options.keyMods.alt || this.configuration.openEditorPinned,
				preserveFocus: options.preserveFocus
			}, SIDE_GROUP);
		}

		// Otherwise let parent handle it
		else {
			super.gotoLocation(editor, options);
		}
	}
}

Registry.as<IQuickAccessRegistry>(Extensions.Quickaccess).registerQuickAccessProvider({
	ctor: GotoLineQuickAccessProvider,
	prefix: AbstractGotoLineQuickAccessProvider.PREFIX,
	placeholder: localize('gotoLineQuickAccessPlaceholder', "Type the line number and optional column to go to (e.g. 42:5 for line 42 and column 5)."),
	helpEntries: [{ description: localize('gotoLineQuickAccess', "Go to Line/Column"), needsEditor: true }]
});
