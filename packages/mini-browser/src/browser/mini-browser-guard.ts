/********************************************************************************
 * Copyright (C) 2021 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { MessageService } from '@theia/core';
import { PreferenceService, PreferenceScope } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { MiniBrowserPreferences, IMiniBrowserPreferences } from './mini-browser-preferences';
import { MiniBrowserConfiguration } from './mini-browser-configuration';

/**
 * Checks for known security issues with the mini-browser.
 * Can be controlled through preferences.
 */
@injectable()
export class MiniBrowserGuard {

    @inject(MessageService)
    protected messageService: MessageService;

    @inject(PreferenceService)
    protected preferenceService: PreferenceService;

    @inject(MiniBrowserConfiguration)
    protected miniBrowserConfiguration: MiniBrowserConfiguration;

    @inject(MiniBrowserPreferences)
    protected miniBrowserPreferences: MiniBrowserPreferences;

    async onSetHostPattern(hostPattern: string): Promise<void> {
        await this.miniBrowserPreferences.ready;
        if (this.miniBrowserPreferences['mini-browser.warnIfUnsecure']) {
            if (this.isHostPatternUnsecure(hostPattern)) {
                this.messageService.warn(
                    '`mini-browser` is currently configured to serve `file:` resources on the same origin as the application, this is known to be unsecure. ' +
                    `Current pattern: \`${hostPattern}\``,
                    { timeout: 5000 },
                    /* actions: */ 'Ok', 'Don\'t show again',
                ).then(action => {
                    if (action === 'Don\'t show again') {
                        this.setMiniBrowserPreference('mini-browser.warnIfUnsecure', false);
                    }
                });
            }
        }
    }

    /**
     * Will throw if the location should not be opened, according to the current configurations.
     */
    async onFileLocationMap(location: string): Promise<void> {
        await this.miniBrowserPreferences.ready;
        if (this.isHostPatternUnsecure(this.miniBrowserConfiguration.hostPattern!)) {
            if (this.miniBrowserPreferences['mini-browser.previewFile.preventUnsecure'] === 'alwaysPrevent') {
                throw this.preventOpeningLocation(location);
            }
            if (this.miniBrowserPreferences['mini-browser.previewFile.preventUnsecure'] === 'ask') {
                await this.askOpenFileUnsecurely(location);
            }
        }
    }

    protected isHostPatternUnsecure(hostPattern: string): boolean {
        return hostPattern === '{{hostname}}';
    }

    protected async askOpenFileUnsecurely(location: string): Promise<void> {
        const action = await this.messageService.warn(
            'You are about to open a local file with the same origin as this application, this unsecure and the displayed document might access this application services. ' +
            `File: \`${location}\``,
            /* actions: */ 'Open', 'Always Open', 'Prevent', 'Always Prevent'
        );
        switch (action) {
            case 'Always Prevent':
                this.setMiniBrowserPreference('mini-browser.previewFile.preventUnsecure', 'alwaysPrevent');
            case 'Prevent':
            case undefined:
                throw this.preventOpeningLocation(location);
            case 'Always Open':
                this.setMiniBrowserPreference('mini-browser.previewFile.preventUnsecure', 'alwaysPrevent');
            case 'Open':
                return;
        }
    }

    protected preventOpeningLocation(location: string): Error {
        const message = `Prevented opening ${location}.`;
        this.messageService.warn(
            `${message} See the \`mini-browser.previewFile.preventUnsecure\` preference to control this behavior.`,
            { timeout: 10_000 },
            /* actions: */ 'Ok'
        );
        return new Error(message);
    }

    protected setMiniBrowserPreference<K extends keyof IMiniBrowserPreferences>(
        preference: K,
        value: IMiniBrowserPreferences[K],
        scope: PreferenceScope = PreferenceScope.User
    ): void {
        this.preferenceService.set(preference, value, scope);
    }
}
