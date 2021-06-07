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
import { PreferenceScope, PreferenceService } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { WebviewConfiguration, WebviewPreferences } from './webview-preferences';

/**
 * Checks for known security issues with webviews.
 * Can be controlled through preferences.
 *
 * You can unbind this component from your application to remove the checks.
 */
@injectable()
export class WebviewGuard {

    @inject(MessageService)
    protected messageService: MessageService;

    @inject(PreferenceService)
    protected preferenceService: PreferenceService;

    @inject(WebviewPreferences)
    protected webviewPreferences: WebviewPreferences;

    async onSetHostPattern(hostPattern: string): Promise<void> {
        await this.webviewPreferences.ready;
        if (this.webviewPreferences['webview.warnIfUnsecure']) {
            if (this.isHostPatternUnsecure(hostPattern)) {
                this.messageService.warn(
                    'Webviews are currently configured to serve on the same origin as the application, this is known to be unsecure. ' +
                    `Current pattern: \`${hostPattern}\``,
                    { timeout: 5000 },
                    /* actions: */ 'Ok', 'Don\'t show again',
                ).then(action => {
                    if (action === 'Don\'t show again') {
                        this.setWebviewPreference('webview.warnIfUnsecure', false);
                    }
                });
            }
        }
    }

    protected isHostPatternUnsecure(hostPattern: string): boolean {
        return hostPattern === '{{hostname}}';
    }

    protected setWebviewPreference<K extends keyof WebviewConfiguration>(
        preference: K,
        value: WebviewConfiguration[K],
        scope: PreferenceScope = PreferenceScope.User
    ): void {
        this.preferenceService.set(preference, value, scope);
    }
}
