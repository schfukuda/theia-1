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

import { PreferenceSchema, PreferenceProxy } from '@theia/core/lib/browser';
import { FrontendApplicationConfigProvider } from '@theia/core/lib/browser/frontend-application-config-provider';

const frontendConfig = FrontendApplicationConfigProvider.get();

export const MiniBrowserPreferencesSchema: PreferenceSchema = {
    properties: {}
};

if (frontendConfig.securityWarnings) {
    MiniBrowserPreferencesSchema.properties['mini-browser.previewFile.preventUnsecure'] = {
        scope: 'application',
        description: 'What to do when you open a resource with the mini-browser in an unsecure manner.',
        enum: [
            'ask',
            'alwaysOpen',
            'alwaysPrevent',
        ],
        default: 'ask'
    };
    MiniBrowserPreferencesSchema.properties['mini-browser.warnIfUnsecure'] = {
        scope: 'application',
        type: 'boolean',
        description: 'Warns users that the mini-browser is currently deployed unsecurely.',
        default: true,
    };
}

export interface IMiniBrowserPreferences {
    'mini-browser.previewFile.preventUnsecure'?: 'ask' | 'alwaysOpen' | 'alwaysPrevent'
    'mini-browser.warnIfUnsecure'?: boolean
}

export const MiniBrowserPreferences = Symbol('GitPreferences');
export type MiniBrowserPreferences = PreferenceProxy<IMiniBrowserPreferences>;
